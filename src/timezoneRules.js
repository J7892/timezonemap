/**
 * timezoneRules.js
 *
 * Statutory and legislative timezone rules for Canadian provinces,
 * territories, and sub-provincial divisions.
 *
 * Reflects November 2026 daylight saving transitions:
 * - BC: Permanent Pacific Daylight Time (UTC-7)
 * - Peace River & Creston (BC): Year-round Mountain Standard Time (UTC-7)
 * - East Kootenay (BC): Permanent Mountain Time (UTC-6)
 * - Alberta: Permanent Mountain Daylight Time (UTC-6)
 * - Saskatchewan: Permanent Central Standard Time (UTC-6)
 * - Manitoba: Permanent Central Daylight Time (UTC-5)
 * - NW Ontario (Kenora/Rainy River): Permanent Central Daylight Time (UTC-5)
 * - Atikokan & Pickle Lake (ON): Year-round Eastern Standard Time (UTC-5)
 * - Southern & Eastern Ontario: Falls back to EST (UTC-5)
 * - Quebec (Main): Falls back to EST (UTC-5)
 * - Lower North Shore / Blanc-Sablon (QC): Year-round AST (UTC-4)
 * - Atlantic Canada (NB, NS, PE, Labrador): Falls back to AST (UTC-4)
 * - Newfoundland Island: Falls back to NST (UTC-3:30)
 * - Yukon: Permanent UTC-7
 * - Northwest Territories: Permanent Mountain Time (UTC-6)
 * - Nunavut Kitikmeot: Falls back to MST (UTC-7)
 * - Nunavut Kivalliq: Falls back to CST (UTC-6)
 * - Nunavut Coral Harbour: Year-round EST (UTC-5)
 * - Nunavut Qikiqtaaluk: Falls back to EST (UTC-5)
 */

export const TRANSITION_2026_UTC = {
  NEWFOUNDLAND: new Date('2026-11-01T04:30:00Z').getTime(), // 02:00 NDT -> 04:30 UTC
  ATLANTIC: new Date('2026-11-01T05:00:00Z').getTime(),     // 02:00 ADT -> 05:00 UTC
  EASTERN: new Date('2026-11-01T06:00:00Z').getTime(),      // 02:00 EDT -> 06:00 UTC
  CENTRAL: new Date('2026-11-01T07:00:00Z').getTime(),      // 02:00 CDT -> 07:00 UTC
  MOUNTAIN: new Date('2026-11-01T08:00:00Z').getTime(),     // 02:00 MDT -> 08:00 UTC
};

export const TIMEZONE_RULES = {
  'CA-BC-PACIFIC': {
    id: 'CA-BC-PACIFIC',
    name: 'British Columbia (Pacific)',
    province: 'British Columbia',
    ianaZone: 'America/Vancouver',
    permanent: true,
    policyName: 'Permanent Pacific Daylight Time',
    legalNote: 'B.C. abolished seasonal time changes, remaining permanently on Pacific Daylight Time (UTC-7).',
    getOffset: () => -7,
    getAbbr: () => 'PDT',
    hasFallBack2026: false
  },
  'CA-BC-PEACE-RIVER': {
    id: 'CA-BC-PEACE-RIVER',
    name: 'Peace River District (BC)',
    province: 'British Columbia',
    ianaZone: 'America/Dawson_Creek',
    permanent: true,
    policyName: 'Year-Round Mountain Standard Time',
    legalNote: 'Peace River Regional District observes Mountain Standard Time year-round without daylight saving changes.',
    getOffset: () => -7,
    getAbbr: () => 'MST',
    hasFallBack2026: false
  },
  'CA-BC-CRESTON': {
    id: 'CA-BC-CRESTON',
    name: 'Creston Valley (BC)',
    province: 'British Columbia',
    ianaZone: 'America/Creston',
    permanent: true,
    policyName: 'Year-Round Mountain Standard Time',
    legalNote: 'Creston Valley observes Mountain Standard Time year-round without daylight saving changes.',
    getOffset: () => -7,
    getAbbr: () => 'MST',
    hasFallBack2026: false
  },
  'CA-BC-FORT-NELSON': {
    id: 'CA-BC-FORT-NELSON',
    name: 'Northern Rockies / Fort Nelson (BC)',
    province: 'British Columbia',
    ianaZone: 'America/Fort_Nelson',
    permanent: true,
    policyName: 'Year-Round Mountain Standard Time',
    legalNote: 'The Northern Rockies Regional Municipality (Fort Nelson) chose in 2015 to stay permanently on Mountain Standard Time (UTC-7) year-round without daylight saving adjustments.',
    getOffset: () => -7,
    getAbbr: () => 'MST',
    hasFallBack2026: false
  },
  'CA-BC-EAST-KOOTENAY': {
    id: 'CA-BC-EAST-KOOTENAY',
    name: 'East Kootenay (BC)',
    province: 'British Columbia',
    ianaZone: 'America/Edmonton',
    permanent: true,
    policyName: 'Permanent Mountain Time (Aligned with Alberta)',
    legalNote: 'East Kootenay region observes Mountain Time and aligns with Alberta’s permanent Mountain Time (UTC-6).',
    getOffset: () => -6,
    getAbbr: () => 'MDT',
    hasFallBack2026: false
  },
  'CA-AB': {
    id: 'CA-AB',
    name: 'Alberta',
    province: 'Alberta',
    ianaZone: 'America/Edmonton',
    permanent: true,
    policyName: 'Permanent Alberta Time (Mountain Daylight Time)',
    legalNote: 'Alberta adopted permanent Alberta Time (Mountain Daylight Time, UTC-6), ending the seasonal clock switch.',
    getOffset: () => -6,
    getAbbr: () => 'MDT',
    hasFallBack2026: false
  },
  'CA-SK': {
    id: 'CA-SK',
    name: 'Saskatchewan (Main)',
    province: 'Saskatchewan',
    ianaZone: 'America/Regina',
    permanent: true,
    policyName: 'Year-Round Central Standard Time',
    legalNote: 'Saskatchewan observes Central Standard Time (UTC-6) year-round without seasonal clock changes.',
    getOffset: () => -6,
    getAbbr: () => 'CST',
    hasFallBack2026: false
  },
  'CA-SK-LLOYDMINSTER': {
    id: 'CA-SK-LLOYDMINSTER',
    name: 'Lloydminster (Saskatchewan)',
    province: 'Saskatchewan',
    ianaZone: 'America/Edmonton',
    permanent: true,
    policyName: 'Permanent Mountain Time (Alberta Alignment)',
    legalNote: 'By provincial charter, Lloydminster follows Alberta time (Mountain Daylight Time, UTC-6) year-round.',
    getOffset: () => -6,
    getAbbr: () => 'MDT',
    hasFallBack2026: false
  },
  'CA-SK-CREIGHTON': {
    id: 'CA-SK-CREIGHTON',
    name: 'Creighton & Denare Beach (SK)',
    province: 'Saskatchewan',
    ianaZone: 'America/Winnipeg',
    permanent: true,
    policyName: 'Permanent Central Daylight Time (Manitoba Alignment)',
    legalNote: 'Creighton and Denare Beach align with neighbouring Flin Flon, Manitoba, observing permanent Central Daylight Time (UTC-5).',
    getOffset: () => -5,
    getAbbr: () => 'CDT',
    hasFallBack2026: false
  },
  'CA-MB': {
    id: 'CA-MB',
    name: 'Manitoba',
    province: 'Manitoba',
    ianaZone: 'America/Winnipeg',
    permanent: true,
    policyName: 'Permanent Central Daylight Time',
    legalNote: 'Manitoba moved to permanent Central Daylight Time (UTC-5), ending the autumn clock rollback.',
    getOffset: () => -5,
    getAbbr: () => 'CDT',
    hasFallBack2026: false
  },
  'CA-ON-NW': {
    id: 'CA-ON-NW',
    name: 'Northwestern Ontario (Central)',
    province: 'Ontario',
    ianaZone: 'America/Winnipeg',
    permanent: true,
    policyName: 'Permanent Central Daylight Time (Manitoba Alignment)',
    legalNote: 'Northwestern Ontario border communities (Kenora, Dryden, Fort Frances, Sioux Lookout) do not fall back, staying on permanent Central Daylight Time (UTC-5) to align with Manitoba.',
    getOffset: () => -5,
    getAbbr: () => 'CDT',
    hasFallBack2026: false
  },
  'CA-ON-ATIKOKAN': {
    id: 'CA-ON-ATIKOKAN',
    name: 'Atikokan & Pickle Lake (ON)',
    province: 'Ontario',
    ianaZone: 'America/Atikokan',
    permanent: true,
    policyName: 'Year-Round Eastern Standard Time',
    legalNote: 'Atikokan and Pickle Lake observe Eastern Standard Time (UTC-5) year-round without daylight saving adjustments.',
    getOffset: () => -5,
    getAbbr: () => 'EST',
    hasFallBack2026: false
  },
  'CA-ON-SOUTH': {
    id: 'CA-ON-SOUTH',
    name: 'Southern & Eastern Ontario',
    province: 'Ontario',
    ianaZone: 'America/Toronto',
    permanent: false,
    policyName: 'Seasonal Eastern Time (Observes Fall-Back)',
    legalNote: 'Southern and Eastern Ontario observe seasonal time changes, setting clocks back 1 hour from EDT (UTC-4) to EST (UTC-5) on Nov 1, 2026.',
    getOffset: (t) => (t < TRANSITION_2026_UTC.EASTERN ? -4 : -5),
    getAbbr: (t) => (t < TRANSITION_2026_UTC.EASTERN ? 'EDT' : 'EST'),
    hasFallBack2026: true,
    transitionUtc: TRANSITION_2026_UTC.EASTERN
  },
  'CA-QC-MAIN': {
    id: 'CA-QC-MAIN',
    name: 'Quebec (Main)',
    province: 'Quebec',
    ianaZone: 'America/Toronto',
    permanent: false,
    policyName: 'Seasonal Eastern Time (Observes Fall-Back)',
    legalNote: 'Quebec observes seasonal time changes, setting clocks back 1 hour from EDT (UTC-4) to EST (UTC-5) on Nov 1, 2026.',
    getOffset: (t) => (t < TRANSITION_2026_UTC.EASTERN ? -4 : -5),
    getAbbr: (t) => (t < TRANSITION_2026_UTC.EASTERN ? 'EDT' : 'EST'),
    hasFallBack2026: true,
    transitionUtc: TRANSITION_2026_UTC.EASTERN
  },
  'CA-QC-BLANC-SABLON': {
    id: 'CA-QC-BLANC-SABLON',
    name: 'Lower North Shore / Blanc-Sablon (QC)',
    province: 'Quebec',
    ianaZone: 'America/Blanc-Sablon',
    permanent: true,
    policyName: 'Year-Round Atlantic Standard Time',
    legalNote: 'Le Golfe-du-Saint-Laurent / Lower North Shore east of the Natashquan River observes Atlantic Standard Time (UTC-4) year-round.',
    getOffset: () => -4,
    getAbbr: () => 'AST',
    hasFallBack2026: false
  },
  'CA-NB': {
    id: 'CA-NB',
    name: 'New Brunswick',
    province: 'New Brunswick',
    ianaZone: 'America/Moncton',
    permanent: false,
    policyName: 'Seasonal Atlantic Time (Observes Fall-Back)',
    legalNote: 'New Brunswick observes seasonal time changes, setting clocks back 1 hour from ADT (UTC-3) to AST (UTC-4) on Nov 1, 2026.',
    getOffset: (t) => (t < TRANSITION_2026_UTC.ATLANTIC ? -3 : -4),
    getAbbr: (t) => (t < TRANSITION_2026_UTC.ATLANTIC ? 'ADT' : 'AST'),
    hasFallBack2026: true,
    transitionUtc: TRANSITION_2026_UTC.ATLANTIC
  },
  'CA-NS': {
    id: 'CA-NS',
    name: 'Nova Scotia',
    province: 'Nova Scotia',
    ianaZone: 'America/Halifax',
    permanent: false,
    policyName: 'Seasonal Atlantic Time (Observes Fall-Back)',
    legalNote: 'Nova Scotia observes seasonal time changes, setting clocks back 1 hour from ADT (UTC-3) to AST (UTC-4) on Nov 1, 2026.',
    getOffset: (t) => (t < TRANSITION_2026_UTC.ATLANTIC ? -3 : -4),
    getAbbr: (t) => (t < TRANSITION_2026_UTC.ATLANTIC ? 'ADT' : 'AST'),
    hasFallBack2026: true,
    transitionUtc: TRANSITION_2026_UTC.ATLANTIC
  },
  'CA-PE': {
    id: 'CA-PE',
    name: 'Prince Edward Island',
    province: 'Prince Edward Island',
    ianaZone: 'America/Halifax',
    permanent: false,
    policyName: 'Seasonal Atlantic Time (Observes Fall-Back)',
    legalNote: 'Prince Edward Island observes seasonal time changes, setting clocks back 1 hour from ADT (UTC-3) to AST (UTC-4) on Nov 1, 2026.',
    getOffset: (t) => (t < TRANSITION_2026_UTC.ATLANTIC ? -3 : -4),
    getAbbr: (t) => (t < TRANSITION_2026_UTC.ATLANTIC ? 'ADT' : 'AST'),
    hasFallBack2026: true,
    transitionUtc: TRANSITION_2026_UTC.ATLANTIC
  },
  'CA-NL-LABRADOR': {
    id: 'CA-NL-LABRADOR',
    name: 'Labrador',
    province: 'Newfoundland and Labrador',
    ianaZone: 'America/Goose_Bay',
    permanent: false,
    policyName: 'Seasonal Atlantic Time (Observes Fall-Back)',
    legalNote: 'Labrador observes Atlantic Time, setting clocks back 1 hour from ADT (UTC-3) to AST (UTC-4) on Nov 1, 2026.',
    getOffset: (t) => (t < TRANSITION_2026_UTC.ATLANTIC ? -3 : -4),
    getAbbr: (t) => (t < TRANSITION_2026_UTC.ATLANTIC ? 'ADT' : 'AST'),
    hasFallBack2026: true,
    transitionUtc: TRANSITION_2026_UTC.ATLANTIC
  },
  'CA-NL-ISLAND': {
    id: 'CA-NL-ISLAND',
    name: 'Newfoundland Island',
    province: 'Newfoundland and Labrador',
    ianaZone: 'America/St_Johns',
    permanent: false,
    policyName: 'Seasonal Newfoundland Time (Observes Fall-Back)',
    legalNote: 'Newfoundland observes Newfoundland Time (UTC-2:30 / UTC-3:30), setting clocks back 1 hour on Nov 1, 2026.',
    getOffset: (t) => (t < TRANSITION_2026_UTC.NEWFOUNDLAND ? -2.5 : -3.5),
    getAbbr: (t) => (t < TRANSITION_2026_UTC.NEWFOUNDLAND ? 'NDT' : 'NST'),
    hasFallBack2026: true,
    transitionUtc: TRANSITION_2026_UTC.NEWFOUNDLAND
  },
  'CA-YT': {
    id: 'CA-YT',
    name: 'Yukon',
    province: 'Yukon Territory',
    ianaZone: 'America/Whitehorse',
    permanent: true,
    policyName: 'Permanent UTC-7 (Yukon Standard Time)',
    legalNote: 'Yukon adopted permanent UTC-7 in 2020, ending biannual seasonal clock changes.',
    getOffset: () => -7,
    getAbbr: () => 'MST',
    hasFallBack2026: false
  },
  'CA-NT': {
    id: 'CA-NT',
    name: 'Northwest Territories',
    province: 'Northwest Territories',
    ianaZone: 'America/Yellowknife',
    permanent: true,
    policyName: 'Permanent Mountain Time',
    legalNote: 'Northwest Territories aligns with Western Canadian shifts to remain on permanent Mountain Time (UTC-6).',
    getOffset: () => -6,
    getAbbr: () => 'MDT',
    hasFallBack2026: false
  },
  'CA-NU-KITIKMEOT': {
    id: 'CA-NU-KITIKMEOT',
    name: 'Kitikmeot Region (Nunavut)',
    province: 'Nunavut',
    ianaZone: 'America/Cambridge_Bay',
    permanent: false,
    policyName: 'Seasonal Mountain Time (Observes Fall-Back)',
    legalNote: 'The Kitikmeot region observes Mountain Time, setting clocks back 1 hour from MDT (UTC-6) to MST (UTC-7) on Nov 1, 2026.',
    getOffset: (t) => (t < TRANSITION_2026_UTC.MOUNTAIN ? -6 : -7),
    getAbbr: (t) => (t < TRANSITION_2026_UTC.MOUNTAIN ? 'MDT' : 'MST'),
    hasFallBack2026: true,
    transitionUtc: TRANSITION_2026_UTC.MOUNTAIN
  },
  'CA-NU-KIVALLIQ': {
    id: 'CA-NU-KIVALLIQ',
    name: 'Kivalliq Region (Nunavut)',
    province: 'Nunavut',
    ianaZone: 'America/Rankin_Inlet',
    permanent: false,
    policyName: 'Seasonal Central Time (Observes Fall-Back)',
    legalNote: 'The Kivalliq region observes Central Time, setting clocks back 1 hour from CDT (UTC-5) to CST (UTC-6) on Nov 1, 2026.',
    getOffset: (t) => (t < TRANSITION_2026_UTC.CENTRAL ? -5 : -6),
    getAbbr: (t) => (t < TRANSITION_2026_UTC.CENTRAL ? 'CDT' : 'CST'),
    hasFallBack2026: true,
    transitionUtc: TRANSITION_2026_UTC.CENTRAL
  },
  'CA-NU-CORAL-HARBOUR': {
    id: 'CA-NU-CORAL-HARBOUR',
    name: 'Southampton Island / Coral Harbour (Nunavut)',
    province: 'Nunavut',
    ianaZone: 'America/Coral_Harbour',
    permanent: true,
    policyName: 'Year-Round Eastern Standard Time',
    legalNote: 'Coral Harbour (Salliq) observes Eastern Standard Time (UTC-5) year-round without daylight saving changes.',
    getOffset: () => -5,
    getAbbr: () => 'EST',
    hasFallBack2026: false
  },
  'CA-NU-QIKIQTAALUK': {
    id: 'CA-NU-QIKIQTAALUK',
    name: 'Qikiqtaaluk Region (Nunavut)',
    province: 'Nunavut',
    ianaZone: 'America/Iqaluit',
    permanent: false,
    policyName: 'Seasonal Eastern Time (Observes Fall-Back)',
    legalNote: 'The Qikiqtaaluk (Baffin) region observes Eastern Time, setting clocks back 1 hour from EDT (UTC-4) to EST (UTC-5) on Nov 1, 2026.',
    getOffset: (t) => (t < TRANSITION_2026_UTC.EASTERN ? -4 : -5),
    getAbbr: (t) => (t < TRANSITION_2026_UTC.EASTERN ? 'EDT' : 'EST'),
    hasFallBack2026: true,
    transitionUtc: TRANSITION_2026_UTC.EASTERN
  }
};
