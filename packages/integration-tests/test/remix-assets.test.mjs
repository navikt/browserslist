import assert from 'node:assert/strict';
import path from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
// Same module `remix/assets` re-exports in Remix 3.
import { createAssetServer } from '@remix-run/assets';
import target from '@navikt/browserslist-config/remix';

const testsDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const fixtureDir = path.join(testsDir, 'fixtures', 'remix-assets-app');

const STATIC_BLOCK = /static\s*\{/;
const OKLCH = /oklch\(/;
const WEBKIT_USER_SELECT = /-webkit-user-select/;

/** Compiles the fixture's script and stylesheet through a real asset server. */
async function compile(options) {
  const server = createAssetServer({
    rootDir: fixtureDir,
    basePath: '/assets',
    allowFiles: ['app/**'],
    watch: false,
    ...options,
  });
  try {
    const fetchText = async (file) => {
      const href = await server.getHref(file);
      const response = await server.fetch(new Request(new URL(href, 'http://localhost')));
      assert.equal(response?.status, 200, `${file} should be served`);
      return response.text();
    };
    return { js: await fetchText('app/entry.js'), css: await fetchText('app/style.css') };
  } finally {
    await server.close();
  }
}

describe('Remix 3 asset server with the /remix target', { timeout: 60_000 }, () => {
  it('createAssetServer accepts the target (it throws on unknown keys such as ios_saf)', async () => {
    const options = { rootDir: fixtureDir, basePath: '/assets', allowFiles: ['app/**'], watch: false };
    assert.throws(() => createAssetServer({ ...options, target: { ios_saf: '16' } }), /not a supported target/);
    const server = createAssetServer({ ...options, target });
    await server.close();
  });

  it('control: without a target nothing is lowered', async () => {
    const { js, css } = await compile({});
    assert.match(js, STATIC_BLOCK);
    assert.match(css, OKLCH);
    assert.doesNotMatch(css, WEBKIT_USER_SELECT);
  });

  it('lowers scripts and lowers/prefixes styles to the floor', async () => {
    const { js, css } = await compile({ target });
    assert.doesNotMatch(js, STATIC_BLOCK);
    assert.doesNotMatch(css, OKLCH);
    assert.match(css, WEBKIT_USER_SELECT);
  });

  it('also applies with minification on', async () => {
    const { js, css } = await compile({ target, minify: true });
    assert.doesNotMatch(js, STATIC_BLOCK);
    assert.doesNotMatch(css, OKLCH);
    assert.match(css, WEBKIT_USER_SELECT);
  });
});
