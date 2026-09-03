// Below-floor Web APIs that eslint-plugin-compat does NOT detect today
// (its ast-metadata-inferer data predates them, or only matches class
// receivers). The fixture test PINS zero diagnostics here: when a compat
// release starts catching one of these, the test fails on purpose so
// features.json's compatCoverage and the README table get updated.
export async function probes(el) {
  el.showPopover();
  await document.startViewTransition(() => {}).finished;
  const signal = AbortSignal.any([]);
  const visible = el.checkVisibility();
  return { signal, visible };
}
