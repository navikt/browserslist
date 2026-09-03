// Below-floor Web APIs that eslint-plugin-compat DOES detect today.
// The fixture test asserts one compat/compat diagnostic per API.
export function probes() {
  const pattern = new URLPattern({ pathname: '/saker/:id' });
  const transport = new WebTransport('https://example.test');
  const observer = new ReportingObserver(() => {});
  const highlight = new Highlight();
  const policy = trustedTypes.createPolicy('default', { createHTML: (html) => html });
  requestIdleCallback(() => {});
  navigation.navigate('/neste');
  return { pattern, transport, observer, highlight, policy };
}
