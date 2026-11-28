import Link from 'next/link';
import { getBuildIdentity } from '@/lib/build-identity';

/** Edition-level scope, qualification, authorship, and licensing, shared across /changes and /print. */
export function PublicationNote({ lang = 'zh' }: { lang?: 'zh' | 'en' }) {
  const { textDate } = getBuildIdentity();
  if (lang === 'en') {
    return (
      <section className="publication-note" id="writing-note" aria-labelledby="writing-note-heading">
        <h2 id="writing-note-heading">Editorial Note</h2>
        <p>
          <em>The Past and Present of Life Cycle Assessment</em> online working preview,{' '}
          <time dateTime={textDate}>{textDate}</time>. This edition has not received formal scientific endorsement and has
          not yet undergone a real-reader trial; publication years and specific editions of cited works are recorded in
          chapter-end notes.
        </p>
        <p>
          Each chapter examines its question against specific inspected sections or passages of named openly accessible
          works. Citing a publication does not imply that the entire document was read or that all of its conclusions are
          adopted. Uninspected sections, paywalled standard originals (such as ISO, EN, and GB full texts), and unread
          originals are never used as support; exact scopes and caveats appear in chapter-end notes. The{' '}
          <Link href="/en/research/">research bibliography</Link> reading-register cutoff date is 2026-11-19; primary
          sources added in subsequent chapters are cited in full in the public bibliography and chapter notes.
        </p>
        <p>
          In the notes, <em>Source statement</em> reports a cited source, <em>Interpretation</em> clarifies meaning,{' '}
          <em>Calculation</em> shows explicit derivations, <em>Synthesis</em> links multiple premises, and{' '}
          <em>Analytical proposal</em> marks a practice suggested by the author. <em>Validity scope</em> bounds the
          main-text claim, <em>Context</em> provides background, and <em>Premises referenced</em> points to earlier notes
          relied upon in a derivation.
        </p>
        <p>
          Source verification was assisted by AI, and editorial review does not constitute independent peer review by
          external domain experts. Worked teaching cases clearly separate constructed inputs from externally sourced values
          and do not establish real-world product rankings, regulatory compliance, or third-party certification.
        </p>
        <p>
          <strong>Licensing:</strong> Site source code is released under the MIT License; original monograph text, figures,
          and knowledge-base content are licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0
          International (CC BY-NC-SA 4.0). Cited third-party publications, standards, and databases retain their respective
          rights.
        </p>
      </section>
    );
  }
  return (
    <section className="publication-note" id="writing-note">
      <h2>编写说明</h2>
      <p>
        《生命周期评价的前世今生》在线工作预览版，<time dateTime={textDate}>{textDate}</time>。本版尚未经过正式科学批准，亦未开展面向外部读者的真实试读检验；各项文献的年代与版本另见引注。
      </p>
      <p>
        本书依据具名公开文献的特定章节或段落讨论相应问题。引用一项作品，不表示整部作品均已核读，也不表示其全部结论都已被采纳。未纳入的章节、未核验的付费标准原文（ISO、EN、GB 等）及未读原件不能作为论断的支持；具体引用范围与适用条件见章末注释。<Link href="/zh/research/">原始书目</Link>中逐篇精读登记的汇总截止日期为 2026-11-19，后续增补的一手来源均已在公开引文目录与各章注释中如实列示。
      </p>
      <p>
        注释中的“文献陈述”转述来源，“解释”说明含义，“计算”展示推导，“综合论证”连接多项前提，“分析建议”表明作者提出的做法。“适用条件”限定正文判断，“相关讨论”提供背景；“本段依据的前提”指向推导所采用的其他论述。
      </p>
      <p>
        来源核查由 AI 辅助完成，审阅身份不包括独立领域专家的整体评审。教学案例明确区分虚构输入和外部来源的数值，不构成真实产品排序、通用标准要求或符合性认证。
      </p>
      <p>
        <strong>许可声明：</strong>本站点源代码按 MIT 许可证开放，原创正文、图表与知识库内容按知识共享署名—非商业性使用—相同方式共享 4.0 国际许可协议（CC BY-NC-SA 4.0）发布；所引第三方文献、标准与数据库保留其各自原有权利。
      </p>
    </section>
  );
}
