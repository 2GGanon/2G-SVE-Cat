const DATA_URL = "./data/shadowverse-evolve-card-catalog.csv";
const CARD_TYPE_URL = "./data/shadowverse-cardtype-cache.json";
const EMBEDDED_CSV_DATA = typeof window !== "undefined" ? window.SVE_CSV_DATA : null;
const EMBEDDED_CARDTYPE_DATA = typeof window !== "undefined" ? window.SVE_CARDTYPE_DATA : null;
const STORAGE_KEY = "sve_collection_v1";
const CARD_ART_ROOT = "./assets/cards";
const PROMO_MERGED_SET_CODES = new Set(["PR", "BSF2024", "BSF2025", "NY2024"]);
const PROMO_FRONT_ORDER = { BSF2024: 0, BSF2025: 1, NY2024: 2 };
const DUAL_SIDE_GROUPS = [
  ["BP08-003EN", "BP08-003_URAEN"],
  ["BP08-SL03EN", "BP08-SL03_URAEN"],
  ["BP09-SL20EN", "BP09-SL20EN_URA"],
  ["BP09-SL05EN", "BP09-SL05EN_URA"],
  ["BP09-P41EN", "BP09-P41EN_URA"],
  ["BP09-P24EN", "BP09-P24EN_URA"],
  ["BP09-P02EN", "BP09-P02EN_URA"],
  ["BP09-110EN", "BP09-110EN_URA"],
  ["BP09-090EN", "BP09-090EN_URA"],
  ["BP09-069EN", "BP09-069EN_URA"],
  ["BP09-042EN", "BP09-042EN_URA"],
  ["BP09-019EN", "BP09-019EN_URA"],
  ["BP09-005EN", "BP09-005EN_URA"],
  ["BP09-P12EN", "BP09-P12EN_URA"],
];
const ONE_COPY_SET_CODES = new Set(["GFB01A", "GFB01B", "GFB01C", "GFB01D", "GFD01", "GFD02"]);
const CLASS_FILTER_ORDER = [
  "Forestcraft",
  "Swordcraft",
  "Runecraft",
  "Dragoncraft",
  "Abysscraft",
  "Havencraft",
  "Neutral",
];
const MISSING_FRONT_CARD_OVERRIDES = [
  { code: "BP08-SL03EN", name: "Orchis, Resolute Puppet", isEvolved: true },
  { code: "BP09-SL20EN", name: "Vania, Kind Queen", isEvolved: false },
  { code: "BP09-SL05EN", name: "Celia, Hope's Strategist", isEvolved: false },
  { code: "BP09-P41EN", name: "Ceryneian Lighthind", isEvolved: false },
  { code: "BP09-P24EN", name: "Virtuous Lindworm", isEvolved: false },
  { code: "BP09-P02EN", name: "Paula, Gentle Warmth", isEvolved: false },
  { code: "BP09-110EN", name: "Ceryneian Lighthind", isEvolved: false },
  { code: "BP09-090EN", name: "Vania, Kind Queen", isEvolved: false },
  { code: "BP09-069EN", name: "Virtuous Lindworm", isEvolved: false },
  { code: "BP09-042EN", name: "Mysterian Whitewyrm", isEvolved: false },
  { code: "BP09-019EN", name: "Celia, Hope's Strategist", isEvolved: false },
  { code: "BP09-005EN", name: "Paula, Gentle Warmth", isEvolved: false },
  { code: "BP09-P12EN", name: "Mysterian Whitewyrm", isEvolved: false },
];
const PR_PROMO_SOURCE_RULES = [
  [0, 0, "Launch Demo Caravan"],
  [1, 6, "BP01 Box Topper"],
  [7, 12, "Promo Series 1"],
  [13, 13, "Showdown Series July-Sept 2023 Participation"],
  [14, 14, "Showdown Series July-Sept 2023 Top 8"],
  [15, 15, "Showdown Series July-Sept 2023 Champion"],
  [16, 16, "Promo Series 2"],
  [17, 17, "Bushiroad Championship Series 2023 Regional Participation"],
  [18, 18, "Bushiroad Championship Series 2023 Regional Free Fight"],
  [19, 19, "Bushiroad Championship Series 2023 Regional Top 8"],
  [20, 20, "Bushiroad Championship Series 2024 Participation"],
  [21, 26, "Promo Series 3"],
  [27, 33, "Promo Series 2"],
  [34, 34, "Showdown Series Oct-Dec 2023 Participation"],
  [35, 35, "Showdown Series Oct-Dec 2023 Top 8"],
  [36, 36, "Showdown Series Oct-Dec 2023 Champion"],
  [37, 37, "Judge Promo Foil 2024"],
  [38, 39, "Worlds 2024 Participation"],
  [40, 40, "Bushiroad Spring Fest Shop Challenge 2024 Champion"],
  [41, 41, "BP03 Box Topper"],
  [42, 42, "Showdown Series Jan-March 2024 Participation"],
  [43, 43, "Showdown Series Jan-March 2024 Top 8"],
  [44, 44, "Showdown Series Jan-March 2024 Champion"],
  [45, 53, "Promo Series 4"],
  [54, 54, "Shop Tournament Feb-March 2024 Champion and Raffle"],
  [55, 55, "Bushiroad Summer Fest 2024 Shop Challenge Participation"],
  [56, 56, "Bushiroad Summer Fest 2024 Shop Challenge Top 3"],
  [57, 63, "Bushiroad Summer Fest 2024 Participation"],
  [64, 72, "Promo Series 5"],
  [73, 73, "Shop Tournament April-May 2024 Champion and Raffle"],
  [74, 74, "Showdown Series April-June 2024 Participation"],
  [75, 75, "Showdown Series April-June 2024 Top 8"],
  [76, 76, "Showdown Series April-June 2024 Champion"],
  [77, 82, "2024 Conventions (BushiroadExpo LA, London, Japan Expo, etc.)"],
  [83, 94, "BP05 Box Topper"],
  [95, 104, "Promo Series 6"],
  [105, 106, "Shop Tournament June-July 2024 Champion"],
  [107, 107, "Showdown Series 1 Participation"],
  [108, 108, "Showdown Series 1 Top 8"],
  [109, 109, "Showdown Series 1 Champion"],
  [110, 119, "Promo Series 7"],
  [120, 120, "Shop Tournament Aug-Sept 2024 Champion"],
  [121, 121, "BP06 Release Tournament Champion"],
  [122, 122, "Grand Showdown Series Participation"],
  [123, 123, "Grand Showdown Series Top 32 Singapore"],
  [124, 124, "Grand Showdown Series Top 32 Los Angeles"],
  [125, 125, "Grand Showdown Series Top 32 Someren"],
  [126, 126, "Grand Showdown Series Top 8 Singapore"],
  [127, 127, "Grand Showdown Series Top 8 Los Angeles"],
  [128, 128, "Grand Showdown Series Top 8 Someren"],
  [129, 134, "Bushiroad Championship Series 2024-2025 Regional Participation"],
  [135, 135, "Bushiroad Championship Series 2024-2025 Regional Top 4"],
  [136, 136, "Bushiroad Championship Series 2024-2025 Regional Champion"],
  [137, 137, "Gloryfinder Trials"],
  [138, 138, "Gloryfinder Clash Season 1 and Guide to Glory"],
  [139, 139, "Judge Promo 2024-2025"],
  [140, 140, "Judge Promo Foil 2024-2025"],
  [141, 152, "Promo Series 9"],
  [153, 153, "Shop Tournament Dec-Jan 2024-2025 Champion"],
  [154, 154, "IM@S Release Tournament Champion"],
  [155, 164, "Promo Series 8"],
  [165, 165, "Shop Tournament Oct-Nov 2024 Champion"],
  [166, 166, "Showdown Series 2 Participation"],
  [167, 167, "Showdown Series 2 Top 8"],
  [168, 168, "Showdown Series 2 Champion"],
  [169, 169, "Gloryfinder Clash Season 2 Participation"],
  [170, 172, "BP07 Release Tournament Participation"],
  [173, 173, "BP07 Release Tournament Champion"],
  [174, 174, "Gloryfinder Clash Season 3 Participation"],
  [175, 175, "Showdown Series 3 Participation"],
  [176, 176, "Showdown Series 3 Top 8"],
  [177, 177, "Showdown Series 3 Champion"],
  [178, 185, "Promo Series 10"],
  [186, 186, "Promo Series 10 and 10 Add-on"],
  [187, 187, "Shop Tournament Feb-March 2025 Champion"],
  [188, 188, "BP08 Release Tournament Participation"],
  [189, 189, "BP08 Release Tournament Champion"],
  [190, 200, "BP08 Box Topper"],
  [201, 201, "Lunar New Year 2025 Participation"],
  [202, 202, "Worlds 2024-2025 Participation"],
  [203, 203, "Worlds 2024-2025 Top 8"],
  [204, 204, "Worlds 2024-2025 Top 4"],
  [205, 210, "Bushiroad Summer Fest 2025 Participation"],
  [211, 211, "Bushiroad Summer Fest 2025 Top 8"],
  [212, 220, "Grand Showdown Series 4 Gloryfinder Side Event"],
  [221, 221, "Gloryfinder Clash Season 4 Participation"],
  [222, 222, "BP09 Release Tournament Participation"],
  [223, 223, "BP09 Release Tournament Champion"],
  [224, 226, "2025 Conventions (AnimeExpo)"],
  [227, 232, "Promo Series 10 Add-on"],
  [233, 233, "Showdown Series 4 Participation"],
  [234, 234, "Showdown Series 4 Top 8"],
  [235, 235, "Showdown Series 4 Champion"],
  [236, 243, "Promo Series 11"],
  [244, 244, "Shop Tournament April-May 2025 Champion"],
  [245, 245, "AnimeExpo"],
  [246, 246, "GenCon"],
  [247, 256, "Promo Series 12"],
  [257, 257, "Shop Tournament June-July 2025 Champion"],
  [258, 258, "BP10 Release Tournament Champion"],
  [259, 259, "Vanguard Release Tournament Champion"],
  [260, 260, "Showdown Series 5 Participation"],
  [261, 261, "Showdown Series 5 Top 8"],
  [262, 262, "Showdown Series 5 Champion"],
  [263, 263, "Showdown Series 6 Participation"],
  [264, 264, "Showdown Series 6 Top 8"],
  [265, 265, "Showdown Series 6 Champion"],
  [266, 266, "Grand Showdown Series 5 Participation"],
  [267, 267, "Grand Showdown Series 5 Top 32"],
  [268, 268, "Grand Showdown Series 5 Top 16"],
  [269, 269, "Grand Showdown Series 5 Top 8"],
  [270, 270, "Grand Showdown Series 5 Sealed Participation and Champion"],
  [271, 280, "Promo Series 13"],
  [281, 281, "Shop Tournament Oct-Nov 2025 Champion and Raffle"],
  [282, 282, "BP11 Release Tournament Champion"],
  [283, 283, "Judge Promo 2025-2026"],
  [284, 285, "Judge Promo Foil 2025-2026"],
  [286, 297, "Bushiroad Championship Series 2025-2026 Regional Participation"],
  [298, 298, "Bushiroad Championship Series 2025-2026 Regional Top Cut"],
  [299, 299, "Bushiroad Championship Series 2025-2026 Regional Top 4"],
  [300, 300, "Bushiroad Championship Series 2025-2026 Regional Champion"],
  [301, 316, "Bushiroad Championship 2025-2026 Series Regional Crosscraft Participation"],
  [317, 317, "Bushiroad Championship Series Regional 2025-2026 Gloryfinder Participation"],
  [318, 337, "Bushiroad Championship Series Regional 2025-2026 and Grand Showdown Series 6 Single Elimination Participation and Champion"],
  [338, 338, "2025 Shop Tournament Redemption Campaign"],
  [339, 340, "Grand Showdown Series 6 Participation"],
  [341, 341, "Grand Showdown Series 6 Top 32"],
  [342, 342, "Grand Showdown Series 6 Top 16"],
  [343, 343, "Grand Showdown Series 6 Top 8 and Champion"],
  [344, 344, "Grand Showdown Series 6 Sealed Participation and Champion"],
  [345, 345, "Grand Showdown Series 6 Gloryfinder Participation"],
  [346, 346, "Lunar New Year 2026 Participation"],
  [347, 358, "Promo Series 14"],
  [359, 359, "Shop Tournament Dec 2025 Champion"],
  [360, 360, "Shop Tournament Jan 2026 Champion"],
  [361, 362, "BP12 Release Tournament Champion"],
  [363, 363, "BP13 Release Tournament Champion"],
  [364, 364, "Showdown Series 7 Participation"],
  [365, 365, "Showdown Series 7 Top 8"],
  [366, 366, "Showdown Series 7 Champion"],
  [367, 367, "EX Umamusume Release Tournament Champion"],
  [368, 368, "EX Umamusume Serial Tournament Champion"],
  [369, 369, "Valentine's Day Duos 2025 Participation"],
  [370, 381, "Promo Series 15"],
  [382, 382, "Shop Tournament Feb 2026 Champion"],
  [383, 384, "Shop Tournament March 2026 Champion"],
  [385, 385, "Worlds 2025-2026 Participation"],
  [386, 386, "BP14 Release Tournament Champion"],
  [387, 387, "BP15 Release Tournament Champion"],
];
const STARTER_DECK_PLAYSET_LIMIT_BY_CODE = {
  "SD01-LD01EN": 1,
  "SD01-001EN": 3,
  "SD01-002EN": 3,
  "SD01-003EN": 3,
  "SD01-004EN": 3,
  "SD01-005EN": 3,
  "SD01-006EN": 3,
  "SD01-007EN": 2,
  "SD01-008EN": 2,
  "SD01-009EN": 3,
  "SD01-010EN": 3,
  "SD01-011EN": 3,
  "SD01-012EN": 3,
  "SD01-013EN": 3,
  "SD01-014EN": 2,
  "SD01-015EN": 2,
  "SD01-016EN": 3,
  "SD01-017EN": 2,
  "SD01-018EN": 1,
  "SD01-019EN": 2,
  "SD01-020EN": 1,
  "SD01-T01EN": 1,
  "SD02-LD01EN": 1,
  "SD02-001EN": 3,
  "SD02-002EN": 3,
  "SD02-003EN": 3,
  "SD02-004EN": 3,
  "SD02-005EN": 3,
  "SD02-006EN": 3,
  "SD02-007EN": 2,
  "SD02-008EN": 2,
  "SD02-009EN": 3,
  "SD02-010EN": 3,
  "SD02-011EN": 3,
  "SD02-012EN": 3,
  "SD02-013EN": 3,
  "SD02-014EN": 2,
  "SD02-015EN": 2,
  "SD02-016EN": 3,
  "SD02-017EN": 2,
  "SD02-018EN": 1,
  "SD02-019EN": 1,
  "SD02-020EN": 2,
  "SD03-LD01EN": 1,
  "SD03-001EN": 3,
  "SD03-002EN": 3,
  "SD03-003EN": 3,
  "SD03-004EN": 3,
  "SD03-005EN": 3,
  "SD03-006EN": 3,
  "SD03-007EN": 2,
  "SD03-008EN": 3,
  "SD03-009EN": 3,
  "SD03-010EN": 3,
  "SD03-011EN": 3,
  "SD03-012EN": 2,
  "SD03-013EN": 2,
  "SD03-014EN": 2,
  "SD03-015EN": 3,
  "SD03-016EN": 3,
  "SD03-017EN": 2,
  "SD03-018EN": 1,
  "SD03-019EN": 1,
  "SD03-020EN": 2,
  "SD04-LD01EN": 1,
  "SD04-001EN": 3,
  "SD04-002EN": 3,
  "SD04-003EN": 3,
  "SD04-004EN": 3,
  "SD04-005EN": 3,
  "SD04-006EN": 3,
  "SD04-007EN": 2,
  "SD04-008EN": 2,
  "SD04-009EN": 3,
  "SD04-010EN": 3,
  "SD04-011EN": 3,
  "SD04-012EN": 3,
  "SD04-013EN": 3,
  "SD04-014EN": 3,
  "SD04-015EN": 2,
  "SD04-016EN": 2,
  "SD04-017EN": 2,
  "SD04-018EN": 1,
  "SD04-019EN": 1,
  "SD04-020EN": 2,
  "SD05-LD01EN": 1,
  "SD05-001EN": 3,
  "SD05-002EN": 3,
  "SD05-003EN": 3,
  "SD05-004EN": 3,
  "SD05-005EN": 3,
  "SD05-006EN": 3,
  "SD05-007EN": 2,
  "SD05-008EN": 2,
  "SD05-009EN": 2,
  "SD05-010EN": 3,
  "SD05-011EN": 3,
  "SD05-012EN": 3,
  "SD05-013EN": 3,
  "SD05-014EN": 2,
  "SD05-015EN": 3,
  "SD05-016EN": 3,
  "SD05-017EN": 2,
  "SD05-018EN": 2,
  "SD05-019EN": 1,
  "SD05-020EN": 1,
  "SD06-LD01EN": 1,
  "SD06-001EN": 3,
  "SD06-002EN": 3,
  "SD06-003EN": 3,
  "SD06-004EN": 3,
  "SD06-005EN": 3,
  "SD06-006EN": 3,
  "SD06-007EN": 2,
  "SD06-008EN": 2,
  "SD06-009EN": 3,
  "SD06-010EN": 3,
  "SD06-011EN": 3,
  "SD06-012EN": 3,
  "SD06-013EN": 2,
  "SD06-014EN": 2,
  "SD06-015EN": 3,
  "SD06-016EN": 3,
  "SD06-017EN": 1,
  "SD06-018EN": 2,
  "SD06-019EN": 1,
  "SD06-020EN": 2,
  "CSD01-LD01EN": 1,
  "CSD01-001EN": 1,
  "CSD01-002EN": 1,
  "CSD01-003EN": 1,
  "CSD01-004EN": 1,
  "CSD01-005EN": 1,
  "CSD01-006EN": 1,
  "CSD01-007EN": 3,
  "CSD01-008EN": 1,
  "CSD01-009EN": 1,
  "CSD01-010EN": 1,
  "CSD01-011EN": 1,
  "CSD01-012EN": 1,
  "CSD01-013EN": 1,
  "CSD01-014EN": 1,
  "CSD01-015EN": 2,
  "CSD01-016EN": 1,
  "CSD01-017EN": 2,
  "CSD01-018EN": 1,
  "CSD01-019EN": 2,
  "CSD01-020EN": 1,
  "CSD01-021EN": 1,
  "CSD01-022EN": 2,
  "CSD01-023EN": 1,
  "CSD01-024EN": 2,
  "CSD01-025EN": 1,
  "CSD01-026EN": 1,
  "CSD01-027EN": 1,
  "CSD01-028EN": 1,
  "CSD01-029EN": 2,
  "CSD01-030EN": 3,
  "CSD01-031EN": 3,
  "CSD01-032EN": 7,
  "CSD01-T01EN": 3,
  "CSD02a-LD01EN": 1,
  "CSD02a-001EN": 3,
  "CSD02a-002EN": 3,
  "CSD02a-003EN": 3,
  "CSD02a-004EN": 3,
  "CSD02a-005EN": 3,
  "CSD02a-006EN": 3,
  "CSD02a-007EN": 3,
  "CSD02a-008EN": 3,
  "CSD02a-009EN": 3,
  "CSD02a-010EN": 3,
  "CSD02a-011EN": 3,
  "CSD02a-012EN": 1,
  "CSD02a-013EN": 1,
  "CSD02a-014EN": 3,
  "CSD02a-015EN": 3,
  "CSD02a-016EN": 3,
  "CSD02a-017EN": 3,
  "CSD02a-018EN": 3,
  "CSD02b-LD01EN": 1,
  "CSD02b-001EN": 3,
  "CSD02b-002EN": 3,
  "CSD02b-003EN": 3,
  "CSD02b-004EN": 3,
  "CSD02b-005EN": 3,
  "CSD02b-006EN": 3,
  "CSD02b-007EN": 3,
  "CSD02b-008EN": 3,
  "CSD02b-009EN": 3,
  "CSD02b-010EN": 3,
  "CSD02b-011EN": 3,
  "CSD02b-012EN": 3,
  "CSD02b-013EN": 3,
  "CSD02b-014EN": 3,
  "CSD02b-015EN": 3,
  "CSD02b-016EN": 1,
  "CSD02b-017EN": 1,
  "CSD02b-018EN": 3,
  "CSD02c-LD01EN": 1,
  "CSD02c-001EN": 3,
  "CSD02c-002EN": 3,
  "CSD02c-003EN": 3,
  "CSD02c-004EN": 3,
  "CSD02c-005EN": 3,
  "CSD02c-006EN": 3,
  "CSD02c-007EN": 3,
  "CSD02c-008EN": 3,
  "CSD02c-009EN": 3,
  "CSD02c-010EN": 3,
  "CSD02c-011EN": 3,
  "CSD02c-012EN": 3,
  "CSD02c-013EN": 3,
  "CSD02c-014EN": 1,
  "CSD02c-015EN": 1,
  "CSD02c-016EN": 3,
  "CSD02c-017EN": 3,
  "CSD02c-018EN": 3,
  "CSD03a-LD01EN": 1,
  "CSD03a-001EN": 3,
  "CSD03a-002EN": 3,
  "CSD03a-003EN": 3,
  "CSD03a-004EN": 3,
  "CSD03a-005EN": 3,
  "CSD03a-006EN": 3,
  "CSD03a-007EN": 3,
  "CSD03a-008EN": 3,
  "CSD03a-009EN": 3,
  "CSD03a-010EN": 3,
  "CSD03a-011EN": 3,
  "CSD03a-012EN": 3,
  "CSD03a-013EN": 3,
  "CSD03a-014EN": 3,
  "CSD03a-015EN": 3,
  "CSD03a-016EN": 1,
  "CSD03a-017EN": 4,
  "CSD03b-LD01EN": 1,
  "CSD03b-001EN": 3,
  "CSD03b-002EN": 3,
  "CSD03b-003EN": 3,
  "CSD03b-004EN": 3,
  "CSD03b-005EN": 3,
  "CSD03b-006EN": 3,
  "CSD03b-007EN": 3,
  "CSD03b-008EN": 3,
  "CSD03b-009EN": 3,
  "CSD03b-010EN": 3,
  "CSD03b-011EN": 3,
  "CSD03b-012EN": 3,
  "CSD03b-013EN": 3,
  "CSD03b-014EN": 3,
  "CSD03b-015EN": 3,
  "CSD03b-016EN": 1,
  "CSD03b-017EN": 4,
};

const SET_NAME_BY_CODE = {
  BP01: "Advent of Genesis",
  BP02: "Reign of Bahamut",
  BP03: "Flame of Laevateinn",
  BP04: "Cosmic Mythos",
  BP05: "Omens Eternal",
  BP06: "Paragons of the Colosseum",
  BP07: "Verdant Steel",
  BP08: "Alterchaotica",
  BP09: "Duet of Dawn and Dusk",
  BP10: "Gods of the Arcana",
  BP11: "Bullet of Fate",
  BP12: "Worldreaver's Descent",
  BP13: "Dominion of Darkness",
  BP14: "Banquet of Dreams",
  BP15: "Trial of the Omens",
  BP16: "New World Genesis",
  SDD01: "Showdown Deck: Forestcraft",
  SDD02: "Showdown Deck: Swordcraft",
  SDD03: "Showdown Deck: Runecraft",
  SDD04: "Showdown Deck: Dragoncraft",
  SDD05: "Showdown Deck: Abysscraft",
  SDD06: "Showdown Deck: Havencraft",
  CP01: "Umamusume: Pretty Derby",
  CP02: "THE IDOLM@STER CINDERELLA GIRLS",
  CP03: "Cardfight!! Vanguard",
  CSD01: "Ready, Set, Umamusume!",
  CSD02A: "Cute",
  CSD02B: "Cool",
  CSD02C: "Passion",
  CSD03A: "Sanctuary Knight Brigade",
  CSD03B: "Apocalyptic Fire",
  ECP01: "Umamusume: Pretty Derby",
  GFB01A: "Guide to Glory (Forestcraft)",
  GFB01B: "Guide to Glory (Swordcraft)",
  GFB01C: "Guide to Glory (Runecraft)",
  GFB01D: "Guide to Glory (Dragoncraft)",
  GFD01: "Luxheart Legends",
  GFD02: "Treacherous Ambitions",
  SD01: "Regal Fairy Princess",
  SD02: "Blade of Resentment",
  SD03: "Mysteries of Conjuration",
  SD04: "Wrath of the Greatwyrm",
  SD05: "Waltz of the Undying Night",
  SD06: "Maculate Ablution",
  SP01: "Seaside Memories",
  SS01: "Worlds Beyond Swordcraft Starter Set",
  SS02: "Worlds Beyond Dragoncraft Starter Set",
  PR: "Promo Cards",
  BSF2024: "Bushiroad Spring Fest 2024 Promo",
  BSF2025: "Bushiroad Spring Fest 2025 Promo",
  NY2024: "New Year 2024 Promo",
};

function normalizeSetCodeForLookup(setCode) {
  const raw = String(setCode || "").trim();
  if (!raw) return "";
  const suffixed = raw.match(/^([A-Za-z]+\d+)([a-z])$/);
  if (suffixed) return `${suffixed[1].toUpperCase()}${suffixed[2].toUpperCase()}`;
  return raw.toUpperCase();
}

function setLabel(setCode) {
  const normalized = normalizeSetCodeForLookup(setCode);
  const name = SET_NAME_BY_CODE[normalized];
  return name ? `${setCode}: ${name}` : setCode;
}

function normalizeCardCode(rawCode) {
  let code = String(rawCode || "").trim();
  try {
    code = decodeURIComponent(code);
  } catch {
    // keep original if decoding fails
  }
  // Normalize special leader marker so art files resolve.
  code = code.replace(/-LDⓈ(\d+EN)$/i, "-LD$1");
  return code;
}

function canonicalSetCode(rawSetCode) {
  const normalized = normalizeSetCodeForLookup(rawSetCode);
  return PROMO_MERGED_SET_CODES.has(normalized) ? "PR" : String(rawSetCode || "");
}

function promoOrderIndex(cardCode) {
  const prefix = String(cardCode || "").split("-")[0] || "";
  return Object.hasOwn(PROMO_FRONT_ORDER, prefix) ? PROMO_FRONT_ORDER[prefix] : 99;
}

const SHOWDOWN_DECK_PLAYSET_LIMITS = {
  SDD01: {
    LD01: 1, "001": 3, "002": 2, "003": 2, "004": 3, "005": 2, "006": 2, "007": 1, "008": 3, "009": 2,
    "010": 2, "011": 3, "012": 3, "013": 2, "014": 3, "015": 3, "016": 2, "017": 3, "018": 3, "019": 3,
    "020": 3, T01: 4, T02: 5,
  },
  SDD02: {
    LD01: 1, "001": 3, "002": 3, "003": 3, "004": 3, "005": 2, "006": 3, "007": 1, "008": 3, "009": 1,
    "010": 3, "011": 3, "012": 3, "013": 2, "014": 3, "015": 2, "016": 3, "017": 1, "018": 3, "019": 2,
    "020": 3, T01: 2, T02: 1, T03: 2, T04: 2, T05: 2,
  },
  SDD03: {
    LD01: 1, "001": 3, "002": 2, "003": 3, "004": 3, "005": 3, "006": 1, "007": 1, "008": 3, "009": 3,
    "010": 2, "011": 3, "012": 1, "013": 1, "014": 1, "015": 2, "016": 3, "017": 1, "018": 3, "019": 3,
    "020": 1, "021": 3, "022": 2, "023": 2, T01: 2, T02: 2, T03: 1, T04: 1, T05: 1, T06: 2,
  },
  SDD04: {
    LD01: 1, "001": 3, "002": 3, "003": 3, "004": 3, "005": 3, "006": 3, "007": 3, "008": 2, "009": 3,
    "010": 2, "011": 2, "012": 3, "013": 3, "014": 3, "015": 2, "016": 3, "017": 3, "018": 3, T01: 9,
  },
  SDD05: {
    LD01: 1, "001": 3, "002": 1, "003": 3, "004": 3, "005": 3, "006": 3, "007": 3, "008": 2, "009": 3,
    "010": 3, "011": 3, "012": 3, "013": 3, "014": 3, "015": 2, "016": 1, "017": 3, "018": 3, "019": 2,
    "020": 1, T01: 1, T02: 4, T03: 4,
  },
  SDD06: {
    LD01: 1, "001": 3, "002": 3, "003": 3, "004": 1, "005": 3, "006": 3, "007": 3, "008": 3, "009": 3,
    "010": 3, "011": 3, "012": 3, "013": 3, "014": 3, "015": 3, "016": 1, "017": 3, "018": 3, T01: 9,
  },
};

function showdownDeckPlaysetLimitForCode(cardCode) {
  const match = normalizeCardCode(cardCode).match(/^(SDD0[1-6])-([A-Z0-9]+)EN$/);
  if (!match) return null;
  const [, setCode, suffix] = match;
  const setLimits = SHOWDOWN_DECK_PLAYSET_LIMITS[setCode];
  if (!setLimits || !Object.hasOwn(setLimits, suffix)) return null;
  return setLimits[suffix];
}

function playsetLimitForCard(card) {
  const cardCode = normalizeCardCode(card?.code || "");
  const showdownLimit = showdownDeckPlaysetLimitForCode(cardCode);
  if (showdownLimit !== null) return showdownLimit;
  if (Object.hasOwn(STARTER_DECK_PLAYSET_LIMIT_BY_CODE, cardCode)) {
    return STARTER_DECK_PLAYSET_LIMIT_BY_CODE[cardCode];
  }

  const cardName = String(card?.name || "").trim().toLowerCase();
  if (cardName === "onion patch") return 50;
  if (cardName === "rapid fire") return 6;

  const normalizedSet = normalizeSetCodeForLookup(card?.setCode || "");
  if (ONE_COPY_SET_CODES.has(normalizedSet)) return 1;
  if (normalizedSet === "PR") return 1;

  const rarity = String(card?.rarity || "");
  if (rarity === "Leader" || rarity === "Token" || rarity === "Promo") return 1;

  return 3;
}

function initDualGroups() {
  dualGroupByCode = new Map();
  DUAL_SIDE_GROUPS.forEach((group) => {
    group.forEach((code) => dualGroupByCode.set(code, group));
  });
}

const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const setFilter = document.getElementById("setFilter");
const classFilter = document.getElementById("classFilter");
const traitFilter = document.getElementById("traitFilter");
const cardTypeFilter = document.getElementById("cardTypeFilter");
const cardCostFilter = document.getElementById("cardCostFilter");
const attackFilter = document.getElementById("attackFilter");
const defenseFilter = document.getElementById("defenseFilter");
const artistFilter = document.getElementById("artistFilter");
const rarityFilterGroup = document.getElementById("rarityFilterGroup");
const ownedOnly = document.getElementById("ownedOnly");
const incompleteOnly = document.getElementById("incompleteOnly");
const extraOnly = document.getElementById("extraOnly");
const scanBtn = document.getElementById("scanBtn");
const exportBtn = document.getElementById("exportBtn");
const importBtn = document.getElementById("importBtn");
const exportIncompleteBtn = document.getElementById("exportIncompleteBtn");
const deckFilter = document.getElementById("deckFilter");
const renameDeckBtn = document.getElementById("renameDeckBtn");
const importInput = document.getElementById("importInput");
const tableBody = document.getElementById("cardsTableBody");
const rowTemplate = document.getElementById("rowTemplate");
const legalToggle = document.getElementById("legalToggle");
const legalText = document.getElementById("legalText");
const legalBackdrop = document.getElementById("legalBackdrop");

const sidebarToggle = document.getElementById("sidebarToggle");
const actionsToggle = document.getElementById("actionsToggle");

const RARITY_LABEL_BY_PREFIX = {
  "": "Base",
  P: "Premium",
  SL: "Super Legendary",
  U: "Ultimate",
  SP: "Special",
  SSP: "Super Special",
  LD: "Leader",
  PR: "Promo",
  T: "Token",
  UT: "Token",
  EP: "Evo Point",
};

const RARITY_SORT_ORDER = [
  "Base",
  "Premium",
  "Super Legendary",
  "Ultimate",
  "Special",
  "Super Special",
  "Leader",
  "Promo",
  "Token",
  "Evo Point",
  "Uncategorized",
];

const RARITY_FILTER_GROUP_ORDER = [
  "Base",
  "High",
  "Leader",
  "Promo",
  "Token",
  "Evo Point",
];

let cards = [];
let cardByCode = new Map();
let collection = {};
let zoomState = { cards: [], index: -1, anchorEl: null, anchorCode: "" };
let zoomNavLeft = null;
let zoomNavRight = null;
let zoomPromoInfo = null;
let rarityOutliers = [];
let dualGroupByCode = new Map();
let appliedSearchText = "";
let scanInFlight = false;
let scanCodeAliasMap = new Map();
let scanNameAliasMap = new Map();
let cardsByDeckGroupKey = new Map();
let availableDeckFiles = [];
let activeDeck = {
  fileName: "",
  requirements: new Map(),
  unmatchedEntries: [],
};
const LONG_PRESS_MS = 550;

function prPromoSourceByCode(cardCode) {
  const normalized = normalizeCardCode(cardCode);
  const match = normalized.match(/^PR-(\d{3})/i);
  if (!match) return "";
  const number = Number.parseInt(match[1], 10);
  if (!Number.isFinite(number)) return "";
  const rule = PR_PROMO_SOURCE_RULES.find(([start, end]) => number >= start && number <= end);
  return rule ? rule[2] : "";
}

function updateZoomPromoInfo(card) {
  if (!zoomPromoInfo) return;
  const source = prPromoSourceByCode(card?.code || "") || String(card?.promoSource || "").trim();
  if (!source) {
    zoomPromoInfo.classList.add("hidden");
    zoomPromoInfo.textContent = "";
    return;
  }
  zoomPromoInfo.textContent = `Promo Source: ${source}`;
  zoomPromoInfo.classList.remove("hidden");
}

function hasNativeBridge() {
  return typeof window !== "undefined" && window.SVEBridge && typeof window.SVEBridge.postMessage === "function";
}

function nativePost(message) {
  if (!hasNativeBridge()) return false;
  try {
    window.SVEBridge.postMessage(JSON.stringify(message));
    return true;
  } catch {
    return false;
  }
}

function setScanBusy(isBusy) {
  scanInFlight = isBusy;
  if (!scanBtn) return;
  scanBtn.disabled = isBusy;
  scanBtn.textContent = isBusy ? "Scanning..." : "Scan Card";
}

function normalizeScanText(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

function codeScanAliases(code) {
  const normalized = normalizeCardCode(code).toUpperCase();
  const aliases = new Set();
  const push = (value) => {
    const compact = normalizeScanText(value);
    if (compact.length >= 5) aliases.add(compact);
  };

  push(normalized);
  push(normalized.replace(/_URA/gi, ""));
  push(normalized.replace(/EN$/i, ""));
  push(normalized.replace(/_URA/gi, "").replace(/EN$/i, ""));
  return [...aliases];
}

function nameScanAlias(name) {
  return normalizeScanText(name);
}

function buildScanIndexes() {
  scanCodeAliasMap = new Map();
  scanNameAliasMap = new Map();

  cards.forEach((card) => {
    codeScanAliases(card.code).forEach((alias) => {
      const existing = scanCodeAliasMap.get(alias) || [];
      existing.push(card);
      scanCodeAliasMap.set(alias, existing);
    });

    const nameAlias = nameScanAlias(card.name);
    if (nameAlias.length >= 6) {
      const existing = scanNameAliasMap.get(nameAlias) || [];
      existing.push(card);
      scanNameAliasMap.set(nameAlias, existing);
    }
  });
}

function looksLikeCardCodeCandidate(value) {
  return /^[A-Z]{2,6}\d{1,3}[A-Z]?\d*[A-Z0-9]*$/.test(value) || /^[A-Z]{2,6}\d{1,3}$/.test(value);
}

function applyOcrCodeCorrections(value) {
  let corrected = String(value || "").toUpperCase();
  if (!/\d/.test(corrected)) return corrected;

  corrected = corrected
    .replace(/[OQD]/g, "0")
    .replace(/[IL]/g, "1")
    .replace(/Z/g, "2")
    .replace(/S/g, "5");

  return corrected;
}

function extractScanCodeCandidates(recognizedText) {
  const source = String(recognizedText || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[—–−]/g, "-");

  const candidates = new Set();
  const push = (value) => {
    const compact = normalizeScanText(value);
    if (compact.length >= 5) candidates.add(compact);
  };

  push(source);

  const rawTokens = source
    .split(/[^A-Z0-9]+/)
    .map((token) => token.trim())
    .filter(Boolean);

  rawTokens.forEach((token) => {
    push(token);
    push(applyOcrCodeCorrections(token));
  });

  for (let i = 0; i < rawTokens.length; i++) {
    for (let span = 2; span <= 4 && i + span <= rawTokens.length; span++) {
      const joined = rawTokens.slice(i, i + span).join("");
      push(joined);
      push(applyOcrCodeCorrections(joined));
    }
  }

  const regex =
    /\b([A-Z]{2,6}[0OILSQDZ]{1,3}[A-Z]?(?:[- ]?[A-Z]{0,4}[0-9OILSQDZ]{1,4})?(?:[-_ ]?URA)?(?:[-_ ]?EN)?)\b/g;
  let match;
  while ((match = regex.exec(source)) !== null) {
    push(match[1]);
    push(applyOcrCodeCorrections(match[1]));
  }

  return [...candidates].filter(looksLikeCardCodeCandidate);
}

function editDistanceWithinLimit(a, b, limit = 1) {
  if (a === b) return 0;
  if (!a || !b) return Math.max(a.length, b.length);
  if (Math.abs(a.length - b.length) > limit) return limit + 1;

  const prev = new Array(b.length + 1);
  const curr = new Array(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;

  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    let rowMin = curr[0];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        prev[j] + 1,
        curr[j - 1] + 1,
        prev[j - 1] + cost
      );
      rowMin = Math.min(rowMin, curr[j]);
    }
    if (rowMin > limit) return limit + 1;
    for (let j = 0; j <= b.length; j++) prev[j] = curr[j];
  }

  return prev[b.length];
}

function findCardByCodeCandidates(recognizedText) {
  const candidates = extractScanCodeCandidates(recognizedText);
  const directHits = new Map();

  candidates.forEach((candidate) => {
    const exact = scanCodeAliasMap.get(candidate);
    if (exact?.length === 1) {
      directHits.set(exact[0].code, { card: exact[0], score: 1000 + candidate.length });
    }
  });

  if (directHits.size === 1) {
    return { card: [...directHits.values()][0].card, matchedBy: "code" };
  }

  const fuzzyHits = [];
  candidates.forEach((candidate) => {
    scanCodeAliasMap.forEach((aliasCards, alias) => {
      if (aliasCards.length !== 1) return;
      const limit = candidate.length >= 10 ? 2 : 1;
      const distance = editDistanceWithinLimit(candidate, alias, limit);
      if (distance <= limit) {
        fuzzyHits.push({
          card: aliasCards[0],
          score: alias.length - distance * 4,
          distance,
        });
      }
    });
  });

  fuzzyHits.sort(
    (a, b) =>
      b.score - a.score ||
      a.distance - b.distance ||
      a.card.code.localeCompare(b.card.code)
  );

  if (!fuzzyHits.length) return null;
  const best = fuzzyHits[0];
  const top = fuzzyHits.filter(
    (entry) => entry.score === best.score && entry.distance === best.distance
  );
  if (top.length === 1) {
    return { card: top[0].card, matchedBy: top[0].distance === 0 ? "code" : "code (OCR corrected)" };
  }

  return null;
}

function findCardByNameCandidates(recognizedText) {
  const compact = normalizeScanText(recognizedText);
  if (!compact) return null;

  const exactHits = [];
  scanNameAliasMap.forEach((aliasCards, alias) => {
    if (compact.includes(alias)) {
      aliasCards.forEach((card) => exactHits.push({ card, score: alias.length }));
    }
  });

  exactHits.sort((a, b) => b.score - a.score || a.card.code.localeCompare(b.card.code));
  if (exactHits.length) {
    const topScore = exactHits[0].score;
    const top = exactHits.filter((entry) => entry.score === topScore);
    const uniqueCodes = [...new Map(top.map((entry) => [entry.card.code, entry])).values()];
    if (uniqueCodes.length === 1) {
      return { card: uniqueCodes[0].card, matchedBy: "name" };
    }
  }

  return null;
}

function findBestScanMatch(recognizedText) {
  return findCardByCodeCandidates(recognizedText) || findCardByNameCandidates(recognizedText) || null;
}

function applyScanMatch(match) {
  const { card, matchedBy } = match;
  const nextQty = ownedFor(card.code) + 1;
  setOwned(card.code, nextQty);
  renderTable();
  alert(
    `Scan matched by ${matchedBy}:\n${card.name}\n${card.code}\nOwned copies: ${nextQty}`
  );
}

function adjustCardQuantityByCode(code, delta) {
  const card = cardByCode.get(code) || cards.find((entry) => entry.code === code);
  if (!card) return false;

  const wasVisible = matchesActiveFilters(card);
  const next = ownedFor(card.code) + delta;
  setOwned(card.code, next);
  const currentQty = ownedFor(card.code);
  const isVisible = matchesActiveFilters(card, currentQty);

  if (wasVisible !== isVisible) {
    renderTable();
    return true;
  }

  renderTable();
  return true;
}

function startNativeScan() {
  if (scanInFlight) return;
  if (!nativePost({ type: "scan_card" })) {
    alert("Card scanning is only available in the Android app build.");
    return;
  }
  setScanBusy(true);
}

function importCollectionFromText(jsonText) {
  const parsed = JSON.parse(String(jsonText || "{}"));
  if (!parsed || typeof parsed !== "object" || typeof parsed.data !== "object") {
    throw new Error("Invalid format");
  }
  collection = parsed.data;
  saveCollection();
  renderTable();
}

window.__sveNativeExportResult = function __sveNativeExportResult(payloadJson) {
  try {
    const payload = JSON.parse(String(payloadJson || "{}"));
    if (payload.ok) {
      alert(`Collection exported to:\n${payload.path}`);
      return;
    }
    alert(`Native export failed: ${payload.error || "Unknown error"}`);
  } catch {
    alert("Native export failed.");
  }
};

window.__sveNativeImportResult = function __sveNativeImportResult(payloadJson) {
  try {
    const payload = JSON.parse(String(payloadJson || "{}"));
    if (!payload.ok) {
      alert(`Import failed: ${payload.error || "Unknown error"}`);
      return;
    }
    importCollectionFromText(payload.jsonText || "");
    alert(`Collection import complete.\nLoaded:\n${payload.path}`);
  } catch {
    alert("Import failed. Use a valid export JSON file.");
  }
};

window.__sveNativeIncompleteExportResult = function __sveNativeIncompleteExportResult(payloadJson) {
  try {
    const payload = JSON.parse(String(payloadJson || "{}"));
    if (payload.ok) {
      alert(`Incomplete list exported to:\n${payload.path}`);
      return;
    }
    alert(`Incomplete export failed: ${payload.error || "Unknown error"}`);
  } catch {
    alert("Incomplete export failed.");
  }
};

window.__sveNativeDeckListFilesResult = function __sveNativeDeckListFilesResult(payloadJson) {
  try {
    const payload = JSON.parse(String(payloadJson || "{}"));
    if (!payload.ok) {
      populateDeckFilter([]);
      return;
    }
    populateDeckFilter(Array.isArray(payload.files) ? payload.files : []);
  } catch {
    populateDeckFilter([]);
  }
};

window.__sveNativeDeckImportResult = function __sveNativeDeckImportResult(payloadJson) {
  try {
    const payload = JSON.parse(String(payloadJson || "{}"));
    if (!payload.ok) {
      alert(`Deck import failed: ${payload.error || "Unknown error"}`);
      if (deckFilter) deckFilter.value = activeDeck.fileName || "";
      return;
    }
    applyDeckListText(payload.textContent || "", payload.fileName || "");
  } catch {
    alert("Deck import failed.");
    if (deckFilter) deckFilter.value = activeDeck.fileName || "";
  }
};

window.__sveNativeDeckRenameResult = function __sveNativeDeckRenameResult(payloadJson) {
  try {
    const payload = JSON.parse(String(payloadJson || "{}"));
    if (!payload.ok) {
      alert(`Deck rename failed: ${payload.error || "Unknown error"}`);
      return;
    }
    requestDeckFileList();
    if (payload.newFileName) {
      requestDeckImport(payload.newFileName);
    }
    alert(`Deck renamed to:\n${deckFileLabel(payload.newFileName || "")}`);
  } catch {
    alert("Deck rename failed.");
  }
};

window.__sveNativeDeckMutationResult = function __sveNativeDeckMutationResult(payloadJson) {
  try {
    const payload = JSON.parse(String(payloadJson || "{}"));
    if (!payload.ok) {
      alert(`Deck update failed: ${payload.error || "Unknown error"}`);
      return;
    }
    requestDeckFileList();
    if (activeDeck.fileName && payload.fileName === activeDeck.fileName && payload.textContent != null) {
      applyDeckListText(payload.textContent, payload.fileName || activeDeck.fileName);
    }
  } catch {
    alert("Deck update failed.");
  }
};

window.__sveNativeScanResult = function __sveNativeScanResult(payloadJson) {
  setScanBusy(false);
  try {
    const payload = JSON.parse(String(payloadJson || "{}"));
    if (!payload.ok) {
      if (!payload.cancelled) {
        alert(`Scan failed: ${payload.error || "Unknown error"}`);
      }
      return;
    }

    const match = findBestScanMatch(payload.recognizedText || "");
    if (!match) {
      alert("No unique card match was found from the scanned text.");
      return;
    }

    applyScanMatch(match);
  } catch {
    alert("Scan failed.");
  }
};

window.__sveNativeScanSessionClosed = function __sveNativeScanSessionClosed() {
  setScanBusy(false);
};

window.__sveNativeAdjustCardQuantity = function __sveNativeAdjustCardQuantity(payloadJson) {
  try {
    const payload = JSON.parse(String(payloadJson || "{}"));
    const code = String(payload.code || "");
    const delta = Number.parseInt(String(payload.delta ?? 0), 10);
    if (!code || !Number.isFinite(delta) || delta === 0) {
      return;
    }
    adjustCardQuantityByCode(code, delta);
  } catch {
    // ignore malformed native quantity updates
  }
};

function setCodeFromCardCode(cardCode) {
  const normalized = normalizeCardCode(cardCode);
  const match = normalized.match(/^([A-Za-z0-9]+)-/);
  if (!match) return "UNKNOWN";
  return canonicalSetCode(match[1]);
}

function setCodeFolderCandidates(setCode) {
  const code = String(setCode || "").trim();
  const out = new Set();
  out.add(code);
  out.add(code.toUpperCase());
  out.add(code.toLowerCase());
  const suffix = code.match(/^([A-Za-z]+\d+)([A-Za-z])$/);
  if (suffix) {
    const base = suffix[1];
    const letter = suffix[2];
    out.add(base);
    out.add(base.toUpperCase());
    out.add(base.toLowerCase());
    out.add(`${base}${letter.toLowerCase()}`);
    out.add(suffix[1]);
    out.add(suffix[1].toUpperCase());
    out.add(`${suffix[1]}${suffix[2].toUpperCase()}`);
  }
  return [...out];
}

function parseRarityFromCardCode(cardCode) {
  const segmentRaw = String(cardCode || "").split("-")[1] || "";
  let segment = segmentRaw.trim();
  try {
    segment = decodeURIComponent(segment);
  } catch {
    segment = segmentRaw.trim();
  }

  const baseMatch = segment.match(/^(\d+)/);
  if (baseMatch) {
    return { rarity: RARITY_LABEL_BY_PREFIX[""], outlier: false, outlierReason: "" };
  }

  const directMatch = segment.match(/^([A-Za-z]+)(\d+)/);
  if (directMatch) {
    const prefix = directMatch[1].toUpperCase();
    const rarity = RARITY_LABEL_BY_PREFIX[prefix];
    if (rarity) {
      return { rarity, outlier: false, outlierReason: "" };
    }
    return { rarity: "Uncategorized", outlier: true, outlierReason: `Unknown rarity prefix: ${prefix}` };
  }

  const decoratedMatch = segment.match(/^([A-Za-z]+)([^0-9A-Za-z]+)(\d+)/);
  if (decoratedMatch) {
    const prefix = decoratedMatch[1].toUpperCase();
    const rarity = RARITY_LABEL_BY_PREFIX[prefix];
    if (rarity) {
      return { rarity, outlier: false, outlierReason: "" };
    }
    return {
      rarity: "Uncategorized",
      outlier: true,
      outlierReason: `Non-standard rarity segment: ${prefix}${decoratedMatch[2]}`,
    };
  }

  return { rarity: "Uncategorized", outlier: true, outlierReason: "Unparseable card code segment" };
}

function artUrlCandidates(card) {
  const folders = new Set(setCodeFolderCandidates(card.setCode));
  // Many promo/special codes are stored under PR folder.
  folders.add("PR");
  const normalizedCode = normalizeCardCode(card.code);
  const rawCode = String(card.code || "").trim();
  const csvArtUrl = String(card.artUrl || "").trim();
  const originalSetCodeMatch = normalizedCode.match(/^([A-Za-z0-9]+)-/);
  if (originalSetCodeMatch) {
    setCodeFolderCandidates(originalSetCodeMatch[1]).forEach((f) => folders.add(f));
  }
  const urls = [];
  // Offline-only: accept only local/relative URLs from catalog data.
  if (csvArtUrl && !/^https?:\/\//i.test(csvArtUrl)) {
    urls.push(csvArtUrl);
    urls.push(csvArtUrl.replace(/\.png(\?.*)?$/i, ".avif"));
  }
  for (const folder of folders) {
    urls.push(`${CARD_ART_ROOT}/${folder}/${rawCode}.avif`);
    urls.push(`${CARD_ART_ROOT}/${folder}/${normalizedCode}.avif`);
    urls.push(`${CARD_ART_ROOT}/${folder}/${rawCode}.webp`);
    urls.push(`${CARD_ART_ROOT}/${folder}/${normalizedCode}.webp`);
    urls.push(`${CARD_ART_ROOT}/${folder}/${rawCode}.png`);
    urls.push(`${CARD_ART_ROOT}/${folder}/${normalizedCode}.png`);
  }
  return urls;
}

function applyArtToImage(imgEl, card) {
  const candidates = artUrlCandidates(card);
  let idx = 0;
  imgEl.src = candidates[idx];
  imgEl.alt = `${card.name} art`;
  imgEl.onerror = () => {
    idx += 1;
    if (idx < candidates.length) {
      imgEl.src = candidates[idx];
      return;
    }
    imgEl.onerror = null;
    imgEl.src = "./assets/card-placeholder.svg";
  };
}

function isEvolvedType(cardType, name) {
  const t = String(cardType || "").toLowerCase();
  if (t.includes("follower / evolved")) return true;
  return String(name || "").toLowerCase().includes("(evolved)");
}

function parseCsv(csvText) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const ch = csvText[i];
    const next = csvText[i + 1];

    if (ch === '"' && inQuotes && next === '"') {
      cell += '"';
      i++;
    } else if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      row.push(cell);
      cell = "";
    } else if ((ch === "\n" || ch === "\r") && !inQuotes) {
      if (ch === "\r" && next === "\n") i++;
      row.push(cell);
      if (row.some((value) => value.trim() !== "")) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += ch;
    }
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  const headers = rows[0] || [];
  const data = [];
  for (let i = 1; i < rows.length; i++) {
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h.trim()] = (rows[i][idx] || "").trim();
    });
    data.push(obj);
  }
  return data;
}

function parseTraits(rawTraits) {
  return String(rawTraits || "")
    .split("|")
    .map((trait) => trait.trim())
    .filter(Boolean);
}

function parseCardTypes(rawCardType) {
  return String(rawCardType || "")
    .split("/")
    .map((value) => value.trim())
    .filter(Boolean);
}

function canonicalDeckCardName(name) {
  return String(name || "")
    .replace(/\s+\((Evolved|Advanced)\)\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function deckModeFromText(name) {
  const value = String(name || "").trim();
  if (/\(Advanced\)\s*$/i.test(value)) return "advanced";
  if (/\(Evolved\)\s*$/i.test(value)) return "evolved";
  return "base";
}

function deckModeForCard(card) {
  if (card?.isAdvanced) {
    return "advanced";
  }
  return card.isEvolved ? "evolved" : "base";
}

function deckGroupKey(name, mode) {
  return `${canonicalDeckCardName(name).toLowerCase()}::${mode}`;
}

function deckGroupKeyForCard(card) {
  return deckGroupKey(card.name, deckModeForCard(card));
}

function buildDeckIndexes() {
  cardsByDeckGroupKey = new Map();
  cards.forEach((card) => {
    const key = deckGroupKeyForCard(card);
    const existing = cardsByDeckGroupKey.get(key) || [];
    existing.push(card);
    cardsByDeckGroupKey.set(key, existing);
  });
}

function parseDeckListText(text) {
  const requirements = new Map();
  const unmatchedEntries = [];
  const lines = String(text || "").split(/\r?\n/);
  let orderCounter = 0;

  lines.forEach((line, index) => {
    const raw = line.trim();
    if (!raw || raw.startsWith("#") || raw.startsWith("//")) return;

    const match = raw.match(/^(\d+)\s*x?\s+(.+?)\s*$/i);
    if (!match) {
      unmatchedEntries.push({ lineNumber: index + 1, text: raw, reason: "Could not parse line." });
      return;
    }

    const qty = Number.parseInt(match[1], 10);
    const entryName = match[2].trim();
    if (!Number.isFinite(qty) || qty <= 0 || !entryName) {
      unmatchedEntries.push({ lineNumber: index + 1, text: raw, reason: "Invalid quantity or card name." });
      return;
    }

    const mode = deckModeFromText(entryName);
    const key = deckGroupKey(entryName, mode);
    const displayName = canonicalDeckCardName(entryName);
    const existingEntry = requirements.get(key);
    const existingQty = existingEntry?.quantity || 0;
    requirements.set(key, {
      quantity: existingQty + qty,
      displayName,
      mode,
      order: existingEntry?.order ?? orderCounter++,
    });
  });

  requirements.forEach((entry, key) => {
    if (!cardsByDeckGroupKey.has(key)) {
      unmatchedEntries.push({
        lineNumber: null,
        text: entry.mode === "base" ? entry.displayName : `${entry.displayName} (${entry.mode === "evolved" ? "Evolved" : "Advanced"})`,
        reason: "No matching card was found in the catalogue.",
      });
    }
  });

  return { requirements, unmatchedEntries };
}

function deckRequirementForCard(card) {
  return activeDeck.requirements.get(deckGroupKeyForCard(card))?.quantity || 0;
}

function ownedTotalForDeckKey(deckKey) {
  const variants = cardsByDeckGroupKey.get(deckKey) || [];
  return variants.reduce((sum, card) => sum + ownedFor(card.code), 0);
}

function isDeckFilterActive() {
  return activeDeck.requirements.size > 0;
}

function applyDeckStateToRow(tr, card) {
  tr.classList.remove("deck-sufficient", "deck-insufficient");
  const key = deckGroupKeyForCard(card);
  tr.dataset.deckKey = key;
  const required = deckRequirementForCard(card);
  if (!required) return;
  const ownedTotal = ownedTotalForDeckKey(key);
  tr.classList.add(ownedTotal >= required ? "deck-sufficient" : "deck-insufficient");
}

function refreshRenderedDeckStateForKey(deckKey) {
  const rows = [...tableBody.querySelectorAll("tr")].filter((row) => row.dataset.deckKey === deckKey);
  rows.forEach((row) => {
    const card = cardByCode.get(row.dataset.cardCode || "");
    if (card) applyDeckStateToRow(row, card);
  });
}

function deckFileLabel(fileName) {
  return String(fileName || "").replace(/\.txt$/i, "");
}

function deckDisplayLabelForCard(card) {
  const mode = deckModeForCard(card);
  if (mode === "evolved") return `${canonicalDeckCardName(card.name)} (Evolved)`;
  if (mode === "advanced") return `${canonicalDeckCardName(card.name)} (Advanced)`;
  return canonicalDeckCardName(card.name);
}

function populateDeckFilter(fileNames = []) {
  if (!deckFilter) return;
  availableDeckFiles = [...new Set(fileNames)].sort((a, b) => {
    const aIsDefault = a.toLowerCase() === "deck 1.txt";
    const bIsDefault = b.toLowerCase() === "deck 1.txt";
    if (aIsDefault && !bIsDefault) return -1;
    if (!aIsDefault && bIsDefault) return 1;
    return a.localeCompare(b, undefined, { sensitivity: "base" });
  });
  const current = deckFilter.value;
  deckFilter.innerHTML = '<option value="">No Deck</option>';
  availableDeckFiles.forEach((fileName) => {
    const option = document.createElement("option");
    option.value = fileName;
    option.textContent = deckFileLabel(fileName);
    deckFilter.appendChild(option);
  });
  if (current && availableDeckFiles.includes(current)) {
    deckFilter.value = current;
  } else if (activeDeck.fileName && availableDeckFiles.includes(activeDeck.fileName)) {
    deckFilter.value = activeDeck.fileName;
  } else {
    deckFilter.value = "";
  }
}

function clearActiveDeck({ keepSelection = false } = {}) {
  activeDeck = {
    fileName: "",
    requirements: new Map(),
    unmatchedEntries: [],
  };
  if (deckFilter && !keepSelection) {
    deckFilter.value = "";
  }
  renderTable();
}

function applyDeckListText(textContent, fileName) {
  const parsed = parseDeckListText(textContent);
  activeDeck = {
    fileName: fileName || "",
    requirements: parsed.requirements,
    unmatchedEntries: parsed.unmatchedEntries,
  };
  if (deckFilter) {
    deckFilter.value = fileName || "";
  }
  renderTable();

  const matchedEntries = [...parsed.requirements.entries()].filter(([key]) => cardsByDeckGroupKey.has(key)).length;
  const unmatchedSummary = parsed.unmatchedEntries.length
    ? `\nUnmatched entries: ${parsed.unmatchedEntries.length}`
    : "";
  alert(`Deck loaded: ${deckFileLabel(fileName || "Custom Deck")}\nMatched entries: ${matchedEntries}${unmatchedSummary}`);
}

function promptDeckFileSelection(defaultFileName = "") {
  if (!availableDeckFiles.length) {
    alert("No deck list files are available.");
    return null;
  }

  const deckList = availableDeckFiles
    .map((fileName, index) => `${index + 1}. ${deckFileLabel(fileName)}`)
    .join("\n");
  const suggestedValue = defaultFileName && availableDeckFiles.includes(defaultFileName)
    ? defaultFileName
    : availableDeckFiles[0];
  const response = window.prompt(
    `Choose a deck file by number or file name:\n\n${deckList}`,
    suggestedValue
  );
  if (response == null) return null;
  const trimmed = response.trim();
  if (!trimmed) return null;
  const asNumber = Number.parseInt(trimmed, 10);
  if (Number.isFinite(asNumber) && String(asNumber) === trimmed) {
    return availableDeckFiles[asNumber - 1] || null;
  }
  const directMatch = availableDeckFiles.find((fileName) => fileName.toLowerCase() === trimmed.toLowerCase());
  if (directMatch) return directMatch;
  const labelMatch = availableDeckFiles.find((fileName) => deckFileLabel(fileName).toLowerCase() === trimmed.toLowerCase());
  if (labelMatch) return labelMatch;
  alert("That deck file was not found.");
  return null;
}

function requestRenameDeck(fileName, newFileName) {
  return nativePost({ type: "rename_deck_list", fileName, newFileName });
}

function requestDeckMutation(action, fileName, card) {
  return nativePost({
    type: action === "add" ? "add_card_to_deck" : "remove_card_from_deck",
    fileName,
    cardName: canonicalDeckCardName(card.name),
    deckEntryLabel: deckDisplayLabelForCard(card),
    mode: deckModeForCard(card),
  });
}

function promptRenameSelectedDeck() {
  const currentFile = deckFilter ? deckFilter.value : "";
  if (!currentFile) {
    alert("Select a deck list first.");
    return;
  }
  const nextName = window.prompt("Rename the selected deck file:", deckFileLabel(currentFile));
  if (nextName == null) return;
  const trimmed = nextName.trim();
  if (!trimmed) {
    alert("Enter a deck name.");
    return;
  }
  if (!requestRenameDeck(currentFile, trimmed)) {
    alert("Deck renaming is only available in the Android app build.");
  }
}

function handleDeckLongPress(card) {
  if (isDeckFilterActive()) {
    if (!activeDeck.fileName) return;
    const confirmed = window.confirm(
      `Remove 1x ${deckDisplayLabelForCard(card)} from ${deckFileLabel(activeDeck.fileName)}?`
    );
    if (!confirmed) return;
    if (!requestDeckMutation("remove", activeDeck.fileName, card)) {
      alert("Deck editing is only available in the Android app build.");
    }
    return;
  }

  const targetDeck = promptDeckFileSelection(deckFilter ? deckFilter.value : "");
  if (!targetDeck) return;
  const confirmed = window.confirm(
    `Add 1x ${deckDisplayLabelForCard(card)} to ${deckFileLabel(targetDeck)}?`
  );
  if (!confirmed) return;
  if (!requestDeckMutation("add", targetDeck, card)) {
    alert("Deck editing is only available in the Android app build.");
  }
}

function requestDeckFileList() {
  if (!nativePost({ type: "list_deck_lists" })) {
    populateDeckFilter([]);
  }
}

function requestDeckImport(fileName) {
  if (!fileName) {
    clearActiveDeck();
    return;
  }
  if (!nativePost({ type: "import_deck_list", fileName })) {
    alert("Deck list import is only available in the Android app build.");
  }
}

function saveCollection() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(collection));
}

function loadCollection() {
  try {
    collection = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    collection = {};
  }
}

function ownedFor(code) {
  const value = Number.parseInt(String(collection[code] ?? 0), 10);
  if (Number.isNaN(value)) return 0;
  return Math.max(0, value);
}

function setOwned(code, value) {
  const next = Math.max(0, Math.trunc(value));
  collection[code] = next;
  saveCollection();
}

function populateSetFilter() {
  const sets = [...new Set(cards.map((c) => c.setCode))].sort((a, b) => a.localeCompare(b));
  sets.forEach((setCode) => {
    const opt = document.createElement("option");
    opt.value = setCode;
    opt.textContent = setLabel(setCode);
    setFilter.appendChild(opt);
  });
  if (sets.includes("BP01")) {
    setFilter.value = "BP01";
  }
}

function populateClassFilter() {
  if (!classFilter) return;
  const discovered = new Set(cards.map((c) => c.className).filter(Boolean));
  const classNames = [
    ...CLASS_FILTER_ORDER.filter((className) => discovered.has(className)),
    ...[...discovered].filter((className) => !CLASS_FILTER_ORDER.includes(className)).sort((a, b) => a.localeCompare(b)),
  ];
  classFilter.innerHTML = '<option value="">All</option>';
  classNames.forEach((className) => {
    const opt = document.createElement("option");
    opt.value = className;
    opt.textContent = className;
    classFilter.appendChild(opt);
  });
}

function populateTraitFilter() {
  if (!traitFilter) return;
  const traits = [...new Set(cards.flatMap((c) => c.traits || []).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b)
  );
  traitFilter.innerHTML = '<option value="">All</option>';
  traits.forEach((trait) => {
    const opt = document.createElement("option");
    opt.value = trait;
    opt.textContent = trait;
    traitFilter.appendChild(opt);
  });
}

function populateCardTypeFilter() {
  if (!cardTypeFilter) return;
  const cardTypes = [...new Set(cards.flatMap((c) => c.cardTypes || []).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b)
  );
  cardTypeFilter.innerHTML = '<option value="">All</option>';
  cardTypes.forEach((cardType) => {
    const opt = document.createElement("option");
    opt.value = cardType;
    opt.textContent = cardType;
    cardTypeFilter.appendChild(opt);
  });
}

function sortStatValues(values) {
  return values.sort((a, b) => {
    const aNum = Number(a);
    const bNum = Number(b);
    const aNumeric = !Number.isNaN(aNum);
    const bNumeric = !Number.isNaN(bNum);
    if (aNumeric && bNumeric) return aNum - bNum;
    if (aNumeric) return -1;
    if (bNumeric) return 1;
    return a.localeCompare(b);
  });
}

function populateStatFilter(selectEl, values, emptyLabel) {
  if (!selectEl) return;
  selectEl.innerHTML = `<option value="">${emptyLabel}</option>`;
  sortStatValues(values.filter(Boolean)).forEach((value) => {
    const opt = document.createElement("option");
    opt.value = value;
    opt.textContent = value;
    selectEl.appendChild(opt);
  });
}

function populateStatFilters() {
  populateStatFilter(
    cardCostFilter,
    [...new Set(cards.map((c) => c.cardCost).filter((value) => value && value !== "-"))],
    "All"
  );
  populateStatFilter(
    attackFilter,
    [...new Set(cards.map((c) => c.attack).filter((value) => value && value !== "-"))],
    "All"
  );
  populateStatFilter(
    defenseFilter,
    [...new Set(cards.map((c) => c.defense).filter((value) => value && value !== "-"))],
    "All"
  );
}

function populateArtistFilter() {
  if (!artistFilter) return;
  const artists = [...new Set(cards.map((c) => c.artist).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b)
  );
  artistFilter.innerHTML = '<option value="">All artists</option>';
  artists.forEach((artist) => {
    const opt = document.createElement("option");
    opt.value = artist;
    opt.textContent = artist;
    artistFilter.appendChild(opt);
  });
}

function populateRarityFilter() {
  const rarityGroups = RARITY_FILTER_GROUP_ORDER.filter((group) =>
    cards.some((card) => rarityFilterBucket(card.rarity) === group)
  );

  rarityFilterGroup.innerHTML = "";
  rarityGroups.forEach((rarityGroup) => {
    const label = document.createElement("label");
    label.className = "rarity-option";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.value = rarityGroup;
    input.checked = true;
    input.addEventListener("change", renderTable);
    const text = document.createElement("span");
    text.textContent = rarityGroup;
    label.appendChild(input);
    label.appendChild(text);
    rarityFilterGroup.appendChild(label);
  });
}

function selectedRarities() {
  const selected = new Set(
    [...rarityFilterGroup.querySelectorAll("input[type='checkbox']:checked")].map((el) => el.value)
  );
  return selected;
}

function matchesActiveFilters(card, qty = ownedFor(card.code)) {
  const text = appliedSearchText;
  const set = setFilter.value;
  const className = classFilter ? classFilter.value : "";
  const trait = traitFilter ? traitFilter.value : "";
  const cardType = cardTypeFilter ? cardTypeFilter.value : "";
  const cardCost = cardCostFilter ? cardCostFilter.value : "";
  const attack = attackFilter ? attackFilter.value : "";
  const defense = defenseFilter ? defenseFilter.value : "";
  const artist = artistFilter ? artistFilter.value : "";
  const selected = selectedRarities();
  const requireOwned = ownedOnly.checked;
  const requireIncomplete = incompleteOnly.checked;
  const requireExtra = extraOnly ? extraOnly.checked : false;
  const playsetLimit = playsetLimitForCard(card);
  const deckRequirement = deckRequirementForCard(card);

  if (set && card.setCode !== set) return false;
  if (className && card.className !== className) return false;
  if (trait && !(card.traits || []).includes(trait)) return false;
  if (cardType && !(card.cardTypes || []).includes(cardType)) return false;
  if (cardCost && card.cardCost !== cardCost) return false;
  if (attack && card.attack !== attack) return false;
  if (defense && card.defense !== defense) return false;
  if (artist && card.artist !== artist) return false;
  if (selected.size > 0 && !selected.has(rarityFilterBucket(card.rarity))) return false;
  if (requireOwned && qty === 0) return false;
  if (requireIncomplete && qty >= playsetLimit) return false;
  if (requireExtra && qty <= playsetLimit) return false;
  if (isDeckFilterActive() && deckRequirement === 0) return false;
  if (!text) return true;
  return card.name.toLowerCase().includes(text) || card.code.toLowerCase().includes(text);
}

function filteredCards() {
  const set = setFilter.value;
  const rows = cards.filter((card) => matchesActiveFilters(card));

  if (isDeckFilterActive()) {
    rows.sort((a, b) => {
      const aEntry = activeDeck.requirements.get(deckGroupKeyForCard(a));
      const bEntry = activeDeck.requirements.get(deckGroupKeyForCard(b));
      const aName = canonicalDeckCardName(a.name);
      const bName = canonicalDeckCardName(b.name);
      const aMode = deckModeForCard(a);
      const bMode = deckModeForCard(b);
      const aOrder = aEntry?.order ?? Number.MAX_SAFE_INTEGER;
      const bOrder = bEntry?.order ?? Number.MAX_SAFE_INTEGER;
      const aModeRank = aMode === "base" ? 0 : aMode === "evolved" ? 1 : 2;
      const bModeRank = bMode === "base" ? 0 : bMode === "evolved" ? 1 : 2;

      return (
        aOrder - bOrder ||
        aName.localeCompare(bName, undefined, { sensitivity: "base" }) ||
        aModeRank - bModeRank ||
        a.code.localeCompare(b.code, undefined, { numeric: true, sensitivity: "base" })
      );
    });
    return rows;
  }

  if (set === "PR") {
    rows.sort((a, b) => {
      const pa = promoOrderIndex(a.code);
      const pb = promoOrderIndex(b.code);
      if (pa !== pb) return pa - pb;
      return a.code.localeCompare(b.code);
    });
  }

  return rows;
}

function updateSidebarState() {
  const hidden = document.body.classList.contains("sidebar-hidden");
  sidebarToggle.setAttribute("aria-expanded", String(!hidden));
  sidebarToggle.title = hidden ? "Show filters" : "Hide filters";
}

function rarityFilterBucket(rarity) {
  switch (String(rarity || "")) {
    case "Premium":
    case "Super Legendary":
    case "Ultimate":
    case "Special":
    case "Super Special":
      return "High";
    case "Leader":
      return "Leader";
    case "Promo":
      return "Promo";
    case "Token":
      return "Token";
    case "Evo Point":
      return "Evo Point";
    case "Base":
    case "Uncategorized":
    default:
      return "Base";
  }
}

function updateActionsSidebarState() {
  if (!actionsToggle) return;
  const hidden = document.body.classList.contains("actions-sidebar-hidden");
  actionsToggle.setAttribute("aria-expanded", String(!hidden));
  actionsToggle.title = hidden ? "Show actions" : "Hide actions";
}

function setSearchSidebarVisible(visible) {
  document.body.classList.toggle("sidebar-hidden", !visible);
  if (visible) {
    document.body.classList.add("actions-sidebar-hidden");
  }
  updateSidebarState();
  updateActionsSidebarState();
}

function setActionsSidebarVisible(visible) {
  document.body.classList.toggle("actions-sidebar-hidden", !visible);
  if (visible) {
    document.body.classList.add("sidebar-hidden");
  }
  updateSidebarState();
  updateActionsSidebarState();
}

function updateLegalState(expanded) {
  if (!legalToggle || !legalText || !legalBackdrop) return;
  legalToggle.setAttribute("aria-expanded", String(expanded));
  legalText.classList.toggle("hidden", !expanded);
  legalBackdrop.classList.toggle("hidden", !expanded);
}

function updateZoomNavState() {
  if (!zoomNavLeft || !zoomNavRight) return;
  const hasMulti = zoomState.cards.length > 1;
  zoomNavLeft.classList.toggle("disabled", !hasMulti);
  zoomNavRight.classList.toggle("disabled", !hasMulti);
}

function closeZoom() {
  document.querySelectorAll(".card-art.zoomed").forEach((el) => el.classList.remove("zoomed"));
  document.body.classList.remove("zoom-active");
  if (zoomPromoInfo) {
    zoomPromoInfo.classList.add("hidden");
    zoomPromoInfo.textContent = "";
  }
  if (zoomState.anchorEl && zoomState.anchorCode) {
    const anchorCard = cards.find((c) => c.code === zoomState.anchorCode);
    if (anchorCard) applyArtToImage(zoomState.anchorEl, anchorCard);
  }
  zoomState = { cards: [], index: -1, anchorEl: null, anchorCode: "" };
  updateZoomNavState();
}

function setZoomedElement(nextIndex) {
  if (!zoomState.cards.length || !zoomState.anchorEl) return;
  const len = zoomState.cards.length;
  const wrapped = ((nextIndex % len) + len) % len;
  const zoomCard = zoomState.cards[wrapped];
  zoomState.index = wrapped;
  applyArtToImage(zoomState.anchorEl, zoomCard);
  zoomState.anchorEl.classList.add("zoomed");
  document.body.classList.add("zoom-active");
  updateZoomPromoInfo(zoomCard);
  updateZoomNavState();
}

function openZoomFor(artEl) {
  const name = artEl.dataset.cardName || "";
  const code = artEl.dataset.cardCode || "";
  const baseCode = artEl.dataset.baseCardCode || code;
  if (!name || !code) return;

  if (artEl.classList.contains("zoomed")) {
    closeZoom();
    return;
  }

  const baseCard = cardByCode.get(baseCode) || cards.find((c) => c.code === baseCode) || null;
  const clickedCard =
    cardByCode.get(code) ||
    cards.find((c) => c.code === code) ||
    (baseCard ? resolveFaceCard(baseCard, code) : null);
  if (!clickedCard) return;

  // Use full dataset (not current set filter) and keep evolved/non-evolved separate.
  const group = cards.filter((c) => c.name === clickedCard.name && c.isEvolved === clickedCard.isEvolved);
  if (!group.length) {
    closeZoom();
    zoomState = {
      cards: [clickedCard],
      index: 0,
      anchorEl: artEl,
      anchorCode: clickedCard.code,
    };
    artEl.classList.add("zoomed");
    setZoomedElement(0);
    return;
  }
  if (!group.some((c) => c.code === clickedCard.code)) {
    group.unshift(clickedCard);
  }

  closeZoom();
  zoomState = {
    cards: group,
    index: group.findIndex((c) => c.code === clickedCard.code),
    anchorEl: artEl,
    anchorCode: clickedCard.code,
  };
  artEl.classList.add("zoomed");
  setZoomedElement(zoomState.index);
}

function navigateZoom(step) {
  if (!zoomState.cards.length) return;
  setZoomedElement(zoomState.index + step);
}

function cardFaces(card) {
  const group = dualGroupByCode.get(card.code);
  if (!group || group.length < 2) return [card.code];
  return group;
}

function resolveFaceCard(baseCard, faceCode) {
  const byCode = cardByCode.get(faceCode);
  if (byCode) return byCode;
  return {
    ...baseCard,
    code: faceCode,
    setCode: setCodeFromCardCode(faceCode),
    artUrl: "",
  };
}

function setCardFace(artEl, baseCard, faceCode) {
  const faceCard = resolveFaceCard(baseCard, faceCode);
  applyArtToImage(artEl, faceCard);
  artEl.dataset.cardName = faceCard.name;
  artEl.dataset.cardCode = faceCard.code;
  artEl.dataset.baseCardCode = baseCard.code;
}

function createZoomNav() {
  if (zoomNavLeft && zoomNavRight) return;

  zoomNavLeft = document.createElement("button");
  zoomNavRight = document.createElement("button");

  zoomNavLeft.type = "button";
  zoomNavRight.type = "button";
  zoomNavLeft.className = "zoom-nav zoom-nav-left disabled";
  zoomNavRight.className = "zoom-nav zoom-nav-right disabled";
  zoomNavLeft.textContent = "<";
  zoomNavRight.textContent = ">";
  zoomNavLeft.setAttribute("aria-label", "Previous matching card");
  zoomNavRight.setAttribute("aria-label", "Next matching card");

  zoomNavLeft.addEventListener("click", () => navigateZoom(-1));
  zoomNavRight.addEventListener("click", () => navigateZoom(1));

  document.body.appendChild(zoomNavLeft);
  document.body.appendChild(zoomNavRight);
}

function createZoomPromoInfo() {
  if (zoomPromoInfo) return;
  zoomPromoInfo = document.createElement("div");
  zoomPromoInfo.className = "zoom-promo-info hidden";
  zoomPromoInfo.setAttribute("aria-live", "polite");
  document.body.appendChild(zoomPromoInfo);
}

function createRow(card) {
  const fragment = rowTemplate.content.cloneNode(true);
  const tr = fragment.querySelector("tr");
  tr.dataset.cardCode = card.code;
  const qtyEl = fragment.querySelector(".qty-value");
  const artEl = fragment.querySelector(".card-art");
  const dualBtn = fragment.querySelector(".dual-toggle");
  const faces = cardFaces(card);
  let faceIndex = 0;
  let longPressTimer = null;
  let longPressTriggered = false;
  setCardFace(artEl, card, faces[faceIndex]);
  artEl.addEventListener("click", () => {
    if (longPressTriggered) {
      longPressTriggered = false;
      return;
    }
    openZoomFor(artEl);
  });

  function clearLongPress() {
    if (longPressTimer) {
      window.clearTimeout(longPressTimer);
      longPressTimer = null;
    }
  }

  artEl.addEventListener("pointerdown", (ev) => {
    if (ev.button !== 0) return;
    longPressTriggered = false;
    clearLongPress();
    longPressTimer = window.setTimeout(() => {
      longPressTimer = null;
      longPressTriggered = true;
      handleDeckLongPress(card);
    }, LONG_PRESS_MS);
  });
  ["pointerup", "pointerleave", "pointercancel", "dragstart"].forEach((eventName) => {
    artEl.addEventListener(eventName, clearLongPress);
  });

  if (faces.length > 1) {
    dualBtn.classList.remove("hidden");
    dualBtn.addEventListener("click", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      faceIndex = (faceIndex + 1) % faces.length;
      setCardFace(artEl, card, faces[faceIndex]);
    });
  }

  fragment.querySelector(".card-name").textContent = card.name;
  fragment.querySelector(".card-code").textContent = card.code;
  fragment.querySelector(".card-set").textContent = card.setCode;
  fragment.querySelector(".promo-source").textContent = card.promoSource;
  qtyEl.textContent = String(ownedFor(card.code));
  applyDeckStateToRow(tr, card);

  function updateOwnedCount(delta) {
    const wasVisible = matchesActiveFilters(card);
    const next = ownedFor(card.code) + delta;
    setOwned(card.code, next);
    const currentQty = ownedFor(card.code);
    const isVisible = matchesActiveFilters(card, currentQty);
    qtyEl.textContent = String(currentQty);

    if (wasVisible !== isVisible) {
      renderTable();
      return;
    }

    refreshRenderedDeckStateForKey(deckGroupKeyForCard(card));
  }

  fragment.querySelector(".dec").addEventListener("click", () => {
    updateOwnedCount(-1);
  });

  fragment.querySelector(".inc").addEventListener("click", () => {
    updateOwnedCount(1);
  });

  return tr;
}

function renderTable() {
  closeZoom();
  tableBody.innerHTML = "";
  const rows = filteredCards();
  const fragment = document.createDocumentFragment();
  rows.forEach((card) => fragment.appendChild(createRow(card)));
  tableBody.appendChild(fragment);
}

async function exportCollection() {
  const proceed = window.confirm("Export collection now? You can choose where to save the JSON file.");
  if (!proceed) return;
  const payload = {
    exportedAt: new Date().toISOString(),
    data: collection,
  };
  const jsonText = JSON.stringify(payload, null, 2);
  const filename = "sve-collection-export.json";

  if (nativePost({ type: "export_collection", jsonText })) {
    return;
  }

  if ("showSaveFilePicker" in window) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: filename,
        types: [
          {
            description: "JSON",
            accept: { "application/json": [".json"] },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(jsonText);
      await writable.close();
      alert("Collection export complete.");
      return;
    } catch {
      // Fall back to download link.
    }
  }

  const file = new File([jsonText], filename, { type: "application/json" });
  if ("share" in navigator) {
    try {
      const canShareFiles =
        !("canShare" in navigator) || navigator.canShare({ files: [file] });
      if (canShareFiles) {
        await navigator.share({
          title: "SVE Collection Export",
          text: "Shadowverse: Evolve collection export",
          files: [file],
        });
        alert("Collection export shared.");
        return;
      }
    } catch {
      // Fall through to download fallback.
    }
  }

  const blob = new Blob([jsonText], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);

  if (location.protocol === "file:") {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(jsonText);
      }
    } catch {
      // ignore clipboard failure
    }
    localStorage.setItem("sve_last_export_json", jsonText);
    localStorage.setItem("sve_last_export_filename", filename);
    alert(
      "If file download does not appear on Android, use Share when available. A backup was saved in-app and copied to clipboard when possible."
    );
  } else {
    alert("Collection export started. Check your Downloads folder if no location picker appeared.");
  }
}

function filteredIncompleteCards() {
  return filteredCards().filter((card) => ownedFor(card.code) < playsetLimitForCard(card));
}

function incompleteExportText() {
  return filteredIncompleteCards()
    .map((card) => ({
      setCode: card.setCode,
      code: card.code,
      missing: Math.max(0, playsetLimitForCard(card) - ownedFor(card.code)),
      name: card.name,
    }))
    .sort((a, b) => a.setCode.localeCompare(b.setCode) || a.code.localeCompare(b.code))
    .map((entry) => `${entry.missing}x ${entry.name} (${entry.code})`)
    .join("\n");
}

async function exportIncompleteList() {
  const textContent = incompleteExportText();
  if (!textContent) {
    alert("No incomplete cards match the current filters.");
    return;
  }

  const proceed = window.confirm(
    "Export the filtered incomplete list now? This records only the missing copies based on the current filters."
  );
  if (!proceed) return;

  const filename = `sve-incomplete-${new Date().toISOString().replace(/[:.]/g, "-")}.txt`;

  if (nativePost({ type: "export_incomplete", textContent, filename })) {
    return;
  }

  const blob = new Blob([textContent], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  alert("Incomplete list export started.");
}

function importCollection(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      importCollectionFromText(String(reader.result || "{}"));
      alert("Collection import complete.");
    } catch {
      alert("Import failed. Use a valid export JSON file.");
    }
  };
  reader.readAsText(file);
}

async function promptImportCollection() {
  const proceed = window.confirm("Import collection now? Select a previously exported JSON file.");
  if (!proceed) return;

  if (nativePost({ type: "import_latest" })) {
    return;
  }

  if ("showOpenFilePicker" in window) {
    try {
      const [handle] = await window.showOpenFilePicker({
        multiple: false,
        types: [
          {
            description: "JSON",
            accept: { "application/json": [".json"] },
          },
        ],
      });
      const file = await handle.getFile();
      importCollection(file);
      return;
    } catch {
      // Fall back to hidden input.
    }
  }

  importInput.click();
}

async function loadCards() {
  let cardTypeMap = {};
  if (EMBEDDED_CARDTYPE_DATA && typeof EMBEDDED_CARDTYPE_DATA === "object") {
    cardTypeMap = EMBEDDED_CARDTYPE_DATA;
  } else {
    try {
      const typeRes = await fetch(CARD_TYPE_URL);
      if (typeRes.ok) cardTypeMap = await typeRes.json();
    } catch {
      cardTypeMap = {};
    }
  }

  let csvText = EMBEDDED_CSV_DATA;
  if (typeof csvText !== "string" || csvText.length === 0) {
    const response = await fetch(DATA_URL);
    if (!response.ok) {
      throw new Error(`Failed to load card data from ${DATA_URL}`);
    }
    csvText = await response.text();
  }

  const parsed = parseCsv(csvText);
  cards = parsed.map((r) => {
    const rawCode = r["Card Code"];
    const rarityInfo = parseRarityFromCardCode(rawCode);
    const parsedCardTypes = parseCardTypes(r["Card Type"]);
    return {
      name: r["Card Name"],
      code: rawCode,
      className: r["Class"] || "",
      traits: parseTraits(r["Traits"]),
      cardTypes: parsedCardTypes,
      cardCost: r["Card Cost"] || "",
      attack: r["Attack"] || "",
      defense: r["Defense"] || "",
      artist: r["Artist"] || "Uncredited",
      promoSource: r["Promo Obtain Source (if PR in code)"] || "",
      artUrl: r["Art URL"] || "",
      setCode: setCodeFromCardCode(rawCode),
      rarity: rarityInfo.rarity,
      rarityOutlier: rarityInfo.outlier,
      rarityOutlierReason: rarityInfo.outlierReason,
      isEvolved: isEvolvedType(cardTypeMap[rawCode], r["Card Name"]),
      isAdvanced: parsedCardTypes.some((value) => String(value).toUpperCase() === "ADVANCED"),
    };
  });

  function insertMissingCardByCodeOrder(card) {
    const compare = (a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
    const sameSetIndices = cards
      .map((c, idx) => ({ c, idx }))
      .filter((x) => x.c.setCode === card.setCode);
    if (!sameSetIndices.length) {
      cards.push(card);
      return;
    }
    const ahead = sameSetIndices.find((x) => compare(x.c.code, card.code) > 0);
    if (ahead) {
      cards.splice(ahead.idx, 0, card);
      return;
    }
    const last = sameSetIndices[sameSetIndices.length - 1];
    cards.splice(last.idx + 1, 0, card);
  }

  MISSING_FRONT_CARD_OVERRIDES.forEach((entry) => {
    if (cards.some((c) => c.code === entry.code)) return;
    const rarityInfo = parseRarityFromCardCode(entry.code);
    insertMissingCardByCodeOrder({
      name: entry.name,
      code: entry.code,
      className: "",
      traits: [],
      cardTypes: [],
      cardCost: "",
      attack: "",
      defense: "",
      artist: "Uncredited",
      promoSource: "",
      artUrl: "",
      setCode: setCodeFromCardCode(entry.code),
      rarity: rarityInfo.rarity,
      rarityOutlier: rarityInfo.outlier,
      rarityOutlierReason: rarityInfo.outlierReason,
      isEvolved: entry.isEvolved,
      isAdvanced: false,
    });
  });

  // Ensure known dual-sided entries are present even when not emitted by upstream export.
  if (!cards.some((c) => c.code === "BP08-003EN")) {
    const rarityInfo = parseRarityFromCardCode("BP08-003EN");
    const bp08003 = {
      name: "Orchis, Resolute Puppet",
      code: "BP08-003EN",
      className: "",
      traits: [],
      cardTypes: [],
      cardCost: "",
      attack: "",
      defense: "",
      artist: "Uncredited",
      promoSource: "",
      artUrl: "",
      setCode: "BP08",
      rarity: rarityInfo.rarity,
      rarityOutlier: rarityInfo.outlier,
      rarityOutlierReason: rarityInfo.outlierReason,
      isEvolved: true,
      isAdvanced: false,
    };
    const bp08002Index = cards.findIndex((c) => c.code === "BP08-002EN");
    if (bp08002Index >= 0) {
      cards.splice(bp08002Index + 1, 0, bp08003);
    } else {
      cards.push(bp08003);
    }
  }

  initDualGroups();
  cardByCode = new Map(cards.map((card) => [card.code, card]));
  buildDeckIndexes();
  buildScanIndexes();

  rarityOutliers = cards.filter((c) => c.rarityOutlier).map((c) => ({
    code: c.code,
    name: c.name,
    reason: c.rarityOutlierReason,
  }));
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }
}

function triggerHapticFeedback() {
  try {
    if (nativePost({ type: "haptic_feedback", style: "light" })) return;
    if (navigator.vibrate) navigator.vibrate(8);
  } catch {
    // Ignore unsupported platforms.
  }
}

function bindEvents() {
  searchBtn.addEventListener("click", () => {
    appliedSearchText = searchInput.value.trim().toLowerCase();
    renderTable();
  });
  searchInput.addEventListener("keydown", (ev) => {
    if (ev.key !== "Enter") return;
    ev.preventDefault();
    appliedSearchText = searchInput.value.trim().toLowerCase();
    renderTable();
  });
  setFilter.addEventListener("change", renderTable);
  if (classFilter) classFilter.addEventListener("change", renderTable);
  if (traitFilter) traitFilter.addEventListener("change", renderTable);
  if (cardTypeFilter) cardTypeFilter.addEventListener("change", renderTable);
  if (cardCostFilter) cardCostFilter.addEventListener("change", renderTable);
  if (attackFilter) attackFilter.addEventListener("change", renderTable);
  if (defenseFilter) defenseFilter.addEventListener("change", renderTable);
  if (artistFilter) artistFilter.addEventListener("change", renderTable);
  ownedOnly.addEventListener("change", renderTable);
  incompleteOnly.addEventListener("change", renderTable);
  if (extraOnly) extraOnly.addEventListener("change", renderTable);
  if (legalToggle && legalText && legalBackdrop) {
    legalToggle.addEventListener("click", () => {
      const expanded = legalToggle.getAttribute("aria-expanded") === "true";
      updateLegalState(!expanded);
    });
    legalBackdrop.addEventListener("click", () => {
      updateLegalState(false);
    });
    document.addEventListener("keydown", (ev) => {
      if (ev.key === "Escape") updateLegalState(false);
    });
  }
  sidebarToggle.addEventListener("click", () => {
    const willShow = document.body.classList.contains("sidebar-hidden");
    setSearchSidebarVisible(willShow);
  });
  if (actionsToggle) {
    actionsToggle.addEventListener("click", () => {
      const willShow = document.body.classList.contains("actions-sidebar-hidden");
      setActionsSidebarVisible(willShow);
      if (willShow) requestDeckFileList();
    });
  }
  exportBtn.addEventListener("click", () => {
    exportCollection();
  });
  if (exportIncompleteBtn) {
    exportIncompleteBtn.addEventListener("click", () => {
      exportIncompleteList();
    });
  }
  if (renameDeckBtn) {
    renameDeckBtn.addEventListener("click", () => {
      promptRenameSelectedDeck();
    });
  }
  if (deckFilter) {
    deckFilter.addEventListener("change", () => {
      requestDeckImport(deckFilter.value);
    });
  }
  if (scanBtn) {
    scanBtn.addEventListener("click", () => {
      startNativeScan();
    });
  }
  importBtn.addEventListener("click", () => {
    promptImportCollection();
  });
  importInput.addEventListener("change", () => {
    const file = importInput.files?.[0];
    if (file) importCollection(file);
    importInput.value = "";
  });
  document.body.addEventListener(
    "pointerdown",
    (ev) => {
      if (ev.target instanceof Element && ev.target.closest("button")) {
        triggerHapticFeedback();
      }
    },
    { passive: true }
  );
  document.body.addEventListener(
    "pointerdown",
    (ev) => {
      if (!document.body.classList.contains("zoom-active")) return;
      if (!(ev.target instanceof Element)) return;
      if (ev.target.closest("button")) return;
      if (ev.target.closest(".card-art.zoomed")) return;
      closeZoom();
    },
    { passive: true }
  );
}

async function start() {
  loadCollection();
  createZoomNav();
  createZoomPromoInfo();
  bindEvents();
  updateLegalState(false);
  if (!document.body.classList.contains("actions-sidebar-hidden")) {
    document.body.classList.add("actions-sidebar-hidden");
  }
  updateSidebarState();
  updateActionsSidebarState();
  registerServiceWorker();
  try {
    await loadCards();
    populateSetFilter();
    populateClassFilter();
    populateTraitFilter();
    populateCardTypeFilter();
    populateStatFilters();
    populateArtistFilter();
    populateRarityFilter();
    requestDeckFileList();
    renderTable();
    if (rarityOutliers.length) {
      console.warn("Rarity outliers detected and left uncategorized:", rarityOutliers);
    }
  } catch (err) {
    tableBody.innerHTML = `<tr><td colspan="6">${String(err.message || err)}</td></tr>`;
  }
}

start();






