import { CreateActionSheet } from "@/src/components/CreateActionSheet";
import { BookOpen, House, PlusCircle } from "@tamagui/lucide-icons";
import { BlurView } from "expo-blur"; // <-- Імпортуємо BlurView
import { LinearGradient } from "expo-linear-gradient";
import { Tabs } from "expo-router";
import { ComponentType, useState } from "react";
import { StyleSheet } from "react-native"; // <-- Імпортуємо StyleSheet для absoluteFill
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme, YStack } from "tamagui";

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
        <YStack
          width={26}
          height={26}
          br={9}
          bg="rgba(255,255,255,0.08)"
          ai="center"
          jc="center"
        >
          <Icon size={18} color={color} />
        </YStack>
      );
    }

    return (
      <YStack
        shadowColor="$glowSoft"
        shadowOpacity={0.1}
        shadowRadius={20}
        shadowOffset={{ width: 0, height: 0 }}
        elevation={1}
      >
        <LinearGradient
          colors={[
            theme.accentGradientStart.get(),
            theme.accentGradientEnd.get(),
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1.3, y: 1.3 }}
          style={{
            width: 26,
            height: 26,
            borderRadius: 9,
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
          tabBarStyle: {
            position: "absolute",
            left: 22,
            right: 22,
            bottom: insets.bottom + 19,
            height: 68,
            backgroundColor: "transparent",
            elevation: 10,
            shadowColor: "#000",
            shadowOpacity: 0.35,
            shadowRadius: 20,
            shadowOffset: { width: 0, height: 10 },
          },
          tabBarBackground: () => (
            <BlurView
              intensity={20}
              tint="dark"
              style={{
                ...StyleSheet.absoluteFillObject,
                borderRadius: 27,
                overflow: "hidden",
                borderWidth: 2,
                borderColor:
                  theme.glassBorder.get() || "rgba(255, 255, 255, 0.1)",

                backgroundColor: "rgba(15, 22, 36, 0.4)",
              }}
            />
          ),
          tabBarItemStyle: {
            justifyContent: "center",
            alignItems: "center",
            paddingTop: 8,
          },
          tabBarLabelStyle: { fontSize: 12, fontWeight: "500" },
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
              e.preventDefault();
              setIsSheetOpen(true);
            },
          }}
        />
      </Tabs>
      <CreateActionSheet open={isSheetOpen} onOpenChange={setIsSheetOpen} />
    </>
  );
}
