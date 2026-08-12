/**
 * Turning the two native input values into a birth moment.
 *
 * This sits between the DOM and `calculate.ts` and is pure on purpose: the step
 * most likely to break is parsing, and parsing is trivial to test without a
 * browser. `<input type="date">` and `<input type="time">` both expose a stable
 * machine value regardless of how the browser displays them — `YYYY-MM-DD` and
 * `HH:MM` — so this parser targets those formats, not locale text.
 *
 * An empty or partial input is not an error. Native pickers are legitimately
 * empty before the visitor has chosen, and half-entered dates appear while
 * typing, so those cases return `null` and the caller shows a prompt.
 */

import type { BirthMoment } from './types'

/** The moment the page opens with: the verified anchor from calculate.test.ts. */
export const DEFAULT_MOMENT: BirthMoment = {
  year: 1990,
  month: 6,
  day: 15,
  hour: 14,
  minute: 30,
}

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/
const TIME_PATTERN = /^(\d{2}):(\d{2})(?::\d{2}(?:\.\d+)?)?$/

/** Does this year/month/day triple actually exist? Rejects 31 February and friends. */
function isRealDate(year: number, month: number, day: number): boolean {
  if (month < 1 || month > 12 || day < 1 || day > 31) return false
  const probe = new Date(Date.UTC(year, month - 1, day))
  return (
    probe.getUTCFullYear() === year &&
    probe.getUTCMonth() === month - 1 &&
    probe.getUTCDate() === day
  )
}

/**
 * Parse the values of a date input and a time input into a birth moment.
 *
 * @returns the moment, or `null` when either value is empty, malformed, or names
 *   a date that does not exist.
 */
export function parseMoment(dateValue: string, timeValue: string): BirthMoment | null {
  const dateMatch = DATE_PATTERN.exec(dateValue.trim())
  const timeMatch = TIME_PATTERN.exec(timeValue.trim())
  if (!dateMatch || !timeMatch) return null

  const year = Number(dateMatch[1])
  const month = Number(dateMatch[2])
  const day = Number(dateMatch[3])
  const hour = Number(timeMatch[1])
  const minute = Number(timeMatch[2])

  if (!isRealDate(year, month, day)) return null
  if (hour > 23 || minute > 59) return null

  return { year, month, day, hour, minute }
}

/** Format a moment back into an `<input type="date">` value. */
export function toDateValue(moment: BirthMoment): string {
  const pad = (n: number): string => String(n).padStart(2, '0')
  return `${String(moment.year).padStart(4, '0')}-${pad(moment.month)}-${pad(moment.day)}`
}

/** Format a moment back into an `<input type="time">` value. */
export function toTimeValue(moment: BirthMoment): string {
  const pad = (n: number): string => String(n).padStart(2, '0')
  return `${pad(moment.hour)}:${pad(moment.minute)}`
}
