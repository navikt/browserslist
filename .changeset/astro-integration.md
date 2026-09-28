---
"@navikt/browserslist-config": minor
---

Add `@navikt/browserslist-config/astro`, an Astro integration that applies Nav's browser targets to Astro's client JS and emitted CSS. Astro hardcodes `build.target: "esnext"`, so the `/vite` plugin alone has no effect in Astro builds.
