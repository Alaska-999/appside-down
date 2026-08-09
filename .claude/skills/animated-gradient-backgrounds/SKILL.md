---
name: animated-gradient-backgrounds
description: Use when building or tuning any animated gradient/aurora/mesh background in this app (splash, auth screens, ambient screen glow), when a gradient animation "looks dead/static", or when picking the technique for a new living-background effect.
---

# Animated gradient backgrounds

## The one rule that matters

**Alive = the colors themselves morph, not just blobs translating.** On 2026-08-09 the user rejected five straight iterations of position-only animation ("не виглядає живим геть зовсім") and instantly approved the first version where node positions drift AND each node's color cycles through the palette (mint→indigo→lime→teal). Both channels must animate continuously; sub-perceptual motion (blurred blobs, ±20pt over 9-14s) reads as static.

Working ranges from the approved mockups: node drift cycles 7-12s with per-node phase offsets, hue-cycle 9-12s, visible travel (screen-fraction, not pixels), plus a ~0.07-opacity fractal-noise grain pass (baseFrequency 0.9) for the premium film look.

## Recipes by context

**Browser mockup (sandbox iteration):** CSS registered `@property` custom props of type `<color>` and `<percentage>` animated in `@keyframes`, used inside stacked `radial-gradient()`s over a base `linear-gradient`. This is the only CSS way to animate gradient colors smoothly. Grain: SVG `feTurbulence` + desaturate overlay.

**React Native (this repo, no new deps):** two traps verified from react-native-svg 15.12.1 source (2026-08-09): (1) `Stop` renders null with NO native host view — `useAnimatedProps` on `stopColor` is a SILENT NO-OP, never animate gradient stops that way; (2) `FeTurbulence` is an unimplemented stub — SVG noise filters don't work. The working recipe (reference implementation: `src/components/ui/MeshGradientBackground.tsx`): one static-color gradient layer per color-keyframe state, stacked, cross-faded via `useAnimatedStyle` opacity with a cyclic tent-weight function (adjacent weights sum to 1 → true linear color blend); positions via `transform: translateX/Y` on wrapper Views only (never left/top); grain via pre-baked noise PNG tiled with svg `Pattern` (RN `Image` `resizeMode="repeat"` is iOS-only). `src/components/ui/AuroraBeams.tsx` is the cheaper transform-only variant when color morph isn't needed. Always `useReducedMotion()` → render the 0%-keyframe state statically.

**Skia route** (smoothest, GPU): INSTALLED 2026-08-09 (@shopify/react-native-skia 2.2.12 via `npx expo install`, user-approved; never bump manually — newer needs worklets ≥0.7 and breaks this stack). Native side bundled in Expo Go, no prebuild. Preferred for new living backgrounds: Canvas + RadialGradient nodes + Reanimated shared values via useDerivedValue (real color animation works here, unlike svg Stop), GPU Blur for silkiness, Turbulence shader for grain.

**expo-mesh-gradient** (true SwiftUI MeshGradient): iOS-only, new dependency, dev-build questions — propose to the user, never add silently.

## Tutorial index (user-vetted, 2026-08-09)

| Technique | Source |
|---|---|
| Animated gradient via interpolateColor | Software Mansion — "Animated Gradient Picker with RN Reanimated" (youtube _FehNLxxpRY) |
| Mesh gradient module | Code with Beto — "Expo Mesh Gradient" (B8Hkuq6EZ7o) |
| Glassmorphism over animated bg | Candillon — "Glassmorphism in React Native" (ao2i_sOD-z0) |
| Skia clock-driven loader | Reactiive — "Animated Loader with RN (Skia)" (7pCiGUrJuow) |
| Neumorphism shadows | Candillon — "Neumorphism in React Native" (GFssmWUhwww) |
| Liquid glass via Skia | Candillon — "Liquid Glass with RN Skia" (qYFMOMVZoPY) |
| Progressive blur gradient | Candillon — "Experimental Blur Gradient in RN" (oboF_H1MApo) |

## Approved visual ground truth

- `docs/superpowers/mockups/splash-mesh-approved-v1.html` — the four approved splash variants (exact colors, waypoints, durations). Port from these values, don't reinvent.
- `docs/superpowers/mockups/splash-gradient-shortlist-v1.html` — reserve pool (стрічка, глибинне сяйво, стовпи аврори, промінь по контуру) on the layered-accent mechanic.
- Palette only: mint #2DD4BF / #5EEAD4, teal #0D9488, indigo #4338CA / #6366F1, lime #A3E635, dark base #11141F. Mid-tone mixes off this list read as "dirty" — the user rejects them.
