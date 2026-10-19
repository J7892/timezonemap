/**
 * testTimeEngine.js
 *
 * Comprehensive unit test suite for Canadian timezone calculation engine.
 * Validates pre-switch, post-switch, and boundary edge cases for November 2026.
 */

import { getRegionTime, getAllRegionTimes, getTimeDifferenceHours } from '../src/timeEngine.js';

let totalTests = 0;
let passedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ ${message}`);
  } else {
    console.error(`  ✗ FAILED: ${message}`);
  }
}

console.log('====================================================');
console.log('Canadian Timezone Calculation Engine - Test Suite');
console.log('====================================================\n');

// -----------------------------------------------------------------
// Test Suite 1: Pre-Switch Verification (October 31, 2026 23:59:59 UTC)
// -----------------------------------------------------------------
console.log('Test Suite 1: Pre-Switch Verification (Oct 31, 2026 23:59:59 UTC)');
const preDate = new Date('2026-10-31T23:59:59.000Z');

const bcPre = getRegionTime('CA-BC-PACIFIC', preDate);
assert(bcPre.offsetHours === -7, 'BC Pacific pre-switch offset is UTC-7');
assert(bcPre.abbr === 'PDT', 'BC Pacific pre-switch abbreviation is PDT');

const abPre = getRegionTime('CA-AB', preDate);
assert(abPre.offsetHours === -6, 'Alberta pre-switch offset is UTC-6');
assert(abPre.abbr === 'MDT', 'Alberta pre-switch abbreviation is MDT');

const skPre = getRegionTime('CA-SK', preDate);
assert(skPre.offsetHours === -6, 'Saskatchewan pre-switch offset is UTC-6');
assert(skPre.abbr === 'CST', 'Saskatchewan pre-switch abbreviation is CST');

const mbPre = getRegionTime('CA-MB', preDate);
assert(mbPre.offsetHours === -5, 'Manitoba pre-switch offset is UTC-5');
assert(mbPre.abbr === 'CDT', 'Manitoba pre-switch abbreviation is CDT');

const onNwPre = getRegionTime('CA-ON-NW', preDate);
assert(onNwPre.offsetHours === -5, 'NW Ontario pre-switch offset is UTC-5');
assert(onNwPre.abbr === 'CDT', 'NW Ontario pre-switch abbreviation is CDT');

const onSouthPre = getRegionTime('CA-ON-SOUTH', preDate);
assert(onSouthPre.offsetHours === -4, 'Southern Ontario pre-switch offset is UTC-4');
assert(onSouthPre.abbr === 'EDT', 'Southern Ontario pre-switch abbreviation is EDT');

const qcPre = getRegionTime('CA-QC-MAIN', preDate);
assert(qcPre.offsetHours === -4, 'Quebec Main pre-switch offset is UTC-4');
assert(qcPre.abbr === 'EDT', 'Quebec Main pre-switch abbreviation is EDT');

const qcBlancPre = getRegionTime('CA-QC-BLANC-SABLON', preDate);
assert(qcBlancPre.offsetHours === -4, 'Blanc-Sablon pre-switch offset is UTC-4');
assert(qcBlancPre.abbr === 'AST', 'Blanc-Sablon pre-switch abbreviation is AST');

const nlIslandPre = getRegionTime('CA-NL-ISLAND', preDate);
assert(nlIslandPre.offsetHours === -2.5, 'Newfoundland Island pre-switch offset is UTC-2.5');
assert(nlIslandPre.abbr === 'NDT', 'Newfoundland Island pre-switch abbreviation is NDT');

console.log('\n');

// -----------------------------------------------------------------
// Test Suite 2: Exact Switch Moments (November 1, 2026)
// -----------------------------------------------------------------
console.log('Test Suite 2: Precise Transition Moments (Nov 1, 2026)');

// Newfoundland: transition at 04:30 UTC
const nlBefore = getRegionTime('CA-NL-ISLAND', new Date('2026-11-01T04:29:59.000Z'));
const nlAfter = getRegionTime('CA-NL-ISLAND', new Date('2026-11-01T04:30:01.000Z'));
assert(nlBefore.offsetHours === -2.5 && nlBefore.abbr === 'NDT', 'Newfoundland 04:29 UTC is still NDT (UTC-2.5)');
assert(nlAfter.offsetHours === -3.5 && nlAfter.abbr === 'NST', 'Newfoundland 04:30 UTC switches to NST (UTC-3.5)');

// Atlantic (NB, NS, PE, Labrador): transition at 05:00 UTC
const atlBefore = getRegionTime('CA-NB', new Date('2026-11-01T04:59:59.000Z'));
const atlAfter = getRegionTime('CA-NB', new Date('2026-11-01T05:00:01.000Z'));
assert(atlBefore.offsetHours === -3 && atlBefore.abbr === 'ADT', 'Atlantic 04:59 UTC is still ADT (UTC-3)');
assert(atlAfter.offsetHours === -4 && atlAfter.abbr === 'AST', 'Atlantic 05:00 UTC switches to AST (UTC-4)');

// Eastern (ON-South, QC-Main): transition at 06:00 UTC
const eastBefore = getRegionTime('CA-ON-SOUTH', new Date('2026-11-01T05:59:59.000Z'));
const eastAfter = getRegionTime('CA-ON-SOUTH', new Date('2026-11-01T06:00:01.000Z'));
assert(eastBefore.offsetHours === -4 && eastBefore.abbr === 'EDT', 'Southern ON 05:59 UTC is still EDT (UTC-4)');
assert(eastAfter.offsetHours === -5 && eastAfter.abbr === 'EST', 'Southern ON 06:00 UTC switches to EST (UTC-5)');

// Nunavut Kivalliq (Central): transition at 07:00 UTC
const kivBefore = getRegionTime('CA-NU-KIVALLIQ', new Date('2026-11-01T06:59:59.000Z'));
const kivAfter = getRegionTime('CA-NU-KIVALLIQ', new Date('2026-11-01T07:00:01.000Z'));
assert(kivBefore.offsetHours === -5 && kivBefore.abbr === 'CDT', 'Kivalliq 06:59 UTC is still CDT (UTC-5)');
assert(kivAfter.offsetHours === -6 && kivAfter.abbr === 'CST', 'Kivalliq 07:00 UTC switches to CST (UTC-6)');

// Nunavut Kitikmeot (Mountain): transition at 08:00 UTC
const kitBefore = getRegionTime('CA-NU-KITIKMEOT', new Date('2026-11-01T07:59:59.000Z'));
const kitAfter = getRegionTime('CA-NU-KITIKMEOT', new Date('2026-11-01T08:00:01.000Z'));
assert(kitBefore.offsetHours === -6 && kitBefore.abbr === 'MDT', 'Kitikmeot 07:59 UTC is still MDT (UTC-6)');
assert(kitAfter.offsetHours === -7 && kitAfter.abbr === 'MST', 'Kitikmeot 08:00 UTC switches to MST (UTC-7)');

console.log('\n');

// -----------------------------------------------------------------
// Test Suite 3: Post-Switch Verification (November 2, 2026 12:00:00 UTC)
// -----------------------------------------------------------------
console.log('Test Suite 3: Post-Switch State & Sub-Provincial Splits (Nov 2, 2026 12:00:00 UTC)');
const postDate = new Date('2026-11-02T12:00:00.000Z');

// BC: Permanent Pacific Daylight Time (UTC-7) - did NOT fall back
const bcPost = getRegionTime('CA-BC-PACIFIC', postDate);
assert(bcPost.offsetHours === -7, 'BC Pacific remains UTC-7 (no fall back)');
assert(bcPost.wallClock.hours24 === 5, 'At 12:00 UTC, BC Pacific local time is 05:00');

// Alberta: Permanent MDT (UTC-6) - did NOT fall back
const abPost = getRegionTime('CA-AB', postDate);
assert(abPost.offsetHours === -6, 'Alberta remains UTC-6 (no fall back)');
assert(abPost.wallClock.hours24 === 6, 'At 12:00 UTC, Alberta local time is 06:00');

// Saskatchewan: Permanent CST (UTC-6)
const skPost = getRegionTime('CA-SK', postDate);
assert(skPost.offsetHours === -6, 'Saskatchewan remains UTC-6');
assert(skPost.offsetHours === abPost.offsetHours, 'Alberta and Saskatchewan now share the exact same hour (UTC-6)');

// Manitoba: Permanent CDT (UTC-5) - did NOT fall back
const mbPost = getRegionTime('CA-MB', postDate);
assert(mbPost.offsetHours === -5, 'Manitoba remains UTC-5 (no fall back)');

// NW Ontario (Kenora): Permanent CDT (UTC-5) - did NOT fall back
const onNwPost = getRegionTime('CA-ON-NW', postDate);
assert(onNwPost.offsetHours === -5, 'NW Ontario remains UTC-5 (no fall back)');
assert(onNwPost.offsetHours === mbPost.offsetHours, 'NW Ontario stays aligned with Manitoba (both UTC-5)');

// Southern Ontario (Toronto): Switched to EST (UTC-5)
const onSouthPost = getRegionTime('CA-ON-SOUTH', postDate);
assert(onSouthPost.offsetHours === -5, 'Southern Ontario fell back to EST (UTC-5)');
assert(onNwPost.offsetHours === onSouthPost.offsetHours, 'NW Ontario and Southern Ontario now have the same clock time in winter (UTC-5)');

// Quebec Blanc-Sablon (UTC-4) vs Montreal (UTC-5)
const qcMainPost = getRegionTime('CA-QC-MAIN', postDate);
const qcBlancPost = getRegionTime('CA-QC-BLANC-SABLON', postDate);
assert(qcMainPost.offsetHours === -5, 'Montreal fell back to EST (UTC-5)');
assert(qcBlancPost.offsetHours === -4, 'Blanc-Sablon remains on AST (UTC-4, no DST)');
assert(qcBlancPost.offsetHours - qcMainPost.offsetHours === 1, 'Blanc-Sablon is 1 hour ahead of Montreal');

// Yukon (UTC-7) and NWT (UTC-6)
const ytPost = getRegionTime('CA-YT', postDate);
const ntPost = getRegionTime('CA-NT', postDate);
assert(ytPost.offsetHours === -7, 'Yukon is UTC-7');
assert(ntPost.offsetHours === -6, 'NWT is UTC-6');

// Nunavut: 3 regions + Coral Harbour
const nuKitPost = getRegionTime('CA-NU-KITIKMEOT', postDate);
const nuKivPost = getRegionTime('CA-NU-KIVALLIQ', postDate);
const nuQikPost = getRegionTime('CA-NU-QIKIQTAALUK', postDate);
const nuCoralPost = getRegionTime('CA-NU-CORAL-HARBOUR', postDate);
assert(nuKitPost.offsetHours === -7, 'Kitikmeot fell back to MST (UTC-7)');
assert(nuKivPost.offsetHours === -6, 'Kivalliq fell back to CST (UTC-6)');
assert(nuQikPost.offsetHours === -5, 'Qikiqtaaluk fell back to EST (UTC-5)');
assert(nuCoralPost.offsetHours === -5, 'Coral Harbour remains EST (UTC-5)');

console.log('\n');

// -----------------------------------------------------------------
// Test Suite 4: All 23 Regions Batch Computation
// -----------------------------------------------------------------
console.log('Test Suite 4: All 23 Regions Batch Computation');
const allTimes = getAllRegionTimes(preDate);
assert(Object.keys(allTimes).length === 23, 'getAllRegionTimes returns exactly 23 regions');

for (const [id, r] of Object.entries(allTimes)) {
  assert(r.wallClock && r.wallClock.time12 && r.wallClock.time24, `${id} includes formatted 12h/24h time`);
}

console.log('\n====================================================');
console.log(`Test Results: ${passedTests} passed, ${totalTests - passedTests} failed, ${totalTests} total`);
console.log('====================================================\n');

if (passedTests !== totalTests) {
  process.exit(1);
}
