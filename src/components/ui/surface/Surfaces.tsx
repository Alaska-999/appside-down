import { FocusRing } from "@/src/components/ui/FocusRing";
import { GradientBorder } from "@/src/components/ui/GradientBorder";
import { LiquidGlass } from "@/src/components/ui/LiquidGlass";
import {
  WELL_BORDERS,
  WELL_FILL,
  WELL_FILL_FOCUS,
  WellInsetShadow,
  WellState,
} from "@/src/components/ui/Well";
import { INPUT_GLASS_TINT } from "@/src/constants/rawColors";
import {
  SURFACE_BORDER,
  SURFACE_GLASS_BG_STRONG,
  SURFACE_GLASS_BORDER_FAINT,
} from "@/src/constants/surfaceAlpha";
import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { SharedValue } from "react-native-reanimated";
import { YStack, YStackProps } from "tamagui";

export type SurfaceVariant = "well" | "glass" | "plain";
export type SurfaceState = WellState;

type SurfaceSpec = {
  fill: { default: string; focus: string } | null;
  glass: boolean;
  divider: string;
};

export const SURFACE_VARIANTS: Record<SurfaceVariant, SurfaceSpec> = {
  well: {
    fill: { default: WELL_FILL, focus: WELL_FILL_FOCUS },
    glass: false,
    divider: SURFACE_BORDER,
  },
  glass: {
    fill: null,
    glass: true,
    divider: SURFACE_GLASS_BG_STRONG,
  },
  plain: {
    fill: null,
    glass: false,
    divider: SURFACE_BORDER,
  },
};

export const GLASS_BORDER = {
  angle: 150,
  colors: [SURFACE_BORDER, SURFACE_GLASS_BORDER_FAINT],
  positions: [0, 1],
};

export function SurfaceLayers({
  variant,
  state = "default",
  radius,
  focusProgress,
}: {
  variant: SurfaceVariant;
  state?: SurfaceState;
  radius: number;
  focusProgress?: SharedValue<number>;
}) {
  const spec = SURFACE_VARIANTS[variant];
  if (variant === "plain") return null;

  return (
    <>
      <YStack
        pos="absolute"
        t={0}
        l={0}
        r={0}
        b={0}
        br={radius}
        overflow="hidden"
      >
        {spec.glass ? (
          <LiquidGlass
            intensity={45}
            tint="default"
            borderRadius={radius}
            backgroundColor={INPUT_GLASS_TINT}
          />
        ) : (
          <>
            <View
              style={[
                StyleSheet.absoluteFill,
                {
                  backgroundColor:
                    state === "focus"
                      ? spec.fill!.focus
                      : spec.fill!.default,
                },
              ]}
            />
            <WellInsetShadow radius={radius} />
          </>
        )}
      </YStack>
      {spec.glass ? (
        <GradientBorder
          radius={radius}
          angle={GLASS_BORDER.angle}
          colors={GLASS_BORDER.colors}
          positions={GLASS_BORDER.positions}
        />
      ) : (
        <GradientBorder
          radius={radius}
          angle={180}
          colors={WELL_BORDERS[state].colors}
          positions={WELL_BORDERS[state].positions}
        />
      )}
      {focusProgress && <FocusRing radius={radius} progress={focusProgress} />}
    </>
  );
}

type SurfaceLayoutProps = Pick<
  YStackProps,
  | "p"
  | "px"
  | "py"
  | "gap"
  | "ai"
  | "jc"
  | "fd"
  | "mt"
  | "mb"
  | "f"
  | "flex"
  | "w"
  | "als"
>;

export function Surface({
  variant = "glass",
  state = "default",
  radius = 20,
  children,
  ...layout
}: SurfaceLayoutProps & {
  variant?: SurfaceVariant;
  state?: SurfaceState;
  radius?: number;
  children: ReactNode;
}) {
  return (
    <YStack pos="relative" br={radius}>
      <SurfaceLayers variant={variant} state={state} radius={radius} />
      <YStack zIndex={2} {...layout}>
        {children}
      </YStack>
    </YStack>
  );
}
