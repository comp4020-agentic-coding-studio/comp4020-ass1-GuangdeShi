# CLAUDE.md — development harness

Orientation for whoever works in this repo, human or agent. These are rules, not
suggestions: prefer fixing a rule here over re-prompting until something works.

## What this project is

**COMP8020 / COMP4020 Agentic Coding Studio — Assignment 1.**

The brief: *build an interactive explainer of something you think more people should know or
understand.*

The topic is **Bazi (八字 / Four Pillars of Destiny)**. The one idea:

> **A moment of birth can be encoded into eight Chinese characters.**

The site interactively explains how a birth year, month, day and hour become the Four Pillars
and Eight Characters, and how those characters relate to the Five Elements.

It is an **interactive explainer, not an online fortune-telling service.**

## Where this project lives

```
/Users/my_mac/Developer/COMP8020/Assignment1/Assignment1 Creative Web
```

This is an **independent** Assignment 1 project.

- **Never** modify C1, C2, riff2, CBETA, or any previous course project.
- **Never** reuse an existing git repository or an existing git remote.
- **Never** push to a repository belonging to another deliverable or another student.
- No remote is connected until the author explicitly approves one. (See PROCESS.md, moment 1 —
  this rule exists because the rule was nearly broken.)

## Scope rules

### In scope

1. What Bazi is.
2. What the Eight Characters represent.
3. How Heavenly Stems, Earthly Branches and the Five Elements relate.
4. A short, symbolic personality interpretation.

### Out of scope — do not build

Full fortune telling · Zi Wei Dou Shu · annual fortune · ten-year luck cycles (大运) · marriage,
wealth or career prediction · compatibility matching · bulk traditional astrology content.

### The feature test

Before adding anything, ask:

> Does this make the transformation **birth moment → Eight Characters** easier or more
> interesting to understand?

If the answer is no, do not add it. Technical possibility is not a reason.

## The core interaction

The visitor must actively do something that changes what they see:

> The visitor changes their **birth date and time** and watches that moment transform into the
> Four Pillars / Eight Characters and their Five Element representation.

Consequences of this being *the* interaction:

- Interaction must do **explanatory work**. Not decorative animation, not a form followed by a
  wall of generated text, not long static prose.
- Changing an input must visibly change the explanatory system, and the change should be
  legible as a *transformation* rather than a page swap.
- The interaction must be specific enough to write an automated test against. Keep the state
  transition in a pure, testable module, separate from rendering.

## Hard constraints

| Constraint | What it means here |
| --- | --- |
| **Static, client-side** | No backend, no server dependency, no runtime API calls. Must deploy to GitHub Pages as static files. |
| **One idea** | One strong idea with a clear point of view. Resist feature accretion. |
| **Desktop + phone** | Must work at both, and **survive resizing during interaction**. |
| **Keyboard accessible** | Every control keyboard-reachable, visible focus states, semantic HTML, understandable without a mouse. The marker may navigate by keyboard. |
| **Robust** | Usable on a slow connection. No unnecessarily heavy assets, no fragile interactions. |

### Accessibility specifics

- Use real semantic elements: `<button>`, `<input>`, `<label>`, `<fieldset>`. Do not put click
  handlers on `<div>`s.
- Never remove focus outlines; style them so they are clearly visible on the dark ground.
- Anything conveyed by colour (especially the Five Elements) must also be conveyed by text or
  shape. Element colour alone is not an accessible encoding.
- Respect `prefers-reduced-motion` for every animation.

## Design direction

**Contemporary East Asian mysticism + editorial design + interactive data visualisation.**

Prefer: strong typography · generous whitespace · black / warm off-white · restrained cinnabar
red · subtle motion · Chinese characters as major visual objects · diagrams and spatial
relationships that carry the explanation.

Avoid: stereotypical commercial fortune-telling aesthetics · excessive gold · bright red
backgrounds · cheap gradients · casino-like UI · crowded information panels.

**The design supports the explanation rather than overpowering it.**

## Stack and commands

Plain HTML + CSS + TypeScript on Vite. No UI framework — the interaction is small enough that a
framework would add weight without adding clarity.

```sh
pnpm install     # esbuild's postinstall is allowed via pnpm-workspace.yaml
pnpm dev         # local dev server
pnpm typecheck   # tsc --noEmit
pnpm test        # vitest run
pnpm build       # produce dist/
pnpm check       # typecheck && test && build — run before every commit
```

### Layers

```
src/bazi/types.ts        the shape of a chart
src/data/sexagenary.ts   verified lookup tables (stems, branches, elements)
src/bazi/solar.ts        solar longitude, Julian day, 立春
src/bazi/calculate.ts    the transformation — pure, no DOM
src/bazi/moment.ts       input strings → BirthMoment — pure, no DOM
src/components/*.ts      markup generation
src/main.ts              wiring only; no logic a test would want to reach
```

Anything a test would want to assert belongs above `main.ts`. If a rule ends up in `main.ts` or
in a component, move it down.

### Tooling notes

- `pnpm-workspace.yaml` carries `allowBuilds: esbuild: true`. Without it pnpm 11 blocks
  esbuild's postinstall and then *every* `pnpm <script>` fails on the pre-script dependency
  check, not just the build. Do not delete it.
- The directory name contains a space. Quote paths in every shell command.
- `strict` plus `noUncheckedIndexedAccess` are on deliberately: indexing the stem/branch
  tables is the most likely source of a silent off-by-one, and the compiler should catch it.
- Beware DOM globals when naming variables — `status`, `name`, `length`, `top`, `closed` and
  friends already exist on `window`, and TypeScript reports the collision as a confusing
  redeclaration error rather than a shadowing warning.
- `@types/node` is deliberately absent, so `node:fs` and friends do not typecheck. To read a file
  in a test, use Vite's own `import x from '../file.html?raw'` — it is typed by `vite/client` and
  reads the same file the build ships.
- `src/interaction.test.ts` runs under jsdom (`@vitest-environment jsdom` docblock) and loads the
  real `index.html`, so a renamed id or a deleted input fails a test rather than only failing in
  a browser.

## Verifying Bazi rules

Bazi has genuine forks where schools disagree, and published sources contradict each other. Two
standing rules, both earned (PROCESS.md, moment 3):

- **Never accept a source because it agrees with the code.** Verify against an oracle that shares
  no code with the implementation — the day pillar is checked by elapsed-day arithmetic from three
  independently sourced anchors, not by re-running the Julian-day formula.
- **Never silently resolve a disagreement.** Where sources genuinely conflict, store both inputs,
  display only what is uncontested, and name the fork in the conventions block at the top of
  `calculate.ts`. Six forks are labelled there; keep that list current.

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

## Git discipline

- Inspect the repo and `git status` before substantial work.
- Commit at meaningful milestones, with the checks green. Never commit a red state.
- The history must grow alongside the project — **do not collapse the work into one final
  commit.** The commit history is assessed.

## Process artefacts

These are part of the mark and are maintained *throughout*, never written at the end:

- **`PROCESS.md`** — 400–600 words, only **3–4 strong moments**. A moment qualifies when we
  identified a failure, diagnosed why, changed a rule, added a check, rejected an approach, or
  verified an output before accepting it. Each moment states: what we assumed → what went wrong
  → what we changed → how we verified.
- **`CLAUDE.md`** — this file. Grow it when a recurring constraint or mistake appears.
- **`reflections/assignment-1.md`** — the reflection, centred on the project's main
  breakthrough: where the interactive idea became clear or materially improved.
