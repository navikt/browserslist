---
'@navikt/browserslist-config-public': patch
---

Stop installing Vite and Astro in projects that don't use them. The package declared both as optional peer dependencies, but the GitHub Packages registry leaves `peerDependenciesMeta` out of its metadata, so pnpm and npm treated them as required and installed them. The package never imported either at runtime, only their types, so the peer dependencies are gone. The `/vite` plugin and `/astro` integration types are now written out in the package instead; they still type-check in `plugins: [...]` on Vite 7 and 8, and in `integrations: [...]` on Astro 7.
