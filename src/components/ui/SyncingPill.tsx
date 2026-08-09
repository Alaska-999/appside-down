import { useEffect } from "react";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { Text, useTheme, XStack, XStackProps } from "tamagui";

const MOCKUP_SCALE = 390 / 250;

const DOT_SIZE = 6 * MOCKUP_SCALE;
const DOT_RADIUS = 3 * MOCKUP_SCALE;
const PULSE_HALF_DURATION = 500;

export function SyncingPill({ ...rest }: XStackProps) {
  const theme = useTheme();
  const mint = theme.accentGradientStart.get();
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.4, {
        duration: PULSE_HALF_DURATION,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );
  }, [opacity]);

  const dotStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <XStack
      ai="center"
      gap={9.36}
      bg="$glowSoft"
      borderWidth={1}
      borderColor="rgba(45,212,191,0.25)"
      br={999}
      px={15.6}
      py={7.8}
      {...rest}
    >
      <Animated.View
        style={[
          {
            width: DOT_SIZE,
            height: DOT_SIZE,
            borderRadius: DOT_RADIUS,
            backgroundColor: mint,
          },
          dotStyle,
        ]}
      />
      <Text fontSize={16.38} fontWeight="700" color="$mint">
        Syncing
      </Text>
    </XStack>
  );
}
