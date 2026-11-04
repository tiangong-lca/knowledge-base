import 'server-only';

import rawSpecification from '../knowledge/cases/wall-coating-v1.json';
import { publicTeachingCase } from '../scripts/case-publication.mjs';
import { assertTeachingCaseIdentity, type TeachingCaseSpec } from '../lib/teaching-case';
import { TeachingCaseClient } from './teaching-case-client';
import { JointProductionCase } from './joint-production-case';

/** Raw records and Node publication helpers stay outside the client module graph. */
export function TeachingCase({ id, version }: { id: 'CASE-WALL-CONNECT' | 'CASE-JOINT-BATCH'; version: '1.0.0' }) {
  if (id === 'CASE-JOINT-BATCH') {
    if (version !== '1.0.0') throw new TypeError(`Unsupported teaching case ${id}@${version}`);
    return <JointProductionCase />;
  }
  const spec = publicTeachingCase(rawSpecification) as unknown as TeachingCaseSpec;
  assertTeachingCaseIdentity(spec, id, version);
  return <TeachingCaseClient spec={spec} />;
}
