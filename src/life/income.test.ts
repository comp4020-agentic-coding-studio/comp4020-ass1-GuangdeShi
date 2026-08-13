import { describe, expect, it } from 'vitest'
import { WEEKS_PER_MONTH, WEEKS_PER_YEAR, computeLifeRate } from './income'
import type { IncomeInput } from './types'

const input = (over: Partial<IncomeInput> = {}): IncomeInput => ({
  period: 'monthly',
  pay: 4400,
  weeklyWorkHours: 40,
  weeklyCommuteHours: 10,
  ...over,
})

describe('the worked example from the brief', () => {
  // $4,400 a month, 40 h work, 10 h commute, at 4 weeks to the month:
  // paid 160 h → $27.50/h · committed 200 h → $22.00/h.
  const rate = computeLifeRate(input())

  it('pays 160 hours and commits 200', () => {
    expect(rate?.paidHours).toBe(160)
    expect(rate?.committedHours).toBe(200)
  })

  it('gives $27.50 paid and $22.00 life-adjusted', () => {
    expect(rate?.paidHourlyRate).toBeCloseTo(27.5, 10)
    expect(rate?.lifeAdjustedHourlyRate).toBeCloseTo(22, 10)
  })

  it('reports a fifth of the committed week as unpaid', () => {
    expect(rate?.unpaidShare).toBeCloseTo(0.2, 10)
  })
})

describe('each pay period', () => {
  it('treats an hourly wage as the paid rate itself', () => {
    const rate = computeLifeRate(input({ period: 'hourly', pay: 27.5 }))
    expect(rate?.paidHourlyRate).toBeCloseTo(27.5, 10)
    // 40 h paid, 50 h committed — the same 4:5 ratio as the monthly example.
    expect(rate?.lifeAdjustedHourlyRate).toBeCloseTo(22, 10)
    expect(rate?.periodPay).toBeCloseTo(1100, 10)
  })

  it('divides weekly pay by the week', () => {
    const rate = computeLifeRate(input({ period: 'weekly', pay: 1100 }))
    expect(rate?.paidHours).toBe(40)
    expect(rate?.committedHours).toBe(50)
    expect(rate?.paidHourlyRate).toBeCloseTo(27.5, 10)
    expect(rate?.lifeAdjustedHourlyRate).toBeCloseTo(22, 10)
  })

  it('uses four weeks to the month', () => {
    const rate = computeLifeRate(input({ period: 'monthly' }))
    expect(rate?.paidHours).toBe(40 * WEEKS_PER_MONTH)
    expect(rate?.periodLabel).toBe('month')
  })

  it('uses fifty-two weeks to the year', () => {
    const rate = computeLifeRate(input({ period: 'yearly', pay: 57200 }))
    expect(rate?.paidHours).toBe(40 * WEEKS_PER_YEAR)
    expect(rate?.committedHours).toBe(50 * WEEKS_PER_YEAR)
    expect(rate?.paidHourlyRate).toBeCloseTo(27.5, 10)
    expect(rate?.periodLabel).toBe('year')
  })

  // 4 weeks × 12 months = 48 weeks, not 52. The model's two simplifications
  // disagree, and the page says so rather than hiding it. Asserted here so the
  // disagreement can never be "fixed" silently by changing one constant.
  it('does not reconcile the month with the year, and that is on purpose', () => {
    const monthly = computeLifeRate(input({ period: 'monthly', pay: 4400 }))
    const yearly = computeLifeRate(input({ period: 'yearly', pay: 4400 * 12 }))
    expect(monthly?.paidHourlyRate).toBeCloseTo(27.5, 10)
    expect(yearly?.paidHourlyRate).toBeCloseTo(25.38, 2)
  })
})

describe('the commute is the difference', () => {
  it('collapses the two rates into one when there is no commute', () => {
    const rate = computeLifeRate(input({ weeklyCommuteHours: 0 }))
    expect(rate?.paidHourlyRate).toBeCloseTo(rate?.lifeAdjustedHourlyRate ?? 0, 10)
    expect(rate?.unpaidShare).toBe(0)
  })

  it('never values life above the paid rate', () => {
    for (const commute of [0, 1, 5, 10, 40]) {
      const rate = computeLifeRate(input({ weeklyCommuteHours: commute }))
      expect(rate).not.toBeNull()
      expect(rate!.lifeAdjustedHourlyRate).toBeLessThanOrEqual(rate!.paidHourlyRate)
    }
  })
})

describe('inputs that cannot produce an honest answer', () => {
  it('refuses zero or missing pay', () => {
    expect(computeLifeRate(input({ pay: 0 }))).toBeNull()
    expect(computeLifeRate(input({ pay: Number.NaN }))).toBeNull()
    expect(computeLifeRate(input({ pay: -100 }))).toBeNull()
  })

  it('refuses a week with no work in it, rather than dividing by zero', () => {
    expect(computeLifeRate(input({ weeklyWorkHours: 0 }))).toBeNull()
  })

  it('refuses a negative commute', () => {
    expect(computeLifeRate(input({ weeklyCommuteHours: -5 }))).toBeNull()
  })

  it('refuses a week longer than a week', () => {
    expect(computeLifeRate(input({ weeklyWorkHours: 120, weeklyCommuteHours: 60 }))).toBeNull()
  })
})
