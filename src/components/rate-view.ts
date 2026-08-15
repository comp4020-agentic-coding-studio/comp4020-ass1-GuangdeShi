/**
 * The reveal: one number — what an hour of your life actually returns, once
 * the commute is counted.
 *
 * Built once, then updated in place: re-rendering on every keystroke would
 * restart the transition that marks the number as having moved, and would
 * drop focus out of the region for anyone tabbing through it.
 */

import { formatRate } from '../life/duration'
import type { LifeRate } from '../life/types'

export interface RateView {
  update(rate: LifeRate | null): void
}

export function createRateView(root: HTMLElement): RateView {
  root.textContent = ''

  const empty = document.createElement('p')
  empty.className = 'rate__empty'
  empty.dataset.testid = 'rate-empty'
  empty.textContent = 'Enter your pay above.'

  const label = document.createElement('p')
  label.className = 'rate__label'
  label.textContent = 'Your time value'

  const value = document.createElement('p')
  value.className = 'rate__value'
  value.dataset.testid = 'life-rate'

  root.append(empty, label, value)

  return {
    update(rate: LifeRate | null): void {
      root.dataset.state = rate ? 'ready' : 'empty'
      value.textContent = rate ? `${formatRate(rate.lifeAdjustedHourlyRate)} / hour` : '—'
    },
  }
}
