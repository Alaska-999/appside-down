import { Stack } from "expo-router";

export default function ModuleLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: "#08090C" },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen
        name="edit"
        options={{
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen name="cards" />
      <Stack.Screen
        name="flashcards"
        options={{
          gestureEnabled: false,
          presentation: "fullScreenModal",
        }}
      />
      <Stack.Screen
        name="match"
        options={{
          gestureEnabled: false,
          presentation: "fullScreenModal",
        }}
      />
    </Stack>
  );
}
