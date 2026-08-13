# Process

Four moments where something went wrong or a rule changed.

---

## Moment 1 — The repository I was told to use did not exist

**Assumed.** The brief said to inspect *the existing repository* and push to its remote, so one
must exist.

**Went wrong.** It didn't. The only active repo was `comp4020-riff2-liuru-3` — a riff on another
student's CBETA prototype, on a shared org remote. The obvious move (the working directory *was* a
git repo, the topic even adjacent East Asian material) would have replaced classmate-derived work
with an unrelated site. Adjacent is not related.

**Changed.** I stopped and asked where the project should live, then wrote it into `CLAUDE.md` as a
rule rather than trusting my memory: own path, never reuse a repository or remote, no remote at
all until explicitly approved.

**Verified.** Confirmed the riff repo untouched — clean tree, `HEAD` still `cad8082`. I audited the
wrong-but-harmless directory I had scaffolded — only my files, zero commits — before deleting it.

---

## Moment 2 — A blocked postinstall broke every script, not just the build

**Assumed.** `Ignored build scripts: esbuild` looked like advisory noise.

**Went wrong.** `pnpm typecheck` failed with a pnpm stack trace, not a type error: pnpm 11 re-runs
a dependency check before *every* script, and the unapproved build makes it exit non-zero. Worse,
a stray `echo "TYPECHECK OK"` chained after a piped command printed anyway — the exit status came
from `tail`, so the transcript briefly claimed a pass that had not happened.

**Changed.** `allowBuilds: esbuild: true` in `pnpm-workspace.yaml`, taken from the course
template, not invented. Two rules followed: the diagnosis lives in `CLAUDE.md`, and success
is never announced by an `echo` — only by a check's own exit status.

**Verified.** Re-ran the checks bare; `typecheck` then failed honestly on a real error (`status`
collides with `window.status`). A red check that tells the truth is the point of having one.

---

## Moment 3 — Two sources disagreed about a day pillar, and my code agreed with one of them

**Assumed.** The day pillar is arithmetic on a day count — the least controversial of the four.

**Went wrong.** For 1990-06-15 one source gave 己酉, another 辛亥. Mine produced 辛亥. The tempting
move — cite the agreeing source and ship — is circularity with a footnote.

**Changed.** I built an oracle sharing no code with the implementation: three independently
sourced anchors (1949-10-01 = 甲子, 2019-01-27 = 甲子, 2000-03-01 = #55) plus elapsed-day
arithmetic. All converge on 辛亥; 己酉 is off by twelve. Where sources genuinely conflict — the
yin/yang of 子, 巳, 午, 亥 — `sexagenary.ts` stores both inputs, the page shows only what is
uncontested, and `calculate.ts` names the fork. Six are labelled there.

**Verified.** A permanent test block, with the disputed date asserted by name: *"settles the
disputed date: 1990-06-15 is 辛亥, not 己酉"*.

---

## Moment 4 — One input does not mean one pillar

**Assumed.** Phase 2's change feedback looked mechanical: the visitor edits the hour, the Hour
Pillar lights up.

**Went wrong.** The first test of a one-day change expected one moved pillar and got two — the
hour *stem* is derived from the day stem (五鼠遁), so it moves when the clock is untouched. Then a
one-year change contradicted me the other way: I expected all four to move, and the Hour Pillar
sat still. Across a common year the day stem advances 5, and 2 × 5 ≡ 0 (mod 10), so the hour stem
lands back on itself.

**Changed.** The wrong model *was* the thing worth teaching. `describeChanges` now marks each
moved pillar `inherited` or not, and the page says "moved into the 辰 hour" versus "the day stem
moved, so the hour stem followed it (五鼠遁)" — the coupling is the explanation, not a footnote.

**Verified.** Tests pin both couplings *and* the cancellation, which looks like an oversight until
asserted. Rendering the page headless at 1280px and 320px caught what tests could not: the badge
read "moved · moved 1 day", and 乙未 broke across two lines.

---

*Further moments are added as they occur, not reconstructed at the end.*
