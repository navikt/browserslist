# @navikt/browserslist-config

Nav's shared browser support targets, as code: a [browserslist shareable config](https://github.com/browserslist/browserslist#shareable-configs) plus helpers for the most popular bundlers.

> **Status: 0.x — floors are provisional.** They operationalize the design system's (Aksel's) CSS requirements today and will be validated against nav.no analytics before 1.0. Expect deliberate, changelogged floor bumps; see [versioning](#versioning-and-floor-changes).

## Supported browsers

<!-- BEGIN generated-support-table -->
| Browser | Minimum version | Released | Notes |
| --- | --- | --- | --- |
| Chrome | 108 | 2022-11 |  |
| Edge | 108 | 2022-12 |  |
| Firefox | 121 | 2023-12 |  |
| Safari (macOS) | 16 | 2022-09 |  |
| Safari (iOS) | 16 | 2022-09 | Every iOS browser (Chrome, Firefox, Edge, …) uses WebKit |
| Opera | 94 | 2022-12 | ≈ Chromium 108 |
| Samsung Internet | 21 | 2023-05 | ≈ Chromium 108 |
<!-- END generated-support-table -->

## Why this floor

- **Basis:** the minimum browser versions required by [Aksel's](https://aksel.nav.no) CSS (`:has()`, container queries, dynamic viewport units). If the design system's styles don't render, nothing else about a page matters — so the design system's requirements set the floor for everyone building on it.
- It turns Nav's prose policy — [Hvilke nettlesere, enheter og hjelpemidler støtter vi?](https://aksel.nav.no/god-praksis/artikler/nettleserstotte) (support browsers used by more than 2 % of our users, no Internet Explorer, ~70 % mobile traffic) — into pinned, machine-readable versions for the first time.
- **Why pinned versions** instead of `"last 2 versions"`, usage percentages, or `baseline widely available`: pinned floors resolve identically on every machine and every day, give lint tooling an exact contract, produce reviewable diffs when the floor moves, and are immune to the class of bugs where stale caniuse data silently changes what a dynamic query resolves to ([vercel/next.js#92091](https://github.com/vercel/next.js/issues/92091)).

Your bundler *lowers syntax* to this floor — it does **not** polyfill runtime APIs. `Array.prototype.toSorted`, `Set.prototype.union`, `URLPattern` and friends need a polyfill or a feature check if the floor doesn't cover them. (Companion lint rules that flag exactly this are planned; `eslint-plugin-compat` works with this config today.)

## Install

```sh
npm install --save-dev @navikt/browserslist-config
```

(or `pnpm add -D` / `yarn add -D` / `bun add -d`.)

## Usage

### For Next.js, webpack, and others that read the `browserslist` field

Add to your **package.json**:

```json
{
  "browserslist": ["extends @navikt/browserslist-config"]
}
```

### Vite

Vite does not read browserslist. Its default is `baseline-widely-available` which includes newer browsers than Nav's support-spec.

A plugin is available:

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import NavBrowserTargets from '@navikt/browserslist-config/vite';

export default defineConfig({
  plugins: [NavBrowserTargets()],
});
```

<details>
  <summary>The plugin will set the following attributes, but only when your config doesn't set them</summary>

1. `build.target` (JS + CSS output; `build.cssTarget` derives from it automatically),
2. dev-server dependency pre-bundling targets (avoids dev/prod skew on Vite 8),
3. `css.lightningcss.targets`, if you opted into `css.transformer: 'lightningcss'` (its targets otherwise ignore `build.target`).

</details>

It's also possible to explicitly import/set the same config attributes if needed.

```ts
import { defineConfig } from 'vite';
import { targets, lightningcssTargets } from '@navikt/browserslist-config/vite';

// lightningcssTargets not shown in-use here but is available

export default defineConfig({
  build: { target: targets },
  // these are set to ensure dev has the same transforms as prod
  optimizeDeps: { rolldownOptions: { transform: { target: targets } } },
  // For Vite 7 use: optimizeDeps: { esbuildOptions: { target: targets } },
});
```

### Astro

Astro hardcodes `build.target: "esnext"` for its builds, so the `/vite` plugin (which only fills unset values) has no effect there. Use the Astro integration instead:

```ts
// astro.config.mjs
import { defineConfig } from 'astro/config';
import navBrowserTargets from '@navikt/browserslist-config/astro';

export default defineConfig({
  integrations: [navBrowserTargets()],
});
```

<details>
  <summary>What the integration sets</summary>

1. `environments.client.build.target`: the JS shipped to browsers. Replaced when unset or `"esnext"` (Astro's default); any other value is kept.
2. `environments.ssr.build.cssTarget` and `environments.prerender.build.cssTarget`: Astro emits page CSS from its server builds, so these govern the CSS in `dist/client`. Only filled when neither the environment nor `vite.build.cssTarget` sets them.
3. Everything the `/vite` plugin sets (dev-server pre-bundling, Lightning CSS targets when opted in).

Server JS is left at `esnext`.

</details>

Also adding the `browserslist` field to `package.json` has no effect on Astro's build output, but lint tooling (e.g. `eslint-plugin-compat`) reads it.

### React Router (framework mode)

React Router's Vite plugin doesn't read the `browserslist` field in `package.json` and sets no build targets of its own, so add the `/vite` plugin next to it:

```ts
// vite.config.ts
import { reactRouter } from '@react-router/dev/vite';
import { defineConfig } from 'vite';
import NavBrowserTargets from '@navikt/browserslist-config/vite';

export default defineConfig({
  plugins: [reactRouter(), NavBrowserTargets()],
});
```

- This covers the client JS and the CSS, which React Router ships from the client build. It works with React Router 7 and 8, on Vite 7 or 8.
- If your config sets `build.target` (including `"esnext"`), the plugin keeps it. Remove the line to get Nav's targets.
- Vite applies `build.target` to every environment, so server JS is lowered to the same floor too. Node runs it fine.

### Remix 3

Remix 3 doesn't use Vite. `remix/assets` compiles scripts and styles itself and lowers nothing unless it gets a `target`. Pass the `/remix` export:

```ts
import { createAssetServer } from 'remix/assets';
import target from '@navikt/browserslist-config/remix';

let assetServer = createAssetServer({
  basePath: '/assets',
  allowFiles: ['app/**'],
  target,
});
```

`remix.json` doesn't accept `target`. If you load your asset settings with `loadConfig()`, add it in code: `createAssetServer({ ...config.assets, target })`.

### Remix v2

Not supported. The classic Remix compiler has no browser-target setting, and Remix v2's Vite plugin needs Vite 5 or 6, below this package's Vite 7 minimum. Move to React Router (Remix v2's successor) and follow the section above.

### esbuild

```js
import esbuild from 'esbuild';
import target from '@navikt/browserslist-config/esbuild';

await esbuild.build({ entryPoints: ['src/app.ts'], bundle: true, target });
```

CLI:

```sh
esbuild src/app.ts --bundle --target=$(node -p "require('@navikt/browserslist-config/esbuild').join(',')")
```

### tsup

tsup has no browserslist support; pass the esbuild targets explicitly:

```ts
// tsup.config.ts
import { defineConfig } from 'tsup';
import target from '@navikt/browserslist-config/esbuild';

export default defineConfig({ target });
```

### Lightning CSS

```js
import { transform } from 'lightningcss';
import targets from '@navikt/browserslist-config/lightningcss';

transform({ filename: 'app.css', code, targets });
```

## Exports

| Import | Returns |
| --- | --- |
| `@navikt/browserslist-config` | `string[]` browserslist queries — the shareable config (`extends` target) |
| `@navikt/browserslist-config/esbuild` | `string[]` esbuild/Vite/tsup `target` strings |
| `@navikt/browserslist-config/lightningcss` | Lightning CSS `targets` object (versions packed `major<<16 \| minor<<8`) |
| `@navikt/browserslist-config/vite` | Vite plugin factory; named `targets` / `lightningcssTargets` for manual wiring |
| `@navikt/browserslist-config/astro` | Astro integration factory; same named `targets` / `lightningcssTargets` |
| `@navikt/browserslist-config/remix` | Remix 3 `createAssetServer` `target` object (version strings; iOS Safari keyed `ios`) |
| `@navikt/browserslist-config/browsers.json` | The source of truth: a flat `{ family: minVersion }` map |

The package is ESM. The one exception is a generated CJS twin of the root (`index.cjs`), served through the `require` condition, because the browserslist `extends` protocol loads configs with a synchronous `require()` that must return a plain array — including from runtimes outside our control (Turbopack's spawned resolver, editor extensions). The ESM helpers additionally export their value as `'module.exports'`, so a stray `require()` of a subpath also returns the raw value on modern Node.

## FAQ

**My bundle/CSS got bigger after adopting this.**
Expected. Vite's and Next's defaults target newer browsers than Nav supports, so your build likely excluded real users before. The extra bytes are probably due to syntax-lowering and not a regression.

**Does this polyfill missing APIs?**
No. It only sets *compile targets*. Syntax (e.g. class static blocks) is lowered by your bundler. Runtime builtins and Web APIs are not — check [caniuse](https://caniuse.com) against the floor, feature-detect, or polyfill.
