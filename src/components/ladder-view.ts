/**
 * The catalogue: fifty objects, laid out as a visual grid and read in a
 * single currency — time.
 *
 * The tiles are built once from the dataset and never rebuilt. Only the time
 * cell's text changes when the wage changes, so a retyped number reads as the
 * *same* object being repriced rather than a new list arriving. Money never
 * appears here.
 *
 * Nothing here decides what a duration should say. That belongs to
 * `life/duration.ts`, where a test can hold it to account.
 */

import { formatWorkTime, hoursToEarn, type WorkRhythm } from '../life/duration'
import type { Product } from '../life/types'

export interface LadderState {
  /** The life-adjusted rate the catalogue is priced in, or null while unknown. */
  readonly hourlyRate: number | null
  readonly rhythm: WorkRhythm
}

export interface LadderView {
  update(state: LadderState): void
}

interface Tile {
  readonly product: Product
  readonly time: HTMLElement
}

/**
 * How long the repricing highlight lasts, in step with the CSS.
 *
 * Long enough to cover the slowest tile's stagger delay plus its own
 * animation, or the class comes off mid-fade and the tail of a fifty-item
 * grid pops in instead of settling.
 */
const MORPH_MS = 900

export function createLadderView(root: HTMLElement, products: readonly Product[]): LadderView {
  root.textContent = ''

  const tiles: Tile[] = products.map((product, index) => {
    const item = document.createElement('li')
    item.className = `tile tile--${product.scale}`
    item.dataset.id = product.id
    // Lets the CSS stagger the repricing across the grid, so the change reads
    // as travelling through it rather than flashing all at once.
    item.style.setProperty('--tile-index', String(index))

    // Decorative — the product name beside it already carries the identity,
    // so a screen reader does not need to announce this twice.
    const image = document.createElement('div')
    image.className = 'tile__image'
    image.setAttribute('aria-hidden', 'true')
    image.textContent = product.name.replace(/^(a|an|the)\s+/i, '').charAt(0).toUpperCase()

    const name = document.createElement('span')
    name.className = 'tile__name'
    name.textContent = product.name

    const time = document.createElement('span')
    time.className = 'tile__time'
    time.dataset.testid = `price-${product.id}`

    item.append(image, name, time)
    root.append(item)
    return { product, time }
  })

  let morphing: ReturnType<typeof setTimeout> | undefined
  // Whether the catalogue has shown a real duration yet. The one genuine
  // transformation left to animate is the reveal itself — the first moment a
  // wage turns every "—" into a length of time — so only that transition gets
  // the effect. Every keystroke after that repaints the numbers too, and
  // marking each one as a transformation would spend the effect until it
  // stopped meaning anything.
  let revealed = false

  return {
    update(state: LadderState): void {
      const { hourlyRate, rhythm } = state

      for (const { product, time } of tiles) {
        // No honest rate yet, so no time. A placeholder duration would be a
        // made-up number in the one place the page is asking to be believed.
        time.textContent =
          hourlyRate === null ? '—' : formatWorkTime(hoursToEarn(product.priceAUD, hourlyRate), rhythm).text
      }

      root.dataset.state = hourlyRate === null ? 'empty' : 'ready'

      if (!revealed && hourlyRate !== null) {
        root.classList.add('catalogue--morphing')
        clearTimeout(morphing)
        morphing = setTimeout(() => root.classList.remove('catalogue--morphing'), MORPH_MS)
      }
      revealed = hourlyRate !== null
    },
  }
}
