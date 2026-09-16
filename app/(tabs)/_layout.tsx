import { CreateActionSheet } from "@/src/components/CreateActionSheet";
import { LiquidGlass } from "@/src/components/ui/LiquidGlass";
import { TabBarIcon } from "@/src/components/ui/TabBarIcon";
import { TabBarLight } from "@/src/components/ui/TabBarLight";
import { ICON_PURE_BLACK } from "@/src/constants/iconColors";
import { TAB_SWITCH_MS } from "@/src/constants/motion";
import { Tabs } from "expo-router";
import { BookOpen, House, PlusCircle } from "lucide-react-native";
import { ComponentType, useState } from "react";
import { Easing, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "tamagui";

export const TAB_BAR_HEIGHT = 68;
export const TAB_BAR_CLEARANCE_GAP = 16;
export const TAB_BAR_SIDE = 19;
export const TAB_BAR_RADIUS = 22;

const TAB_COUNT = 3;

function TabIcon(
  Icon: ComponentType<{ size?: number; color?: string; strokeWidth?: number }>,
  index: number,
) {
  return function RenderTabIcon() {
    return <TabBarIcon Icon={Icon} index={index} count={TAB_COUNT} />;
  };
}

const HomeIcon = TabIcon(House, 0);
const LibraryIcon = TabIcon(BookOpen, 1);
const CreateIcon = TabIcon(PlusCircle, 2);

function TabBarBackdrop() {
  const theme = useTheme();

  return (
    <>
      <LiquidGlass
        intensity={32}
        borderRadius={TAB_BAR_RADIUS}
        borderWidth={1}
        borderColor={theme.borderColor.get()}
        backgroundColor={theme.tabBarBg.get()}
      />
      <TabBarLight />
    </>
  );
}

export default function TabsLayout() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          sceneStyle: { backgroundColor: theme.background.get() },
          transitionSpec: {
            animation: "timing",
            config: {
              duration: TAB_SWITCH_MS,
              easing: Easing.out(Easing.cubic),
            },
          },
          sceneStyleInterpolator: ({ current }) => ({
            sceneStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [-1, 0, 1],
                    outputRange: [-width, 0, width],
                  }),
                },
              ],
            },
          }),
          tabBarStyle: {
            position: "absolute",
            start: TAB_BAR_SIDE,
            end: TAB_BAR_SIDE,
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
          tabBarBackground: () => <TabBarBackdrop />,
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
          options={{ title: "Home", tabBarIcon: HomeIcon }}
        />
        <Tabs.Screen
          name="library"
          options={{ title: "Library", tabBarIcon: LibraryIcon }}
        />
        <Tabs.Screen
          name="create"
          options={{
            title: "Create",
            tabBarIcon: CreateIcon,
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
