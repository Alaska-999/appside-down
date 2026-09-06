import MaskedView from "@react-native-masked-view/masked-view";
import { ICON_PURE_BLACK, ICON_TEXT } from "@/src/constants/iconColors";
import { EASE_STANDARD } from "@/src/constants/motion";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect } from "react";
import { TextInput, TextStyle } from "react-native";
import Animated, {
  SharedValue,
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

Animated.addWhitelistedNativeProps({ text: true });

export function AnimatedNumber({
  to,
  from = 0,
  duration = 1700,
  delay = 0,
  prefix = "",
  suffix = "",
  style,
  progress,
  gradientColors,
  width,
  height,
}: {
  to: number;
  from?: number;
  duration?: number;
  delay?: number;
  prefix?: string;
  suffix?: string;
  style?: TextStyle | TextStyle[];
  progress?: SharedValue<number>;
  gradientColors?: [string, string, ...string[]];
  width?: number;
  height?: number;
}) {
  const value = useSharedValue(from);

  useEffect(() => {
    if (progress) return;
    value.value = from;
    value.value = withDelay(
      delay,
      withTiming(to, { duration, easing: EASE_STANDARD }),
    );
  }, [to, from, duration, delay, value, progress]);

  const animatedProps = useAnimatedProps(() => {
    const current = progress ? from + progress.value * (to - from) : value.value;
    const text = `${prefix}${Math.round(current)}${suffix}`;
    return { text, defaultValue: text };
  });

  const textInput = (
    <AnimatedTextInput
      editable={false}
      underlineColorAndroid="transparent"
      animatedProps={animatedProps}
      style={[{ padding: 0, color: gradientColors ? ICON_PURE_BLACK : ICON_TEXT }, style]}
    />
  );

  if (!gradientColors) {
    return textInput;
  }

  return (
    <MaskedView maskElement={textInput} style={{ width, height }}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ width, height }}
      />
    </MaskedView>
  );
}
