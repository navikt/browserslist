# @navikt/browser-support-linting

ESLint and oxlint presets that flag what a bundler cannot fix (syntax-lower) for [Nav's browser targets](https://github.com/navikt/browserslist-config).

## Usage

```sh
pnpm add -D eslint @navikt/browser-support-linting @navikt/browserslist-config
```

Requires ESLint 10.6 or newer (the `eslint-plugin-es-x` rules this preset wraps need it).

```js
// eslint.config.js
import { defineConfig } from 'eslint/config';
import browserSupport from '@navikt/browser-support-linting';

export default defineConfig([
  ...browserSupport.configs.recommended,
  // Only for files served without a bundler (inline <script>s, CDN files):
  { files: ['public/**/*.js'], extends: [browserSupport.configs.unbundled] },
]);
```

## Config variants

`configs.recommended` includes:

1. **Web APIs** — [`eslint-plugin-compat`](https://www.npmjs.com/package/eslint-plugin-compat)'s `flat/recommended` (the `compat/compat` rule plus browser globals), with the floor's browserslist query pinned as the rule's option. Without the pin, compat would silently check whatever browserslist config it finds — or its defaults, which are far newer than the floor.
2. **Unpolyfilled builtins** — wrapped [`eslint-plugin-es-x`](https://eslint-community.github.io/eslint-plugin-es-x/) rules under the `browser-support/` namespace, one per builtin that is below the floor and that no bundler lowers. The selection and the floor-specific messages are generated from [`features.json`](./features.json) × [`@mdn/browser-compat-data`](https://www.npmjs.com/package/@mdn/browser-compat-data) × the floor — nothing resolves at lint time, and a floor bump regenerates the set.

`configs.unbundled` (opt-in, should be scoped with the `files` attribute) adds the third layer: `es-x` `restrict-to-es2021` — everything newer than the asserted ES level — minus the rules the recommended layer already carries. Bundled apps do not need it (the bundler lowers syntax); files that ship as-is do.

## Feature-guarding instead of polyfilling

Every wrapped rule runs with `allowTestedProperty: true`: usage that tests for the feature first is not reported. Two guard shapes are recognized — optional-call, and a prototype-level existence check:

```js
const sorted = items.toSorted?.() ?? [...items].sort();

if (Array.prototype.toSorted) {
  render(items.toSorted());
}
```

(An instance-level truthiness guard like `items.toSorted ? … : …` is still reported — the test expression itself touches the missing method.)

To silence `compat/compat` for an API you polyfill, use its [`settings.polyfills`](https://github.com/amilajack/eslint-plugin-compat#adding-polyfills) escape hatch in your own config.

## Below-floor features

<!-- BEGIN generated-feature-table -->
| Feature | Enforced by | Blocked by | What to do |
| --- | --- | --- | --- |
| <a id="promise-withresolvers"></a>**Promise.withResolvers** | `no-promise-withresolvers` | Chrome 119+ (floor 108), Edge 119+ (floor 108), Safari 17.4+ (floor 16), iOS Safari 17.4+ (floor 16), Opera 105+ (floor 94), Samsung Internet 25+ (floor 21) | Polyfill via core-js (`esnext.promise.with-resolvers`) or feature-guard. |
| <a id="promise-try"></a>**Promise.try** | `no-promise-try` | Chrome 128+ (floor 108), Edge 128+ (floor 108), Firefox 134+ (floor 121), Safari 18.2+ (floor 16), iOS Safari 18.2+ (floor 16), Opera 114+ (floor 94), Samsung Internet 28+ (floor 21) | Polyfill via core-js (`esnext.promise.try`) or feature-guard. |
| <a id="array-fromasync"></a>**Array.fromAsync** | `no-array-fromasync` | Chrome 121+ (floor 108), Edge 121+ (floor 108), Safari 16.4+ (floor 16), iOS Safari 16.4+ (floor 16), Opera 107+ (floor 94), Samsung Internet 25+ (floor 21) | Polyfill via core-js (`esnext.array.from-async`) or feature-guard. |
| <a id="object-groupby"></a>**Object.groupBy** | `no-object-groupby` | Chrome 117+ (floor 108), Edge 117+ (floor 108), Safari 17.4+ (floor 16), iOS Safari 17.4+ (floor 16), Opera 103+ (floor 94), Samsung Internet 24+ (floor 21) | Polyfill via core-js (`esnext.object.group-by`) or feature-guard. |
| <a id="map-groupby"></a>**Map.groupBy** | `no-map-groupby` | Chrome 117+ (floor 108), Edge 117+ (floor 108), Safari 17.4+ (floor 16), iOS Safari 17.4+ (floor 16), Opera 103+ (floor 94), Samsung Internet 24+ (floor 21) | Polyfill via core-js (`esnext.map.group-by`) or feature-guard. |
| <a id="map-getorinsert"></a>**Map/WeakMap.prototype.getOrInsert[Computed]** | `no-map-prototype-getorinsert`, `no-map-prototype-getorinsertcomputed`, `no-weakmap-prototype-getorinsert`, `no-weakmap-prototype-getorinsertcomputed` | Chrome 145+ (floor 108), Edge 145+ (floor 108), Firefox 144+ (floor 121), Safari 26.2+ (floor 16), iOS Safari 26.2+ (floor 16), Opera 129+ (floor 94), Samsung Internet (not shipped) | Very new (2025 proposal); use `map.get(k) ?? map.set(k, v).get(k)` or a polyfill. |
| <a id="set-methods"></a>**Set methods (union, intersection, difference, …)** | `no-set-prototype-union`, `no-set-prototype-intersection`, `no-set-prototype-difference`, `no-set-prototype-symmetricdifference`, `no-set-prototype-issubsetof`, `no-set-prototype-issupersetof`, `no-set-prototype-isdisjointfrom` | Chrome 122+ (floor 108), Edge 122+ (floor 108), Firefox 127+ (floor 121), Safari 17+ (floor 16), iOS Safari 17+ (floor 16), Opera 108+ (floor 94), Samsung Internet 26+ (floor 21) | Polyfill via core-js (`esnext.set.union` etc.) or feature-guard. |
| <a id="array-immutable"></a>**Array.prototype.toSorted/toReversed/toSpliced/with** | `no-array-prototype-tosorted`, `no-array-prototype-toreversed`, `no-array-prototype-tospliced`, `no-array-prototype-with` | Chrome 110+ (floor 108), Edge 110+ (floor 108), Opera 96+ (floor 94) | Polyfill via core-js (`esnext.array.to-sorted` etc.), or copy first: `[...arr].sort()`. |
| <a id="iterator-helpers"></a>**Iterator helpers (Iterator.from, .map, .filter, …)** | `no-iterator`, `no-iterator-prototype-map`, `no-iterator-prototype-filter`, `no-iterator-prototype-take`, `no-iterator-prototype-drop`, `no-iterator-prototype-flatmap`, `no-iterator-prototype-reduce`, `no-iterator-prototype-toarray`, `no-iterator-prototype-foreach`, `no-iterator-prototype-some`, `no-iterator-prototype-every`, `no-iterator-prototype-find` | Chrome 117+ (floor 108), Edge 117+ (floor 108), Firefox 131+ (floor 121), Safari 18.4+ (floor 16), iOS Safari 18.4+ (floor 16), Opera 103+ (floor 94), Samsung Internet 24+ (floor 21) | Polyfill via core-js (`esnext.iterator.*`) or spread into an array first. |
| <a id="regexp-escape"></a>**RegExp.escape** | `no-regexp-escape` | Chrome 136+ (floor 108), Edge 136+ (floor 108), Firefox 134+ (floor 121), Safari 18.2+ (floor 16), iOS Safari 18.2+ (floor 16), Opera 121+ (floor 94), Samsung Internet 29+ (floor 21) | Polyfill via core-js (`esnext.regexp.escape`) or escape manually. |
| <a id="error-iserror"></a>**Error.isError** | `no-error-iserror` | Chrome 134+ (floor 108), Edge 134+ (floor 108), Firefox 138+ (floor 121), Safari 18.4+ (floor 16), iOS Safari 18.4+ (floor 16), Opera 119+ (floor 94), Samsung Internet 29+ (floor 21) | Use `instanceof Error` (cross-realm caveats aside) or polyfill via core-js. |
| <a id="temporal"></a>**Temporal** | `no-temporal` | Chrome 144+ (floor 108), Edge 144+ (floor 108), Firefox 139+ (floor 121), Safari (not shipped), iOS Safari (not shipped), Opera 128+ (floor 94), Samsung Internet (not shipped) | Not shipped in Safari at all; use `@js-temporal/polyfill` deliberately or date-fns. |
| <a id="intl-duration"></a>**Intl.DurationFormat** | `no-intl-durationformat` | Chrome 129+ (floor 108), Edge 129+ (floor 108), Firefox 136+ (floor 121), Safari 16.4+ (floor 16), iOS Safari 16.4+ (floor 16), Opera 115+ (floor 94), Samsung Internet 28+ (floor 21) | Feature-guard (`'DurationFormat' in Intl`) with a manual fallback. |
| <a id="float16"></a>**Float16Array / Math.f16round / DataView float16** | `no-float16array`, `no-math-f16round`, `no-dataview-prototype-getfloat16-setfloat16` | Chrome 135+ (floor 108), Edge 135+ (floor 108), Firefox 129+ (floor 121), Safari 18.2+ (floor 16), iOS Safari 18.2+ (floor 16), Opera 120+ (floor 94), Samsung Internet 29+ (floor 21) | Polyfill via core-js (`esnext.float16-array`) or avoid half-precision. |
| <a id="uint8-base64"></a>**Uint8Array base64/hex conversion** | `no-uint8array-frombase64`, `no-uint8array-fromhex`, `no-uint8array-prototype-tobase64`, `no-uint8array-prototype-tohex`, `no-uint8array-prototype-setfrombase64`, `no-uint8array-prototype-setfromhex` | Chrome 140+ (floor 108), Edge 140+ (floor 108), Firefox 133+ (floor 121), Safari 18.2+ (floor 16), iOS Safari 18.2+ (floor 16), Opera 124+ (floor 94), Samsung Internet (not shipped) | Polyfill via core-js (`esnext.uint8-array.to-base64` etc.) or use `atob`/`btoa` helpers. |
| <a id="json-rawjson"></a>**JSON.rawJSON / JSON.isRawJSON** | `no-json-rawjson`, `no-json-israwjson` | Chrome 114+ (floor 108), Edge 114+ (floor 108), Firefox 135+ (floor 121), Safari 18.4+ (floor 16), iOS Safari 18.4+ (floor 16), Opera 100+ (floor 94), Samsung Internet 23+ (floor 21) | Feature-guard (`'rawJSON' in JSON`); no lightweight polyfill exists. |
| <a id="regex-lookbehind"></a>**RegExp lookbehind assertions** | `no-regexp-lookbehind-assertions` | Safari 16.4+ (floor 16), iOS Safari 16.4+ (floor 16) | Cannot be polyfilled — a lookbehind in a regex literal throws at parse time on old Safari. Rewrite the pattern (capture + post-process). |
| <a id="regex-v-flag"></a>**RegExp v flag (unicodeSets)** | `no-regexp-v-flag` | Chrome 112+ (floor 108), Edge 112+ (floor 108), Safari 17+ (floor 16), iOS Safari 17+ (floor 16), Opera 98+ (floor 94), Samsung Internet 23+ (floor 21) | Cannot be polyfilled — use the `u` flag and expand the set operations manually. |
| <a id="regex-modifiers"></a>**RegExp inline modifiers ((?i:…))** | `no-regexp-modifiers` | Chrome 125+ (floor 108), Edge 125+ (floor 108), Firefox 132+ (floor 121), Safari 26+ (floor 16), iOS Safari 26+ (floor 16), Opera 111+ (floor 94), Samsung Internet 27+ (floor 21) | Cannot be polyfilled — split the pattern or apply the flag to the whole regex. |
| <a id="abortsignal-any"></a>**AbortSignal.any** | ⚠️ **not flagged today** — guard manually | Chrome 116+ (floor 108), Edge 116+ (floor 108), Firefox 124+ (floor 121), Safari 17.4+ (floor 16), iOS Safari 17.4+ (floor 16), Opera 102+ (floor 94), Samsung Internet 24+ (floor 21) | Not flagged by eslint-plugin-compat today — guard manually or polyfill. |
| <a id="popover"></a>**Popover API (showPopover)** | ⚠️ **not flagged today** — guard manually | Chrome 114+ (floor 108), Edge 114+ (floor 108), Firefox 125+ (floor 121), Safari 17+ (floor 16), iOS Safari 17+ (floor 16), Opera 100+ (floor 94), Samsung Internet 23+ (floor 21) | Not flagged by eslint-plugin-compat today — feature-guard (`'showPopover' in el`) or use a library. |
| <a id="view-transitions"></a>**View Transitions (document.startViewTransition)** | ⚠️ **not flagged today** — guard manually | Chrome 111+ (floor 108), Edge 111+ (floor 108), Firefox 144+ (floor 121), Safari 18+ (floor 16), iOS Safari 18+ (floor 16), Opera 97+ (floor 94), Samsung Internet 22+ (floor 21) | Not flagged by eslint-plugin-compat today — feature-guard; the no-transition path must work. |
| <a id="navigation-api"></a>**Navigation API (window.navigation)** | `compat/compat` | Firefox 147+ (floor 121), Safari 26.2+ (floor 16), iOS Safari 26.2+ (floor 16) | Keep History API fallbacks. |
| <a id="urlpattern"></a>**URLPattern** | `compat/compat` | Firefox 142+ (floor 121), Safari 26+ (floor 16), iOS Safari 26+ (floor 16) | Use the `urlpattern-polyfill` package. |
| <a id="custom-highlight"></a>**Custom Highlight API** | `compat/compat` | Firefox 140+ (floor 121), Safari 17.2+ (floor 16), iOS Safari 17.2+ (floor 16) |  |
| <a id="webtransport"></a>**WebTransport** | `compat/compat` | Safari 26.4+ (floor 16), iOS Safari 26.4+ (floor 16) | No polyfill — feature-guard with a WebSocket fallback. |
| <a id="trusted-types"></a>**Trusted Types** | `compat/compat` | Firefox 148+ (floor 121), Safari 26+ (floor 16), iOS Safari 26+ (floor 16) | Use the tt-policy pattern behind a feature-guard; enforcement is Chromium-only anyway. |
| <a id="reporting-api"></a>**Reporting API (ReportingObserver)** | `compat/compat` | Firefox 149+ (floor 121), Safari 16.4+ (floor 16), iOS Safari 16.4+ (floor 16) |  |
| <a id="check-visibility"></a>**Element.checkVisibility** | ⚠️ **not flagged today** — guard manually | Safari 17.4+ (floor 16), iOS Safari 17.4+ (floor 16) | Not flagged by eslint-plugin-compat today (instance-receiver usage) — feature-guard or use IntersectionObserver. |
| <a id="request-idle"></a>**requestIdleCallback** | `compat/compat` | Safari (not shipped), iOS Safari (not shipped) | Never shipped in Safari — feature-guard with a `setTimeout` fallback. |
<!-- END generated-feature-table -->

Rows marked **not flagged today** are real gaps: `eslint-plugin-compat`'s detection data ([`ast-metadata-inferer`](https://www.npmjs.com/package/ast-metadata-inferer)) predates those APIs or only matches them on class receivers, so nothing warns about them yet. Guard them manually. The plugin's fixture tests pin this — when a compat release starts catching one, our tests fail and this table gets regenerated.

Also note `compat`'s own `@mdn/browser-compat-data` dependency trails the version this plugin generates from, so *support versions* for the caught APIs can lag slightly. And `compat` carries its own version-keyed checks for a few regex features, so a lookbehind can be reported twice — once by each layer, with the `browser-support` message carrying the guidance; both disappear at the appropriate floor.

## Asserted levels

No level-based lint tool reads browserslist, so this plugin asserts the floor's levels itself and exports them:

```js
import { levels } from '@navikt/browser-support-linting';
// { es: { year: 2021, caveats: [...] }, baseline: { year: 2022, approximate: true } }
```

- **ES 2021** — ES2022 is incomplete at the floor: class static blocks need Safari 16.4, the floor is Safari 16.
- **Baseline ≈ 2022** — approximate because Baseline's core browser set excludes Opera and Samsung Internet, which the floor includes.

Marker tests guard both: when a floor bump changes an answer, this package's CI fails until the assertion — and the `restrict-to-es` level in `configs.unbundled` — is updated deliberately.

## Composing with your own config

- The preset registers the `compat`, `browser-support` and (in `unbundled`) `es-x` plugin namespaces. If your config also registers `compat` or `es-x` itself, use *the instances this package depends on* or place your registration first — ESLint errors on two different plugin objects under one namespace.
- Every `browser-support/*` rule can be turned off or reconfigured individually; ids mirror the underlying es-x rules.
- If your project genuinely targets different browsers than the floor, re-declare the Web-API rule with your own query after the preset — later rule entries replace earlier ones wholesale:

  ```js
  { rules: { 'compat/compat': ['error', 'chrome >= 120, safari >= 17'] } }
  ```

  The `browser-support/*` builtin rules stay keyed to the floor regardless; disable individual ones if you diverge deliberately.

## oxlint

The same presets ship as plain config objects on the `/oxlint` entrypoint, for `oxlint.config.ts` (`.oxlintrc.json` `extends` takes file paths only and cannot import a package; TS configs need Node 22.18+). The entrypoint pins its `jsPlugins` specifiers to absolute paths inside this package, so nothing else needs registering:

```ts
// oxlint.config.ts
import { defineConfig } from 'oxlint';
import browserSupport from '@navikt/browser-support-linting/oxlint';

export default defineConfig({
  extends: [browserSupport.recommended],
  // Only for files served without a bundler (inline <script>s, CDN files):
  overrides: [{ files: ['public/**/*.js'], ...browserSupport.unbundled }],
});
```

To target specific files with the `recommended` plugin

```ts
// oxlint.config.ts
import { defineConfig } from 'oxlint';
import browserSupport from '@navikt/browser-support-linting/oxlint';

export default defineConfig({
  overrides: [{
    files: ['client/**/*.js'],
    jsPlugins: browserSupport.recommended.jsPlugins,
    rules: browserSupport.recommended.rules
  }],
});
```

Alternatively, just use a nested config, oxlint applies the nearest config file to each file and does not merge it with the parent.

## Versioning

- A floor bump in `@navikt/browserslist-config` should regenerate the rules here and is a breaking change
- New rules without a change in the _config_ should be a patch.

## Development

Generated files are checked in; CI fails if `pnpm generate` produces a diff.

```sh
pnpm --filter @navikt/browser-support-linting generate
pnpm --filter @navikt/browser-support-linting test
```
