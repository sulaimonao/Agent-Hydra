// scripts/preflight-imports.mjs
import { readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const roots = ['api', 'src', 'lib', 'server.js']; // adjusted for this project
const files = [];

function walk(dir) {
  if (!statSync(dir).isDirectory()) {
      if (/\.(m?js|c?ts)$/.test(dir)) {
          files.push(dir);
      }
      return;
  }
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) walk(p);
    else if (/\.(m?js|c?ts)$/.test(name)) files.push(p);
  }
}
roots.forEach(walk);

async function main() {
    // Import all modules (ESM): will throw on missing imports/exports immediately.
    for (const f of files) {
      try {
        await import('file://' + join(process.cwd(), f));
      } catch (e) {
        console.error('[PRELOAD ERROR]', f, '\n', e?.stack || e);
        process.exitCode = 1;
      }
    }

    if (!process.exitCode) {
      console.log('✅ Preflight imports passed:', files.length, 'modules');
    }
}

main();
