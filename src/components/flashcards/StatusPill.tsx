import { ReactElement } from "react";
import { Text, XStack } from "tamagui";

const MOCKUP_SCALE = 390 / 290;

const VARIANT_STYLES = {
  danger: {
    bg: "rgba(239,68,68,0.14)",
    border: "rgba(239,68,68,0.35)",
    color: "#EF4444",
  },
  success: {
    bg: "rgba(16,185,129,0.14)",
    border: "rgba(16,185,129,0.35)",
    color: "#10B981",
  },
} as const;

interface StatusPillProps {
  icon: ReactElement;
  text: string;
  variant: keyof typeof VARIANT_STYLES;
}

export function StatusPill({ icon, text, variant }: StatusPillProps) {
  const styles = VARIANT_STYLES[variant];

  return (
    <XStack
      ai="center"
      gap={5 * MOCKUP_SCALE}
      br={999}
      px={12 * MOCKUP_SCALE}
      py={5 * MOCKUP_SCALE}
      bg={styles.bg}
      borderWidth={1}
      borderColor={styles.border}
    >
      {icon}
      <Text fontSize={11.5 * MOCKUP_SCALE} fontWeight="800" color={styles.color}>
        {text}
      </Text>
    </XStack>
  );
}
