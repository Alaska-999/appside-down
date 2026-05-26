import { Stack } from "expo-router";

export default function ModuleLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="flashcards"
        options={{
          gestureEnabled: false,
          presentation: "fullScreenModal",
        }}
      />
    </Stack>
  );
}
