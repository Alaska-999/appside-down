import { ICON_MINT } from "@/src/constants/iconColors";
import { withAlpha } from "@/src/utils/withAlpha";
import { useEffect } from "react";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { Text, XStack, XStackProps } from "tamagui";

const DOT_SIZE = 9.36;
const DOT_RADIUS = 4.68;
const PULSE_HALF_DURATION = 500;
const MINT = ICON_MINT;

type SyncingPillLayoutProps = Pick<
  XStackProps,
  "mt" | "mb" | "ml" | "mr" | "pos" | "top" | "right" | "bottom" | "left" | "zIndex" | "testID"
>;

export function SyncingPill({ ...rest }: SyncingPillLayoutProps) {
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
      borderColor={withAlpha(ICON_MINT, 0.25)}
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
            backgroundColor: MINT,
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
