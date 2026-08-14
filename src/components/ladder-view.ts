/**
 * The ladder: fifty objects, each read in a single currency — time.
 *
 * The rows are built once from the dataset and never rebuilt. Only the price
 * cell's text changes when the wage changes, so a retyped number reads as the
 * *same* object being repriced rather than a new list arriving. Money never
 * appears here: it stays in the data layer, where it is the thing being
 * translated away.
 *
 * Nothing here decides what a duration should say. That belongs to
 * `life/duration.ts`, where a test can hold it to account.
 */

import { formatWorkTime, hoursToEarn, type WorkRhythm } from '../life/duration'
import type { Product } from '../life/types'

export interface LadderState {
  /** The life-adjusted rate the ladder is priced in, or null while unknown. */
  readonly hourlyRate: number | null
  readonly rhythm: WorkRhythm
}

export interface LadderView {
  update(state: LadderState): void
}

interface Rung {
  readonly product: Product
  readonly price: HTMLElement
}

/** How long the repricing highlight lasts, in step with the CSS. */
const MORPH_MS = 700

export function createLadderView(root: HTMLElement, products: readonly Product[]): LadderView {
  root.textContent = ''

  const rungs: Rung[] = products.map((product, index) => {
    const item = document.createElement('li')
    item.className = `rung rung--${product.scale}`
    item.dataset.id = product.id
    // Lets the CSS stagger the repricing down the ladder, so the change reads
    // as travelling through the list rather than flashing all at once.
    item.style.setProperty('--rung-index', String(index))

    const name = document.createElement('span')
    name.className = 'rung__name'
    name.textContent = product.name

    const price = document.createElement('span')
    price.className = 'rung__price'
    price.dataset.testid = `price-${product.id}`

    const source = document.createElement('span')
    source.className = 'rung__source'
    source.textContent = product.priceSourceLabel
    if (product.priceCheckedDate) {
      source.textContent += ` · checked ${product.priceCheckedDate}`
    }

    item.append(name, price, source)
    root.append(item)
    return { product, price }
  })

  let morphing: ReturnType<typeof setTimeout> | undefined
  // Whether the ladder has shown a real duration yet. The one genuine
  // transformation left to animate is the reveal itself — the first moment a
  // wage turns every "—" into a length of time — so only that transition gets
  // the effect. Every keystroke after that repaints the numbers too, and
  // marking each one as a transformation would spend the effect until it
  // stopped meaning anything.
  let revealed = false

  return {
    update(state: LadderState): void {
      const { hourlyRate, rhythm } = state

      for (const { product, price } of rungs) {
        // No honest rate yet, so no time. A placeholder duration would be a
        // made-up number in the one place the page is asking to be believed.
        price.textContent =
          hourlyRate === null ? '—' : formatWorkTime(hoursToEarn(product.priceAUD, hourlyRate), rhythm).text
      }

      root.dataset.state = hourlyRate === null ? 'empty' : 'ready'

      if (!revealed && hourlyRate !== null) {
        root.classList.add('ladder--morphing')
        clearTimeout(morphing)
        morphing = setTimeout(() => root.classList.remove('ladder--morphing'), MORPH_MS)
      }
      revealed = hourlyRate !== null
    },
  }
}
