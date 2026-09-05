import { LiquidGlass } from "@/src/components/ui/LiquidGlass";
import { Check, RotateCcw } from "lucide-react-native";
import { useEffect } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Text, XStack } from "tamagui";

type StatusPillTone = "known" | "learning";

const DOT_STYLES: Record<StatusPillTone, { color: string; glow: string }> = {
  known: { color: "#A3E635", glow: "rgba(163,230,53,0.85)" },
  learning: { color: "#818CF8", glow: "rgba(129,140,248,0.75)" },
};

const GAME_STYLES: Record<
  StatusPillTone,
  {
    text: string;
    textLit: string;
    bg: string;
    bgLit: string;
    border: string;
    borderLit: string;
    icon: string;
    glow: string;
  }
> = {
  known: {
    text: "#D7F99A",
    textLit: "#F2FFD9",
    bg: "rgba(163,230,53,0.14)",
    bgLit: "rgba(163,230,53,0.26)",
    border: "rgba(190,242,100,0.28)",
    borderLit: "rgba(190,242,100,0.6)",
    icon: "#BEF264",
    glow: "rgba(190,242,100,0.9)",
  },
  learning: {
    text: "#C7D2FE",
    textLit: "#E0E7FF",
    bg: "rgba(67,56,202,0.42)",
    bgLit: "rgba(67,56,202,0.72)",
    border: "rgba(67,56,202,0.9)",
    borderLit: "rgba(129,140,248,0.7)",
    icon: "#A5B4FC",
    glow: "rgba(67,56,202,1)",
  },
};

interface StatusPillProps {
  tone: StatusPillTone;
  kind?: "moon" | "game";
  count?: number;
  label?: string;
  lit?: boolean;
  dim?: boolean;
}

export function StatusPill({
  tone,
  kind = "moon",
  count,
  label,
  lit = false,
  dim = false,
}: StatusPillProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    scale.value = withTiming(lit ? 1.08 : 1, { duration: 180 });
    opacity.value = withTiming(dim ? 0.34 : 1, { duration: 180 });
  }, [lit, dim, scale, opacity]);

  const liftStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  if (kind === "game") {
    const styles = GAME_STYLES[tone];
    const Icon = tone === "known" ? Check : RotateCcw;

    return (
      <Animated.View style={liftStyle}>
        <XStack
          ai="center"
          gap={8}
          height={38}
          px={15}
          br={999}
          overflow="hidden"
          pos="relative"
          bg={lit ? styles.bgLit : styles.bg}
          borderWidth={1}
          borderColor={lit ? styles.borderLit : styles.border}
          shadowColor={styles.glow}
          shadowOpacity={lit ? 0.9 : 0}
          shadowRadius={13}
          shadowOffset={{ width: 0, height: 0 }}
        >
          <LiquidGlass intensity={18} tint="default" borderRadius={19} />
          <Icon size={15} color={styles.icon} strokeWidth={2.6} />
          <Text
            fontSize={17}
            fontWeight="800"
            letterSpacing={-0.17}
            color={lit ? styles.textLit : styles.text}
          >
            {count}
          </Text>
        </XStack>
      </Animated.View>
    );
  }

  const dot = DOT_STYLES[tone];

  return (
    <XStack
      ai="center"
      gap={8}
      br={999}
      px={14}
      py={9}
      bg="$glassBgSubtle"
      borderWidth={1}
      borderColor="$glassBorderSubtle"
    >
      <XStack
        width={9}
        height={9}
        br={999}
        bg={dot.color}
        shadowColor={dot.glow}
        shadowOpacity={1}
        shadowRadius={9}
        shadowOffset={{ width: 0, height: 0 }}
      />
      <Text fontSize={14} fontWeight="700" color="$color">
        {count}
      </Text>
      <Text fontSize={11} color="$colorMuted">
        {label ?? tone}
      </Text>
    </XStack>
  );
}
