/**
 * Money → time, and time → a sentence a person can picture.
 *
 * Two rules govern this file.
 *
 * 1. **The units are the visitor's, not the calendar's.** A "working day" here
 *    is a fifth of the hours *they* said they work, and a "working year" is
 *    fifty-two of their weeks. Converting a price into 2,080-hour years when
 *    the visitor works 20 hours a week would be arithmetic about somebody else.
 *
 * 2. **Never print a large raw number of hours.** "41,802 hours" is a number,
 *    not a scale — nobody can feel it. The unit climbs from minutes up to
 *    working years so the value in front of it stays as small as the price
 *    allows; years is the top rung; nothing past it renames the number into a
 *    count of lives.
 *
 * Pure: no DOM.
 */

/** The visitor's own week, in the units the ladder speaks. */
export interface WorkRhythm {
  readonly hoursPerDay: number
  readonly hoursPerWeek: number
  readonly hoursPerMonth: number
  readonly hoursPerYear: number
}

export type WorkUnit =
  | 'minutes'
  | 'hours'
  | 'working days'
  | 'working weeks'
  | 'working months'
  | 'working years'

export interface WorkTime {
  /** The number, already rounded for display. */
  readonly value: number
  /** The unit, already singular or plural to match `value`. */
  readonly unit: string
  /** `value` and `unit` together, e.g. "2 working weeks". */
  readonly text: string
  /** The unit's plural name, for tests and for grouping. */
  readonly unitKey: WorkUnit
}

/** A five-day working week, because "working day" has to mean something. */
const DAYS_PER_WEEK = 5
const WEEKS_PER_MONTH = 4
const WEEKS_PER_YEAR = 52

export function rhythmFor(weeklyWorkHours: number): WorkRhythm {
  const hoursPerWeek = weeklyWorkHours
  return {
    hoursPerDay: hoursPerWeek / DAYS_PER_WEEK,
    hoursPerWeek,
    hoursPerMonth: hoursPerWeek * WEEKS_PER_MONTH,
    hoursPerYear: hoursPerWeek * WEEKS_PER_YEAR,
  }
}

/** How long this price takes to earn, in hours, at a given rate. */
export function hoursToEarn(amountAUD: number, hourlyRate: number): number {
  if (!Number.isFinite(amountAUD) || !Number.isFinite(hourlyRate)) return NaN
  if (hourlyRate <= 0) return NaN
  return amountAUD / hourlyRate
}

/**
 * Round for reading, not for accounting.
 *
 * Big values lose their decimals — "24.3 working years" pretends to a precision
 * the whole model does not have, and reads worse than "24". Small ones keep one
 * decimal, because the difference between 1 and 1.5 working days is the kind of
 * thing the visitor is here to notice.
 */
function readable(value: number): number {
  if (value >= 20) return Math.round(value)
  if (value >= 10) return Math.round(value * 2) / 2
  return Math.round(value * 10) / 10
}

function plural(value: number, unit: WorkUnit): string {
  if (value === 1) return unit.replace(/s$/, '')
  return unit
}

/**
 * Choose the unit that keeps the number small, then say it.
 *
 * The ladder climbs: under an hour is minutes, under a working day is hours,
 * under a working week is days, and so on up to years. Each step hands over as
 * soon as the next unit can express the value as at least 1.
 */
export function formatWorkTime(hours: number, rhythm: WorkRhythm): WorkTime {
  if (!Number.isFinite(hours) || hours < 0) {
    return { value: 0, unit: 'hours', text: '—', unitKey: 'hours' }
  }

  const say = (raw: number, unitKey: WorkUnit): WorkTime => {
    const value = readable(raw)
    const unit = plural(value, unitKey)
    return { value, unit, text: `${formatNumber(value)} ${unit}`, unitKey }
  }

  if (hours < 1) {
    // Under an hour, minutes are the only honest unit — and a whole number of
    // them. A coffee is "16 minutes", never "0.3 hours".
    const minutes = Math.max(1, Math.round(hours * 60))
    return {
      value: minutes,
      unit: plural(minutes, 'minutes'),
      text: `${formatNumber(minutes)} ${plural(minutes, 'minutes')}`,
      unitKey: 'minutes',
    }
  }
  if (hours < rhythm.hoursPerDay) return say(hours, 'hours')
  if (hours < rhythm.hoursPerWeek) return say(hours / rhythm.hoursPerDay, 'working days')
  if (hours < rhythm.hoursPerMonth) return say(hours / rhythm.hoursPerWeek, 'working weeks')
  // Twelve four-week months, not thirteen. A 4-week month and a 52-week year
  // do not tile — 52 ÷ 4 is 13 — so running the month tier all the way to the
  // year boundary printed a car as "13 working months", a duration longer than
  // the year it is supposed to sit inside. The tier hands over at twelve.
  if (hours < rhythm.hoursPerMonth * 12) return say(hours / rhythm.hoursPerMonth, 'working months')

  // The top of the ladder. However large the price, it stays a count of years —
  // "lifetimes" named a number of whole lives, which read as heavier judgement
  // than a duration should carry. A large number of years is still just a number.
  return say(hours / rhythm.hoursPerYear, 'working years')
}

/** Thousands separators, and no trailing ".0" on a whole number. */
export function formatNumber(value: number): string {
  return value.toLocaleString('en-AU', { maximumFractionDigits: 1 })
}

/** Money, the way a price tag writes it: $6, $1,800, $1,111,100. */
export function formatMoney(amountAUD: number): string {
  if (!Number.isFinite(amountAUD)) return '—'
  const decimals = amountAUD > 0 && amountAUD < 10 && !Number.isInteger(amountAUD) ? 2 : 0
  return amountAUD.toLocaleString('en-AU', {
    style: 'currency',
    currency: 'AUD',
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

/** An hourly rate always keeps its cents: $27.50/h, not $28/h. */
export function formatRate(rate: number): string {
  if (!Number.isFinite(rate)) return '—'
  return `${rate.toLocaleString('en-AU', {
    style: 'currency',
    currency: 'AUD',
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

/** Hours, for the arithmetic line where the exact figure is the evidence. */
export function formatHours(hours: number): string {
  if (!Number.isFinite(hours)) return '—'
  return `${formatNumber(Math.round(hours * 10) / 10)} h`
}
