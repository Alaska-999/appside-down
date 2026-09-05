import { Lamp } from "@/src/components/ui/GlowSurface";
import { GradientBorder } from "@/src/components/ui/GradientBorder";
import { ProgressUnderline } from "@/src/components/ui/ProgressUnderline";
import { MODULE_PROGRESS_UNDERLINE } from "@/src/constants/featureFlags";
import { ICON_SUBTLE } from "@/src/constants/iconColors";
import { hapticTap } from "@/src/utils/haptics";
import { ChevronRight } from "lucide-react-native";
import { useState } from "react";
import { Pressable, StyleSheet, useWindowDimensions } from "react-native";
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useDerivedValue,
} from "react-native-reanimated";
import { Text, XStack, YStack } from "tamagui";

export const FOLDER_ROW_HEIGHT = 74;
export const FOLDER_ROW_GAP = 11;
const ROW_RADIUS = 23;

const LAMP_L1 = { rx: 1.2, ry: 0.92, cx: 0.06, cy: -0.12 };
const LAMP_L2 = { rx: 1.2, ry: 0.92, cx: 0.94, cy: 1.12 };

const BORDER_COLORS = [
  "rgba(94,234,212,0.42)",
  "rgba(220,255,245,0.06)",
  "rgba(220,255,245,0.03)",
];
const BORDER_POSITIONS = [0, 0.46, 1];

export function FolderModuleRow({
  name,
  itemsCount,
  tags = [],
  progress,
  index,
  scrollY,
  listTop,
  onPress,
}: {
  name: string;
  itemsCount: number;
  tags?: string[];
  progress?: { known: number; total: number };
  index: number;
  scrollY: SharedValue<number>;
  listTop: SharedValue<number>;
  onPress: () => void;
}) {
  const [pressed, setPressed] = useState(false);
  const { height: winHeight } = useWindowDimensions();

  const t = useDerivedValue(() => {
    "worklet";
    const rowCenter =
      listTop.value +
      index * (FOLDER_ROW_HEIGHT + FOLDER_ROW_GAP) +
      FOLDER_ROW_HEIGHT / 2;
    const ratio = (rowCenter - scrollY.value) / winHeight;
    return Math.max(0, Math.min(1, ratio));
  });

  const styleTopLeft = useAnimatedStyle(() => ({ opacity: 1 - t.value }));
  const styleBottomRight = useAnimatedStyle(() => ({ opacity: t.value }));

  const hasProgress = MODULE_PROGRESS_UNDERLINE && !!progress && progress.total > 0;
  const ratio = hasProgress ? progress!.known / progress!.total : 0;

  return (
    <Pressable
      onPress={() => {
        hapticTap();
        onPress();
      }}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={{
        transform: [{ scale: pressed ? 0.978 : 1 }],
        marginBottom: FOLDER_ROW_GAP,
      }}
    >
      <YStack
        h={FOLDER_ROW_HEIGHT}
        br={ROW_RADIUS}
        overflow="hidden"
        pos="relative"
        bg="rgba(20,28,34,0.44)"
      >
        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, styleTopLeft]}
        >
          <Lamp
            color="rgba(45,212,191,0.2)"
            edge={0.56}
            geometry={LAMP_L1}
          />
        </Animated.View>
        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, styleBottomRight]}
        >
          <Lamp
            color="rgba(45,212,191,0.2)"
            edge={0.56}
            geometry={LAMP_L2}
          />
        </Animated.View>

        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, styleTopLeft]}
        >
          <GradientBorder
            radius={ROW_RADIUS}
            angle={150}
            colors={BORDER_COLORS}
            positions={BORDER_POSITIONS}
          />
        </Animated.View>
        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, styleBottomRight]}
        >
          <GradientBorder
            radius={ROW_RADIUS}
            angle={330}
            colors={BORDER_COLORS}
            positions={BORDER_POSITIONS}
          />
        </Animated.View>

        <XStack
          f={1}
          zIndex={2}
          px={18}
          ai="center"
          gap={12}
          pointerEvents="none"
        >
          <YStack f={1} minWidth={0}>
            <Text
              fontSize={16}
              fontWeight="700"
              color="$color"
              numberOfLines={1}
            >
              {name}
            </Text>
            <XStack ai="center" gap={5} mt={3} flexWrap="wrap">
              <Text fontSize={12.5} color="$textMuted">
                {itemsCount} card{itemsCount !== 1 ? "s" : ""}
              </Text>
              {tags.map((tag) => (
                <XStack
                  key={tag}
                  px={7}
                  py={2}
                  br={999}
                  bg="rgba(220,255,245,0.07)"
                  borderWidth={1}
                  borderColor="rgba(220,255,245,0.11)"
                >
                  <Text fontSize={10} fontWeight="700" color="$textMuted">
                    {tag}
                  </Text>
                </XStack>
              ))}
            </XStack>
          </YStack>
          <ChevronRight size={15} color={ICON_SUBTLE} strokeWidth={2} />
        </XStack>

        {hasProgress && (
          <ProgressUnderline progress={ratio} dim={ratio < 0.25} />
        )}
      </YStack>
    </Pressable>
  );
}
