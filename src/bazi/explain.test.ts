/**
 * Tests for the explanatory layer.
 *
 * The claim Phase 2 makes to the visitor is "this change moved *that* pillar, for
 * *this* reason". These tests hold that claim to account — including the two
 * cases where the intuitive one-input-one-pillar model is wrong.
 */

import { describe, expect, it } from 'vitest'

import { calculateChart } from './calculate'
import { announceChanges, describeChanges, doubleHourRange, pillarSources } from './explain'
import type { BirthMoment } from './types'

const at = (
  year: number, month: number, day: number, hour = 12, minute = 0,
): BirthMoment => ({ year, month, day, hour, minute })

const changesBetween = (before: BirthMoment, after: BirthMoment) =>
  describeChanges(calculateChart(before), calculateChart(after))

const changedIds = (before: BirthMoment, after: BirthMoment): string[] =>
  changesBetween(before, after).map((change) => change.id)

describe('doubleHourRange', () => {
  it('spans two hours from the branch start hour', () => {
    expect(doubleHourRange(13)).toBe('13:00 – 15:00')
    expect(doubleHourRange(23)).toBe('23:00 – 01:00') // 子 wraps midnight
  })
})

describe('describeChanges — which pillar moved', () => {
  it('reports nothing when the moment is unchanged', () => {
    expect(changedIds(at(1990, 6, 15, 14, 30), at(1990, 6, 15, 14, 30))).toEqual([])
  })

  it('reports nothing when only the minute moves inside a double-hour', () => {
    expect(changedIds(at(1990, 6, 15, 14, 0), at(1990, 6, 15, 14, 59))).toEqual([])
  })

  it('moves only the hour pillar when the hour moves within a day', () => {
    expect(changedIds(at(1990, 6, 15, 14, 30), at(1990, 6, 15, 4, 30))).toEqual(['hour'])
  })

  it('names the double-hour the visitor moved into', () => {
    const [change] = changesBetween(at(1990, 6, 15, 14, 30), at(1990, 6, 15, 4, 30))
    expect(change?.reason).toContain('寅')
    expect(change?.reason).toContain('03:00 – 05:00')
    expect(change?.inherited).toBe(false)
  })
})

describe('describeChanges — the couplings the interaction has to teach', () => {
  it('moves the hour pillar when the *day* changes, and says the stem followed', () => {
    // The clock time is identical; only the date moved. The hour branch cannot
    // change, but its stem is derived from the day stem, so the pillar still moves.
    const changes = changesBetween(at(1990, 6, 15, 14, 30), at(1990, 6, 16, 14, 30))
    expect(changes.map((c) => c.id)).toEqual(['day', 'hour'])

    const hour = changes.find((c) => c.id === 'hour')
    expect(hour?.inherited).toBe(true)
    expect(hour?.reason).toContain('五鼠遁')
  })

  it('moves the month pillar when the *year* changes, and says the stem followed', () => {
    // Same date and time, one year later: the month branch is still 午, but the
    // month stem is derived from the year stem.
    const changes = changesBetween(at(1990, 6, 15, 14, 30), at(1991, 6, 15, 14, 30))
    expect(changes.map((c) => c.id)).toEqual(['year', 'month', 'day'])

    const month = changes.find((c) => c.id === 'month')
    expect(month?.inherited).toBe(true)
    expect(month?.reason).toContain('五虎遁')
  })

  it('leaves the hour pillar alone across a common year, where the couplings cancel', () => {
    // Not an oversight, and worth asserting because it looks like one: a common
    // year is 365 days and 365 mod 60 = 5, so the day stem advances by 5. The
    // hour stem is (2 × day stem + hour) mod 10, and 2 × 5 ≡ 0 (mod 10), so it
    // lands back on itself. The day pillar moves while the hour pillar does not.
    const before = calculateChart(at(1990, 6, 15, 14, 30))
    const after = calculateChart(at(1991, 6, 15, 14, 30))
    expect(after.pillars[2]).not.toEqual(before.pillars[2])
    expect(after.pillars[3]).toEqual(before.pillars[3])
  })

  it('marks a change as its own when the layer itself moved', () => {
    const changes = changesBetween(at(1990, 6, 15, 14, 30), at(1990, 6, 16, 14, 30))
    expect(changes.find((c) => c.id === 'day')?.inherited).toBe(false)
  })
})

describe('describeChanges — the four boundaries', () => {
  it('attributes a year change to 立春 when the boundary was crossed', () => {
    const changes = changesBetween(at(1990, 2, 1, 12), at(1990, 2, 10, 12))
    const year = changes.find((c) => c.id === 'year')
    expect(year?.reason).toContain('立春')
    expect(year?.to).toBe('庚午')
  })

  it('does not blame 立春 for an ordinary year change', () => {
    const changes = changesBetween(at(1990, 6, 15, 12), at(1991, 6, 15, 12))
    expect(changes.find((c) => c.id === 'year')?.reason).not.toContain('立春')
  })

  it('attributes a month change to a solar term', () => {
    // Mid-June is the 午 month; mid-July is the 未 month.
    const changes = changesBetween(at(1990, 6, 15, 12), at(1990, 7, 15, 12))
    const month = changes.find((c) => c.id === 'month')
    expect(month?.reason).toContain('solar term')
    expect(month?.reason).toContain('未')
    expect(month?.inherited).toBe(false)
  })

  it('attributes a day change to the 23:00 boundary when that is the cause', () => {
    const changes = changesBetween(at(1990, 6, 15, 22, 59), at(1990, 6, 15, 23, 0))
    const day = changes.find((c) => c.id === 'day')
    expect(day?.reason).toContain('23:00')
    expect(day?.reason).toContain('子')
  })

  it('counts the days moved for an ordinary day change', () => {
    const changes = changesBetween(at(1990, 6, 15, 12), at(1990, 6, 18, 12))
    expect(changes.find((c) => c.id === 'day')?.reason).toContain('3 day')
  })
})

describe('pillarSources', () => {
  const sources = pillarSources(calculateChart(at(1990, 6, 15, 14, 30)))

  it('names the layer of time behind each pillar', () => {
    expect(sources[0].value).toContain('1990')
    expect(sources[1].value).toContain('午')
    expect(sources[2].value).toContain('15 June')
    expect(sources[3].value).toBe('14:30')
  })

  it('names what governs each boundary, since they differ', () => {
    expect(sources[0].note).toContain('立春')
    expect(sources[1].note).toContain('solar term')
    expect(sources[2].note).toContain('60-day cycle')
    expect(sources[3].note).toContain('未')
  })

  it('says when the year belongs to the previous solar year', () => {
    const early = pillarSources(calculateChart(at(1990, 1, 20, 12)))
    expect(early[0].value).toContain('1989')
    expect(early[0].note).toContain('before 立春')
  })

  it('says when the day has rolled past 23:00', () => {
    const late = pillarSources(calculateChart(at(1990, 6, 15, 23, 30)))
    expect(late[2].value).toContain('next day')
    expect(late[2].note).toContain('23:00')
  })
})

describe('announceChanges', () => {
  it('announces each pillar that moved, with its reason', () => {
    const after = calculateChart(at(1990, 6, 15, 4, 30))
    const changes = changesBetween(at(1990, 6, 15, 14, 30), at(1990, 6, 15, 4, 30))
    const sentence = announceChanges(after, changes)
    expect(sentence).toContain('Hour Pillar is now')
    expect(sentence).toContain('寅')
  })

  it('still reads out the chart when nothing moved', () => {
    const chart = calculateChart(at(1990, 6, 15, 14, 30))
    expect(announceChanges(chart, [])).toContain('庚午 壬午 辛亥 乙未')
  })
})
