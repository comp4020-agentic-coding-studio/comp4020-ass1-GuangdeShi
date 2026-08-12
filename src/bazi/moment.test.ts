/**
 * Tests for the input layer.
 *
 * The core interaction is "change the date or time, watch the characters change",
 * so the parser is on the critical path: if it silently mis-reads an input, the
 * chart is wrong in a way no calculation test would catch.
 */

import { describe, expect, it } from 'vitest'
import { DEFAULT_MOMENT, parseMoment, toDateValue, toTimeValue } from './moment'
import { calculateChart, eightCharacters } from './calculate'

describe('parseMoment', () => {
  it('reads the native input formats', () => {
    expect(parseMoment('1990-06-15', '14:30')).toEqual({
      year: 1990, month: 6, day: 15, hour: 14, minute: 30,
    })
  })

  it('accepts a time with seconds, which some browsers supply', () => {
    expect(parseMoment('2000-01-01', '00:00:00')).toEqual({
      year: 2000, month: 1, day: 1, hour: 0, minute: 0,
    })
  })

  it('keeps midnight and 23:59 rather than rounding them away', () => {
    expect(parseMoment('2024-02-29', '00:00')?.hour).toBe(0)
    expect(parseMoment('2024-02-29', '23:59')?.minute).toBe(59)
  })

  it('accepts 29 February in a leap year', () => {
    expect(parseMoment('2024-02-29', '12:00')?.day).toBe(29)
  })

  it.each([
    ['empty date', '', '14:30'],
    ['empty time', '1990-06-15', ''],
    ['partial year, as typed', '19-06-15', '14:30'],
    ['locale text, not a machine value', '15/06/1990', '14:30'],
    ['month 13', '1990-13-01', '14:30'],
    ['day 0', '1990-06-00', '14:30'],
    ['31 February', '1990-02-31', '14:30'],
    ['29 February in a common year', '2023-02-29', '14:30'],
    ['hour 24', '1990-06-15', '24:00'],
    ['minute 60', '1990-06-15', '14:60'],
  ])('returns null for %s', (_label, dateValue, timeValue) => {
    expect(parseMoment(dateValue, timeValue)).toBeNull()
  })
})

describe('formatting back to input values', () => {
  it('round-trips a moment through both inputs', () => {
    const dateValue = toDateValue(DEFAULT_MOMENT)
    const timeValue = toTimeValue(DEFAULT_MOMENT)
    expect(dateValue).toBe('1990-06-15')
    expect(timeValue).toBe('14:30')
    expect(parseMoment(dateValue, timeValue)).toEqual(DEFAULT_MOMENT)
  })

  it('zero-pads single-digit months, days, hours and minutes', () => {
    const moment = { year: 2001, month: 2, day: 3, hour: 4, minute: 5 }
    expect(toDateValue(moment)).toBe('2001-02-03')
    expect(toTimeValue(moment)).toBe('04:05')
  })
})

describe('the interaction itself', () => {
  const chartFor = (dateValue: string, timeValue: string): string => {
    const moment = parseMoment(dateValue, timeValue)
    if (!moment) throw new Error(`unparseable: ${dateValue} ${timeValue}`)
    return eightCharacters(calculateChart(moment)).join('')
  }

  it('the default moment produces the verified chart', () => {
    // 1990-06-15 14:30 → 庚午 壬午 辛亥 乙未. The day pillar 辛亥 was confirmed
    // against three independently sourced anchors; see calculate.test.ts.
    expect(chartFor('1990-06-15', '14:30')).toBe('庚壬辛乙午午亥未')
  })

  it('changing only the time changes only the hour pillar', () => {
    const before = chartFor('1990-06-15', '14:30')
    const after = chartFor('1990-06-15', '08:30')
    expect(after).not.toBe(before)
    // First three stems and first three branches hold; the fourth of each moves.
    expect(after.slice(0, 3)).toBe(before.slice(0, 3))
    expect(after.slice(4, 7)).toBe(before.slice(4, 7))
    expect(after[3]).not.toBe(before[3])
    expect(after[7]).not.toBe(before[7])
  })

  it('changing only the date changes the chart', () => {
    expect(chartFor('1990-06-16', '14:30')).not.toBe(chartFor('1990-06-15', '14:30'))
  })

  it('a one-minute change across 23:00 moves the day pillar', () => {
    expect(chartFor('1990-06-15', '23:00')).not.toBe(chartFor('1990-06-15', '22:59'))
  })
})
