import { Text, XStack } from "tamagui";

const MOCKUP_SCALE_FINISH = 390 / 265;
const MOCKUP_SCALE_CORE = 390 / 235;

type StatusPillTone = "known" | "learning";

const DOT_STYLES: Record<StatusPillTone, { color: string; glow: string }> = {
  known: { color: "#A3E635", glow: "rgba(163,230,53,0.8)" },
  learning: { color: "#FCA5A5", glow: "rgba(248,113,113,0.6)" },
};

const HINT_STYLES: Record<StatusPillTone, { bg: string; border: string; color: string }> = {
  known: {
    bg: "rgba(163,230,53,0.14)",
    border: "rgba(163,230,53,0.4)",
    color: "#D9F99D",
  },
  learning: {
    bg: "rgba(248,113,113,0.12)",
    border: "rgba(248,113,113,0.35)",
    color: "#FCA5A5",
  },
};

interface StatusPillProps {
  tone: StatusPillTone;
  kind?: "moon" | "hint";
  count?: number;
  label?: string;
  arrow?: "left" | "right";
}

export function StatusPill({ tone, kind = "moon", count, label, arrow }: StatusPillProps) {
  if (kind === "hint") {
    const styles = HINT_STYLES[tone];
    const text = label ?? (tone === "known" ? "know it" : "learning");
    const content =
      arrow === "left" ? `← ${text}` : arrow === "right" ? `${text} →` : text;

    return (
      <XStack
        ai="center"
        br={999}
        px={12 * MOCKUP_SCALE_CORE}
        py={7 * MOCKUP_SCALE_CORE}
        bg={styles.bg}
        borderWidth={1}
        borderColor={styles.border}
      >
        <Text fontSize={11 * MOCKUP_SCALE_CORE} fontWeight="700" color={styles.color}>
          {content}
        </Text>
      </XStack>
    );
  }

  const dot = DOT_STYLES[tone];

  return (
    <XStack
      ai="center"
      gap={7 * MOCKUP_SCALE_FINISH}
      br={999}
      px={13 * MOCKUP_SCALE_FINISH}
      py={8 * MOCKUP_SCALE_FINISH}
      bg="$glassBg"
      borderWidth={1}
      borderColor="$glassBorder"
    >
      <XStack
        width={9 * MOCKUP_SCALE_FINISH}
        height={9 * MOCKUP_SCALE_FINISH}
        br={999}
        bg={dot.color}
        shadowColor={dot.glow}
        shadowOpacity={1}
        shadowRadius={8 * MOCKUP_SCALE_FINISH}
        shadowOffset={{ width: 0, height: 0 }}
      />
      <Text fontSize={13 * MOCKUP_SCALE_FINISH} fontWeight="800" color="$color">
        {count}
      </Text>
      <Text fontSize={10.5 * MOCKUP_SCALE_FINISH} color="$colorMuted">
        {label ?? tone}
      </Text>
    </XStack>
  );
}
