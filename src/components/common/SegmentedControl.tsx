import { useEffect, useState } from "react";
import { Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Text, useThemeName, XStack } from "tamagui";

interface SegmentedControlProps {
  options: string[];
  selected: number;
  onChange: (index: number) => void;
}

export function SegmentedControl({ options, selected, onChange }: SegmentedControlProps) {
  // theme.token.get() всередині style Animated.View Reanimated не вміє розпарсити
  // ("Invalid color value: [object Object]") — тому тут звичайні рядки-літерали,
  // синхронізовані з tamagui.config.ts, а не useTheme()
  const themeName = useThemeName();
  const pillBg = themeName === "dark" ? "#221F35" : "#FFFFFF";
  const pillGlow = themeName === "dark" ? "rgba(129,140,248,0.6)" : "rgba(99,102,241,0.35)";
  const [containerWidth, setContainerWidth] = useState(0);
  const PADDING = 4;
  const GAP = 4;
  const tabWidth = containerWidth > 0
    ? (containerWidth - PADDING * 2 - GAP * (options.length - 1)) / options.length
    : 0;

  const translateX = useSharedValue(0);

  useEffect(() => {
    if (tabWidth > 0) {
      translateX.value = withTiming(selected * (tabWidth + GAP), { duration: 200 });
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
      br="$4"
      p="$1"
      gap="$1"
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
              borderRadius: 6,
              backgroundColor: pillBg,
              shadowColor: pillGlow,
              shadowOpacity: 0.5,
              shadowRadius: 6,
              elevation: 3,
            },
            pillStyle,
          ]}
        />
      )}

      {options.map((option, i) => (
        <Pressable key={option} onPress={() => onChange(i)} style={{ flex: 1 }}>
          <XStack py="$2" jc="center" ai="center">
            <Text
              fontSize="$4"
              fontWeight={selected === i ? "600" : "400"}
              color={selected === i ? "$color" : "$colorMuted"}
            >
              {option}
            </Text>
          </XStack>
        </Pressable>
      ))}
    </XStack>
  );
}
