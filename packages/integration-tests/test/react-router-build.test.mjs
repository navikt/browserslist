import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, readdir, readFile, rm } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after, before, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const run = promisify(execFile);
const require = createRequire(import.meta.url);
const testsDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const fixtureDir = path.join(testsDir, 'fixtures', 'react-router-app');
const devPkgPath = require.resolve('@react-router/dev/package.json');
const reactRouterBin = path.join(path.dirname(devPkgPath), require(devPkgPath).bin['react-router']);

// Markers in the fixture (see app/routes/home.tsx and app/app.css):
const STATIC_BLOCK = /static\s*\{/; // class static block, lowered for Safari < 16.4
const OKLCH = /oklch\(/; // converted for Chrome < 111
const WEBKIT_USER_SELECT = /-webkit-user-select/; // prefix Safari 16 needs

let tmp;
const builds = {};

/** Runs the real `react-router build` CLI and returns the client output's JS and CSS. */
async function build(variant) {
  const outDir = path.join(tmp, variant);
  await run(process.execPath, [reactRouterBin, 'build'], {
    cwd: fixtureDir,
    env: { ...process.env, NAV_VARIANT: variant, NAV_BUILD_DIR: outDir, NODE_ENV: 'production' },
  });
  const assetsDir = path.join(outDir, 'client', 'assets');
  const files = await readdir(assetsDir);
  const read = async (ext) =>
    (await Promise.all(files.filter((f) => f.endsWith(ext)).map((f) => readFile(path.join(assetsDir, f), 'utf8')))).join('\n');
  return { js: await read('.js'), css: await read('.css') };
}

describe('React Router (framework mode) + Vite 8 build with the /vite plugin', { timeout: 180_000 }, () => {
  before(async () => {
    tmp = await mkdtemp(path.join(tmpdir(), 'nav-rr-build-'));
    const variants = ['plugin', 'none', 'user-esnext'];
    const results = await Promise.all(variants.map(build));
    variants.forEach((v, i) => (builds[v] = results[i]));
  });

  after(async () => {
    if (tmp) await rm(tmp, { recursive: true, force: true });
  });

  it('control: without the plugin the markers survive (the test can tell the difference)', () => {
    assert.match(builds.none.js, STATIC_BLOCK);
    assert.match(builds.none.css, OKLCH);
  });

  it('lowers client JS to the floor', () => {
    assert.ok(builds.plugin.js.length > 0);
    assert.doesNotMatch(builds.plugin.js, STATIC_BLOCK);
  });

  it('lowers and prefixes the client CSS', () => {
    assert.ok(builds.plugin.css.length > 0);
    assert.doesNotMatch(builds.plugin.css, OKLCH);
    assert.match(builds.plugin.css, WEBKIT_USER_SELECT);
  });

  it('an explicit build.target in the user config wins', () => {
    assert.match(builds['user-esnext'].js, STATIC_BLOCK);
    assert.match(builds['user-esnext'].css, OKLCH);
  });
});
