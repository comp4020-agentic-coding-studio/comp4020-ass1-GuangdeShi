/** The shapes the whole explainer is built on. No DOM, no formatting. */

/** How the visitor is paid. The four cases the brief names, nothing else. */
export type PayPeriod = 'hourly' | 'weekly' | 'monthly' | 'yearly'

/**
 * What the visitor tells us.
 *
 * `pay` is always in the unit named by `period` — dollars per hour for
 * `hourly`, dollars per month for `monthly`, and so on. Hours are always
 * *weekly*, whatever the pay period is, because that is how people actually
 * know their own week.
 */
export interface IncomeInput {
  readonly period: PayPeriod
  readonly pay: number
  readonly weeklyWorkHours: number
  readonly weeklyCommuteHours: number
}

/**
 * What the arithmetic produces.
 *
 * Both rates are kept, never just the life-adjusted one: the gap between them
 * is the thing being explained, so a view that only had the second number
 * could not show the first being reduced to it.
 */
export interface LifeRate {
  /** Pay for one period, in dollars — derived for `hourly`, given otherwise. */
  readonly periodPay: number
  /** The period the hours below cover: 'week', 'month' or 'year'. */
  readonly periodLabel: string
  /** Hours actually paid for, over one period. */
  readonly paidHours: number
  /** Paid hours plus commute — the life the pay actually costs. */
  readonly committedHours: number
  /** periodPay ÷ paidHours. */
  readonly paidHourlyRate: number
  /** periodPay ÷ committedHours. Always ≤ paidHourlyRate. */
  readonly lifeAdjustedHourlyRate: number
  /** Share of committed time that is unpaid, 0–1. Zero when there is no commute. */
  readonly unpaidShare: number
}

/** One rung of the ladder. Mirrors `src/data/products.json` exactly. */
export interface Product {
  readonly id: string
  readonly name: string
  readonly priceAUD: number
  /** Local asset path once real imagery exists; null while the tile is typographic. */
  readonly image: string | null
  readonly priceSourceLabel: string
  readonly priceSourceURL: string | null
  /** ISO date the price was checked, or null when the price is a placeholder. */
  readonly priceCheckedDate: string | null
  readonly scale: ProductScale
  /**
   * True while the price is an indicative placeholder rather than a checked,
   * cited figure. The page says so; the dataset test makes sure the flag and
   * the source fields agree, so nothing can quietly claim a source it lacks.
   */
  readonly provisional: boolean
}

export type ProductScale = 'everyday' | 'household' | 'major' | 'extraordinary'

/** Which price the ladder is currently showing. The toggle *is* the argument. */
export type PriceMode = 'money' | 'time'
