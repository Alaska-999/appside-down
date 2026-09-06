import { FocusRing, useFocusProgress } from "@/src/components/ui/FocusRing";
import { LiquidGlass } from "@/src/components/ui/LiquidGlass";
import { GRADIENT_PRIMARY } from "@/src/constants/gradients";
import { ICON_MINT } from "@/src/constants/iconColors";
import { BLACK_SCRIM_LIGHT, FOREST_SHADE, FOREST_SHADE_TRANSPARENT } from "@/src/constants/rawColors";
import { SURFACE_GLASS_BG_FAINT, SURFACE_WELL } from "@/src/constants/surfaceAlpha";
import { hapticTap } from "@/src/utils/haptics";
import { LinearGradient } from "expo-linear-gradient";
import { ReactNode, useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Text, XStack } from "tamagui";

type SegmentedTone = "gradient" | "glass";

interface SegmentedControlProps {
  options: string[];
  selected: number;
  onChange: (index: number) => void;
  renderIcon?: (index: number, active: boolean) => ReactNode;
  tone?: SegmentedTone;
}

const TONE_STYLES: Record<
  SegmentedTone,
  { glass: boolean; activeText: string }
> = {
  gradient: { glass: false, activeText: "$nearBlack" },
  glass: { glass: true, activeText: "$mint" },
};

const PADDING = 3;
const GAP = 3;

export function SegmentedControl({
  options,
  selected,
  onChange,
  renderIcon,
  tone = "gradient",
}: SegmentedControlProps) {
  const t = TONE_STYLES[tone];
  const glowProgress = useFocusProgress(t.glass);
  const [containerWidth, setContainerWidth] = useState(0);

  const tabWidth =
    containerWidth > 0
      ? (containerWidth - PADDING * 2 - GAP * (options.length - 1)) /
        options.length
      : 0;

  const translateX = useSharedValue(0);

  useEffect(() => {
    if (tabWidth > 0) {
      translateX.value = withTiming(selected * (tabWidth + GAP), {
        duration: 200,
      });
    }
  }, [selected, tabWidth, translateX]);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <XStack
      br={16}
      p={PADDING}
      gap={GAP}
      position="relative"
      overflow={t.glass ? "visible" : "hidden"}
      bg={SURFACE_WELL}
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 8,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          backgroundColor: BLACK_SCRIM_LIGHT,
        }}
      />
      {containerWidth > 0 && (
        <Animated.View
          style={[
            {
              position: "absolute",
              top: PADDING,
              left: PADDING,
              width: tabWidth,
              bottom: PADDING,
              borderRadius: 13,
              overflow: t.glass ? "visible" : "hidden",
              shadowColor: ICON_MINT,
              shadowOffset: { width: 0, height: 0 },
              shadowRadius: t.glass ? 6 : 4,
              shadowOpacity: t.glass ? 0 : 0.45,
            },
            pillStyle,
          ]}
        >
          {t.glass ? (
            <>
              <LiquidGlass
                intensity={25}
                borderRadius={13}
                backgroundColor={SURFACE_GLASS_BG_FAINT}
              />
              <FocusRing radius={13} progress={glowProgress} />
            </>
          ) : (
            <>
              <LinearGradient
                colors={GRADIENT_PRIMARY}
                start={{ x: 0, y: 0.4 }}
                end={{ x: 1, y: 0.6 }}
                style={StyleSheet.absoluteFill}
              />
              <LinearGradient
                colors={[FOREST_SHADE_TRANSPARENT, FOREST_SHADE]}
                start={{ x: 0.5, y: 0.35 }}
                end={{ x: 0.5, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
            </>
          )}
        </Animated.View>
      )}

      {options.map((option, i) => {
        const active = selected === i;
        return (
          <Pressable
            key={option}
            onPress={() => {
              hapticTap();
              onChange(i);
            }}
            style={{ flex: 1 }}
          >
            <XStack py={10} px={8} jc="center" ai="center" gap={7}>
              {renderIcon?.(i, active)}
              <Text
                fontSize={13.5}
                fontWeight="600"
                color={active ? t.activeText : "$textMuted"}
              >
                {option}
              </Text>
            </XStack>
          </Pressable>
        );
      })}
    </XStack>
  );
}
