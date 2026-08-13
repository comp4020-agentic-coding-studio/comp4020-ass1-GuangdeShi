/**
 * Pay → the price of an hour of your life.
 *
 * Two rates come out of every income, and the difference between them is the
 * whole point:
 *
 *   paid hourly rate         = pay ÷ hours you are paid for
 *   life-adjusted hourly     = pay ÷ hours the job actually costs you
 *
 * Commute is the only unpaid time counted here. It is not the only unpaid time
 * a job takes — but it is the one almost everyone can state accurately about
 * their own week, and a number the visitor can vouch for teaches more than a
 * larger one they have to take on trust.
 *
 * Pure: no DOM, no formatting, no rounding. Rounding is a display decision and
 * belongs in the view, so that the arithmetic shown on the page is the
 * arithmetic that ran.
 */

import type { IncomeInput, LifeRate, PayPeriod } from './types'

/**
 * The brief's stated simplifications. They do not agree with each other —
 * 4 weeks × 12 months is 48 weeks, not 52 — so the same salary entered monthly
 * and yearly gives slightly different hourly rates. That is a real property of
 * the model, not a bug to hide: the page names it rather than quietly picking
 * 4.345 and pretending the month is exact.
 */
export const WEEKS_PER_MONTH = 4
export const WEEKS_PER_YEAR = 52

/** Hours in a week. Nothing may commit more life than this. */
const HOURS_PER_WEEK = 168

/** How many weeks one pay period covers. */
const WEEKS_IN_PERIOD: Record<PayPeriod, number> = {
  hourly: 1,
  weekly: 1,
  monthly: WEEKS_PER_MONTH,
  yearly: WEEKS_PER_YEAR,
}

const PERIOD_LABEL: Record<PayPeriod, string> = {
  hourly: 'week',
  weekly: 'week',
  monthly: 'month',
  yearly: 'year',
}

/** Every period's pay field, labelled the way the visitor thinks of it. */
export const PAY_LABEL: Record<PayPeriod, string> = {
  hourly: 'Hourly pay',
  weekly: 'Weekly pay',
  monthly: 'Monthly pay',
  yearly: 'Yearly pay',
}

function usable(n: number, { min = 0, max = Infinity } = {}): boolean {
  return Number.isFinite(n) && n >= min && n <= max
}

/**
 * The transformation. Returns null when the input cannot produce an honest
 * answer — no pay, no hours, or a week with more than 168 hours in it — rather
 * than returning Infinity and letting the view render "$∞ an hour".
 */
export function computeLifeRate(input: IncomeInput): LifeRate | null {
  const { period, pay, weeklyWorkHours, weeklyCommuteHours } = input

  if (!usable(pay) || pay <= 0) return null
  if (!usable(weeklyWorkHours) || weeklyWorkHours <= 0) return null
  if (!usable(weeklyCommuteHours, { min: 0 })) return null
  if (weeklyWorkHours + weeklyCommuteHours > HOURS_PER_WEEK) return null

  const weeks = WEEKS_IN_PERIOD[period]
  const paidHours = weeklyWorkHours * weeks
  const committedHours = (weeklyWorkHours + weeklyCommuteHours) * weeks

  // For an hourly worker the entered wage *is* the paid hourly rate, so the
  // period pay is derived from it rather than the other way round. Every other
  // period is given a lump sum and the rate is derived.
  const periodPay = period === 'hourly' ? pay * paidHours : pay

  return {
    periodPay,
    periodLabel: PERIOD_LABEL[period],
    paidHours,
    committedHours,
    paidHourlyRate: periodPay / paidHours,
    lifeAdjustedHourlyRate: periodPay / committedHours,
    unpaidShare: (committedHours - paidHours) / committedHours,
  }
}
