import {
  GLASS_SHEEN_SOFT,
  SKY_GLOW,
  TRANSPARENT_WHITE,
  GLASS_BORDER_MID,
  GLASS_BORDER_BOTTOM,
} from "@/src/constants/rawColors";
import {
  SURFACE_BORDER,
  SURFACE_GLASS_BG,
  SURFACE_GLASS_BG_FAINT,
  SURFACE_WHITE_STRONG,
} from "@/src/constants/surfaceAlpha";

export type GradientBorderPreset =
  | "surf"
  | "glowMint"
  | "glowTeal"
  | "glowLime"
  | "glowIndigo"
  | "liquid"
  | "lens"
  | "well"
  | "sheet";

export type GradientBorderPresetDef = {
  angle: number;
  colors: string[];
  positions: number[];
};

export const GRADIENT_BORDER_PRESETS: Record<
  GradientBorderPreset,
  GradientBorderPresetDef
> = {
  surf: {
    angle: 140,
    colors: [SURFACE_BORDER, SURFACE_GLASS_BG, SURFACE_GLASS_BG_FAINT],
    positions: [0, 0.48, 1],
  },
  glowMint: {
    angle: 138,
    colors: [
      "rgba(94,234,212,0.48)",
      "rgba(94,234,212,0.07)",
      SURFACE_GLASS_BG_FAINT,
    ],
    positions: [0, 0.46, 1],
  },
  glowTeal: {
    angle: 138,
    colors: [
      "rgba(45,212,191,0.4)",
      "rgba(45,212,191,0.06)",
      SURFACE_GLASS_BG_FAINT,
    ],
    positions: [0, 0.46, 1],
  },
  glowLime: {
    angle: 138,
    colors: [
      "rgba(190,242,100,0.48)",
      "rgba(190,242,100,0.06)",
      SURFACE_GLASS_BG_FAINT,
    ],
    positions: [0, 0.46, 1],
  },
  glowIndigo: {
    angle: 138,
    colors: [
      "rgba(99,102,241,0.42)",
      "rgba(99,102,241,0.05)",
      SURFACE_GLASS_BG_FAINT,
    ],
    positions: [0, 0.46, 1],
  },
  liquid: {
    angle: 155,
    colors: [SURFACE_WHITE_STRONG, GLASS_BORDER_MID, GLASS_SHEEN_SOFT],
    positions: [0, 0.46, 1],
  },
  lens: {
    angle: 160,
    colors: ["rgba(255,255,255,0.5)", "rgba(255,255,255,0.04)", SKY_GLOW],
    positions: [0, 0.44, 1],
  },
  well: {
    angle: 180,
    colors: ["rgba(0,0,0,0.5)", SURFACE_BORDER],
    positions: [0, 1],
  },
  sheet: {
    angle: 180,
    colors: ["rgba(255,255,255,0.4)", GLASS_BORDER_BOTTOM, TRANSPARENT_WHITE],
    positions: [0, 0.4, 1],
  },
};
