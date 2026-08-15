/**
 * Entry point: read the form, price the catalogue, repeat.
 *
 * The page holds exactly one piece of state — what the visitor typed about
 * their pay. Everything else, including every price in the catalogue, is
 * derived on every update, because a derived value that is cached is a
 * derived value that can disagree with the form.
 *
 * That state lives in the DOM rather than in variables here — the inputs
 * themselves hold it. That is what makes the interaction survive a resize
 * while in use — nothing is re-created on a layout change, so there is no
 * second copy of the state to lose.
 *
 * There is no submit button by design. The catalogue is a *function* of the
 * wage, and a submit step would hide that behind an action.
 *
 * Rules live in `life/`, markup in `components/`. There is no logic in this
 * file that a test would want to reach.
 */

import { createLadderView } from './components/ladder-view'
import { createRateView } from './components/rate-view'
import { PRODUCTS } from './data/products'
import { rhythmFor } from './life/duration'
import { PAY_LABEL, computeLifeRate } from './life/income'
import { parseAmount, parsePeriod } from './life/parse'

function required<T extends Element>(selector: string): T {
  const found = document.querySelector<T>(selector)
  if (!found) throw new Error(`Missing required element: ${selector}`)
  return found
}

const periodSelect = required<HTMLSelectElement>('#pay-period')
const payInput = required<HTMLInputElement>('#pay-amount')
const payLabel = required<HTMLElement>('#pay-amount-label')
const workInput = required<HTMLInputElement>('#work-hours')
const commuteInput = required<HTMLInputElement>('#commute-hours')

const rateView = createRateView(required<HTMLElement>('#life-rate'))
const ladderView = createLadderView(required<HTMLElement>('#ladder'), PRODUCTS)

/** Read the form, do the arithmetic, repaint both halves. The whole interaction. */
function update(): void {
  const period = parsePeriod(periodSelect.value)
  payLabel.textContent = PAY_LABEL[period]

  const weeklyWorkHours = parseAmount(workInput.value)
  const rate = computeLifeRate({
    period,
    pay: parseAmount(payInput.value),
    weeklyWorkHours,
    weeklyCommuteHours: parseAmount(commuteInput.value),
  })

  rateView.update(rate)

  ladderView.update({
    hourlyRate: rate ? rate.lifeAdjustedHourlyRate : null,
    // The catalogue's units are the visitor's own week — a "working day" is a
    // fifth of the hours they said they work. Falling back to 40 keeps the
    // units sane while that field is mid-edit; nothing is shown from it until
    // there is a rate to show.
    rhythm: rhythmFor(weeklyWorkHours > 0 ? weeklyWorkHours : 40),
  })
}

// `input` covers typing and the number spinners; `change` covers the select.
// Listening on the containing form means a control added later is wired
// without anyone having to remember to wire it.
const incomeForm = required<HTMLFormElement>('#income-form')
incomeForm.addEventListener('input', update)
incomeForm.addEventListener('change', update)
// The form doesn't submit — there is nowhere to submit to, and Enter in a
// number field would otherwise reload the page and throw away what was typed.
incomeForm.addEventListener('submit', (event) => event.preventDefault())

// Open on a worked example rather than an empty form: the first thing a visitor
// sees is a finished calculation, so their first interaction is a *change* to
// something that already means something.
update()
