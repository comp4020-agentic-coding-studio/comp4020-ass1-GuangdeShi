/**
 * Tests for the 立春 comparison.
 *
 * The example only teaches anything if the two moments really do straddle the
 * boundary and really do produce different Year Pillars — for any year, not just
 * the one that was checked by hand.
 */

import { describe, expect, it } from 'vitest'

import { calculateChart } from './calculate'
import { formatDate, formatMoment, liChunComparison, momentInUtcPlus8 } from './lichun'

const YEARS = [1900, 1949, 1984, 1990, 2000, 2019, 2026, 2050, 2099] as const

describe('momentInUtcPlus8', () => {
  it('reads an instant as Beijing wall-clock time, not the machine timezone', () => {
    // 1990-02-03T20:14:00Z is 1990-02-04 04:14 in UTC+8.
    expect(momentInUtcPlus8(Date.UTC(1990, 1, 3, 20, 14))).toEqual({
      year: 1990, month: 2, day: 4, hour: 4, minute: 14,
    })
  })

  it('carries across a date boundary', () => {
    expect(momentInUtcPlus8(Date.UTC(1999, 11, 31, 16, 0))).toEqual({
      year: 2000, month: 1, day: 1, hour: 0, minute: 0,
    })
  })
})

describe('formatting', () => {
  it('writes an instant in full', () => {
    expect(formatMoment({ year: 1990, month: 2, day: 4, hour: 4, minute: 14 }))
      .toBe('4 February 1990, 04:14')
  })

  it('writes a bare date for the comparison controls', () => {
    expect(formatDate({ year: 1990, month: 2, day: 3, hour: 12, minute: 0 }))
      .toBe('3 February')
  })
})

describe('liChunComparison', () => {
  it.each(YEARS)('straddles the boundary in %i', (year) => {
    const { before, after, instant } = liChunComparison(year)

    // 立春 always falls on 3–5 February.
    expect(instant.month).toBe(2)
    expect(instant.day).toBeGreaterThanOrEqual(3)
    expect(instant.day).toBeLessThanOrEqual(5)

    // One day either side, both at midday, so neither touches the 23:00 boundary.
    expect(before.hour).toBe(12)
    expect(after.hour).toBe(12)
    expect(after.day - before.day).toBe(2)
  })

  it.each(YEARS)('yields two different Year Pillars in %i', (year) => {
    const { before, after } = liChunComparison(year)
    const beforeChart = calculateChart(before)
    const afterChart = calculateChart(after)

    expect(beforeChart.derivation.beforeLiChun).toBe(true)
    expect(afterChart.derivation.beforeLiChun).toBe(false)
    expect(beforeChart.derivation.baziYear).toBe(year - 1)
    expect(afterChart.derivation.baziYear).toBe(year)

    const yearPillar = (chart: ReturnType<typeof calculateChart>): string =>
      `${chart.pillars[0].stem.hanzi}${chart.pillars[0].branch.hanzi}`
    expect(yearPillar(beforeChart)).not.toBe(yearPillar(afterChart))
  })

  it('produces the worked 1990 example', () => {
    const { before, after } = liChunComparison(1990)
    expect(formatDate(before)).toBe('3 February')
    expect(formatDate(after)).toBe('5 February')
    // 己巳 (1989) either side of the boundary from 庚午 (1990).
    expect(calculateChart(before).pillars[0].stem.hanzi).toBe('己')
    expect(calculateChart(after).pillars[0].stem.hanzi).toBe('庚')
  })

  it('only moves the year and month pillars — the day count is unaffected', () => {
    // Two days apart, so the day pillar differs; the point is that the *year*
    // difference is not explained by the dates being far apart.
    const { before, after } = liChunComparison(2000)
    expect(calculateChart(after).derivation.dayJulianDayNumber -
      calculateChart(before).derivation.dayJulianDayNumber).toBe(2)
  })
})
