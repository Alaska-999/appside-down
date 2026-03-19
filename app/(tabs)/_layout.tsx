import { CreateActionSheet } from "@/src/components/CreateActionSheet";
import { Tabs } from "expo-router";
import { useState } from "react";

export default function TabsLayout() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <>
      <Tabs>
        <Tabs.Screen name="index" options={{ title: "Home" }} />
        <Tabs.Screen name="library" options={{ title: "Library" }} />
        <Tabs.Screen
          name="create"
          options={{
            title: "Create",
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault(); // Зупиняємо перехід на сторінку create.tsx
              setIsSheetOpen(true);
            },
          }}
        />
      </Tabs>
      <CreateActionSheet open={isSheetOpen} onOpenChange={setIsSheetOpen} />
    </>
  );
}
