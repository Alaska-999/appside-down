import { GlowSurface } from "@/src/components/ui/GlowSurface";
import {
  ICON_ACCENT,
  ICON_MINT_LIGHT,
  ICON_MUTED,
  ICON_PURE_BLACK,
} from "@/src/constants/iconColors";
import {
  GLASS_BORDER_MID,
  GLASS_BORDER_TOP,
  GLASS_SHEEN_SOFT,
  SKY_GLOW,
  SKY_GLOW_FAINT,
  SKY_GLOW_SOFT,
  WHITE_SHEEN_MED,
} from "@/src/constants/rawColors";
import { SURFACE_GLASS_BG } from "@/src/constants/surfaceAlpha";
import { hapticTap } from "@/src/utils/haptics";
import { ComponentType } from "react";
import { View } from "react-native";
import { Text, XStack, YStack } from "tamagui";

const TILE_RADIUS = 20;

const TILE_BORDER = {
  borderAngle: 160,
  borderColors: [GLASS_BORDER_TOP, GLASS_BORDER_MID, SKY_GLOW],
  borderPositions: [0, 0.44, 1],
};

function EdgeHighlights({ live }: { live?: boolean }) {
  return (
    <>
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 0,
          left: 10,
          right: 10,
          height: 1,
          backgroundColor: live ? WHITE_SHEEN_MED : GLASS_SHEEN_SOFT,
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          bottom: 0,
          left: 10,
          right: 10,
          height: 1,
          backgroundColor: live ? SKY_GLOW_SOFT : SKY_GLOW_FAINT,
        }}
      />
    </>
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
      <Text fontSize={9} fontWeight="700" letterSpacing={0.72} color="$textMuted">
        SOON
      </Text>
    </XStack>
  );
}

export function ModeTile({
  icon: Icon,
  label,
  hint,
  live,
  onPress,
}: {
  icon: ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  label: string;
  hint: string;
  live?: boolean;
  onPress?: () => void;
}) {
  const pressable = live && !!onPress;

  const tile = (
    <View style={{ flex: 1, opacity: live ? 1 : 0.46 }}>
      <GlowSurface
        f={1}
        radius={TILE_RADIUS}
        p={15}
        jc="space-between"
        minHeight={94}
        fill={SURFACE_GLASS_BG}
        blurIntensity={30}
        shadowColor={live ? ICON_MINT_LIGHT : ICON_PURE_BLACK}
        shadowOffset={{ width: 0, height: live ? 0 : 4 }}
        shadowRadius={7}
        shadowOpacity={live ? 0.45 : 0.8}
        underlay={<EdgeHighlights live={live} />}
        accessibilityRole={pressable ? "button" : undefined}
        accessibilityLabel={pressable ? label : undefined}
        {...(pressable
          ? {
              onPress: () => {
                hapticTap();
                onPress!();
              },
              pressStyle: { scale: 0.97 },
              transition: "press",
            }
          : null)}
        {...TILE_BORDER}
      >
        <Icon size={22} color={live ? ICON_ACCENT : ICON_MUTED} strokeWidth={1.9} />
        <YStack>
          <Text fontSize={15} fontWeight="700" color="$color">
            {label}
          </Text>
          <Text fontSize={11} color="$textMuted" mt={3}>
            {hint}
          </Text>
        </YStack>
      </GlowSurface>
      {!live && <SoonPill />}
    </View>
  );

  return (
    <YStack f={1} accessibilityLabel={!live ? `${label} — coming soon` : undefined}>
      {tile}
    </YStack>
  );
}
