import {
  ICON_LIME_LIGHT,
  ICON_MUTED,
  ICON_ON_GLASS,
} from "@/src/constants/iconColors";
import { Star } from "lucide-react-native";

type StarGlyphMode = "indicator" | "toggle";
type StarGlyphSize = "sm" | "md" | "lg";

const SIZE_STYLES: Record<StarGlyphSize, { size: number }> = {
  sm: { size: 13 },
  md: { size: 18 },
  lg: { size: 22 },
};

const STROKE = 1.8;
const ACTIVE_FILL = "rgba(183, 249, 68, 0.1)";

interface StarGlyphProps {
  mode?: StarGlyphMode;
  size?: StarGlyphSize;
  active?: boolean;
  onGlass?: boolean;
}

export function StarGlyph({
  mode = "indicator",
  size = mode === "indicator" ? "sm" : "md",
  active = false,
  onGlass = false,
}: StarGlyphProps) {
  const s = SIZE_STYLES[size];

  if (mode === "indicator") {
    return (
      <Star
        size={s.size}
        strokeWidth={STROKE}
        color={ICON_LIME_LIGHT}
        fill={ICON_LIME_LIGHT}
      />
    );
  }

  return (
    <Star
      size={s.size}
      strokeWidth={STROKE}
      color={active ? ICON_LIME_LIGHT : onGlass ? ICON_ON_GLASS : ICON_MUTED}
      fill={active ? ACTIVE_FILL : "transparent"}
    />
  );
}
