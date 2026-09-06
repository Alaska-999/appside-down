import {
  GlowSurface,
  GlowSurfaceProps,
  GlowTone,
  InnerBloom,
  LAMP_ROW,
  LightLevel,
} from "@/src/components/ui/GlowSurface";
import { GradientBorder } from "@/src/components/ui/GradientBorder";
import { LiquidGlass } from "@/src/components/ui/LiquidGlass";
import {
  ICON_LIME,
  ICON_MINT,
  ICON_MINT_LIGHT,
  ICON_MINT_TINT_DARK,
  ICON_PURE_BLACK,
} from "@/src/constants/iconColors";
import { GRADIENT_ACCENT_LIME } from "@/src/constants/gradients";
import {
  SURFACE_BORDER,
  SURFACE_CARD,
  SURFACE_CARD_DECK_BOTTOM,
  SURFACE_CARD_DECK_TOP,
  SURFACE_CARD_SWEEP,
  SURFACE_GLASS_BG,
  SURFACE_GLASS_BG_FAINT,
  SURFACE_GLASS_BG_STRONG,
  SURFACE_GLASS_BORDER_FAINT,
  SURFACE_ROW_BG_PRESSED,
  SURFACE_ROW_GOLD_FILL,
  SURFACE_ROW_GOLD_FILL_PRESSED,
  SURFACE_WHITE_BORDER,
  SURFACE_WHITE_STRONG,
} from "@/src/constants/surfaceAlpha";
import {
  BLACK_SCRIM_SOFT,
  BLACK_SCRIM_WELL,
  GLASS_BORDER_ACCENT,
  GLASS_BORDER_BOTTOM,
  GLASS_BORDER_MID,
  GLASS_SHEEN_SOFT,
  GLASS_SHEEN_STRONG,
  MINT_FADE_MID,
  MINT_FADE_TRANSPARENT,
  SCRIM_BASE_30,
  SCRIM_BASE_STRONG,
  SCRIM_BASE_TRANSPARENT,
  SCRIM_BASE_MAX,
  TRANSPARENT_BLACK,
} from "@/src/constants/rawColors";
import { EDGE_MINT_FAINT, RING_GLOW_BORDER } from "@/src/constants/focus";
import { withAlpha } from "@/src/utils/withAlpha";
import { LinearGradient } from "expo-linear-gradient";
import { Check } from "lucide-react-native";
import { ReactNode, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { YStack, YStackProps } from "tamagui";

type CardVariant =
  | "surface"
  | "glow"
  | "glass"
  | "accent"
  | "neon"
  | "well"
  | "progressLit"
  | "sweep"
  | "media"
  | "liquid"
  | "solid"
  | "soft"
  | "flat"
  | "row"
  | "rowGold";

type CardSize = "sm" | "md" | "lg";

type CardLayoutProps = Pick<
  YStackProps,
  | "mt"
  | "mb"
  | "ml"
  | "mr"
  | "f"
  | "flex"
  | "w"
  | "width"
  | "h"
  | "height"
  | "minHeight"
  | "ai"
  | "als"
  | "pos"
  | "zIndex"
  | "gap"
  | "px"
  | "py"
  | "p"
  | "jc"
  | "opacity"
  | "overflow"
  | "borderLeftWidth"
  | "borderLeftColor"
  | "br"
  | "testID"
  | "onPress"
>;

interface CardProps extends CardLayoutProps {
  variant?: CardVariant;
  size?: CardSize;
  tone?: GlowTone;
  glow?: LightLevel;
  vivid?: LightLevel;
  selected?: boolean;
  locked?: boolean;
  pressed?: boolean;
  stack?: boolean;
  accentBorder?: boolean;
  lit?: number;
  animateSweep?: boolean;
  cover?: ReactNode;
  children?: ReactNode;
}

const SIZE_STYLES: Record<CardSize, { px: number; py: number; br: number }> = {
  sm: { px: 14, py: 14, br: 18 },
  md: { px: 19, py: 17, br: 20 },
  lg: { px: 19, py: 19, br: 23 },
};


const ROW_BORDER = {
  borderAngle: 140,
  borderColors: [SURFACE_BORDER, SURFACE_GLASS_BG, SURFACE_GLASS_BG_FAINT],
  borderPositions: [0, 0.48, 1],
};

const ROW_LAMP_IDLE = 0.2;
const ROW_LAMP_PRESSED = 0.32;

const SURFACE_VARIANTS: Record<
  | "surface"
  | "glass"
  | "liquid"
  | "well"
  | "progressLit"
  | "sweep"
  | "media"
  | "row"
  | "rowGold",
  Partial<GlowSurfaceProps>
> = {
  surface: {},
  row: {
    fill: SURFACE_CARD,
    blurIntensity: 45,
    lampGeometry: LAMP_ROW,
    ...ROW_BORDER,
  },
  rowGold: {
    fill: SURFACE_ROW_GOLD_FILL,
    blurIntensity: 45,
    lampGeometry: LAMP_ROW,
    ...ROW_BORDER,
  },
  glass: {
    fill: SURFACE_GLASS_BG,
    blurIntensity: 65,
    borderAngle: 140,
    borderColors: [
      GLASS_BORDER_ACCENT,
      GLASS_BORDER_MID,
      GLASS_BORDER_BOTTOM,
    ],
    borderPositions: [0, 0.42, 1],
  },
  liquid: {
    fill: GLASS_BORDER_MID,
    blurIntensity: 12,
    liquidGlass: true,
    borderAngle: 155,
    borderColors: [
      SURFACE_WHITE_STRONG,
      GLASS_BORDER_MID,
      GLASS_SHEEN_SOFT,
    ],
    borderPositions: [0, 0.46, 1],
  },
  well: {
    fill: "$surfaceWell",
    blurIntensity: 0,
    borderAngle: 180,
    borderColors: [BLACK_SCRIM_SOFT, SURFACE_GLASS_BG_STRONG],
    borderPositions: [0, 1],
  },
  progressLit: {
    fill: SURFACE_CARD_DECK_TOP,
    borderAngle: 200,
    borderColors: [SURFACE_BORDER, EDGE_MINT_FAINT],
    borderPositions: [0, 1],
  },
  sweep: {
    fill: SURFACE_CARD_SWEEP,
  },
  media: {},
};

function SweepBand({ animate }: { animate: boolean }) {
  const reduced = useReducedMotion();
  const run = animate && !reduced;
  const shift = useSharedValue(0);

  useEffect(() => {
    if (run) {
      shift.value = -0.42;
      shift.value = withRepeat(
        withTiming(0.42, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      );
    }
  }, [run, shift]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: `${(run ? shift.value : 0) * 100}%` }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: "absolute",
          top: "-40%",
          bottom: "-40%",
          left: "-60%",
          right: "-60%",
        },
        style,
      ]}
    >
      <LinearGradient
        colors={[
          MINT_FADE_TRANSPARENT,
          MINT_FADE_MID,
          withAlpha(ICON_LIME, 0.28),
          withAlpha(ICON_LIME, 0),
        ]}
        locations={[0.34, 0.47, 0.54, 0.66]}
        start={{ x: 0, y: 0.4 }}
        end={{ x: 1, y: 0.6 }}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
}

function SelectedRing({ radius }: { radius: number }) {
  return (
    <>
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: -2,
          left: -2,
          right: -2,
          bottom: -2,
          borderRadius: radius + 2,
          borderWidth: 2,
          borderColor: RING_GLOW_BORDER,
          shadowColor: ICON_MINT,
          shadowOffset: { width: 0, height: 8 },
          shadowRadius: 17,
          shadowOpacity: 0.5,
          zIndex: 4,
        }}
      />
      <View
        pointerEvents="none"
        style={{ position: "absolute", top: 14, right: 14, zIndex: 5 }}
      >
        <LinearGradient
          colors={GRADIENT_ACCENT_LIME}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.76, y: 0.64 }}
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Check size={14} color={ICON_MINT_TINT_DARK} strokeWidth={3} />
        </LinearGradient>
      </View>
    </>
  );
}

export function AppCard(props: CardProps) {
  const {
    variant = "surface",
    size = "md",
    tone = "mint",
    glow,
    vivid,
    selected,
    locked,
    pressed,
    stack,
    accentBorder,
    lit = 0.62,
    animateSweep = false,
    cover,
    children,
    onPress,
    ...rest
  } = props;
  const sizeStyle = SIZE_STYLES[size];
  const accentBorderProps: Partial<YStackProps> = accentBorder
    ? { borderLeftWidth: 3, borderLeftColor: "$accentGradientStart" }
    : {};
  const stateProps: Partial<YStackProps> = {
    ...(locked ? { opacity: 0.42 } : null),
    ...(onPress
      ? { onPress, pressStyle: { scale: 0.982 }, transition: "press" }
      : null),
  };

  let card: ReactNode;

  if (variant === "accent") {
    card = (
      <YStack
        br={sizeStyle.br}
        overflow="hidden"
        pos="relative"
        shadowColor={ICON_MINT_LIGHT}
        shadowOffset={{ width: 0, height: 10 }}
        shadowRadius={20}
        shadowOpacity={0.6}
        {...stateProps}
        {...rest}
      >
        <LinearGradient
          colors={GRADIENT_ACCENT_LIME}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.85, y: 0.85 }}
          style={StyleSheet.absoluteFill}
        />
        <GradientBorder
          radius={sizeStyle.br}
          angle={140}
          colors={[GLASS_BORDER_ACCENT, GLASS_BORDER_MID]}
          positions={[0, 1]}
        />
        <YStack f={1} zIndex={2} px={sizeStyle.px} py={sizeStyle.py}>
          {children}
        </YStack>
        {selected && <SelectedRing radius={sizeStyle.br} />}
      </YStack>
    );
  } else if (variant === "neon") {
    card = (
      <YStack
        br={sizeStyle.br}
        pos="relative"
        borderWidth={1.4}
        borderColor={RING_GLOW_BORDER}
        shadowColor={ICON_MINT}
        shadowOffset={{ width: 0, height: 0 }}
        shadowRadius={15}
        shadowOpacity={0.55}
        {...stateProps}
        {...rest}
      >
        <YStack
          pos="absolute"
          t={0}
          l={0}
          r={0}
          b={0}
          br={sizeStyle.br - 1.4}
          overflow="hidden"
        >
          <LiquidGlass
            intensity={28}
            tint="default"
            borderRadius={sizeStyle.br - 1.4}
            backgroundColor={SCRIM_BASE_30}
          />
          <InnerBloom
            color={withAlpha(ICON_MINT, 0.22)}
            radius={sizeStyle.br}
            spread={22}
            blur={17}
          />
        </YStack>
        <YStack f={1} zIndex={2} px={sizeStyle.px} py={sizeStyle.py}>
          {children}
        </YStack>
        {selected && <SelectedRing radius={sizeStyle.br} />}
      </YStack>
    );
  } else {
    const surfaceKey =
      variant === "glow" ||
      variant === "solid" ||
      variant === "soft" ||
      variant === "flat"
        ? variant === "glow"
          ? "glow"
          : "surface"
        : variant;
    const isRow = variant === "row" || variant === "rowGold";
    const surfaceProps = {
      ...(surfaceKey === "glow"
        ? {}
        : SURFACE_VARIANTS[surfaceKey as keyof typeof SURFACE_VARIANTS]),
      ...(isRow
        ? {
            lampAlpha: pressed ? ROW_LAMP_PRESSED : ROW_LAMP_IDLE,
            fill:
              variant === "rowGold"
                ? pressed
                  ? SURFACE_ROW_GOLD_FILL_PRESSED
                  : SURFACE_ROW_GOLD_FILL
                : pressed
                  ? SURFACE_ROW_BG_PRESSED
                  : SURFACE_CARD,
          }
        : null),
    };

    const underlay =
      variant === "liquid" ? (
        <>
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: 0,
              left: 10,
              right: 10,
              height: 1.2,
              backgroundColor: GLASS_SHEEN_STRONG,
            }}
          />
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              bottom: 0,
              left: 10,
              right: 10,
              height: 1.2,
              backgroundColor: SURFACE_WHITE_BORDER,
            }}
          />
        </>
      ) : variant === "progressLit" ? (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: `${Math.round(lit * 100)}%`,
          }}
        >
          <LinearGradient
            colors={[
              withAlpha(ICON_MINT, 0),
              withAlpha(ICON_MINT, 0.09),
              withAlpha(ICON_MINT, 0.34),
            ]}
            locations={[0, 0.44, 1]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </View>
      ) : variant === "well" ? (
        <>
          <LinearGradient
            colors={[BLACK_SCRIM_WELL, TRANSPARENT_BLACK]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 12,
            }}
            pointerEvents="none"
          />
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 1,
              backgroundColor: SURFACE_GLASS_BORDER_FAINT,
            }}
          />
        </>
      ) : variant === "sweep" ? (
        <SweepBand animate={animateSweep} />
      ) : variant === "media" ? (
        <>
          {cover}
          <LinearGradient
            colors={[SCRIM_BASE_TRANSPARENT, SCRIM_BASE_STRONG, SCRIM_BASE_MAX]}
            locations={[0.24, 0.62, 1]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
        </>
      ) : undefined;

    const liquidShadow =
      variant === "liquid"
        ? {
            shadowColor: ICON_PURE_BLACK,
            shadowOffset: { width: 0, height: 12 },
            shadowRadius: 17,
            shadowOpacity: 0.55,
          }
        : null;

    card = (
      <GlowSurface
        radius={sizeStyle.br}
        tone={tone}
        lamp={variant === "glow"}
        glow={glow}
        vivid={locked ? 0 : vivid}
        px={variant === "media" ? 0 : sizeStyle.px}
        py={variant === "media" ? 0 : sizeStyle.py}
        jc={variant === "media" ? "flex-end" : undefined}
        underlay={underlay}
        overlay={selected ? <SelectedRing radius={sizeStyle.br} /> : undefined}
        {...(locked ? { opacity: 0.42 } : null)}
        {...surfaceProps}
        {...liquidShadow}
        {...accentBorderProps}
        {...(onPress
          ? { onPress, pressStyle: { scale: 0.982 }, transition: "press" }
          : null)}
        {...rest}
      >
        {variant === "media" ? <YStack p={18}>{children}</YStack> : children}
      </GlowSurface>
    );
  }

  if (!stack) return card;

  return (
    <YStack pos="relative" pt={13}>
      <YStack
        pos="absolute"
        t={0}
        l={14}
        r={14}
        h={38}
        br="$cardSoft"
        bg={SURFACE_CARD_DECK_TOP}
        borderWidth={1}
        borderColor="$glassBgStrong"
      />
      <YStack
        pos="absolute"
        t={6}
        l={7}
        r={7}
        h={38}
        br="$cardSoft"
        bg={SURFACE_CARD_DECK_BOTTOM}
        borderWidth={1}
        borderColor="$borderColor"
      />
      <YStack zIndex={3}>{card}</YStack>
    </YStack>
  );
}
