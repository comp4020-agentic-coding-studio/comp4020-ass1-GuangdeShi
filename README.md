# 八字 — how a moment becomes eight characters

An interactive explainer of **Bazi (八字 / Four Pillars of Destiny)**, built for **COMP8020 /
COMP4020 Agentic Coding Studio, Assignment 1**.

The one idea:

> **A moment in time becomes four layers, and eight characters.**

Chinese calendrical tradition reads a single instant on four scales at once — year, month, day,
hour — and each becomes a column of two characters. The four scales do not turn over together,
and that is what the interaction teaches: change the birth moment and watch *which* columns move,
and why. A pillar can move because its own layer moved, or because the layer above it did
(五虎遁, 五鼠遁).

This is an explainer of a calendrical system, **not a fortune-telling service**. Nothing here
predicts anything.

## Scope

In scope: what Bazi is · what the Eight Characters represent · how Heavenly Stems, Earthly
Branches and the Five Elements relate · the calendrical boundaries (立春, the 節 months, the 23:00
day boundary) that make the transformation non-obvious.

Out of scope by design: Zi Wei Dou Shu · fortune, marriage, wealth or career prediction ·
ten-year luck cycles (大运) · annual fortune · compatibility matching.

## Structure

```
index.html                 the page shell — nav, form, live region, output containers
src/bazi/types.ts          the shape of a chart
src/data/sexagenary.ts     verified lookup tables (stems, branches, elements)
src/bazi/solar.ts          solar longitude, Julian day, 立春
src/bazi/calculate.ts      the transformation — pure, no DOM
src/bazi/moment.ts         input strings → BirthMoment — pure, no DOM
src/bazi/explain.ts        which pillar moved and why — pure, no DOM
src/bazi/lichun.ts         the 立春 before/after comparison — pure, no DOM
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

## How this repo is assessed

The **deployed site** is the deliverable, marked live in Chrome at 1920×1080 and 390×844 — both
count in full. CI (`.github/workflows/checks.yml`) runs the same roster as `pnpm check`, plus the
links check, the secrets scan, the evidence check and the GitHub Pages deploy. Both CI jobs are
gated on the repo being public, so they stay skipped until the course `/ship` skill flips it.

The process is marked too: `PROCESS.md` (a cited reading-guide to the moments that mattered),
`CLAUDE.md` (the harness this project is built against), the commit history, and
`reflections/assignment-1.md`.

## Two histories

This repository carries two histories, joined with `--allow-unrelated-histories`: the course
template, and the standalone BaZi prototype built before this repository was available. The
prototype's original five commits are preserved unrewritten on the `bazi-prototype` branch as
Assignment 1 Prototype v0.
