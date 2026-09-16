export function ratio(known: number, total: number): number {
  if (total <= 0) return 0;
  return Math.max(0, Math.min(1, known / total));
}

export function percent(known: number, total: number): number {
  return Math.round(ratio(known, total) * 100);
}
