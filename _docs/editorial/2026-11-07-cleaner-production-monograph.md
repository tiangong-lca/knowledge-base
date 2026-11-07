---
title: 清洁生产章的成文与引用连续性协议
docType: plan
scope: repo
status: active
authoritative: false
owner: knowledge-base
language: zh-CN
whenToUse:
  - when authoring or reviewing the B05 cleaner-production chapter
whenToUpdate:
  - when source findings, prose scope, citation migration or delivery evidence changes
checkPaths:
  - knowledge/catalog.json
  - knowledge/research/readings.json
  - content/docs/book/cleaner-production-purpose-and-prospects.mdx
  - config/book-edition.json
  - scripts/reader-citations.mjs
lastReviewedAt: 2026-11-07
lastReviewedCommit: c159b16fddbb95adf1a52cb6be3eac5f4f1b54b3
related:
  - 2026-11-06-monograph-structure.md
  - monograph-structure.v1.json
  - ../reader-publication-contract.md
  - ../editorial-protocol.md
---

# B05 清洁生产的期待

[Issue68](https://github.com/tiangong-lca/knowledge-base/issues/68) 已创建并启动。本协议在正文及运行时改动之前提交。采用编排的 B05 与书目编号 B05 不是同一身份；本单元使用 C06 的孙启宏2002年文章，不把另一书目作品替入。

全书目标保持 active。此前 B04/X02 的来源66/PR67、精确 root2277/PR2278 和必要的控制器修复2279/PR2280 均已交付；当前原 workspace Main c00dadc5 保留 Knowledge Base c159b16 精确 gitlink。全书八个研究领域、十二组附录责任、完整32章成文及正式版次资格不由本章关闭。

## 冻结基线与问题

基线为合格 Main `c159b16fddbb95adf1a52cb6be3eac5f4f1b54b3`，远端 Main 已重新核对。复用干净的既有来源工作树，分支 `codex/book-cleaner-production-expectations`，PR 回 Main。基线827条规范主张、45个混合阅读单元是实际库存，不是完成比例。

本章的问题是：清洁生产的预防目的为何需要超出工厂当下排放的观察范围，LCA能够向这些用途提供什么信息，为什么同期尝试和用途展望仍须与采纳规模及实际改善效果区分。结尾把这种期待接到研究条件，而非用一个“成熟期”名称代替条件判断。承接 B04 对分析、判断和实施职责的区别，并为后续功能参照与数据问题保留入口。

采用三节与原五命题的对应保持如下。不能靠题目变化或堆叠摘要完成本章；正文要形成目的、用途、证据状态和条件之间的连续推理。

| 正式节 | 保留主张 | 必须保留的对象与限定 |
|---|---|---|
| 预防目的 | cl-regional-sun-prevention-purpose | 孙文对 cleaner production 的预防战略说明，以及 LCA 的全产品链支持用途；战略与工具分别成立。 |
| 预防目的 | cl-regional-sun-complexity-and-use | 技术复杂程度分类、概念型的传播用途限制；类别名称不证明可靠性，不成为普遍认证等级或授权 ISO 原文。 |
| 应用设想 | cl-regional-sun-plans-versus-events | 同期作者所列标准、资助、合作和尝试；已发布、预计、验证和全国采纳不是同一状态。 |
| 应用设想 | cl-regional-sun-prospects-not-results | 审计的上下游、产品全程、回收及园区单元内外联系是用途；本文没有净收益或实施前后对照，不能反推具体项目无效。 |
| 发展条件 | cl-regional-sun-maturity-scopes | 国际回顾分期与国内基础研究、数据、经费条件的对象不同；短论述不等于完整国别史或所有研究的质量评价。 |

保留主张身份的前提是实质命题和限定仍在。真正新增的事实或综合须另行登记证据/前提、映射和审查，不能藏在普通 MDX 或为篇幅添加无依据内容。本章没有数值案例绑定，不新增计算输入或伪造下载。

私有基线保存五条原记录、五项证据、一项来源，以及172个实际受关注文件的摘要；其中36个案例文件和既有发行快照都不属于预定修改范围。基线记录 SHA256 为 `c33954d20836d3edb94180aceff27df9c6748febf17626378e8217e6e602f465`。正文之外的科学身份、案例输入和发行物必须逐项比较。

## 原件和新复核

作品为孙启宏《生命周期评价在清洁生产领域的应用前景》，《环境科学研究》15(4)，2002，印刷4–6页；收稿2001-11-12与 PDF 载体2007-06-19生成时间分开。继续使用已有 work `lit-com-11`、source `src-book-sun-2002-cleaner-production`、reading `rd-sun-2002-cleaner-production` 和 artifact `art-sun-2002-original-pdf`。

本轮已重新计算保留原 PDF 的 SHA256：`e29376b6695749c47ca70cc98964699d268dfbfe4ea60a769c4ffeaa37b37562`；95,718字节、3页、未加密。2026-11-07实际逐页查看了全部三页原件派生图像，包括题名、双语摘要、§1–5、跨页续文、日期及参考文献。数字/拉丁文字层编码异常，身份和关键措辞以页面图像核对。没有新下载或取得新作品。

重点是 p5 §§2.1–2.3、pp5–6 §3.2、p6 §§4.1–4.5与§5，并以 p4 §1核对“成熟期”的对象。原文将概念型描述为不能用于市场促销或公众传播，改写不能误作认证法则。§3.2的两项已发布与两项预计发布保持作者当时的措辞；本文列举的项目不因被提及而完成独立核验。§4.5明确区分园区单元内生产及单元外原料、产品/副产品/废物联系；回收与生态设计各自的用途须准确归属。

这次阅读可以说明该短文实际写了什么，不能替代其所引研究、标准条款、项目原始数据或效果评价。没有新确认开放再利用许可；原 PDF、图像和大段原文继续留在仓库外。公开正文只用原创释义、书目信息和定位。保留2026-11-04的原取得/阅读事件，在本轮修订记录中另记实际重读，不倒改旧日期或升级成所有引用作品已读。

## 依赖和科学守恒

使用当前 `buildDependencies`/`affectedClaims` 重新计算，五条种子主张的反向影响闭包为26条，包含本章五条、地区/中国14条和 CML 七条。私有图及实际最短路径记录 SHA256 为 `061a3d2c9ca2fa33642116694afc55e8f55b7b727e86c60d6fa8e3dae9386551`。它是记录依赖，不能解释为所有事实都来自孙文。

直接章外消费者 `cl-cn-standard-events` 仍由官方历史标准登记支撑。其后的国家标准与研究模型采用、地方参照/权重、香港选择性借用及 CML 外部采用链分别保留原证据；包括新近的 `cl-cml-screening-range-limit`。逐条检查26项的上下文和前提关系，不机械扩张为全部重写或声称重读了所有章外原件。语义变化若扩大，按实际依赖继续复核。CML、中国、墙面及其他案例输入、版本、单位、结果和缺口不因本次成文而变化。

## 最小表示和引用迁移

独立只读工程调查确认：既有 MDX 的2/2/1次序与采用三节一一对应，可以作为网站与书籍的同一份真实章源。保留 `/docs/book/cleaner-production-purpose-and-prospects` 的 route、book key/source/kind与45单元顺序，不另造空装配文件。`book-edition.json`登记“问题的来路”部名及三节；既有渲染器已经能生成两种表面的独立索引和一章五注。不得复制规范科学文本。

为本单元另设有独立固定摘要的接受清单和小型检查，绑定原五身份、实际顺序/节归属、标题/部/节与来源基线。与现有 B04/X02 接受清单分开，后者及混合 roster 摘要不重生成。原始出现次数、实际正文与注释都要检查；删掉注册与源、重复主张但保持去重后五注、把段落移错节，均不能通过。

已从实际托管 c159 输出取得 C06 和 print HTML，并在前后复读同一 manifest。manifest SHA256 `e6a7e08e31b4607cce61ec0f3561e195aa679e9bd91d9ff7303cb7dac8ea1c79`；C06 HTML SHA256 `304e55094862721b6340cc2ce49408f5fa647e5bc833b05ff90ff7011cb7751d`；print HTML SHA256 `88d8130bb88ad4292ac87418f01dddea102c5f755f105069797a3a6095c3b2e0`。二者都与干净 c159 manifest相符。实际捕获记录 SHA256 `cc07da5de466799a43beb36458f509986a9316f668ecb4efa9a0b23104ae7e35`，并非假设性 HTML 重建。

实际三个打印规范标题后缀为“预防目的与研究的使用场景”“举例计划与尚未证明的效果”“历史分期不能成为国家整体评价”。连同当时的单元、注释组及两种表面各五注身份保存。旧数字代际的 C06有19个地址，旧 canonical代际有13个；其历史 ordinal6与当前可见第5章不能互换。保留2,254/1,788两份不可变记录和既有19个 framework标题。当前捕获中的单元/组/注已在 canonical历史中，不重复添加；仅另登记三个尚未覆盖的打印标题，预期独立历史总数为4,064。

利用已有原生别名机制，将旧网页、数字打印和新捕获打印标题分别落到对应的三个实际新标题，保持各自的日期与不可变来源。旧注继续指向同一主张。检查语义对应而不只检查目标存在；无 JavaScript、目录、搜索、交叉前提与打印都要实际验证。不得重写旧历史使测试通过。

## 分别验收与交付

正文改写后分别进行来源/推论复核、对实际连续稿件的新上下文读者判断、工程检查和真实呈现核验。读者检查不先灌输预期赞同；代理审查不等于人类专家审定。只在来源支持时处理发现，保留有证据的反对和未知。

代码检查使用现有 Node24.18.0、pnpm12.16.1和锁文件，不升级依赖。当前 shell默认 Node24.19.0，执行验证时显式选用仓库所定24.18.0。有效的回归覆盖遗漏/重复/错节、源与注册共同删除、标题/部/节变化、捕获历史篡改、错落点和正文缺失；继续原有全套测试、types、clean build、公开投影与严格 Docpact。浏览器检验连续五注、来源/前提导航、旧地址无脚本到达、搜索、五宽度双主题和实际打印。若生成私有分页样本，仅报告其实际排版范围，不关闭全书正式 PDF 互操作门槛。

然后通过 reviewed Main PR、实际托管身份/文件核对、独立精确 root集成及正常 source/root控制器交接交付。当前阶段只完成任务启动、冻结、实际原件复查和表示调查；正文、代码、独立稿件审阅及新交付尚未完成。

没有创建容器、卷、网络或新服务；没有运行预览。保留既有来源/根工作树、依赖和合法私有证据。后续任务拥有的预览/浏览器有明确端口与关闭记录；不操作未归属的其他预览或物理子仓库。
