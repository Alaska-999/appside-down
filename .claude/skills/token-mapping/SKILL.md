---
name: token-mapping
description: Use when you find hardcoded style values (hex colors, raw px numbers for spacing/radius, one-off rgba shadows) inline in a component, and need to decide whether to promote them into tamagui.config.ts tokens or leave them as an intentional literal. Use after visual work has been approved and ported — this is a refactor/cleanup pass, not a design-decision step.
---

# Token Mapping

## Overview

This codebase's design-system principle: **every recurring visual value becomes a token; every one-off value stays a literal, explicitly.** The failure mode this skill guards against is silent hardcoding — a color or spacing value typed directly into a component that should have been a shared token, so the next screen re-invents it slightly differently and the app drifts out of visual consistency.

The equally real opposite failure mode: forcing everything into named tokens even when a value is genuinely mockup-specific and won't recur (e.g. a mockup's `12.5px` chip font-size that has no matching `$`-scale step). Forcing that into a fake token (`chipTitleSize: 12.5`) used in exactly one place adds indirection with no reuse benefit. Read `docs/superpowers/mockups/` for the value's origin before deciding — if the mockup shows the same number reused across 2+ tile types, it's a token; if it's local to one component, a literal with a comment citing the mockup class it came from is correct and simpler.

## Token categories already established in `tamagui.config.ts`

- `tokens.color` — base palette (e.g. `mint`, `lime`, `auroraBg`, `heroIndigo`). Per-theme semantic roles (`accentGradientStart/End`, `glassBg`, `glassBorder`, `glowColor`, `colorMuted`, etc.) live in the `light`/`dark` theme objects and reference these base colors — don't reference a base color directly from a component; go through the semantic theme token so light/dark both resolve correctly.
- `tokens.space` — custom semantic spacing (`screenX`, `section`, `cardPad`) alongside Tamagui's default `$0`-`$20` scale.
- `tokens.radius` — custom semantic radii (`card`, `cardSoft`, `control`) alongside the default `0`-`12` scale.

## Process

1. **Find the hardcoded value.** Typically surfaces as a literal hex (`"#2dd4bf"`), a raw `rgba(...)` shadow/border, or a bare number passed to `br`/`p`/`fontSize`/etc. where a token would normally go.
2. **Check if a token for this value (or role) already exists** before adding a new one: `grep -n "<value>" tamagui.config.ts`, and check both the base `color`/`space`/`radius` blocks and the per-theme semantic assignments. Duplicating a token under a new name is worse than reusing the existing one.
3. **Decide token vs. literal** using the reuse test above. If it's genuinely one-off, leave it as a literal — but add a short comment citing the mockup source (e.g. `// .chip-dot font-size, home-palette-v1.html`) so a future reader knows it's an intentional exact-match, not an arbitrary guess.
4. **If it should be a token:**
   - Add the base value to `tokens.color`/`tokens.space`/`tokens.radius` in `tamagui.config.ts`, with a short comment on where the value comes from.
   - If it's color and needs to differ between light/dark, add the semantic role to **both** theme objects (`light` and `dark`), even if one side is a placeholder inherited from an existing neutral — don't add a token to only one theme.
   - Replace the hardcoded literal at every call site with the token reference (`$tokenName` in JSX props, `tokens.color.tokenName`/`theme.tokenName.get()` in TS).
5. **Verify no regressions:** `npx tsc --noEmit` must stay clean. Grep for the old literal value across `src/` and `app/` to confirm no other component still hardcodes the same thing you just tokenized.

## Common mistake to avoid

Don't rename or repurpose an existing token's *value* to fix one component without checking every other consumer first (`grep -rn '\$tokenName\b' src app`) — tokens in this codebase are shared across screens, and a value change for one screen's sake can silently shift another already-approved screen's appearance.
