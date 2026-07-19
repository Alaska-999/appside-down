import { TEXT } from "@/src/constants/typography";
import { ReactNode } from "react";
import { Text, XStack } from "tamagui";

type BadgeTone = "neutral" | "success" | "danger" | "info";

const TONE_STYLES: Record<BadgeTone, { bg: string; color: string }> = {
  neutral: { bg: "$glassBgStrong", color: "$colorMuted" },
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
      gap={3}
      px={11}
      py={3}
      br={999}
      bg={bg}
      borderWidth={1}
      borderColor="$glassBorder"
    >
      {icon}
      <Text fontSize={TEXT.badge} fontWeight="600" color={color}>
        {children}
      </Text>
    </XStack>
  );
}
