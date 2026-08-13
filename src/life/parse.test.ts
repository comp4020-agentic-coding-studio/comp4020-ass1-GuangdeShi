import { describe, expect, it } from 'vitest'
import { parseAmount, parsePeriod } from './parse'
import { computeLifeRate } from './income'

describe('reading what a person typed', () => {
  it('accepts money written the way people write it', () => {
    expect(parseAmount('4400')).toBe(4400)
    expect(parseAmount('$4,400')).toBe(4400)
    expect(parseAmount('4 400.50')).toBe(4400.5)
  })

  it('refuses rather than guesses', () => {
    for (const text of ['', '   ', 'a lot', '40 hours', '--3']) {
      expect(parseAmount(text), text).toBeNaN()
    }
  })

  // The two halves have to agree: whatever parsing calls unusable, the model
  // must decline, so an empty field can never reach the page as a rate.
  it('hands the model something it already knows how to refuse', () => {
    const rate = computeLifeRate({
      period: 'monthly',
      pay: parseAmount(''),
      weeklyWorkHours: 40,
      weeklyCommuteHours: 10,
    })
    expect(rate).toBeNull()
  })

  it('falls back to a real period rather than trusting the string', () => {
    expect(parsePeriod('yearly')).toBe('yearly')
    expect(parsePeriod('fortnightly')).toBe('monthly')
    expect(parsePeriod('')).toBe('monthly')
  })
})
