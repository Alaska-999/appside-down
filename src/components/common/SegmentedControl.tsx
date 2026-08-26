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

interface SegmentedControlProps {
  options: string[];
  selected: number;
  onChange: (index: number) => void;
  renderIcon?: (index: number, active: boolean) => ReactNode;
}

const PADDING = 3;
const GAP = 3;

export function SegmentedControl({
  options,
  selected,
  onChange,
  renderIcon,
}: SegmentedControlProps) {
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
      overflow="hidden"
      bg="rgba(4,7,10,0.5)"
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      <View
        pointerEvents="none"
        style={{ position: "absolute", top: 0, left: 0, right: 0, height: 8, backgroundColor: "rgba(0,0,0,0.3)" }}
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
              overflow: "hidden",
              shadowColor: "rgba(45,212,191,1)",
              shadowOffset: { width: 0, height: 0 },
              shadowRadius: 9,
              shadowOpacity: 0.55,
            },
            pillStyle,
          ]}
        >
          <LinearGradient
            colors={["#2DD4BF", "#A3E635"]}
            start={{ x: 0, y: 0.4 }}
            end={{ x: 1, y: 0.6 }}
            style={StyleSheet.absoluteFillObject}
          />
          <LinearGradient
            colors={["rgba(2,60,44,0)", "rgba(2,60,44,0.4)"]}
            start={{ x: 0.5, y: 0.35 }}
            end={{ x: 0.5, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
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
                color={active ? "#0D1117" : "#8FA8B8"}
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
