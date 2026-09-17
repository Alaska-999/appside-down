---
name: component-system-architecture
description: Use when creating, refactoring, or reviewing any UI component in this app — defines the "elements with modes" architecture (variant tables, layer composition, where a component lives, what its API may expose) that the elements-v1 redesign must preserve.
---

# Component system architecture ("elements with modes")

The architecture is fixed and survives the elements-v1 redesign unchanged. Only the visual values inside the tables change.

## The pattern

Components are plain functions with **constant style tables**, NOT tamagui `styled()`/variants API:

1. Local union types: `type XVariant = "a" | "b"`, `type XSize = "sm" | "md" | "lg"` (or `tone`).
2. Tables: `const VARIANT_STYLES: Record<XVariant, Partial<Props>>`, `SIZE_STYLES`, `TONE_STYLES`.
3. Component spreads the table into a tamagui stack, then `{...rest}` last (escape hatch).
4. Colors only via `$`-theme tokens (`bg="$glassBg"`); gradients via `useTheme()` + `theme.x.get()` (expo-linear-gradient can't read `$`-tokens). Lucide icon `color` can't resolve custom theme tokens AND `theme.x.get()` also failed here (renders black either way) — icons take palette hex literals (`#6E8496` iconMuted, `#8FA8B8` muted, `#EAF7FF` on-glass).
5. Call sites pass MODES (`variant`, `size`, `tone`, and for elements-v1 also `glow 0…4` / `vivid 0…4`), never style props (bg/height/shadow). If a screen needs a new look, add a mode to the element — elements-v1: «Картки — одна сім'я, різні механіки — не окремі компоненти».

Canonical examples: `AppButton` (`src/components/ui/controls/Button.tsx` — 8 variants, gradient vs flat split), `AppCard` (`ui/surface/Card.tsx` — variants delegate to `GlowSurface` presets), `StatTile` (`ui/display/StatTile.tsx` — the shortest tone-table reference). `Badge`, `Chip`, `AuroraGlow` and `ui/ScreenHeader` were deleted during the elements-v1 rework — do not look for them.

## Layers

- `src/components/ui/` — atomic primitives, domain-blind. Since 2026-09-17 they are grouped by ROLE into ten folders; a primitive always lives in exactly one, and its style/preset table lives beside it (`gradientBorderPresets` next to `GradientBorder`, `tabLight` next to the tab bar, `avatarVariants` next to the avatars):

  | folder | what belongs there |
  |---|---|
  | `surface/` | the glass + light foundation: `GlowSurface`, `Surfaces`, `Well`, `LiquidGlass`, `GradientBorder`, `Card` |
  | `controls/` | anything pressable: `Button`, `IconButton`, `Toggle`, `Checkbox`, `StarToggle`, `AddPill`, `SavePill`, `ScrollToTopButton` |
  | `fields/` | form input parts: `InputShell`, `SearchField`, `SelectField`, `CodeInput`, `FieldLabel`, `FocusRing` |
  | `display/` | non-interactive content: `SectionTitle`, `GradientText`, `StatTile`, `TagChip`, `FilterChip`, `GlassPill`, `SoonBadge`, `Rows`, `PickRow` |
  | `feedback/` | state over time: `Skeleton`, `StateCard`, `Toast`, `SyncingPill`, the three `Progress*` |
  | `overlays/` | things above the screen: `Sheet`, `ConfirmMenuSheet`, `KeyboardBar` |
  | `background/` | screen atmosphere: `ScreenBackground`, `MeshGradientBackground`, `StatusBarScrim` |
  | `navigation/` | tab bar: `TabBarIcon`, `TabBarLight` |
  | `avatar/` | `AvatarRing`, `AvatarPlaceholder` |
  | `motion/` | animation wrappers: `StaggerIn`, `FadeTabPanes` |

  A new primitive goes into the folder matching its ROLE, never a new folder per screen. If it knows about a domain concept (auth, modules, folders, flashcards) it is NOT a primitive — it belongs in `common/` or a domain folder. `AuthHeading` and `AuthSwitchLink` were moved out to `common/` for exactly this reason.
- `src/components/common/` + `cards/` + `flashcards/` — domain components composed FROM primitives (`ModuleCard` = `AppCard variant="soft"` + pieces).
- `app/*` — Expo Router screens; compose, never restyle.

Composition conventions that are part of the system:
- `GlowSurface` (`ui/surface/`) — layered glass foundation (glow z:-1 → fill → inset highlight → hairline border → content).
- `LiquidGlass` (`ui/surface/`) — the ONLY expo-blur entry point; consumers: `IconButton liquidGlass`, sheets, tab bar.
- Screen backgrounds: `ScreenBackground` (`ui/background/`) + one absolute `pointerEvents="none"` atmosphere layer (Skia canvas in the new design).
- RHF inputs own their `Controller` + error text (`FormInput`, `CodeInput`) — screens don't hold field state.
- Gesture/animation logic lives in hooks (`useFlipCard`, `useSwipeCard`, `useFadeTabs` from `ui/motion/FadeTabPanes`), not components.
- `hapticTap()` is built into pressables; touch targets ≥44×44 via hitSlop.

## Rules

- Every recurring value = token in `tamagui.config.ts` (space/radius already match elements-v1: 16/22/19, 23/20/16, pill 999). New COLOR tokens only with explicit user approval.
- Typography roles from elements-v1 (display 30/800, title 23/800, section 17/700, card 16/700, body 15/400, meta 12.5/400, micro 11/600) — don't add new consumers to the legacy `TEXT` scale in `src/constants/typography.ts`.
- No barrel files; direct imports via `@/src/components/...` — with the grouping this means `@/src/components/ui/<folder>/<Name>`. Moving a primitive between folders means rewriting every import site; there is no re-export to hide behind.
- No code comments.
- One primary button per screen; skeleton instead of spinner; error text under the field.
