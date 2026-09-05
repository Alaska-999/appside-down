import { GradientBorder } from "@/src/components/ui/GradientBorder";
import {
  FOCUS_BORDER,
  FocusRing,
  useFocusProgress,
} from "@/src/components/ui/InputShell";
import { LiquidGlass } from "@/src/components/ui/LiquidGlass";
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
  { glass: boolean; activeText: string; glow: number }
> = {
  gradient: { glass: false, activeText: "#0D1117", glow: 0.45 },
  glass: { glass: true, activeText: "#5EEAD4", glow: 0.35 },
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
  const [internalSelected, setInternalSelected] = useState(selected);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    setInternalSelected(selected);
  }, [selected]);

  const tabWidth =
    containerWidth > 0
      ? (containerWidth - PADDING * 2 - GAP * (options.length - 1)) / options.length
      : 0;

  const translateX = useSharedValue(0);

  useEffect(() => {
    if (tabWidth > 0) {
      translateX.value = withTiming(internalSelected * (tabWidth + GAP), {
        duration: 200,
      });
    }
  }, [internalSelected, tabWidth, translateX]);

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
      bg="rgba(4,7,10,0.5)"
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
          backgroundColor: "rgba(0,0,0,0.3)",
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
              shadowColor: "rgba(45,212,191,1)",
              shadowOffset: { width: 0, height: 0 },
              shadowRadius: t.glass ? 6 : 4,
              shadowOpacity: t.glow,
            },
            pillStyle,
          ]}
        >
          {t.glass ? (
            <>
              <LiquidGlass
                intensity={25}
                borderRadius={13}
                backgroundColor="rgba(220,255,245,0.05)"
              />
              <View
                pointerEvents="none"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 8,
                  right: 8,
                  height: 1,
                  backgroundColor: "rgba(255,255,255,0.34)",
                }}
              />
              <GradientBorder
                radius={13}
                angle={180}
                colors={FOCUS_BORDER.colors}
                positions={FOCUS_BORDER.positions}
              />
              <FocusRing radius={13} progress={glowProgress} />
            </>
          ) : (
            <>
              <LinearGradient
                colors={["#2DD4BF", "#A3E635"]}
                start={{ x: 0, y: 0.4 }}
                end={{ x: 1, y: 0.6 }}
                style={StyleSheet.absoluteFill}
              />
              <LinearGradient
                colors={["rgba(2,60,44,0)", "rgba(2,60,44,0.4)"]}
                start={{ x: 0.5, y: 0.35 }}
                end={{ x: 0.5, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
            </>
          )}
        </Animated.View>
      )}

      {options.map((option, i) => {
        const active = internalSelected === i;
        return (
          <Pressable
            key={option}
            onPress={() => {
              hapticTap();
              setInternalSelected(i);
              onChange(i);
            }}
            style={{ flex: 1 }}
          >
            <XStack py={10} px={8} jc="center" ai="center" gap={7}>
              {renderIcon?.(i, active)}
              <Text
                fontSize={13.5}
                fontWeight="600"
                color={active ? t.activeText : "#8FA8B8"}
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
