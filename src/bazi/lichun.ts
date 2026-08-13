/**
 * The 立春 (Lìchūn) boundary, prepared for comparison.
 *
 * One example carries the whole point that Bazi years do not turn on 1 January:
 * two births one day apart, either side of 立春, with different Year Pillars.
 * This module produces that pair for any year — computed from the real solar
 * instant, not from a hardcoded date, so the example is true for whichever year
 * the visitor happens to be looking at.
 *
 * Pure. No DOM.
 */

import { liChunUtcMs } from './solar'
import type { BirthMoment } from './types'

/** The offset the whole project reads wall-clock times in. See calculate.ts (A). */
const UTC_OFFSET_HOURS = 8

const MS_PER_HOUR = 3_600_000
const MS_PER_DAY = 86_400_000

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const

/**
 * Read a UTC instant as wall-clock parts in UTC+8.
 *
 * Done by shifting the instant and reading UTC fields, rather than with
 * `toLocaleString`: the result must not depend on the timezone of the machine
 * the page happens to be open on.
 */
export function momentInUtcPlus8(utcMs: number): BirthMoment {
  const shifted = new Date(utcMs + UTC_OFFSET_HOURS * MS_PER_HOUR)
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
    hour: shifted.getUTCHours(),
    minute: shifted.getUTCMinutes(),
  }
}

/** "4 February 1990, 04:14" — the instant, in the timezone the page assumes. */
export function formatMoment(moment: BirthMoment): string {
  const monthName = MONTH_NAMES[moment.month - 1] ?? ''
  const time = `${String(moment.hour).padStart(2, '0')}:${String(moment.minute).padStart(2, '0')}`
  return `${moment.day} ${monthName} ${moment.year}, ${time}`
}

/** "3 February" — a date without the year, for the two comparison buttons. */
export function formatDate(moment: BirthMoment): string {
  return `${moment.day} ${MONTH_NAMES[moment.month - 1] ?? ''}`
}

export interface LiChunComparison {
  readonly gregorianYear: number
  /** The 立春 instant itself, as UTC+8 wall-clock parts. */
  readonly instant: BirthMoment
  /** Noon on the day before 立春 — still the previous Bazi year. */
  readonly before: BirthMoment
  /** Noon on the day after 立春 — the new Bazi year. */
  readonly after: BirthMoment
}

/**
 * Two moments a day either side of a year's 立春.
 *
 * Midday is used for both so the comparison isolates the *date*: at noon there is
 * no interaction with the 23:00 day boundary, and both sit comfortably clear of
 * the solar-term instant itself, which this project locates to within about
 * fifteen minutes (see solar.ts). 立春 always falls on 3–5 February, so ±1 day
 * never leaves early February.
 */
export function liChunComparison(gregorianYear: number): LiChunComparison {
  const instantMs = liChunUtcMs(gregorianYear)
  const instant = momentInUtcPlus8(instantMs)
  const midday = (offsetDays: number): BirthMoment => {
    const local = momentInUtcPlus8(instantMs + offsetDays * MS_PER_DAY)
    return { year: local.year, month: local.month, day: local.day, hour: 12, minute: 0 }
  }

  return {
    gregorianYear,
    instant,
    before: midday(-1),
    after: midday(1),
  }
}
