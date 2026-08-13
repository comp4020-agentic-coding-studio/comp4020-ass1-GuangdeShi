/**
 * The ladder.
 *
 * The objects are here to show *scale*, not to be shopped for: the sequence has
 * to climb from something a visitor buys without thinking to something no
 * amount of working could reach, so that the same toggle produces "16 minutes"
 * at one end and a count of whole lives at the other.
 *
 * Prices are local and static. Nothing is fetched at runtime — a live price
 * feed would make the page's central claim depend on somebody else's uptime,
 * and would put a different number in front of every visitor with no way to
 * check what they saw.
 */

import raw from './products.json'
import type { Product } from '../life/types'

/**
 * The dataset, sorted by price.
 *
 * Sorted here rather than trusted to be in order in the file, so that adding a
 * product in the wrong place cannot quietly break the climb — the ladder's
 * ascent is the argument, not a property of the JSON's line order.
 */
export const PRODUCTS: readonly Product[] = [...(raw as Product[])].sort(
  (a, b) => a.priceAUD - b.priceAUD,
)

/** How many prices in the set are still placeholders. Shown on the page. */
export const PROVISIONAL_COUNT = PRODUCTS.filter((p) => p.provisional).length
