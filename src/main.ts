/**
 * Entry point: wire the inputs to the transformation, and remember the last chart.
 *
 * The one piece of state in the whole page is `previous` — the chart that was on
 * screen before this update. Without it there is no way to say *which* pillar
 * moved, and "which pillar moved" is the entire explanatory claim of Phase 2.
 *
 * Everything else is plumbing. Rules live in `bazi/calculate.ts`, the
 * explanations in `bazi/explain.ts`, parsing in `bazi/moment.ts`, markup in
 * `components/`. There is no logic here that a test would want to reach.
 *
 * The stylesheet is linked from index.html rather than imported here, so the page
 * is styled before the module graph arrives — it reads correctly on a slow
 * connection while the script is still in flight.
 *
 * There is no submit button by design: the chart is a *function* of the moment,
 * and a submit step would hide that behind an action.
 */

import { calculateChart } from './bazi/calculate'
import { announceChanges, describeChanges } from './bazi/explain'
import { DEFAULT_MOMENT, parseMoment, toDateValue, toTimeValue } from './bazi/moment'
import type { BaziChart, BirthMoment } from './bazi/types'
import { createChartView } from './components/chart-view'
import { createLiChunView } from './components/lichun-view'

function required<T extends Element>(selector: string): T {
  const found = document.querySelector<T>(selector)
  if (!found) throw new Error(`Missing required element: ${selector}`)
  return found
}

const dateInput = required<HTMLInputElement>('#birth-date')
const timeInput = required<HTMLInputElement>('#birth-time')
const summary = required<HTMLElement>('#chart-summary')

const chartView = createChartView(required<HTMLElement>('#chart-output'))
const liChunView = createLiChunView(required<HTMLElement>('#boundary-output'), (moment) => {
  // The boundary example sets the inputs and then goes through exactly the same
  // path as typing — so the Year Pillar visibly moves, rather than the example
  // asserting that it would.
  apply(moment)
})

/** The chart currently on screen, if any. The only state on the page. */
let previous: BaziChart | null = null

/** Read both inputs, recompute, repaint what moved. The whole interaction. */
function update(): void {
  const moment = parseMoment(dateInput.value, timeInput.value)

  if (!moment) {
    chartView.clear('Choose a birth date and time to see the eight characters.')
    summary.textContent = ''
    previous = null
    return
  }

  const chart = calculateChart(moment)
  const changes = previous ? describeChanges(previous, chart) : []

  chartView.update(chart, changes)
  liChunView.update(moment)
  // Only announce actual movement; re-reading the whole chart on every keystroke
  // would make the live region useless.
  summary.textContent = previous ? announceChanges(chart, changes) : ''
  previous = chart
}

/** Put a moment into the inputs and run the transformation on it. */
function apply(moment: BirthMoment): void {
  dateInput.value = toDateValue(moment)
  timeInput.value = toTimeValue(moment)
  update()
}

for (const input of [dateInput, timeInput]) {
  input.addEventListener('input', update)
  // Some browsers commit a picker selection with `change` but no `input`.
  input.addEventListener('change', update)
}

// Open on a known moment rather than an empty form: the first thing a visitor
// sees is a finished encoding, so their first interaction is a *change* to
// something that already makes sense.
apply(DEFAULT_MOMENT)
