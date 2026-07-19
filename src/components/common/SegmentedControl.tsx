import { TEXT } from "@/src/constants/typography";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Text, useTheme, XStack } from "tamagui";

interface SegmentedControlProps {
  options: string[];
  selected: number;
  onChange: (index: number) => void;
  size?: "small" | "medium";
}

export function SegmentedControl({
  options,
  selected,
  onChange,
  size = "medium",
}: SegmentedControlProps) {
  const theme = useTheme();
  const gradientColors = [
    theme.accentGradientStart.get(),
    theme.accentGradientEnd.get(),
  ] as const;
  const pillGlow = "rgba(45,212,191,0.5)";
  const [containerWidth, setContainerWidth] = useState(0);

  const isSmall = size === "small";
  const PADDING = isSmall ? 2 : 3;
  const GAP = isSmall ? 2 : 3;
  const py = isSmall ? "$1.5" : "$2";
  const containerBr = isSmall ? 10 : 14;
  const pillBr = isSmall ? 8 : 11;

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
  }, [selected, tabWidth]);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <XStack
      bg="$glassBg"
      borderWidth={1}
      borderColor="$glassBorder"
      br={containerBr}
      p={PADDING}
      gap={GAP}
      mb="$3"
      position="relative"
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      {containerWidth > 0 && (
        <Animated.View
          style={[
            {
              position: "absolute",
              top: PADDING,
              left: PADDING,
              width: tabWidth,
              bottom: PADDING,
              borderRadius: pillBr,
              overflow: "hidden",
              shadowColor: pillGlow,
              shadowOpacity: 0.5,
              shadowRadius: 6,
              elevation: 3,
            },
            pillStyle,
          ]}
        >
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ flex: 1 }}
          />
        </Animated.View>
      )}

      {options.map((option, i) => (
        <Pressable key={option} onPress={() => onChange(i)} style={{ flex: 1 }}>
          <XStack py={py} jc="center" ai="center">
            <Text
              fontSize={TEXT.cardMeta}
              fontWeight="700"
              color={selected === i ? "colorMuted" : "$colorMuted"}
            >
              {option}
            </Text>
          </XStack>
        </Pressable>
      ))}
    </XStack>
  );
}
