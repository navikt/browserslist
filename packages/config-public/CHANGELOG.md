# @navikt/browserslist-config

## 1.0.1

### Patch Changes

- 39b32f9: Stop installing Vite and Astro in projects that don't use them. The package declared both as optional peer dependencies, but the GitHub Packages registry leaves `peerDependenciesMeta` out of its metadata, so pnpm and npm treated them as required and installed them. The package never imported either at runtime, only their types, so the peer dependencies are gone. The `/vite` plugin and `/astro` integration types are now written out in the package instead; they still type-check in `plugins: [...]` on Vite 7 and 8, and in `integrations: [...]` on Astro 7.

## 1.0.0

### Major Changes

- e035537: First stable release (1.0.0).

## 0.3.0

### Minor Changes

- 9f69223: Add `@navikt/browserslist-config-public/remix`, the Remix 3 `createAssetServer` `target` object. Without a `target`, `remix/assets` doesn't lower any scripts or styles. The README now covers React Router (use the `/vite` plugin), Remix 3, and Remix v2 (not supported).
- 4dfaf5e: Rename `@navikt/browserslist-config` to `@navikt/browserslist-config-public` to make clear the floor is for public/user-facing Nav sites, not internal or caseworker-facing apps. Update your dependency and any `extends @navikt/browserslist-config` / import paths to the new name; the targets themselves are unchanged.

## 0.2.0

### Minor Changes

- 32e7552: Add `@navikt/browserslist-config/astro`, an Astro integration that applies Nav's browser targets to Astro's client JS and emitted CSS. Astro hardcodes `build.target: "esnext"`, so the `/vite` plugin alone has no effect in Astro builds.

## 0.1.0

### Minor Changes

- 70b6d5f: Initial release.
  
  - `@navikt/browserslist-config`: Nav's shared browserslist targets plus
    precomputed esbuild, Lightning CSS and Vite helpers.
  - `@navikt/browser-support-linting`: ESLint/Oxlint presets that flag
    non-lowerable syntax for those targets.
