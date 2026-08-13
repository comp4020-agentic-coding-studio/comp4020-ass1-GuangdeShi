# Everything has two prices

An interactive explainer of the **life cost** of what things cost, built for **COMP8020 /
COMP4020 Agentic Coding Studio, Assignment 1**.

The one idea:

> **Every price tag hides an amount of your life.**

You tell the page how you are paid. It works out what an hour of your life actually returns —
once the unpaid time the job costs you is counted — and then reprices a ladder of ordinary and
extraordinary objects in that second currency. A flat white stops being $6 and becomes sixteen
minutes. A house stops being a number with six digits and becomes twenty-four working years.

Nothing on the page is for sale. There is no cart, no checkout, no comparison of your salary to
anyone else's. The single interaction — **MONEY ↔ TIME** over the same unchanged objects — is the
explanation.

This is an **explanatory model, not an official economic or accounting measure.** It divides pay
by committed hours. It does not model tax, superannuation, benefits, overtime, or unpaid work
beyond the commute, and the page says so.

## Scope

In scope: what an hour of your life is worth in money · why that is lower than your stated wage ·
what ordinary and extraordinary objects cost when the price is read in hours · the scale between
the two ends of that ladder.

Out of scope by design: budgeting · investment or savings projections · salary benchmarking ·
e-commerce of any kind · shopping-cart simulation · "spend a billionaire's money" games.

## Structure

```
index.html                 the page shell — nav, hero, form, live regions, containers
src/life/types.ts          the shapes the explainer is built on
src/life/income.ts         pay → paid and life-adjusted hourly rates — pure, no DOM
src/life/duration.ts       money → hours → a duration a person can picture — pure, no DOM
src/life/parse.ts          form strings → numbers the model can refuse — pure, no DOM
src/data/products.json     the ladder: 20 objects, each with its price and its source
src/data/products.ts       the dataset, sorted by price at import
src/components/*.ts        view factories: build once, then update in place
src/main.ts                wiring only
src/styles/main.css        design tokens and the whole visual language
spec/                      the course invariants, run against the built dist/
scripts/check-evidence.ts  the course process-evidence check
```

## Commands

```sh
mise install    # the course's Node and pnpm versions (see mise.toml)
pnpm install    # also installs the pre-commit secret hook, via `prepare`
pnpm dev        # local dev server
pnpm check      # typecheck, build, oxlint, stylelint, vitest — run before every commit
pnpm check:evidence   # PROCESS.md citations resolve, reflection present, CLAUDE.md present
pnpm build      # produce dist/ (what gets deployed)
pnpm preview    # serve the built dist/ locally
pnpm dlx linkinator ./dist --silent   # reproduce CI's links check
```

## Prices

Prices are indicative Australian reference prices selected to illustrate scale, held locally in
`src/data/products.json` — nothing is fetched at runtime. Each entry names the kind of price it
is, and a checked price also carries the date it was checked. The objects at the top of the
ladder are single representative examples rather than market averages: there is no universal
price for a superyacht. A dataset test enforces the honesty of those fields, so a placeholder
cannot claim to have been checked.

## How this repo is assessed

The **deployed site** is the deliverable, marked live in Chrome at 1920×1080 and 390×844 — both
count in full. CI (`.github/workflows/checks.yml`) runs the same roster as `pnpm check`, plus the
links check, the secrets scan, the evidence check and the GitHub Pages deploy. Both CI jobs are
gated on the repo being public, so they stay skipped until the course `/ship` skill flips it.

The process is marked too: `PROCESS.md` (a cited reading-guide to the moments that mattered),
`CLAUDE.md` (the harness this project is built against), the commit history, and
`reflections/assignment-1.md`.

## Three histories, none rewritten

This repository carries the course template's history and the standalone prototype history,
joined with `--allow-unrelated-histories`, and then a second concept built on top:

- `bazi-prototype` — **Assignment 1 Prototype v0**, the BaZi explainer, its original five commits
  preserved unrewritten. It is the reason this concept exists: it showed that interaction alone
  is not explanation (see `PROCESS.md`, moment 1).
- `main` — the merge of the course template with that prototype history.
- `life-cost-v2` — **Prototype v1**, this concept.
