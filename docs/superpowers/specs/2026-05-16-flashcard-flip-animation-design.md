# Flashcard Flip Animation

## Goal
Add a vertical flip animation (rotateX, top-to-bottom) to the flashcard component when the user taps it.

## Component
`src/components/flashcards/Flashcard-md.tsx` — existing component with term/definition toggle state.

## Architecture

Two absolutely-positioned Animated views stacked inside a container:
- **Front** — shows `term`, visible when `cardState === "term"`
- **Back** — shows `definition`, visible when `cardState === "definition"`

A single `flipProgress` shared value (0 = front, 1 = back) drives both views.

## Animation Logic

- `flipProgress`: `useSharedValue(0)`, toggled between 0 and 1 on press
- Spring config: `damping: 20, stiffness: 180`
- **Front** `rotateX`: `interpolate(flipProgress, [0, 0.5, 1], [0, -90, -90])` — disappears at 90°
- **Back** `rotateX`: `interpolate(flipProgress, [0, 0.5, 1], [90, 90, 0])` — appears from 90°
- `backfaceVisibility: "hidden"` on both views to prevent ghost rendering
- `perspective: 1000` on the container view for 3D depth

## State
- Remove `useState` for `cardState` — flip direction is driven entirely by `flipProgress`
- `isFlipped` derived: `flipProgress.value >= 0.5`

## Dependencies
- `react-native-reanimated` (already installed ~4.1.1)
- No new packages needed
