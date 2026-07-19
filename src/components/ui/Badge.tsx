import { ReactNode } from "react";
import { Text, XStack } from "tamagui";

type BadgeTone = "neutral" | "success" | "danger" | "info";

const TONE_STYLES: Record<BadgeTone, { bg: string; color: string }> = {
  neutral: { bg: "$glassBg", color: "$colorSecondary" },
  success: { bg: "$statusSuccess", color: "white" },
  danger: { bg: "$statusDanger", color: "white" },
  info: { bg: "$statusInfo", color: "white" },
};

interface BadgeProps {
  tone?: BadgeTone;
  icon?: ReactNode;
  children: ReactNode;
}

export function Badge({ tone = "neutral", icon, children }: BadgeProps) {
  const { bg, color } = TONE_STYLES[tone];

  return (
    <XStack
      ai="center"
      gap="$1"
      px="$2"
      py="$1"
      br="$10"
      bg={bg}
      borderWidth={tone === "neutral" ? 1 : 0}
      borderColor="$glassBorder"
    >
      {icon}
      <Text fontSize="$1" fontWeight="600" color={color}>
        {children}
      </Text>
    </XStack>
  );
}
