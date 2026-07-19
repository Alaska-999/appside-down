import { ReactNode } from "react";
import { YStack, YStackProps } from "tamagui";
import { GlowSurface } from "./GlowSurface";

type CardVariant = "solid" | "soft" | "glass";

interface CardProps extends YStackProps {
  variant?: CardVariant;
  children?: ReactNode;
}

// "glass" і "soft" використовують ту саму напівпрозору поверхню ($glassBg/$glassBorder) —
// різниця лише в м'якому glow-світінні для акцентних поверхонь. Раніше "glass" ще й
// реально розмивав контент через BlurView, але за затвердженим дизайном тло під
// картками пласке (нема чого розмивати) — реальний blur лишили тільки для ScreenHeader,
// де під ним справді прокручується контент
export function AppCard({ variant = "solid", children, ...rest }: CardProps) {
  if (variant === "glass") {
    return (
      <GlowSurface
        glow
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

  return (
    <YStack
      br={variant === "soft" ? "$card" : "$4"}
      p="$4"
      bg={variant === "soft" ? "$glassBg" : "$backgroundStrong"}
      borderWidth={1}
      borderColor={variant === "soft" ? "$glassBorder" : "$borderColor"}
      {...rest}
    >
      {children}
    </YStack>
  );
}
