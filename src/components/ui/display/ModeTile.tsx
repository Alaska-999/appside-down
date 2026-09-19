import { OuterGlow } from "@/src/components/ui/fields/FocusRing";
import {
  GlowSurface,
  InnerBloom,
  LAMP_TILE,
} from "@/src/components/ui/surface/GlowSurface";
import { GradientBorder } from "@/src/components/ui/surface/GradientBorder";
import {
  ICON_ACCENT,
  ICON_MINT,
  ICON_MINT_LIGHT,
  ICON_MUTED,
  ICON_PURE_BLACK,
} from "@/src/constants/iconColors";
import {
  GLASS_BORDER_BOTTOM,
  GLASS_BORDER_TOP,
  GLASS_SHEEN_TOP_LINE,
  SKY_GLOW_SOFT,
} from "@/src/constants/rawColors";
import {
  SURFACE_CARD_HARD,
  SURFACE_GLASS_BG,
  SURFACE_GLASS_BG_FAINT,
} from "@/src/constants/surfaceAlpha";
import { hapticTap } from "@/src/utils/haptics";
import { withAlpha } from "@/src/utils/withAlpha";
import { ComponentType } from "react";
import { View } from "react-native";
import { Text, XStack, YStack } from "tamagui";

export type ModeTileState = "live" | "soon" | "locked";
export type ModeTileVariant = "tile" | "launcher";

const TILE_RADIUS = 16;
const TILE_LAMP_EDGE = 0.6;
const TILE_LAMP_ALPHA_LIVE = 0.3;
const TILE_LAMP_ALPHA_DIM = 0.1;

const TILE_SHADOW = {
  shadowColor: ICON_PURE_BLACK,
  shadowOffset: { width: 0, height: 4 },
  shadowRadius: 7,
  shadowOpacity: 0.8,
};
const BADGE_SIZE = 48;
const BADGE_RADIUS = BADGE_SIZE / 2;
const BADGE_GLOW_ALPHA = 0.8;
const BADGE_GLOW_BLUR = 5;
const BADGE_GLOW_WIDTH = 4;
const BADGE_BLOOM_ALPHA = 0.1;
const BADGE_BLOOM_SPREAD = 2;
const BADGE_BLOOM_BLUR = 7;
const SOON_OPACITY = 0.5;

const TILE_BORDER = {
  borderAngle: 160,
  borderColors: [GLASS_BORDER_TOP, GLASS_BORDER_BOTTOM, SKY_GLOW_SOFT],
  borderPositions: [0, 0.46, 1],
};

const BADGE_BORDER_LIVE = [
  withAlpha(ICON_MINT_LIGHT, 0.75),
  withAlpha(ICON_MINT, 0.5),
];

const BADGE_BORDER_SOON = [
  withAlpha(ICON_MUTED, 0.4),
  withAlpha(ICON_MUTED, 0.18),
];

function TopHighlight() {
  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: 0,
        left: 9,
        right: 9,
        height: 1,
        backgroundColor: GLASS_SHEEN_TOP_LINE,
      }}
    />
  );
}

function SoonPill() {
  return (
    <XStack
      pos="absolute"
      t={12}
      r={12}
      zIndex={3}
      px={7}
      py={3}
      br={999}
      bg="$glassBorderFaint"
      borderWidth={1}
      borderColor="$borderColor"
    >
      <Text
        fontSize={9}
        fontWeight="700"
        letterSpacing={0.72}
        color="$textMuted"
      >
        SOON
      </Text>
    </XStack>
  );
}

function IconBadge({
  icon: Icon,
  live,
}: {
  icon: ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  live: boolean;
}) {
  return (
    <YStack
      w={BADGE_SIZE}
      h={BADGE_SIZE}
      ai="center"
      jc="center"
      pos="relative"
    >
      {live && (
        <OuterGlow
          radius={BADGE_RADIUS}
          color={withAlpha(ICON_MINT_LIGHT, BADGE_GLOW_ALPHA)}
          blur={BADGE_GLOW_BLUR}
          width={BADGE_GLOW_WIDTH}
        />
      )}
      <YStack
        pos="absolute"
        t={0}
        l={0}
        r={0}
        b={0}
        br={BADGE_RADIUS}
        overflow="hidden"
        bg={live ? SURFACE_CARD_HARD : withAlpha(ICON_MUTED, 0.06)}
      >
        {live && (
          <InnerBloom
            color={withAlpha(ICON_MINT, BADGE_BLOOM_ALPHA)}
            radius={BADGE_RADIUS}
            spread={BADGE_BLOOM_SPREAD}
            blur={BADGE_BLOOM_BLUR}
          />
        )}
      </YStack>
      <GradientBorder
        radius={BADGE_RADIUS}
        angle={150}
        colors={live ? BADGE_BORDER_LIVE : BADGE_BORDER_SOON}
        positions={[0, 1]}
      />
      <YStack zIndex={2}>
        <Icon
          size={23}
          color={live ? ICON_MINT_LIGHT : ICON_MUTED}
          strokeWidth={1.9}
        />
      </YStack>
    </YStack>
  );
}

export function ModeTile({
  icon: Icon,
  label,
  hint,
  state,
  variant = "tile",
  onPress,
}: {
  icon: ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  label: string;
  hint: string;
  state: ModeTileState;
  variant?: ModeTileVariant;
  onPress?: () => void;
}) {
  const live = state === "live";
  const pressable = live && !!onPress;
  const launcher = variant === "launcher";

  const pressProps = pressable
    ? {
        onPress: () => {
          hapticTap();
          onPress!();
        },
        pressStyle: { scale: 0.97 },
        transition: "press" as const,
        accessibilityRole: "button" as const,
        accessibilityLabel: label,
      }
    : null;

  const tile = launcher ? (
    <View style={{ flex: 1, opacity: live ? 1 : SOON_OPACITY }}>
      <GlowSurface
        f={1}
        radius={TILE_RADIUS}
        px={8}
        pt={14}
        pb={12}
        gap={9}
        ai="center"
        jc="center"
        minHeight={104}
        tone="mint"
        lampAlpha={live ? TILE_LAMP_ALPHA_LIVE : TILE_LAMP_ALPHA_DIM}
        lampGeometry={LAMP_TILE}
        lampEdge={TILE_LAMP_EDGE}
        fill={SURFACE_GLASS_BG_FAINT}
        blurIntensity={30}
        underlay={<TopHighlight />}
        {...TILE_SHADOW}
        {...pressProps}
        {...TILE_BORDER}
      >
        <IconBadge icon={Icon} live={live} />
        <Text
          fontSize={12.5}
          fontWeight="700"
          color="$color"
          numberOfLines={1}
          textAlign="center"
        >
          {label}
        </Text>
      </GlowSurface>
    </View>
  ) : (
    <View style={{ flex: 1, opacity: live ? 1 : 0.46 }}>
      <GlowSurface
        f={1}
        radius={TILE_RADIUS}
        p={15}
        jc="space-between"
        minHeight={94}
        fill={SURFACE_GLASS_BG}
        blurIntensity={30}
        underlay={<TopHighlight />}
        {...TILE_SHADOW}
        {...pressProps}
        {...TILE_BORDER}
      >
        <Icon
          size={22}
          color={live ? ICON_ACCENT : ICON_MUTED}
          strokeWidth={1.9}
        />
        <YStack>
          <Text fontSize={15} fontWeight="700" color="$color">
            {label}
          </Text>
          <Text fontSize={11} color="$textMuted" mt={3}>
            {hint}
          </Text>
        </YStack>
      </GlowSurface>
      {state === "soon" && <SoonPill />}
    </View>
  );

  return (
    <YStack
      f={1}
      accessibilityLabel={
        state === "soon"
          ? `${label} — coming soon`
          : state === "locked"
            ? `${label} — ${hint}`
            : undefined
      }
    >
      {tile}
    </YStack>
  );
}
