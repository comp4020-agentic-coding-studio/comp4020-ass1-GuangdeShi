/**
 * The Bazi transformation: a birth moment → Four Pillars → Eight Characters.
 *
 * Pure functions only. No DOM, no side effects, no time-of-day dependence — the
 * same input always produces the same chart, which is what makes it testable.
 *
 * ═══ CONVENTIONS AND ASSUMPTIONS ═══════════════════════════════════════════
 *
 * Bazi has several genuine forks where schools disagree. Each is named here with
 * the choice this project makes, so nothing is silently faked.
 *
 * (A) TIMEZONE — assumed UTC+8 (China Standard Time).
 *     The input carries no birth place, but solar longitude needs an absolute
 *     instant. Chinese almanacs are computed for the Beijing meridian, so the
 *     entered wall-clock time is read as UTC+8. A birth outside that zone gets a
 *     chart offset by the timezone difference near month boundaries.
 *     Not implemented: true solar time (真太陽時), the longitude and
 *     equation-of-time correction traditional practice applies to the hour.
 *
 * (B) YEAR BOUNDARY — 立春 (Lìchūn), solar longitude 315°.
 *     Not 1 January, and not Chinese New Year. A birth in January or early
 *     February belongs to the *previous* Bazi year. This is the mainstream
 *     convention for Bazi (as distinct from the zodiac-animal year, which
 *     popular usage often starts at Chinese New Year instead).
 *
 * (C) MONTH BOUNDARY — the twelve 節 (jié) solar terms, every 30° of longitude.
 *     Not lunar months. Attested in 淵海子平 (Yuānhǎi Zǐpíng, Song dynasty).
 *
 * (D) DAY BOUNDARY — 23:00, the start of the 子 hour ("early 子" 早子時).
 *     Chosen for internal consistency: the Bazi day begins with the 子 hour, and
 *     the 子 hour begins at 23:00, so the day begins at 23:00. A birth at
 *     23:00-23:59 therefore takes the *following* date's day pillar, and its
 *     hour stem derives from that same advanced day stem.
 *     The competing "late 子" (晚子時) school holds the day pillar until midnight.
 *     Switching schools changes both the day and hour pillars for one hour in
 *     twenty-four — it is a real fork, not a rounding detail.
 *
 * (E) BRANCH YIN/YANG — not asserted. Two conventions conflict for 子, 巳, 午
 *     and 亥 (positional parity vs. the polarity of the branch's main hidden
 *     stem). See `src/data/sexagenary.ts`. Only the uncontested branch *element*
 *     is displayed; positional parity is used internally, where its job is to
 *     make the cycle 60 long.
 *
 * (F) PRECISION — solar terms are accurate to about ±15 minutes. See `solar.ts`.
 *
 * Verified anchors (independently sourced, asserted in calculate.test.ts):
 *   1949-10-01 → 甲子 day    (Chinese Wikipedia, 干支)
 *   2000-03-01 → 戊午 day    (sexagenary #55)
 *   2019-01-27 → 甲子 day    (JDN 2458511)
 *   1984, 2044 → 甲子 year   (cycle anchors, Wikipedia)
 *   2012       → 壬辰 year   (Wikipedia)
 *   2026       → 丙午 year, first month 庚寅
 */

import { branchAt, mod, stemAt } from '../data/sexagenary'
import {
  apparentSolarLongitude,
  julianDateFromUtcMs,
  julianDayNumber,
  liChunUtcMs,
  solarMonthIndexFromLongitude,
} from './solar'
import type {
  BaziChart,
  BirthMoment,
  ElementId,
  ElementTally,
  Pillar,
  PillarId,
} from './types'

/** Assumed timezone offset of the entered wall-clock time. See convention (A). */
export const ASSUMED_UTC_OFFSET_HOURS = 8

/** The hour at which the Bazi day rolls over. See convention (D). */
export const DAY_ROLLOVER_HOUR = 23

/**
 * Calibration for the day pillar: `(JDN + 49) mod 60` gives the 0-based position
 * in the sexagenary cycle, where 0 = 甲子.
 *
 * Checked three ways — 1949-10-01 (JDN 2433191), 2019-01-27 (JDN 2458511) and
 * 2000-03-01 (JDN 2451605, 戊午, #55) all agree.
 */
const DAY_CYCLE_OFFSET = 49

const PILLAR_LABELS: Readonly<Record<PillarId, { hanzi: string; english: string }>> = {
  year: { hanzi: '年柱', english: 'Year Pillar' },
  month: { hanzi: '月柱', english: 'Month Pillar' },
  day: { hanzi: '日柱', english: 'Day Pillar' },
  hour: { hanzi: '时柱', english: 'Hour Pillar' },
}

function pillar(id: PillarId, stemIndex: number, branchIndex: number): Pillar {
  const label = PILLAR_LABELS[id]
  return {
    id,
    labelHanzi: label.hanzi,
    labelEnglish: label.english,
    stem: stemAt(stemIndex),
    branch: branchAt(branchIndex),
  }
}

/** Add whole days to a calendar date, letting `Date` normalise month/year rollover. */
function addDays(
  year: number,
  month: number,
  day: number,
  days: number,
): { year: number; month: number; day: number } {
  const shifted = new Date(Date.UTC(year, month - 1, day + days))
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
  }
}

/**
 * The Earthly Branch of the hour.
 *
 * Twelve double-hours, with 子 spanning 23:00-00:59 — which is why the hour is
 * shifted by one before halving.
 */
export function hourBranchIndex(hour: number): number {
  return Math.floor(mod(hour + 1, 24) / 2)
}

/**
 * Transform a birth moment into a Four Pillars chart.
 *
 * The four steps, in order: locate the moment against the solar year, read off
 * the year and month pillars, count the day out of the 60-cycle, then place the
 * hour within that day.
 */
export function calculateChart(moment: BirthMoment): BaziChart {
  const { year, month, day, hour, minute } = moment

  // (A) Read the wall-clock time as UTC+8 to get an absolute instant.
  const utcMs = Date.UTC(year, month - 1, day, hour - ASSUMED_UTC_OFFSET_HOURS, minute)

  // ── Step 1: where is this moment in the solar year? ───────────────────────
  const solarLongitude = apparentSolarLongitude(julianDateFromUtcMs(utcMs))
  const solarMonthIndex = solarMonthIndexFromLongitude(solarLongitude)

  // (B) The Bazi year turns at 立春, so a January birth belongs to the year before.
  const beforeLiChun = utcMs < liChunUtcMs(year)
  const baziYear = beforeLiChun ? year - 1 : year

  // ── Step 2: year pillar ───────────────────────────────────────────────────
  // 1984 is 甲子, and 1984 − 4 ≡ 0 (mod 10) and (mod 12).
  const yearStemIndex = mod(baziYear - 4, 10)
  const yearBranchIndex = mod(baziYear - 4, 12)

  // ── Step 3: month pillar ──────────────────────────────────────────────────
  // Branch: month 1 is 寅, which sits at branch index 2.
  const monthBranchIndex = mod(solarMonthIndex + 1, 12)
  // Stem: 五虎遁 ("Five Tigers"). The 寅 month's stem is (2 × year stem + 2),
  // then one step per month. 甲/己 years open at 丙寅, 乙/庚 at 戊寅, and so on.
  const monthStemIndex = mod(2 * yearStemIndex + solarMonthIndex + 1, 10)

  // ── Step 4: day pillar ────────────────────────────────────────────────────
  // (D) A birth from 23:00 belongs to the next Bazi day.
  const rolledToNextDay = hour >= DAY_ROLLOVER_HOUR
  const dayDate = rolledToNextDay ? addDays(year, month, day, 1) : { year, month, day }
  const dayJulianDayNumber = julianDayNumber(dayDate.year, dayDate.month, dayDate.day)
  const daySexagenaryIndex = mod(dayJulianDayNumber + DAY_CYCLE_OFFSET, 60)
  const dayStemIndex = mod(daySexagenaryIndex, 10)
  const dayBranchIndex = mod(daySexagenaryIndex, 12)

  // ── Step 5: hour pillar ───────────────────────────────────────────────────
  const hourIndex = hourBranchIndex(hour)
  // Stem: 五鼠遁 ("Five Rats"). The 子 hour's stem is (2 × day stem), then one
  // step per double-hour. 甲/己 days open at 甲子, 乙/庚 days at 丙子, and so on.
  const hourStemIndex = mod(2 * dayStemIndex + hourIndex, 10)

  return {
    moment,
    pillars: [
      pillar('year', yearStemIndex, yearBranchIndex),
      pillar('month', monthStemIndex, monthBranchIndex),
      pillar('day', dayStemIndex, dayBranchIndex),
      pillar('hour', hourStemIndex, hourIndex),
    ],
    derivation: {
      solarLongitude,
      baziYear,
      beforeLiChun,
      solarMonthIndex,
      dayJulianDayNumber,
      rolledToNextDay,
      daySexagenaryIndex,
    },
  }
}

/** The eight characters, reading stems then branches. */
export function eightCharacters(chart: BaziChart): string[] {
  return [
    ...chart.pillars.map((p) => p.stem.hanzi),
    ...chart.pillars.map((p) => p.branch.hanzi),
  ]
}

/** How many of the eight characters carry each of the Five Elements. */
export function tallyElements(chart: BaziChart): ElementTally {
  const tally: Record<ElementId, number> = {
    wood: 0, fire: 0, earth: 0, metal: 0, water: 0,
  }
  for (const p of chart.pillars) {
    tally[p.stem.element] += 1
    tally[p.branch.element] += 1
  }
  return tally
}
