/**
 * @vitest-environment jsdom
 *
 * An end-to-end test of the core interaction, driven the way a visitor drives it.
 *
 * The calculation tests prove the rules are right; this proves the page is
 * actually wired to them. It loads the real `index.html` — not a fixture — so a
 * renamed id or a deleted input fails here rather than silently in a browser.
 */

import { beforeAll, describe, expect, it } from 'vitest'
// `?raw` is Vite's own file-as-string import, so this needs no Node type packages
// and still reads the exact file the build ships.
import indexHtml from '../index.html?raw'

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

/** Set an input the way a picker does, and let the page react. */
function setValue(input: HTMLInputElement, value: string): void {
  input.value = value
  input.dispatchEvent(new Event('input', { bubbles: true }))
}

/** The eight characters currently on the page, read out of the rendered table. */
function renderedCharacters(): string {
  return [...output().querySelectorAll('.cell__hanzi')]
    .map((cell) => cell.textContent?.trim() ?? '')
    .join('')
}

beforeAll(async () => {
  document.body.innerHTML = bodyMarkup()
  await import('./main')
})

describe('the page on load', () => {
  it('starts from the default moment rather than an empty form', () => {
    expect(dateInput().value).toBe('1990-06-15')
    expect(timeInput().value).toBe('14:30')
  })

  it('shows a chart immediately, without the visitor submitting anything', () => {
    // Stems then branches, read column by column: 庚午 壬午 辛亥 乙未.
    expect(renderedCharacters()).toBe('庚壬辛乙午午亥未')
  })

  it('names each element in text, not only in colour', () => {
    const labels = [...output().querySelectorAll('.cell__element')].map((n) => n.textContent)
    expect(labels).toHaveLength(8)
    for (const label of labels) expect(label).toMatch(/Wood|Fire|Earth|Metal|Water/)
  })

  it('tallies all five elements across the eight characters', () => {
    const counts = [...output().querySelectorAll('.tally li')].map((li) =>
      Number(li.getAttribute('data-count')),
    )
    expect(counts).toHaveLength(5)
    expect(counts.reduce((a, b) => a + b, 0)).toBe(8)
  })
})

describe('changing the moment', () => {
  it('changing the time repaints the hour pillar', () => {
    setValue(timeInput(), '08:30')
    const after = renderedCharacters()
    expect(after).not.toBe('庚壬辛乙午午亥未')
    expect(after.slice(0, 3)).toBe('庚壬辛') // year, month, day stems unchanged
  })

  it('changing the date repaints the whole chart', () => {
    setValue(timeInput(), '14:30')
    const before = renderedCharacters()
    setValue(dateInput(), '2001-11-03')
    expect(renderedCharacters()).not.toBe(before)
  })

  it('explains why the year turned, for a birth before 立春', () => {
    setValue(dateInput(), '1990-01-20')
    expect(output().textContent).toContain('before')
    expect(output().textContent).toContain('立春')
    // January 1990 falls before that year's 立春, so the Bazi year is 1989.
    expect(output().textContent).toContain('1989')
  })

  it('says so when a birth at 23:00 rolls into the next Bazi day', () => {
    setValue(dateInput(), '1990-06-15')
    setValue(timeInput(), '23:00')
    expect(output().textContent).toContain('rolled forward')
  })

  it('prompts instead of guessing when an input is cleared', () => {
    setValue(dateInput(), '')
    expect(output().querySelector('.placeholder')).not.toBeNull()
    expect(output().querySelectorAll('.cell__hanzi')).toHaveLength(0)
  })

  it('recovers as soon as the input is valid again', () => {
    setValue(dateInput(), '1990-06-15')
    setValue(timeInput(), '14:30')
    expect(renderedCharacters()).toBe('庚壬辛乙午午亥未')
  })

  it('announces the current chart in the live region', () => {
    const summary = $<HTMLElement>('#chart-summary')
    expect(summary.getAttribute('aria-live')).toBe('polite')
    expect(summary.textContent).toContain('Day Pillar: 辛亥')
  })
})
