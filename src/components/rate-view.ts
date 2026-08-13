/**
 * The reveal: two hourly rates, and the arithmetic that produced them.
 *
 * Both numbers are always shown together. The life-adjusted rate on its own
 * would just be a smaller number with no argument attached — it only means
 * something *next to* the rate the visitor thinks they are paid, with the
 * division that separates them written out underneath. The worked line is the
 * explanation; the big number is only its result.
 *
 * Built once, then updated in place: re-rendering on every keystroke would
 * restart the transition that marks the numbers as having moved, and would drop
 * focus out of the region for anyone tabbing through it.
 */

import { formatHours, formatMoney, formatRate } from '../life/duration'
import type { LifeRate } from '../life/types'

export interface RateView {
  update(rate: LifeRate | null): void
}

/** One of the two figures: value, unit, label, and the division behind it. */
interface Figure {
  readonly value: HTMLElement
  readonly working: HTMLElement
}

function figure(
  root: HTMLElement,
  modifier: string,
  label: string,
  testid: string,
  note: string,
): Figure {
  const wrap = document.createElement('div')
  wrap.className = `rate__figure rate__figure--${modifier}`

  const caption = document.createElement('p')
  caption.className = 'rate__label'
  caption.textContent = label

  const value = document.createElement('p')
  value.className = 'rate__value'
  value.dataset.testid = testid

  const working = document.createElement('p')
  working.className = 'rate__working'
  working.dataset.testid = `${testid}-working`

  const explain = document.createElement('p')
  explain.className = 'rate__note'
  explain.textContent = note

  wrap.append(caption, value, working, explain)
  root.append(wrap)
  return { value, working }
}

export function createRateView(root: HTMLElement): RateView {
  root.textContent = ''

  const empty = document.createElement('p')
  empty.className = 'rate__empty'
  empty.dataset.testid = 'rate-empty'
  empty.textContent =
    'Enter a wage and the hours behind it. Both numbers appear as soon as the arithmetic can be done honestly.'

  const pair = document.createElement('div')
  pair.className = 'rate__pair'

  const paid = figure(
    pair,
    'paid',
    'Your paid hourly rate',
    'paid-rate',
    'What the job says an hour of yours is worth.',
  )
  const life = figure(
    pair,
    'life',
    'Your life-adjusted hourly value',
    'life-rate',
    'What an hour of your life actually returns, once the travel is counted. Every price below is measured in these hours.',
  )

  const gap = document.createElement('p')
  gap.className = 'rate__gap'
  gap.dataset.testid = 'rate-gap'

  root.append(empty, pair, gap)

  return {
    update(rate: LifeRate | null): void {
      root.dataset.state = rate ? 'ready' : 'empty'

      if (!rate) {
        // Cleared rather than left stale: a rate belonging to numbers no longer
        // in the form is worse than no rate at all.
        paid.value.textContent = '—'
        life.value.textContent = '—'
        paid.working.textContent = ''
        life.working.textContent = ''
        gap.textContent = ''
        return
      }

      const pay = formatMoney(rate.periodPay)
      paid.value.textContent = `${formatRate(rate.paidHourlyRate)} an hour`
      life.value.textContent = `${formatRate(rate.lifeAdjustedHourlyRate)} an hour`
      paid.working.textContent = `${pay} a ${rate.periodLabel} ÷ ${formatHours(rate.paidHours)} paid`
      life.working.textContent = `${pay} a ${rate.periodLabel} ÷ ${formatHours(rate.committedHours)} committed`

      const percent = Math.round(rate.unpaidShare * 100)
      gap.textContent =
        percent > 0
          ? `Your commute is unpaid, so ${percent}% of the time this job costs you earns nothing. That gap is the difference between the two numbers.`
          : 'You reported no commute, so the two numbers are the same. Add the time you spend travelling and watch the second one fall.'
    },
  }
}
