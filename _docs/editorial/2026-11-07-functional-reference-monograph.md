---
title: 功能参照章的成文与引用连续性协议
docType: plan
scope: repo
status: active
authoritative: false
owner: knowledge-base
language: zh-CN
whenToUse:
  - when authoring or reviewing the B06 functional-reference chapter
whenToUpdate:
  - when source findings, content preservation, representation or delivery evidence changes
checkPaths:
  - knowledge/catalog.json
  - knowledge/research/readings.json
  - content/docs/book/service-and-reference.mdx
  - content/docs/functional-unit.mdx
  - config/book-edition.json
  - scripts/reader-citations.mjs
lastReviewedAt: 2026-11-07
lastReviewedCommit: 87f6a52203a45269507fccfb8eddb39cf2668e92
related:
  - 2026-11-06-monograph-structure.md
  - monograph-structure.v1.json
  - ../reader-publication-contract.md
  - ../editorial-protocol.md
---

# B06 功能参照

[Issue70](https://github.com/tiangong-lca/knowledge-base/issues/70) 已创建并启动。本协议在原文新复核、正文与运行时编辑之前提交。全书 Goal 持续 active；B05来源68/PR69与root2282/PR2284已有正常终态回执、两项来源集成状态及完整交接。精确来源Main87f6a522与root Main261421131均已交付。全书32章、八个研究领域、十二组附录责任和正式版次资格继续开放。

## 问题与冻结基线

本章承接用途与效果的区别，追问研究究竟需要比较怎样的服务，以及怎样把该要求连接到方案、过程数量与数据记录。由此再进入过程网络的需求。采用第2部“可比世界”的三节：服务要求、参考对象、比较条件。以具体例子和可说明的转换推进，而非把来源摘要串接或仅改标题。

当前已重新核对远端Main `87f6a52203a45269507fccfb8eddb39cf2668e92`，复用干净来源工作树，分支`codex/book-functional-reference`，PR回Main。冻结828条原规范主张、106个相关受跟踪文件的摘要，其中36个案例文件，以及现存发行与接受清单。私有基线SHA256 `e9bd4b7586fed23333efff86631e0e03bc67d606408f5086f16c695ad0c74b0f`。旧正文、目录、阅读与文献记录分别保留；数量只表示库存，不是完成比例。

采用映射要求把C08与S03真正组成一章，原15个不同主张及S03八块普通解释文字均有去向：

| 正式节 | 保留规范身份 | 额外保留的普通解释 |
|---|---|---|
| 服务要求 | cl-book-service、cl-book-geometry、cl-book-service-contract、cl-book-soap、cl-book-function-boundary、cl-fu-distinction、cl-fu-example | 服务入口、同一性能/期间的假设、覆盖能力和维护条件。 |
| 参考对象 | cl-book-cml-reference、cl-book-ilcd-reference、cl-book-reference-reading、cl-ilcd-quant-ref、cl-ilcd-reference-flow、cl-ilcd-fu | 具体输入/输出交换与功能表述、技术名称和数量单位的区别。 |
| 比较条件 | cl-book-comparison-more、cl-book-three-comparisons | 额外维护与性能改变的反例、具名墙面案例入口、格式记录与方法要求的区别、有条件概念关联。 |

15是原命题守恒清单，不是写作配额。实质新增判断另行登记身份、证据/前提、种类与审查。EPA绝热/肥皂教学例、10m²涂料假设算例及100m²/十年墙面案例互不替换；不把共同单位、同名字段或算术正确升级为实际产品等效。

## 原件复核计划与权限

保留四个已有载体及其原取得/阅读事件，后续只按实际新检查范围增加记录，不把元数据或哈希核对写成已经读过选段。

- CML2001 Part2a：§2.3.4/p22及比较要求p24与必要上下文。原PDF SHA256 `caf3c98f7e94e4608284b859041240b665f443f0f72f2795a6c058caf588788f`。区分2001机构指南与2002出版书，按载体限制使用合法只读查看，不绕过复制/打印权限。
- ILCD2010 Detailed guidance：§6.4/p60–64及§6.10/p140–145。SHA256 `7de4b9126536894b0b2594ab268b23b4de7de228146390ed6ade9954625e0c0f`。现有选段不自动包含p145；须真实检查续文与表格/注脚后才更新范围。
- EPA2006 Principles and Practice：p11绝热例、pp15–16肥皂与功能/边界上下文。SHA256 `873c07009244e8bfa778dc408cce1d8de50937213dda45da1f9d9fb5d68f3d3e`。教学例不是实测产品效果。
- ILCD Format1.1 process documentation：quantitativeReference及具体子字段。已有HTML SHA256 `dc854d520b6d62101ca1f3befaa1be64661719352286f74cf6a4653f589eaf84`。实际检查`ev-ilcd-qr`尚未精确绑定的reading/passage，以及source范围与evidence定位字符串差别；不凭名称相似断言原记录错误或自动补造阅读。

复核围绕实际主张、单位、对象和条件。CML的方案参考对象、过程数据与ILCD依情境而异的表达须分别定位；格式的记录能力不证明求解器行为、服务实现或普遍方法定义。完整ISO/SETAC原书、完整版本对照和现实产品等效的缺口保留。原件、图像和大段原文留在Git与公共输出之外；可访问不等于开放许可。

## 影响与案例守恒

只读准备报告当前反向闭包212条（15种子与197章外），premise-only闭包62条（15与47）。将在正文前重新计算并逐项按真实路径检查公开语境；概念/映射扩展不等于所有章外结论都源自本章，也不授权机械重写。六个直接章外前提消费者、已交付开篇与结论、墙面/混合/气候案例接口优先检查；检查文字语境不冒充重读其全部原件。

采用映射已经指出`cl-wall-reference`中“前一章”在重排后失效。本轮在规范文字与案例publication模板中共同改成具名功能参照/CML/ILCD指向，保持输入字节、版本、数值、单位和案例身份；其余案例文件不改。服务反例若需要更强的经验判断，应另行取得证据，不能从教学假设推导。

## 真实章节与历史地址

当前45单元混合书目不是32章终稿。本轮须显式消费C08+S03一次，形成一章三节和一次连续注释；预计混合单元数变为44，但实际源发现、接受身份和顺序必须独立验证。网站保留有用的细入口，共享规范科学文本。是否采用一份真实共同MDX或独立书稿装配，由实际论证和网站职责决定，不能复制科学正文或把未改两页依次打印冒充成书。C07未来归B21；当前混合顺序调整需明确限定，不能暗示整部已完成。

独立只读工程调查将先捕获当前实际托管87f的C08/S03及print HTML，在前后核对同一manifest与文件字节。捕获完成前不改标题/单元/注释范围。两路已有52数字代际地址与36规范代际地址包含在原2254+1788冻结清单内，不重复计为新地址。另核实际八个打印标题名是否未受覆盖；既有19framework与3cleaner标题保持。多目的地标题用无需脚本的诚实分流；每个旧注仍定位原主张，显示序号可依新章连续编排。

接受检查须同时覆盖原15身份、普通解释的实质、节归属与实际解码正文，拒绝仅留标记、遗漏、重复、错节及源与注册共同删除。不可通过重写旧历史或仅比较同一可删清单使测试通过。正文守恒、读者理解与历史地址各需真实验证。

## 分别审查与交付

来源/推论检查、全章连续阅读、工程引用审查及真实呈现分别完成。独立读者收到实际稿件及必要注释，不预置结论；本地协作者须核实工作目录和用户指定配置。代理判断不当作人类领域认证。

使用当前Node24.18.0、pnpm12.16.1与锁文件，不升级依赖。完成有意义的遗漏/正文/引用变例、现有测试、types、干净build/export、严格Docpact及真实无脚本/搜索/前提导航、五宽度双主题与打印检查。若另行生成分页样本，只资格化实际样本；全书PDF目的地互操作门槛保留。

经过reviewed Main PR、实际托管精确身份与产物核验、独立精确root集成及正常source/root终态交接后，才完成此单元。此前单元B05的终态事实另在执行记录中更新；本协议首次提交时本章尚未重新阅读原选段、改写正文或完成表示实现。

不新增付费/外联、业务操作或产品规范采纳。当前没有本单元服务器、浏览器、容器、卷或网络；后续临时资源明确归属并保留关闭证据。复用的工作树、依赖与合法私有原件/审查回执持续保留，其他物理仓库和预览不受操作。
