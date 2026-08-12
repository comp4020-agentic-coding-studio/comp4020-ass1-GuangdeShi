# Bazi — Eight Characters, One Moment of Birth

An interactive experimental website about **Bazi (八字 / Four Pillars of Destiny)**, built for
**COMP8020 Assignment 1**.

The site introduces Bazi as a cultural and cosmological idea rather than a fortune-telling
service. The intended journey:

1. Landing page and a brief introduction to Bazi
2. The user enters their birth date and birth time
3. The site generates their Four Pillars / Eight Characters
4. The Five Elements are visualised
5. A short, lightweight personality interpretation

## Scope

The project deliberately explains only:

- what Bazi is
- what the Eight Characters represent
- how Heavenly Stems, Earthly Branches and the Five Elements relate
- a simple personality interpretation

Out of scope by design: Zi Wei Dou Shu, fortune / marriage / wealth prediction, ten-year luck
cycles, annual fortune, and professional-level Bazi interpretation.

## Stack

Plain HTML, CSS and TypeScript on [Vite](https://vite.dev/) — no UI framework. The build
output is static files, so it can be hosted anywhere.

| Command | What it does |
| --- | --- |
| `pnpm install` | Install dependencies |
| `pnpm dev` | Start the local dev server |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm build` | Produce `dist/` |
| `pnpm preview` | Serve the built `dist/` locally |
| `pnpm check` | `typecheck` then `build` |

## Structure

```
index.html          the page shell
src/main.ts         entry point, mounts components
src/data/           stem / branch / element reference data
src/components/     per-section render + interaction modules
src/styles/         design tokens, base layer, component styles
```

## Status

Phase 1 in progress: landing page and visual foundation.
