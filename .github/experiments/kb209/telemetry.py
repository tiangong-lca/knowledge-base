"""Linux observation only. Original commands keep inherited stdout/stderr and exit status."""
import argparse
import datetime as dt
import json
import os
from pathlib import Path
import resource
import signal
import subprocess
import sys
import time
import uuid


def utc():
    return dt.datetime.now(dt.timezone.utc).isoformat()


def write_json(path, value):
    temporary = path.with_suffix(path.suffix + '.pending')
    temporary.write_text(json.dumps(value, indent=2) + '\n')
    temporary.replace(path)


def read_text(path):
    try:
        return Path(path).read_text().strip()
    except (OSError, UnicodeError):
        return None


def cpu_counts():
    row = Path('/proc/stat').read_text().splitlines()[0].split()
    values = [int(v) for v in row[1:9]]
    return {'total_ticks': sum(values), 'idle_and_iowait_ticks': values[3] + values[4]}


def memory_counts():
    data = {}
    for line in Path('/proc/meminfo').read_text().splitlines():
        key, value = line.split(':', 1)
        if key in ('MemTotal', 'MemAvailable'):
            data[key] = int(value.split()[0]) * 1024
    return {'total_bytes': data['MemTotal'], 'available_bytes': data['MemAvailable'],
            'used_bytes': data['MemTotal'] - data['MemAvailable']}


def cgroup_snapshot():
    # Read current existing scope only. A job can share this cgroup with agents or services.
    raw = read_text('/proc/self/cgroup') or ''
    relative = next((line[3:] for line in raw.splitlines() if line.startswith('0::')), None)
    if relative is None:
        return {'available': False, 'reason': 'No cgroup v2 membership'}
    base = Path('/sys/fs/cgroup') / relative.lstrip('/')
    counters = {}
    for name in ('cpu.stat', 'cpu.max', 'memory.current', 'memory.peak', 'memory.max', 'memory.events', 'cpuset.cpus.effective'):
        value = read_text(base / name)
        if value is not None:
            counters[name] = value
    return {'available': bool(counters), 'path': str(base), 'counters': counters,
            'scope': 'Existing shared cgroup, observed only, never reset or treated as isolated test memory'}


def host_identity():
    cpus = Path('/proc/cpuinfo').read_text().splitlines()
    model = next((line.split(':', 1)[1].strip() for line in cpus if line.startswith('model name')), None)
    return {'cpu_model': model, 'logical_cpus': os.cpu_count(),
            'affinity_cpus': sorted(os.sched_getaffinity(0)),
            'mem_total_bytes': memory_counts()['total_bytes'],
            'kernel': os.uname().release, 'machine': os.uname().machine,
            'image_os': os.environ.get('ImageOS'), 'image_version': os.environ.get('ImageVersion'),
            'runner_arch': os.environ.get('RUNNER_ARCH'), 'runner_os': os.environ.get('RUNNER_OS'),
            'run_id': os.environ.get('GITHUB_RUN_ID'), 'run_attempt': os.environ.get('GITHUB_RUN_ATTEMPT'),
            'job': os.environ.get('GITHUB_JOB'), 'cgroup': cgroup_snapshot()}


def proc_record(pid):
    try:
        text = Path('/proc', str(pid), 'stat').read_text()
        tail = text[text.rfind(')') + 2:].split()
        # tail[0] is original stat field 3, state. RSS uses pages.
        return {'pid': pid, 'state': tail[0], 'ppid': int(tail[1]), 'pgrp': int(tail[2]),
                'start_ticks': int(tail[19]), 'rss_bytes': int(tail[21]) * os.sysconf('SC_PAGE_SIZE')}
    except (OSError, ValueError, IndexError):
        return None


def process_sample(root_pid, root_start, known):
    records = {}
    for entry in Path('/proc').iterdir():
        if entry.name.isdigit():
            row = proc_record(int(entry.name))
            if row is not None:
                records[row['pid']] = row
    # Group catches normal descendants even after reparenting. Known ancestry catches setsid children.
    selected = {pid for pid, row in records.items()
                if row['pgrp'] == root_pid or (pid, row['start_ticks']) in known}
    root = records.get(root_pid)
    if root and root['start_ticks'] == root_start:
        selected.add(root_pid)
    changed = True
    while changed:
        newer = {pid for pid, row in records.items() if row['ppid'] in selected}
        changed = bool(newer - selected)
        selected.update(newer)
    known.update((pid, records[pid]['start_ticks']) for pid in selected)
    live = [records[pid] for pid in selected if records[pid]['state'] != 'Z']
    return {'sampled_process_count': len(live), 'aggregate_rss_bytes': sum(row['rss_bytes'] for row in live)}


def run_command(args):
    out = args.out.resolve()
    out.mkdir(parents=True, exist_ok=False)
    command = args.command
    if command and command[0] == '--':
        command = command[1:]
    if not command:
        raise ValueError('A command after -- is required')
    begin = time.monotonic()
    started = utc()
    before_cpu, before_memory = cpu_counts(), memory_counts()
    before_group = cgroup_snapshot()
    pid = os.fork()
    if pid == 0:
        try:
            os.setsid()
            os.execvp(command[0], command)
        except BaseException as error:
            print('telemetry command launch failed: ' + str(error), file=sys.stderr, flush=True)
            os._exit(127)
    root = proc_record(pid)
    root_start = root['start_ticks'] if root else None
    known = set()
    peak_rss = 0
    peak_count = 0
    sample_count = 0
    peak_vm_used = before_memory['used_bytes']
    interrupted = None
    def forward(signum, frame):
        nonlocal interrupted
        interrupted = signum
        try:
            os.killpg(pid, signum)
        except ProcessLookupError:
            pass
    handlers = {sig: signal.signal(sig, forward) for sig in (signal.SIGINT, signal.SIGTERM)}
    result = None
    with (out / 'process-samples.jsonl').open('x') as stream:
        try:
            while True:
                sample = process_sample(pid, root_start, known)
                sample_count += 1
                peak_rss = max(peak_rss, sample['aggregate_rss_bytes'])
                peak_count = max(peak_count, sample['sampled_process_count'])
                peak_vm_used = max(peak_vm_used, memory_counts()['used_bytes'])
                stream.write(json.dumps({'elapsed_seconds': time.monotonic() - begin, **sample}) + '\n')
                waited, status, usage = os.wait4(pid, os.WNOHANG)
                if waited:
                    result = status, usage
                    break
                time.sleep(args.interval)
        finally:
            for sig, handler in handlers.items():
                signal.signal(sig, handler)
    end = time.monotonic()
    status, usage = result
    exit_code = os.waitstatus_to_exitcode(status)
    cpu_seconds = usage.ru_utime + usage.ru_stime
    after_cpu = cpu_counts()
    ticks = after_cpu['total_ticks'] - before_cpu['total_ticks']
    busy_ticks = ticks - (after_cpu['idle_and_iowait_ticks'] - before_cpu['idle_and_iowait_ticks'])
    last = process_sample(pid, root_start, known)
    receipt = {'schema': 'kb-linux-command-observation.v1', 'started_at_utc': started, 'ended_at_utc': utc(),
               'command': command, 'working_directory': str(Path.cwd()), 'exit_code': exit_code,
               'wall_seconds': end - begin, 'cpu_user_seconds': usage.ru_utime,
               'cpu_system_seconds': usage.ru_stime, 'cpu_seconds': cpu_seconds,
               'average_cpu_cores': cpu_seconds / (end - begin),
               'affinity_cpu_utilization_percent': 100 * cpu_seconds / ((end - begin) * len(os.sched_getaffinity(0))),
               'cpu_scope': 'wait4 direct command and descendants whose resource use is propagated through normal child waits',
               'peak_sampled_process_tree_rss_bytes': peak_rss,
               'max_individual_process_rss_bytes': usage.ru_maxrss * 1024,
               'peak_sampled_process_count': peak_count, 'sample_count': sample_count,
               'sample_interval_seconds': args.interval, 'live_sampled_descendants_after_command': last['sampled_process_count'],
               'vm_cpu_busy_percent': 100 * busy_ticks / ticks if ticks > 0 else None,
               'vm_initial_used_bytes': before_memory['used_bytes'], 'vm_peak_sampled_used_bytes': peak_vm_used,
               'cgroup_before': before_group, 'cgroup_after': cgroup_snapshot(), 'interrupted_signal': interrupted,
               'limits': ['Aggregate RSS is sampled, sums shared pages, and can miss spikes shorter than the interval.',
                          'ru_maxrss is the largest individual process peak from wait4, not aggregate tree peak.',
                          'wait4 accounts normal reaped child CPU, not escaped unreaped services; residual process count is explicit.',
                          'VM CPU and MemAvailable counters include unrelated services; shared cgroup counters are supplemental.']}
    write_json(out / 'summary.json', receipt)
    return exit_code if exit_code >= 0 else 128 - exit_code


def sample_job(args):
    out = args.out.resolve()
    identity = json.loads((out / 'start.json').read_text())
    first_cpu, first_mem = cpu_counts(), memory_counts()
    start = time.monotonic()
    peak_used = first_mem['used_bytes']
    count = 0
    with (out / 'vm-samples.jsonl').open('x') as stream:
        while True:
            mem = memory_counts()
            cpu = cpu_counts()
            peak_used = max(peak_used, mem['used_bytes'])
            count += 1
            stream.write(json.dumps({'elapsed_seconds': time.monotonic() - start, 'cpu': cpu, 'memory': mem}) + '\n')
            stream.flush()
            if (out / 'stop').exists() or time.monotonic() - start >= args.max_seconds:
                break
            time.sleep(args.interval)
    ticks = cpu['total_ticks'] - first_cpu['total_ticks']
    idle = cpu['idle_and_iowait_ticks'] - first_cpu['idle_and_iowait_ticks']
    write_json(out / 'summary.json', {'schema': 'kb-linux-job-observation.v1', 'started_at_utc': identity['started_at_utc'],
               'ended_at_utc': utc(), 'wall_seconds': time.monotonic() - start,
               'scope': 'Dedicated hosted runner VM from explicit observer start through stop; Actions setup/post-job outside this boundary',
               'vm_cpu_busy_percent': 100 * (ticks - idle) / ticks if ticks > 0 else None,
               'vm_average_busy_cores': (ticks - idle) / os.sysconf('SC_CLK_TCK') / (time.monotonic() - start),
               'vm_initial_used_bytes': first_mem['used_bytes'], 'vm_peak_sampled_used_bytes': peak_used,
               'vm_peak_increase_from_start_bytes': peak_used - first_mem['used_bytes'],
               'sample_count': count, 'sample_interval_seconds': args.interval,
               'stopped_explicitly': (out / 'stop').exists(), 'host': identity['host'],
               'cgroup_after': cgroup_snapshot(),
               'limits': ['VM counters include runner agents and other services.',
                          'Memory peak is sampled MemTotal minus MemAvailable, not process-tree RSS.',
                          'Observer inherits RUNNER_TRACKING_ID for ordinary runner cleanup on job termination.']})
    return 0


def start_job(args):
    out = args.out.resolve()
    out.mkdir(parents=True, exist_ok=False)
    info = {'schema': 'kb-linux-job-start.v1', 'token': uuid.uuid4().hex, 'started_at_utc': utc(), 'host': host_identity()}
    write_json(out / 'start.json', info)
    with (out / 'observer.log').open('x') as log:
        child = subprocess.Popen([sys.executable, str(Path(__file__).resolve()), '_sample', '--out', str(out),
                                  '--interval', str(args.interval), '--max-seconds', str(args.max_seconds)],
                                 stdin=subprocess.DEVNULL, stdout=log, stderr=subprocess.STDOUT, start_new_session=True,
                                 close_fds=True)
    info['observer_pid'] = child.pid
    write_json(out / 'start.json', info)
    print(json.dumps({'started': True, 'observer_pid': child.pid, 'out': str(out)}))
    return 0


def stop_job(args):
    out = args.out.resolve()
    # Presence of start receipt binds stop to an existing observation. No signals or PID kills.
    json.loads((out / 'start.json').read_text())
    (out / 'stop').touch(exist_ok=False)
    for i in range(100):
        if (out / 'summary.json').is_file():
            data = json.loads((out / 'summary.json').read_text())
            if not data['stopped_explicitly']:
                raise RuntimeError('Observer expired before explicit stop')
            print(json.dumps({'stopped': True, 'out': str(out)}))
            return 0
        time.sleep(.1)
    raise RuntimeError('Observer did not produce completion receipt; inspect observer.log')


def main():
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest='mode', required=True)
    for mode in ('start', 'stop', 'run', '_sample', 'identity'):
        p = sub.add_parser(mode)
        if mode != 'identity':
            p.add_argument('--out', type=Path, required=True)
        if mode in ('start', '_sample', 'run'):
            p.add_argument('--interval', type=float, default=.1 if mode == 'run' else .5)
        if mode in ('start', '_sample'):
            p.add_argument('--max-seconds', type=float, default=7200)
        if mode == 'run':
            p.add_argument('command', nargs=argparse.REMAINDER)
    args = parser.parse_args()
    if sys.platform != 'linux':
        parser.error('Live telemetry requires Linux /proc; no cross-platform substitution')
    if hasattr(args, 'interval') and not .02 <= args.interval <= 5:
        parser.error('interval must be between .02 and 5 seconds')
    if args.mode == 'identity':
        print(json.dumps(host_identity(), indent=2))
        return 0
    return {'start': start_job, 'stop': stop_job, 'run': run_command, '_sample': sample_job}[args.mode](args)


if __name__ == '__main__':
    raise SystemExit(main())
