# @navikt/browserslist-config

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
