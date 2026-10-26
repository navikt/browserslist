// The sanctioned feature-guard shapes — allowTestedProperty keeps these clean.
export function newestFirst(items) {
  return items.toSorted?.((a, b) => b.updatedAt - a.updatedAt) ?? [...items].sort((a, b) => b.updatedAt - a.updatedAt);
}
