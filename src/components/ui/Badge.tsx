import { TEXT } from "@/src/constants/typography";
import { ReactNode } from "react";
import { Text, XStack } from "tamagui";

type BadgeTone = "neutral" | "success" | "danger" | "info" | "mint";

const TONE_STYLES: Record<
  BadgeTone,
  { bg: string; color: string; borderColor?: string }
> = {
  neutral: { bg: "$glassBgStrong", color: "$colorMuted" },
  success: { bg: "$statusSuccess", color: "white" },
  danger: { bg: "$statusDanger", color: "white" },
  info: { bg: "$statusInfo", color: "white" },
  mint: {
    bg: "$mintGlassBg",
    color: "$mint",
    borderColor: "$mintGlassBorder",
  },
};

interface BadgeProps {
  tone?: BadgeTone;
  icon?: ReactNode;
  children: ReactNode;
}

export function Badge({ tone = "neutral", icon, children }: BadgeProps) {
  const { bg, color, borderColor } = TONE_STYLES[tone];

  return (
    <XStack
      ai="center"
      gap={3}
      px={11}
      py={3}
      br={999}
      bg={bg}
      borderWidth={1}
      borderColor={borderColor ?? "$borderColor"}
    >
      {icon}
      <Text fontSize={TEXT.badge} fontWeight="600" color={color}>
        {children}
      </Text>
    </XStack>
  );
}
