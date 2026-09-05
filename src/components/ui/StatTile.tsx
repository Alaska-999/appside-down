import { GlowSurface, LAMP_TILE } from "@/src/components/ui/GlowSurface";
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
        backgroundColor: "rgba(255,255,255,0.3)",
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
    fill: "rgba(220,255,245,0.04)",
    color: "$limeLight",
  },
  learning: {
    tone: "mint",
    lampAlpha: 0.3,
    fill: "rgba(220,255,245,0.04)",
    color: "$mintLight",
  },
  new: {
    tone: "neutral",
    lampAlpha: 0.1,
    fill: "rgba(220,255,245,0.035)",
    color: "#E4F2F8",
  },
};

const TILE_BORDER = {
  borderAngle: 160,
  borderColors: [
    "rgba(255,255,255,0.46)",
    "rgba(255,255,255,0.04)",
    "rgba(150,220,255,0.2)",
  ],
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
      shadowColor="#000"
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
