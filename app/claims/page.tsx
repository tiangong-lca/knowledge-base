import { PublicationShell } from '@/components/publication-shell';
import { Claim } from '@/components/evidence';
import catalog from '@/lib/catalog';
export const metadata={title:'观点与论证'};
export default function Page(){return <PublicationShell title="观点与论证" description="把来源陈述、解释、综合判断、计算和建议分开阅读。展开每个观点，核查它在什么条件下成立。">{catalog.claims.filter(c=>c.status==='reviewed').map(c=><Claim id={c.id} anchor key={c.id}/>)}</PublicationShell>}
