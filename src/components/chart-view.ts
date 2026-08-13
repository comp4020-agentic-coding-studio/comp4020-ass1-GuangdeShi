/**
 * The Four Pillars view.
 *
 * Built once, then updated in place. This matters more than it looks: rebuilding
 * `innerHTML` on every keystroke would restart CSS transitions, so nothing could
 * be *emphasised as changed*, and it would drop focus out of any control inside
 * the region. So the skeleton is created on first update and afterwards only text
 * nodes and attributes move.
 *
 * Rendering only. Every string shown here comes from `bazi/calculate.ts` or
 * `bazi/explain.ts`.
 */

import { eightCharacters, tallyElements } from '../bazi/calculate'
import { pillarSources } from '../bazi/explain'
import type { PillarChange } from '../bazi/explain'
import type { BaziChart, ElementId } from '../bazi/types'
import { ELEMENTS, element } from '../data/sexagenary'

/** How long a changed pillar stays emphasised. Long enough to look at, short
 *  enough not to still be lit when the next change arrives. */
const EMPHASIS_MS = 3200

interface PillarRefs {
  readonly root: HTMLElement
  readonly sourceValue: HTMLElement
  readonly sourceNote: HTMLElement
  readonly stemChar: HTMLElement
  readonly branchChar: HTMLElement
  readonly stemGlyph: HTMLElement
  readonly branchGlyph: HTMLElement
  readonly stemElement: HTMLElement
  readonly branchElement: HTMLElement
  readonly change: HTMLElement
}

export interface ChartView {
  update(chart: BaziChart, changes: readonly PillarChange[]): void
  clear(message: string): void
}

function elementText(id: ElementId): string {
  const e = element(id)
  return `${e.hanzi} ${e.english}`
}

const q = <T extends HTMLElement>(scope: ParentNode, selector: string): T => {
  const found = scope.querySelector<T>(selector)
  if (!found) throw new Error(`chart-view: missing ${selector}`)
  return found
}

/**
 * The whole chart as markup.
 *
 * Written as one template rather than assembled node by node because the shape is
 * fixed — only its contents ever change — and a single template is far easier to
 * read against the design.
 */
function skeleton(chart: BaziChart): string {
  const pillars = chart.pillars
    .map(
      (p) => `
      <li class="pillar" data-pillar="${p.id}">
        <h3 class="pillar__head">
          <span class="pillar__label-hanzi">${p.labelHanzi}</span>
          <span class="pillar__label-english">${p.labelEnglish.replace(' Pillar', '')}</span>
        </h3>

        <p class="pillar__source">
          <span class="pillar__source-value" data-source-value></span>
          <span class="pillar__source-note" data-source-note></span>
        </p>

        <div class="pillar__glyphs">
          <span class="glyph" data-stem-glyph>
            <span class="visually-hidden">Heavenly Stem: </span>
            <span class="glyph__char" data-stem-char></span>
          </span>
          <span class="glyph" data-branch-glyph>
            <span class="visually-hidden">Earthly Branch: </span>
            <span class="glyph__char" data-branch-char></span>
          </span>
        </div>

        <p class="pillar__elements">
          <span class="element-chip" data-stem-element></span>
          <span class="element-chip" data-branch-element></span>
        </p>

        <p class="pillar__change" data-change hidden></p>
      </li>`,
    )
    .join('')

  const tally = ELEMENTS.map(
    (e) => `
      <li class="tally__row" data-element="${e.id}" data-count="0">
        <span class="tally__hanzi">${e.hanzi}</span>
        <span class="tally__english">${e.english}</span>
        <span class="tally__bar"><span class="tally__fill" data-fill="${e.id}"></span></span>
        <span class="tally__count" data-count-for="${e.id}">0</span>
      </li>`,
  ).join('')

  return `
    <section class="section section--pillars" aria-labelledby="pillars-heading">
      <h2 class="section__heading" id="pillars-heading">
        <span class="section__hanzi">四柱</span>
        <span class="section__english">Four Pillars</span>
      </h2>
      <p class="section__legend">
        Each layer of the moment becomes one column: a Heavenly Stem above, an
        Earthly Branch below.
      </p>
      <ol class="pillars">${pillars}</ol>
    </section>

    <section class="section section--bazi" aria-labelledby="bazi-heading">
      <h2 class="section__heading" id="bazi-heading">
        <span class="section__hanzi">八字</span>
        <span class="section__english">Eight Characters</span>
      </h2>
      <p class="bazi-string" data-bazi-string></p>
      <p class="section__legend">Four pairs, read across — this is the moment, written.</p>
    </section>

    <section class="section section--elements" aria-labelledby="elements-heading">
      <h2 class="section__heading" id="elements-heading">
        <span class="section__hanzi">五行</span>
        <span class="section__english">Five Elements</span>
      </h2>
      <ul class="tally">${tally}</ul>
      <p class="derivation" data-derivation></p>
    </section>`
}

export function createChartView(root: HTMLElement): ChartView {
  let pillars: readonly PillarRefs[] | null = null
  let baziString: HTMLElement | null = null
  let tallyRoot: HTMLElement | null = null
  let derivation: HTMLElement | null = null
  const timers = new Map<string, number>()

  function build(chart: BaziChart): readonly PillarRefs[] {
    root.innerHTML = skeleton(chart)
    baziString = q(root, '[data-bazi-string]')
    tallyRoot = q(root, '.tally')
    derivation = q(root, '[data-derivation]')

    return [...root.querySelectorAll<HTMLElement>('.pillar')].map((li) => ({
      root: li,
      sourceValue: q(li, '[data-source-value]'),
      sourceNote: q(li, '[data-source-note]'),
      stemChar: q(li, '[data-stem-char]'),
      branchChar: q(li, '[data-branch-char]'),
      stemGlyph: q(li, '[data-stem-glyph]'),
      branchGlyph: q(li, '[data-branch-glyph]'),
      stemElement: q(li, '[data-stem-element]'),
      branchElement: q(li, '[data-branch-element]'),
      change: q(li, '[data-change]'),
    }))
  }

  /**
   * Emphasise a pillar that just moved.
   *
   * The attribute is removed and re-applied so a repeated change to the same
   * pillar restarts the transition rather than sitting there already lit.
   */
  function emphasise(refs: PillarRefs, change: PillarChange): void {
    const key = change.id
    const existing = timers.get(key)
    if (existing !== undefined) window.clearTimeout(existing)

    refs.root.removeAttribute('data-changed')
    // Reading a layout property flushes the removal, so the transition restarts.
    void refs.root.offsetWidth
    refs.root.dataset.changed = change.inherited ? 'inherited' : 'own'

    // The reason is printed as written, with no prefix: it already distinguishes
    // the two cases in words rather than only in colour — an own change reads
    // "crossed …" or "moved …", an inherited one reads "… followed it (五鼠遁)".
    // An earlier version prefixed "moved · " and produced "moved · moved 1 day".
    refs.change.textContent = change.reason
    refs.change.hidden = false

    timers.set(
      key,
      window.setTimeout(() => {
        refs.root.removeAttribute('data-changed')
        refs.change.hidden = true
        refs.change.textContent = ''
        timers.delete(key)
      }, EMPHASIS_MS),
    )
  }

  function update(chart: BaziChart, changes: readonly PillarChange[]): void {
    if (!pillars) pillars = build(chart)

    const sources = pillarSources(chart)

    pillars.forEach((refs, index) => {
      const pillar = chart.pillars[index]
      const source = sources[index]
      if (!pillar || !source) return

      refs.sourceValue.textContent = source.value
      refs.sourceNote.textContent = source.note
      refs.stemChar.textContent = pillar.stem.hanzi
      refs.branchChar.textContent = pillar.branch.hanzi
      refs.stemGlyph.dataset.element = pillar.stem.element
      refs.branchGlyph.dataset.element = pillar.branch.element
      refs.stemElement.textContent = elementText(pillar.stem.element)
      refs.stemElement.dataset.element = pillar.stem.element
      refs.branchElement.textContent = elementText(pillar.branch.element)
      refs.branchElement.dataset.element = pillar.branch.element

      const change = changes.find((c) => c.position === index)
      if (change) emphasise(refs, change)
    })

    if (baziString) {
      baziString.textContent = chart.pillars
        .map((p) => `${p.stem.hanzi}${p.branch.hanzi}`)
        .join(' ')
    }

    if (tallyRoot) {
      const tally = tallyElements(chart)
      for (const e of ELEMENTS) {
        const count = tally[e.id]
        const row = tallyRoot.querySelector<HTMLElement>(`[data-element="${e.id}"]`)
        const fill = tallyRoot.querySelector<HTMLElement>(`[data-fill="${e.id}"]`)
        const value = tallyRoot.querySelector<HTMLElement>(`[data-count-for="${e.id}"]`)
        if (row) row.dataset.count = String(count)
        // Out of eight, so four characters of one element fills half the bar.
        if (fill) fill.style.setProperty('--fill', String(count / 8))
        if (value) value.textContent = String(count)
      }
    }

    if (derivation) {
      const d = chart.derivation
      derivation.textContent =
        `Solar longitude ${d.solarLongitude.toFixed(2)}° · ` +
        `Julian Day ${d.dayJulianDayNumber} · ` +
        `day ${d.daySexagenaryIndex + 1} of the 60-day cycle` +
        `${d.beforeLiChun ? ' · before 立春' : ''}`
    }
  }

  function clear(message: string): void {
    for (const timer of timers.values()) window.clearTimeout(timer)
    timers.clear()
    pillars = null
    baziString = null
    tallyRoot = null
    derivation = null
    root.innerHTML = `<p class="placeholder">${message}</p>`
  }

  return { update, clear }
}

/** The eight characters as plain text, for the document title and the summary. */
export function baziText(chart: BaziChart): string {
  return eightCharacters(chart).join('')
}
