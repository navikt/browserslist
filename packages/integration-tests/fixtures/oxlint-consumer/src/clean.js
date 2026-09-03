// Feature-guarded usage: allowTestedProperty must keep this file clean.
export function newestFirst(items) {
  return items.toSorted?.((a, b) => b.updatedAt - a.updatedAt) ?? [...items].sort((a, b) => b.updatedAt - a.updatedAt);
}
