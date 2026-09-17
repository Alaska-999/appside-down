export interface OrbitTable {
  xs: number[];
  ys: number[];
}

const SAMPLES = 240;

export function ellipseTable(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  tiltDeg: number,
  startDeg = 180,
): OrbitTable {
  const dense = SAMPLES * 4;
  const angles: number[] = [];
  const lengths: number[] = [0];
  let prevX = 0;
  let prevY = 0;

  for (let i = 0; i <= dense; i++) {
    const a = ((startDeg + (360 * i) / dense) * Math.PI) / 180;
    const x = rx * Math.cos(a);
    const y = ry * Math.sin(a);
    angles.push(a);
    if (i > 0) {
      const d = Math.hypot(x - prevX, y - prevY);
      lengths.push(lengths[i - 1] + d);
    }
    prevX = x;
    prevY = y;
  }

  const total = lengths[lengths.length - 1];
  const tilt = (tiltDeg * Math.PI) / 180;
  const cos = Math.cos(tilt);
  const sin = Math.sin(tilt);
  const xs: number[] = [];
  const ys: number[] = [];
  let cursor = 0;

  for (let i = 0; i <= SAMPLES; i++) {
    const target = (total * i) / SAMPLES;
    while (cursor < lengths.length - 2 && lengths[cursor + 1] < target)
      cursor++;
    const span = lengths[cursor + 1] - lengths[cursor];
    const t = span > 0 ? (target - lengths[cursor]) / span : 0;
    const a = angles[cursor] + (angles[cursor + 1] - angles[cursor]) * t;
    const ex = rx * Math.cos(a);
    const ey = ry * Math.sin(a);
    xs.push(cx + ex * cos - ey * sin);
    ys.push(cy + ex * sin + ey * cos);
  }

  return { xs, ys };
}

export function pointAt(
  table: OrbitTable,
  t: number,
): { x: number; y: number } {
  "worklet";
  const clamped = t < 0 ? 0 : t > 1 ? 1 : t;
  const pos = clamped * (table.xs.length - 1);
  const i = Math.floor(pos);
  const j = i >= table.xs.length - 1 ? i : i + 1;
  const f = pos - i;
  return {
    x: table.xs[i] + (table.xs[j] - table.xs[i]) * f,
    y: table.ys[i] + (table.ys[j] - table.ys[i]) * f,
  };
}
