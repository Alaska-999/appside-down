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

- Before sketching a new mockup, list the reusable primitives that already exist for the category you're touching (actual inventory, `src/components/`):
  - **Cards/surfaces:** `AppCard` (`ui/Card.tsx`), `GlowSurface`, `Badge`, `Chip`; domain: `FolderCard`, `ModuleCard`, `StreakCard` (`cards/`).
  - **Inputs:** `FormInput` (`common/FormInput.tsx`, variants bordered·glass·underline), `SearchField`, `CodeInput`.
  - **Buttons:** `AppButton` (`ui/Button.tsx`, 8 variants), `IconButton` (incl. `liquidGlass`).
  - **Sheets/glass:** `AppSheet` (`ui/Sheet.tsx`), `GlassSheet`, `LiquidGlass` (single expo-blur entry point), `CreateActionSheet`.
  - **Backgrounds/atmosphere:** `ScreenBackground`, `ScreenAtmosphere`, `AuroraGlow`, `AuroraBeams`, `MeshGradientBackground` (Skia).
  - **Misc:** `SegmentedControl`, `Toggle`, `AvatarRing`, `ProgressRing`, `Skeleton`, `StateCard`, `SyncingPill`, `GradientText`, `SectionTitle`, `FadeTabPanes`.
- Default assumption (the "elements with modes" architecture): a new screen's card/input/button/modal is a **`variant`/`size`/`tone` mode** of an existing component — plus the elements-v1 light scales **`glow 0…4`** and **`vivid 0…4`** as modes, never free-form style props. elements-v1 itself says: «Картки — одна сім'я, різні механіки — не окремі компоненти». Only design something genuinely new if the existing family truly can't express the use case — and say so explicitly when proposing the mockup, so the user can weigh in before it multiplies.
- When presenting mockup options to the user, note which existing component each option reuses vs. what it would newly introduce, so "which do you like" and "which is more reusable" aren't decided independently of each other.

## When to use this vs. inline HTML tricks

Any time a screen's visual design isn't yet approved — a new screen migration, a palette/layout variant comparison, a fix to a reported visual discrepancy — use this skill. Do not write throwaway design HTML outside the sandbox convention; it fragments where mockups live and this project has already had one incident of losing an untracked mockup file for exactly that reason.

## Process

0. **Cross-check against `docs/superpowers/mockups/elements-v1.html` before drawing anything.** This is the approved source of truth (затверджене 11.08.2026) for palette, tokens, light scales (glow/vivid), every element family, and the approved screens. Every new mockup must extend its language, not invent a parallel one. (`home-approved-screenshot.png` is the OLD design — an anti-reference now.)
1. **Invoke `superpowers:brainstorming`** with the concrete screen/change to design (e.g. "Library screen redesign, extending the Aurora bento visual language established on Home"). Let that skill run its normal flow: explore context, ask clarifying questions one at a time, offer the visual companion just-in-time.
2. When the companion is accepted, mockups get written as content-fragment HTML files under the session's `screen_dir` (via `scripts/start-server.sh --project-dir <repo>`, from the brainstorming skill's own scripts) and served at a keyed localhost URL. **Always write a new versioned filename per iteration** (e.g. `library-v2.html`, never overwrite `library-v1.html`) — the server always shows the newest file by mtime, and overwriting destroys the ability to compare iterations.
3. **Do not proceed to porting code until the user has explicitly approved the rendered mockup.** This mirrors the project's Step 2→Step 3 gate: approve the sandbox layout/vibe/components first.
4. Once approved, **copy the final mockup HTML to `docs/superpowers/mockups/`** (a durable, git-tracked location) before handing off to implementation. Files left only in `.superpowers/brainstorm/*/content/` are ephemeral scratch — the brainstorm server has deleted mockups it didn't recognize before. `docs/superpowers/mockups/` is the source of truth the Systems Engineer agent reads exact CSS values from during the port.
5. **Keep mockup iterations — do NOT delete old versions.** Comparing versions is part of the user's process (explicit instruction, overrides earlier retire-policy). Superseded files stay in `docs/superpowers/mockups/`; the way to know what's current is authority, not deletion: **`elements-v1.html` is the single approved source of truth**, and anything it contradicts is historical. When in doubt which file is authoritative, ask the user — never assume a stray file is current just because it exists.
6. **Scale rule: elements-v1-era mockups are 1:1.** `elements-v1.html` renders its phone frame at `width:393px; height:852px` and states «1 px = 1 pt» — copy CSS px values straight into RN points, NO multiplication. New mockups MUST use the same 393px frame so this stays true. The old `MOCKUP_SCALE = 390/N` constants (N = 235–290) still live locally inside pre-elements components (`SyncingPill.tsx`, `AuroraGlow.tsx`, `ProgressRing.tsx`, `AuthHeading.tsx`, etc.) — they were correct for the historical shrunk-frame mockups and must NOT be applied to elements-v1 values; during the reimplementation those constants get removed as each component is reworked.

## What this skill does NOT do

- It does not decide the visual direction for you — that's a collaborative dialogue with the user (via `superpowers:brainstorming`) or the `design-visionary` agent's critique, not something to auto-generate.
- It does not touch production code — the moment you're editing `app/` or `src/components/`, you've moved to the `systems-engineer` agent's job, and the zero-hallucination style-extraction rule applies (copy exact values from the approved mockup file, don't reinvent).
