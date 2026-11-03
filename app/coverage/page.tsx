import { PublicationShell } from '@/components/publication-shell';
import catalog from '@/lib/catalog';
export const metadata={title:'覆盖范围'};
const statuses:Record<string,string>={sampled:'样板核读',planned:'计划研究',partial:'部分覆盖',reviewed:'已完成限定范围复核',identified:'已识别','in-progress':'研究中','needs-review':'待复核'};
export default function Page(){return <PublicationShell title="覆盖范围" description="全面性通过可检查的范围逐步建立。首版先验证核心概念的解释和证据链，以下记录明确保留缺口。"><div className="coverage-table"><table><thead><tr><th>领域</th><th>当前状态</th><th>范围与剩余工作</th></tr></thead><tbody>{catalog.coverage.map(c=><tr key={c.id} id={c.id}><th scope="row">{c.title}</th><td><span className="status-label">{statuses[c.status]??c.status}</span></td><td>{c.notes}</td></tr>)}</tbody></table></div><section className="editorial-note"><h2>如何理解这里的状态</h2><p>“已复核”只针对条目声明的来源和问题。它不意味着全球文献已经穷尽，也不等于独立专家认证。历史沿革、各国标准和数据库版本将按专题检索协议逐步补充。</p><a href="/docs/">阅读当前专题</a></section></PublicationShell>}
