/**
 * Entry point: wire the two native inputs to the transformation.
 *
 * Everything here is plumbing. The rules live in `bazi/calculate.ts`, the parsing
 * in `bazi/moment.ts`, the markup in `components/chart-view.ts` — this file only
 * connects them, so there is no logic here that a test would want to reach.
 *
 * The stylesheet is linked from index.html rather than imported here, so the page
 * is styled before the module graph has loaded — it renders correctly on a slow
 * connection even while the script is still in flight.
 *
 * There is no submit button by design: the point of the piece is that the chart is
 * a *function* of the moment, and a submit step would hide that behind an action.
 * `input` fires on every change to a native picker, including keyboard arrow-key
 * adjustments, which is exactly the "watch it transform" behaviour the brief asks
 * for.
 */

import { calculateChart } from './bazi/calculate'
import { DEFAULT_MOMENT, parseMoment, toDateValue, toTimeValue } from './bazi/moment'
import { chartSummary, renderChart, renderMessage } from './components/chart-view'

function required<T extends Element>(selector: string): T {
  const found = document.querySelector<T>(selector)
  if (!found) throw new Error(`Missing required element: ${selector}`)
  return found
}

const dateInput = required<HTMLInputElement>('#birth-date')
const timeInput = required<HTMLInputElement>('#birth-time')
const output = required<HTMLElement>('#chart-output')
const summary = required<HTMLElement>('#chart-summary')

/** Read both inputs, recompute, repaint. The whole interaction, in one function. */
function update(): void {
  const moment = parseMoment(dateInput.value, timeInput.value)

  if (!moment) {
    renderMessage(output, 'Choose a birth date and time to see the eight characters.')
    summary.textContent = ''
    return
  }

  const chart = calculateChart(moment)
  renderChart(output, chart)
  summary.textContent = chartSummary(chart)
}

// Start from a known moment rather than an empty form, so the page explains itself
// before the visitor has touched anything — and so the default state is a fixed,
// testable one rather than whatever today happens to be.
dateInput.value = toDateValue(DEFAULT_MOMENT)
timeInput.value = toTimeValue(DEFAULT_MOMENT)

for (const input of [dateInput, timeInput]) {
  input.addEventListener('input', update)
  // Some browsers commit a picker selection with `change` but no `input`.
  input.addEventListener('change', update)
}

update()
