import { describe, expect, it } from 'vitest'
import { PRODUCTS } from './products'
import { formatWorkTime, hoursToEarn, rhythmFor } from '../life/duration'

// The dataset is content, not code, so it is the one part of this project a
// careless edit can break without any type error. These are its contracts.

describe('the shape of the ladder', () => {
  it('has enough rungs to show a range, and few enough to read', () => {
    expect(PRODUCTS.length).toBeGreaterThanOrEqual(40)
    expect(PRODUCTS.length).toBeLessThanOrEqual(60)
  })

  it('gives every product a unique id', () => {
    const ids = PRODUCTS.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('climbs', () => {
    const prices = PRODUCTS.map((p) => p.priceAUD)
    expect([...prices].sort((a, b) => a - b)).toEqual(prices)
  })

  it('spans six orders of magnitude, so the units have to change', () => {
    const first = PRODUCTS[0]!.priceAUD
    const last = PRODUCTS.at(-1)!.priceAUD
    expect(last / first).toBeGreaterThan(1_000_000)
  })

  it('prices everything positively and finitely', () => {
    for (const p of PRODUCTS) {
      expect(Number.isFinite(p.priceAUD), p.id).toBe(true)
      expect(p.priceAUD, p.id).toBeGreaterThan(0)
    }
  })
})

describe('what the dataset claims about itself', () => {
  it('names a source for every price', () => {
    for (const p of PRODUCTS) {
      expect(p.priceSourceLabel.trim().length, p.id).toBeGreaterThan(0)
    }
  })

  // The one that matters: a placeholder must not look like a checked figure.
  // Provisional prices carry no checked date and no URL; a price that claims a
  // checked date has to be marked as not provisional.
  it('never lets a placeholder claim to have been checked', () => {
    for (const p of PRODUCTS) {
      if (p.provisional) {
        expect(p.priceCheckedDate, `${p.id} is provisional but claims a checked date`).toBeNull()
        expect(p.priceSourceURL, `${p.id} is provisional but claims a source URL`).toBeNull()
      } else {
        expect(p.priceCheckedDate, `${p.id} is not provisional but has no checked date`).toMatch(
          /^\d{4}-\d{2}-\d{2}$/,
        )
      }
    }
  })

  it('uses one of the four declared scales', () => {
    for (const p of PRODUCTS) {
      expect(['everyday', 'household', 'major', 'extraordinary'], p.id).toContain(p.scale)
    }
  })

  it('keeps scale and price in step', () => {
    const order = ['everyday', 'household', 'major', 'extraordinary']
    const seen = PRODUCTS.map((p) => order.indexOf(p.scale))
    expect([...seen].sort((a, b) => a - b)).toEqual(seen)
  })
})

describe('what the ladder does at the visitor’s rate', () => {
  // The whole ladder, at the brief's example rate of $22.00 an hour of life.
  const rhythm = rhythmFor(40)
  const times = PRODUCTS.map((p) => formatWorkTime(hoursToEarn(p.priceAUD, 22), rhythm))

  it('starts in minutes and ends in working years', () => {
    expect(times[0]!.unitKey).toBe('minutes')
    expect(times.at(-1)!.unitKey).toBe('working years')
  })

  it('passes through every unit on the way, so the climb is visible', () => {
    expect(new Set(times.map((t) => t.unitKey))).toEqual(
      new Set(['minutes', 'hours', 'working days', 'working weeks', 'working months', 'working years']),
    )
  })

  // Below the top rung the unit always climbs before the number does. Years is
  // the top rung itself, so the most extraordinary object on the ladder is the
  // one place a value is allowed past a hundred — there is no higher unit left
  // to hand it off to.
  it('keeps every value under the years tier picturable', () => {
    for (const [i, t] of times.entries()) {
      if (t.unitKey === 'working years') continue
      expect(t.value, `${PRODUCTS[i]!.id} → ${t.text}`).toBeLessThan(100)
    }
  })
})
