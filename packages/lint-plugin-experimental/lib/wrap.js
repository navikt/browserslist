/**
 * Wraps an eslint-plugin-es-x rule for this plugin: identical detection
 * logic, but the docs url points at this package's README (which carries
 * the floor rationale) and every report message gains a floor-specific
 * suffix. This works because es-x rules report via messageId, which ESLint
 * resolves against the *registered* rule's meta.messages — and the copied
 * schema keeps consumer-supplied options valid.
 */
export function wrapEsxRule(baseRule, { messageSuffix, docsUrl }) {
  return {
    ...baseRule,
    meta: {
      ...baseRule.meta,
      docs: { ...baseRule.meta.docs, url: docsUrl },
      messages: Object.fromEntries(
        Object.entries(baseRule.meta.messages).map(([id, message]) => [id, message + messageSuffix]),
      ),
    },
    create: (context) => baseRule.create(context),
  };
}
