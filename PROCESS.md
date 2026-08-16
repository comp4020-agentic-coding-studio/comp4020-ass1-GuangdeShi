# Process

## Moment 1 — A successful prototype answered the wrong question

My first direction was an interactive BaZi (Four Pillars of Destiny) explainer. The agent implemented what I asked for: visitors entered a birth date and time, and the page returned the Eight Characters and a personality reading. Technically, it worked.

The problem was that the interaction explained very little. The input disappeared into a black box and a verdict came back. Explaining why that result existed would have required Heavenly Stems, Earthly Branches, Five Elements, calendrical boundaries, and traditional interpretation rules. I realised that a working interaction was not automatically a good response to a brief asking for an explainer.

Instead of polishing the prototype, I stopped the direction and preserved it in Git. This changed the project criterion: interaction had to carry the explanation, not merely trigger an output.

**Evidence:** [`0b38c37...f0a1874`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-GuangdeShi/compare/0b38c37...f0a1874)

## Moment 2 — Familiar interface patterns pulled the agent toward a shop

Life Cost began with products, prices, and a MONEY ↔ TIME switch. Once a catalogue appeared, the agent naturally moved toward familiar e-commerce patterns. Product cards, currency switching, and shopping-like controls were individually reasonable, but together they made the experience feel like browsing a store rather than questioning what a price represents.

Instead of repeatedly asking the agent to "make it less like a shop", I tightened the harness. `CLAUDE.md` was updated so every visible interaction had to support the money-to-time explanation, while cart, checkout, quantity, and unnecessary purchase mechanics were explicitly out of scope.

The toggle was removed and time became the dominant visible currency. This made the scope easier to judge: if a feature did not strengthen the core idea, it did not belong.

**Evidence:** [`4f011de...7f8f50d`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-GuangdeShi/compare/4f011de...7f8f50d)

## Moment 3 — Correct numbers were not automatically good explanations

The duration formatter exposed a different problem. A private jet could evaluate to about **1,420 working years**. The number was mathematically correct, but the agent initially treated the formatting problem as one of making large values shorter and introduced `working lifetimes`.

I tested that representation and rejected it. Counting "lifetimes" added a stronger judgement than the project needed, while the huge number of working years already communicated the point: this purchase sits far beyond an ordinary human working life. The final rule therefore keeps working years uncapped when the magnitude itself is explanatory.

Tests still protect the arithmetic and unit boundaries. The correction was not about making the number smaller, but about choosing the representation that best communicates scale.

**Evidence:** [`4f011de...38e0e6c`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-GuangdeShi/compare/4f011de...38e0e6c)

## Moment 4 — Verification stopped the agent from fixing a false bug

During mobile verification, a 390×7000 headless screenshot appeared to contain missing product images. The obvious response was to modify the responsive CSS or image-loading code. Instead, I asked the agent to reproduce the failure under the actual marking viewport before touching the implementation.

At 390×844 and in shorter captures, every image rendered correctly. The failure came from the headless screenshot environment trying to decode too many images in one unusually tall capture, not from the website.

No product code was changed. The incident became a harness rule: unusual automated failures must be reproduced under realistic marking conditions before they trigger implementation changes. This prevented a false positive from creating a real regression.

**Evidence:** [`1b781b0`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-GuangdeShi/commit/1b781b0)
