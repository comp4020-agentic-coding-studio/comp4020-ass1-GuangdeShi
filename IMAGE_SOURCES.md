# Image sources — real-photo library

Local files live under `public/images/products-real/`, named by product id.
Nothing is fetched at runtime; each file was downloaded once and committed.

**Source note:** Pexels, Pixabay and Unsplash were tried first as instructed, but
in this environment (no browser, no API keys) their search pages are
JS-rendered and return no scrapeable image URLs via a plain HTTP fetch, and
their official APIs require keys that weren't available. Openverse
(`api.openverse.org`), Wikimedia Commons' own search API, Flickr pages
surfaced through those two, and rawpixel's CC0 library were used instead —
all keyless and reachable via plain HTTP. Every image below is filtered to
`by`, `by-sa`, `cc0`, or `pdm` licenses.

## Iteration 2 — packshot standard (current)

The first pass (iteration 1, commit `0e6fa0a`) accepted any real photograph
over an illustration, which let some stock/lifestyle shots through (props,
busy backgrounds, off-centre subjects). This iteration tightens the standard
to **e-commerce packshot style** — single object, white/near-white or plain
sky background, centred, minimal clutter — and re-sources six representative
items across the price range to test it before touching the rest of the
catalogue: banana, instant noodles, coffee, MacBook Air, helicopter, private
jet.

Every accepted candidate below was downloaded and visually inspected (not
judged by title/filename alone) before acceptance. Rejected candidates and
the reason are listed per item.

| Product | File | Source site | Original page | Creator | License |
|---|---|---|---|---|---|
| Banana | `banana.jpg` | Wikimedia Commons (via Flickr) | https://commons.wikimedia.org/w/index.php?curid=16419110 | robin_24 | CC BY 2.0 |
| Instant noodles | `noodles.jpg` | Wikimedia Commons | https://commons.wikimedia.org/w/index.php?curid=32787360 ("Mama instant noodle block") | Takeaway | CC BY-SA 3.0 |
| Coffee | `coffee.jpg` | Flickr | https://www.flickr.com/photos/131260238@N08/16768489546 ("Cup & Coffee") | dlg_images | CC BY 2.0 |
| MacBook Air | `macbookair.jpg` | rawpixel | https://www.rawpixel.com/image/5907652/photo-image-background-public-domain-technology | uncredited (rawpixel CC0 collection) | CC0 |
| Helicopter | `helicopter.jpg` | WordPress Photo Directory | https://wordpress.org/photos/photo/781663c860/ ("Austrian police helicopter against a blue sky") | werkform | CC0 |
| Private jet | `jet.jpg` | rawpixel | https://www.rawpixel.com/image/6080440/d-chec ("Private jet flying high skyward") | uncredited (rawpixel CC0 collection) | CC0 |

All six were downsized/cropped locally after download (see "Processing" below)
— no further edits, no watermark removal, no AI upscaling.

### Rejected candidates and why

- **Instant noodles**: a stack of 7 instant-cup-noodle containers against a
  warm yellow wall (multi-object, coloured background); an opened cup with
  cooked noodles shot at an angle (lifestyle feel); a hands-and-chopsticks
  eating shot on a dark background (clearly a lifestyle/eating scene, not a
  product shot).
- **Coffee**: two candidates were technically clean white-background studio
  shots but the cup was empty (just used coffee-stain residue), not
  recognisable as "a cup of coffee"; a third was a genuine clean packshot but
  carried a baked-in "PackshotCreator" watermark logo in the corner —
  unusable.
- **MacBook Air**: a "hands typing on a laptop" shot with a potted plant prop
  in frame — lifestyle desk scene, not a packshot.
- **Helicopter**: a helipad shot with visible city apartment blocks and
  mountains in the background (busier than the accepted one); a parked
  military helicopter shot crowded with other aircraft, a hangar and trees;
  a helicopter image that turned out to be a 3D CGI render on a flat green
  background, not a real photograph — rejected under the "no AI/render-look"
  rule even though the search term matched.
- **Private jet**: a hangar shot with birds, ground equipment and tarps in
  frame; a 16-image collage (unusable as a single product image); an extreme
  engine close-up with a ground crew truck in shot; a from-directly-below
  fisheye angle that made the aircraft's shape hard to read.

### Judgement calls

- **Coffee**: the product's display name is "A flat white" (a milk-based
  coffee), but the accepted photo shows black coffee with a thin crema, not
  steamed milk. No CC-licensed packshot-style flat white (visible milk foam,
  white/light background, single cup) turned up — this is a representative
  "cup of coffee" stand-in, flagged here rather than silently presented as
  the literal drink.
- **Helicopter and private jet**: real aircraft in flight don't have an
  isolated white-background version — there is no studio to put a jet in.
  Both were accepted with a plain sky background instead, tightly cropped to
  remove excess dead space (hangars, ground, other aircraft) rather than
  forced onto a white canvas, which would have meant fabricating a backdrop
  that was never photographed. `object-fit: contain` on the tile keeps them
  centred consistently alongside the white-background packshots.

### Processing

- Banana, noodles, coffee, MacBook Air: cropped to the bounding box of the
  non-background content (background colour sampled from the four image
  corners), padded 8% on a white canvas, resized to 800×800.
- Helicopter, private jet: cropped to the bounding box of the non-sky content
  with a smaller 6% pad, keeping the original (non-square) aspect ratio and
  the natural sky background — no white canvas — then downsized so the long
  edge is 900px.

## Iteration 1 — first real-photo pass (superseded for these six ids)

Kept for the record; commit `0e6fa0a` on this branch. Openverse
(`api.openverse.org`) was the sole source for this pass — a keyless,
scriptable search that aggregates CC-licensed photos from Flickr, Wikimedia
Commons, rawpixel and similar sources.

| Product | File (iteration 1) | Source site | Original page | Creator | License |
|---|---|---|---|---|---|
| Apple | `apple.jpg` | Openverse → Rawpixel | https://www.rawpixel.com (public-domain CC0 collection) | Rawpixel | CC0 |
| Bottle of water | `water.jpg` | Openverse → Wikimedia Commons | https://commons.wikimedia.org/wiki/File:Cil%C3%ADndrica_botella_de_agua_con_tapa_negra.jpg | uploader credited on file page | CC0 |
| Steak | `steak.jpg` | Openverse → Flickr | https://www.flickr.com/photos/7917900@N02/1786393525 (title "Raw Skirt Steak") | Flickr user, credited on photo page | CC BY |
| RTX 5090 (graphics card) | `rtx5090.jpg` | Openverse → Flickr | https://www.flickr.com/photos/196975524@N05/14898396601 | Flickr user, credited on photo page | — (product photo of an EVGA GeForce GTX 750 Ti, used as a representative graphics-card image; note below) |
| Beach house | `beachhouse.jpg` | Openverse → Flickr | see commit `5f0730b` | — | CC BY |

Apple, water, steak, and the RTX 5090/graphics-card stand-in were not part of
this iteration's 6-item re-source and still carry their iteration-1 image —
they remain candidates for a future packshot pass along with the other 44
illustration-based products.

### Iteration 1 judgement calls (still standing for apple/water/steak/rtx5090/beachhouse)

- **Graphics card**: no CC-licensed photo of an actual RTX 5090 turned up
  (too new for openly-licensed photography). The image used is a real
  product photo of an older EVGA GeForce card, standing in for "graphics
  card" as a category rather than the literal SKU.
- **Steak**: the cleanest CC-licensed candidate was a raw, seasoned cut of
  meat on a cutting board rather than a plated restaurant dinner (the
  product's display name). Several plated-dinner candidates were rejected for
  clutter (side dishes, glassware, outdoor backgrounds) before landing here.
- **Beach house**: a real-world exterior photo, not an isolated studio
  product shot, tightly cropped to remove surrounding deadspace — the same
  treatment now applied to helicopter/jet in iteration 2.
