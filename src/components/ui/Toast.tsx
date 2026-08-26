import { AlertCircle } from "lucide-react-native";
import { useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Text, View, XStack, YStack } from "tamagui";

interface AppToastProps {
  open: boolean;
  message: string;
  description?: string;
  duration?: number;
  onDismiss?: () => void;
}

export function AppToast({ open, message, description, duration = 3200, onDismiss }: AppToastProps) {
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const progress = useSharedValue(0);

  useEffect(() => {
    if (!open) return;
    progress.value = 0;
    progress.value = withTiming(1, { duration: 220 });

    if (!onDismiss) return;
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [open, duration, onDismiss, progress]);

  const style = useAnimatedStyle(() => ({
    opacity: reduced ? (open ? 1 : 0) : progress.value,
    transform: [{ translateY: reduced ? 0 : (1 - progress.value) * 12 }],
  }));

  if (!open) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          left: 16,
          right: 16,
          bottom: insets.bottom + 24,
          zIndex: 9,
        },
        style,
      ]}
    >
      <XStack
        ai="center"
        gap={11}
        br={18}
        px={16}
        py={14}
        bg="rgba(40,14,18,0.82)"
        borderWidth={1}
        borderColor="rgba(239,68,68,0.36)"
        shadowColor="#000"
        shadowOffset={{ width: 0, height: 14 }}
        shadowRadius={17}
        shadowOpacity={0.5}
      >
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0,
            left: 18,
            right: 18,
            height: 1,
            backgroundColor: "rgba(255,255,255,0.2)",
          }}
        />
        <AlertCircle size={19} color="#FCA5A5" strokeWidth={2.2} />
        <YStack f={1}>
          <Text fontSize={13.5} fontWeight="600" color="#FFE4E6">
            {message}
          </Text>
          {description && (
            <Text fontSize={11.5} fontWeight="500" color="#FFE4E6" opacity={0.75} mt={2}>
              {description}
            </Text>
          )}
        </YStack>
      </XStack>
    </Animated.View>
  );
}
