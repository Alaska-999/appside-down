# Flashcard Game UI Redesign

**Date:** 2026-05-31

## Overview

Redesign the flashcard game screen UI to feel balanced between calm/minimal and energetic/contrasted. Key improvements: distinct card front/back surfaces, clear term/definition labels, intuitive action buttons aligned with game mechanics.

---

## Section 1: New Color Tokens

### `tamagui.config.ts` — color palette additions

```typescript
// tokens.color additions
cardSurface: '#FFFFFF',   // clean white — front face of game card
cardBack: '#F5F3FF',      // soft lavender — back face of game card
```

### Theme mappings

```typescript
light: {
  cardSurface: tokens.color.cardSurface,
  cardBack: tokens.color.cardBack,
}

dark: {
  cardSurface: '#1E293B',   // deep blue-grey
  cardBack: '#1A1A2E',      // deep dark-violet
}
```

`gameCard` token remains in config for backwards compatibility but is no longer used by `FlashcardLg`.

---

## Section 2: `FlashcardLg` Redesign

**File:** `src/components/flashcards/Flashcard-lg.tsx`

### Front face (`bg="$cardSurface"`)

- **Header (unchanged):** TTS button (left) + Star button (right), `bg="$backgroundSoft"`
- **Center content:**
  - `TERM` label — `fontSize="$1"` `letterSpacing={1.5}` `color="$colorMuted"` `textTransform="uppercase"`
  - Term text — `fontSize="$7"` `color="$color"` `textAlign="center"` `numberOfLines={6}`
- **Footer hint:**
  - `Tap to reveal` text — `fontSize="$2"` `color="$colorMuted"` centered at bottom of card

### Back face (`bg="$cardBack"`)

- **Center content:**
  - `DEFINITION` label — same style as `TERM` label
  - Definition text — same style as term text
- No TTS/Star buttons — clean, content only

### Card styling (both faces)

- `br="$6"` (larger border radius than current)
- Soft shadow:
  ```
  shadowColor="#000"
  shadowOffset={{ width: 0, height: 4 }}
  shadowOpacity={0.08}
  shadowRadius={12}
  elevation={4}
  ```

### Text color fix

Both term and definition text use `color="$color"` (not `color="$statusSuccess"`).

---

## Section 3: Game Screen Layout

**File:** `app/module/[id]/flashcards.tsx`

### Counters (replace plain circles)

Replace current `XStack` with two pill-shaped badges:

**Left (Known):**
```
[✓  0]
 Known
```
- Pill: `bg="$statusSuccess"` `br={20}` `px="$3"` `py="$2"`
- Icon: `Check` size `$1` color white
- Number: `color="white"` `fontWeight="700"`
- Label below pill: `"Known"` `fontSize="$1"` `color="$colorMuted"`

**Right (Learning):**
```
[0  ✗]
Learning
```
- Pill: `bg="$statusDanger"` same styling
- Icon: `X` size `$1` color white
- Label: `"Learning"`

### Bottom actions (replace undo + play)

```
[✗ Still learning]    [↩]    [Know ✓]
```

- **Left:** ghost button — `borderColor="$statusDanger"` `color="$statusDanger"` label `"Still learning"` with `X` icon — calls `swipeLeft`
- **Center:** icon-only undo button — `RotateCcw` icon, neutral color, disabled when `currentIndex === 0` — calls `revertSwipe`
- **Right:** filled button — `bg="$statusSuccess"` `color="white"` label `"Know"` with `Check` icon — calls `swipeRight`

Play button (`▶`) removed — not wired to any action.

---

## Files Changed

| File | Action |
|---|---|
| `tamagui.config.ts` | Add `cardSurface`, `cardBack` tokens + theme mappings |
| `src/components/flashcards/Flashcard-lg.tsx` | Redesign front/back faces, add labels, shadow, fix text color |
| `app/module/[id]/flashcards.tsx` | Redesign counters, redesign bottom actions |
