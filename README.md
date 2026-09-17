# Svitly

A mobile flashcards learning app built with Expo / React Native.

## Stack

- [Expo](https://expo.dev) + [Expo Router](https://docs.expo.dev/router/introduction/) (file-based routing)
- [Tamagui](https://tamagui.dev) — design system and UI components
- [Zustand](https://github.com/pmndrs/zustand) — state (auth, game, preferences, study queue)
- [TanStack Query](https://tanstack.com/query) — API layer
- [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev) — forms and validation
- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) + [Skia](https://shopify.github.io/react-native-skia/) — animations and visual effects

## Project structure

```
app/            screens (file-based routing)
  (auth)/       login, signup, password recovery
  (tabs)/       main tabs: home, library, create
  module/       flashcard module screen
src/
  api/          API client config
  components/   UI components (cards, flashcards, common, ui)
  constants/    colors, tokens
  store/        Zustand stores
  hooks/        custom hooks
  utils/        helper functions
  validation/   Zod schemas
tamagui.config.ts   design system config (tokens, themes)
```

## Getting started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

   Useful flags:

   ```bash
   npx expo start --ios       # iOS simulator
   npx expo start --android   # Android emulator
   npx expo start -c          # clear Metro cache (after bulk changes)
   ```

3. Lint

   ```bash
   npm run lint
   ```

## Backend

The app pairs with a separate backend repo (`appside-down-be`). The API URL is configured in `src/api/config.ts` / environment variables.
