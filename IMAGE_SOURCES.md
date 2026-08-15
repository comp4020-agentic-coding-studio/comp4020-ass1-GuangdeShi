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

## Iteration 3 — cutout on pure white (current)

Iteration 2's packshot standard still let two real constraints through: a photo could only be
"white background" if it was shot that way, and the two aircraft kept their natural sky instead.
This iteration removes that exception — every image is now a **segmented cutout of the main
object, composited onto a pure white canvas**, so the background is manufactured consistently
rather than inherited from whatever the original photo happened to be shot against. Same eight
sample items: banana, bottle of water, instant noodles, coffee, MacBook Air, RTX 5090, helicopter,
private jet.

**Important disclosure — no fresh re-sourcing was done this round.** Stage 3 of this iteration's
brief asked to prefer product-dataset/e-commerce sources over general stock photography. That
was not acted on: all eight raw photos are the same already-vetted originals from iteration 1 or
2 (see the source table below), reused because they were already confirmed clean, single-object,
real photographs — re-searching against dedicated e-commerce/catalogue sites was skipped in favour
of testing the new cutout pipeline itself. Two of the eight (water, RTX 5090) still carry
iteration 1's original caveats unchanged: the water photo is a generic bottle stock photo, not
from a retailer catalogue, and the RTX 5090 image is still a real photo of an older EVGA GeForce
GTX 750 Ti standing in for the category — no CC-licensed photo of the actual 2025 card exists.
**No candidates were rejected this round** because no new candidates were sought.

| Product | File | Raw source reused from | Original page | Cutout applied |
|---|---|---|---|---|
| Banana | `banana.jpg` | Iteration 2 (`banana_a.jpg`) — Wikimedia Commons via Flickr, robin_24, CC BY 2.0 | https://commons.wikimedia.org/w/index.php?curid=16419110 | Yes — rembg (U2Net), alpha matting |
| Bottle of water | `water.jpg` | Iteration 1 (`water_e.jpg`) — Wikimedia Commons, CC0 | https://commons.wikimedia.org/wiki/File:Cil%C3%ADndrica_botella_de_agua_con_tapa_negra.jpg | Yes — rembg (U2Net), alpha matting |
| Instant noodles | `noodles.jpg` | Iteration 2 (`noodles_a.jpg`) — Wikimedia Commons, Takeaway, CC BY-SA 3.0 | https://commons.wikimedia.org/w/index.php?curid=32787360 | Yes — rembg (U2Net), alpha matting |
| Coffee | `coffee.jpg` | Iteration 2 (`coffee_d.jpg`) — Flickr, dlg_images, CC BY 2.0 | https://www.flickr.com/photos/131260238@N08/16768489546 | Yes — rembg (U2Net), alpha matting |
| MacBook Air | `macbookair.jpg` | Iteration 2 (`laptop_a.jpg`) — rawpixel, CC0 | https://www.rawpixel.com/image/5907652/photo-image-background-public-domain-technology | Yes — rembg (U2Net), alpha matting |
| RTX 5090 (graphics card) | `rtx5090.jpg` | Iteration 1 (`gpu_a.jpg`) — Flickr (EVGA GTX 750 Ti stand-in) | https://www.flickr.com/photos/196975524@N05/14898396601 | Yes — rembg (U2Net), alpha matting |
| Helicopter | `helicopter.jpg` | Iteration 2 (`helicopter_d.jpg`) — WordPress Photo Directory, werkform, CC0 | https://wordpress.org/photos/photo/781663c860/ | Yes — rembg (U2Net), alpha matting |
| Private jet | `jet.jpg` | Iteration 2 (`privatejet_d.jpg`) — rawpixel, CC0 | https://www.rawpixel.com/image/6080440/d-chec | Yes — rembg (U2Net), alpha matting |

Local files live under `public/images/products-cutout/`, named by product id. Nothing is fetched
at runtime.

### Processing

Every image went through the same script: [rembg](https://github.com/danielgatis/rembg)
(U2Net segmentation model, run locally, no network calls at build or runtime) removes the
background and returns an alpha-channel cutout of the main object; the object is cropped to its
alpha bounding box, resized so its long edge fills ~78% of a 1000×1000 canvas, and composited
centred onto a solid `rgb(255,255,255)` canvas using its own alpha as the paste mask, then
flattened to a JPEG.

The first pass (no alpha matting) left a faint blue/grey halo around the two aircraft, where the
sky-blue background bled into the semi-transparent edge pixels of the segmentation mask before
they were composited onto white. Re-run with rembg's alpha-matting refinement
(`alpha_matting_foreground_threshold=240`, `alpha_matting_background_threshold=10`,
`alpha_matting_erode_size=8`) sharpened the edge and removed the halo — this refined pass is what
was kept for all eight items, not just the two aircraft, so the whole set uses one consistent
pipeline.

### Judgement calls carried over from earlier iterations

- **Coffee**: still the same "cup of coffee" stand-in for the product's display name "A flat
  white" — black coffee with a thin crema, not steamed milk (see iteration 2's note).
- **Graphics card**: still a real photo of an older EVGA GeForce GTX 750 Ti, standing in for
  "graphics card" as a category (see iteration 1's note) — no CC-licensed photo of an actual RTX
  5090 exists.
- **Helicopter and private jet**: iteration 2 kept their natural sky background because a real
  aircraft in flight has no isolated studio version. This iteration overrides that judgement per
  the new brief's explicit "pure white, no stated exception" requirement — the sky is now removed
  entirely via segmentation rather than cropped tighter around. Whether an aircraft looking
  "cut out of the sky" reads as more or less honest than keeping its real backdrop is a genuine
  trade-off, not a settled question — flagged here for review rather than decided silently.

## Iteration 3b — AirPods addition (single-item scope extension)

**Why this exists outside the eight-item checkpoint:** the user pasted a reference AirPods photo
and asked to replace the catalogue's generic headphone-note icon with it directly. That reference
photo was studio-lit in the style of Apple's own official marketing photography — using it would
have broken this project's CC-BY / CC-BY-SA / CC0 / PDM-only sourcing discipline (see the header
note above), and it also sat outside the eight-sample checkpoint the prior iteration stopped at.
Both concerns were raised with the user explicitly rather than decided silently; the user chose to
source a CC-licensed equivalent instead of using the pasted photo, and gave explicit go-ahead to
do AirPods now while continuing to hold off on the remaining ~41 products.

| Product | File | Raw source | Original page | License / creator | Cutout applied |
|---|---|---|---|---|---|
| AirPods | `airpods.jpg` | Wikimedia Commons ("AirPods.jpg"), originally Flickr | https://www.flickr.com/photos/pestoverde/28954822254/ | CC BY 2.0, Maurizio Pesce ("pestoverde") | Yes — rembg (U2Net), alpha matting, same pipeline as iteration 3 |

**Rejected candidates:**

- `airpods_a.jpg` — Wikimedia, "Second generation AirPods", CC BY 4.0 (Gameplay010unused). Rejected:
  dark reddish wood background, dim lighting.
- `airpods_b.jpg` — Wikimedia, "AirPods Pro (2nd generation)", CC BY-SA 4.0 (Hajoon0102). Rejected:
  buds laid beside the closed case rather than inside it.
- `airpods_c.jpg` — Wikimedia, "Airpods Pro in a Case", CC BY-SA 4.0 (Harjotbhui). Rejected:
  third-party black fabric case, not Apple's own, busy background.

`airpods_d.jpg` was accepted: clean light-gray studio background, both original AirPods out of the
case plus the case open beside them, no watermark, no hands, high resolution (4906×3348).

Local file lives under `public/images/products-cutout/airpods.jpg`. Nothing is fetched at runtime.

## Iteration 4 — reusable cutout skill applied to Batch A (personal tech/accessories)

**Why this exists:** the AirPods result (iteration 3b) was named the reference standard for a
repeatable skill — source a real object photo, reject weak candidates, cut it out with the same
rembg pipeline, normalise it onto pure white at consistent scale, wire it in, document it — to be
applied across the remaining ~38 illustration-based products. This is the first batch: eight
personal-tech/accessory items that were still SVG icons — computer mouse, keyboard, backpack,
sneakers, Apple Watch, headphones, iPad, smartphone.

Sourcing used the same keyless pipeline as earlier iterations (Wikimedia Commons search API,
Openverse) with one addition: a descriptive `User-Agent` header on Wikimedia/Flickr downloads to
avoid the 429 rate-limiting encountered partway through this batch. Every top candidate was
downloaded, checked with `file` to confirm it was a real image (not an HTML error page), and
personally viewed before being accepted or rejected — not judged on a search result's title alone.

| Product | File | Raw source | Original page | License / creator | Cutout applied |
|---|---|---|---|---|---|
| Computer mouse | `mouse.jpg` | Wikimedia Commons, black wireless mouse | Pixloom upload | CC BY-SA 4.0, Pixloom | Yes — rembg (U2Net), alpha matting |
| Keyboard | `keyboard.jpg` | Wikimedia Commons, Apple Magic Keyboard on a wood desk | Fletcher upload | CC BY 4.0, Fletcher | Yes — rembg (U2Net), alpha matting |
| Backpack | `backpack.jpg` | Wikimedia Commons, Quechua "Escape 30" hiking backpack | Fructibus upload | CC0, Fructibus | Yes — rembg (U2Net), alpha matting |
| Sneakers | `sneakers.jpg` | Wikimedia Commons, Adidas Yeezy Boost 350 V2 ("MX Rock") | Jacek Halicki upload | CC BY-SA 4.0, Jacek Halicki | Yes — rembg (U2Net), alpha matting |
| Apple Watch | `applewatch.jpg` | Flickr, Apple Watch on a wood table | https://www.flickr.com/photos/yasunobuikeda | CC BY-SA 2.0, Yasunobu Ikeda | Yes — rembg (U2Net), alpha matting |
| Headphones | `headphones.jpg` | Wikimedia Commons, Bose QuietComfort 25 | Florian Fuchs upload | CC BY-SA 3.0, Florian Fuchs | Yes — rembg (U2Net), alpha matting |
| iPad | `ipad.jpg` | Flickr via Wikimedia, iPad Air against a plain wall, Apple Pencil beside it | https://www.flickr.com/photos/ajay_suresh | CC BY 2.0, ajay_suresh | Yes — rembg (U2Net), alpha matting |
| Smartphone | `smartphone.jpg` | Flickr, Nexus S, front, screen off, on white | https://www.flickr.com/photos/justusbluemer | CC BY 2.0, justusbluemer | Yes — rembg (U2Net), alpha matting |

Local files live under `public/images/products-cutout/`, named by product id. Same pipeline as
iteration 3: `/tmp/cutout.py` — rembg U2Net segmentation with alpha-matting refinement
(`alpha_matting_foreground_threshold=240`, `alpha_matting_background_threshold=10`,
`alpha_matting_erode_size=8`), cropped to the alpha bounding box, resized so the long edge fills
~78% of a 1000×1000 canvas, composited centred onto solid `rgb(255,255,255)`.

### Rejected candidates

- **Computer mouse**: an HP wired mouse (CC BY-SA 4.0, Pixloom) — visible dust/fingerprint smudges
  on the body on close inspection, did not meet the clean bar the catalogue holds itself to; a
  Lenovo wired mouse (CC0, Raysonho) — visible brand logo prominent in frame; a generic black
  mouse (CC0, Peter Astbury) — too low-resolution (738×1025).
- **Keyboard**: a Logitech G PRO TKL (CC0, AzureSaturn) — sharp, top-pick quality, but shot on a
  black/dark surface with a black keyboard, low contrast against its own background; a Rii mini
  wireless keyboard (CC BY 4.0, Hayden Schiff) — a niche remote-style form factor, not
  representative of "a keyboard"; an HP wireless keyboard (CC BY-SA 4.0, Pixloom) — visible grime.
- **Backpack**: first sourcing attempt for this item produced corrupted output (HTML/text saved
  with a `.jpg` extension, caught via `file` before use) and was redone from scratch. Of the
  redone candidates: an Eastpak Sugarbush (CC BY-SA 4.0, Ubcule) — shot on a neutral bedsheet, not
  as clean as the accepted one; a Wenger daypack (CC0, Sir Tragedy) — shot against a wall/tile
  background; a Champion backpack (CC0) — softer focus.
- **Sneakers**: three Museum Rotterdam pieces (Onitsuka Tiger, Nike Air Huarache, a G-Unit-style
  white sneaker, all CC BY-SA 3.0) — all shot on a black background rather than white/neutral, and
  the white sneaker showed visible scuffing.
- **Apple Watch**: a worn-on-wrist shot (CC0, fancycrave1/Pixabay) — kept only as a fallback since
  the brief calls for the product itself, not a lifestyle/worn shot; the accepted image and its
  companion frame from the same Flickr session were compared against each other and confirmed as
  a standalone table shot (watch and band laid across a wood surface, not worn) before acceptance.
- **Headphones**: a Bose QC3 (CC BY-SA 3.0, Mark Kim) — mediocre resolution/quality; an
  Audio-Technica ATH-M50s (CC BY 2.0) — on a wood table with a visible coiled cable, cluttered; a
  generic wireless headphone stock photo (CC0) — only retrievable at 960×640.
- **iPad**: an iPad in grass with the screen on (CC BY-SA 2.0, twicepix) — outdoor, non-neutral
  background; a near-duplicate frame from the same accepted photo session was reviewed and judged
  equivalent, not better, so the original pick stood.
- **Smartphone**: an HTC One M8 and a Samsung Galaxy S5, both back-view on a wood table (CC BY 2.0,
  Janitors) — surface not neutral, and the Galaxy S5 crop clipped its edges; an iPhone 12 Pro flat
  on a wood table (CC BY 2.0, ajay_suresh) — real photo but on a distracting wood grain background.

### Judgement calls

- **Keyboard background vs. cutout pipeline**: the accepted Apple Magic Keyboard photo sits on a
  wood desk, not a white/neutral surface. Since the rembg segmentation step discards the entire
  background regardless of colour and only the isolated keyboard survives onto the manufactured
  white canvas, the raw photo's backdrop doesn't carry through to the final tile — the deciding
  factor was keeping to a light-coloured *object* (matching the catalogue's Apple-product visual
  register) over the accepted Logitech candidate's low-contrast black-on-black source, which risks
  a worse segmentation result even though its own background was also discarded.
- **iPad companion object**: the accepted source photo includes an Apple Pencil standing beside
  the iPad. The rembg segmentation isolated the iPad as the dominant object; the pencil did not
  survive into the final cutout. This was accepted as-is rather than re-sourced, since the result
  still reads cleanly as "an iPad" alone.

## Iteration 2 — packshot standard (superseded for these eight ids)

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
