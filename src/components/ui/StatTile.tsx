import { GlowSurface, LAMP_TILE } from "@/src/components/ui/GlowSurface";
import { ICON_ON_GLASS, ICON_PURE_BLACK } from "@/src/constants/iconColors";
import {
  GLASS_BORDER_BOTTOM,
  GLASS_BORDER_TOP,
  GLASS_SHEEN_TOP_LINE,
  SKY_GLOW_SOFT,
} from "@/src/constants/rawColors";
import { SURFACE_GLASS_BG_FAINT } from "@/src/constants/surfaceAlpha";
import { View } from "react-native";
import { Text } from "tamagui";

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

export type StatTone = "known" | "learning" | "new";

const TONE_STYLES: Record<
  StatTone,
  { tone: "lime" | "mint" | "neutral"; lampAlpha: number; fill: string; color: string }
> = {
  known: {
    tone: "lime",
    lampAlpha: 0.3,
    fill: SURFACE_GLASS_BG_FAINT,
    color: "$limeLight",
  },
  learning: {
    tone: "mint",
    lampAlpha: 0.3,
    fill: SURFACE_GLASS_BG_FAINT,
    color: "$mintLight",
  },
  new: {
    tone: "neutral",
    lampAlpha: 0.1,
    fill: SURFACE_GLASS_BG_FAINT,
    color: ICON_ON_GLASS,
  },
};

const TILE_BORDER = {
  borderAngle: 160,
  borderColors: [GLASS_BORDER_TOP, GLASS_BORDER_BOTTOM, SKY_GLOW_SOFT],
  borderPositions: [0, 0.46, 1],
};

export function StatTile({
  tone,
  value,
  label,
}: {
  tone: StatTone;
  value: number;
  label: string;
}) {
  const style = TONE_STYLES[tone];

  return (
    <GlowSurface
      f={1}
      radius={16}
      px={13}
      py={12}
      tone={style.tone}
      lampAlpha={style.lampAlpha}
      lampGeometry={LAMP_TILE}
      lampEdge={0.6}
      fill={style.fill}
      blurIntensity={30}
      shadowColor={ICON_PURE_BLACK}
      shadowOffset={{ width: 0, height: 4 }}
      shadowRadius={7}
      shadowOpacity={0.8}
      underlay={<TopHighlight />}
      {...TILE_BORDER}
    >
      <Text
        fontSize={21}
        fontWeight="800"
        letterSpacing={-0.42}
        lineHeight={21}
        color={style.color}
      >
        {value}
      </Text>
      <Text fontSize={10.5} color="$textMuted" mt={5}>
        {label}
      </Text>
    </GlowSurface>
  );
}
