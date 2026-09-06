import { Easing } from "react-native-reanimated";

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
  easing: Easing.bezier(0.2, 0.8, 0.3, 1),
};

export const FOCUS_HIGHLIGHT = "rgba(255, 255, 255, 0.2)";

