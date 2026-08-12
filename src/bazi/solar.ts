/**
 * Solar position, solar terms, and Julian day arithmetic.
 *
 * The Bazi year and month boundaries are astronomical, not calendrical: they are
 * defined by the Sun's apparent geocentric ecliptic longitude, so they cannot be
 * approximated with fixed calendar dates without producing wrong charts for
 * births near a boundary. This module computes them.
 *
 * ── Algorithm ────────────────────────────────────────────────────────────────
 * Apparent solar longitude follows the low-precision method in Jean Meeus,
 * *Astronomical Algorithms* (2nd ed.), ch. 25. Stated accuracy is about 0.01°,
 * which is roughly 15 minutes of time, since the Sun moves ~0.9856°/day.
 *
 * ── Known limitations (deliberate, documented, Phase 1) ──────────────────────
 *  1. ±~15 minutes on solar-term instants. A birth within a quarter hour of a
 *     solar term may land in the adjacent month. Higher precision needs a fuller
 *     ephemeris (VSOP87); that is a bigger dependency than this explainer needs.
 *  2. ΔT (the TT − UT difference) is ignored. It is under ~70 s for 1900-2100,
 *     which moves the Sun about 0.0008° — two orders of magnitude below the
 *     algorithm's own error, so correcting it would be false precision.
 *  3. Nutation is included only via the leading Ω term, per Meeus's low-accuracy
 *     variant.
 */

/** Unix epoch (1970-01-01T00:00:00Z) as a Julian Date. */
const UNIX_EPOCH_JD = 2440587.5

/** J2000.0 epoch. */
const J2000_JD = 2451545.0

const MS_PER_DAY = 86_400_000

const DEG_TO_RAD = Math.PI / 180

/** Apparent solar longitude, in degrees, at 立春 (Lìchūn) — the Bazi year boundary. */
export const LI_CHUN_LONGITUDE = 315

/** Convert a UTC instant in milliseconds to a Julian Date (fractional). */
export function julianDateFromUtcMs(utcMs: number): number {
  return utcMs / MS_PER_DAY + UNIX_EPOCH_JD
}

/**
 * The integer Julian Day Number of a Gregorian calendar date.
 *
 * This is the JDN at noon UT of that date, which is the convention the day
 * pillar formula in `calculate.ts` is calibrated against. Fliegel & Van
 * Flandern's expression; exact integer arithmetic, no floating point.
 */
export function julianDayNumber(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12)
  const y = year + 4800 - a
  const m = month + 12 * a - 3
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  )
}

/**
 * Apparent geocentric ecliptic longitude of the Sun, in degrees, normalised to
 * [0, 360).
 *
 * By convention 0° is the vernal equinox (春分). The 24 solar terms sit at exact
 * multiples of 15°.
 */
export function apparentSolarLongitude(julianDate: number): number {
  const t = (julianDate - J2000_JD) / 36525

  // Geometric mean longitude of the Sun.
  const meanLongitude = 280.46646 + 36000.76983 * t + 0.0003032 * t * t

  // Mean anomaly of the Sun.
  const meanAnomaly = 357.52911 + 35999.05029 * t - 0.0001537 * t * t
  const m = meanAnomaly * DEG_TO_RAD

  // Equation of the centre.
  const centre =
    (1.914602 - 0.004817 * t - 0.000014 * t * t) * Math.sin(m) +
    (0.019993 - 0.000101 * t) * Math.sin(2 * m) +
    0.000289 * Math.sin(3 * m)

  const trueLongitude = meanLongitude + centre

  // Longitude of the ascending node of the Moon's mean orbit, for nutation.
  const omega = (125.04 - 1934.136 * t) * DEG_TO_RAD

  // Aberration and the leading nutation term.
  const apparent = trueLongitude - 0.00569 - 0.00478 * Math.sin(omega)

  return ((apparent % 360) + 360) % 360
}

/**
 * Which Bazi solar month a given solar longitude falls in.
 *
 * The twelve month-commencing solar terms (節 jié — every *other* term, spaced
 * 30° apart) gate the month branches:
 *
 *   立春 315° → 寅   驚蟄 345° → 卯   清明  15° → 辰   立夏  45° → 巳
 *   芒種  75° → 午   小暑 105° → 未   立秋 135° → 申   白露 165° → 酉
 *   寒露 195° → 戌   立冬 225° → 亥   大雪 255° → 子   小寒 285° → 丑
 *
 * Because they are evenly spaced, the month follows from the longitude alone —
 * no need to solve for each term's instant.
 *
 * @returns 1 for the 寅 month through 12 for the 丑 month.
 */
export function solarMonthIndexFromLongitude(longitudeDegrees: number): number {
  const fromLiChun = ((longitudeDegrees - LI_CHUN_LONGITUDE) % 360 + 360) % 360
  return Math.floor(fromLiChun / 30) + 1
}

/**
 * The instant of 立春 (Lìchūn, solar longitude 315°) in a given Gregorian year,
 * as UTC milliseconds.
 *
 * Found by bisection. Lìchūn always falls on 3-5 February, and across the search
 * window (20 January to 20 February) solar longitude climbs monotonically from
 * about 300° to about 331° without wrapping through 360°, so the sign change is
 * unique and bisection is safe.
 */
export function liChunUtcMs(gregorianYear: number): number {
  let low = Date.UTC(gregorianYear, 0, 20)
  let high = Date.UTC(gregorianYear, 1, 20)

  const offsetAt = (utcMs: number): number =>
    apparentSolarLongitude(julianDateFromUtcMs(utcMs)) - LI_CHUN_LONGITUDE

  if (offsetAt(low) > 0 || offsetAt(high) < 0) {
    throw new Error(`立春 not bracketed in ${gregorianYear}; solar model out of range`)
  }

  // 52 halvings of a 31-day window lands well below millisecond resolution;
  // 60 is a cheap margin and still returns in microseconds.
  for (let i = 0; i < 60; i += 1) {
    const middle = (low + high) / 2
    if (offsetAt(middle) < 0) low = middle
    else high = middle
  }

  return Math.round((low + high) / 2)
}
