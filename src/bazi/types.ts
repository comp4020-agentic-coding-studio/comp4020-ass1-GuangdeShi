/**
 * Types for the Bazi transformation.
 *
 * These describe the *structure* of a chart, not its interpretation. Nothing in
 * here predicts anything.
 */

/** The Five Elements (五行 wǔxíng). */
export type ElementId = 'wood' | 'fire' | 'earth' | 'metal' | 'water'

/** Yin or yang (陰陽). */
export type Polarity = 'yang' | 'yin'

export interface Element {
  readonly id: ElementId
  readonly hanzi: string
  readonly pinyin: string
  readonly english: string
}

/** One of the ten Heavenly Stems (天干 tiāngān). */
export interface Stem {
  /** 0-based position in the cycle: 0 = 甲 … 9 = 癸. */
  readonly index: number
  readonly hanzi: string
  readonly pinyin: string
  readonly element: ElementId
  /** Uncontested: stems alternate yang, yin, yang, yin … from 甲. */
  readonly polarity: Polarity
}

/** One of the twelve Earthly Branches (地支 dìzhī). */
export interface Branch {
  /** 0-based position in the cycle: 0 = 子 … 11 = 亥. */
  readonly index: number
  readonly hanzi: string
  readonly pinyin: string
  /** The branch's Five Element attribution. Uncontested across sources. */
  readonly element: ElementId
  /**
   * Parity by *position* in the cycle: even index = yang, odd index = yin.
   *
   * This is the parity that makes the sexagenary cycle 60 long rather than 120,
   * because only like-parity stems and branches pair. It is deliberately NOT
   * displayed as "the branch's yin/yang", because a second, conflicting
   * convention exists — see `hiddenMainStemIndex` and docs/CONVENTIONS below.
   */
  readonly positionalPolarity: Polarity
  /**
   * Index of the branch's main hidden stem (主氣 zhǔqì, the strongest of its
   * 藏干). The substantive yin/yang convention derives the branch's polarity
   * from this stem, which is why 子 is often called *yin* water despite sitting
   * at an even (yang) position. Stored so the disagreement stays visible in the
   * data rather than being silently resolved.
   */
  readonly hiddenMainStemIndex: number
  readonly zodiacHanzi: string
  readonly zodiacEnglish: string
  /** Inclusive start hour of this branch's double-hour, in local clock time. */
  readonly startHour: number
}

/** Which of the four pillars a stem-branch pair occupies. */
export type PillarId = 'year' | 'month' | 'day' | 'hour'

/** A pillar (柱): one Heavenly Stem written above one Earthly Branch. */
export interface Pillar {
  readonly id: PillarId
  readonly labelHanzi: string
  readonly labelEnglish: string
  readonly stem: Stem
  readonly branch: Branch
}

/** The user's input: a birth moment as wall-clock date and time. */
export interface BirthMoment {
  /** Gregorian year, e.g. 1990. */
  readonly year: number
  /** 1-12. */
  readonly month: number
  /** 1-31. */
  readonly day: number
  /** 0-23. */
  readonly hour: number
  /** 0-59. */
  readonly minute: number
}

/**
 * Intermediate values the transformation passes through. Exposed so the UI can
 * show *why* a chart came out the way it did — the explanatory point of the
 * project — rather than only the result.
 */
export interface ChartDerivation {
  /** Apparent geocentric solar longitude at the birth instant, degrees 0-360. */
  readonly solarLongitude: number
  /**
   * The Bazi year, which begins at 立春 (Lìchūn) — not 1 January, and not
   * Chinese New Year. Differs from the Gregorian year for births in January and
   * early February.
   */
  readonly baziYear: number
  /** True when the birth fell before that Gregorian year's 立春. */
  readonly beforeLiChun: boolean
  /** 1 = 寅 month … 12 = 丑 month, set by the solar term the birth falls in. */
  readonly solarMonthIndex: number
  /** Julian Day Number used for the day pillar, after any 23:00 roll-forward. */
  readonly dayJulianDayNumber: number
  /** True when a birth at or after 23:00 was counted as the next Bazi day. */
  readonly rolledToNextDay: boolean
  /** 0-based position of the day pillar in the 60-cycle. */
  readonly daySexagenaryIndex: number
}

/** A complete Four Pillars chart. Exactly four pillars, exactly eight characters. */
export interface BaziChart {
  readonly moment: BirthMoment
  /** Fixed-length tuple: year, month, day, hour. Enforces "exactly four". */
  readonly pillars: readonly [Pillar, Pillar, Pillar, Pillar]
  readonly derivation: ChartDerivation
}

/** A tally of how many of the eight characters carry each element. */
export type ElementTally = Readonly<Record<ElementId, number>>
