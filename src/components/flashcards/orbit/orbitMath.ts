export const TWO_PI = Math.PI * 2;

export function toRad(deg: number) {
  "worklet";
  return (deg * Math.PI) / 180;
}

export function clamp01(value: number) {
  "worklet";
  return value < 0 ? 0 : value > 1 ? 1 : value;
}

export function clampTo(value: number, lo: number, hi: number) {
  "worklet";
  return value < lo ? lo : value > hi ? hi : value;
}
