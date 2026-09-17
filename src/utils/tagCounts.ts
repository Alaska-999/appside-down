type TaggedModule = { tags: { id: string }[] };

export function computeTagCounts(modules: TaggedModule[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const m of modules)
    for (const t of m.tags) counts.set(t.id, (counts.get(t.id) ?? 0) + 1);
  return counts;
}
