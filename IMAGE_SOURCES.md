# Image sources — real-photo library (10-sample checkpoint)

Local files live under `public/images/products-real/`, named by product id.
Nothing is fetched at runtime; each file was downloaded once and committed.

**Source note:** Pexels, Pixabay and Unsplash were tried first as instructed, but
in this environment (no browser, no API keys) their search pages are
JS-rendered and return no scrapeable image URLs via a plain HTTP fetch, and
their official APIs require keys that weren't available. Openverse
(`api.openverse.org`) was used instead — it's a keyless, scriptable search
that aggregates CC-licensed photos from Flickr, Wikimedia Commons, Rawpixel,
and similar sources. Every image below is filtered to `by`, `by-sa`, `cc0`, or
`pdm` licenses.

| Product | File | Source site | Original page | Creator | License |
|---|---|---|---|---|---|
| Banana | `banana.jpg` | Openverse → Flickr/Rawpixel | see previous stage's commit `5f0730b` | — | CC0 |
| Apple | `apple.jpg` | Openverse → Rawpixel | https://www.rawpixel.com (public-domain CC0 collection) | Rawpixel | CC0 |
| Bottle of water | `water.jpg` | Openverse → Wikimedia Commons | https://commons.wikimedia.org/wiki/File:Cil%C3%ADndrica_botella_de_agua_con_tapa_negra.jpg | uploader credited on file page | CC0 |
| Instant noodles | `noodles.jpg` | Openverse → Wikimedia Commons | https://commons.wikimedia.org/wiki/File:Mama_instant_noodle_block.jpg | credited on file page | CC BY-SA |
| Coffee | `coffee.jpg` | Openverse → Flickr | https://www.flickr.com/photos/196975524@N05/52530242135 (title "Espresso") | Flickr user, credited on photo page | CC BY |
| Steak | `steak.jpg` | Openverse → Flickr | https://www.flickr.com/photos/7917900@N02/1786393525 (title "Raw Skirt Steak") | Flickr user, credited on photo page | CC BY |
| MacBook Air | `macbookair.jpg` | Openverse → Flickr | see previous stage's commit `5f0730b` | — | CC BY |
| RTX 5090 (graphics card) | `rtx5090.jpg` | Openverse → Flickr | https://www.flickr.com/photos/196975524@N05/14898396601 | Flickr user, credited on photo page | — (product photo of an EVGA GeForce GTX 750 Ti, used as a representative graphics-card image; note below) |
| Beach house | `beachhouse.jpg` | Openverse → Flickr | see previous stage's commit `5f0730b` | — | CC BY |
| Private jet | `jet.jpg` | Openverse → Flickr | see previous stage's commit `5f0730b` | — | CC BY |

## Notes / judgment calls

- **Graphics card**: no CC-licensed photo of an actual RTX 5090 turned up
  (too new for openly-licensed photography). The image used is a real
  product photo of an older EVGA GeForce card, standing in for "graphics
  card" as a category rather than the literal SKU — flagged here rather than
  silently substituted.
- **Steak**: the cleanest CC-licensed candidate was a raw, seasoned cut of
  meat on a cutting board rather than a plated restaurant dinner (the
  product's display name). Several plated-dinner candidates were rejected for
  clutter (side dishes, glassware, outdoor backgrounds) before landing here.
- **Beach house / private jet**: these are real-world exterior/vehicle
  photos, not isolated studio product shots, so they don't have a literal
  white background — they were tightly cropped to remove surrounding
  deadspace instead. The page's existing `object-fit: contain` still centers
  them consistently in the tile.
- Every other image (apple, water, noodles, coffee, steak, banana,
  macbookair, rtx5090) is a real photograph of a single centred object,
  cropped and padded to a consistent square with a plain white margin.
