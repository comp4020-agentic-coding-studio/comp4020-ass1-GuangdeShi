# CLAUDE.md — development harness

Orientation for whoever works in this repo, human or agent. These are rules, not
suggestions: prefer fixing a rule here over re-prompting until something works.

## What this project is

**COMP8020 / COMP4020 Agentic Coding Studio — Assignment 1.**

The brief: *build an interactive explainer of something you think more people should know or
understand.*

The current concept is **Life Cost** (Prototype v1, branch `life-cost-v2`). The one idea:

> **Every price tag hides an amount of your life.**
>
> Everything has two prices: money, and time.

The visitor says how they are paid. The page derives what an hour of their life actually returns,
then shows a fifty-object ladder priced *only* in that currency — time. Money still drives the
arithmetic and the sourcing, but the visible ladder never states a dollar figure: the page
performs the translation once, in the exchange-rate section, and from there on speaks only in
hours, days, months and years. (An earlier iteration let the visitor toggle MONEY ↔ TIME over the
same objects; that toggle was removed so the page commits to one currency rather than offering a
choice — PROCESS.md, moment 2.)

The first concept, an interactive BaZi explainer, is **Prototype v0** — preserved unrewritten on
`bazi-prototype`. It was closed deliberately: it had an interaction, but the interaction did not
explain anything (PROCESS.md, moment 1). That finding is why this concept is shaped the way it
is, and it is why nothing about it may be deleted or rewritten.

## Where this project lives

```
/Users/my_mac/Developer/COMP8020/Assignment1/Assignment1 Creative Web
```

This is an **independent** Assignment 1 project.

- **Never** modify C1, C2, riff2, CBETA, or any previous course project.
- **Never** reuse an existing git repository or an existing git remote.
- **Never** push to a repository belonging to another deliverable or another student.

One remote is approved, and only this one:

```
origin  https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-GuangdeShi.git
```

It is the course-provisioned Assignment 1 repository. `main` carries two histories — the course
template and Prototype v0 — joined with `--allow-unrelated-histories`. **Do not rewrite, squash,
force-push or delete any of it.** `life-cost-v2` branches from that merge; the BaZi source files
are absent from this branch's tree, which is a branch state, not a history edit.

## Scope rules

### In scope

1. What an hour of the visitor's life returns in money, and why it is less than their wage.
2. What ordinary and extraordinary objects cost when the price is read in hours.
3. The scale between the two ends of that ladder.

### Out of scope — do not build

Budgeting · savings or investment projection · salary benchmarking or comparison to others ·
e-commerce, carts, checkout, quantity selectors, filters, search, product detail pages ·
"spend a billionaire's money" games · price feeds or any runtime fetching.

### The feature test

Before adding anything, ask:

> Does this directly help the visitor understand that **money represents exchanged human time**?

If the answer is no, do not add it. Technical possibility is not a reason. One idea, one
mechanic, carried all the way.

## The core interaction

> The visitor tells the page how they are paid, and watches fifty objects — the same objects, in
> the same order — become durations of their own life.

Consequences of this being *the* interaction:

- There is no MONEY/TIME choice. The ladder speaks one currency, time, so it reads as a page that
  has already done the translation rather than a tool offering two views.
- The rows are **built once and updated in place**. Rebuilding the list on every keystroke would
  make each repricing read as a new page arriving; changing only the price cell makes it read as
  the *same object* being repriced, which is the explanatory moment.
- Money survives only where it has to: the exchange-rate section states the paid and
  life-adjusted hourly rate in dollars, because that division *is* the argument. Everywhere past
  that section, a dollar figure would undercut the page's own claim that time is the real price.
- The reveal — the first moment a wage turns every "—" into a length of time — is the one
  transition worth animating. Every keystroke after that repaints the numbers too, and marking
  each one as a transformation would spend the effect until it stopped meaning anything.

## Hard constraints

| Constraint | What it means here |
| --- | --- |
| **Static, client-side** | No backend, no runtime API calls, no live prices. Deploys to GitHub Pages as static files. |
| **One idea** | One strong idea with a clear point of view. Resist feature accretion. |
| **Desktop + phone** | Tested at 1920×1080 and 390×844, and **must survive resizing during use**. |
| **Keyboard accessible** | Every control keyboard-reachable, visible focus, semantic HTML. |
| **Robust** | Usable on a slow connection. No heavy assets, no fragile interactions. |

### State survives resize, because there is no second copy of it

The only state is *what the visitor typed*, and it lives in the DOM's own inputs rather than in
module variables. Nothing is re-created on a layout change, so there is nothing to lose when the
window is dragged mid-interaction. Keep it that way: do not introduce a cached copy of a derived
value, and do not rebuild anything on `resize`.

### Accessibility specifics

- Real elements only: `<button>`, `<input>`, `<label>`, `<fieldset>`, `<select>`. No click
  handlers on `<div>`s.
- Never remove focus outlines.
- The ladder's empty state (no honest rate yet) is never colour-only: the dash sits back in the
  serif prose face, not the mono face a real duration gets, and `#ladder-caption` says in words
  that a wage is still needed.
- Respect `prefers-reduced-motion` for every animation.

## Honesty rules

These are the rules the whole piece rests on. Breaking one makes the page a lie with a nice
typeface.

- **Label the model as a model.** The page states, in the page itself, that this is an
  explanatory model and not an official economic or accounting measure.
- **Show the arithmetic.** Both rates are displayed with the division that produced them. A
  number the visitor cannot check is a number they have to take on faith.
- **Never invent a rate.** If the input cannot produce an honest answer — no pay, no hours, a week
  with more than 168 hours in it — `computeLifeRate` returns `null` and the page withholds the
  reveal. A placeholder duration in the one place the page asks to be believed is the worst
  possible defect.
- **A placeholder may not claim to be checked.** Every product carries `provisional`; a
  provisional price has no source URL and no checked date, and `products.test.ts` enforces it.
- **Name the disagreement.** The brief's month is 4 weeks and its year is 52 — which do not
  reconcile — so the same salary entered monthly and yearly gives slightly different rates. The
  page says so rather than quietly picking 4.345.

## Design direction

**Editorial print, not retail.** A price list that looks like a shop invites shopping.

Prefer: strong typography · generous whitespace · warm paper ground, near-black type, one accent
that belongs to time · a table that the eye reads *down*, so the change of scale is visible before
any number is read.

Avoid: product cards · badges · cart or checkout affordances · stock photography grids · gradients
· anything that makes an object look purchasable.

## Stack and commands

Plain HTML + CSS + TypeScript on Vite. No UI framework — the interaction is small enough that a
framework would add weight without adding clarity.

```sh
pnpm install          # esbuild's postinstall is allowed via pnpm-workspace.yaml;
                      # `prepare` also installs the .githooks pre-commit secret hook
pnpm dev              # local dev server
pnpm typecheck        # tsc --noEmit
pnpm test             # vitest run
pnpm build            # produce dist/
pnpm check            # typecheck && build && oxlint && stylelint && vitest — before every commit
pnpm check:evidence   # PROCESS.md commit citations resolve · reflection present · CLAUDE.md present
```

### Layers

```
src/life/types.ts        the shapes the explainer is built on
src/life/income.ts       pay → paid and life-adjusted hourly rates — pure, no DOM
src/life/duration.ts     money → hours → a duration a person can picture — pure, no DOM
src/life/parse.ts        form strings → numbers the model can refuse — pure, no DOM
src/data/products.json   the ladder: 50 objects, each with its price and its source
src/data/products.ts     the dataset, sorted by price at import
src/components/*.ts      view factories: build once, then update in place
src/main.ts              wiring only; no logic a test would want to reach

spec/invariants.test.ts  the course invariants — run against built dist/, not source
scripts/                 the course evidence check; course infrastructure, do not edit
```

`spec/` and `scripts/` came from the course template and are not this project's code. Own spec
tests for a week's published brief go *alongside* `invariants.test.ts`, never inside it.

Anything a test would want to assert belongs above `main.ts`. Rounding included: it is a
**display** decision, so `income.ts` returns exact numbers and `duration.ts` decides what is
printed — which means the arithmetic shown on the page is the arithmetic that ran.

**Views are updated, not re-rendered.** Both view factories build their skeleton once and
afterwards write only text nodes and attributes.

### Saying a duration

`duration.ts` exists to keep one promise: **never print a number a person cannot picture.**
"41,802 hours" is a number, not a scale. Rules follow, earned across PROCESS.md moments:

- **Working years is the top rung, uncapped.** An earlier iteration added a `working lifetimes`
  tier (45 working years) once the private jet overflowed years at "1,420 working years" —
  but naming a price as a count of whole lives carried more judgement than a duration should,
  which cut against the piece's own honesty rules. Years now stays the top rung however large the
  number gets; below it, the unit still climbs to keep the value small, so a plain number of years
  is the one place on the ladder allowed past a hundred.
- **The units are the visitor's, not the calendar's.** A working day is a fifth of the hours
  *they* said they work. Pricing a part-timer's laptop in 8-hour days is arithmetic about somebody
  else.
- The month tier stops at twelve, because a 4-week month and a 52-week year do not tile (52 ÷ 4 =
  13) and "13 working months" reads as an error even when the arithmetic is right.

`duration.test.ts` pins each boundary, each singular form, and a sweep asserting no value below the
years tier reaches four digits. `products.test.ts` asserts the whole ladder climbs through every unit at the
brief's example rate.

### Checking the rendering

Tests cannot see a layout, and this project has already shipped defects that only a rendered page
showed. Before calling a visual phase done, screenshot the built site at both marked widths:

```sh
pnpm build && pnpm preview --port 4183 &
SHELL="$HOME/Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell"
"$SHELL" --headless --hide-scrollbars --window-size=1920,1080 \
  --screenshot=/tmp/desktop.png --virtual-time-budget=900 http://localhost:4183/
"$SHELL" --headless --hide-scrollbars --window-size=390,844 \
  --screenshot=/tmp/phone.png --virtual-time-budget=900 http://localhost:4183/
```

To see an *interacted* state, copy `dist/index.html` to a throwaway `dist/__probe.html` with a
trailing module script that checks `#mode-time` and dispatches `change`, screenshot that, then
delete it. `dist/` is generated, so nothing enters the repo.

Three traps in this technique: the shell screenshots from the top of the layout regardless of
`scrollIntoView`, so to inspect the bottom of the ladder hide the sections above it in the probe;
a tall capture window inflates every `svh`, so judge the hero's height only in a 1080- or
844-high window; and a *very* tall narrow window (e.g. `390,7000` to fit the whole mobile
ladder in one shot) can outrun the shell's own image-decode budget — real photos past a certain
scroll distance render as blank space even with a generous `--virtual-time-budget`, while the
same images are fine in a shorter window or in a real phone browser. Confirm a suspected missing
image is a real bug, not this, by re-capturing a short window (a few thousand px) around just
that section before treating it as a CSS defect.

### Tooling notes

- `pnpm-workspace.yaml` carries `allowBuilds: esbuild: true`. Without it pnpm 11 blocks
  esbuild's postinstall and then *every* `pnpm <script>` fails on the pre-script dependency
  check, not just the build. Do not delete it.
- The directory name contains a space. Quote paths in every shell command.
- Stylelint runs `no-descending-specificity`. Order rules **base → animation → state → variant**
  for the same element (`.rung__price`, then `.ladder--morphing .rung__price`, then
  `.ladder[data-mode="time"] .rung__price`), or the check goes red on ordering alone.
- Class names are BEM, enforced by a `selector-class-pattern` override in `.stylelintrc.json`.
- Beware DOM globals when naming variables — `status`, `name`, `length`, `top`, `closed` and
  friends already exist on `window`.
- Our tests read `index.html` through Vite's `import x from '../file.html?raw'` rather than
  `node:fs`: it reads the same file the build ships, and stays honest if the entry ever moves.
- `src/interaction.test.ts` runs under jsdom and loads the real `index.html`. `main.ts` wires
  itself at import time, so each test resets the body **and** calls `vi.resetModules()` before
  re-importing — otherwise every test after the first drives the first test's page.

## The course sensors

**What gets marked is the deployed site**, live in Chrome at 1920×1080 and 390×844 — both count
in full — plus the process evidence below. Not this working copy. CI
(`.github/workflows/checks.yml`) runs on every push *once the repo is public*; while it is private
the jobs stay skipped and `pnpm check` is the same roster, faster.

| Sensor | What it measures | Where it runs |
| --- | --- | --- |
| typecheck | `tsc --noEmit`; a red here is a false claim in the code | `pnpm check` + CI |
| build | the site must build, or the deploy is stale | `pnpm check` + CI |
| spec | `spec/invariants.test.ts` against **built** `dist/`: lang, title, viewport, a `<nav>`, exactly one `<h1>`, alt on every image | `pnpm check` + CI |
| lint | `oxlint` for TS, `stylelint` for CSS | `pnpm check` + CI |
| tests | everything in `src/**/*.test.ts` | `pnpm check` + CI |
| evidence | `pnpm check:evidence` — PROCESS.md citations resolve, `reflections/assignment-1.md` exists, `CLAUDE.md` exists | CI (run it locally too) |
| links | `pnpm dlx linkinator ./dist --silent` | CI only |
| secrets | trufflehog, plus `.githooks/pre-commit` locally | CI + local hook |

When a check fails, read its output before changing anything: the failure message names the file
or the contract. A red check is authoritative — the page is wrong until it is green, not until we
decide it should be. Never commit a red state.

Nothing here measures accessibility or performance. Those are ours to wire.

## Working method

Work incrementally. For each substantial phase:

1. Inspect the current state (including `git status`).
2. Explain what you intend to change.
3. Keep the scope small.
4. Implement.
5. Run checks.
6. Verify the result — open the rendered page, do not assume it looks right.
7. Report what changed.
8. Say whether the moment belongs in `PROCESS.md` or as a new rule here.

**Do not build the entire project in one pass.**

When the same failure recurs: diagnose it, change a rule here or a test or an invariant, *then*
fix it, verify, and commit. A fix with no rule behind it will be re-broken.

## Git discipline

- Inspect the repo and `git status` before substantial work.
- Commit at meaningful milestones, with the checks green. Never commit a red state.
- The history must grow alongside the project — **do not collapse the work into one final
  commit.** The commit history is assessed.
- Preserve unsuccessful but meaningful iterations. Prototype v0 is evidence, not clutter.
- No remote push without explicit approval, branch by branch.

## Process artefacts

These are part of the mark and are maintained *throughout*, never written at the end:

- **`PROCESS.md`** — 400–600 words, only **3–4 strong moments**. A moment qualifies when we
  identified a failure, diagnosed why, changed a rule, added a check, rejected an approach, or
  verified an output before accepting it. Each moment states: what we assumed → what went wrong →
  what we changed → how we verified. **Every moment carries a citation** whose link text is the
  commit hash or range and whose target is this repo's commit or compare URL:
  ``[`f0a1874`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-GuangdeShi/commit/f0a1874)``.
  A marker follows the citations and does not trawl the history for evidence we did not point at;
  `pnpm check:evidence` fails if a cited SHA does not resolve, or if none is cited at all.
- **`CLAUDE.md`** — this file. Grow it when a recurring constraint or mistake appears. The gap
  between the course boilerplate and this file is itself read as evidence.
- **`reflections/assignment-1.md`** — the reflection, centred on the project's main
  breakthrough: where the interactive idea became clear or materially improved. The filename is
  checked against the deliverable this repo is for; it must stay `assignment-1.md`.
- **Never fabricate process evidence.** A moment that did not happen, or a citation to a commit
  that does not contain what the moment claims, is worse than a thin file.
