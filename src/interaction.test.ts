/**
 * @vitest-environment jsdom
 *
 * An end-to-end test of the core interaction, driven the way a visitor drives it.
 *
 * The calculation tests prove the rules are right and `explain.test.ts` proves the
 * attribution is right; this proves the page is actually wired to both. It loads
 * the real `index.html` — not a fixture — so a renamed id or a deleted input fails
 * here rather than silently in a browser.
 *
 * Emphasis is time-limited (a changed pillar un-highlights itself), so the whole
 * file runs on fake timers: `settle()` fast-forwards past the emphasis window to
 * get a clean slate before a test that asserts *exactly* which pillars are lit.
 */

import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
// `?raw` is Vite's own file-as-string import, so this needs no Node type packages
// and still reads the exact file the build ships.
import indexHtml from '../index.html?raw'

/** Must stay ahead of EMPHASIS_MS in components/chart-view.ts. */
const PAST_EMPHASIS_MS = 5000

/** The body of the real index.html, so the test runs against shipped markup. */
function bodyMarkup(): string {
  const match = /<body[^>]*>([\s\S]*)<\/body>/i.exec(indexHtml)
  if (!match?.[1]) throw new Error('index.html has no <body>')
  // The module is imported by the test, not by a <script> tag jsdom would run.
  return match[1].replace(/<script[\s\S]*?<\/script>/gi, '')
}

const $ = <T extends Element>(selector: string): T => {
  const found = document.querySelector<T>(selector)
  if (!found) throw new Error(`Missing ${selector}`)
  return found
}

const dateInput = (): HTMLInputElement => $<HTMLInputElement>('#birth-date')
const timeInput = (): HTMLInputElement => $<HTMLInputElement>('#birth-time')
const output = (): HTMLElement => $<HTMLElement>('#chart-output')
const boundary = (): HTMLElement => $<HTMLElement>('#boundary-output')
const summary = (): HTMLElement => $<HTMLElement>('#chart-summary')

/** Set an input the way a picker does, and let the page react. */
function setValue(input: HTMLInputElement, value: string): void {
  input.value = value
  input.dispatchEvent(new Event('input', { bubbles: true }))
}

/** Let every emphasis expire, so the next assertion starts from nothing lit. */
function settle(): void {
  vi.advanceTimersByTime(PAST_EMPHASIS_MS)
}

/** The eight characters currently on the page, read out of the rendered glyphs. */
function renderedCharacters(): string {
  return [...output().querySelectorAll('.glyph__char')]
    .map((glyph) => glyph.textContent?.trim() ?? '')
    .join('')
}

/** Which pillars are currently emphasised, and how. */
function emphasised(): Record<string, string> {
  const lit: Record<string, string> = {}
  for (const pillar of output().querySelectorAll<HTMLElement>('.pillar[data-changed]')) {
    lit[pillar.dataset.pillar ?? '?'] = pillar.dataset.changed ?? '?'
  }
  return lit
}

/** The visible "why it moved" note on one pillar, if it has one. */
function changeNote(id: string): string {
  const note = output().querySelector<HTMLElement>(`.pillar[data-pillar="${id}"] [data-change]`)
  if (!note || note.hidden) return ''
  return note.textContent ?? ''
}

/** The source line for one pillar: which layer of the moment it comes from. */
function sourceText(id: string): string {
  return output().querySelector(`.pillar[data-pillar="${id}"] .pillar__source`)?.textContent ?? ''
}

beforeAll(async () => {
  vi.useFakeTimers()
  document.body.innerHTML = bodyMarkup()
  await import('./main')
})

afterAll(() => {
  vi.useRealTimers()
})

describe('the page on load', () => {
  it('starts from the default moment rather than an empty form', () => {
    expect(dateInput().value).toBe('1990-06-15')
    expect(timeInput().value).toBe('14:30')
  })

  it('shows a chart immediately, without the visitor submitting anything', () => {
    // Stem then branch, column by column.
    expect(renderedCharacters()).toBe('庚午壬午辛亥乙未')
    // Written as four pairs. Split rather than compared to a literal, because an
    // ASCII space and an ideographic space are indistinguishable in this file.
    expect($('[data-bazi-string]').textContent?.split(/\s+/)).toEqual([
      '庚午',
      '壬午',
      '辛亥',
      '乙未',
    ])
  })

  it('emphasises nothing until something has actually changed', () => {
    expect(emphasised()).toEqual({})
    expect(summary().textContent).toBe('')
  })

  it('renders exactly four pillars, each naming the layer of time it comes from', () => {
    const pillars = [...output().querySelectorAll('.pillar')]
    expect(pillars.map((p) => p.getAttribute('data-pillar'))).toEqual([
      'year',
      'month',
      'day',
      'hour',
    ])
    expect(sourceText('year')).toContain('Solar year 1990')
    expect(sourceText('month')).toContain('of 12')
    expect(sourceText('hour')).toContain('未 hour')
  })

  it('names each element in text, not only in colour', () => {
    const labels = [...output().querySelectorAll('.element-chip')].map((n) => n.textContent)
    expect(labels).toHaveLength(8)
    for (const label of labels) expect(label).toMatch(/Wood|Fire|Earth|Metal|Water/)
  })

  it('tallies all five elements across the eight characters', () => {
    const counts = [...output().querySelectorAll('.tally__row')].map((row) =>
      Number(row.getAttribute('data-count')),
    )
    expect(counts).toHaveLength(5)
    expect(counts.reduce((a, b) => a + b, 0)).toBe(8)
  })
})

describe('which pillar moved', () => {
  it('emphasises only the hour pillar when only the clock time changes', () => {
    settle()
    setValue(timeInput(), '08:30')

    expect(emphasised()).toEqual({ hour: 'own' })
    expect(changeNote('hour')).toContain('moved')
    expect(changeNote('hour')).toContain('辰')
    expect(summary().textContent).toContain('Hour Pillar')
  })

  it('emphasises the day pillar, and the hour pillar as a follower, on a one-day change', () => {
    settle()
    setValue(dateInput(), '1990-06-16')

    // The hour stem is derived from the day stem (五鼠遁), so the hour pillar moves
    // even though the clock was not touched — and it says "followed", not "moved".
    expect(emphasised()).toEqual({ day: 'own', hour: 'inherited' })
    expect(changeNote('day')).toContain('60-day cycle')
    expect(changeNote('hour')).toContain('followed')
    expect(changeNote('hour')).toContain('五鼠遁')
  })

  it('leaves a pillar alone when nothing about its layer of time moved', () => {
    settle()
    setValue(timeInput(), '08:45') // same double-hour, same day

    expect(emphasised()).toEqual({})
    expect(summary().textContent).toContain('Unchanged')
  })

  it('un-emphasises a pillar once the change has been read', () => {
    settle()
    setValue(timeInput(), '02:30')
    expect(emphasised()).toEqual({ hour: 'own' })

    settle()
    expect(emphasised()).toEqual({})
    expect(changeNote('hour')).toBe('')
  })
})

describe('the four boundaries', () => {
  it('shows a January birth as belonging to the previous solar year', () => {
    settle()
    setValue(dateInput(), '1990-01-20')
    setValue(timeInput(), '14:30')

    // January 1990 falls before that year's 立春, so the Bazi year is 1989.
    expect(sourceText('year')).toContain('Solar year 1989')
    expect(sourceText('year')).toContain('立春')
  })

  it('says so when a birth at 23:00 rolls into the next Bazi day', () => {
    settle()
    setValue(dateInput(), '1990-06-15')
    setValue(timeInput(), '23:00')

    expect(sourceText('day')).toContain('next day')
    expect(sourceText('day')).toContain('23:00')
    expect(changeNote('day')).toContain('子')
  })

  it('offers two real buttons either side of 立春', () => {
    const buttons = [...boundary().querySelectorAll('.boundary__button')]
    expect(buttons).toHaveLength(2)
    for (const button of buttons) {
      expect(button.tagName).toBe('BUTTON')
      expect(button.getAttribute('aria-label')).toMatch(/立春/)
    }
    expect(boundary().textContent).toContain('does not begin on 1 January')
  })

  it('drives the main interaction from the 立春 example, rather than showing its own chart', () => {
    settle()
    setValue(dateInput(), '1990-06-15')
    setValue(timeInput(), '12:00')
    settle()

    $<HTMLButtonElement>('[data-before]').click()

    // The example loads its date into the inputs, so the Year Pillar visibly moves
    // in the same place as every other change.
    expect(dateInput().value).toBe('1990-02-03')
    expect(emphasised()['year']).toBe('own')
    expect(changeNote('year')).toContain('立春')
    expect(sourceText('year')).toContain('Solar year 1989')

    settle()
    $<HTMLButtonElement>('[data-after]').click()
    expect(dateInput().value).toBe('1990-02-05')
    expect(sourceText('year')).toContain('Solar year 1990')
  })
})

describe('when the moment is incomplete', () => {
  it('prompts instead of guessing when an input is cleared', () => {
    settle()
    setValue(dateInput(), '')

    expect(output().querySelector('.placeholder')).not.toBeNull()
    expect(output().querySelectorAll('.glyph__char')).toHaveLength(0)
    expect(summary().textContent).toBe('')
  })

  it('recovers as soon as the input is valid again', () => {
    // Time first, while the date is still empty: the chart is rebuilt by the last
    // edit only, so this also checks the rebuild starts from no history.
    setValue(timeInput(), '14:30')
    setValue(dateInput(), '1990-06-15')

    expect(renderedCharacters()).toBe('庚午壬午辛亥乙未')
    // Rebuilt from scratch, so nothing is falsely reported as having just moved.
    expect(emphasised()).toEqual({})
  })

  it('keeps the live region polite and atomic', () => {
    expect(summary().getAttribute('aria-live')).toBe('polite')
    expect(summary().getAttribute('aria-atomic')).toBe('true')
  })
})
