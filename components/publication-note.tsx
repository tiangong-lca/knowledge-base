import { getBuildIdentity } from '@/lib/build-identity';

/** Edition-level scope and authorship, shared with the self-contained print text. */
export function PublicationNote() {
  const { textDate } = getBuildIdentity();
  return <section className="publication-note" id="writing-note">
    <h2>编写说明</h2>
    <p>《生命周期评价的前世今生》在线文本，<time dateTime={textDate}>{textDate}</time>。各项文献的年代与版本另见引注。</p>
    <p>本书依据具名文献的特定章节或段落讨论相应问题。引用一项作品，不表示整部作品均已核读，也不表示其全部结论都已被采纳。未纳入的章节和未读原件不能作为论断的支持；具体引用范围与适用条件见章末注释。</p>
    <p>来源核查由 AI 辅助完成，审阅身份不包括独立领域专家的整体评审。教学案例明确区分虚构输入和外部来源的数值，不构成真实产品排序、通用标准要求或符合性认证。</p>
  </section>;
}
