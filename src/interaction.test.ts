/**
 * @vitest-environment jsdom
 *
 * The page, driven the way a visitor drives it.
 *
 * These load the real `index.html` — not a fixture — so a renamed id, a deleted
 * input or a control that stopped being wired fails here instead of failing
 * silently in a browser. The pure modules are tested elsewhere; what is tested
 * here is only what the *page* does: that typing changes the rate, that the
 * ladder reprices every object in time, and that nothing invents a number.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
// `?raw` is Vite's own file-as-string import, so this needs no Node type
// packages and still reads the exact file the build ships.
import indexHtml from '../index.html?raw'

/** The body of the real index.html, so the test runs against shipped markup. */
function bodyMarkup(): string {
  const match = /<body[^>]*>([\s\S]*)<\/body>/i.exec(indexHtml)
  if (!match?.[1]) throw new Error('index.html has no <body>')
  // The module is imported by the test, not run from the <script> tag.
  return match[1].replace(/<script[\s\S]*?<\/script>/gi, '')
}

/**
 * A fresh page for every test.
 *
 * `main.ts` captures its elements and wires its listeners at import time, so
 * the module registry has to be cleared alongside the DOM — otherwise the
 * second test would be driving the first test's page.
 */
async function loadPage(): Promise<void> {
  document.body.innerHTML = bodyMarkup()
  vi.resetModules()
  await import('./main')
}

const $ = <T extends Element>(selector: string): T => {
  const found = document.querySelector<T>(selector)
  if (!found) throw new Error(`Missing ${selector}`)
  return found
}

const text = (selector: string): string => $(selector).textContent?.trim() ?? ''
const price = (id: string): string => text(`[data-testid="price-${id}"]`)

function type(selector: string, value: string): void {
  const input = $<HTMLInputElement>(selector)
  input.value = value
  input.dispatchEvent(new Event('input', { bubbles: true }))
}

function select(selector: string, value: string): void {
  const control = $<HTMLSelectElement>(selector)
  control.value = value
  control.dispatchEvent(new Event('change', { bubbles: true }))
}

beforeEach(async () => {
  await loadPage()
})

describe('the page as it first appears', () => {
  it('opens on the worked example, already calculated', () => {
    // $4,400 a month, 40 h work, 10 h commute: 160 paid, 200 committed.
    expect(text('[data-testid="paid-rate"]')).toBe('$27.50 an hour')
    expect(text('[data-testid="life-rate"]')).toBe('$22.00 an hour')
    expect(text('[data-testid="paid-rate-working"]')).toContain('160 h')
    expect(text('[data-testid="life-rate-working"]')).toContain('200 h')
  })

  it('shows every price in time, with no currency to choose', () => {
    expect(document.querySelector('#mode-form')).toBeNull()
    expect(document.querySelector('input[name="price-mode"]')).toBeNull()
    expect($('#ladder').getAttribute('data-state')).toBe('ready')
    expect(price('coffee')).toBe('16 minutes')
  })

  it('builds one rung per product, in ascending order', () => {
    const rungs = document.querySelectorAll('.rung')
    expect(rungs.length).toBeGreaterThanOrEqual(16)
    const first = rungs[0]?.getAttribute('data-id')
    const last = rungs[rungs.length - 1]?.getAttribute('data-id')
    expect(first).toBeTruthy()
    expect(last).toBeTruthy()
    expect(first).not.toBe(last)
  })

  it('names a source on every rung', () => {
    for (const rung of document.querySelectorAll('.rung')) {
      const source = rung.querySelector('.rung__source')?.textContent ?? ''
      expect(source.length, rung.getAttribute('data-id') ?? '').toBeGreaterThan(0)
    }
  })
})

describe('the wage drives everything the ladder says', () => {
  it('makes every price longer when the same job pays less', () => {
    const before = price('laptop')
    type('#pay-amount', '2200')
    expect(price('laptop')).not.toBe(before)
    expect(text('[data-testid="life-rate"]')).toBe('$11.00 an hour')
    // Half the pay, so the same laptop crosses into the next unit up.
    expect(price('laptop')).toBe('1 working month')
  })

  it('reprices the same objects without renaming or reordering them', () => {
    const names = [...document.querySelectorAll('.rung__name')].map((n) => n.textContent)
    type('#pay-amount', '2200')
    expect([...document.querySelectorAll('.rung__name')].map((n) => n.textContent)).toEqual(names)
  })

  it('counts the commute, and shows what it costs', () => {
    type('#commute-hours', '0')
    expect(text('[data-testid="life-rate"]')).toBe('$27.50 an hour')
    expect(text('[data-testid="rate-gap"]')).toContain('no commute')

    type('#commute-hours', '10')
    expect(text('[data-testid="rate-gap"]')).toContain('20%')
  })

  it('re-labels the pay field for the period, and re-does the arithmetic', () => {
    select('#pay-period', 'hourly')
    expect(text('#pay-amount-label')).toBe('Hourly pay')

    type('#pay-amount', '27.5')
    // An hourly worker's entered wage *is* the paid rate; the life-adjusted one
    // is still lower, because the commute is still unpaid.
    expect(text('[data-testid="paid-rate"]')).toBe('$27.50 an hour')
    expect(text('[data-testid="life-rate"]')).toBe('$22.00 an hour')
  })

  it('uses the visitor’s own working week as the unit', () => {
    type('#work-hours', '20')
    type('#commute-hours', '0')
    type('#pay-amount', '2200')
    // $2,200 a month over 80 paid hours is the same $27.50 an hour — but a
    // working week is half as long, so the same price is twice as many of them.
    expect(text('[data-testid="life-rate"]')).toBe('$27.50 an hour')
    expect(price('laptop')).toBe('3.3 working weeks')
  })

  it('says in words what the ladder is doing', () => {
    expect(text('#ladder-caption')).toContain('$22.00 an hour')
    type('#pay-amount', '')
    expect(text('#ladder-caption')).toContain('Fill in how you are paid')
  })
})

describe('what it does when it cannot answer honestly', () => {
  it('refuses to show a rate for an empty wage', () => {
    type('#pay-amount', '')
    expect($('#life-rate').getAttribute('data-state')).toBe('empty')
    expect(text('[data-testid="paid-rate"]')).toBe('—')
  })

  it('refuses to price anything on the ladder without a rate', () => {
    type('#pay-amount', '')
    expect(price('house')).toBe('—')
    expect($('#ladder').getAttribute('data-state')).toBe('empty')
  })

  it('refuses a week with more hours than a week has', () => {
    type('#work-hours', '160')
    type('#commute-hours', '20')
    expect($('#life-rate').getAttribute('data-state')).toBe('empty')
  })
})

describe('the page keeps its promises to a keyboard', () => {
  it('gives every control a label', () => {
    for (const id of ['#pay-period', '#pay-amount', '#work-hours', '#commute-hours']) {
      const control = $<HTMLElement>(id)
      expect(document.querySelector(`label[for="${control.id}"]`), id).toBeTruthy()
    }
  })

  it('announces the parts that change without being scrolled to', () => {
    expect($('#life-rate').getAttribute('aria-live')).toBe('polite')
    expect($('#ladder-caption').getAttribute('aria-live')).toBe('polite')
  })
})
