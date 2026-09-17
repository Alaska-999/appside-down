---
name: choosing-libraries
description: Use when adding, recommending, or evaluating a third-party React Native library for this app (UI kit, bottom sheet, carousel, skeleton/shimmer, confetti/particles, blur/glass, animation), or when tempted to replace an in-house component with a library equivalent.
---

# Choosing libraries

## Overview

This app runs Expo SDK 54 / RN 0.81.5 (New Arch) / Reanimated 4.1.1 with **worklets pinned at 0.5.1** in **Expo Go** (no dev client). Library verdicts below were researched and user-approved on 2026-08-09. Check them BEFORE proposing any install — several "obvious" picks break this stack or override decisions the user already made.

## In-house first — these exist, don't replace them

| Need | Use this, not a library |
|---|---|
| Skeleton/shimmer loading | `src/components/ui/Skeleton.tsx` (expo-linear-gradient sweep + Reanimated; deliberately NOT moti, NOT skeleton-placeholder) |
| Error/empty state | `src/components/ui/StateCard.tsx` |
| Background sync indicator | `src/components/ui/SyncingPill.tsx` |
| Aurora background | `src/components/ui/AuroraBeams.tsx`, `AuroraGlow.tsx` |
| Buttons with loading spinner | `AppButton` (`src/components/ui/Button.tsx`) `loading` prop |
| Liquid glass / blur surfaces | `src/components/ui/LiquidGlass.tsx` (single expo-blur entry point) + Skia for lens effects — NOT @callstack/liquid-glass |
| OTP input | `src/components/ui/CodeInput.tsx` |

The user explicitly rejected adding a second UI kit (gluestack, NativeBase) or a shimmer wrapper on top of Tamagui. Suggesting moti/skeleton libs to "upgrade" the in-house Skeleton counts as a violation, not an improvement.

## Vetted verdicts (2026-08-09)

| Library | Verdict | Why |
|---|---|---|
| @gorhom/bottom-sheet 5.x | ✅ approved candidate (not yet installed) | JS-only, works in Expo Go, reanimated 4 OK. Migrate inside `Sheet.tsx`/`GlassSheet.tsx`, keep their props API |
| react-native-reanimated-carousel 5.x | ✅ INSTALLED (^5.1.1) | used in `app/module/[id]/index.tsx` |
| @shopify/react-native-skia | ✅ INSTALLED (2.2.12) | only bump via `npx expo install`; anything newer needs worklets ≥0.7 → breaks. Never `npm i` latest |
| react-native-fast-confetti | ⚠️ only v1.1.2 | v2.x needs worklets ≥0.7 → breaks on this stack |
| react-native-confetti-cannon | ❌ | unmaintained since 2021 |
| react-native-skeleton-placeholder | ❌ | needs react-native-linear-gradient (non-Expo) + masked-view ^0.2.8 conflict; MaskedView also collapses on f={1} here |
| moti | ❌ for skeletons | in-house Skeleton is the chosen convention; moti tested on reanimated 3 only |
| @callstack/liquid-glass | ❌ for now | needs dev build + iOS 26, no Android; the elements-v1 liquid-glass look is implemented in-house (`LiquidGlass.tsx` blur + Skia lens per mockup recipe), revisit only if project leaves Expo Go |

## Checklist before proposing any new library

1. Is there an in-house component for this? (table above + `src/components/ui/`)
2. Peer deps vs `package.json`: reanimated 4.1 / **worklets 0.5.1** / gesture-handler 2.28 / React 19.1.
3. Native module? Must be bundled in Expo Go for SDK 54 (`node_modules/expo/bundledNativeModules.json`) — this project has no dev client.
4. Maintained? (last publish within ~a year)
5. New library = a functional change → ask the user before installing, even if compatible.
