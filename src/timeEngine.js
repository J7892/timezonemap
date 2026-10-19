/**
 * timeEngine.js
 *
 * Core calculation engine for Canadian regional and local times.
 * Handles deterministic statutory offset computation, formatting,
 * and transition simulation without external library dependencies.
 */

import { TIMEZONE_RULES } from './timezoneRules.js';

/**
 * Color scale mapped by effective UTC offset
 */
export const OFFSET_COLOR_MAP = {
  '-2.5': '#e11d48', // NDT (Rose)
  '-3':   '#f97316', // ADT (Orange)
  '-3.5': '#be123c', // NST (Darker Rose)
  '-4':   '#3b82f6', // EDT / AST (Blue)
  '-5':   '#10b981', // CDT / EST (Green)
  '-6':   '#06b6d4', // MDT / CST (Cyan)
  '-7':   '#8b5cf6', // PDT / MST (Purple)
};

export function getOffsetColor(offset) {
  const key = String(offset);
  return OFFSET_COLOR_MAP[key] || '#64748b';
}

/**
 * Calculates local time details for a given region and target timestamp.
 *
 * @param {string} regionId - ID like 'CA-ON-NW', 'CA-BC-PACIFIC', etc.
 * @param {Date|number|string} [targetDate=new Date()] - Reference date
 * @returns {Object} Calculated local time, offsets, formatted strings, and status
 */
export function getRegionTime(regionId, targetDate = new Date()) {
  const dateObj = targetDate instanceof Date ? targetDate : new Date(targetDate);
  const timestamp = dateObj.getTime();

  const rule = TIMEZONE_RULES[regionId];
  if (!rule) {
    throw new Error(`Unknown region ID: ${regionId}`);
  }

  const offsetHours = rule.getOffset(timestamp);
  const abbr = rule.getAbbr(timestamp);

  // Compute local timestamp by applying UTC offset
  const localTimestamp = timestamp + (offsetHours * 3600 * 1000);
  const localDate = new Date(localTimestamp);

  // Extract UTC components of localDate (which represent local wall-clock time)
  const year = localDate.getUTCFullYear();
  const month = localDate.getUTCMonth(); // 0-11
  const day = localDate.getUTCDate();
  const hours24 = localDate.getUTCHours();
  const minutes = localDate.getUTCMinutes();
  const seconds = localDate.getUTCSeconds();
  const dayOfWeek = localDate.getUTCDay(); // 0 (Sun) - 6 (Sat)

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fullMonths = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const pad = (n) => (n < 10 ? '0' + n : String(n));

  const hours12 = hours24 % 12 || 12;
  const ampm = hours24 >= 12 ? 'PM' : 'AM';

  const time12 = `${hours12}:${pad(minutes)}:${pad(seconds)} ${ampm}`;
  const time24 = `${pad(hours24)}:${pad(minutes)}:${pad(seconds)}`;
  const dateFormatted = `${days[dayOfWeek]}, ${months[month]} ${day}, ${year}`;
  const dateFull = `${days[dayOfWeek]}, ${fullMonths[month]} ${day}, ${year}`;

  // Format UTC offset string e.g. "UTC-5" or "UTC-3:30"
  const sign = offsetHours >= 0 ? '+' : '-';
  const absOffset = Math.abs(offsetHours);
  const offsetH = Math.floor(absOffset);
  const offsetM = Math.round((absOffset - offsetH) * 60);
  const offsetString = offsetM > 0
    ? `UTC${sign}${offsetH}:${pad(offsetM)}`
    : `UTC${sign}${offsetH}`;

  // Next transition status
  let transitionStatus = 'Permanent (No Fall-Back)';
  let timeUntilTransition = null;

  if (rule.hasFallBack2026 && rule.transitionUtc) {
    const diff = rule.transitionUtc - timestamp;
    if (diff > 0) {
      const daysLeft = Math.floor(diff / (24 * 3600 * 1000));
      const hoursLeft = Math.floor((diff % (24 * 3600 * 1000)) / (3600 * 1000));
      transitionStatus = `Falls back to standard time on Nov 1 (in ${daysLeft}d ${hoursLeft}h)`;
      timeUntilTransition = diff;
    } else {
      transitionStatus = 'Switched to Standard Time on Nov 1';
      timeUntilTransition = null;
    }
  }

  return {
    regionId,
    name: rule.name,
    province: rule.province,
    ianaZone: rule.ianaZone,
    offsetHours,
    offsetString,
    abbr,
    color: getOffsetColor(offsetHours),
    isPermanent: rule.permanent,
    hasFallBack2026: rule.hasFallBack2026,
    transitionStatus,
    timeUntilTransition,
    legalNote: rule.legalNote,
    policyName: rule.policyName,
    wallClock: {
      hours24,
      hours12,
      minutes,
      seconds,
      ampm,
      year,
      month: month + 1,
      day,
      dayOfWeek: days[dayOfWeek],
      time12,
      time24,
      dateFormatted,
      dateFull
    }
  };
}

/**
 * Computes live time information for all 23 Canadian regions.
 *
 * @param {Date|number|string} [targetDate=new Date()]
 * @returns {Object.<string, Object>} Map of regionId -> regionTime object
 */
export function getAllRegionTimes(targetDate = new Date()) {
  const result = {};
  for (const regionId of Object.keys(TIMEZONE_RULES)) {
    result[regionId] = getRegionTime(regionId, targetDate);
  }
  return result;
}

/**
 * Computes hour difference between two Canadian regions at a given timestamp.
 */
export function getTimeDifferenceHours(regionIdA, regionIdB, targetDate = new Date()) {
  const a = getRegionTime(regionIdA, targetDate);
  const b = getRegionTime(regionIdB, targetDate);
  return a.offsetHours - b.offsetHours;
}
