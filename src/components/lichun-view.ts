/**
 * The 立春 boundary example.
 *
 * Deliberately small: two dates, one day apart, with different Year Pillars. It
 * exists to make one claim concrete — Bazi years do not turn on 1 January — and
 * then hand the visitor straight back to the main interaction, because its two
 * controls set the birth inputs rather than showing a chart of their own.
 *
 * The dates are computed for whichever year the visitor is currently looking at,
 * so the example is never a stale hardcoded illustration.
 */

import { calculateChart } from '../bazi/calculate'
import { formatDate, formatMoment, liChunComparison } from '../bazi/lichun'
import { DEFAULT_MOMENT } from '../bazi/moment'
import type { BirthMoment } from '../bazi/types'

export interface LiChunView {
  /** Rebuild the example around the year of the moment currently displayed. */
  update(moment: BirthMoment): void
}

const q = <T extends HTMLElement>(scope: ParentNode, selector: string): T => {
  const found = scope.querySelector<T>(selector)
  if (!found) throw new Error(`lichun-view: missing ${selector}`)
  return found
}

const yearPillarOf = (moment: BirthMoment): string => {
  const pillar = calculateChart(moment).pillars[0]
  return `${pillar.stem.hanzi}${pillar.branch.hanzi}`
}

/**
 * @param onPick called with the moment a control selects, so the boundary example
 *   drives the same input → chart path as typing a date by hand.
 */
export function createLiChunView(
  root: HTMLElement,
  onPick: (moment: BirthMoment) => void,
): LiChunView {
  root.innerHTML = `
    <section class="section section--boundary" aria-labelledby="boundary-heading">
      <h2 class="section__heading" id="boundary-heading">
        <span class="section__hanzi">立春</span>
        <span class="section__english">The year boundary</span>
      </h2>

      <p class="boundary__claim">
        A Bazi year does not begin on 1 January. It begins at 立春 (Lìchūn), the
        solar term at 315° of solar longitude — so two births a single day apart
        can belong to different years.
      </p>

      <p class="boundary__instant" data-instant></p>

      <ul class="boundary__pair">
        <li class="boundary__option">
          <button type="button" class="boundary__button" data-before>
            <span class="boundary__date" data-before-date></span>
            <span class="boundary__pillar" data-before-pillar></span>
            <span class="boundary__side">before 立春</span>
          </button>
        </li>
        <li class="boundary__option">
          <button type="button" class="boundary__button" data-after>
            <span class="boundary__date" data-after-date></span>
            <span class="boundary__pillar" data-after-pillar></span>
            <span class="boundary__side">after 立春</span>
          </button>
        </li>
      </ul>

      <p class="section__legend">
        Two days apart. Choose either to load it above and watch the Year Pillar
        move.
      </p>
    </section>`

  const instant = q(root, '[data-instant]')
  const beforeButton = q<HTMLButtonElement>(root, '[data-before]')
  const afterButton = q<HTMLButtonElement>(root, '[data-after]')
  const beforeDate = q(root, '[data-before-date]')
  const afterDate = q(root, '[data-after-date]')
  const beforePillar = q(root, '[data-before-pillar]')
  const afterPillar = q(root, '[data-after-pillar]')

  // Held so the click handlers always use the currently displayed year, without
  // rebinding a listener on every update. Seeded from the default moment rather
  // than from the clock, so nothing here depends on when the page is opened.
  let current = liChunComparison(DEFAULT_MOMENT.year)

  beforeButton.addEventListener('click', () => onPick(current.before))
  afterButton.addEventListener('click', () => onPick(current.after))

  function update(moment: BirthMoment): void {
    current = liChunComparison(moment.year)

    instant.textContent =
      `In ${current.gregorianYear}, 立春 fell on ${formatMoment(current.instant)} ` +
      `(China Standard Time).`

    beforeDate.textContent = formatDate(current.before)
    afterDate.textContent = formatDate(current.after)
    beforePillar.textContent = yearPillarOf(current.before)
    afterPillar.textContent = yearPillarOf(current.after)

    const label = (moment_: BirthMoment, side: string): string =>
      `Load ${formatDate(moment_)} ${moment_.year}, midday — ${side} 立春`
    beforeButton.setAttribute('aria-label', label(current.before, 'before'))
    afterButton.setAttribute('aria-label', label(current.after, 'after'))
  }

  return { update }
}
