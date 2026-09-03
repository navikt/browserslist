# browserslist-config

Nav's shared browser-support targets, published as [`@navikt/browserslist-config`](packages/config/README.md), plus the companion lint preset [`@navikt/browser-support-linting`](packages/lint-plugin/README.md).

**→ [Config README with all usage recipes](packages/config/README.md)** (Next.js, Vite, Storybook, esbuild, tsup, webpack, Lightning CSS, PostCSS, lint tooling)

## Repository layout

| Path | Contents |
| --- | --- |
| [`packages/config`](packages/config) | The browserslist config package. |
| [`packages/lint-plugin`](packages/lint-plugin) | Lint preset (ESLint 10 and oxlint) flagging Web APIs and syntax newer than what's supported. |
| [`packages/integration-tests`](packages/integration-tests) | Internal consumer-perspective tests |

## Development

```sh
pnpm install
pnpm generate   # regenerate both packages from browsers.json (+ the plugin's features.json)
pnpm -r test    # unit + integration tests
pnpm check      # publint + arethetypeswrong, both packages
```

Generated files are checked in; CI fails if `pnpm generate` produces a diff.

### Changing the browser floor

1. Edit `packages/config/browsers.json` (only this file).
2. `pnpm generate` — the query array, esbuild targets, Lightning CSS targets, metadata and the README support table are rewritten and validated against the pinned caniuse database; the lint plugin's rule selection and feature table are recomputed against browser-compat-data.
3. `pnpm -r test` — expect the plugin's marker tests or generator warnings to fail **deliberately** if the bump changes an asserted ES/Baseline level or moves a feature above the floor; update `packages/lint-plugin/features.json` to match.
4. Add changesets (`pnpm changeset`) for both packages. Raising a floor is a **breaking** change — see [VERSIONING.md](VERSIONING.md).

## Releases

[Changesets](https://github.com/changesets/changesets) + GitHub Actions publish to the public npm registry with provenance on merge to `main`.
