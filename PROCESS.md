# Process

Four moments from building Life Cost — where an assumption was tested against a working build,
and the harness or the code changed because of what the build showed.

---

## Moment 1 — A successful prototype answered the wrong question

The first direction was an interactive BaZi (Four Pillars of Destiny) explainer. It worked: the
visitor entered a birth date and time, and the page returned the corresponding Eight Characters and
a personality reading, correct against independently sourced anchors.

What it did not do was explain anything. A right answer from a birth moment needed Heavenly Stems,
Earthly Branches, Five Elements and calendrical boundaries before the interaction meant anything —
the input disappeared into a black box and a verdict came back. A technically successful
implementation is not automatically a successful response to a brief that asks for an explainer,
not a working oracle. I stopped polishing the BaZi build and pivoted to Life Cost, where the object
being explained — money as exchanged time — needs no prior system to follow.

**Evidence:** the closed prototype, preserved unrewritten on `bazi-prototype` —
[`0b38c37...f0a1874`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-GuangdeShi/compare/0b38c37...f0a1874).

---

## Moment 2 — Familiar interface patterns pulled the agent toward a shop

Life Cost's first working build let the visitor flip a **MONEY ↔ TIME** toggle over the same fifty
objects — plausible on its own, and also the shape of a shop's variant switcher. Once priced
objects were on screen, the pull toward catalogue conventions kept surfacing; repeating "make it
less like a shop" as a prompt was not going to hold against a pattern that familiar.

Instead the toggle was removed outright: the page commits to one currency, time, stating the
exchange rate once rather than offering a choice. The correction went into `CLAUDE.md` as a rule,
not just a diff — "there is no MONEY/TIME choice" — alongside the out-of-scope list (no carts,
checkout, quantity selectors, product cards), so the next drift toward a shop is rejected by the
harness rather than caught by re-reading the page.

**Evidence:** the toggle introduced, then removed for one currency —
[`4f011de...7f8f50d`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-GuangdeShi/compare/4f011de...7f8f50d).

---

## Moment 3 — Correct numbers were not automatically good explanations

The unit ladder climbed minutes through working years, and the top of the product ladder walked
past it: a private jet priced at "1,420 working years". The first response was a bigger unit,
`working lifetimes` (45 working years), to keep the number small.

That was itself the wrong call. Naming a price as a count of whole human lives carries more
judgement than a duration should. This is not an unresolved bug — the final decision keeps years as
the top rung, uncapped, however large the number gets. "1,420 working years" is correct and
intentional: the size of the number does the explanatory work, communicating that the object is out
of reach of an ordinary working life by refusing to shrink into something smaller-sounding.
`duration.test.ts` still pins every boundary below years and asserts no such value reaches four
digits, so the decision costs nothing in arithmetic correctness.

**Evidence:** the lifetimes tier added, then reverted for uncapped years —
[`4f011de...38e0e6c`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-GuangdeShi/compare/4f011de...38e0e6c).

---

## Moment 4 — Verification stopped the agent from fixing a false bug

A 390×7000 headless screenshot, built to see the whole mobile product ladder in one capture,
appeared to show several tiers with missing product images. The obvious move was to start
adjusting image or grid CSS. Instead, the failure was reproduced under the actual marking viewport
first: a real 390×844 capture, and a shorter tall capture around just the affected section, both
rendered every image correctly. The gap was the headless shell's own image-decode budget outrun by
an unrealistically tall capture, not the site. No product code changed; the trap went into
`CLAUDE.md` so an unusual automated failure is reproduced under realistic conditions before it
triggers an implementation change.

**Evidence:** [`1b781b0`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-GuangdeShi/commit/1b781b0).
