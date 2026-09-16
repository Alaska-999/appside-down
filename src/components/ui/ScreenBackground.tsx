import { gradientLine } from "@/src/components/ui/GradientBorder";
import { StatusBarScrim } from "@/src/components/ui/StatusBarScrim";
import {
  Canvas,
  Circle,
  FractalNoise,
  Group,
  LinearGradient,
  RadialGradient,
  Rect,
  Skia,
  TileMode,
  vec,
} from "@shopify/react-native-skia";
import { ReactNode, useEffect, useMemo } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import {
  Easing,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { YStack } from "tamagui";

export type BackgroundPreset =
  | "homeLamp"
  | "homeLampWhite"
  | "folder"
  | "auth"
  | "finish"
  | "finish2"
  | "finishCold"
  | "finishCold2"
  | "finishWarm"
  | "finishWarm2"
  | "auroraDrift"
  | "auroraTeal"
  | "twilightDuo"
  | "twilightDuoGreen"
  | "twilightDuoLime"
  | "tealBeam"
  | "crossBeams"
  | "crossBeamsMint"
  | "crossBeamsTeal";

export type Blob = {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  color: string;
  edge: number;
};

export type Layer = { blur: number; saturate?: number; blobs: Blob[] };

export type Linear = { angle: number; colors: string[]; positions: number[] };

export type Beam = {
  angle: number;
  colors: string[];
  positions: number[];
  blur: number;
  opacity: number;
  duration: number;
};

export type RadialVignette = {
  kind: "radial";
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  colors: string[];
  positions: number[];
};

export type LinearVignette = {
  kind: "linear";
  colors: string[];
  positions: number[];
};

export type BgSpec = {
  base: Linear;
  layers: Layer[];
  beam?: Beam;
  beams?: Beam[];
  vignette?: RadialVignette | LinearVignette;
  grain?: number;
};

const off = (c: string) => c.replace(/,[\d.\s]+\)$/, ",0)");

const NIGHT = "rgba(1,3,5,0)";

function ribBlobs(
  x: number,
  y: number,
  cw: number,
  ch: number,
  spots: [number, number, number, number, string, number][],
): Blob[] {
  return spots.map(([bx, by, brx, bry, color, edge]) => ({
    cx: x + bx * cw,
    cy: y + by * ch,
    rx: brx * cw,
    ry: bry * ch,
    color,
    edge,
  }));
}

function buildSpec(preset: BackgroundPreset, w: number, h: number): BgSpec {
  switch (preset) {
    case "homeLamp":
      return {
        base: {
          angle: 142,
          colors: ["#0B2A2C", "#061A1D", "#030A0D", "#020304"],
          positions: [0, 0.22, 0.56, 1],
        },
        layers: [
          {
            blur: 90,
            blobs: [
              {
                cx: -0.12 * w,
                cy: -0.08 * h,
                rx: 0.95 * w,
                ry: 0.6 * h,
                color: "rgba(13,148,136,0.4)",
                edge: 0.82,
              },
            ],
          },
          {
            blur: 60,
            blobs: [
              {
                cx: -0.06 * w,
                cy: -0.04 * h,
                rx: 0.5 * w,
                ry: 0.3 * h,
                color: "rgba(45,212,191,0.4)",
                edge: 0.7,
              },
            ],
          },
          {
            blur: 30,
            blobs: [
              {
                cx: -0.02 * w,
                cy: -0.01 * h,
                rx: 90,
                ry: 90,
                color: "rgba(94,234,212,0.6)",
                edge: 0.6,
              },
            ],
          },
          {
            blur: 96,
            blobs: [
              {
                cx: 1.08 * w,
                cy: 1.02 * h,
                rx: 240,
                ry: 220,
                color: "rgba(31,156,175,0.12)",
                edge: 0.82,
              },
            ],
          },
        ],
        vignette: {
          kind: "radial",
          cx: 0.0 * w,
          cy: 0.0 * h,
          rx: 1.6 * w,
          ry: 1.25 * h,
          colors: [NIGHT, NIGHT, "rgba(1,3,5,0.)", "rgba(1,3,5,0.8)"],
          positions: [0, 0.34, 0.74, 1],
        },
        grain: 0.06,
      };
    case "homeLampWhite":
      return {
        base: {
          angle: 142,
          colors: ["#0A2630", "#06181F", "#03090D", "#020304"],
          positions: [0, 0.22, 0.56, 1],
        },
        layers: [
          {
            blur: 90,
            blobs: [
              {
                cx: -0.12 * w,
                cy: -0.08 * h,
                rx: 0.95 * w,
                ry: 0.6 * h,
                color: "rgba(31,156,175,0.38)",
                edge: 0.82,
              },
            ],
          },
          {
            blur: 60,
            blobs: [
              {
                cx: -0.06 * w,
                cy: -0.04 * h,
                rx: 0.5 * w,
                ry: 0.3 * h,
                color: "rgba(45,190,212,0.36)",
                edge: 0.7,
              },
            ],
          },
          {
            blur: 30,
            blobs: [
              {
                cx: -0.02 * w,
                cy: -0.01 * h,
                rx: 90,
                ry: 90,
                color: "rgba(234,247,255,0.55)",
                edge: 0.6,
              },
            ],
          },
          {
            blur: 96,
            blobs: [
              {
                cx: 1.08 * w,
                cy: 1.02 * h,
                rx: 240,
                ry: 220,
                color: "rgba(45,190,212,0.1)",
                edge: 0.82,
              },
            ],
          },
        ],
        vignette: {
          kind: "radial",
          cx: 0.0 * w,
          cy: 0.0 * h,
          rx: 1.6 * w,
          ry: 1.25 * h,
          colors: [NIGHT, NIGHT, "rgba(1,3,5,0.)", "rgba(1,3,5,0.8)"],
          positions: [0, 0.34, 0.74, 1],
        },
        grain: 0.06,
      };
    case "folder":
      return {
        base: {
          angle: 140,
          colors: ["#0C1518", "#08090C"],
          positions: [0, 0.58],
        },
        layers: [
          {
            blur: 37,
            blobs: ribBlobs(-0.22 * w, -0.14 * h, 0.64 * w, 0.38 * h, [
              [0.55, 0.45, 0.55, 0.66, "rgba(94,234,212,0.5)", 0.72],
            ]),
          },
          {
            blur: 60,
            blobs: ribBlobs(0.61 * w, 0.78 * h, 0.69 * w, 0.38 * h, [
              [0.6, 0.53, 0.7, 0.8, "rgba(13,148,136,0.60)", 0.78],
              [0.2, 0.68, 0.6, 0.6, "rgba(163,230,53,0.35)", 0.65],
            ]),
          },
        ],
        grain: 0.04,
      };
    case "auth":
      return {
        base: {
          angle: 180,
          colors: ["#08242C", "#061220", "#03070C", "#020304"],
          positions: [0, 0.34, 0.6, 1],
        },
        beam: {
          angle: 108,
          colors: [
            "rgba(94,234,212,0)",
            "rgba(94,234,212,0.5)",
            "rgba(190,242,100,0.36)",
            "rgba(190,242,100,0)",
          ],
          positions: [0.2, 0.38, 0.52, 0.72],
          blur: 46,
          opacity: 0.72,
          duration: 15000,
        },
        layers: [
          {
            blur: 40,
            blobs: [
              {
                cx: 0.5 * w,
                cy: 1.04 * h,
                rx: 0.7 * w,
                ry: 0.28 * h,
                color: "rgba(13,148,136,0.5)",
                edge: 0.74,
              },
            ],
          },
        ],
        vignette: {
          kind: "linear",
          colors: [NIGHT, NIGHT, "rgba(1,3,5,0.4)", "rgba(1,3,5,0.78)"],
          positions: [0, 0.32, 0.62, 1],
        },
        grain: 0.06,
      };
    case "finish":
      return {
        base: {
          angle: 180,
          colors: ["#071E26", "#050F18", "#03070C", "#020304", "#010203"],
          positions: [0, 0.34, 0.58, 0.78, 1],
        },
        layers: [
          {
            blur: 54,
            blobs: [
              {
                cx: 40,
                cy: 30,
                rx: 200,
                ry: 200,
                color: "rgba(13,148,136,0.32)",
                edge: 0.68,
              },
            ],
          },
          {
            blur: 52,
            blobs: [
              {
                cx: w - 10,
                cy: 50,
                rx: 150,
                ry: 150,
                color: "rgba(67,56,202,0.24)",
                edge: 0.68,
              },
            ],
          },
          {
            blur: 56,
            blobs: [
              {
                cx: 0.06 * w + 180,
                cy: h + 15,
                rx: 180,
                ry: 125,
                color: "rgba(45,212,191,0.16)",
                edge: 0.7,
              },
            ],
          },
        ],
        vignette: {
          kind: "linear",
          colors: [
            NIGHT,
            NIGHT,
            "rgba(1,3,5,0.5)",
            "rgba(1,3,5,0.86)",
            "rgba(1,3,5,0.94)",
          ],
          positions: [0, 0.34, 0.58, 0.78, 1],
        },
        grain: 0.07,
      };

    case "finish2":
      return {
        base: {
          angle: 180,
          colors: ["#071E26", "#050F18", "#03070C", "#020304", "#010203"],
          positions: [0, 0.34, 0.58, 0.78, 1],
        },
        layers: [
          {
            blur: 54,
            blobs: [
              {
                cx: 40,
                cy: 30,
                rx: 200,
                ry: 200,
                color: "rgba(13,148,136,0.34)",
                edge: 0.7,
              },
            ],
          },
          {
            blur: 52,
            blobs: [
              {
                cx: w - 10,
                cy: 50,
                rx: 150,
                ry: 150,
                color: "rgba(67,56,202,0.26)",
                edge: 0.7,
              },
            ],
          },
          {
            blur: 56,
            blobs: [
              {
                cx: 0.1 * w,
                cy: 0.9 * h,
                rx: 190,
                ry: 190,
                color: "rgba(94,234,212,0.2)",
                edge: 0.72,
              },
            ],
          },
          {
            blur: 56,
            blobs: [
              {
                cx: 0.06 * w + 180,
                cy: h + 15,
                rx: 180,
                ry: 125,
                color: "rgba(45,212,191,0.18)",
                edge: 0.7,
              },
            ],
          },
        ],
        vignette: {
          kind: "linear",
          colors: [
            NIGHT,
            NIGHT,
            "rgba(1,3,5,0.5)",
            "rgba(1,3,5,0.86)",
            "rgba(1,3,5,0.94)",
          ],
          positions: [0, 0.34, 0.58, 0.78, 1],
        },
        grain: 0.07,
      };

    case "finishCold":
      return {
        base: {
          angle: 180,
          colors: ["#090F2C", "#06091B", "#03050E", "#020304"],
          positions: [0, 0.38, 0.72, 1],
        },
        layers: [
          {
            blur: 54,
            blobs: [
              {
                cx: 40,
                cy: 30,
                rx: 200,
                ry: 200,
                color: "rgba(67,56,202,0.28)",
                edge: 0.68,
              },
            ],
          },
          {
            blur: 52,
            blobs: [
              {
                cx: w - 10,
                cy: 50,
                rx: 150,
                ry: 150,
                color: "rgba(13,148,136,0.25)",
                edge: 0.68,
              },
            ],
          },
          {
            blur: 56,
            blobs: [
              {
                cx: 0.06 * w + 180,
                cy: h + 15,
                rx: 180,
                ry: 125,
                color: "rgba(45,212,191,0.16)",
                edge: 0.7,
              },
            ],
          },
        ],
        vignette: {
          kind: "linear",
          colors: [NIGHT, NIGHT, "rgba(1,3,5,0.26)", "rgba(1,3,5,0.46)"],
          positions: [0, 0.4, 0.66, 1],
        },
        grain: 0.07,
      };

    case "finishCold2":
      return {
        base: {
          angle: 180,
          colors: ["#090F2C", "#06091B", "#03050E", "#020304"],
          positions: [0, 0.38, 0.72, 1],
        },
        layers: [
          {
            blur: 54,
            blobs: [
              {
                cx: 40,
                cy: 30,
                rx: 200,
                ry: 200,
                color: "rgba(67,56,202,0.32)",
                edge: 0.7,
              },
            ],
          },
          {
            blur: 52,
            blobs: [
              {
                cx: w - 10,
                cy: 50,
                rx: 150,
                ry: 150,
                color: "rgba(13,148,136,0.28)",
                edge: 0.7,
              },
            ],
          },
          {
            blur: 56,
            blobs: [
              {
                cx: 0.85 * w,
                cy: 0.9 * h,
                rx: 190,
                ry: 190,
                color: "rgba(94,234,212,0.2)",
                edge: 0.72,
              },
            ],
          },
          {
            blur: 56,
            blobs: [
              {
                cx: 0.06 * w + 180,
                cy: h + 15,
                rx: 180,
                ry: 125,
                color: "rgba(45,212,191,0.16)",
                edge: 0.7,
              },
            ],
          },
        ],
        vignette: {
          kind: "linear",
          colors: [NIGHT, NIGHT, "rgba(1,3,5,0.26)", "rgba(1,3,5,0.46)"],
          positions: [0, 0.4, 0.66, 1],
        },
        grain: 0.07,
      };

    case "finishWarm":
      return {
        base: {
          angle: 180,
          colors: ["#081F1A", "#06110C", "#030603", "#020302"],
          positions: [0, 0.4, 0.74, 1],
        },
        layers: [
          {
            blur: 54,
            blobs: [
              {
                cx: 40,
                cy: 30,
                rx: 200,
                ry: 200,
                color: "rgba(163,230,53,0.16)",
                edge: 0.68,
              },
            ],
          },
          {
            blur: 52,
            blobs: [
              {
                cx: w - 10,
                cy: 50,
                rx: 150,
                ry: 150,
                color: "rgba(67,56,202,0.24)",
                edge: 0.68,
              },
            ],
          },
          {
            blur: 56,
            blobs: [
              {
                cx: 0.06 * w + 180,
                cy: h + 15,
                rx: 180,
                ry: 125,
                color: "rgba(190,242,100,0.11)",
                edge: 0.7,
              },
            ],
          },
        ],
        vignette: {
          kind: "linear",
          colors: [NIGHT, NIGHT, "rgba(1,3,5,0.26)", "rgba(1,3,5,0.46)"],
          positions: [0, 0.4, 0.66, 1],
        },
        grain: 0.07,
      };

    case "finishWarm2":
      return {
        base: {
          angle: 180,
          colors: ["#081F1A", "#06110C", "#030603", "#020302"],
          positions: [0, 0.4, 0.74, 1],
        },
        layers: [
          {
            blur: 54,
            blobs: [
              {
                cx: 40,
                cy: 30,
                rx: 200,
                ry: 200,
                color: "rgba(163,230,53,0.18)",
                edge: 0.7,
              },
            ],
          },
          {
            blur: 58,
            blobs: [
              {
                cx: w - 30,
                cy: -10,
                rx: 220,
                ry: 220,
                color: "rgba(163,230,53,0.3)",
                edge: 0.76,
              },
            ],
          },
          {
            blur: 50,
            blobs: [
              {
                cx: w - 20,
                cy: 50,
                rx: 70,
                ry: 70,
                color: "rgba(190,242,100,0.35)",
                edge: 0.76,
              },
            ],
          },
          {
            blur: 56,
            blobs: [
              {
                cx: 0.06 * w + 180,
                cy: h + 15,
                rx: 180,
                ry: 125,
                color: "rgba(190,242,100,0.1)",
                edge: 0.7,
              },
            ],
          },
        ],
        vignette: {
          kind: "linear",
          colors: [NIGHT, NIGHT, "rgba(1,3,5,0.26)", "rgba(1,3,5,0.46)"],
          positions: [0, 0.4, 0.66, 1],
        },
        grain: 0.07,
      };

    case "auroraDrift":
      return {
        base: {
          angle: 180,
          colors: ["#071E26", "#050F18", "#03070C", "#020304", "#010203"],
          positions: [0, 0.34, 0.58, 0.78, 1],
        },
        layers: [
          {
            blur: 54,
            blobs: [
              {
                cx: 0.14 * w,
                cy: 0.06 * h,
                rx: 190,
                ry: 190,
                color: "rgba(45,212,191,0.3)",
                edge: 0.7,
              },
            ],
          },
          {
            blur: 58,
            blobs: [
              {
                cx: 0.88 * w,
                cy: 0.55 * h,
                rx: 200,
                ry: 220,
                color: "rgba(13,148,136,0.26)",
                edge: 0.72,
              },
            ],
          },
          {
            blur: 56,
            blobs: [
              {
                cx: 0.2 * w,
                cy: 0.8 * h,
                rx: 180,
                ry: 180,
                color: "rgba(94,234,212,0.2)",
                edge: 0.72,
              },
            ],
          },
        ],
        beam: {
          angle: 118,
          colors: [
            "rgba(94,234,212,0)",
            "rgba(94,234,212,0.34)",
            "rgba(13, 137, 148, 0.22)",
            "rgba(100, 242, 145, 0.14)",
            "rgba(100, 242, 145, 0)",
          ],
          positions: [0.2, 0.42, 0.58, 0.68, 0.76],
          blur: 46,
          opacity: 0.65,
          duration: 18000,
        },
        vignette: {
          kind: "linear",
          colors: [
            NIGHT,
            NIGHT,
            "rgba(1,3,5,0.5)",
            "rgba(1,3,5,0.82)",
            "rgba(1,3,5,0.92)",
          ],
          positions: [0, 0.3, 0.56, 0.78, 1],
        },
        grain: 0.05,
      };

    case "auroraTeal":
      return {
        base: {
          angle: 180,
          colors: ["#051822", "#040F16", "#02070B", "#020304", "#010203"],
          positions: [0, 0.34, 0.58, 0.78, 1],
        },
        layers: [
          {
            blur: 54,
            blobs: [
              {
                cx: 0.14 * w,
                cy: 0.06 * h,
                rx: 190,
                ry: 190,
                color: "rgba(45,212,191,0.3)",
                edge: 0.7,
              },
            ],
          },
          {
            blur: 58,
            blobs: [
              {
                cx: 0.88 * w,
                cy: 0.55 * h,
                rx: 200,
                ry: 220,
                color: "rgba(31,156,175,0.25)",
                edge: 0.6,
              },
            ],
          },
          {
            blur: 56,
            blobs: [
              {
                cx: 0.2 * w,
                cy: 0.8 * h,
                rx: 180,
                ry: 180,
                color: "rgba(94,234,212,0.38)",
                edge: 0.72,
              },
            ],
          },
        ],
        beam: {
          angle: 118,
          colors: [
            "rgba(50, 227, 153, 0)",
            "rgba(49, 210, 129, 0.33)",
            "rgba(29, 176, 199, 0.2)",
            "rgba(25, 164, 185, 0.14)",
            "rgba(19, 155, 176, 0)",
          ],
          positions: [0.2, 0.42, 0.58, 0.68, 0.76],
          blur: 40,
          opacity: 0.7,
          duration: 18000,
        },
        vignette: {
          kind: "linear",
          colors: [
            NIGHT,
            NIGHT,
            "rgba(1,3,5,0.4)",
            "rgba(1,3,5,0.55)",
            "rgba(1,3,5,0.8)",
          ],
          positions: [0, 0.3, 0.56, 0.78, 1],
        },
        grain: 0.05,
      };

    // layers: [
    //   {
    //     blur: 90,
    //     blobs: [
    //       {
    //         cx: -0.12 * w,
    //         cy: -0.08 * h,
    //         rx: 0.95 * w,
    //         ry: 0.6 * h,
    //         color: "rgba(31,156,175,0.38)",
    //         edge: 0.82,
    //       },
    //     ],
    //   },
    //   {
    //     blur: 60,
    //     blobs: [
    //       {
    //         cx: -0.06 * w,
    //         cy: -0.04 * h,
    //         rx: 0.5 * w,
    //         ry: 0.3 * h,
    //         color: "rgba(45,190,212,0.36)",
    //         edge: 0.7,
    //       },
    //     ],
    //   },
    //   {
    //     blur: 30,
    //     blobs: [
    //       {
    //         cx: -0.02 * w,
    //         cy: -0.01 * h,
    //         rx: 90,
    //         ry: 90,
    //         color: "rgba(234,247,255,0.55)",
    //         edge: 0.6,
    //       },
    //     ],
    //   },
    //   {
    //     blur: 96,
    //     blobs: [
    //       {
    //         cx: 1.08 * w,
    //         cy: 1.02 * h,
    //         rx: 240,
    //         ry: 220,
    //         color: "rgba(45,190,212,0.1)",
    //         edge: 0.82,
    //       },
    //     ],
    //   },
    // ],

    case "twilightDuo":
      return {
        base: {
          angle: 180,
          colors: ["#051822", "#040F16", "#02070B", "#030B10", "#041219"],
          positions: [0, 0.3, 0.52, 0.8, 1],
        },
        layers: [
          {
            blur: 58,
            blobs: [
              {
                cx: 0.2 * w,
                cy: 0.1 * h,
                rx: 220,
                ry: 220,
                color: "rgba(31,156,175,0.38)",
                edge: 0.7,
              },
            ],
          },

          {
            blur: 35,
            blobs: [
              {
                cx: 0.02 * w,
                cy: 0.05 * h,
                rx: 110,
                ry: 110,
                color: "rgba(137, 239, 210, 0.6)",
                edge: 0.55,
              },
            ],
          },
          {
            blur: 58,
            blobs: [
              {
                cx: 0.9 * w,
                cy: 1.0 * h,
                rx: 310,
                ry: 260,
                color: "rgba(31,156,175,0.38)",
                edge: 0.8,
              },
            ],
          },

          {
            blur: 30,
            blobs: [
              {
                cx: w + 3,
                cy: h + 5,
                rx: 62,
                ry: 62,
                color: "rgba(120, 248, 212, 0.6)",
                edge: 0.7,
              },
            ],
          },
          // {
          //   blur: 50,
          //   blobs: [
          //     {
          //       cx: 0.7 * w,
          //       cy: 0.3 * h,
          //       rx: 180,
          //       ry: 180,
          //       color: "rgba(45, 123, 182, 0.15)",
          //       edge: 0.72,
          //     },
          //   ],
          // },
        ],

        grain: 0.06,
      };

    case "twilightDuoGreen":
      return {
        base: {
          angle: 180,
          colors: ["#04201A", "#03140F", "#02090A", "#020403"],
          positions: [0, 0.38, 0.72, 1],
        },
        layers: [
          {
            blur: 84,
            blobs: [
              {
                cx: 0.2 * w,
                cy: 0.1 * h,
                rx: 220,
                ry: 220,
                color: "rgba(71, 200, 153, 0.28)",
                edge: 0.7,
              },
            ],
          },

          {
            blur: 72,
            blobs: [
              {
                cx: 0.04 * w,
                cy: 0.05 * h,
                rx: 110,
                ry: 110,
                color: "rgba(110, 231, 187, 0.62)",
                edge: 0.7,
              },
            ],
          },
          {
            blur: 120,
            blobs: [
              {
                cx: 0.9 * w,
                cy: 1.0 * h,
                rx: 310,
                ry: 260,
                color: "rgba(34, 156, 160, 0.24)",
                edge: 0.8,
              },
            ],
          },
          {
            blur: 96,
            blobs: [
              {
                cx: 0.85 * w,
                cy: 0.95 * h,
                rx: 220,
                ry: 220,
                color: "rgba(64, 205, 170, 0.36)",
                edge: 0.63,
              },
            ],
          },

          {
            blur: 40,
            blobs: [
              {
                cx: 0.7 * w,
                cy: 0.35 * h,
                rx: 180,
                ry: 180,
                color: "rgba(60, 170, 150, 0.14)",
                edge: 0.72,
              },
            ],
          },
        ],

        grain: 0.06,
      };

    case "twilightDuoLime":
      return {
        base: {
          angle: 180,
          colors: ["#041F20", "#031415", "#02090B", "#020304"],
          positions: [0, 0.38, 0.72, 1],
        },
        layers: [
          {
            blur: 58,
            blobs: [
              {
                cx: 0.2 * w,
                cy: 0.1 * h,
                rx: 220,
                ry: 220,
                color: "rgba(45,212,191,0.32)",
                edge: 0.7,
              },
            ],
          },

          {
            blur: 50,
            blobs: [
              {
                cx: 0.04 * w,
                cy: 0.05 * h,
                rx: 110,
                ry: 110,
                color: "rgba(163, 230, 53, 0.36)",
                edge: 0.7,
              },
            ],
          },
          {
            blur: 96,
            blobs: [
              {
                cx: 0.9 * w,
                cy: 1.0 * h,
                rx: 310,
                ry: 260,
                color: "rgba(13, 148, 136, 0.28)",
                edge: 0.8,
              },
            ],
          },
          {
            blur: 75,
            blobs: [
              {
                cx: 0.85 * w,
                cy: 0.95 * h,
                rx: 220,
                ry: 220,
                color: "rgba(45, 212, 191, 0.38)",
                edge: 0.63,
              },
            ],
          },
        ],

        grain: 0.06,
      };

    case "tealBeam":
      return {
        base: {
          angle: 180,
          colors: ["#061A20", "#031016", "#020A0E", "#020304"],
          positions: [0, 0.36, 0.7, 1],
        },
        layers: [
          {
            blur: 52,
            blobs: [
              {
                cx: 0.15 * w,
                cy: 0.85 * h,
                rx: 210,
                ry: 210,
                color: "rgba(140,224,90,0.3)",
                edge: 0.72,
              },
            ],
          },
        ],
        beam: {
          angle: 100,

          colors: [
            "rgba(9, 28, 31, 0.05)",
            "rgba(12, 150, 175, 0.55)",
            "rgba(94, 226, 120, 0.26)",
            "rgba(53, 230, 192, 0.05)",
          ],
          positions: [0.16, 0.53, 0.62, 0.78],
          blur: 43,
          opacity: 0.8,
          duration: 13000,
        },
        vignette: {
          kind: "linear",
          colors: [NIGHT, NIGHT, "rgba(1,3,5,0.55)", "rgba(1,3,5,0.9)"],
          positions: [0, 0.3, 0.6, 1],
        },
        grain: 0.05,
      };

    case "crossBeams":
      return {
        base: {
          angle: 180,
          colors: ["#071921", "#050F16", "#03070B", "#020304"],
          positions: [0, 0.36, 0.68, 1],
        },
        layers: [
          {
            blur: 58,
            blobs: [
              {
                cx: 0.5 * w,
                cy: 0.5 * h,
                rx: 230,
                ry: 230,
                color: "rgba(45,212,191,0.16)",
                edge: 0.75,
              },
            ],
          },
        ],
        beams: [
          {
            angle: 100,
            colors: [
              "rgba(94,234,212,0)",
              "rgba(78, 230, 207, 0.4)",
              "rgba(94,234,212,0)",
            ],
            positions: [0.28, 0.46, 0.64],
            blur: 44,
            opacity: 0.7,
            duration: 16000,
          },
          {
            angle: 150,
            colors: [
              "rgba(190,242,100,0)",
              "rgba(156, 243, 80, 0.32)",
              "rgba(190,242,100,0)",
            ],
            positions: [0.32, 0.5, 0.68],
            blur: 44,
            opacity: 0.6,
            duration: 19000,
          },
        ],
        vignette: {
          kind: "linear",
          colors: [NIGHT, NIGHT, "rgba(1,3,5,0.52)", "rgba(1,3,5,0.88)"],
          positions: [0, 0.3, 0.6, 1],
        },
        grain: 0.07,
      };

    case "crossBeamsMint":
      return {
        base: {
          angle: 180,
          colors: ["#071921", "#050F16", "#03070B", "#020304"],
          positions: [0, 0.36, 0.68, 1],
        },
        layers: [
          {
            blur: 58,
            blobs: [
              {
                cx: 0.5 * w,
                cy: 0.5 * h,
                rx: 230,
                ry: 230,
                color: "rgba(45,212,191,0.22)",
                edge: 0.75,
              },
            ],
          },
        ],
        beams: [
          {
            angle: 100,
            colors: [
              "rgba(94,234,212,0)",
              "rgba(94, 234, 212, 0.42)",
              "rgba(94,234,212,0)",
            ],
            positions: [0.28, 0.46, 0.64],
            blur: 44,
            opacity: 0.7,
            duration: 16000,
          },
          {
            angle: 150,
            colors: [
              "rgba(45,212,191,0)",
              "rgba(45, 212, 191, 0.36)",
              "rgba(45,212,191,0)",
            ],
            positions: [0.32, 0.5, 0.68],
            blur: 44,
            opacity: 0.6,
            duration: 19000,
          },
        ],
        vignette: {
          kind: "linear",
          colors: [NIGHT, NIGHT, "rgba(1,3,5,0.52)", "rgba(1,3,5,0.88)"],
          positions: [0, 0.3, 0.6, 1],
        },
        grain: 0.07,
      };

    case "crossBeamsTeal":
      return {
        base: {
          angle: 180,
          colors: ["#051822", "#040F16", "#02070B", "#020304"],
          positions: [0, 0.36, 0.68, 1],
        },
        layers: [
          {
            blur: 58,
            blobs: [
              {
                cx: 0.5 * w,
                cy: 0.5 * h,
                rx: 230,
                ry: 230,
                color: "rgba(31, 156, 175, 0.26)",
                edge: 0.75,
              },
            ],
          },
        ],
        beams: [
          {
            angle: 100,
            colors: [
              "rgba(45,190,212,0)",
              "rgba(45, 190, 212, 0.42)",
              "rgba(45,190,212,0)",
            ],
            positions: [0.28, 0.46, 0.64],
            blur: 44,
            opacity: 0.7,
            duration: 16000,
          },
          {
            angle: 150,
            colors: [
              "rgba(99,236,198,0)",
              "rgba(99, 236, 198, 0.3)",
              "rgba(99,236,198,0)",
            ],
            positions: [0.32, 0.5, 0.68],
            blur: 44,
            opacity: 0.6,
            duration: 19000,
          },
        ],
        vignette: {
          kind: "linear",
          colors: [NIGHT, NIGHT, "rgba(1,3,5,0.4)", "rgba(1,3,5,0.65)"],
          positions: [0, 0.3, 0.6, 1],
        },
        grain: 0.07,
      };
  }
}

function saturationMatrix(s: number) {
  const lr = 0.213;
  const lg = 0.715;
  const lb = 0.072;
  return [
    lr + s * (1 - lr),
    lg - s * lg,
    lb - s * lb,
    0,
    0,
    lr - s * lr,
    lg + s * (1 - lg),
    lb - s * lb,
    0,
    0,
    lr - s * lr,
    lg - s * lg,
    lb + s * (1 - lb),
    0,
    0,
    0,
    0,
    0,
    1,
    0,
  ];
}

export type BgDebugMode = "noblur" | "clamp" | "decal";

function useLayerPaint(
  blur: number,
  saturate?: number,
  mode: BgDebugMode = "clamp",
) {
  return useMemo(() => {
    if (mode === "noblur") return true;
    const paint = Skia.Paint();
    paint.setDither(true);
    const tile = mode === "decal" ? TileMode.Decal : TileMode.Clamp;
    paint.setImageFilter(Skia.ImageFilter.MakeBlur(blur, blur, tile, null));
    paint.setColorFilter(
      Skia.ColorFilter.MakeMatrix(saturationMatrix(saturate ?? 1)),
    );
    return paint;
  }, [blur, saturate, mode]);
}

function BlobLayer({ layer, mode }: { layer: Layer; mode?: BgDebugMode }) {
  const paint = useLayerPaint(layer.blur, layer.saturate, mode);
  return (
    <Group layer={paint}>
      {layer.blobs.map((b, i) => (
        <Group
          key={i}
          transform={[
            { translateX: b.cx },
            { translateY: b.cy },
            { scaleY: b.ry / b.rx },
          ]}
        >
          <Circle cx={0} cy={0} r={b.rx}>
            <RadialGradient
              c={vec(0, 0)}
              r={b.rx}
              colors={[b.color, off(b.color)]}
              positions={[0, b.edge]}
            />
          </Circle>
        </Group>
      ))}
    </Group>
  );
}

function BeamLayer({
  beam,
  w,
  h,
  animated,
}: {
  beam: Beam;
  w: number;
  h: number;
  animated: boolean;
}) {
  const reducedMotion = useReducedMotion();
  const drift = useSharedValue(0);
  const run = animated && !reducedMotion;

  useEffect(() => {
    if (run) {
      drift.value = -0.06 * w;
      drift.value = withRepeat(
        withTiming(0.06 * w, {
          duration: beam.duration,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true,
      );
    }
  }, [run, w, beam.duration, drift]);

  const transform = useDerivedValue(() => [
    { translateX: run ? drift.value : 0 },
  ]);
  const paint = useLayerPaint(beam.blur);
  const line = gradientLine(beam.angle, w, h);

  return (
    <Group layer={paint} transform={transform} opacity={beam.opacity}>
      <Rect x={-0.12 * w} y={0} width={w * 1.24} height={h}>
        <LinearGradient
          start={line.start}
          end={line.end}
          colors={beam.colors}
          positions={beam.positions}
        />
      </Rect>
    </Group>
  );
}

function Vignette({
  vignette,
  w,
  h,
}: {
  vignette: RadialVignette | LinearVignette;
  w: number;
  h: number;
}) {
  if (vignette.kind === "linear") {
    return (
      <Rect x={0} y={0} width={w} height={h}>
        <LinearGradient
          start={vec(w / 2, 0)}
          end={vec(w / 2, h)}
          colors={vignette.colors}
          positions={vignette.positions}
        />
      </Rect>
    );
  }
  const scaleY = vignette.ry / vignette.rx;
  return (
    <Group
      transform={[
        { translateX: vignette.cx },
        { translateY: vignette.cy },
        { scaleY },
      ]}
    >
      <Rect
        x={-vignette.cx}
        y={-vignette.cy / scaleY}
        width={w}
        height={h / scaleY}
      >
        <RadialGradient
          c={vec(0, 0)}
          r={vignette.rx}
          colors={vignette.colors}
          positions={vignette.positions}
        />
      </Rect>
    </Group>
  );
}

export function Grain({
  w,
  h,
  amount,
}: {
  w: number;
  h: number;
  amount: number;
}) {
  const paint = useMemo(() => {
    const p = Skia.Paint();
    p.setAlphaf(amount * 0.55);
    return p;
  }, [amount]);
  return (
    <Group layer={paint}>
      <Rect x={0} y={0} width={w} height={h}>
        <FractalNoise freqX={0.9} freqY={0.9} octaves={3} seed={0} />
      </Rect>
    </Group>
  );
}

export function BackgroundMesh({
  preset,
  animated = false,
  debugMode,
}: {
  preset: BackgroundPreset;
  animated?: boolean;
  debugMode?: BgDebugMode;
}) {
  const { width: w, height: h } = useWindowDimensions();
  const spec = useMemo(() => buildSpec(preset, w, h), [preset, w, h]);
  const baseLine = gradientLine(spec.base.angle, w, h);
  const beams = spec.beams ?? (spec.beam ? [spec.beam] : []);

  return (
    <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
      <Rect x={0} y={0} width={w} height={h}>
        <LinearGradient
          start={baseLine.start}
          end={baseLine.end}
          colors={spec.base.colors}
          positions={spec.base.positions}
        />
      </Rect>
      {spec.layers.map((layer, i) => (
        <BlobLayer key={i} layer={layer} mode={debugMode} />
      ))}
      {beams.map((beam, i) => (
        <BeamLayer key={i} beam={beam} w={w} h={h} animated={animated} />
      ))}
      {spec.vignette && <Vignette vignette={spec.vignette} w={w} h={h} />}
      {spec.grain !== undefined && <Grain w={w} h={h} amount={spec.grain} />}
    </Canvas>
  );
}

export function ScreenBackground({
  preset,
  animated,
  children,
}: {
  preset?: BackgroundPreset;
  animated?: boolean;
  children: ReactNode;
}) {
  return (
    <YStack f={1} bg="$background">
      {preset && <BackgroundMesh preset={preset} animated={animated} />}
      <YStack f={1} w="100%" maxWidth={560} als="center">
        {children}
      </YStack>
      <StatusBarScrim />
    </YStack>
  );
}
