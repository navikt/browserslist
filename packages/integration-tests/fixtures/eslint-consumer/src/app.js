// Bundled app code: the recommended config applies.
// items.toSorted() -> browser-support (below-floor builtin);
// new URLPattern() -> compat/compat (below-floor Web API).
export function markCurrent(items) {
  const pattern = new URLPattern({ pathname: '/saker/:id' });
  return items.toSorted((a, b) => b.updatedAt - a.updatedAt).map((item) => ({
    ...item,
    current: pattern.test({ pathname: item.path }),
  }));
}
