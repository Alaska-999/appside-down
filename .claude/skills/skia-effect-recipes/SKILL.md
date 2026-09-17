---
name: skia-effect-recipes
description: Use when implementing any elements-v1 visual effect in React Native — liquid glass, lamp-lit cards, 1px gradient borders, conic/radial gradients, inner shadows, glow, grain, wells — and need the CSS→RN/Skia technique mapping and the exact approved recipes.
---

# Skia effect recipes (elements-v1 → RN)

Source of truth for every value: `docs/superpowers/mockups/elements-v1.html` (1 px = 1 pt, no scaling). This skill maps its CSS mechanisms to RN techniques and pins the core recipes. Stack: @shopify/react-native-skia 2.2.12 (never bump manually), expo-blur via `src/components/ui/LiquidGlass.tsx` (single entry point), Reanimated 4.1.1.

## Technique mapping (CSS → RN)

| CSS in mockup | RN technique |
|---|---|
| `backdrop-filter: blur(N)` | expo-blur BlurView. Intensity mapping: blur 7px ≈ 18–25, 9–10px ≈ 25–35, 14–16px ≈ 40–50, 22–26px ≈ 60–80. Fill over BlurView must stay ≤ ~0.7 alpha or the glass disappears |
| `saturate()/brightness()` in backdrop-filter | Skia BackdropFilter with Blur + ColorMatrix for the approved lens; cheap emulation elsewhere: BlurView + `rgba(255,255,255,.06–.1)` overlay |
| 1px gradient border (`mask-composite: xor`) | Skia Path = outer RRect ⊖ inner RRect filled with LinearGradient — build ONE reusable `GradientBorder` component (used ~40×). expo-linear-gradient wrapper hack breaks transparency — don't |
| Multi-layer `radial-gradient` lamps/backgrounds | Skia Canvas: Rect/Circle + RadialGradient (+ Matrix scale for ellipses) + Blur. One canvas per screen background |
| `conic-gradient` (rings, rotating borders) | Skia SweepGradient; progress rings = Path + strokeCap + SweepGradient; rotation via useDerivedValue |
| Multiple `inset` box-shadows | Skia InnerShadow (mandatory for `inset 0 0 30px` bloom); 1px top/bottom highlights can be 1px absolute Views |
| Drop shadows with negative spread | Skia DropShadow (cross-platform exact); iOS-only fallback: shadowRadius ≈ blur/2, lower opacity to fake spread |
| `filter: blur(24–56px)` on glow blobs | Skia Blur ImageFilter / BlurMask |
| `filter: saturate()` = vivid scale | Skia ColorMatrix, or precomputed muted colors + opacity for simple cases |
| `background-clip: text` gradient text | Skia Paragraph with LinearGradient paint, or existing `GradientText` (MaskedView) |
| Sheen / background-position animation | Reanimated translateX on a gradient layer inside `overflow:hidden`; Skia shader with time uniform for stripes/wordmark |
| feTurbulence grain (opacity .055–.07) | Skia Turbulence/FractalNoise shader (baseFrequency 0.9, numOctaves 3) or pre-baked noise PNG tile |
| stroke-dasharray arc animation | Skia Path `start`/`end` props (simpler than react-native-svg dashoffset) |
| Animated counters (`@property --n`) | Reanimated withTiming + useDerivedValue + ReText/Skia text, easing `bezier(.2,.8,.3,1)` — number must finish EXACTLY with its arc/bar |
| SkSL displacement refraction (`filter:url(#glassCard)`) | Skip unless visually missing — the approved 44px lens (R6) does not need it |

## Core approved recipes

**Lamp card (`glow`)**: bg `rgba(20,28,34,.55)` + backdrop blur 14 saturate 1.3 + radial lamp `128% 96% at 8% -10%, rgba(45,212,191,.22) → transparent 56%` + 1px gradient border `138deg rgba(94,234,212,.48) → .07 46% → rgba(220,255,245,.03)`, radius 23. Lamp colors: mint (default), teal `rgba(13,148,136,.3)`, lime `rgba(163,230,53,.2)`, indigo `rgba(99,102,241,.2)`.

**Liquid lens 44px (approved header IconButton)**: circle 44, bg `rgba(220,255,245,.03)`, blur 7 saturate 1.6 brightness 1.14; insets: top `0 1px 0 rgba(255,255,255,.34)`, bottom `0 -1px 0 rgba(120,220,255,.16)`, left `1px 0 0 rgba(255,190,220,.1)`; drop `0 3px 10px -4px rgba(0,0,0,.7)`; border `160deg rgba(255,255,255,.5) → .04 44% → rgba(150,220,255,.24)`; icon 22px stroke 1.9 `#EAF7FF`; press scale .9 / 160ms + hapticTap. **Works only over a gradient** — solid-black screens use the secondary fallback.

**Well (input/absorbing surface)**: bg `rgba(4,7,10,.5)`, NO backdrop-filter, `inset 0 2px 9px rgba(0,0,0,.6)` + `inset 0 -1px 0 rgba(220,255,245,.06)`, border `180deg rgba(0,0,0,.5) → rgba(220,255,245,.11)`, radius 16. Focus: translateY(-1), ring `0 0 0 1.5px rgba(94,234,212,.7)` + `0 0 26px -4px rgba(45,212,191,.55)`.

**Light scales**: glow 0…4 = lamp alpha `0/.14/.26/.42/.62`, border alpha = lamp × 2.1. vivid 0…4 = saturate `.15/.55/1/1.6/2.4`.

**Press scales**: card .982, row .978 (lamp .20→.32 за 170ms), button .965, icon button .92, lens .9, FAB .9 — all `cubic-bezier(.2,.8,.3,1)` + hapticTap.

## Implementation order that minimizes risk

1. Tokens + flat colors/shadows → 2. screen background meshes (one Skia canvas per screen) → 3. `GradientBorder` Skia component → 4. glass via expo-blur with intensity tuning → 5. Skia InnerShadow for liquid recipes → 6. SkSL refraction only if visually missing.

## Rules

- Максимум один анімований елемент у видимій області; світляки/спалахи — тільки на фініші.
- Every rgba/size comes from elements-v1 CSS verbatim — no rounding, no inventing.
- `useReducedMotion()` → render the static 0% state.
