import { ReactNode } from "react";
import { YStack, YStackProps } from "tamagui";
import { GlowSurface, GlowSurfaceProps } from "./GlowSurface";

type CardVariant = "solid" | "soft" | "glass" | "flat";
type CardSize = "sm" | "md" | "lg";

interface CardProps extends YStackProps {
  variant?: CardVariant;
  size?: CardSize;
  accentBorder?: boolean;
  children?: ReactNode;
}

const SIZE_STYLES: Record<CardSize, { px: number; py: number; br: number }> = {
  sm: { px: 14, py: 14, br: 18 },
  md: { px: 19, py: 17, br: 20 },
  lg: { px: 19, py: 19, br: 23 },
};

const GLOW_VARIANTS: Record<
  "soft" | "glass",
  Pick<GlowSurfaceProps, "glowRadius" | "glowOpacity" | "insetHighlightColor">
> = {
  soft: {
    glowRadius: 18,
    glowOpacity: 0.07,
    insetHighlightColor: "rgba(255,255,255,0.1)",
  },
  glass: {
    glowRadius: 28,
    glowOpacity: 0.14,
    insetHighlightColor: "rgba(255,255,255,0.18)",
  },
};

export function AppCard(props: CardProps) {
  const {
    variant = "solid",
    size = "md",
    accentBorder,
    children,
    ...rest
  } = props;
  const sizeStyle = SIZE_STYLES[size];
  const accentBorderStyle = {
    borderLeftWidth: accentBorder ? 3 : 0,
    borderLeftColor: accentBorder ? "$accentGradientStart" : "$glassBorder",
  };

  if (variant === "solid") {
    return (
      <YStack
        br="$4"
        p="$4"
        bg="$backgroundStrong"
        borderWidth={1}
        borderColor="$borderColor"
        {...accentBorderStyle}
        {...rest}
      >
        {children}
      </YStack>
    );
  }

  if (variant === "flat") {
    return (
      <YStack
        br={sizeStyle.br}
        px={sizeStyle.px}
        py={sizeStyle.py}
        bg="$glassBgSubtle"
        border="1"
        borderColor="$glassBgStrong"
        {...accentBorderStyle}
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
      br={sizeStyle.br}
      px={sizeStyle.px}
      py={sizeStyle.py}
      bg="$glassBg"
      borderWidth={1}
      borderColor="$glassBorder"
      {...GLOW_VARIANTS[variant]}
      {...accentBorderStyle}
      {...rest}
    >
      {children}
    </GlowSurface>
  );
}
