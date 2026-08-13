/**
 * Entry point: read the form, price the ladder, repeat.
 *
 * The page holds exactly two pieces of state — what the visitor typed, and
 * which currency the ladder is showing. Everything else is derived on every
 * update, because a derived value that is cached is a derived value that can
 * disagree with the form.
 *
 * Both live in the DOM rather than in variables here: the inputs hold the
 * income, and the checked radio holds the mode. That is what makes the
 * interaction survive a resize while in use — nothing is re-created on a layout
 * change, so there is no second copy of the state to lose.
 *
 * There is no submit button by design. The two prices are a *function* of the
 * wage, and a submit step would hide that behind an action.
 *
 * Rules live in `life/`, markup in `components/`. There is no logic in this
 * file that a test would want to reach.
 */

import { createLadderView } from './components/ladder-view'
import { createRateView } from './components/rate-view'
import { PRODUCTS, PROVISIONAL_COUNT } from './data/products'
import { formatRate, rhythmFor } from './life/duration'
import { PAY_LABEL, computeLifeRate } from './life/income'
import { parseAmount, parsePeriod } from './life/parse'
import type { PriceMode } from './life/types'

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
const caption = required<HTMLElement>('#ladder-caption')

const rateView = createRateView(required<HTMLElement>('#life-rate'))
const ladderView = createLadderView(required<HTMLElement>('#ladder'), PRODUCTS)

/** Which currency the ladder is speaking. Read from the radios, never cached. */
function currentMode(): PriceMode {
  const checked = document.querySelector<HTMLInputElement>('input[name="price-mode"]:checked')
  return checked?.value === 'time' ? 'time' : 'money'
}

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

  const mode = currentMode()
  ladderView.update({
    mode,
    hourlyRate: rate ? rate.lifeAdjustedHourlyRate : null,
    // The ladder's units are the visitor's own week — a "working day" is a
    // fifth of the hours they said they work. Falling back to 40 keeps the
    // units sane while that field is mid-edit; nothing is shown from it until
    // there is a rate to show.
    rhythm: rhythmFor(weeklyWorkHours > 0 ? weeklyWorkHours : 40),
  })

  caption.textContent =
    mode === 'money'
      ? 'Every price below is in Australian dollars — the number you already know.'
      : rate
        ? `Every price below is in hours of your life, at ${formatRate(rate.lifeAdjustedHourlyRate)} an hour.`
        : 'Fill in how you are paid, and every price below becomes a length of your life.'
}

// `input` covers typing and the number spinners; `change` covers the select and
// the radios. Listening on the containing form means a control added later is
// wired without anyone having to remember to wire it.
for (const selector of ['#income-form', '#mode-form']) {
  const form = required<HTMLFormElement>(selector)
  form.addEventListener('input', update)
  form.addEventListener('change', update)
  // Neither form submits — there is nowhere to submit to, and Enter in a number
  // field would otherwise reload the page and throw away what was typed.
  form.addEventListener('submit', (event) => event.preventDefault())
}

required<HTMLElement>('#price-provenance').textContent =
  `Of the ${PRODUCTS.length} objects listed, ${PROVISIONAL_COUNT} carry indicative placeholder prices while this prototype is built, and each names the kind of price it stands for. A price that cites a source also carries the date it was checked. The objects at the top of the ladder are single representative examples rather than market averages — there is no universal price for a superyacht.`

// Open on a worked example rather than an empty form: the first thing a visitor
// sees is a finished calculation, so their first interaction is a *change* to
// something that already means something.
update()
