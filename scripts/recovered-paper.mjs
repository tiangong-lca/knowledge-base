import { isDeepStrictEqual } from 'node:util';
import { rational, decimal, add, subtract, multiply, divide, fixed, result } from './exact-rational.mjs';

// Independent approved values. This authority does not read the downloadable input.
const reviewed = {
  "caseId": "CASE-CYCLE",
  "version": "1.0.0",
  "model": "danish-2001-recovered-corrugated-board-source-arithmetic-v1",
  "createdAt": "2026-11-05",
  "status": "selected-original-report-arithmetic",
  "sources": {
    "dk1057": {
      "sourceId": "src-kb42-dk1057",
      "readingId": "rd-kb42-dk1057",
      "workId": "work-kb42-dk1057",
      "version": "Miljøprojekt nr. 1057 (2005)，丹麦环境署官方原报告PDF (192页)",
      "artifactId": "art-kb42-dk1057-pdf",
      "sha256": "8ea397e62dea03de82b788d51ee285dd5e7b9a67668e68b2e8a566012b3a766d",
      "resolvedUrl": "https://www2.mst.dk/udgiv/publikationer/2005/87-7614-894-7/pdf/87-7614-895-5.pdf",
      "pageCount": 192
    },
    "dk830": {
      "sourceId": "src-kb42-dk830",
      "readingId": "rd-kb42-dk830",
      "workId": "work-kb42-dk830",
      "version": "Miljøprojekt nr. 830 (2003)，丹麦环境署官方原报告PDF (64页)",
      "artifactId": "art-kb42-dk830-pdf",
      "sha256": "153df94b7d343b5e7ec0cc72668ebd113202f3c646edee98adc26e31c75da5d8",
      "resolvedUrl": "https://www2.mst.dk/udgiv/publikationer/2003/87-7972-820-0/pdf/87-7972-821-9.pdf",
      "pageCount": 64
    }
  },
  "facts": {
    "statsEmptySupply": {
      "source": "dk830",
      "evidenceId": "ev-kb42-dk830-occ",
      "factId": "nf-empty",
      "passageId": "psg-kb42-dk830-occ",
      "pdfIndex": 45,
      "value": "337501",
      "unit": "t/year",
      "quantity": "空瓦楞包装供应",
      "subject": "丹麦2001",
      "basis": "附录B图0.1印刷第46页及表0.1第47页；丹麦2001年瓦楞包装供应/回收统计，吨；图中收集率分子与收集流量框不一致，未擅自更正。"
    },
    "statsFilledImports": {
      "source": "dk830",
      "evidenceId": "ev-kb42-dk830-occ",
      "factId": "nf-filled-import",
      "passageId": "psg-kb42-dk830-occ",
      "pdfIndex": 45,
      "value": "159871",
      "unit": "t/year",
      "quantity": "有内容物瓦楞包装进口",
      "subject": "丹麦2001",
      "basis": "附录B图0.1印刷第46页及表0.1第47页；丹麦2001年瓦楞包装供应/回收统计，吨；图中收集率分子与收集流量框不一致，未擅自更正。"
    },
    "statsFilledExports": {
      "source": "dk830",
      "evidenceId": "ev-kb42-dk830-occ",
      "factId": "nf-filled-export",
      "passageId": "psg-kb42-dk830-occ",
      "pdfIndex": 45,
      "value": "151001",
      "unit": "t/year",
      "quantity": "有内容物瓦楞包装出口",
      "subject": "丹麦2001",
      "basis": "附录B图0.1印刷第46页及表0.1第47页；丹麦2001年瓦楞包装供应/回收统计，吨；图中收集率分子与收集流量框不一致，未擅自更正。"
    },
    "statsSupply": {
      "source": "dk830",
      "evidenceId": "ev-kb42-dk830-occ",
      "factId": "nf-supplied",
      "passageId": "psg-kb42-dk830-occ",
      "pdfIndex": 45,
      "value": "346371",
      "unit": "t/year",
      "quantity": "瓦楞纸供应",
      "subject": "丹麦2001",
      "basis": "附录B图0.1印刷第46页及表0.1第47页；丹麦2001年瓦楞包装供应/回收统计，吨；图中收集率分子与收集流量框不一致，未擅自更正。"
    },
    "statsMillUse": {
      "source": "dk830",
      "evidenceId": "ev-kb42-dk830-occ",
      "factId": "nf-use",
      "passageId": "psg-kb42-dk830-occ",
      "pdfIndex": 45,
      "value": "176986",
      "unit": "t/year",
      "quantity": "瓦楞回收纸国内工厂用量",
      "subject": "丹麦2001",
      "basis": "附录B图0.1印刷第46页及表0.1第47页；丹麦2001年瓦楞包装供应/回收统计，吨；图中收集率分子与收集流量框不一致，未擅自更正。"
    },
    "statsRecoveredImports": {
      "source": "dk830",
      "evidenceId": "ev-kb42-dk830-occ",
      "factId": "nf-imports",
      "passageId": "psg-kb42-dk830-occ",
      "pdfIndex": 45,
      "value": "16415",
      "unit": "t/year",
      "quantity": "瓦楞回收纸进口",
      "subject": "丹麦2001",
      "basis": "附录B图0.1印刷第46页及表0.1第47页；丹麦2001年瓦楞包装供应/回收统计，吨；图中收集率分子与收集流量框不一致，未擅自更正。"
    },
    "statsRecoveredExports": {
      "source": "dk830",
      "evidenceId": "ev-kb42-dk830-occ",
      "factId": "nf-exports",
      "passageId": "psg-kb42-dk830-occ",
      "pdfIndex": 45,
      "value": "114069",
      "unit": "t/year",
      "quantity": "瓦楞回收纸出口",
      "subject": "丹麦2001",
      "basis": "附录B图0.1印刷第46页及表0.1第47页；丹麦2001年瓦楞包装供应/回收统计，吨；图中收集率分子与收集流量框不一致，未擅自更正。"
    },
    "statsStockChange": {
      "source": "dk830",
      "evidenceId": "ev-kb42-dk830-occ",
      "factId": "nf-stock",
      "passageId": "psg-kb42-dk830-occ",
      "pdfIndex": 45,
      "value": "140",
      "unit": "t/year",
      "quantity": "瓦楞回收纸存货变化",
      "subject": "丹麦2001",
      "basis": "附录B图0.1印刷第46页及表0.1第47页；丹麦2001年瓦楞包装供应/回收统计，吨；图中收集率分子与收集流量框不一致，未擅自更正。"
    },
    "statsCollected": {
      "source": "dk830",
      "evidenceId": "ev-kb42-dk830-occ",
      "factId": "nf-total",
      "passageId": "psg-kb42-dk830-occ",
      "pdfIndex": 45,
      "value": "274780",
      "unit": "t/year",
      "quantity": "收集量流量框数值",
      "subject": "丹麦2001",
      "basis": "附录B图0.1印刷第46页及表0.1第47页；丹麦2001年瓦楞包装供应/回收统计，吨；图中收集率分子与收集流量框不一致，未擅自更正。"
    },
    "statsRateNumerator": {
      "source": "dk830",
      "evidenceId": "ev-kb42-dk830-occ",
      "factId": "nf-rate-numerator",
      "passageId": "psg-kb42-dk830-occ",
      "pdfIndex": 45,
      "value": "274704",
      "unit": "t/year",
      "quantity": "收集率图框印刷分子",
      "subject": "丹麦2001",
      "basis": "附录B图0.1印刷第46页及表0.1第47页；丹麦2001年瓦楞包装供应/回收统计，吨；图中收集率分子与收集流量框不一致，未擅自更正。"
    },
    "annualUse": {
      "source": "dk1057",
      "evidenceId": "ev-kb42-dk1057-occ-baseline",
      "factId": "nf-demand",
      "passageId": "psg-kb42-dk1057-occ-baseline",
      "pdfIndex": 63,
      "value": "346",
      "unit": "1000 t/year",
      "quantity": "年度使用及收集潜量",
      "subject": "2001丹麦瓦楞纸",
      "basis": "表4.5印刷第64页、情景1（2001年基线），单位千吨；研究模型的年度商业纸料质量，未提供统一绝干纤维基准。"
    },
    "annualCollected": {
      "source": "dk1057",
      "evidenceId": "ev-kb42-dk1057-occ-baseline",
      "factId": "nf-collected",
      "passageId": "psg-kb42-dk1057-occ-baseline",
      "pdfIndex": 63,
      "value": "275",
      "unit": "1000 t/year",
      "quantity": "收集量",
      "subject": "2001丹麦瓦楞纸",
      "basis": "表4.5印刷第64页、情景1（2001年基线），单位千吨；研究模型的年度商业纸料质量，未提供统一绝干纤维基准。"
    },
    "annualConvertingWaste": {
      "source": "dk1057",
      "evidenceId": "ev-kb42-dk1057-occ-baseline",
      "factId": "nf-converted",
      "passageId": "psg-kb42-dk1057-occ-baseline",
      "pdfIndex": 63,
      "value": "66",
      "unit": "1000 t/year",
      "quantity": "其中生产转换下脚料",
      "subject": "2001丹麦瓦楞纸收集",
      "basis": "表4.5印刷第64页、情景1（2001年基线），单位千吨；研究模型的年度商业纸料质量，未提供统一绝干纤维基准。"
    },
    "annualIncinerated": {
      "source": "dk1057",
      "evidenceId": "ev-kb42-dk1057-occ-baseline",
      "factId": "nf-burned",
      "passageId": "psg-kb42-dk1057-occ-baseline",
      "pdfIndex": 63,
      "value": "71",
      "unit": "1000 t/year",
      "quantity": "假设送焚烧量",
      "subject": "2001丹麦瓦楞纸",
      "basis": "表4.5印刷第64页、情景1（2001年基线），单位千吨；研究模型的年度商业纸料质量，未提供统一绝干纤维基准。"
    },
    "annualImports": {
      "source": "dk1057",
      "evidenceId": "ev-kb42-dk1057-occ-baseline",
      "factId": "nf-imports",
      "passageId": "psg-kb42-dk1057-occ-baseline",
      "pdfIndex": 63,
      "value": "22",
      "unit": "1000 t/year",
      "quantity": "模型进口",
      "subject": "2001丹麦瓦楞纸",
      "basis": "表4.5印刷第64页、情景1（2001年基线），单位千吨；研究模型的年度商业纸料质量，未提供统一绝干纤维基准。"
    },
    "annualExports": {
      "source": "dk1057",
      "evidenceId": "ev-kb42-dk1057-occ-baseline",
      "factId": "nf-exports",
      "passageId": "psg-kb42-dk1057-occ-baseline",
      "pdfIndex": 63,
      "value": "114",
      "unit": "1000 t/year",
      "quantity": "模型出口",
      "subject": "2001丹麦瓦楞纸",
      "basis": "表4.5印刷第64页、情景1（2001年基线），单位千吨；研究模型的年度商业纸料质量，未提供统一绝干纤维基准。"
    },
    "annualDomesticFeed": {
      "source": "dk1057",
      "evidenceId": "ev-kb42-dk1057-occ-baseline",
      "factId": "nf-mill-input",
      "passageId": "psg-kb42-dk1057-occ-baseline",
      "pdfIndex": 63,
      "value": "183",
      "unit": "1000 t/year",
      "quantity": "国内回收厂进料",
      "subject": "2001丹麦瓦楞纸",
      "basis": "表4.5印刷第64页、情景1（2001年基线），单位千吨；研究模型的年度商业纸料质量，未提供统一绝干纤维基准。"
    },
    "annualLinerOutput": {
      "source": "dk1057",
      "evidenceId": "ev-kb42-dk1057-occ-baseline",
      "factId": "nf-liner",
      "passageId": "psg-kb42-dk1057-occ-baseline",
      "pdfIndex": 63,
      "value": "144",
      "unit": "1000 t/year",
      "quantity": "再生挂面纸与瓦楞芯纸",
      "subject": "SCA Grenå",
      "basis": "表4.5印刷第64页、情景1（2001年基线），单位千吨；研究模型的年度商业纸料质量，未提供统一绝干纤维基准。"
    },
    "annualBoardOutput": {
      "source": "dk1057",
      "evidenceId": "ev-kb42-dk1057-occ-baseline",
      "factId": "nf-board",
      "passageId": "psg-kb42-dk1057-occ-baseline",
      "pdfIndex": 63,
      "value": "23",
      "unit": "1000 t/year",
      "quantity": "再生纸板",
      "subject": "Hartmann/Skjern",
      "basis": "表4.5印刷第64页、情景1（2001年基线），单位千吨；研究模型的年度商业纸料质量，未提供统一绝干纤维基准。"
    },
    "annualTotalOutput": {
      "source": "dk1057",
      "evidenceId": "ev-kb42-dk1057-occ-baseline",
      "factId": "nf-total",
      "passageId": "psg-kb42-dk1057-occ-baseline",
      "pdfIndex": 63,
      "value": "167",
      "unit": "1000 t/year",
      "quantity": "再生纸品合计",
      "subject": "2001丹麦瓦楞纸国内回收",
      "basis": "表4.5印刷第64页、情景1（2001年基线），单位千吨；研究模型的年度商业纸料质量，未提供统一绝干纤维基准。"
    },
    "annualExtraFeed": {
      "source": "dk1057",
      "evidenceId": "ev-kb42-dk1057-occ-scenarios",
      "factId": "nf-increment",
      "passageId": "psg-kb42-dk1057-occ-scenarios",
      "pdfIndex": 65,
      "value": "18000",
      "unit": "t/year",
      "quantity": "增加的收集量及国内回收进料",
      "subject": "情景2相对情景1",
      "basis": "§4.3.2–4.3.3印刷第66–67页的年度情景变化；贸易量固定，原报告取整量；不是完整市场响应测量。"
    },
    "annualExtraProduct": {
      "source": "dk1057",
      "evidenceId": "ev-kb42-dk1057-occ-scenarios",
      "factId": "nf-product-increment",
      "passageId": "psg-kb42-dk1057-occ-scenarios",
      "pdfIndex": 65,
      "value": "16000",
      "unit": "t/year",
      "quantity": "增加的再生产品量",
      "subject": "情景2相对情景1",
      "basis": "§4.3.2–4.3.3印刷第66–67页的年度情景变化；贸易量固定，原报告取整量；不是完整市场响应测量。"
    },
    "strengthRatio": {
      "source": "dk1057",
      "evidenceId": "ev-kb42-dk1057-occ-scenarios",
      "factId": "nf-strength-ratio",
      "passageId": "psg-kb42-dk1057-occ-scenarios",
      "pdfIndex": 65,
      "value": "1.25",
      "unit": "t recycled liner/fluting per t virgin liner/fluting",
      "quantity": "强度等效折算假设",
      "subject": "瓦楞纸包装",
      "basis": "§4.3.2印刷第66页、§5.5.6第84页；以相同瓦楞包装强度为条件的成品质量折算，引用Katholm1994私人通信；不是制浆收率，也非实际市场测量。"
    },
    "reportedAnnualAvoidedLiner": {
      "source": "dk1057",
      "evidenceId": "ev-kb42-dk1057-occ-scenarios",
      "factId": "nf-virgin-avoided",
      "passageId": "psg-kb42-dk1057-occ-scenarios",
      "pdfIndex": 65,
      "value": "12800",
      "unit": "t/year",
      "quantity": "模型避免的原生挂面纸及芯纸",
      "subject": "情景2相对情景1",
      "basis": "§4.3.2–4.3.3印刷第66–67页的年度情景变化；贸易量固定，原报告取整量；不是完整市场响应测量。"
    },
    "reportedLinerPerKg": {
      "source": "dk1057",
      "evidenceId": "ev-kb42-dk1057-occ-scenarios",
      "factId": "nf-kg-liner",
      "passageId": "psg-kb42-dk1057-occ-scenarios",
      "pdfIndex": 66,
      "value": "0.787",
      "unit": "kg/kg collected paper",
      "quantity": "再生挂面纸与瓦楞芯纸",
      "subject": "国内1kg情景",
      "basis": "表4.6印刷第67页；1kg收集纸的国内基线或所标国外敏感性，显示舍入的成品质量；表未注明干物质比例，不能当作绝干纤维收率。"
    },
    "reportedBoardPerKg": {
      "source": "dk1057",
      "evidenceId": "ev-kb42-dk1057-occ-scenarios",
      "factId": "nf-kg-board",
      "passageId": "psg-kb42-dk1057-occ-scenarios",
      "pdfIndex": 66,
      "value": "0.126",
      "unit": "kg/kg collected paper",
      "quantity": "再生纸板",
      "subject": "国内1kg情景",
      "basis": "表4.6印刷第67页；1kg收集纸的国内基线或所标国外敏感性，显示舍入的成品质量；表未注明干物质比例，不能当作绝干纤维收率。"
    },
    "reportedTotalPerKg": {
      "source": "dk1057",
      "evidenceId": "ev-kb42-dk1057-occ-scenarios",
      "factId": "nf-kg-total",
      "passageId": "psg-kb42-dk1057-occ-scenarios",
      "pdfIndex": 66,
      "value": "0.913",
      "unit": "kg/kg collected paper",
      "quantity": "再生纸产品合计",
      "subject": "国内1kg情景",
      "basis": "表4.6印刷第67页；1kg收集纸的国内基线或所标国外敏感性，显示舍入的成品质量；表未注明干物质比例，不能当作绝干纤维收率。"
    },
    "linerSubstitution": {
      "source": "dk1057",
      "evidenceId": "ev-kb42-dk1057-substitution-table",
      "factId": "nf-liner-substitution",
      "passageId": "psg-kb42-dk1057-substitution-table",
      "pdfIndex": 39,
      "value": "0.8",
      "unit": "kg modeled virgin liner/fluting per kg recycled liner/fluting",
      "quantity": "国内纸级模型替代比",
      "subject": "瓦楞纸国内回收挂面/芯纸",
      "basis": "表3.1印刷第40页Bølgepap国内fluting/liner行，0.8:1；对应构造的硫酸盐/CTMP一体化原生参照。单位质量折算，不是加工收率或实际市场响应。"
    },
    "boardSubstitution": {
      "source": "dk1057",
      "evidenceId": "ev-kb42-dk1057-substitution-table",
      "factId": "nf-board-substitution",
      "passageId": "psg-kb42-dk1057-substitution-table",
      "pdfIndex": 39,
      "value": "1",
      "unit": "kg modeled virgin board per kg recycled board",
      "quantity": "国内纸级模型替代比",
      "subject": "瓦楞纸国内回收纸板",
      "basis": "表3.1印刷第40页Bølgepap国内pap行，1:1；对应硫酸盐/CTMP一体化原生纸板参照。不是所有纸板功能等价的普遍定律。"
    },
    "grossEnergy": {
      "source": "dk1057",
      "evidenceId": "ev-kb42-dk1057-incineration",
      "factId": "nf-gross",
      "passageId": "psg-kb42-dk1057-incineration",
      "pdfIndex": 76,
      "value": "12.53",
      "unit": "MJ/kg paper or board at 92% solids",
      "quantity": "输送前外供热电",
      "subject": "焚烧1kg情景",
      "basis": "§5.3印刷第77–79页、图5.1和表5.13；每kg干物质92%的纸/纸板焚烧模型。负数表示被避免的投入，不是烟囱负排放。"
    },
    "powerShare": {
      "source": "dk1057",
      "evidenceId": "ev-kb42-dk1057-incineration",
      "factId": "nf-power-share",
      "passageId": "psg-kb42-dk1057-incineration",
      "pdfIndex": 76,
      "value": "25",
      "unit": "%",
      "quantity": "毛电力输出占比（约）",
      "subject": "焚烧1kg情景",
      "basis": "§5.3印刷第77–79页、图5.1和表5.13；每kg干物质92%的纸/纸板焚烧模型。负数表示被避免的投入，不是烟囱负排放。"
    },
    "heatShare": {
      "source": "dk1057",
      "evidenceId": "ev-kb42-dk1057-incineration",
      "factId": "nf-heat-share",
      "passageId": "psg-kb42-dk1057-incineration",
      "pdfIndex": 76,
      "value": "75",
      "unit": "%",
      "quantity": "毛热输出占比（约）",
      "subject": "焚烧1kg情景",
      "basis": "§5.3印刷第77–79页、图5.1和表5.13；每kg干物质92%的纸/纸板焚烧模型。负数表示被避免的投入，不是烟囱负排放。"
    },
    "powerTransmissionLoss": {
      "source": "dk1057",
      "evidenceId": "ev-kb42-dk1057-incineration",
      "factId": "nf-power-loss",
      "passageId": "psg-kb42-dk1057-incineration",
      "pdfIndex": 76,
      "value": "10",
      "unit": "%",
      "quantity": "电力输送损失",
      "subject": "焚烧1kg情景",
      "basis": "§5.3印刷第77–79页、图5.1和表5.13；每kg干物质92%的纸/纸板焚烧模型。负数表示被避免的投入，不是烟囱负排放。"
    },
    "heatTransmissionLoss": {
      "source": "dk1057",
      "evidenceId": "ev-kb42-dk1057-incineration",
      "factId": "nf-heat-loss",
      "passageId": "psg-kb42-dk1057-incineration",
      "pdfIndex": 76,
      "value": "20",
      "unit": "%",
      "quantity": "热输送损失",
      "subject": "焚烧1kg情景",
      "basis": "§5.3印刷第77–79页、图5.1和表5.13；每kg干物质92%的纸/纸板焚烧模型。负数表示被避免的投入，不是烟囱负排放。"
    },
    "reportedDeliveredPower": {
      "source": "dk1057",
      "evidenceId": "ev-kb42-dk1057-incineration",
      "factId": "nf-delivered-power",
      "passageId": "psg-kb42-dk1057-incineration",
      "pdfIndex": 77,
      "value": "2.82",
      "unit": "MJ/kg paper or board at 92% solids",
      "quantity": "报告交付电量",
      "subject": "电热同时输出",
      "basis": "§5.3印刷第77–79页、图5.1和表5.13；每kg干物质92%的纸/纸板焚烧模型。负数表示被避免的投入，不是烟囱负排放。图5.1显示取整值。"
    },
    "reportedDeliveredHeat": {
      "source": "dk1057",
      "evidenceId": "ev-kb42-dk1057-incineration",
      "factId": "nf-delivered-heat",
      "passageId": "psg-kb42-dk1057-incineration",
      "pdfIndex": 77,
      "value": "7.52",
      "unit": "MJ/kg paper or board at 92% solids",
      "quantity": "报告交付热量",
      "subject": "电热同时输出",
      "basis": "§5.3印刷第77–79页、图5.1和表5.13；每kg干物质92%的纸/纸板焚烧模型。负数表示被避免的投入，不是烟囱负排放。图5.1显示取整值。"
    },
    "reportedDeliveredTotal": {
      "source": "dk1057",
      "evidenceId": "ev-kb42-dk1057-incineration",
      "factId": "nf-delivered-total",
      "passageId": "psg-kb42-dk1057-incineration",
      "pdfIndex": 77,
      "value": "10.34",
      "unit": "MJ/kg paper or board at 92% solids",
      "quantity": "报告热电交付总量",
      "subject": "原总量算法",
      "basis": "§5.3印刷第77–79页、图5.1和表5.13；每kg干物质92%的纸/纸板焚烧模型。负数表示被避免的投入，不是烟囱负排放。原总量算法将热电相加，不说明两种服务各自等量。"
    },
    "oldChpEfficiency": {
      "source": "dk1057",
      "evidenceId": "ev-kb42-dk1057-incineration",
      "factId": "nf-chp-old-eff",
      "passageId": "psg-kb42-dk1057-incineration",
      "pdfIndex": 77,
      "value": "77",
      "unit": "%",
      "quantity": "原总量算法热电联产效率",
      "subject": "电热同时输出",
      "basis": "§5.3印刷第77–79页、图5.1和表5.13；每kg干物质92%的纸/纸板焚烧模型。负数表示被避免的投入，不是烟囱负排放。"
    },
    "chpHeatShare": {
      "source": "dk1057",
      "evidenceId": "ev-kb42-dk1057-incineration",
      "factId": "nf-chp-heat-share",
      "passageId": "psg-kb42-dk1057-incineration",
      "pdfIndex": 77,
      "value": "50",
      "unit": "%",
      "quantity": "被替代天然气热电联产的交付热量份额",
      "subject": "热电50:50参照过程",
      "basis": "§5.3印刷第77–79页、图5.1和表5.13；每kg干物质92%的纸/纸板焚烧模型。负数表示被避免的投入，不是烟囱负排放。第78页说明热电比50/50；区别于补缺纯发电50%效率。"
    },
    "chpEfficiency": {
      "source": "dk1057",
      "evidenceId": "ev-kb42-dk1057-incineration",
      "factId": "nf-chp-eff",
      "passageId": "psg-kb42-dk1057-incineration",
      "pdfIndex": 77,
      "value": "78",
      "unit": "%",
      "quantity": "补偿算法热电联产交付效率",
      "subject": "含输送损失",
      "basis": "§5.3印刷第77–79页、图5.1和表5.13；每kg干物质92%的纸/纸板焚烧模型。负数表示被避免的投入，不是烟囱负排放。"
    },
    "powerEfficiency": {
      "source": "dk1057",
      "evidenceId": "ev-kb42-dk1057-incineration",
      "factId": "nf-power-eff",
      "passageId": "psg-kb42-dk1057-incineration",
      "pdfIndex": 77,
      "value": "50",
      "unit": "%",
      "quantity": "补缺边际纯发电效率",
      "subject": "无联产热",
      "basis": "§5.3印刷第77–79页、图5.1和表5.13；每kg干物质92%的纸/纸板焚烧模型。负数表示被避免的投入，不是烟囱负排放。"
    },
    "reportedMixedAggregateActivity": {
      "source": "dk1057",
      "evidenceId": "ev-kb42-dk1057-incineration",
      "factId": "nf-mixed-unmatched-gas",
      "passageId": "psg-kb42-dk1057-incineration",
      "pdfIndex": 78,
      "value": "-13.4",
      "unit": "MJ/kg paper or board at 92% solids",
      "quantity": "天然气投入的避免量（负号），总量算法",
      "subject": "电热同时输出",
      "basis": "§5.3印刷第77–79页、图5.1和表5.13；每kg干物质92%的纸/纸板焚烧模型。负数表示被避免的投入，不是烟囱负排放。"
    },
    "reportedMixedMatchedActivity": {
      "source": "dk1057",
      "evidenceId": "ev-kb42-dk1057-incineration",
      "factId": "nf-mixed-matched-gas",
      "passageId": "psg-kb42-dk1057-incineration",
      "pdfIndex": 78,
      "value": "-9.88",
      "unit": "MJ/kg paper or board at 92% solids",
      "quantity": "天然气投入的避免量（负号），电热分别匹配",
      "subject": "电热同时输出",
      "basis": "§5.3印刷第77–79页、图5.1和表5.13；每kg干物质92%的纸/纸板焚烧模型。负数表示被避免的投入，不是烟囱负排放。"
    },
    "reportedHeatOnlyExergyActivity": {
      "source": "dk1057",
      "evidenceId": "ev-kb42-dk1057-incineration",
      "factId": "nf-heat-exergy-gas",
      "passageId": "psg-kb42-dk1057-incineration",
      "pdfIndex": 78,
      "value": "-3.4",
      "unit": "MJ/kg paper or board at 92% solids",
      "quantity": "报告天然气投入避免量，原火用分配",
      "subject": "只有热的敏感性",
      "basis": "§5.3印刷第77–79页、图5.1和表5.13；每kg干物质92%的纸/纸板焚烧模型。负数表示被避免的投入，不是烟囱负排放。"
    },
    "reportedHeatOnlyExpandedActivity": {
      "source": "dk1057",
      "evidenceId": "ev-kb42-dk1057-incineration",
      "factId": "nf-heat-matched-gas",
      "passageId": "psg-kb42-dk1057-incineration",
      "pdfIndex": 78,
      "value": "-6.04",
      "unit": "MJ/kg paper or board at 92% solids",
      "quantity": "报告天然气投入避免量，电力补偿",
      "subject": "只有热的敏感性",
      "basis": "§5.3印刷第77–79页、图5.1和表5.13；每kg干物质92%的纸/纸板焚烧模型。负数表示被避免的投入，不是烟囱负排放。"
    }
  },
  "interpretation": {
    "annualRoutingBasis": "Report 1057 scenario 1 commercial paper mass, separate from Report 830 statistics",
    "marginalPaperBasis": "Report 1057 Table 4.6 collected paper routed to domestic recycling",
    "incinerationBasis": "Report 1057 section 5.3 paper or board at 92% solids",
    "separateGradeCredits": true,
    "gradeCreditConditionalOnModeledPaperAndMarketEquivalence": true,
    "closedFibreLedger": false,
    "actualVirginDisplacementMeasured": false,
    "mixedHeatAndElectricityReplayed": true,
    "heatOnlyExpansionReproduced": false,
    "originalProcessModelReproduced": false,
    "empiricalReuseVerified": false,
    "fibreLifeVerified": false,
    "marketRegimeVerified": false,
    "environmentalRankingEstablished": false,
    "gradeSubstitutionBasis": "Report 1057 Table 3.1 domestic grade ratios applied to Table 4.6 finished-paper masses"
  }
};

function object(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function inputShape(value) {
  if (!object(value)) return null;
  return Object.freeze(Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, inputShape(nested)])));
}

export const recoveredPaperInputShape = inputShape(reviewed);

export function validateRecoveredPaperCase(spec) {
  return isDeepStrictEqual(spec, reviewed) ? [] : ['case: expected the exact reviewed recovered-paper v1 input'];
}

const one = rational(1n);
const hundred = rational(100n);

function percent(value) {
  return divide(value, hundred);
}

function nonnegativeAvoidedAmount(activity) {
  return subtract(rational(0n), activity);
}

function heatMatchedGas(heat, electricity, heatShare, chpEfficiency, electricityEfficiency) {
  const displacedChpOutput = divide(heat, heatShare);
  const displacedElectricity = subtract(displacedChpOutput, heat);
  const missingElectricity = subtract(displacedElectricity, electricity);
  const displacedGas = divide(displacedChpOutput, chpEfficiency);
  const makeupGas = divide(missingElectricity, electricityEfficiency);
  return { displacedChpOutput, displacedElectricity, missingElectricity, displacedGas, makeupGas,
    netAvoidedGas: subtract(displacedGas, makeupGas) };
}

/** Replay the displayed annual ledger, paper grades and energy activities independently. */
export function evaluateRecoveredPaperCase(spec) {
  const errors = validateRecoveredPaperCase(spec);
  if (errors.length) throw new TypeError(`Invalid recovered-paper case:\n${errors.join('\n')}`);
  const fact = key => decimal(spec.facts[key].value);

  // Report 830's packaging-supply and waste-flow estimates use their own trade data.
  const netFilledImports = subtract(fact('statsFilledImports'), fact('statsFilledExports'));
  const supplied = add(fact('statsEmptySupply'), netFilledImports);
  const netRecoveredExports = subtract(fact('statsRecoveredExports'), fact('statsRecoveredImports'));
  const collected = add(add(fact('statsMillUse'), netRecoveredExports), fact('statsStockChange'));
  const collectionPercent = multiply(divide(collected, supplied), hundred);
  const printedRateNumerator = fact('statsRateNumerator');
  const printedNumeratorPercent = multiply(divide(printedRateNumerator, supplied), hundred);

  // Report 1057's rounded annual model is a different layer from those statistics.
  const annualCollected = fact('annualCollected');
  const annualUse = fact('annualUse');
  const incinerated = fact('annualIncinerated');
  const routed = add(annualCollected, incinerated);
  const domesticFeed = subtract(add(annualCollected, fact('annualImports')), fact('annualExports'));
  const liner = fact('annualLinerOutput');
  const board = fact('annualBoardOutput');
  const totalProduct = add(liner, board);

  // The paper output denominator is domestic recycling feed, not all collection.
  const linerPerKg = divide(liner, domesticFeed);
  const boardPerKg = divide(board, domesticFeed);
  const totalPerKg = divide(totalProduct, domesticFeed);
  const reportedLiner = fact('reportedLinerPerKg');
  const reportedBoard = fact('reportedBoardPerKg');
  const reportedTotal = fact('reportedTotalPerKg');

  // The reported annual substitution calculation and the conditional grade
  // calculations answer different questions, on different denominators.
  const strengthRatio = fact('strengthRatio');
  const annualExtraProduct = fact('annualExtraProduct');
  const avoidedAnnualLiner = divide(annualExtraProduct, strengthRatio);
  const linerMultiplier = fact('linerSubstitution');
  const boardMultiplier = fact('boardSubstitution');
  const modeledVirginLiner = multiply(reportedLiner, linerMultiplier);
  const modeledVirginBoard = multiply(reportedBoard, boardMultiplier);

  const gross = fact('grossEnergy');
  const heatDeliveryShare = subtract(one, percent(fact('heatTransmissionLoss')));
  const electricityDeliveryShare = subtract(one, percent(fact('powerTransmissionLoss')));
  const deliveredHeat = multiply(multiply(gross, percent(fact('heatShare'))), heatDeliveryShare);
  const deliveredElectricity = multiply(multiply(gross, percent(fact('powerShare'))), electricityDeliveryShare);
  const printedHeat = fact('reportedDeliveredHeat');
  const printedElectricity = fact('reportedDeliveredPower');
  const printedTotal = fact('reportedDeliveredTotal');
  const oldAggregateGas = divide(printedTotal, percent(fact('oldChpEfficiency')));
  const chpHeatShare = percent(fact('chpHeatShare'));
  const chpEfficiency = percent(fact('chpEfficiency'));
  const electricityEfficiency = percent(fact('powerEfficiency'));
  // The authors match the two services using their displayed delivered amounts.
  const matched = heatMatchedGas(printedHeat, printedElectricity, chpHeatShare, chpEfficiency, electricityEfficiency);
  const heatOnlyDelivered = multiply(gross, heatDeliveryShare);
  const heatOnlyConditional = heatMatchedGas(
    heatOnlyDelivered, rational(0n), chpHeatShare, chpEfficiency, electricityEfficiency,
  ).netAvoidedGas;
  const reportedHeatOnlyExpanded = nonnegativeAvoidedAmount(fact('reportedHeatOnlyExpandedActivity'));

  return {
    upstreamStatistics: {
      source: 'dk830',
      massUnit: 't/year',
      netFilledPackagingImports: result(netFilledImports),
      packagingSupply: result(supplied),
      reportedPackagingSupply: result(fact('statsSupply')),
      netRecoveredPaperExports: result(netRecoveredExports),
      collected: result(collected),
      reportedCollected: result(fact('statsCollected')),
      printedRateNumerator: result(printedRateNumerator),
      collectedMinusPrintedRateNumerator: result(subtract(collected, printedRateNumerator)),
      collectionPercent: result(collectionPercent),
      collectionPercentRounded1: fixed(collectionPercent, 1),
      printedNumeratorPercentRounded1: fixed(printedNumeratorPercent, 1),
      numeratorDiscrepancyRepaired: false,
      reconciledToReport1057: false,
    },
    annualRouting: {
      source: 'dk1057',
      massUnit: '1000 t/year',
      reportedUse: result(annualUse),
      collected: result(annualCollected),
      convertingWasteInCollection: result(fact('annualConvertingWaste')),
      assumedIncinerated: result(incinerated),
      collectionPlusIncineration: result(routed),
      useMinusRouted: result(subtract(annualUse, routed)),
      imports: result(fact('annualImports')),
      exports: result(fact('annualExports')),
      domesticFeed: result(domesticFeed),
      reportedDomesticFeed: result(fact('annualDomesticFeed')),
      calculatedMinusReportedDomesticFeed: result(subtract(domesticFeed, fact('annualDomesticFeed'))),
    },
    recyclingYield: {
      unit: 'kg product/kg collected paper routed to domestic recycling',
      annualOutputUnit: '1000 t/year',
      annualLinerFlutingOutput: result(liner),
      annualBoardOutput: result(board),
      annualProductOutput: result(totalProduct),
      reportedAnnualProductOutput: result(fact('annualTotalOutput')),
      linerFlutingPerKg: result(linerPerKg),
      boardPerKg: result(boardPerKg),
      totalPerKg: result(totalPerKg),
      reportedLinerFlutingPerKg: result(reportedLiner),
      reportedBoardPerKg: result(reportedBoard),
      reportedTotalPerKg: result(reportedTotal),
      reportedPaperOutputShortfall: result(subtract(one, reportedTotal)),
      closedFibreLedger: false,
    },
    annualSubstitution: {
      unit: 't/year',
      strengthRatioUnit: 't recycled liner/fluting per t modeled virgin liner/fluting',
      extraRecoveredFeed: result(fact('annualExtraFeed')),
      extraRecoveredProduct: result(annualExtraProduct),
      linerFlutingStrengthRatio: result(strengthRatio),
      modelAvoidedVirginLinerFluting: result(avoidedAnnualLiner),
      reportedAvoidedVirginLinerFluting: result(fact('reportedAnnualAvoidedLiner')),
      measuredVirginDisplacement: false,
    },
    gradeSubstitution: {
      unit: 'kg modeled virgin grade/kg collected paper routed to domestic recycling',
      linerFlutingFromReportedGradeMass: result(modeledVirginLiner),
      boardFromReportedGradeMass: result(modeledVirginBoard),
      linerFlutingMultiplier: result(linerMultiplier),
      boardMultiplier: result(boardMultiplier),
      annualStrengthRatioReciprocal: result(divide(one, strengthRatio)),
      status: 'reported domestic grade mapping applied to displayed finished-paper masses',
    },
    mixedEnergy: {
      unit: 'MJ/kg incinerated paper or board at 92% solids',
      grossExport: result(gross),
      deliveredElectricity: result(deliveredElectricity),
      deliveredHeat: result(deliveredHeat),
      deliveredTotal: result(add(deliveredElectricity, deliveredHeat)),
      reportedDeliveredElectricity: result(printedElectricity),
      reportedDeliveredHeat: result(printedHeat),
      reportedDeliveredTotal: result(printedTotal),
      aggregate: {
        avoidedGas: result(oldAggregateGas),
        avoidedGasRounded1: fixed(oldAggregateGas, 1),
        sourceReportedAvoidedGas: result(nonnegativeAvoidedAmount(fact('reportedMixedAggregateActivity'))),
      },
      matched: {
        displacedChpOutput: result(matched.displacedChpOutput),
        displacedElectricity: result(matched.displacedElectricity),
        missingElectricity: result(matched.missingElectricity),
        displacedGas: result(matched.displacedGas),
        displacedGasRounded2: fixed(matched.displacedGas, 2),
        makeupGas: result(matched.makeupGas),
        netAvoidedGas: result(matched.netAvoidedGas),
        netAvoidedGasRounded2: fixed(matched.netAvoidedGas, 2),
        sourceReportedAvoidedGas: result(nonnegativeAvoidedAmount(fact('reportedMixedMatchedActivity'))),
      },
      avoidedGasSign: 'positive avoided magnitude; source table displays negative input activity',
    },
    heatOnly: {
      unit: 'MJ/kg incinerated paper or board at 92% solids',
      deliveredHeat: result(heatOnlyDelivered),
      sourceReportedExergyAvoidedGas: result(nonnegativeAvoidedAmount(fact('reportedHeatOnlyExergyActivity'))),
      sourceReportedExpandedAvoidedGas: result(reportedHeatOnlyExpanded),
      conditionalMixedEfficienciesAvoidedGas: result(heatOnlyConditional),
      conditionalMixedEfficienciesAvoidedGasRounded2: fixed(heatOnlyConditional, 2),
      conditionalMinusReportedExpanded: result(subtract(heatOnlyConditional, reportedHeatOnlyExpanded)),
      sourceExergyCalculationReproduced: false,
      sourceExpansionCalculationReproduced: false,
      discrepancyCauseEstablished: false,
      sourceResultRepaired: false,
    },
    originalProcessModelReproduced: false,
    empiricalReuseVerified: false,
    fibreLifeVerified: false,
    marketRegimeVerified: false,
    environmentalRankingEstablished: false,
  };
}

const numericFields = ['value', 'unit', 'quantity', 'subject', 'basis'];

function uniqueRecord(records, id) {
  if (!Array.isArray(records)) return undefined;
  const matches = records.filter(record => record?.id === id);
  return matches.length === 1 ? matches[0] : undefined;
}

function registerContainsUniqueIdentity(readings, field, id) {
  return readings.filter(reading => Array.isArray(reading?.[field])
    && reading[field].some(record => record?.id === id)).length === 1;
}

function originalPdf(artifact, expected) {
  return [undefined, 'retrieved'].includes(artifact?.kind)
    && artifact?.mediaType === 'application/pdf'
    && artifact.sha256 === expected.sha256
    && artifact.resolvedUrl === expected.resolvedUrl
    && artifact.pageCount === expected.pageCount;
}

/** Each selected numeric tuple must resolve to its actual inspected original PDF page. */
export function validateRecoveredPaperFacts(spec, published, context = {}) {
  const errors = validateRecoveredPaperCase(spec);
  if (errors.length) return errors;
  if (!Array.isArray(published?.sources) || !Array.isArray(published?.evidence))
    return ['recovered paper: public source and evidence closure required'];
  const register = context?.readingRegister;
  if (register?.schemaVersion !== 1 || !Array.isArray(register.readings))
    return ['recovered paper: actual reading register required'];

  const actualReadings = new Map();
  for (const [key, expected] of Object.entries(spec.sources)) {
    const source = uniqueRecord(published.sources, expected.sourceId);
    const reading = uniqueRecord(register.readings, expected.readingId);
    const carrier = uniqueRecord(reading?.artifacts, expected.artifactId);
    if (source?.version !== expected.version || reading?.version !== expected.version || reading?.workId !== expected.workId
        || source.accessStatus !== 'public-passages-inspected'
        || source.reading?.readingId !== expected.readingId || source.reading.status !== 'selected-passages'
        || typeof source.reading.scope !== 'string' || !source.reading.scope.trim()
        || reading.readingStatus !== 'selected-passages'
        || !originalPdf(source.artifact, expected) || !originalPdf(carrier, expected)) {
      errors.push(`recovered paper.sources.${key}: exact inspected work, edition and original PDF identity required`);
      continue;
    }
    actualReadings.set(key, reading);
  }

  for (const [key, input] of Object.entries(spec.facts)) {
    const source = spec.sources[input.source];
    const reading = actualReadings.get(input.source);
    const evidence = uniqueRecord(published.evidence, input.evidenceId);
    const numeric = uniqueRecord(evidence?.numericFacts, input.factId);
    if (evidence?.sourceId !== source.sourceId || evidence?.numericFact !== undefined
        || !numericFields.every(field => numeric?.[field] === input[field]))
      errors.push(`recovered paper.facts.${key}: exact public fact identity and value/unit/quantity/subject/basis required`);

    const passage = uniqueRecord(reading?.passages, input.passageId);
    if (evidence?.readingId !== source.readingId || evidence?.passageId !== input.passageId
        || passage?.artifactId !== source.artifactId
        || !registerContainsUniqueIdentity(register.readings, 'passages', input.passageId)
        || !registerContainsUniqueIdentity(register.readings, 'artifacts', source.artifactId)
        || typeof passage.printedPages !== 'string' || !passage.printedPages.trim()
        || !Array.isArray(passage.pdfIndices) || !passage.pdfIndices.includes(input.pdfIndex))
      errors.push(`recovered paper.facts.${key}: exact inspected passage, original PDF carrier and numerical page required`);
  }
  return errors;
}
