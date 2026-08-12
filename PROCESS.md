# Process

How this explainer got built, recorded as a small number of moments where something went wrong
or a rule changed. Kept to 3–4 moments; trivial steps are deliberately absent.

---

## Moment 1 — The repository I was told to use did not exist

**What we assumed.** The opening instruction was to inspect *the existing repository*, and the
brief ended with "push to the remote repository". Both presuppose a repo already set up for this
project.

**What went wrong.** There wasn't one. Searching the machine for anything Bazi-shaped returned
nothing. The only actively-developed repo was `comp4020-riff2-liuru-3`, last commit that same
evening — and it is not this project at all. It is a *riff* repo: a copy of another student's
crit prototype about CBETA, the digital Chinese Buddhist canon, on a shared
`comp4020-agentic-coding-studio` org remote. Its own `CLAUDE.md` says the brief is to take that
prototype somewhere new, "not to restart it."

The obvious-looking move — the working directory was a git repo with a remote, the topic was
even adjacent East Asian material — would have replaced classmate-derived work on a shared
remote with an unrelated site, and rewritten spec tests encoding someone else's brief. Adjacent
is not the same as related.

**What we changed.** Rather than guess, I stopped and asked where the project should live. The
answer was a new, independent directory, which became a written rule in `CLAUDE.md`: this
project lives only at its own path, never reuses an existing repository or remote, never touches
a previous deliverable, and **connects no remote at all until explicitly approved.** The rule is
in the harness rather than in my memory of this conversation, so it survives into every later
session.

**How we verified.** Before doing anything else I confirmed the riff repo was untouched — clean
working tree, `HEAD` equal to `origin/main` at `cad8082`, the same commit as before I looked. I
had scaffolded four files into a wrong-but-harmless location while the question was open; I
audited that directory (only my own files, zero commits) before deleting it, so nothing of the
user's was in it. The new directory was confirmed empty and remote-less before the first commit.

---

## Moment 2 — A blocked postinstall broke every script, not just the build

**What we assumed.** `pnpm install` reporting `Ignored build scripts: esbuild` looked like the
usual advisory noise, so the first move was simply to run the checks.

**What went wrong.** `pnpm typecheck` failed — but not with a type error. pnpm 11 re-runs a
dependency-status check before each script, that check re-runs `install`, and the unapproved
build script makes `install` exit non-zero. So the failure surfaced as a wall of pnpm stack
trace on an unrelated command, with the actual cause one line above it. Worse, a stray
`echo "=== TYPECHECK OK ==="` in the same shell chain printed *after* the failure, because `&&`
followed a pipeline whose exit status came from `tail`, not from `pnpm`. The transcript briefly
claimed a passing typecheck that had not passed.

**What we changed.** The fix itself was one file — `allowBuilds: esbuild: true` in
`pnpm-workspace.yaml`, matching how the course template solves it (I checked the template rather
than inventing a config). Two rules came out of it: the pnpm note now lives in `CLAUDE.md` so
the same stack trace is never re-diagnosed, and success is never announced by an `echo` chained
after a piped command — the check's own exit status is the only evidence.

**How we verified.** Re-ran `pnpm install` and watched esbuild's postinstall actually execute
(`postinstall: Done`), then ran the checks separately. `pnpm build` produced `dist/`; `pnpm
typecheck` then failed honestly, on a real error — `status` collides with the global
`window.status`, so `const status` reads as a redeclaration. Renaming it to `statusEl` cleared
it. A red check that tells the truth is the point of having it.

---

## Moment 3 — Two sources disagreed about a day pillar, and my code agreed with one of them

**What we assumed.** The rules would be checkable: look up the day pillar for a known date,
assert it in a test, move on. The day pillar is pure arithmetic on a day count, so it should be
the least controversial of the four.

**What went wrong.** For 1990-06-15 one source gave 己酉 and another gave 辛亥. My implementation
produced 辛亥. The tempting move was obvious and wrong: my formula matched a published source, so
I could have cited that source and shipped. But *agreeing with my own output* is not verification
— it is circularity with a footnote, and the assignment's accuracy rule is explicitly "do not
silently fake the calculation."

**What we changed.** I built an oracle that shares no code with the implementation. Three
independently sourced anchor dates (1949-10-01 = 甲子, 2019-01-27 = 甲子, 2000-03-01 = 戊午 / #55)
plus plain elapsed-day arithmetic must predict the same cycle position for any probe date. All
three converge on index 47 = 辛亥; 己酉 is off by twelve and cannot be reconciled with any anchor.
That oracle is now a permanent test block using `Date.UTC` differences, so it would still catch a
regression in the Julian-day formula it was built to audit.

The same rule then settled a second disagreement rather than hiding it. Sources split on the
yin/yang of 子, 巳, 午 and 亥 — positional parity says one thing, the polarity of the branch's main
hidden stem says the other. There is no neutral fact to look up, so `sexagenary.ts` stores both
inputs, the chart displays only the uncontested element, and `calculate.ts` names the fork in its
conventions block. Six such forks are now labelled there: timezone, year boundary, month
boundary, day boundary, branch polarity, and solar-term precision.

**How we verified.** 77 tests pass, and the disputed date is asserted by name — the test is
called *"settles the disputed date: 1990-06-15 is 辛亥, not 己酉"*, so the reasoning is readable
from the test list rather than buried in a commit message.

---

*Further moments are added as they occur, not reconstructed at the end.*
