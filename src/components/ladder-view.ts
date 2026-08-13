/**
 * The ladder: the same objects, read twice.
 *
 * The rows are built once from the dataset and never rebuilt. Only the price
 * cell's text changes when the toggle moves — which is the point. If the list
 * were re-rendered, MONEY → TIME would read as a new page arriving; updating the
 * text in place makes it read as the *same* object being repriced, and that
 * transformation is the explanation the page exists to perform.
 *
 * Nothing here decides what a duration should say. That belongs to
 * `life/duration.ts`, where a test can hold it to account.
 */

import { formatMoney, formatWorkTime, hoursToEarn, type WorkRhythm } from '../life/duration'
import type { PriceMode, Product } from '../life/types'

export interface LadderState {
  readonly mode: PriceMode
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
  let shown: PriceMode | null = null

  return {
    update(state: LadderState): void {
      const { mode, hourlyRate, rhythm } = state

      for (const { product, price } of rungs) {
        if (mode === 'money') {
          price.textContent = formatMoney(product.priceAUD)
        } else if (hourlyRate === null) {
          // No honest rate yet, so no time. A placeholder duration would be a
          // made-up number in the one place the page is asking to be believed.
          price.textContent = '—'
        } else {
          price.textContent = formatWorkTime(hoursToEarn(product.priceAUD, hourlyRate), rhythm).text
        }
      }

      root.dataset.mode = mode

      // Only a genuine flip is worth animating. Retyping a wage repaints the
      // times too, and marking every keystroke as a transformation would spend
      // the effect until it stopped meaning anything.
      if (shown !== null && shown !== mode) {
        root.classList.add('ladder--morphing')
        clearTimeout(morphing)
        morphing = setTimeout(() => root.classList.remove('ladder--morphing'), MORPH_MS)
      }
      shown = mode
    },
  }
}
