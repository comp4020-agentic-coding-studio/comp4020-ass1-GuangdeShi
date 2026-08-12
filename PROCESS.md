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

*Further moments are added as they occur, not reconstructed at the end.*
