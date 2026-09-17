import {
  ICON_ACCENT,
  ICON_BASE,
  ICON_HERO_LIME,
  ICON_LIME,
  ICON_LIME_LIGHT,
  ICON_MINT,
  ICON_MINT_LIGHT,
  ICON_TEAL,
  ICON_TEXT,
} from "@/src/constants/iconColors";
import {
  PLANET_LIME_BRIGHT,
  PLANET_LIME_DARKEST,
  PLANET_LIME_DEEP,
  PLANET_LIME_MID,
  PLANET_MINT_BRIGHT,
  PLANET_MINT_DARKEST,
  PLANET_MINT_DEEP,
  PLANET_MINT_MID,
} from "@/src/constants/rawColors";
import { withAlpha } from "@/src/utils/withAlpha";

export type OrbitState = "cool" | "green";

export const ORBIT_GREEN_AT = 0.8;

export function orbitStateFor(fraction: number): OrbitState {
  return fraction >= ORBIT_GREEN_AT ? "green" : "cool";
}

interface OrbitStateStyle {
  planetStops: [number, string][];
  planetGlow: string;
  moonStops: [number, string][];
  moonGlowNear: string;
  moonGlowFar: string;
  beadStops: [number, string][];
  beadGlow: string;
}

export const ORBIT_STATE_STYLES: Record<OrbitState, OrbitStateStyle> = {
  cool: {
    planetStops: [
      [0, PLANET_MINT_BRIGHT],
      [0.24, PLANET_MINT_MID],
      [0.54, PLANET_MINT_DEEP],
      [0.84, PLANET_MINT_DARKEST],
    ],
    planetGlow: withAlpha(ICON_MINT, 0.34),
    moonStops: [
      [0, ICON_TEXT],
      [0.38, ICON_MINT_LIGHT],
      [0.74, ICON_TEAL],
      [1, PLANET_MINT_DARKEST],
    ],
    moonGlowNear: withAlpha(ICON_MINT_LIGHT, 0.7),
    moonGlowFar: withAlpha(ICON_MINT, 0.26),
    beadStops: [
      [0, ICON_TEXT],
      [0.55, ICON_MINT_LIGHT],
      [0.8, ICON_MINT],
    ],
    beadGlow: ICON_MINT_LIGHT,
  },
  green: {
    planetStops: [
      [0, PLANET_LIME_BRIGHT],
      [0.22, PLANET_LIME_MID],
      [0.52, PLANET_LIME_DEEP],
      [0.84, PLANET_LIME_DARKEST],
    ],
    planetGlow: withAlpha(ICON_LIME_LIGHT, 0.45),
    moonStops: [
      [0, ICON_TEXT],
      [0.38, ICON_LIME_LIGHT],
      [0.74, ICON_HERO_LIME],
      [1, PLANET_LIME_DARKEST],
    ],
    moonGlowNear: withAlpha(ICON_LIME_LIGHT, 0.75),
    moonGlowFar: withAlpha(ICON_LIME, 0.3),
    beadStops: [
      [0, ICON_TEXT],
      [0.55, ICON_LIME_LIGHT],
      [0.8, ICON_LIME],
    ],
    beadGlow: ICON_LIME_LIGHT,
  },
};

export const MOON_DIM_STOPS: [number, string][] = [
  [0, withAlpha(ICON_ACCENT, 0.5)],
  [0.44, withAlpha(PLANET_MINT_DEEP, 0.8)],
  [1, ICON_BASE],
];

export const MOON_DIM_RIM = withAlpha(ICON_TEXT, 0.26);
export const MOON_DIM_GLOW = withAlpha(ICON_MINT, 0.16);
