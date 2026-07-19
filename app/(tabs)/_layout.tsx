import { CreateActionSheet } from "@/src/components/CreateActionSheet";
import { BookOpen, House, PlusCircle } from "@tamagui/lucide-icons";
import { Tabs } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { ComponentType, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme, YStack } from "tamagui";

// активна вкладка — невеликий квадрат із акцентним градієнтом, білою іконкою
// і неоновим ореолом (мокап home-bento-v7, .ft-item.a); квадрат компактний,
// щоб під ним лишалось місце для підпису
function TabIcon(Icon: ComponentType<{ size?: number; color?: string }>) {
  return function RenderTabIcon({
    focused,
    color,
  }: {
    focused: boolean;
    color: string;
  }) {
    const theme = useTheme();

    if (!focused) {
      return (
        <YStack width={30} height={30} ai="center" jc="center">
          <Icon size={18} color={color} />
        </YStack>
      );
    }

    return (
      <YStack
        shadowColor="$glowColor"
        shadowOpacity={1}
        shadowRadius={8}
        shadowOffset={{ width: 0, height: 0 }}
        elevation={6}
      >
        <LinearGradient
          colors={[
            theme.accentGradientStart.get(),
            theme.accentGradientEnd.get(),
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: 30,
            height: 30,
            borderRadius: 10,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={18} color="white" />
        </LinearGradient>
      </YStack>
    );
  };
}

export default function TabsLayout() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          // "плаваючий острівець" замість прибитого до країв таб-бару —
          // звірено з затвердженим bento-мокапом Home
          tabBarStyle: {
            position: "absolute",
            left: 20,
            right: 20,
            bottom: insets.bottom + 12,
            height: 64,
            borderRadius: 24,
            backgroundColor: theme.tabBarBg.get(),
            borderWidth: 1,
            borderColor: theme.glassBorder.get(),
            elevation: 8,
            shadowColor: "#000",
            shadowOpacity: 0.4,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 8 },
          },
          tabBarActiveTintColor: theme.color.get(),
          tabBarInactiveTintColor: theme.colorMuted.get(),
        }}
      >
        <Tabs.Screen
          name="index"
          options={{ title: "Home", tabBarIcon: TabIcon(House) }}
        />
        <Tabs.Screen
          name="library"
          options={{ title: "Library", tabBarIcon: TabIcon(BookOpen) }}
        />
        <Tabs.Screen
          name="create"
          options={{
            title: "Create",
            tabBarIcon: TabIcon(PlusCircle),
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
