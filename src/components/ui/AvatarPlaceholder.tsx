import {
  ICON_ACCENT,
  ICON_BASE_DEEP,
  ICON_MINT_TINT_DARK,
  ICON_MUTED,
  ICON_TEAL,
  ICON_WHITE,
} from "@/src/constants/iconColors";
import { LinearGradient } from "expo-linear-gradient";
import { Text } from "tamagui";

export type AvatarPlaceholderVariant =
  | "tealDeep"
  | "mintGlass"
  | "limeGlass"
  | "nightMint"
  | "frostMuted"
  | "frostLight"
  // | "frostDark"
  | "frostAccent"
  | "mintGlassSoft"
  | "mintGlassLit"
  | "limeGlassLit"
  | "frostGlass"
  | "nightMintLit"
  | "frostVeil"
  | "frostVeilSoft"
  | "frostVeilGlow"
  | "frostVeilMint";

export const AVATAR_PLACEHOLDER_VARIANT: AvatarPlaceholderVariant =
  "frostAccent";

type VariantStyle = {
  colors: [string, string, ...string[]];
  locations?: [number, number, ...number[]];
  textColor: string;
  borderColor?: string;
};

const VARIANTS: Record<AvatarPlaceholderVariant, VariantStyle> = {
  tealDeep: {
    colors: [ICON_TEAL, ICON_MINT_TINT_DARK],
    textColor: "$mintLight",
  },
  mintGlass: {
    colors: ["rgba(45,212,191,0.14)", "rgba(45,212,191,0.14)"],
    textColor: "$mint",
    borderColor: "rgba(45,212,191,0.28)",
  },
  limeGlass: {
    colors: ["rgba(163,230,53,0.15)", "rgba(163,230,53,0.15)"],
    textColor: "$limeLight",
    borderColor: "rgba(163,230,53,0.4)",
  },
  nightMint: {
    colors: [ICON_BASE_DEEP, ICON_MINT_TINT_DARK],
    textColor: "$mint",
  },
  frostMuted: {
    colors: [ICON_WHITE, ICON_MUTED, ICON_MINT_TINT_DARK],
    locations: [0, 0.55, 1],
    textColor: "$mintTintDark",
  },

  // frostLight2: {
  //   colors: [ICON_MINT_TINT_DARK, "rgba(127, 231, 225, 0.34)", ICON_WHITE],
  //   locations: [0, 0.2, 0.9],
  //   textColor: "$mintTintDark",
  // },
  // frostLight3: {
  //   colors: ["rgba(12, 69, 62, 0.7)", "rgba(255, 255, 255, 0.7)"],
  //   locations: [0, 0.75],
  //   textColor: "$mintTintDark",
  // },
  frostLight: {
    colors: [ICON_MINT_TINT_DARK, ICON_WHITE],
    locations: [0, 0.75],
    textColor: "$mintTintDark",
  },
  // frostDark: {
  //   colors: [ICON_WHITE, ICON_MINT_TINT_DARK],
  //   locations: [0, 0.6],
  //   textColor: "$mintLight",
  // },
  frostAccent: {
    colors: [ICON_MINT_TINT_DARK, ICON_TEAL, ICON_ACCENT],
    locations: [0, 0.5, 1],
    textColor: "rgba(18, 27, 22, 0.83)",
  },
  mintGlassSoft: {
    colors: ["rgba(45,212,191,0.08)", "rgba(45,212,191,0.08)"],
    textColor: "$mint",
    borderColor: "rgba(45,212,191,0.18)",
  },
  mintGlassLit: {
    colors: ["rgba(94,234,212,0.34)", "rgba(45,212,191,0.06)"],
    locations: [0, 0.7],
    textColor: "$mintLight",
    borderColor: "rgba(45,212,191,0.28)",
  },
  limeGlassLit: {
    colors: ["rgba(190,242,100,0.32)", "rgba(163,230,53,0.05)"],
    locations: [0, 0.7],
    textColor: "$limeLight",
    borderColor: "rgba(53, 230, 180, 0.35)",
  },
  frostGlass: {
    // colors: ["rgba(255,255,255,0.4)", "rgba(220,255,245,0.1)"],
    // colors: ["rgba(255,255,255,0.4)", "rgba(220,255,245,0.03)"],
    colors: ["rgba(255,255,255,0.4)", "rgba(220,255,245,0.03)"],
    locations: [0, 0.75],
    textColor: "$color",
    borderColor: "rgba(220,255,245,0.18)",
  },
  nightMintLit: {
    colors: ["rgba(45,212,191,0.4)", "rgba(17,20,31,0.9)"],
    locations: [0, 0.55],
    textColor: "$mintLight",
  },
  frostVeil: {
    colors: ["rgba(12,69,62,0.7)", "rgba(255,255,255,0.7)"],
    locations: [0, 0.75],
    textColor: "$mintTintDark",
  },
  frostVeilSoft: {
    colors: ["rgba(12,69,62,0.45)", "rgba(255,255,255,0.5)"],
    locations: [0, 0.6],
    textColor: "$mintTintDark",
  },
  frostVeilGlow: {
    colors: ["rgba(12,69,62,0.3)", "rgba(255,255,255,0.88)"],
    locations: [0, 0.85],
    textColor: "$mintTintDark",
  },
  frostVeilMint: {
    colors: [
      "rgba(12,69,62,0.7)",
      "rgba(94,234,212,0.5)",
      "rgba(255,255,255,0.78)",
    ],
    locations: [0, 0.4, 0.9],
    textColor: "$mintTintDark",
  },
};

export const AVATAR_PLACEHOLDER_VARIANTS = Object.keys(
  VARIANTS,
) as AvatarPlaceholderVariant[];

interface AvatarPlaceholderProps {
  label: string;
  size: number;
  fontSize: number;
  variant?: AvatarPlaceholderVariant;
}

export function AvatarPlaceholder({
  label,
  size,
  fontSize,
  variant = AVATAR_PLACEHOLDER_VARIANT,
}: AvatarPlaceholderProps) {
  const style = VARIANTS[variant];

  return (
    <LinearGradient
      colors={style.colors}
      locations={style.locations}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: style.borderColor ? 1 : 0,
        borderColor: style.borderColor,
      }}
    >
      <Text color={style.textColor} fontWeight="800" fontSize={fontSize}>
        {label}
      </Text>
    </LinearGradient>
  );
}
