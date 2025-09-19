import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { resolve, dirname, isAbsolute } from 'node:path';
import url from 'node:url';
import { assertWritablePath } from '../server/bootstrap/fs-check.js';

const here = dirname(url.fileURLToPath(import.meta.url));
const dataDir = resolve(here, '..', '.data');
mkdirSync(dataDir, { recursive: true });

const raw = process.env.DB_PATH || resolve(dataDir, 'hydraflow.db');
// Normalize path / URI
const isUri = raw.startsWith('file:');
const dbPath = raw === ':memory:' ? ':memory:' :
               isUri ? raw :
               (isAbsolute(raw) ? raw : resolve(raw));

process.env.TMPDIR ||= resolve(dataDir, 'tmp'); // SQLite temp spill
mkdirSync(process.env.TMPDIR, { recursive: true });

// Prove writability unless pure memory
if (dbPath !== ':memory:' && !isUri) assertWritablePath(dbPath);

// Open explicitly read/write
const db = new Database(dbPath, {
  readonly: false,
  fileMustExist: false,
  ...(isUri ? { uri: true } : {})
});

// In VMs, WAL often hits RO mounts. Default to DELETE unless you opt-in.
const wantWal = String(process.env.SQLITE_JOURNAL_MODE || '').toUpperCase() === 'WAL';
const jm = db.pragma(`journal_mode = ${wantWal ? 'WAL' : 'DELETE'}`)[0].journal_mode;

// Guard against accidental query-only mode
db.pragma('query_only = OFF');
db.pragma('foreign_keys = ON');

if (process.env.CI || process.env.VM) db.pragma('synchronous = OFF');

console.log('[DB]', JSON.stringify({
  path: dbPath, journal_mode: jm, tmpdir: process.env.TMPDIR, pid: process.pid
}));

export { db };
export const tx = (fn) => db.transaction(fn)();
export function closeDb() { try { db.close(); } catch (e) { /* ignore on exit */ } }
