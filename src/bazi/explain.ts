/**
 * Explanatory text derived from a chart, and from the difference between two.
 *
 * This is where the *teaching* lives, and it is deliberately here rather than in
 * the rendering layer: "which pillar changed, and why" is the central claim of
 * the piece, so it has to be assertable in a test rather than eyeballed in a
 * browser.
 *
 * Pure. No DOM.
 *
 * ── The coupling that makes this worth explaining ────────────────────────────
 * The intuitive model — each part of the moment owns one pillar — is wrong, and
 * the interaction is what exposes it:
 *
 *   - the month *stem* is derived from the year stem (五虎遁), so a year change
 *     moves the month pillar too;
 *   - the hour *stem* is derived from the day stem (五鼠遁), so a day change moves
 *     the hour pillar even when the clock time is untouched.
 *
 * A pillar can therefore change for two quite different reasons: its own layer of
 * time moved, or the layer above it did. `describeChanges` distinguishes them.
 */

import type { BaziChart, Pillar, PillarId } from './types'

/** The four tuple positions, as literals so indexing stays checked. */
const POSITIONS = [0, 1, 2, 3] as const

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const

const pad2 = (value: number): string => String(value).padStart(2, '0')

/** The clock span of a double-hour, e.g. "13:00 – 15:00" for 未. */
export function doubleHourRange(startHour: number): string {
  return `${pad2(startHour)}:00 – ${pad2((startHour + 2) % 24)}:00`
}

/**
 * Which part of the birth moment each pillar is derived from.
 *
 * `value` is the layer of time itself; `note` says what governs its boundary —
 * the point being that the four layers do not all turn over at the same kind of
 * moment.
 */
export interface PillarSource {
  readonly value: string
  readonly note: string
}

export function pillarSources(
  chart: BaziChart,
): readonly [PillarSource, PillarSource, PillarSource, PillarSource] {
  const { moment, derivation } = chart
  const monthBranch = chart.pillars[1].branch
  const hourBranch = chart.pillars[3].branch

  const dayName = (day: number, month: number): string =>
    `${day} ${MONTH_NAMES[month - 1] ?? ''}`

  return [
    {
      value: `Solar year ${derivation.baziYear}`,
      note: derivation.beforeLiChun
        ? 'before 立春 — the previous solar year'
        : 'begins at 立春, not 1 January',
    },
    {
      value: `${monthBranch.hanzi} month · ${derivation.solarMonthIndex} of 12`,
      note: 'set by solar term, not the calendar month',
    },
    {
      value: derivation.rolledToNextDay
        ? `${dayName(moment.day, moment.month)} → next day`
        : dayName(moment.day, moment.month),
      note: derivation.rolledToNextDay
        ? 'after 23:00, so the Bazi day has turned'
        : `position ${derivation.daySexagenaryIndex + 1} of a 60-day cycle`,
    },
    {
      value: `${pad2(moment.hour)}:${pad2(moment.minute)}`,
      note: `${hourBranch.hanzi} hour · ${doubleHourRange(hourBranch.startHour)}`,
    },
  ]
}

/** One pillar that moved between two charts, with the reason it moved. */
export interface PillarChange {
  readonly id: PillarId
  readonly position: 0 | 1 | 2 | 3
  /** Why it moved — the explanatory payload. */
  readonly reason: string
  /** True when this pillar moved only because the layer above it did. */
  readonly inherited: boolean
  readonly to: string
}

const samePillar = (a: Pillar, b: Pillar): boolean =>
  a.stem.index === b.stem.index && a.branch.index === b.branch.index

/**
 * Compare two charts and say which pillars moved and why.
 *
 * Order follows year → month → day → hour, so the reasons read as a cascade when
 * more than one pillar moves at once.
 */
export function describeChanges(
  before: BaziChart,
  after: BaziChart,
): readonly PillarChange[] {
  const changes: PillarChange[] = []
  const b = before.derivation
  const a = after.derivation

  for (const position of POSITIONS) {
    const previous = before.pillars[position]
    const current = after.pillars[position]
    if (samePillar(previous, current)) continue

    let reason: string
    let inherited = false

    switch (position) {
      case 0:
        reason =
          b.beforeLiChun !== a.beforeLiChun
            ? 'crossed 立春 — the solar year turned, which the calendar year does not show'
            : 'a different solar year'
        break
      case 1:
        if (b.solarMonthIndex !== a.solarMonthIndex) {
          reason = `crossed a solar term into the ${current.branch.hanzi} month`
        } else {
          reason = 'the year stem moved, so the month stem followed it (五虎遁)'
          inherited = true
        }
        break
      case 2:
        if (b.rolledToNextDay !== a.rolledToNextDay) {
          reason = 'crossed 23:00 — the Bazi day begins with the 子 hour, not at midnight'
        } else {
          const days = Math.abs(a.dayJulianDayNumber - b.dayJulianDayNumber)
          reason = `moved ${days} day${days === 1 ? '' : 's'} along the 60-day cycle`
        }
        break
      default:
        if (previous.branch.index !== current.branch.index) {
          reason = `moved into the ${current.branch.hanzi} hour · ${doubleHourRange(current.branch.startHour)}`
        } else {
          reason = 'the day stem moved, so the hour stem followed it (五鼠遁)'
          inherited = true
        }
        break
    }

    changes.push({
      id: current.id,
      position,
      reason,
      inherited,
      to: `${current.stem.hanzi}${current.branch.hanzi}`,
    })
  }

  return changes
}

/** A sentence for the live region, so a change is announced rather than only shown. */
export function announceChanges(
  chart: BaziChart,
  changes: readonly PillarChange[],
): string {
  if (changes.length === 0) {
    const pairs = chart.pillars.map((p) => `${p.stem.hanzi}${p.branch.hanzi}`).join(' ')
    return `Unchanged: ${pairs}.`
  }
  return changes
    .map((change) => {
      const label = change.id.charAt(0).toUpperCase() + change.id.slice(1)
      return `${label} Pillar is now ${change.to} — ${change.reason}.`
    })
    .join(' ')
}
