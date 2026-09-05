import { GlowSurface } from "@/src/components/ui/GlowSurface";
import { ICON_ACCENT, ICON_MUTED } from "@/src/constants/iconColors";
import { hapticTap } from "@/src/utils/haptics";
import { ComponentType } from "react";
import { Pressable, View } from "react-native";
import { Text, XStack, YStack } from "tamagui";

const TILE_RADIUS = 20;

const TILE_BORDER = {
  borderAngle: 160,
  borderColors: [
    "rgba(255,255,255,0.48)",
    "rgba(255,255,255,0.05)",
    "rgba(150,220,255,0.24)",
  ],
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
          backgroundColor: live
            ? "rgba(255,255,255,0.42)"
            : "rgba(255,255,255,0.32)",
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
          backgroundColor: live
            ? "rgba(120,220,255,0.2)"
            : "rgba(120,220,255,0.16)",
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
      bg="rgba(220,255,245,0.07)"
      borderWidth={1}
      borderColor="rgba(220,255,245,0.12)"
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
  const tile = (pressed: boolean) => (
    <View
      style={{
        flex: 1,
        opacity: live ? 1 : 0.46,
        transform: [{ scale: pressed && live ? 0.97 : 1 }],
      }}
    >
      <GlowSurface
        f={1}
        radius={TILE_RADIUS}
        p={15}
        jc="space-between"
        minHeight={94}
        fill="rgba(220,255,245,0.045)"
        blurIntensity={30}
        shadowColor={live ? "rgba(94,234,212,1)" : "#000"}
        shadowOffset={{ width: 0, height: live ? 0 : 4 }}
        shadowRadius={7}
        shadowOpacity={live ? 0.45 : 0.8}
        underlay={<EdgeHighlights live={live} />}
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

  if (!live || !onPress) {
    return (
      <YStack f={1} accessibilityLabel={`${label} — coming soon`}>
        {tile(false)}
      </YStack>
    );
  }

  return (
    <Pressable
      style={{ flex: 1 }}
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => {
        hapticTap();
        onPress();
      }}
    >
      {({ pressed }) => tile(pressed)}
    </Pressable>
  );
}
