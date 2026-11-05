import { rational, decimal, subtract, multiply, divide, fixed, result } from './exact-rational.mjs';

// Independent closed authority; downloadable input cannot approve its own tuples.
const reviewed = {
  "caseId": "CASE-PACK-STUDY",
  "version": "1.0.0",
  "model": "reported-2011-service-credit-and-strict-use-arithmetic-v1",
  "createdAt": "2026-11-05",
  "status": "selected-original-report-arithmetic",
  "source": {
    "sourceId": "src-pack-ea2011",
    "readingId": "rd-pack-ea2011",
    "workId": "work-pack-ea2011",
    "version": "SC030148；报告署期 February 2011；GOV.UK 发布 25 July 2011；120页官方PDF",
    "artifactId": "art-pack-ea2011",
    "sha256": "0ffd0650516b49551a00c139af4ca4d74711fc9c2e6dcfc9da192f4c92e0588e"
  },
  "facts": {
    "serviceItems": {
      "evidenceId": "ev-pack-ea-flow",
      "factId": "service-items",
      "passageId": "psg-pack-ea2011-flow",
      "value": "483",
      "unit": "items/service",
      "quantity": "functional unit",
      "subject": "one month UK shopping",
      "basis": "Section3.1 printed17; one month shopping in UK2006/07; stated functional unit differs from preceding four-week446-item survey figure"
    },
    "hdpeVolume": {
      "evidenceId": "ev-pack-ea-flow",
      "factId": "hdpe-volume",
      "passageId": "psg-pack-ea2011-flow",
      "value": "19.1",
      "unit": "L/bag",
      "quantity": "bag volume",
      "subject": "HDPE carrier bag",
      "basis": "Table3.1 printed18; excludes primary reuse; displayed rounded value"
    },
    "hdpeMass": {
      "evidenceId": "ev-pack-ea-flow",
      "factId": "hdpe-mass",
      "passageId": "psg-pack-ea2011-flow",
      "value": "8.12",
      "unit": "g/bag",
      "quantity": "bag mass",
      "subject": "HDPE carrier bag",
      "basis": "Table3.1 printed18; excludes primary reuse; displayed rounded value"
    },
    "hdpeItems": {
      "evidenceId": "ev-pack-ea-flow",
      "factId": "hdpe-items",
      "passageId": "psg-pack-ea2011-flow",
      "value": "5.88",
      "unit": "items/bag",
      "quantity": "applied item capacity",
      "subject": "HDPE carrier bag",
      "basis": "Table3.1 printed18; excludes primary reuse; displayed rounded value"
    },
    "hdpeReferenceFlow": {
      "evidenceId": "ev-pack-ea-flow",
      "factId": "hdpe-referenceflow",
      "passageId": "psg-pack-ea2011-flow",
      "value": "82.14",
      "unit": "bags/service",
      "quantity": "reported reference flow",
      "subject": "HDPE carrier bag",
      "basis": "Table3.1 printed18; excludes primary reuse; displayed rounded value"
    },
    "ldpeVolume": {
      "evidenceId": "ev-pack-ea-flow",
      "factId": "ldpe-volume",
      "passageId": "psg-pack-ea2011-flow",
      "value": "21.52",
      "unit": "L/bag",
      "quantity": "bag volume",
      "subject": "LDPE carrier bag",
      "basis": "Table3.1 printed18; excludes primary reuse; displayed rounded value"
    },
    "ldpeMass": {
      "evidenceId": "ev-pack-ea-flow",
      "factId": "ldpe-mass",
      "passageId": "psg-pack-ea2011-flow",
      "value": "34.94",
      "unit": "g/bag",
      "quantity": "bag mass",
      "subject": "LDPE carrier bag",
      "basis": "Table3.1 printed18; excludes primary reuse; displayed rounded value"
    },
    "ldpeItems": {
      "evidenceId": "ev-pack-ea-flow",
      "factId": "ldpe-items",
      "passageId": "psg-pack-ea2011-flow",
      "value": "7.96",
      "unit": "items/bag",
      "quantity": "applied item capacity",
      "subject": "LDPE carrier bag",
      "basis": "Table3.1 printed18; excludes primary reuse; displayed rounded value"
    },
    "ldpeReferenceFlow": {
      "evidenceId": "ev-pack-ea-flow",
      "factId": "ldpe-referenceflow",
      "passageId": "psg-pack-ea2011-flow",
      "value": "60.68",
      "unit": "bags/service",
      "quantity": "reported reference flow",
      "subject": "LDPE carrier bag",
      "basis": "Table3.1 printed18; excludes primary reuse; displayed rounded value"
    },
    "hdpeObservedItems": {
      "evidenceId": "ev-pack-ea-capacity",
      "factId": "hdpe-observeditems",
      "passageId": "psg-pack-ea2011-capacity",
      "value": "14651",
      "unit": "items",
      "quantity": "reported surveyed item count",
      "subject": "single-use carrier bags surveyed (capacity applied to HDPE)",
      "basis": "AnnexB.2 printed79; underlying surveyed counts; distinct from applied rounded Table3.1 capacity"
    },
    "hdpeObservedBags": {
      "evidenceId": "ev-pack-ea-capacity",
      "factId": "hdpe-observedbags",
      "passageId": "psg-pack-ea2011-capacity",
      "value": "2490",
      "unit": "bags",
      "quantity": "reported surveyed bag count",
      "subject": "single-use carrier bags surveyed (capacity applied to HDPE)",
      "basis": "AnnexB.2 printed79; underlying surveyed counts; distinct from applied rounded Table3.1 capacity"
    },
    "ldpeObservedItems": {
      "evidenceId": "ev-pack-ea-capacity",
      "factId": "ldpe-observeditems",
      "passageId": "psg-pack-ea2011-capacity",
      "value": "573",
      "unit": "items",
      "quantity": "reported surveyed item count",
      "subject": "LDPE carrier bags surveyed",
      "basis": "AnnexB.2 printed79; underlying surveyed counts; distinct from applied rounded Table3.1 capacity"
    },
    "ldpeObservedBags": {
      "evidenceId": "ev-pack-ea-capacity",
      "factId": "ldpe-observedbags",
      "passageId": "psg-pack-ea2011-capacity",
      "value": "72",
      "unit": "bags",
      "quantity": "reported surveyed bag count",
      "subject": "LDPE carrier bags surveyed",
      "basis": "AnnexB.2 printed79; underlying surveyed counts; distinct from applied rounded Table3.1 capacity"
    },
    "reusedBagPercent": {
      "evidenceId": "ev-pack-ea-secondary",
      "factId": "bags-reused",
      "passageId": "psg-pack-ea2011-secondary",
      "value": "76",
      "unit": "percent",
      "quantity": "estimated share of bags reused",
      "subject": "single-use carrier bags",
      "basis": "Section4.4 printed30; report estimate from WRAP2005 usage study"
    },
    "kitchenRespondentPercent": {
      "evidenceId": "ev-pack-ea-secondary",
      "factId": "kitchen-respondents",
      "passageId": "psg-pack-ea2011-secondary",
      "value": "53",
      "unit": "percent",
      "quantity": "respondent incidence of kitchen-bin-liner use",
      "subject": "all surveyed WRAP respondents (1048), multiple-response kitchen-liner incidence",
      "basis": "Section4.4 Table4.5 printed30; respondent share; not a directly observed bag replacement probability"
    },
    "binLinerMass": {
      "evidenceId": "ev-pack-ea-secondary",
      "factId": "liner-mass",
      "passageId": "psg-pack-ea2011-secondary",
      "value": "9.3",
      "unit": "g/liner",
      "quantity": "average bin liner mass",
      "subject": "HDPE bin liner",
      "basis": "Section4.4 printed31; displayed average"
    },
    "binLinerVolume": {
      "evidenceId": "ev-pack-ea-secondary",
      "factId": "liner-volume",
      "passageId": "psg-pack-ea2011-secondary",
      "value": "29.3",
      "unit": "L/liner",
      "quantity": "average bin liner volume",
      "subject": "HDPE bin liner",
      "basis": "Section4.4 printed31; displayed average"
    },
    "reportedAvoidedMass": {
      "evidenceId": "ev-pack-ea-secondary",
      "factId": "avoided-mass",
      "passageId": "psg-pack-ea2011-secondary",
      "value": "6.1",
      "unit": "g/reused-bag",
      "quantity": "reported avoided bin liner mass",
      "subject": "19.1L lightweight carrier bag",
      "basis": "Section4.4 printed31; per bag secondarily reused; displayed rounded credit"
    },
    "reportedReusePercent": {
      "evidenceId": "ev-pack-ea-sensitivity",
      "factId": "reuse-percent",
      "passageId": "psg-pack-ea2011-sensitivity",
      "value": "40.28",
      "unit": "percent",
      "quantity": "reported secondary-use scenario share",
      "subject": "HDPE carrier bags replacing bin liners",
      "basis": "Table6.1 printed46; section text rounds to40.3percent"
    },
    "gwpNoCredit": {
      "evidenceId": "ev-pack-ea-sensitivity",
      "factId": "gwp-zero",
      "passageId": "psg-pack-ea2011-sensitivity",
      "value": "2.082",
      "unit": "kg CO2 eq/service",
      "quantity": "reported global warming potential",
      "subject": "HDPE with no secondary use",
      "basis": "Table6.1 printed46; per483-item reference service; displayed total"
    },
    "gwpReportedCredit": {
      "evidenceId": "ev-pack-ea-sensitivity",
      "factId": "gwp-reported",
      "passageId": "psg-pack-ea2011-sensitivity",
      "value": "1.578",
      "unit": "kg CO2 eq/service",
      "quantity": "reported global warming potential",
      "subject": "HDPE with40.28percent secondary use",
      "basis": "Table6.1 printed46; per483-item reference service; displayed total"
    },
    "gwpFullCredit": {
      "evidenceId": "ev-pack-ea-sensitivity",
      "factId": "gwp-full",
      "passageId": "psg-pack-ea2011-sensitivity",
      "value": "0.830",
      "unit": "kg CO2 eq/service",
      "quantity": "reported global warming potential",
      "subject": "HDPE with100percent secondary use",
      "basis": "Table6.1 printed46; per483-item reference service; displayed total"
    },
    "ldpePrimaryUses": {
      "evidenceId": "ev-pack-ea-ldpe-impacts",
      "factId": "primary-uses",
      "passageId": "psg-pack-ea2011-ldpe-impacts",
      "value": "5",
      "unit": "total primary uses",
      "quantity": "reported total shopping uses",
      "subject": "LDPE carrier bag",
      "basis": "Table5.5 printed41; used5times column; includes initial use"
    },
    "hdpeThreeUses": {
      "evidenceId": "ev-pack-ea-thresholds",
      "factId": "hdpe-three-uses",
      "passageId": "psg-pack-ea2011-thresholds",
      "value": "3",
      "unit": "total primary uses",
      "quantity": "reported comparison header use count",
      "subject": "HDPE carrier bag",
      "basis": "Table8.1 printed61; final header only states Used3times; secondary-use context not explicitly labeled"
    },
    "ldpeNoCreditUses": {
      "evidenceId": "ev-pack-ea-thresholds",
      "factId": "ldpe-zero",
      "passageId": "psg-pack-ea2011-thresholds",
      "value": "4",
      "unit": "total primary uses",
      "quantity": "source-reported primary-use threshold",
      "subject": "LDPE vs HDPE with no secondary reuse",
      "basis": "Table8.1 printed61; displayed count retained separately from strict arithmetic reconstruction"
    },
    "ldpeReportedCreditUses": {
      "evidenceId": "ev-pack-ea-thresholds",
      "factId": "ldpe-reported",
      "passageId": "psg-pack-ea2011-thresholds",
      "value": "5",
      "unit": "total primary uses",
      "quantity": "source-reported primary-use threshold",
      "subject": "LDPE vs HDPE with40.3percent bin-liner reuse",
      "basis": "Table8.1 printed61; displayed count retained separately from strict arithmetic reconstruction"
    },
    "ldpeFullCreditUses": {
      "evidenceId": "ev-pack-ea-thresholds",
      "factId": "ldpe-full",
      "passageId": "psg-pack-ea2011-thresholds",
      "value": "9",
      "unit": "total primary uses",
      "quantity": "source-reported primary-use threshold",
      "subject": "LDPE vs HDPE with100percent bin-liner reuse",
      "basis": "Table8.1 printed61; displayed count retained separately from strict arithmetic reconstruction"
    },
    "ldpeThreeUsesReported": {
      "evidenceId": "ev-pack-ea-thresholds",
      "factId": "ldpe-three",
      "passageId": "psg-pack-ea2011-thresholds",
      "value": "12",
      "unit": "total primary uses",
      "quantity": "source-reported primary-use threshold",
      "subject": "LDPE vs HDPE used3times",
      "basis": "Table8.1 printed61; displayed count retained separately from strict arithmetic reconstruction"
    },
    "cottonFullCreditUses": {
      "evidenceId": "ev-pack-ea-thresholds",
      "factId": "cotton-full",
      "passageId": "psg-pack-ea2011-thresholds",
      "value": "327",
      "unit": "total primary uses",
      "quantity": "source-reported primary-use threshold",
      "subject": "cotton vs HDPE with100percent bin-liner reuse",
      "basis": "Table8.1 printed61; displayed count retained separately from strict arithmetic reconstruction"
    },
    "cottonGwp": {
      "evidenceId": "ev-pack-ea-cotton",
      "factId": "cotton-gwp",
      "passageId": "psg-pack-ea2011-cotton",
      "value": "271.533",
      "unit": "kg CO2 eq/service",
      "quantity": "reported global warming potential",
      "subject": "cotton carrier bag without primary reuse",
      "basis": "Table5.9 printed44; no-reuse total for483-item reference service"
    },
    "hdpe_gwp": {
      "evidenceId": "ev-pack-ea-hdpe-impacts",
      "factId": "hdpe-gwp",
      "passageId": "psg-pack-ea2011-hdpe-impacts",
      "value": "1.578",
      "unit": "kg CO2 eq/service",
      "quantity": "Global warming potential",
      "subject": "HDPE carrier bag",
      "basis": "Table5.1 printed36; original secondary-use scenario; per483-item reference service"
    },
    "ldpe_gwp": {
      "evidenceId": "ev-pack-ea-ldpe-impacts",
      "factId": "ldpe-gwp",
      "passageId": "psg-pack-ea2011-ldpe-impacts",
      "value": "6.924",
      "unit": "kg CO2 eq/service",
      "quantity": "Global warming potential",
      "subject": "LDPE carrier bag without primary reuse",
      "basis": "Table5.5 printed41; no-reuse column; per483-item reference service"
    },
    "ldpe5_gwp": {
      "evidenceId": "ev-pack-ea-ldpe-impacts",
      "factId": "ldpe5-gwp",
      "passageId": "psg-pack-ea2011-ldpe-impacts",
      "value": "1.385",
      "unit": "kg CO2 eq/service",
      "quantity": "Global warming potential",
      "subject": "LDPE carrier bag used5times",
      "basis": "Table5.5 printed41; used5times column; per483-item reference service; displayed rounded total"
    },
    "hdpe_abiotic": {
      "evidenceId": "ev-pack-ea-hdpe-impacts",
      "factId": "hdpe-abiotic",
      "passageId": "psg-pack-ea2011-hdpe-impacts",
      "value": "16.227",
      "unit": "g Sb eq/service",
      "quantity": "Abiotic depletion",
      "subject": "HDPE carrier bag",
      "basis": "Table5.1 printed36; original secondary-use scenario; per483-item reference service"
    },
    "ldpe_abiotic": {
      "evidenceId": "ev-pack-ea-ldpe-impacts",
      "factId": "ldpe-abiotic",
      "passageId": "psg-pack-ea2011-ldpe-impacts",
      "value": "82.711",
      "unit": "g Sb eq/service",
      "quantity": "Abiotic depletion",
      "subject": "LDPE carrier bag without primary reuse",
      "basis": "Table5.5 printed41; no-reuse column; per483-item reference service"
    },
    "ldpe5_abiotic": {
      "evidenceId": "ev-pack-ea-ldpe-impacts",
      "factId": "ldpe5-abiotic",
      "passageId": "psg-pack-ea2011-ldpe-impacts",
      "value": "16.542",
      "unit": "g Sb eq/service",
      "quantity": "Abiotic depletion",
      "subject": "LDPE carrier bag used5times",
      "basis": "Table5.5 printed41; used5times column; per483-item reference service; displayed rounded total"
    },
    "hdpe_acidification": {
      "evidenceId": "ev-pack-ea-hdpe-impacts",
      "factId": "hdpe-acidification",
      "passageId": "psg-pack-ea2011-hdpe-impacts",
      "value": "11.399",
      "unit": "g SO2 eq/service",
      "quantity": "Acidification",
      "subject": "HDPE carrier bag",
      "basis": "Table5.1 printed36; original secondary-use scenario; per483-item reference service"
    },
    "ldpe_acidification": {
      "evidenceId": "ev-pack-ea-ldpe-impacts",
      "factId": "ldpe-acidification",
      "passageId": "psg-pack-ea2011-ldpe-impacts",
      "value": "29.340",
      "unit": "g SO2 eq/service",
      "quantity": "Acidification",
      "subject": "LDPE carrier bag without primary reuse",
      "basis": "Table5.5 printed41; no-reuse column; per483-item reference service"
    },
    "ldpe5_acidification": {
      "evidenceId": "ev-pack-ea-ldpe-impacts",
      "factId": "ldpe5-acidification",
      "passageId": "psg-pack-ea2011-ldpe-impacts",
      "value": "5.868",
      "unit": "g SO2 eq/service",
      "quantity": "Acidification",
      "subject": "LDPE carrier bag used5times",
      "basis": "Table5.5 printed41; used5times column; per483-item reference service; displayed rounded total"
    },
    "hdpe_eutrophication": {
      "evidenceId": "ev-pack-ea-hdpe-impacts",
      "factId": "hdpe-eutrophication",
      "passageId": "psg-pack-ea2011-hdpe-impacts",
      "value": "0.775",
      "unit": "g PO4--- eq/service",
      "quantity": "Eutrophication",
      "subject": "HDPE carrier bag",
      "basis": "Table5.1 printed36; original secondary-use scenario; per483-item reference service"
    },
    "ldpe_eutrophication": {
      "evidenceId": "ev-pack-ea-ldpe-impacts",
      "factId": "ldpe-eutrophication",
      "passageId": "psg-pack-ea2011-ldpe-impacts",
      "value": "2.576",
      "unit": "g PO4--- eq/service",
      "quantity": "Eutrophication",
      "subject": "LDPE carrier bag without primary reuse",
      "basis": "Table5.5 printed41; no-reuse column; per483-item reference service"
    },
    "ldpe5_eutrophication": {
      "evidenceId": "ev-pack-ea-ldpe-impacts",
      "factId": "ldpe5-eutrophication",
      "passageId": "psg-pack-ea2011-ldpe-impacts",
      "value": "0.515",
      "unit": "g PO4--- eq/service",
      "quantity": "Eutrophication",
      "subject": "LDPE carrier bag used5times",
      "basis": "Table5.5 printed41; used5times column; per483-item reference service; displayed rounded total"
    },
    "hdpe_humanToxicity": {
      "evidenceId": "ev-pack-ea-hdpe-impacts",
      "factId": "hdpe-humantoxicity",
      "passageId": "psg-pack-ea2011-hdpe-impacts",
      "value": "0.211",
      "unit": "kg 1,4-DB eq/service",
      "quantity": "Human toxicity",
      "subject": "HDPE carrier bag",
      "basis": "Table5.1 printed36; original secondary-use scenario; per483-item reference service"
    },
    "ldpe_humanToxicity": {
      "evidenceId": "ev-pack-ea-ldpe-impacts",
      "factId": "ldpe-humantoxicity",
      "passageId": "psg-pack-ea2011-ldpe-impacts",
      "value": "0.701",
      "unit": "kg 1,4-DB eq/service",
      "quantity": "Human toxicity",
      "subject": "LDPE carrier bag without primary reuse",
      "basis": "Table5.5 printed41; no-reuse column; per483-item reference service"
    },
    "ldpe5_humanToxicity": {
      "evidenceId": "ev-pack-ea-ldpe-impacts",
      "factId": "ldpe5-humantoxicity",
      "passageId": "psg-pack-ea2011-ldpe-impacts",
      "value": "0.140",
      "unit": "kg 1,4-DB eq/service",
      "quantity": "Human toxicity",
      "subject": "LDPE carrier bag used5times",
      "basis": "Table5.5 printed41; used5times column; per483-item reference service; displayed rounded total"
    },
    "hdpe_freshwaterEcotoxicity": {
      "evidenceId": "ev-pack-ea-hdpe-impacts",
      "factId": "hdpe-freshwaterecotoxicity",
      "passageId": "psg-pack-ea2011-hdpe-impacts",
      "value": "66.880",
      "unit": "g 1,4-DB eq/service",
      "quantity": "Fresh water aquatic ecotox.",
      "subject": "HDPE carrier bag",
      "basis": "Table5.1 printed36; original secondary-use scenario; per483-item reference service"
    },
    "ldpe_freshwaterEcotoxicity": {
      "evidenceId": "ev-pack-ea-ldpe-impacts",
      "factId": "ldpe-freshwaterecotoxicity",
      "passageId": "psg-pack-ea2011-ldpe-impacts",
      "value": "186.726",
      "unit": "g 1,4-DB eq/service",
      "quantity": "Fresh water aquatic ecotox.",
      "subject": "LDPE carrier bag without primary reuse",
      "basis": "Table5.5 printed41; no-reuse column; per483-item reference service"
    },
    "ldpe5_freshwaterEcotoxicity": {
      "evidenceId": "ev-pack-ea-ldpe-impacts",
      "factId": "ldpe5-freshwaterecotoxicity",
      "passageId": "psg-pack-ea2011-ldpe-impacts",
      "value": "37.345",
      "unit": "g 1,4-DB eq/service",
      "quantity": "Fresh water aquatic ecotox.",
      "subject": "LDPE carrier bag used5times",
      "basis": "Table5.5 printed41; used5times column; per483-item reference service; displayed rounded total"
    },
    "hdpe_marineEcotoxicity": {
      "evidenceId": "ev-pack-ea-hdpe-impacts",
      "factId": "hdpe-marineecotoxicity",
      "passageId": "psg-pack-ea2011-hdpe-impacts",
      "value": "126.475",
      "unit": "kg 1,4-DB eq/service",
      "quantity": "Marine aquatic ecotoxicity",
      "subject": "HDPE carrier bag",
      "basis": "Table5.1 printed36; original secondary-use scenario; per483-item reference service"
    },
    "ldpe_marineEcotoxicity": {
      "evidenceId": "ev-pack-ea-ldpe-impacts",
      "factId": "ldpe-marineecotoxicity",
      "passageId": "psg-pack-ea2011-ldpe-impacts",
      "value": "311.810",
      "unit": "kg 1,4-DB eq/service",
      "quantity": "Marine aquatic ecotoxicity",
      "subject": "LDPE carrier bag without primary reuse",
      "basis": "Table5.5 printed41; no-reuse column; per483-item reference service"
    },
    "ldpe5_marineEcotoxicity": {
      "evidenceId": "ev-pack-ea-ldpe-impacts",
      "factId": "ldpe5-marineecotoxicity",
      "passageId": "psg-pack-ea2011-ldpe-impacts",
      "value": "62.362",
      "unit": "kg 1,4-DB eq/service",
      "quantity": "Marine aquatic ecotoxicity",
      "subject": "LDPE carrier bag used5times",
      "basis": "Table5.5 printed41; used5times column; per483-item reference service; displayed rounded total"
    },
    "hdpe_terrestrialEcotoxicity": {
      "evidenceId": "ev-pack-ea-hdpe-impacts",
      "factId": "hdpe-terrestrialecotoxicity",
      "passageId": "psg-pack-ea2011-hdpe-impacts",
      "value": "1.690",
      "unit": "g 1,4-DB eq/service",
      "quantity": "Terrestrial ecotoxicity",
      "subject": "HDPE carrier bag",
      "basis": "Table5.1 printed36; original secondary-use scenario; per483-item reference service"
    },
    "ldpe_terrestrialEcotoxicity": {
      "evidenceId": "ev-pack-ea-ldpe-impacts",
      "factId": "ldpe-terrestrialecotoxicity",
      "passageId": "psg-pack-ea2011-ldpe-impacts",
      "value": "7.323",
      "unit": "g 1,4-DB eq/service",
      "quantity": "Terrestrial ecotoxicity",
      "subject": "LDPE carrier bag without primary reuse",
      "basis": "Table5.5 printed41; no-reuse column; per483-item reference service"
    },
    "ldpe5_terrestrialEcotoxicity": {
      "evidenceId": "ev-pack-ea-ldpe-impacts",
      "factId": "ldpe5-terrestrialecotoxicity",
      "passageId": "psg-pack-ea2011-ldpe-impacts",
      "value": "1.465",
      "unit": "g 1,4-DB eq/service",
      "quantity": "Terrestrial ecotoxicity",
      "subject": "LDPE carrier bag used5times",
      "basis": "Table5.5 printed41; used5times column; per483-item reference service; displayed rounded total"
    },
    "hdpe_photochemical": {
      "evidenceId": "ev-pack-ea-hdpe-impacts",
      "factId": "hdpe-photochemical",
      "passageId": "psg-pack-ea2011-hdpe-impacts",
      "value": "0.531",
      "unit": "g C2H4/service",
      "quantity": "Photochemical oxidation",
      "subject": "HDPE carrier bag",
      "basis": "Table5.1 printed36; original secondary-use scenario; per483-item reference service"
    },
    "ldpe_photochemical": {
      "evidenceId": "ev-pack-ea-ldpe-impacts",
      "factId": "ldpe-photochemical",
      "passageId": "psg-pack-ea2011-ldpe-impacts",
      "value": "1.391",
      "unit": "g C2H4/service",
      "quantity": "Photochemical oxidation",
      "subject": "LDPE carrier bag without primary reuse",
      "basis": "Table5.5 printed41; no-reuse column; per483-item reference service"
    },
    "ldpe5_photochemical": {
      "evidenceId": "ev-pack-ea-ldpe-impacts",
      "factId": "ldpe5-photochemical",
      "passageId": "psg-pack-ea2011-ldpe-impacts",
      "value": "0.278",
      "unit": "g C2H4/service",
      "quantity": "Photochemical oxidation",
      "subject": "LDPE carrier bag used5times",
      "basis": "Table5.5 printed41; used5times column; per483-item reference service; displayed rounded total"
    }
  },
  "interpretation": {
    "totalUsesIncludeInitialUse": true,
    "printedDecimalsAreExactArithmeticInputs": true,
    "referenceFlowMassesKeptSeparate": true,
    "creditRelationship": "endpoint-defined interpolation of published aggregate outcomes",
    "binLinerShare": "report multiplication of estimated bag reuse share and respondent use incidence",
    "threeUseScenario": "author-specified HDPE3total-primary-uses plus reported40.28percent secondary credit",
    "fourthTableHeader": "HDPE bag (Used 3 times)",
    "fourthTableSecondaryCreditSpecified": false,
    "sourceDiscrepanciesRepaired": false,
    "roundingEstablishedAsDiscrepancyCause": false,
    "originalProcessModelReproduced": false,
    "rawSurveyReproduced": false,
    "unreportedPrecisionRecovered": false,
    "scientificApproval": false,
    "humanExpertApproval": false,
    "currentProductRecommendation": false,
    "uncertaintyPropagated": false
  }
};
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
function freeze(value) {
  if (value !== null && typeof value === 'object') {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}
freeze(reviewed);
function shapeOf(value) {
  return object(value)
    ? Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, shapeOf(nested)]))
    : null;
}
export const packStudyInputShape = freeze(shapeOf(reviewed));
export const packStudyFactKeys = Object.freeze(Object.keys(reviewed.facts));

export function validatePackStudyCase(spec) {
  const errors = [];
  function check(actual, expected, path) {
    if (!object(expected)) {
      if (actual !== expected) errors.push(`${path}: expected reviewed value ${JSON.stringify(expected)}`);
      return;
    }
    if (!object(actual)) { errors.push(`${path}: must be an object`); return; }
    const actualKeys = Object.keys(actual).sort();
    const expectedKeys = Object.keys(expected).sort();
    if (actualKeys.length !== expectedKeys.length || actualKeys.some((key, index) => key !== expectedKeys[index]))
      errors.push(`${path}: must contain exactly the reviewed fields ${expectedKeys.join(', ')}`);
    for (const key of expectedKeys) check(actual[key], expected[key], `${path}.${key}`);
  }
  check(spec, reviewed, 'case');
  return errors;
}

const one = rational(1n);
const hundred = rational(100n);
const lessThan = (left, right) => left[0] * right[1] < right[0] * left[1];
/** Positive burdens and baseline; n includes the initial use, and equality fails. */
export function strictPrimaryUseThreshold(burden, baseline) {
  const burdenValue = decimal(burden);
  const baselineValue = decimal(baseline);
  if (burdenValue[0] <= 0n || baselineValue[0] <= 0n) throw new TypeError('Positive burden and baseline required');
  return threshold(burdenValue, baselineValue);
}
function threshold(burden, baseline) {
  const ratio = divide(burden, baseline);
  const total = ratio[0] / ratio[1] + 1n;
  return {
    burdenToBaselineRatio: result(ratio),
    minimumTotalUses: String(total),
    additionalReuses: String(total - 1n),
    burdenAtMinimum: result(divide(burden, rational(total))),
    strictlyLowerAtMinimum: lessThan(divide(burden, rational(total)), baseline),
    previousTotalUses: String(total - 1n),
    previousIsStrictlyLower: total > 1n && lessThan(divide(burden, rational(total - 1n)), baseline),
    rule: 'minimum integer n with B/n < D; total uses include first use',
  };
}
const categoryKeys = Object.freeze(['gwp', 'abiotic', 'acidification', 'eutrophication', 'humanToxicity',
  'freshwaterEcotoxicity', 'marineEcotoxicity', 'terrestrialEcotoxicity', 'photochemical']);

/** Displayed source arithmetic only: no native upstream model or raw survey. */
export function evaluatePackStudyCase(spec) {
  const errors = validatePackStudyCase(spec);
  if (errors.length) throw new TypeError(`Invalid pack-study case:\n${errors.join('\n')}`);
  const fact = key => decimal(spec.facts[key].value);
  const serviceItems = fact('serviceItems');
  const service = {};
  for (const bag of ['hdpe', 'ldpe']) {
    const recomputedFlow = divide(serviceItems, fact(`${bag}Items`));
    const printedFlow = fact(`${bag}ReferenceFlow`);
    const observedCapacity = divide(fact(`${bag}ObservedItems`), fact(`${bag}ObservedBags`));
    service[bag] = {
      reportedReferenceFlow: result(printedFlow),
      referenceFlowFromAppliedCapacity: result(recomputedFlow),
      appliedFlowMinusReportedFlow: result(subtract(recomputedFlow, printedFlow)),
      gramsFromPrintedFlowAndMass: result(multiply(printedFlow, fact(`${bag}Mass`))),
      gramsFromRecomputedFlowAndPrintedMass: result(multiply(recomputedFlow, fact(`${bag}Mass`))),
      massUnit: 'g/service',
      observedCountRatioItemsPerBag: result(observedCapacity),
      serviceFlowFromObservedCountRatio: result(divide(serviceItems, observedCapacity)),
      observedCountRatioReplacesAppliedCapacity: false,
    };
  }

  const reusedShare = divide(fact('reusedBagPercent'), hundred);
  const kitchenRespondentShare = divide(fact('kitchenRespondentPercent'), hundred);
  const reportMultipliedShare = multiply(reusedShare, kitchenRespondentShare);
  const reportScenarioShare = divide(fact('reportedReusePercent'), hundred);
  const avoidedMass = multiply(divide(fact('binLinerMass'), fact('binLinerVolume')), fact('hdpeVolume'));
  const noCreditBaseline = fact('gwpNoCredit');
  const fullCreditBaseline = fact('gwpFullCredit');
  const reportedCreditBaseline = fact('gwpReportedCredit');
  const creditSlope = subtract(noCreditBaseline, fullCreditBaseline);
  const interpolated = subtract(noCreditBaseline, multiply(creditSlope, reportMultipliedShare));
  const secondaryReuse = {
    estimatedReusedBagShare: result(reusedShare), kitchenRespondentShare: result(kitchenRespondentShare),
    reportMultiplication: result(reportMultipliedShare), reportedScenarioShare: result(reportScenarioShare),
    multiplicationMinusReportedShare: result(subtract(reportMultipliedShare, reportScenarioShare)),
    avoidedGramsPerSecondarilyReusedBag: result(avoidedMass),
    sourceReportedAvoidedGrams: result(fact('reportedAvoidedMass')),
    calculatedMinusReportedAvoidedGrams: result(subtract(avoidedMass, fact('reportedAvoidedMass'))),
    directBagLevelReplacementProbabilityObserved: false,
  };
  const creditInterpolation = {
    formula: 'D(r)=2.082-(2.082-0.830)*r', unit: 'kg CO2 eq/service',
    endpointNoCredit: result(noCreditBaseline), endpointFullCredit: result(fullCreditBaseline), endpointDifference: result(creditSlope),
    atReportMultipliedShare: result(interpolated), sourceReportedMiddle: result(reportedCreditBaseline),
    interpolatedMinusReportedMiddle: result(subtract(interpolated, reportedCreditBaseline)),
    interpolatedMiddleRounded3: fixed(interpolated, 3),
    status: 'interpolation of displayed aggregate outputs; not an upstream process-model reconstruction',
    nativeProcessModelReproduced: false,
  };

  const ldpeBurden = fact('ldpe_gwp');
  const thresholds = { ldpe: {} };
  for (const [scenario, baseline, reportedKey] of [
    ['noCredit', noCreditBaseline, 'ldpeNoCreditUses'], ['reportedCredit', reportedCreditBaseline, 'ldpeReportedCreditUses'],
    ['fullCredit', fullCreditBaseline, 'ldpeFullCreditUses'],
  ]) {
    const calculated = threshold(ldpeBurden, baseline);
    const reported = spec.facts[reportedKey].value;
    thresholds.ldpe[scenario] = { ...calculated, baseline: result(baseline), sourceReportedTotalUses: reported,
      matchesSourceReported: calculated.minimumTotalUses === reported };
  }
  const threeUseBaseline = divide(reportedCreditBaseline, fact('hdpeThreeUses'));
  const threeUseCalculated = threshold(ldpeBurden, threeUseBaseline);
  const sourceFourthCount = fact('ldpeThreeUsesReported');
  const threeUseComparison = {
    condition: spec.interpretation.threeUseScenario,
    baseline: result(threeUseBaseline), ...threeUseCalculated,
    sourceTableFourthColumnHeader: spec.interpretation.fourthTableHeader,
    sourceTableFourthColumnTotalUses: spec.facts.ldpeThreeUsesReported.value,
    sourceTableFourthColumnBurden: result(divide(ldpeBurden, sourceFourthCount)),
    sourceFourthCountIsStrictlyLowerUnderDeclaredCondition: lessThan(divide(ldpeBurden, sourceFourthCount), threeUseBaseline),
    sourceFourthColumnSecondaryCreditExplicit: false,
    sourceHeaderContextRepaired: false,
  };
  const cottonBurden = fact('cottonGwp');
  const sourceCottonCount = fact('cottonFullCreditUses');
  const cottonCalculated = threshold(cottonBurden, fullCreditBaseline);
  thresholds.cottonFullCredit = {
    ...cottonCalculated, baseline: result(fullCreditBaseline), sourceReportedTotalUses: spec.facts.cottonFullCreditUses.value,
    matchesSourceReported: cottonCalculated.minimumTotalUses === spec.facts.cottonFullCreditUses.value,
    burdenAtSourceReportedCount: result(divide(cottonBurden, sourceCottonCount)),
    sourceReportedCountIsStrictlyLower: lessThan(divide(cottonBurden, sourceCottonCount), fullCreditBaseline),
    discrepancyCauseEstablished: false, sourceCountRepaired: false,
  };

  const categories = {};
  for (const key of categoryKeys) {
    const hdpe = fact(`hdpe_${key}`);
    const ldpe = fact(`ldpe_${key}`);
    const printedFiveUse = fact(`ldpe5_${key}`);
    const calculatedFiveUse = divide(ldpe, fact('ldpePrimaryUses'));
    const exactRatio = divide(calculatedFiveUse, hdpe);
    const reportedRatio = divide(printedFiveUse, hdpe);
    categories[key] = {
      label: spec.facts[`hdpe_${key}`].quantity, unit: spec.facts[`hdpe_${key}`].unit,
      hdpeReported: result(hdpe), ldpeNoReuseReported: result(ldpe),
      ldpeAtFiveUsesCalculated: result(calculatedFiveUse), ldpeAtFiveUsesReported: result(printedFiveUse),
      calculatedMinusReportedFiveUse: result(subtract(calculatedFiveUse, printedFiveUse)),
      calculatedFiveUseToHdpeRatio: result(exactRatio), reportedFiveUseToHdpeRatio: result(reportedRatio),
      calculatedFiveUsePercentChange: result(multiply(subtract(exactRatio, one), hundred)),
      reportedFiveUsePercentChange: result(multiply(subtract(reportedRatio, one), hundred)),
      calculatedFiveUseStrictlyLower: lessThan(calculatedFiveUse, hdpe), reportedFiveUseStrictlyLower: lessThan(printedFiveUse, hdpe),
      strictThresholdFromNoReuse: threshold(ldpe, hdpe),
    };
  }
  return {
    service,
    secondaryReuse,
    creditInterpolation,
    thresholds,
    threeUseComparison,
    categoryComparison: {
      totalCategories: String(categoryKeys.length),
      primaryUses: spec.facts.ldpePrimaryUses.value,
      lowerCategoriesFromCalculatedDivision: String(Object.values(categories).filter(row => row.calculatedFiveUseStrictlyLower).length),
      lowerCategoriesFromPrintedFiveUseColumn: String(Object.values(categories).filter(row => row.reportedFiveUseStrictlyLower).length),
      allCategoriesLower: Object.values(categories).every(row => row.calculatedFiveUseStrictlyLower),
      categories,
      carbonThresholdGuaranteesAllCategoriesLower: false,
    },
    originalProcessModelReproduced: false,
    rawSurveyReproduced: false,
    unreportedPrecisionRecovered: false,
    scientificApproval: false,
    humanExpertApproval: false,
    currentProductRecommendation: false,
  };
}

// Each actual passage must include the numerical source page; a wider inspected
// explanatory scope does not change which table page supplies the selected facts.
const approvedPages = freeze(Object.fromEntries([
  ['flow', '17–18', [16, 17]], ['capacity', '79', [78]], ['secondary', '30–31', [29, 30]],
  ['hdpe-impacts', '36', [35]], ['ldpe-impacts', '41', [40]], ['sensitivity', '46', [45]],
  ['cotton', '44', [43]], ['thresholds', '61', [60]],
].map(([id, printedPages, pdfIndices]) => [`psg-pack-ea2011-${id}`, { printedPages, pdfIndices }])));
function indexRecords(records, label, errors, identities = new Set()) {
  const index = new Map();
  for (const record of records) {
    if (!object(record) || typeof record.id !== 'string' || !/^[A-Za-z][A-Za-z0-9._:-]*$/.test(record.id)
        || identities.has(record.id)) { errors.push(`pack study: ambiguous or malformed ${label} identity`); continue; }
    identities.add(record.id); index.set(record.id, record);
  }
  return index;
}
/** Exact numerical tuple plus actual work/edition/page/PDF consistency. */
export function validatePackStudyFacts(spec, published, context = {}) {
  const errors = validatePackStudyCase(spec);
  if (errors.length) return errors;
  if (!object(published) || !Array.isArray(published.sources) || !Array.isArray(published.evidence))
    return ['pack study: public source/evidence closure is required'];
  const sourceIndex = indexRecords(published.sources, 'source', errors);
  const evidenceIndex = indexRecords(published.evidence, 'evidence', errors);
  const register = context?.readingRegister;
  if (!object(register) || register.schemaVersion !== 1 || !Array.isArray(register.readings))
    return [...errors, 'pack study: actual reading register is required'];
  const identities = new Set();
  const readings = indexRecords(register.readings, 'reading', errors, identities);
  const passages = new Map();
  const artifacts = new Map();
  for (const reading of readings.values()) {
    if (!Array.isArray(reading.passages) || !Array.isArray(reading.artifacts)) {
      errors.push('pack study: actual passage and artifact arrays required'); continue;
    }
    for (const [id, passage] of indexRecords(reading.passages, 'passage', errors, identities)) passages.set(id, { reading, passage });
    for (const [id, artifact] of indexRecords(reading.artifacts, 'artifact', errors, identities)) artifacts.set(id, { reading, artifact });
  }
  const selected = spec.source;
  const source = sourceIndex.get(selected.sourceId);
  const reading = readings.get(selected.readingId);
  if (source?.version !== selected.version || reading?.version !== selected.version || reading?.workId !== selected.workId)
    errors.push('pack study: approved edition and work identity required');
  if (!source || !['public-passages-inspected', 'public-full-text-inspected', 'licensed-full-text-inspected'].includes(source.accessStatus)
      || source.reading?.readingId !== selected.readingId || source.reading?.status !== 'selected-passages'
      || typeof source.reading?.scope !== 'string' || !source.reading.scope.trim() || reading?.readingStatus !== 'selected-passages')
    errors.push('pack study: actual inspected selected reading and scope required');
  if (source?.artifact?.mediaType !== 'application/pdf' || source.artifact.sha256 !== selected.sha256)
    errors.push('pack study: fixed original PDF source snapshot required');
  for (const [key, input] of Object.entries(spec.facts)) {
    const evidence = evidenceIndex.get(input.evidenceId);
    const facts = Array.isArray(evidence?.numericFacts) ? evidence.numericFacts : [];
    const matching = facts.filter(fact => fact?.id === input.factId);
    if (!evidence || evidence.sourceId !== selected.sourceId || evidence.numericFact !== undefined || matching.length !== 1
        || facts.some(fact => typeof fact?.id !== 'string' || !fact.id) || new Set(facts.map(fact => fact?.id)).size !== facts.length
        || !['value', 'unit', 'quantity', 'subject', 'basis'].every(field => matching[0]?.[field] === input[field]))
      errors.push(`pack study.facts.${key}: exact public numeric fact identity/value/unit/quantity/subject/basis required`);
    const located = passages.get(input.passageId);
    const carrier = artifacts.get(located?.passage.artifactId);
    if (!reading || evidence?.readingId !== selected.readingId || evidence?.passageId !== input.passageId
        || located?.reading !== reading || carrier?.reading !== reading || located?.passage.artifactId !== selected.artifactId
        || carrier?.artifact.id !== selected.artifactId || ![undefined, 'retrieved'].includes(carrier?.artifact.kind)
        || carrier?.artifact.mediaType !== 'application/pdf' || carrier?.artifact.sha256 !== selected.sha256)
      errors.push(`pack study.facts.${key}: exact inspected reading/passage/original PDF carrier required`);
    const pages = approvedPages[input.passageId];
    if (typeof located?.passage.printedPages !== 'string' || !located.passage.printedPages.trim()
        || !Array.isArray(located?.passage.pdfIndices)
        || !pages.pdfIndices.every(index => located.passage.pdfIndices.includes(index)))
      errors.push(`pack study.facts.${key}: actual passage must include the approved numerical PDF page index (${pages.printedPages} printed)`);
  }
  return errors;
}
