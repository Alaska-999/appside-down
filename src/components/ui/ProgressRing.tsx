import { useEffect } from "react";
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";
import { Text, useTheme, View } from "tamagui";

const MOCKUP_SCALE = 390 / 290;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  labelFontSize?: number;
  caption?: string;
  color?: string;
  animated?: boolean;
}

export function ProgressRing({
  progress,
  size = 64,
  strokeWidth = 8,
  label,
  labelFontSize = 13,
  caption,
  color,
  animated = false,
}: ProgressRingProps) {
  const theme = useTheme();
  const ringColor = color ?? theme.accentGradientEnd.get();
  const trackColor = "rgba(255,255,255,0.14)";
  const holeColor = theme.backgroundStrong.get();

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(Math.max(progress, 0), 1);

  const animatedProgress = useSharedValue(animated ? 0 : clamped);

  useEffect(() => {
    animatedProgress.value = withTiming(clamped, {
      duration: animated ? 900 : 0,
      easing: Easing.out(Easing.cubic),
    });
  }, [clamped, animated]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - animatedProgress.value),
  }));

  return (
    <View
      width={size}
      height={size}
      ai="center"
      jc="center"
      shadowColor={theme.accentGradientStart.get()}
      shadowOpacity={0.4}
      shadowRadius={15}
      shadowOffset={{ width: 0, height: 0 }}
    >
      <Svg width={size} height={size} style={{ position: "absolute" }}>
        <Circle cx={size / 2} cy={size / 2} r={radius} fill={holeColor} />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={ringColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="butt"
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      {label && (
        <Text fontSize={labelFontSize} fontWeight="800" color="$color">
          {label}
        </Text>
      )}
      {caption && (
        <Text fontSize={9.5 * MOCKUP_SCALE} color="$colorMuted" mt={-2}>
          {caption}
        </Text>
      )}
    </View>
  );
}
