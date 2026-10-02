# browserslist-config

Nav's shared browser-support targets, published as [`@navikt/browserslist-config`](packages/config/README.md), plus the companion lint preset [`@navikt/browser-support-linting`](packages/lint-plugin/README.md).

**→ [Config README with all usage recipes](packages/config/README.md)** (Next.js, Vite, Astro, React Router, Remix 3, Storybook, esbuild, tsup, webpack, Lightning CSS, PostCSS, lint tooling)

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

Releasing takes two merges:

- **Add a changeset:** run `pnpm changeset` in your branch and commit the generated `.changeset/*.md` alongside your change.
- **Merge your PR:** the release workflow opens (or updates) a "Version Packages" PR that bumps versions and writes the CHANGELOGs, but publishes nothing.
- **Merge the "Version Packages" PR:** this is what actually publishes the new versions to GitHub Packages.

[Changesets](https://github.com/changesets/changesets) + GitHub Actions publish to [GitHub Packages](https://docs.github.com/packages) on merge to `main`. The release workflow reuses the CI workflow, so a publish only happens after the test matrix, the generated-files check and `pnpm check` all pass.

## Installing in a consuming project

These packages are internal and hosted on GitHub Packages, which has no anonymous read access. Consumers need an `.npmrc` pointing the `@navikt` scope at the GitHub registry:

```ini
@navikt:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

Set `NODE_AUTH_TOKEN` to a personal access token with the `read:packages` scope. In GitHub Actions, `secrets.GITHUB_TOKEN` works directly:

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: 24
    registry-url: https://npm.pkg.github.com
- run: pnpm install --frozen-lockfile
  env:
    NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```
