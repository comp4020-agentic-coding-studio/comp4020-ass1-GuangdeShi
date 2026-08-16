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
import type { Product, ProductScale } from '../life/types'

/**
 * Headings for the four price-scale groups already carried by the dataset.
 *
 * This reuses `Product.scale` rather than inventing a second grouping — the
 * scale a product already has (and `products.test.ts` already keeps in step
 * with price) is the size hierarchy the layout below draws from.
 */
const GROUP_LABEL: Record<ProductScale, string> = {
  everyday: 'Everyday',
  household: 'Around the home',
  major: 'The big purchases',
  extraordinary: 'The extraordinary',
}

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

  // One `<section>` per scale, each with its own grid — that is what lets a
  // group's cards be physically bigger than the one before it. Products
  // arrive pre-sorted by price with scale already non-decreasing
  // (`products.test.ts` enforces it), so a scale change always starts a new,
  // final group rather than re-opening an earlier one.
  let group: HTMLOListElement | undefined
  let groupScale: ProductScale | undefined
  let tileIndex = 0

  const tiles: Tile[] = products.map((product) => {
    if (product.scale !== groupScale) {
      groupScale = product.scale
      const section = document.createElement('section')
      section.className = `catalogue__group catalogue__group--${product.scale}`

      const heading = document.createElement('h3')
      heading.className = 'catalogue__group-title'
      heading.textContent = GROUP_LABEL[product.scale]

      group = document.createElement('ol')
      group.className = 'catalogue__group-list'

      section.append(heading, group)
      root.append(section)
    }

    const item = document.createElement('li')
    item.className = `tile tile--${product.scale}`
    item.dataset.id = product.id
    // Lets the CSS stagger the repricing across the whole catalogue, so the
    // change reads as travelling through it rather than flashing all at once.
    item.style.setProperty('--tile-index', String(tileIndex))
    tileIndex += 1

    const imageWrap = document.createElement('div')
    imageWrap.className = product.realPhoto ? 'tile__image tile__image--photo' : 'tile__image'

    const image = document.createElement('img')
    image.className = 'tile__image-img'
    image.src = product.image ?? ''
    // Decorative — the product name beside it already carries the identity,
    // so a screen reader does not need to announce this twice.
    image.alt = ''
    image.loading = 'lazy'
    image.decoding = 'async'
    image.width = 96
    image.height = 96
    imageWrap.append(image)

    const name = document.createElement('span')
    name.className = 'tile__name'
    name.textContent = product.name

    const time = document.createElement('span')
    time.className = 'tile__time'
    time.dataset.testid = `price-${product.id}`

    item.append(imageWrap, name, time)
    group!.append(item)
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
