export function markCurrent(items) {
  const pattern = new URLPattern({ pathname: '/saker/:id' });
  const grouped = Object.groupBy(items, (item) => item.kind);
  const re = /(?<=NAV-)\d+/;
  return { pattern, grouped, sorted: items.toSorted(), re };
}
