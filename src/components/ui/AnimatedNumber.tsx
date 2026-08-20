import { useEffect } from "react";
import { TextInput, TextStyle } from "react-native";
import Animated, {
  Easing,
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
}: {
  to: number;
  from?: number;
  duration?: number;
  delay?: number;
  prefix?: string;
  suffix?: string;
  style?: TextStyle | TextStyle[];
}) {
  const value = useSharedValue(from);

  useEffect(() => {
    value.value = from;
    value.value = withDelay(
      delay,
      withTiming(to, { duration, easing: Easing.bezier(0.2, 0.8, 0.3, 1) }),
    );
  }, [to, from, duration, delay, value]);

  const animatedProps = useAnimatedProps(() => ({
    text: `${prefix}${Math.round(value.value)}${suffix}`,
    defaultValue: `${prefix}${Math.round(value.value)}${suffix}`,
  }));

  return (
    <AnimatedTextInput
      editable={false}
      underlineColorAndroid="transparent"
      animatedProps={animatedProps}
      style={[{ padding: 0, color: "#EFFDF8" }, style]}
    />
  );
}
