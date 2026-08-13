/**
 * Form strings → numbers the model can refuse.
 *
 * People type money the way they write it: `$4,400`, `4 400`, `4400.00`. All of
 * those mean the same wage, and rejecting the ones with punctuation would make
 * the page look broken for a visitor who did nothing wrong.
 *
 * What this deliberately does *not* do is guess. A blank field, a word, a stray
 * minus — anything that is not a number — comes back as NaN, and the model
 * declines to produce a rate rather than inventing one. Empty is a legitimate
 * state of a form, not an error to paper over.
 *
 * Pure: no DOM.
 */

import type { PayPeriod } from './types'

const PERIODS: readonly PayPeriod[] = ['hourly', 'weekly', 'monthly', 'yearly']

/** Strip the punctuation people write money with, then parse strictly. */
export function parseAmount(text: string): number {
  const cleaned = text.replace(/[$,\s]/g, '')
  if (cleaned === '') return Number.NaN
  // Number() rather than parseFloat(): parseFloat('40 hours') is 40, which
  // would silently accept text the visitor can see is not a number.
  return Number(cleaned)
}

/** A select can only hold what the markup offers — but a test, or a tampered DOM, can lie. */
export function parsePeriod(text: string): PayPeriod {
  return PERIODS.find((period) => period === text) ?? 'monthly'
}
