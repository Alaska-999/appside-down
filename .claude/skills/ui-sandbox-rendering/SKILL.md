---
name: ui-sandbox-rendering
description: Use when you need to prototype, render, or preview a mobile screen's visual design (layout, mockup, comparison of variants) in a browser tab before touching production code. This is the required first step for any screen redesign in this app — mockup in the browser, get approval, THEN port to RN/Tamagui.
---

# UI Sandbox Rendering

## Overview

This app's design-system redesign follows a strict rule: **never guess a visual design directly in RN/Tamagui code.** Iterate on layout, spacing, and color in a browser first — it's faster to eyeball and cheaper to change than a native rebuild loop. This was learned the hard way: 5+ blind code-first iterations on the Home screen produced "muddy/broken" results before switching to browser-mockup-first converged in 3 rounds.

This skill is a thin wrapper around **`superpowers:brainstorming`**'s visual companion tool — it does not reimplement anything. `superpowers:brainstorming` already owns: starting the server, the screen directory convention, the one-question-at-a-time dialogue for refining a design, and getting explicit approval before implementation.

## When to use this vs. inline HTML tricks

Any time a screen's visual design isn't yet approved — a new screen migration, a palette/layout variant comparison, a fix to a reported visual discrepancy — use this skill. Do not write throwaway design HTML outside the sandbox convention; it fragments where mockups live and this project has already had one incident of losing an untracked mockup file for exactly that reason.

## Process

1. **Invoke `superpowers:brainstorming`** with the concrete screen/change to design (e.g. "Library screen redesign, extending the Aurora bento visual language established on Home"). Let that skill run its normal flow: explore context, ask clarifying questions one at a time, offer the visual companion just-in-time.
2. When the companion is accepted, mockups get written as content-fragment HTML files under the session's `screen_dir` (via `scripts/start-server.sh --project-dir <repo>`, from the brainstorming skill's own scripts) and served at a keyed localhost URL. **Always write a new versioned filename per iteration** (e.g. `library-v2.html`, never overwrite `library-v1.html`) — the server always shows the newest file by mtime, and overwriting destroys the ability to compare iterations.
3. **Do not proceed to porting code until the user has explicitly approved the rendered mockup.** This mirrors the project's Step 2→Step 3 gate: approve the sandbox layout/vibe/components first.
4. Once approved, **copy the final mockup HTML to `docs/superpowers/mockups/`** (a durable, git-tracked location) before handing off to implementation. Files left only in `.superpowers/brainstorm/*/content/` are ephemeral scratch — the brainstorm server has deleted mockups it didn't recognize before. `docs/superpowers/mockups/` is the source of truth the Systems Engineer agent reads exact CSS values from during the port.

## What this skill does NOT do

- It does not decide the visual direction for you — that's a collaborative dialogue with the user (via `superpowers:brainstorming`) or the `design-visionary` agent's critique, not something to auto-generate.
- It does not touch production code — the moment you're editing `app/` or `src/components/`, you've moved to the `systems-engineer` agent's job, and the zero-hallucination style-extraction rule applies (copy exact values from the approved mockup file, don't reinvent).
