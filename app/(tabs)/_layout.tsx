import { CreateActionSheet } from "@/src/components/CreateActionSheet";
import { LiquidGlass } from "@/src/components/ui/LiquidGlass";
import {
  ICON_MINT,
  ICON_MUTED,
  ICON_NEAR_BLACK,
  ICON_PURE_BLACK,
} from "@/src/constants/iconColors";
import { GRADIENT_PRIMARY } from "@/src/constants/gradients";
import { TAB_ICON_INACTIVE_BG } from "@/src/constants/rawColors";
import { LinearGradient } from "expo-linear-gradient";
import { Tabs } from "expo-router";
import { BookOpen, House, PlusCircle } from "lucide-react-native";
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
          bg={TAB_ICON_INACTIVE_BG}
          ai="center"
          jc="center"
          mb={6}
        >
          <Icon size={20} color={ICON_MUTED} strokeWidth={1.9} />
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
        shadowColor={ICON_MINT}
        shadowOpacity={0.8}
        shadowRadius={9}
        shadowOffset={{ width: 0, height: 0 }}
        mb={6}
      >
        <LinearGradient
          colors={GRADIENT_PRIMARY}
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
        <Icon size={20} color={ICON_NEAR_BLACK} strokeWidth={2.1} />
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
            start: 19,
            end: 19,
            bottom: Math.max(insets.bottom, 14),
            height: TAB_BAR_HEIGHT,
            backgroundColor: "transparent",
            borderTopWidth: 0,
            elevation: 10,
            shadowColor: ICON_PURE_BLACK,
            shadowOpacity: 0.4,
            shadowRadius: 17,
            shadowOffset: { width: 0, height: 14 },
          },
          tabBarBackground: () => (
            <LiquidGlass
              intensity={32}
              borderRadius={22}
              borderWidth={1}
              borderColor={theme.borderColor.get()}
              backgroundColor={theme.tabBarBg.get()}
            />
          ),
          tabBarItemStyle: {
            justifyContent: "center",
            alignItems: "center",
            paddingTop: 11,
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
