# Reflection — Assignment 1

> **Status: in progress.** This file grows alongside the project. Its final subject is the
> project's main **breakthrough** — the moment the interactive idea became clear or materially
> improved — which may also be discussed in the Week 4 retro.

## The idea I started with

Bazi is usually met in one of two registers: as a commercial fortune-telling service, or as
something too esoteric to approach. Both hide the part I find genuinely interesting, which is
structural rather than predictive:

**a moment in time can be encoded into eight characters.**

A year, a month, a day and an hour each become a pillar; each pillar is a Heavenly Stem written
above an Earthly Branch; the ten stems and twelve branches cycle against each other, and every
one of them carries one of the Five Elements. The result is a compact, rule-governed
representation of an instant — closer to a positional notation or a checksum than to a horoscope.

That framing is the point of view I want the site to have. Not "here is what your future holds",
but "here is a system, watch your own birth moment pass through it."

## What I expect the hard part to be

Not the calculation. The hard part is making the *interaction* carry the explanation. It would be
easy to build a form that emits eight characters and a paragraph, and that would explain almost
nothing — the visitor would learn that a machine can produce characters, not how a moment becomes
them. The transformation itself has to be visible.

## Candidate breakthrough (to confirm)

Recording this early so I can check later whether it held:

I suspect the project turns on treating the birth input as a **continuous control over a visible
system** rather than as a form to submit. If changing the hour makes one pillar visibly re-cycle
while the others hold still, the visitor can *see* which part of the encoding each part of the
moment is responsible for — the explanation comes from the coupling between input and diagram,
not from prose beside it.

Whether that is the real breakthrough, or whether it arrives somewhere I haven't anticipated,
gets written here when it happens.

## First check against a working build (Phase 1)

Partly held, and it sharpened.

The "continuous control" instinct turned out to be right in a specific, testable way rather than a
vague one. Two decisions made it real. First, **no submit button**: the chart recomputes on every
`input` event, including keyboard arrow-key nudges, so the chart reads as a *function* of the
moment instead of a result the page hands back. Second, **no empty initial state**: the page opens
already showing a known moment, so the first thing a visitor sees is the finished encoding, and
their first interaction is a *change* to something that already makes sense — not filling in a
blank.

What I hadn't anticipated is that the strongest explanatory element is not the eight characters at
all. It is the small derivation list underneath them — solar longitude, which Bazi year the moment
belongs to, which solar month, which position out of sixty. Those lines are what turn the output
from an oracle into a derivation. Watching "1989" appear for a birth dated January 1990, with the
reason given (before 立春), teaches more about how the system works than the characters do. The
next phase should probably invest there: make the boundary crossings *visible in motion*, not just
stated in text.

One risk this surfaced: the mechanism is now much better verified than it is designed. That is the
right order — the plain version already tells the truth, so the visual language can be built on
top of something I trust rather than around something I hope is correct.

## The breakthrough (Phase 2)

The interactive idea became clear at the moment a test failed for the right reason.

I had assumed the interaction was a mapping: four parts of the moment, four columns, edit one and
one column answers. The first change-detection test disagreed — moving the date by a single day
moved *two* pillars, because the hour stem is derived from the day stem (五鼠遁). Then a year
change disagreed in the opposite direction: I expected all four to move and the Hour Pillar stayed
put, because across a common year the day stem advances five, and doubling five returns to the
same stem modulo ten.

That is the breakthrough, and it is not a visual one. **The naive model a visitor arrives with is
wrong in a specific, demonstrable way, and the interaction is what exposes it.** Bazi is not four
independent readings of a timestamp; it is four scales, unevenly coupled, turning over at four
different kinds of boundary — 立春 for the year, a solar term for the month, 23:00 for the day, a
double-hour for the hour. Nobody would believe that from a paragraph. Watching the Day Pillar move
on its own while the Hour Pillar follows it, each saying which of the two happened, teaches it in
one edit.

So the design followed the finding rather than the reverse. Every changed pillar is labelled with
*why*, and the reason distinguishes "its own layer moved" from "the layer above moved and this one
followed" — in words, not only in colour. The 立春 example is deliberately two buttons that load a
date into the same inputs, so it teaches through the main mechanism instead of becoming a second
feature with its own chart.

What Phase 1 got right, in hindsight, was the order: the mechanism was verified before it was
designed, so the visual language could be built on something I trusted. What I would watch next is
restraint — the derivation line and the source notes are close to the limit of how much text can
sit under a set of characters before the characters stop being the object of attention.
