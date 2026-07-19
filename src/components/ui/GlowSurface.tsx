import { LinearGradient } from "@tamagui/linear-gradient";
import { YStack, YStackProps } from "tamagui";

export interface GlowSurfaceProps extends YStackProps {
  glow?: boolean;
  glowRadius?: number;
  glowOffset?: { width: number; height: number };
  glowColor?: YStackProps["shadowColor"];
  insetHighlight?: boolean;
  insetHighlightColor?: string;
}

export function GlowSurface({
  glow,
  br,
  bg,
  children,
  glowRadius = 20,
  glowOffset = { width: 0, height: 0 },
  glowColor = "$glowSoft",
  insetHighlight = false,
  insetHighlightColor = "rgba(255, 255, 255, 0.12)",
  ...rest
}: GlowSurfaceProps) {
  return (
    <YStack br={br} pos="relative" overflow="visible" {...rest}>
      {glow && (
        <YStack
          pos="absolute"
          t={0}
          l={0}
          r={0}
          b={0}
          br={br}
          bg="$background"
          shadowColor={glowColor}
          shadowOpacity={0.07}
          shadowRadius={glowRadius}
          shadowOffset={glowOffset}
          elevation={0}
          zIndex={-1}
        />
      )}

      {bg ? (
        <YStack
          pos="absolute"
          t={0}
          l={0}
          r={0}
          b={0}
          br={br}
          bg={bg}
          zIndex={0}
        />
      ) : null}

      {insetHighlight ? (
        <LinearGradient
          colors={[insetHighlightColor, "rgba(255, 255, 255, 0)"]}
          start={[0, 0]}
          end={[0, 1]}
          pos="absolute"
          t={0}
          l={0}
          r={0}
          h={12}
          btlr={br}
          btrr={br}
          pointerEvents="none"
          zIndex={1}
        />
      ) : null}

      {insetHighlight ? (
        <YStack
          pos="absolute"
          t={0}
          l={0}
          r={0}
          b={0}
          br={br}
          borderWidth={1}
          borderColor="$glassBorder"
          pointerEvents="none"
          zIndex={2}
        />
      ) : null}

      <YStack f={1} zIndex={3}>
        {children}
      </YStack>
    </YStack>
  );
}
