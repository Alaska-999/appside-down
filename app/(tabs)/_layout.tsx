import { CreateActionSheet } from "@/src/components/CreateActionSheet";
import { LiquidGlass } from "@/src/components/ui/LiquidGlass";
import { BookOpen, House, PlusCircle } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Tabs } from "expo-router";
import { ComponentType, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme, YStack } from "tamagui";

export const TAB_BAR_HEIGHT = 68;
export const TAB_BAR_CLEARANCE_GAP = 16;

function TabIcon(
  Icon: ComponentType<{ size?: number; color?: string; strokeWidth?: number }>,
) {
  return function RenderTabIcon({ focused }: { focused: boolean }) {
    if (!focused) {
      return (
        <YStack
          width={30}
          height={30}
          br={10}
          bg="rgba(255,255,255,0.08)"
          ai="center"
          jc="center"
        >
          <Icon size={20} color="#8FA8B8" strokeWidth={1.9} />
        </YStack>
      );
    }

    return (
      <YStack
        w={30}
        h={30}
        br={10}
        overflow="hidden"
        ai="center"
        jc="center"
        shadowColor="rgba(45,212,191,1)"
        shadowOpacity={0.8}
        shadowRadius={9}
        shadowOffset={{ width: 0, height: 0 }}
      >
        <LinearGradient
          colors={["#2DD4BF", "#A3E635"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />
        <Icon size={20} color="#0D1117" strokeWidth={2.1} />
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
            bottom: Math.max(insets.bottom, 14),
            height: TAB_BAR_HEIGHT,
            backgroundColor: "transparent",
            borderTopWidth: 0,
            elevation: 10,
            shadowColor: "#000",
            shadowOpacity: 0.6,
            shadowRadius: 17,
            shadowOffset: { width: 0, height: 14 },
          },
          tabBarBackground: () => (
            <LiquidGlass
              intensity={70}
              borderRadius={22}
              borderWidth={1}
              borderColor={theme.glassBorder.get()}
              backgroundColor={theme.tabBarBg.get()}
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
