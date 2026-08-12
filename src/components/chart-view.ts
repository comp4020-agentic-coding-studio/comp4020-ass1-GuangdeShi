/**
 * Renders a chart into the page.
 *
 * Rendering only — every value shown here comes from `calculate.ts`. Keeping the
 * two apart is what lets the transformation be tested without a DOM.
 *
 * Phase 1 is deliberately plain: a semantic table, no decoration, no animation.
 * The visual language comes later, on top of a mechanism that already works.
 */

import { eightCharacters, tallyElements } from '../bazi/calculate'
import type { BaziChart } from '../bazi/types'
import { ELEMENTS, element } from '../data/sexagenary'

/** Build an element label such as "金 jīn · Metal". */
function elementLabel(elementId: BaziChart['pillars'][number]['stem']['element']): string {
  const e = element(elementId)
  return `${e.hanzi} ${e.pinyin} · ${e.english}`
}

/**
 * The Four Pillars as a table: one column per pillar, one row per layer.
 *
 * A real `<table>` with `<th scope>` means a screen reader can say "Day Pillar,
 * Heavenly Stem, 辛" instead of reading eight loose characters. The 4 × 2 grid
 * the brief asks for *is* this table's two body rows.
 */
function renderPillars(chart: BaziChart): string {
  const headers = chart.pillars
    .map(
      (p) => `
        <th scope="col">
          <span class="pillar-label__hanzi">${p.labelHanzi}</span>
          <span class="pillar-label__english">${p.labelEnglish}</span>
        </th>`,
    )
    .join('')

  const layer = (
    kind: 'stem' | 'branch',
    rowLabelHanzi: string,
    rowLabelEnglish: string,
  ): string => {
    const cells = chart.pillars
      .map((p) => {
        const unit = kind === 'stem' ? p.stem : p.branch
        const extra =
          kind === 'stem'
            ? `<span class="cell__meta">${p.stem.polarity === 'yang' ? '阳 yang' : '阴 yin'}</span>`
            : `<span class="cell__meta">${p.branch.zodiacHanzi} ${p.branch.zodiacEnglish}</span>`
        return `
          <td data-element="${unit.element}">
            <span class="cell__hanzi">${unit.hanzi}</span>
            <span class="cell__pinyin">${unit.pinyin}</span>
            <span class="cell__element">${elementLabel(unit.element)}</span>
            ${extra}
          </td>`
      })
      .join('')

    return `
      <tr>
        <th scope="row">
          <span class="row-label__hanzi">${rowLabelHanzi}</span>
          <span class="row-label__english">${rowLabelEnglish}</span>
        </th>
        ${cells}
      </tr>`
  }

  return `
    <table class="chart">
      <caption class="chart__caption">
        Four Pillars — eight characters, read as four columns of two.
      </caption>
      <thead>
        <tr>
          <td></td>
          ${headers}
        </tr>
      </thead>
      <tbody>
        ${layer('stem', '天干', 'Heavenly Stem')}
        ${layer('branch', '地支', 'Earthly Branch')}
      </tbody>
    </table>`
}

/** The eight characters as a plain string, for the summary line. */
function renderEightCharacters(chart: BaziChart): string {
  const stems = chart.pillars.map((p) => p.stem.hanzi).join('　')
  const branches = chart.pillars.map((p) => p.branch.hanzi).join('　')
  return `
    <div class="eight-chars" aria-hidden="true">
      <div class="eight-chars__row">${stems}</div>
      <div class="eight-chars__row">${branches}</div>
    </div>`
}

/** The Five Element tally across all eight characters. */
function renderElementTally(chart: BaziChart): string {
  const tally = tallyElements(chart)
  const items = ELEMENTS.map((e) => {
    const count = tally[e.id]
    return `
      <li data-element="${e.id}" data-count="${count}">
        <span class="tally__hanzi">${e.hanzi}</span>
        <span class="tally__english">${e.english}</span>
        <span class="tally__count">${count}<span class="tally__of"> / 8</span></span>
      </li>`
  }).join('')

  return `
    <section class="tally-section" aria-labelledby="tally-heading">
      <h2 id="tally-heading">五行 · Five Elements in these eight characters</h2>
      <ul class="tally">${items}</ul>
    </section>`
}

/**
 * The intermediate steps, shown rather than hidden.
 *
 * This is the explanatory payload: it names *why* the year turned when it did and
 * which solar month the moment fell in, so the chart reads as a derivation rather
 * than an oracle.
 */
function renderDerivation(chart: BaziChart): string {
  const d = chart.derivation
  const monthBranch = chart.pillars[1].branch
  const rows: ReadonlyArray<readonly [string, string]> = [
    [
      'Solar longitude at birth',
      `${d.solarLongitude.toFixed(2)}° — the Sun's apparent position, which is what fixes the month`,
    ],
    [
      'Bazi year',
      `${d.baziYear}${
        d.beforeLiChun
          ? ` — the birth falls <em>before</em> 立春, so it belongs to the previous solar year, not ${chart.moment.year}`
          : ' — the birth falls after 立春 (Lìchūn), so the solar and Gregorian years agree'
      }`,
    ],
    [
      'Solar month',
      `#${d.solarMonthIndex} of 12, the ${monthBranch.hanzi} month — set by solar term, not by the calendar month`,
    ],
    [
      'Day count',
      `Julian Day ${d.dayJulianDayNumber} → position ${d.daySexagenaryIndex + 1} of 60 in the cycle${
        d.rolledToNextDay
          ? ' — birth at or after 23:00, so the Bazi day has already rolled forward'
          : ''
      }`,
    ],
  ]

  return `
    <section class="derivation" aria-labelledby="derivation-heading">
      <h2 id="derivation-heading">How this moment was located</h2>
      <dl>
        ${rows.map(([term, detail]) => `<dt>${term}</dt><dd>${detail}</dd>`).join('')}
      </dl>
    </section>`
}

/** Render a full chart into a container element. */
export function renderChart(container: HTMLElement, chart: BaziChart): void {
  container.innerHTML = [
    renderEightCharacters(chart),
    renderPillars(chart),
    renderElementTally(chart),
    renderDerivation(chart),
  ].join('')
}

/** Render a message when the inputs are not yet a usable moment. */
export function renderMessage(container: HTMLElement, message: string): void {
  container.innerHTML = `<p class="placeholder">${message}</p>`
}

/** A one-line summary for the live region, so the change is announced. */
export function chartSummary(chart: BaziChart): string {
  const pillars = chart.pillars
    .map((p) => `${p.labelEnglish}: ${p.stem.hanzi}${p.branch.hanzi}`)
    .join('. ')
  return `${eightCharacters(chart).join(' ')}. ${pillars}.`
}
