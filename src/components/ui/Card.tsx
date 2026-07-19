import { ReactNode } from "react";
import { YStack, YStackProps } from "tamagui";
import { GlowSurface, GlowSurfaceProps } from "./GlowSurface";

type CardVariant = "solid" | "soft" | "glass";

interface CardProps extends YStackProps {
  variant?: CardVariant;
  children?: ReactNode;
}

const GLASS_VARIANTS: Record<
  "soft" | "glass",
  Pick<
    GlowSurfaceProps,
    "br" | "glowRadius" | "glowOpacity" | "insetHighlightColor"
  >
> = {
  soft: {
    br: "$cardSoft",
    glowRadius: 18,
    glowOpacity: 0.07,
    insetHighlightColor: "rgba(255,255,255,0.1)",
  },
  glass: {
    br: "$card",
    glowRadius: 28,
    glowOpacity: 0.14,
    insetHighlightColor: "rgba(255,255,255,0.18)",
  },
};

export function AppCard(props: CardProps) {
  const { variant = "solid", children, ...rest } = props;

  if (variant === "solid") {
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

  return (
    <GlowSurface
      glow
      insetHighlight
      p="$cardPad"
      bg="$glassBg"
      borderWidth={1}
      borderColor="$glassBorder"
      {...GLASS_VARIANTS[variant]}
      {...rest}
    >
      {children}
    </GlowSurface>
  );
}
