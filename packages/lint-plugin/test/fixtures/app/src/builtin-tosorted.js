export function newestFirst(items) {
  return items.toSorted((a, b) => b.updatedAt - a.updatedAt);
}
