import { describe, expect, it } from 'vitest'

import { BRANCHES, STEMS, mod } from '../data/sexagenary'
import {
  calculateChart,
  eightCharacters,
  hourBranchIndex,
  tallyElements,
} from './calculate'
import {
  apparentSolarLongitude,
  julianDateFromUtcMs,
  julianDayNumber,
  liChunUtcMs,
  solarMonthIndexFromLongitude,
} from './solar'
import type { BirthMoment, ElementId } from './types'

/** Shorthand for a birth moment. */
const at = (
  year: number, month: number, day: number, hour = 12, minute = 0,
): BirthMoment => ({ year, month, day, hour, minute })

/** The stem-branch pair of one pillar, e.g. "庚午". */
const pair = (moment: BirthMoment, index: 0 | 1 | 2 | 3): string => {
  const p = calculateChart(moment).pillars[index]
  return `${p.stem.hanzi}${p.branch.hanzi}`
}

const yearPillar = (m: BirthMoment) => pair(m, 0)
const monthPillar = (m: BirthMoment) => pair(m, 1)
const dayPillar = (m: BirthMoment) => pair(m, 2)
const hourPillar = (m: BirthMoment) => pair(m, 3)

// ═══ Julian day arithmetic ══════════════════════════════════════════════════
// The day pillar rests entirely on the JDN, so it is checked on its own first.

describe('julianDayNumber', () => {
  it('matches published Julian Day Numbers', () => {
    expect(julianDayNumber(2000, 1, 1)).toBe(2451545)
    expect(julianDayNumber(1949, 10, 1)).toBe(2433191)
    expect(julianDayNumber(2019, 1, 27)).toBe(2458511)
    expect(julianDayNumber(2000, 3, 1)).toBe(2451605)
  })

  it('advances by exactly one per calendar day, across month and leap boundaries', () => {
    expect(julianDayNumber(2000, 3, 1) - julianDayNumber(2000, 2, 29)).toBe(1)
    expect(julianDayNumber(2000, 2, 29) - julianDayNumber(2000, 2, 28)).toBe(1)
    // 1900 was not a leap year; 2000 was.
    expect(julianDayNumber(1900, 3, 1) - julianDayNumber(1900, 2, 28)).toBe(1)
    expect(julianDayNumber(2021, 1, 1) - julianDayNumber(2020, 12, 31)).toBe(1)
  })
})

// ═══ Day pillar: independently sourced anchors ══════════════════════════════

describe('day pillar', () => {
  it('reproduces three independently sourced 甲子 / 戊午 anchor days', () => {
    // Chinese Wikipedia (干支): 1 October 1949 was a 甲子 day.
    expect(dayPillar(at(1949, 10, 1))).toBe('甲子')
    // 27 January 2019, sexagenary #1.
    expect(dayPillar(at(2019, 1, 27))).toBe('甲子')
    // 1 March 2000, sexagenary #55 = 戊午.
    expect(dayPillar(at(2000, 3, 1))).toBe('戊午')
  })

  it('is 甲子 again exactly 60 days after a 甲子 day', () => {
    expect(dayPillar(at(1949, 10, 1))).toBe('甲子')
    expect(dayPillar(at(1949, 11, 30))).toBe('甲子') // +60 days
  })

  it('advances one step in the 60-cycle per calendar day', () => {
    const first = calculateChart(at(1949, 10, 1)).derivation.daySexagenaryIndex
    const second = calculateChart(at(1949, 10, 2)).derivation.daySexagenaryIndex
    expect(second).toBe(mod(first + 1, 60))
    expect(dayPillar(at(1949, 10, 2))).toBe('乙丑')
  })
})

/**
 * An independent oracle for the day pillar.
 *
 * Two published sources disagreed about the day pillar of 1990-06-15 (辛亥 vs
 * 己酉), so neither could be trusted on its own. This resolves it structurally
 * instead: counting elapsed days from a *sourced* anchor day, using `Date`
 * arithmetic that shares no code with `julianDayNumber`. Three anchors that
 * disagree with each other are impossible if the offset is right, and all three
 * agree — which is much stronger evidence than any single lookup site.
 */
describe('day pillar, cross-checked against an independent oracle', () => {
  /** Sourced anchor days: 0-based position in the 60-cycle. */
  const ANCHORS: ReadonlyArray<readonly [BirthMoment, number]> = [
    [at(1949, 10, 1), 0], // 甲子
    [at(2019, 1, 27), 0], // 甲子
    [at(2000, 3, 1), 54], // 戊午, #55 1-based
  ]

  const elapsedDays = (from: BirthMoment, to: BirthMoment): number =>
    Math.round(
      (Date.UTC(to.year, to.month - 1, to.day) - Date.UTC(from.year, from.month - 1, from.day)) /
        86_400_000,
    )

  const probes: readonly BirthMoment[] = [
    at(1900, 1, 1), at(1949, 10, 2), at(1984, 2, 4), at(1990, 6, 15),
    at(2000, 2, 29), at(2024, 12, 31), at(2026, 8, 12), at(2099, 7, 4),
  ]

  it.each(probes.map((p) => [`${p.year}-${p.month}-${p.day}`, p] as const))(
    'agrees with all three anchors for %s',
    (_label, probe) => {
      const actual = calculateChart(probe).derivation.daySexagenaryIndex
      for (const [anchor, anchorIndex] of ANCHORS) {
        expect(actual).toBe(mod(anchorIndex + elapsedDays(anchor, probe), 60))
      }
    },
  )

  it('settles the disputed date: 1990-06-15 is 辛亥, not 己酉', () => {
    expect(calculateChart(at(1990, 6, 15)).derivation.daySexagenaryIndex).toBe(47)
    expect(dayPillar(at(1990, 6, 15))).toBe('辛亥')
  })
})

// ═══ Year pillar and the 立春 boundary ══════════════════════════════════════

describe('year pillar', () => {
  it('reproduces published cycle anchors', () => {
    expect(yearPillar(at(1984, 6, 15))).toBe('甲子')
    expect(yearPillar(at(2044, 6, 15))).toBe('甲子')
    expect(yearPillar(at(2012, 6, 15))).toBe('壬辰')
    expect(yearPillar(at(2026, 6, 15))).toBe('丙午')
    expect(yearPillar(at(1990, 6, 15))).toBe('庚午')
  })

  it('turns at 立春, not 1 January', () => {
    // Mid-January 1990 still belongs to the 1989 Bazi year (己巳).
    expect(yearPillar(at(1990, 1, 15))).toBe('己巳')
    // Mid-February is past 立春, so 1990 (庚午).
    expect(yearPillar(at(1990, 2, 15))).toBe('庚午')
  })

  it('flags births before 立春 in the derivation', () => {
    const before = calculateChart(at(1990, 1, 15)).derivation
    expect(before.beforeLiChun).toBe(true)
    expect(before.baziYear).toBe(1989)

    const after = calculateChart(at(1990, 2, 15)).derivation
    expect(after.beforeLiChun).toBe(false)
    expect(after.baziYear).toBe(1990)
  })

  it('places 立春 on 3-5 February for a spread of years', () => {
    for (const year of [1900, 1950, 1984, 1990, 2000, 2019, 2026, 2050, 2099]) {
      const instant = new Date(liChunUtcMs(year))
      expect(instant.getUTCFullYear()).toBe(year)
      expect(instant.getUTCMonth()).toBe(1) // February
      expect(instant.getUTCDate()).toBeGreaterThanOrEqual(3)
      expect(instant.getUTCDate()).toBeLessThanOrEqual(5)
    }
  })

  it('agrees with the solar longitude definition of 立春', () => {
    const longitude = apparentSolarLongitude(julianDateFromUtcMs(liChunUtcMs(2000)))
    expect(longitude).toBeCloseTo(315, 4)
  })
})

// ═══ Month pillar: solar terms and 五虎遁 ═══════════════════════════════════

describe('month pillar', () => {
  it('maps the twelve 節 longitudes to the right month branches', () => {
    const gates: ReadonlyArray<[number, string]> = [
      [315, '寅'], [345, '卯'], [15, '辰'], [45, '巳'],
      [75, '午'], [105, '未'], [135, '申'], [165, '酉'],
      [195, '戌'], [225, '亥'], [255, '子'], [285, '丑'],
    ]
    gates.forEach(([longitude, expected], i) => {
      const index = solarMonthIndexFromLongitude(longitude)
      expect(index).toBe(i + 1)
      expect(BRANCHES[mod(index + 1, 12)]?.hanzi).toBe(expected)
    })
  })

  it('applies 五虎遁 — 2026 (丙午) opens at 庚寅', () => {
    // Mid-February 2026 is in the 寅 month.
    expect(yearPillar(at(2026, 2, 15))).toBe('丙午')
    expect(monthPillar(at(2026, 2, 15))).toBe('庚寅')
  })

  it('opens 甲 and 己 years at 丙寅', () => {
    expect(yearPillar(at(1984, 2, 15))).toBe('甲子')
    expect(monthPillar(at(1984, 2, 15))).toBe('丙寅')
    expect(yearPillar(at(1989, 2, 15))).toBe('己巳')
    expect(monthPillar(at(1989, 2, 15))).toBe('丙寅')
  })

  it('follows solar terms rather than the Gregorian month', () => {
    // Early February, before 立春: still the 丑 month of the previous Bazi year.
    expect(calculateChart(at(1990, 2, 1)).derivation.solarMonthIndex).toBe(12)
    // Late February, after 立春: the 寅 month.
    expect(calculateChart(at(1990, 2, 20)).derivation.solarMonthIndex).toBe(1)
  })

  it('advances the month branch by one across a solar term, holding the year', () => {
    const march = calculateChart(at(1990, 3, 20))
    const april = calculateChart(at(1990, 4, 20))
    expect(march.derivation.baziYear).toBe(1990)
    expect(april.derivation.baziYear).toBe(1990)
    expect(april.derivation.solarMonthIndex).toBe(march.derivation.solarMonthIndex + 1)
  })
})

// ═══ Hour pillar: double-hours and 五鼠遁 ═══════════════════════════════════

describe('hour pillar', () => {
  it('maps clock hours to the twelve double-hours, 子 spanning 23:00-00:59', () => {
    expect(hourBranchIndex(23)).toBe(0) // 子
    expect(hourBranchIndex(0)).toBe(0) // 子
    expect(hourBranchIndex(1)).toBe(1) // 丑
    expect(hourBranchIndex(2)).toBe(1) // 丑
    expect(hourBranchIndex(3)).toBe(2) // 寅
    expect(hourBranchIndex(11)).toBe(6) // 午
    expect(hourBranchIndex(12)).toBe(6) // 午
    expect(hourBranchIndex(14)).toBe(7) // 未
    expect(hourBranchIndex(21)).toBe(11) // 亥
    expect(hourBranchIndex(22)).toBe(11) // 亥
  })

  it('applies 五鼠遁 — 甲/己 days open at 甲子', () => {
    // 1949-10-01 is a 甲 day; its 子 hour must be 甲子.
    expect(dayPillar(at(1949, 10, 1, 0))).toBe('甲子')
    expect(hourPillar(at(1949, 10, 1, 0))).toBe('甲子')
    // Two hours later, one step on: 乙丑.
    expect(hourPillar(at(1949, 10, 1, 1))).toBe('乙丑')
  })

  it('changes only the hour pillar when the hour moves within a day', () => {
    const morning = calculateChart(at(1990, 6, 15, 8))
    const evening = calculateChart(at(1990, 6, 15, 20))
    expect(hourPillar(at(1990, 6, 15, 8))).not.toBe(hourPillar(at(1990, 6, 15, 20)))
    // Year, month and day pillars are untouched.
    for (const i of [0, 1, 2] as const) {
      expect(morning.pillars[i]).toEqual(evening.pillars[i])
    }
  })
})

// ═══ The 23:00 day boundary (convention D) ══════════════════════════════════

describe('the 23:00 day rollover', () => {
  it('gives a 23:00 birth the next day\'s day pillar', () => {
    expect(dayPillar(at(1949, 10, 1, 22))).toBe('甲子')
    expect(dayPillar(at(1949, 10, 1, 23))).toBe('乙丑') // rolled forward
    expect(dayPillar(at(1949, 10, 2, 0))).toBe('乙丑') // same Bazi day
  })

  it('records the rollover in the derivation', () => {
    expect(calculateChart(at(1949, 10, 1, 22)).derivation.rolledToNextDay).toBe(false)
    expect(calculateChart(at(1949, 10, 1, 23)).derivation.rolledToNextDay).toBe(true)
  })

  it('derives the hour stem from the advanced day stem, keeping 子 as the branch', () => {
    const rolled = calculateChart(at(1949, 10, 1, 23))
    expect(rolled.pillars[3].branch.hanzi).toBe('子')
    // 乙 day → 子 hour is 丙子 by 五鼠遁.
    expect(hourPillar(at(1949, 10, 1, 23))).toBe('丙子')
  })
})

// ═══ A fully worked known moment ═══════════════════════════════════════════

describe('a known birth moment', () => {
  // 15 June 1990, 14:30 (read as UTC+8).
  //   Year : 1990 is past 立春 → (1990−4) mod 10 = 6 → 庚; mod 12 = 6 → 午
  //   Month: mid-June is between 芒種 (75°) and 小暑 (105°) → 午 month, index 5
  //          五虎遁: (2×6 + 5 + 1) mod 10 = 8 → 壬
  //   Day  : JDN 2448058 → (2448058+49) mod 60 = 47 → 辛(7) 亥(11)
  //   Hour : 14:30 → 未 (index 7); 五鼠遁: (2×7 + 7) mod 10 = 1 → 乙
  const moment = at(1990, 6, 15, 14, 30)

  it('produces 庚午 壬午 辛亥 乙未', () => {
    expect(yearPillar(moment)).toBe('庚午')
    expect(monthPillar(moment)).toBe('壬午')
    expect(dayPillar(moment)).toBe('辛亥')
    expect(hourPillar(moment)).toBe('乙未')
  })

  it('exposes the intermediate values it passed through', () => {
    const { derivation } = calculateChart(moment)
    expect(derivation.baziYear).toBe(1990)
    expect(derivation.beforeLiChun).toBe(false)
    expect(derivation.solarMonthIndex).toBe(5) // 午 month
    expect(derivation.dayJulianDayNumber).toBe(2448058)
    expect(derivation.daySexagenaryIndex).toBe(47)
    expect(derivation.solarLongitude).toBeGreaterThan(75)
    expect(derivation.solarLongitude).toBeLessThan(105)
  })

  it('reads out as eight characters', () => {
    expect(eightCharacters(calculateChart(moment))).toEqual(
      ['庚', '壬', '辛', '乙', '午', '午', '亥', '未'],
    )
  })
})

// ═══ Changing one field at a time ══════════════════════════════════════════
// The core interaction is "change the moment, watch the characters change", so
// each field is moved on its own and the *scope* of the change is asserted —
// not merely that something changed.

describe('changing one field at a time', () => {
  const base = at(1990, 6, 15, 14, 30)

  it('a change of year advances the year pillar by one step in both cycles', () => {
    const before = calculateChart(base)
    const after = calculateChart(at(1991, 6, 15, 14, 30))
    expect(before.pillars[0].stem.index).toBe(6) // 庚
    expect(after.pillars[0].stem.index).toBe(mod(6 + 1, 10)) // 辛
    expect(after.pillars[0].branch.index).toBe(mod(before.pillars[0].branch.index + 1, 12))
    expect(yearPillar(at(1991, 6, 15, 14, 30))).toBe('辛未')
  })

  it('a change of year leaves the day pillar governed by the day count, not the year', () => {
    // 1990-06-15 → 1991-06-15 is 365 days, and 365 mod 60 = 5.
    const before = calculateChart(base).derivation.daySexagenaryIndex
    const after = calculateChart(at(1991, 6, 15, 14, 30)).derivation.daySexagenaryIndex
    expect(after).toBe(mod(before + 5, 60))
  })

  it('a change of day moves the day and hour pillars, holding year and month', () => {
    const before = calculateChart(base)
    const after = calculateChart(at(1990, 6, 16, 14, 30))
    expect(after.pillars[0]).toEqual(before.pillars[0]) // year holds
    expect(after.pillars[1]).toEqual(before.pillars[1]) // month holds
    expect(after.pillars[2]).not.toEqual(before.pillars[2]) // day moves
    // The hour *branch* is unchanged (still 未) but its stem follows the new day.
    expect(after.pillars[3].branch.hanzi).toBe(before.pillars[3].branch.hanzi)
    expect(after.pillars[3].stem.hanzi).not.toBe(before.pillars[3].stem.hanzi)
  })

  it('a change of hour within a day moves only the hour pillar', () => {
    const before = calculateChart(base)
    const after = calculateChart(at(1990, 6, 15, 4, 30))
    for (const i of [0, 1, 2] as const) {
      expect(after.pillars[i]).toEqual(before.pillars[i])
    }
    expect(after.pillars[3]).not.toEqual(before.pillars[3])
  })

  it('a change of minute alone does not move any pillar', () => {
    // Minutes only matter within ~15 minutes of a solar term; inside a
    // double-hour they must be inert, or the display would flicker while typing.
    expect(calculateChart(at(1990, 6, 15, 14, 0)).pillars).toEqual(
      calculateChart(at(1990, 6, 15, 14, 59)).pillars,
    )
  })
})

// ═══ Structural invariants: always four pillars, always eight characters ════

describe('chart shape', () => {
  const samples: readonly BirthMoment[] = [
    at(1900, 1, 1, 0, 0),
    at(1949, 10, 1, 23, 59),
    at(1984, 2, 4, 12, 0),
    at(1990, 6, 15, 14, 30),
    at(2000, 2, 29, 23, 0),
    at(2019, 1, 27, 3, 15),
    at(2026, 12, 31, 22, 45),
    at(2099, 8, 8, 8, 8),
  ]

  it('always yields exactly four pillars', () => {
    for (const moment of samples) {
      expect(calculateChart(moment).pillars).toHaveLength(4)
    }
  })

  it('always yields exactly eight characters, one per stem and branch', () => {
    for (const moment of samples) {
      const characters = eightCharacters(calculateChart(moment))
      expect(characters).toHaveLength(8)
      expect(characters.every((c) => [...c].length === 1)).toBe(true)
    }
  })

  it('labels the four pillars year, month, day, hour in order', () => {
    const chart = calculateChart(at(1990, 6, 15))
    expect(chart.pillars.map((p) => p.id)).toEqual(['year', 'month', 'day', 'hour'])
    expect(chart.pillars.map((p) => p.labelHanzi)).toEqual(['年柱', '月柱', '日柱', '时柱'])
  })

  it('draws every character from the ten stems and twelve branches', () => {
    const stemChars = new Set(STEMS.map((s) => s.hanzi))
    const branchChars = new Set(BRANCHES.map((b) => b.hanzi))
    for (const moment of samples) {
      for (const p of calculateChart(moment).pillars) {
        expect(stemChars.has(p.stem.hanzi)).toBe(true)
        expect(branchChars.has(p.branch.hanzi)).toBe(true)
      }
    }
  })

  it('is a pure function — the same moment always gives the same chart', () => {
    for (const moment of samples) {
      expect(calculateChart(moment)).toEqual(calculateChart(moment))
    }
  })
})

// ═══ Five Element mappings ═════════════════════════════════════════════════

describe('five element mappings', () => {
  const VALID: readonly ElementId[] = ['wood', 'fire', 'earth', 'metal', 'water']

  it('gives each of the ten stems a valid element', () => {
    expect(STEMS).toHaveLength(10)
    for (const stem of STEMS) {
      expect(VALID).toContain(stem.element)
    }
  })

  it('gives each of the twelve branches a valid element', () => {
    expect(BRANCHES).toHaveLength(12)
    for (const branch of BRANCHES) {
      expect(VALID).toContain(branch.element)
    }
  })

  it('runs the stems through the five elements in generating order, yang then yin', () => {
    expect(STEMS.map((s) => s.element)).toEqual([
      'wood', 'wood', 'fire', 'fire', 'earth',
      'earth', 'metal', 'metal', 'water', 'water',
    ])
    expect(STEMS.map((s) => s.polarity)).toEqual([
      'yang', 'yin', 'yang', 'yin', 'yang', 'yin', 'yang', 'yin', 'yang', 'yin',
    ])
  })

  it('distributes the branch elements as four Earth and two of each other', () => {
    const counts = new Map<ElementId, number>()
    for (const b of BRANCHES) counts.set(b.element, (counts.get(b.element) ?? 0) + 1)
    expect(counts.get('earth')).toBe(4) // 丑 辰 未 戌
    expect(counts.get('wood')).toBe(2) // 寅 卯
    expect(counts.get('fire')).toBe(2) // 巳 午
    expect(counts.get('metal')).toBe(2) // 申 酉
    expect(counts.get('water')).toBe(2) // 子 亥
  })

  it('keeps each branch element consistent with its main hidden stem', () => {
    for (const branch of BRANCHES) {
      expect(STEMS[branch.hiddenMainStemIndex]?.element).toBe(branch.element)
    }
  })

  it('tallies exactly eight elements across the chart', () => {
    const tally = tallyElements(calculateChart(at(1990, 6, 15, 14, 30)))
    const total = VALID.reduce((sum, id) => sum + tally[id], 0)
    expect(total).toBe(8)
    // 庚(metal) 壬(water) 辛(metal) 乙(wood) / 午(fire) 午(fire) 亥(water) 未(earth)
    expect(tally).toEqual({ wood: 1, fire: 2, earth: 1, metal: 2, water: 2 })
  })
})

// ═══ The 60-cycle parity invariant ═════════════════════════════════════════

describe('sexagenary cycle', () => {
  it('pairs only like parities, which is what makes the cycle 60 and not 120', () => {
    for (let i = 0; i < 60; i += 1) {
      const stem = STEMS[mod(i, 10)]
      const branch = BRANCHES[mod(i, 12)]
      expect(stem?.polarity).toBe(branch?.positionalPolarity)
    }
  })

  it('never produces an impossible pair such as 甲丑', () => {
    const moments = [
      at(1949, 10, 1), at(1990, 6, 15), at(2000, 3, 1),
      at(2019, 1, 27), at(2026, 2, 15),
    ]
    for (const moment of moments) {
      for (const p of calculateChart(moment).pillars) {
        expect(p.stem.polarity).toBe(p.branch.positionalPolarity)
      }
    }
  })
})
