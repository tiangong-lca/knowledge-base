import { PublicationShell } from '@/components/publication-shell';
import { Claim } from '@/components/evidence';
import catalog from '@/lib/catalog';
export const metadata = { title: '注释与论证' };
export default function Page() {
  return <PublicationShell title="注释与论证" description="查阅论述的文献依据、推理联系和适用范围。">
    <p>各章注释按章内出现顺序编号；这里汇集全书论述，供交叉查阅。文献陈述、解释、综合论证、计算与分析建议具有不同的依据，不能互相替代。</p>
    {catalog.claims.filter(c => c.status === 'reviewed').map(c => <Claim id={c.id} anchor key={c.id} />)}
  </PublicationShell>;
}
