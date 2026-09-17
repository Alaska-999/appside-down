import {
  ICON_ACCENT,
  ICON_BASE_DEEP,
  ICON_MINT_TINT_DARK,
  ICON_MUTED,
  ICON_TEAL,
  ICON_WHITE,
} from "@/src/constants/iconColors";
import {
  SURFACE_ACCENT_BORDER_SOFT,
  SURFACE_MINT_GLASS_BG,
  SURFACE_MINT_GLASS_BORDER,
} from "@/src/constants/surfaceAlpha";

export type AvatarPlaceholderVariant =
  | "tealDeep"
  | "mintGlass"
  | "limeGlass"
  | "nightMint"
  | "frostMuted"
  | "frostLight"
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

export type AvatarVariantStyle = {
  colors: [string, string, ...string[]];
  locations?: [number, number, ...number[]];
  textColor: string;
  borderColor?: string;
};

export const AVATAR_VARIANTS: Record<
  AvatarPlaceholderVariant,
  AvatarVariantStyle
> = {
  tealDeep: {
    colors: [ICON_TEAL, ICON_MINT_TINT_DARK],
    textColor: "$mintLight",
  },
  mintGlass: {
    colors: [SURFACE_MINT_GLASS_BG, SURFACE_MINT_GLASS_BG],
    textColor: "$mint",
    borderColor: SURFACE_MINT_GLASS_BORDER,
  },
  limeGlass: {
    colors: ["rgba(163,230,53,0.15)", "rgba(163,230,53,0.15)"],
    textColor: "$limeLight",
    borderColor: SURFACE_ACCENT_BORDER_SOFT,
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

  frostLight: {
    colors: [ICON_MINT_TINT_DARK, ICON_WHITE],
    locations: [0, 0.75],
    textColor: "$mintTintDark",
  },

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
    borderColor: SURFACE_MINT_GLASS_BORDER,
  },
  limeGlassLit: {
    colors: ["rgba(190,242,100,0.32)", "rgba(163,230,53,0.05)"],
    locations: [0, 0.7],
    textColor: "$limeLight",
    borderColor: "rgba(53, 230, 180, 0.35)",
  },
  frostGlass: {
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
      "rgba(12,69,62,0.6)",
      "rgba(94,234,212,0.5)",
      "rgba(255,255,255,0.78)",
    ],
    locations: [0, 0.35, 0.9],
    textColor: "$mintTintDark",
  },
};
