import { describe, expect, it } from 'vitest'
import { formatMoney, formatWorkTime, hoursToEarn, rhythmFor } from './duration'

// The visitor from the brief: 40 h a week, $22.00 an hour of life.
const rhythm = rhythmFor(40)
const RATE = 22

const priceAsTime = (aud: number): string => formatWorkTime(hoursToEarn(aud, RATE), rhythm).text

describe('the ladder of units', () => {
  it('says minutes below an hour', () => {
    expect(priceAsTime(6)).toBe('16 minutes')
    expect(priceAsTime(0.4)).toBe('1 minute')
  })

  it('says hours below a working day', () => {
    expect(priceAsTime(110)).toBe('5 hours')
    expect(formatWorkTime(1, rhythm).text).toBe('1 hour')
  })

  it('says working days below a working week', () => {
    expect(priceAsTime(440)).toBe('2.5 working days')
  })

  it('says working weeks below a working month', () => {
    // The laptop: $1,800 ÷ $22 = 81.8 h, which is two of this visitor's weeks.
    expect(priceAsTime(1800)).toBe('2 working weeks')
  })

  it('says working months below a working year', () => {
    expect(priceAsTime(14080)).toBe('4 working months')
  })

  it('says working years above that', () => {
    // The house: $1,111,100 ÷ $22 ≈ 50,505 h.
    expect(priceAsTime(1111100)).toBe('24 working years')
  })

  // A 4-week month and a 52-week year do not tile: 52 ÷ 4 = 13. Running months
  // to the year boundary printed a car as "13 working months" — a duration
  // longer than the year it sits inside, which reads as an error even though
  // the arithmetic is right. The month tier stops at twelve.
  it('never counts past a twelfth month', () => {
    expect(priceAsTime(45000)).toBe('1 working year')
    expect(formatWorkTime(rhythm.hoursPerMonth * 11.9, rhythm).unitKey).toBe('working months')
    expect(formatWorkTime(rhythm.hoursPerMonth * 12, rhythm).unitKey).toBe('working years')
  })

  // The unit ladder used to stop at years, and the top of the product ladder
  // broke it: a private jet printed "1,420 working years". Past a working life
  // the honest unit is a count of lives, not a longer number of years.
  it('says working lifetimes past a whole working life', () => {
    expect(priceAsTime(65000000)).toBe('32 working lifetimes')
    expect(formatWorkTime(rhythm.hoursPerLifetime, rhythm).text).toBe('1 working lifetime')
    expect(formatWorkTime(rhythm.hoursPerLifetime - 1, rhythm).unitKey).toBe('working years')
  })
})

describe('the units belong to the visitor, not the calendar', () => {
  it('makes a part-timer’s working week shorter, so the same price climbs a unit', () => {
    const partTime = rhythmFor(20)
    const hours = hoursToEarn(1800, RATE)
    // The same 81.8 hours: two weeks of a full-time week, a whole month of a
    // half-time one. Identical arithmetic, and a different thing to give up.
    expect(formatWorkTime(hours, rhythm).text).toBe('2 working weeks')
    expect(formatWorkTime(hours, partTime).text).toBe('1 working month')
  })

  it('scales the working day with the week', () => {
    expect(rhythmFor(40).hoursPerDay).toBe(8)
    expect(rhythmFor(20).hoursPerDay).toBe(4)
    expect(rhythmFor(40).hoursPerYear).toBe(2080)
  })
})

describe('the rule the formatter exists to keep', () => {
  // "41802 hours" is the exact failure the brief names. Sweep the whole ladder
  // and assert no price ever prints a number too large to picture.
  it('never prints a raw value larger than 100', () => {
    for (const price of [1, 6, 25, 129, 549, 1800, 7500, 45000, 1111100, 65000000]) {
      const formatted = formatWorkTime(hoursToEarn(price, RATE), rhythm)
      expect(formatted.value, `${price} → ${formatted.text}`).toBeLessThan(100)
      expect(formatted.text).not.toMatch(/\d{4}/)
    }
  })

  it('never hands back a bare unit with no number', () => {
    for (const hours of [0.001, 0.9, 1, 7.9, 8, 39, 40, 159, 160, 2079, 2080, 1e6]) {
      const { text, value } = formatWorkTime(hours, rhythm)
      expect(value).toBeGreaterThan(0)
      expect(text).toMatch(/^[\d,.]+ \w/)
    }
  })

  it('is singular at exactly one', () => {
    expect(formatWorkTime(8, rhythm).text).toBe('1 working day')
    expect(formatWorkTime(40, rhythm).text).toBe('1 working week')
    expect(formatWorkTime(160, rhythm).text).toBe('1 working month')
    expect(formatWorkTime(2080, rhythm).text).toBe('1 working year')
  })

  it('hands over at each boundary rather than overlapping', () => {
    expect(formatWorkTime(7.99, rhythm).unitKey).toBe('hours')
    expect(formatWorkTime(8, rhythm).unitKey).toBe('working days')
    expect(formatWorkTime(39.9, rhythm).unitKey).toBe('working days')
    expect(formatWorkTime(40, rhythm).unitKey).toBe('working weeks')
    expect(formatWorkTime(159, rhythm).unitKey).toBe('working weeks')
    expect(formatWorkTime(160, rhythm).unitKey).toBe('working months')
  })

  it('degrades to a dash rather than NaN when there is no rate yet', () => {
    expect(formatWorkTime(hoursToEarn(6, 0), rhythm).text).toBe('—')
    expect(formatWorkTime(Number.NaN, rhythm).text).toBe('—')
  })
})

describe('money keeps the shape of a price tag', () => {
  it('writes small change and large sums the way a label does', () => {
    expect(formatMoney(6)).toBe('$6')
    expect(formatMoney(1.2)).toBe('$1.20')
    expect(formatMoney(1800)).toBe('$1,800')
    expect(formatMoney(1111100)).toBe('$1,111,100')
  })
})
