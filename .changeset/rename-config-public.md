---
"@navikt/browserslist-config-public": minor
---

Rename `@navikt/browserslist-config` to `@navikt/browserslist-config-public` to make clear the floor is for public/user-facing Nav sites, not internal or caseworker-facing apps. Update your dependency and any `extends @navikt/browserslist-config` / import paths to the new name; the targets themselves are unchanged.
