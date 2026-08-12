/**
 * Reference data for the sexagenary cycle (六十干支): the ten Heavenly Stems,
 * the twelve Earthly Branches, and their Five Element attributions.
 *
 * This is a lookup table, not a calculation. Every value here was checked
 * against published sources rather than recalled; see PROCESS.md.
 *
 * Sources consulted:
 *   - Wikipedia, "Sexagenary cycle" — stem elements and polarities, branch
 *     zodiac animals and double-hours.
 *   - Wikipedia, "Four Pillars of Destiny" and "Solar term".
 *   - chinesecalendaronline.com and fatemaster.ai — branch element
 *     attributions and hidden stems (藏干).
 */

import type { Branch, Element, ElementId, Stem } from '../bazi/types'

export const ELEMENTS: readonly Element[] = [
  { id: 'wood', hanzi: '木', pinyin: 'mù', english: 'Wood' },
  { id: 'fire', hanzi: '火', pinyin: 'huǒ', english: 'Fire' },
  { id: 'earth', hanzi: '土', pinyin: 'tǔ', english: 'Earth' },
  { id: 'metal', hanzi: '金', pinyin: 'jīn', english: 'Metal' },
  { id: 'water', hanzi: '水', pinyin: 'shuǐ', english: 'Water' },
]

const ELEMENTS_BY_ID: ReadonlyMap<ElementId, Element> = new Map(
  ELEMENTS.map((element) => [element.id, element]),
)

export function element(id: ElementId): Element {
  const found = ELEMENTS_BY_ID.get(id)
  if (!found) throw new Error(`Unknown element: ${id}`)
  return found
}

/**
 * The ten Heavenly Stems (天干).
 *
 * Element and polarity are uncontested: the stems run through the five elements
 * in the generating order Wood → Fire → Earth → Metal → Water, each element
 * appearing twice, yang first then yin.
 */
export const STEMS: readonly Stem[] = [
  { index: 0, hanzi: '甲', pinyin: 'jiǎ', element: 'wood', polarity: 'yang' },
  { index: 1, hanzi: '乙', pinyin: 'yǐ', element: 'wood', polarity: 'yin' },
  { index: 2, hanzi: '丙', pinyin: 'bǐng', element: 'fire', polarity: 'yang' },
  { index: 3, hanzi: '丁', pinyin: 'dīng', element: 'fire', polarity: 'yin' },
  { index: 4, hanzi: '戊', pinyin: 'wù', element: 'earth', polarity: 'yang' },
  { index: 5, hanzi: '己', pinyin: 'jǐ', element: 'earth', polarity: 'yin' },
  { index: 6, hanzi: '庚', pinyin: 'gēng', element: 'metal', polarity: 'yang' },
  { index: 7, hanzi: '辛', pinyin: 'xīn', element: 'metal', polarity: 'yin' },
  { index: 8, hanzi: '壬', pinyin: 'rén', element: 'water', polarity: 'yang' },
  { index: 9, hanzi: '癸', pinyin: 'guǐ', element: 'water', polarity: 'yin' },
]

/**
 * The twelve Earthly Branches (地支).
 *
 * `element` is uncontested. `positionalPolarity` is the even/odd parity that
 * governs stem-branch pairing. `hiddenMainStemIndex` records the branch's main
 * hidden stem, from which the *other* (substantive) polarity convention is
 * derived — the two conventions disagree for 子, 巳, 午 and 亥, so this module
 * stores both inputs and asserts neither as "the" polarity.
 *
 * Double-hours start at 23:00 for 子 and run in two-hour steps.
 */
export const BRANCHES: readonly Branch[] = [
  {
    index: 0, hanzi: '子', pinyin: 'zǐ', element: 'water',
    positionalPolarity: 'yang', hiddenMainStemIndex: 9, // 癸 yin water
    zodiacHanzi: '鼠', zodiacEnglish: 'Rat', startHour: 23,
  },
  {
    index: 1, hanzi: '丑', pinyin: 'chǒu', element: 'earth',
    positionalPolarity: 'yin', hiddenMainStemIndex: 5, // 己 yin earth
    zodiacHanzi: '牛', zodiacEnglish: 'Ox', startHour: 1,
  },
  {
    index: 2, hanzi: '寅', pinyin: 'yín', element: 'wood',
    positionalPolarity: 'yang', hiddenMainStemIndex: 0, // 甲 yang wood
    zodiacHanzi: '虎', zodiacEnglish: 'Tiger', startHour: 3,
  },
  {
    index: 3, hanzi: '卯', pinyin: 'mǎo', element: 'wood',
    positionalPolarity: 'yin', hiddenMainStemIndex: 1, // 乙 yin wood
    zodiacHanzi: '兔', zodiacEnglish: 'Rabbit', startHour: 5,
  },
  {
    index: 4, hanzi: '辰', pinyin: 'chén', element: 'earth',
    positionalPolarity: 'yang', hiddenMainStemIndex: 4, // 戊 yang earth
    zodiacHanzi: '龙', zodiacEnglish: 'Dragon', startHour: 7,
  },
  {
    index: 5, hanzi: '巳', pinyin: 'sì', element: 'fire',
    positionalPolarity: 'yin', hiddenMainStemIndex: 2, // 丙 yang fire
    zodiacHanzi: '蛇', zodiacEnglish: 'Snake', startHour: 9,
  },
  {
    index: 6, hanzi: '午', pinyin: 'wǔ', element: 'fire',
    positionalPolarity: 'yang', hiddenMainStemIndex: 3, // 丁 yin fire
    zodiacHanzi: '马', zodiacEnglish: 'Horse', startHour: 11,
  },
  {
    index: 7, hanzi: '未', pinyin: 'wèi', element: 'earth',
    positionalPolarity: 'yin', hiddenMainStemIndex: 5, // 己 yin earth
    zodiacHanzi: '羊', zodiacEnglish: 'Goat', startHour: 13,
  },
  {
    index: 8, hanzi: '申', pinyin: 'shēn', element: 'metal',
    positionalPolarity: 'yang', hiddenMainStemIndex: 6, // 庚 yang metal
    zodiacHanzi: '猴', zodiacEnglish: 'Monkey', startHour: 15,
  },
  {
    index: 9, hanzi: '酉', pinyin: 'yǒu', element: 'metal',
    positionalPolarity: 'yin', hiddenMainStemIndex: 7, // 辛 yin metal
    zodiacHanzi: '鸡', zodiacEnglish: 'Rooster', startHour: 17,
  },
  {
    index: 10, hanzi: '戌', pinyin: 'xū', element: 'earth',
    positionalPolarity: 'yang', hiddenMainStemIndex: 4, // 戊 yang earth
    zodiacHanzi: '狗', zodiacEnglish: 'Dog', startHour: 19,
  },
  {
    index: 11, hanzi: '亥', pinyin: 'hài', element: 'water',
    positionalPolarity: 'yin', hiddenMainStemIndex: 8, // 壬 yang water
    zodiacHanzi: '猪', zodiacEnglish: 'Pig', startHour: 21,
  },
]

/** Positive modulo — JavaScript's `%` keeps the sign of the dividend. */
export function mod(value: number, modulus: number): number {
  return ((value % modulus) + modulus) % modulus
}

/** Look up a stem by cycle position, wrapping and accepting negatives. */
export function stemAt(index: number): Stem {
  const found = STEMS[mod(index, STEMS.length)]
  if (!found) throw new Error(`No stem at index ${index}`)
  return found
}

/** Look up a branch by cycle position, wrapping and accepting negatives. */
export function branchAt(index: number): Branch {
  const found = BRANCHES[mod(index, BRANCHES.length)]
  if (!found) throw new Error(`No branch at index ${index}`)
  return found
}
