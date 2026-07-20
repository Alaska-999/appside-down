---
name: ui-sandbox-rendering
description: Use when you need to prototype, render, or preview a mobile screen's visual design (layout, mockup, comparison of variants) in a browser tab before touching production code. This is the required first step for any screen redesign in this app — mockup in the browser, get approval, THEN port to RN/Tamagui.
---

# UI Sandbox Rendering

## Overview

This app's design-system redesign follows a strict rule: **never guess a visual design directly in RN/Tamagui code.** Iterate on layout, spacing, and color in a browser first — it's faster to eyeball and cheaper to change than a native rebuild loop. This was learned the hard way: 5+ blind code-first iterations on the Home screen produced "muddy/broken" results before switching to browser-mockup-first converged in 3 rounds.

This skill is a thin wrapper around **`superpowers:brainstorming`**'s visual companion tool — it does not reimplement anything. `superpowers:brainstorming` already owns: starting the server, the screen directory convention, the one-question-at-a-time dialogue for refining a design, and getting explicit approval before implementation.

## Reuse over proliferation — check existing components first

Before mocking up any new card/tile/surface, **input/field**, **button**, or **modal/sheet**, inventory what already exists and design as an extension of it, not a new one-off. This app has an explicit anti-pattern to avoid: ending up with many slightly-different styles of the same UI family across screens (e.g. Home's bento tiles, `FolderCard`, `ModuleCard`, generic `AppCard`/`GlowSurface` for cards; several near-identical text fields; per-screen button variants; per-flow modal chrome) instead of one flexible, parameterized family per UI category.

- Before sketching a new mockup, list the reusable primitives that already exist for the category you're touching:
  - **Cards/tiles:** `AppCard`, `GlowSurface`, `Card`, `FolderCard`, `ModuleCard`, `Badge`.
  - **Inputs:** `FormInput` (`src/components/common/FormInput.tsx`), `ImagePickerAvatar`.
  - **Buttons:** `Button`, `IconButton`.
  - **Modals/sheets:** `Sheet`/`AppSheet` (`plain` prop for header-less), `CreateActionSheet`.
  Check `docs/superpowers/mockups/` for how each was last used.
- Default assumption: a new screen's card/input/button/modal should be a **variant or prop** of an existing component (color accent, icon slot, size, border style, header vs. plain), not a visually distinct new component. Only design something genuinely new if the existing family truly can't express the use case — and say so explicitly when proposing the mockup, so the user can weigh in before it multiplies.
- When presenting mockup options to the user, note which existing component each option reuses vs. what it would newly introduce, so "which do you like" and "which is more reusable" aren't decided independently of each other.

## When to use this vs. inline HTML tricks

Any time a screen's visual design isn't yet approved — a new screen migration, a palette/layout variant comparison, a fix to a reported visual discrepancy — use this skill. Do not write throwaway design HTML outside the sandbox convention; it fragments where mockups live and this project has already had one incident of losing an untracked mockup file for exactly that reason.

## Process

0. **Cross-check against `docs/superpowers/mockups/home-approved-screenshot.png` before drawing anything.** This is an actual on-device screenshot of the finished, approved Home screen — the live ground truth for "does this visually belong in this app" (glow tightness, actual font rendering, real proportions), which the HTML mockups alone don't fully capture since they're pre-port intent. Every new mockup screen/component should be checked against it, not just against palette hex values.
1. **Invoke `superpowers:brainstorming`** with the concrete screen/change to design (e.g. "Library screen redesign, extending the Aurora bento visual language established on Home"). Let that skill run its normal flow: explore context, ask clarifying questions one at a time, offer the visual companion just-in-time.
2. When the companion is accepted, mockups get written as content-fragment HTML files under the session's `screen_dir` (via `scripts/start-server.sh --project-dir <repo>`, from the brainstorming skill's own scripts) and served at a keyed localhost URL. **Always write a new versioned filename per iteration** (e.g. `library-v2.html`, never overwrite `library-v1.html`) — the server always shows the newest file by mtime, and overwriting destroys the ability to compare iterations.
3. **Do not proceed to porting code until the user has explicitly approved the rendered mockup.** This mirrors the project's Step 2→Step 3 gate: approve the sandbox layout/vibe/components first.
4. Once approved, **copy the final mockup HTML to `docs/superpowers/mockups/`** (a durable, git-tracked location) before handing off to implementation. Files left only in `.superpowers/brainstorm/*/content/` are ephemeral scratch — the brainstorm server has deleted mockups it didn't recognize before. `docs/superpowers/mockups/` is the source of truth the Systems Engineer agent reads exact CSS values from during the port.
5. **Retire superseded mockup files immediately, don't leave them lying around.** When a mockup gets replaced by a later iteration (new file, or a variant block within an existing file), delete the old one from `docs/superpowers/mockups/` in the same pass — don't just add the new file next to it. This project has already had confusion from a stale draft (`home-bento-v7.html`) still sitting in `mockups/` after `home-palette-v1.html`'s `.v-aurora` block superseded it; a later agent almost treated the stale file as current. If a file referenced by an older plan/handoff/memory no longer exists, that's expected once it's been retired — don't restore it from ephemeral scratch without confirming with the user it's actually still wanted.
6. **Mockup px values are not 1:1 with device points.** These mockups render inside a shrunk phone-frame illustration (e.g. `.ph { width: 290px }`), not a real screen. Whatever scale factor is needed to map that frame to a real device width (documented in `tamagui.config.ts` as `MOCKUP_SCALE` once Home's pass established it) must be applied — and written down somewhere durable (a token file comment, this skill, or a memory) — the first time it's decided, not left as an undocumented one-off adjustment. An undocumented scale factor is indistinguishable from a mistake to whoever touches the code next, and got wrongly "corrected" away once already.

## What this skill does NOT do

- It does not decide the visual direction for you — that's a collaborative dialogue with the user (via `superpowers:brainstorming`) or the `design-visionary` agent's critique, not something to auto-generate.
- It does not touch production code — the moment you're editing `app/` or `src/components/`, you've moved to the `systems-engineer` agent's job, and the zero-hallucination style-extraction rule applies (copy exact values from the approved mockup file, don't reinvent).
