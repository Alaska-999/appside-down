import { ReactNode } from "react";
import { YStack, YStackProps } from "tamagui";
import { GlowSurface } from "./GlowSurface";

type CardVariant = "solid" | "soft" | "glass";

interface CardProps extends YStackProps {
  variant?: CardVariant;
  children?: ReactNode;
}

export function AppCard(props: CardProps) {
  const { variant = "solid", children, ...rest } = props;

  if (variant === "glass") {
    return (
      <GlowSurface
        glow
        insetHighlight
        br="$card"
        p="$cardPad"
        bg="$glassBg"
        borderWidth={1}
        borderColor="$glassBorder"
        {...rest}
      >
        {children}
      </GlowSurface>
    );
  }

  if (variant === "soft") {
    return (
      <GlowSurface
        glow
        insetHighlight
        br="$cardSoft"
        p="$cardPad"
        bg="$glassBg"
        borderWidth={1}
        borderColor="$glassBorder"
        {...rest}
      >
        {children}
      </GlowSurface>
    );
  }

  return (
    <YStack
      br="$4"
      p="$4"
      bg="$backgroundStrong"
      borderWidth={1}
      borderColor="$borderColor"
      {...rest}
    >
      {children}
    </YStack>
  );
}
