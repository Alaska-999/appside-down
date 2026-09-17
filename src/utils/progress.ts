import { LearningStatus, ModuleProgress } from "@/src/types";

const CARDS_PER_MINUTE = 4;

export function ratio(known: number, total: number): number {
  if (total <= 0) return 0;
  return Math.max(0, Math.min(1, known / total));
}

export function percent(known: number, total: number): number {
  return Math.round(ratio(known, total) * 100);
}

export function estimateMinutes(count: number): number {
  return Math.max(1, Math.round(count / CARDS_PER_MINUTE));
}

export function normalizeProgress(
  progress: Partial<ModuleProgress> | undefined,
  cards: { status?: LearningStatus }[],
): ModuleProgress {
  const total = progress?.total ?? cards.length;
  const mastered =
    progress?.mastered ??
    progress?.known ??
    cards.filter((c) => c.status === "KNOWN").length;
  const fresh =
    progress?.new ??
    progress?.unstudied ??
    cards.filter((c) => c.status === "UNSTUDIED").length;
  const learning = progress?.learning ?? Math.max(0, total - mastered - fresh);

  return {
    new: fresh,
    learning,
    mastered,
    total,
    known: mastered,
    unstudied: fresh,
    nextAction: progress?.nextAction ?? null,
  };
}
