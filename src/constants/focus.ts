import { EASE_STANDARD } from "@/src/constants/motion";

export const FOCUS_BORDER = {
  angle: 160,
  colors: [
    "rgba(73, 241, 216, 0.6)",
    "rgba(94, 234, 212, 0.12)",
    "rgba(191, 249, 233, 0.09)",
  ],
  positions: [0, 0.46, 1],
};

export const FOCUS_RING = { width: 1.2, color: "rgba(94, 234, 212, 0.55)" };

export const FOCUS_GLOW = {
  color: "rgba(94, 234, 212, 0.4)",
  blur: 4,
  width: 3,
};

export const FOCUS_TIMING = {
  inMs: 260,
  outMs: 180,
  easing: EASE_STANDARD,
};

export const FOCUS_HIGHLIGHT = "rgba(255, 255, 255, 0.2)";

export const WELL_EDGE_TAIL = {
  colors: ["rgba(140,161,159,0.14)", "rgba(163,187,180,0.18)"],
  positions: [0.8, 1],
};

export const RING_GLOW_BORDER = "rgba(94,234,212,0.85)";

export const EDGE_MINT_FAINT = "rgba(94,234,212,0.42)";

