import Database from 'better-sqlite3';
import { mkdtempSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const base = mkdtempSync(join(tmpdir(), 'hf-probe-'));
mkdirSync(join(base, 'tmp'), { recursive: true });
process.env.TMPDIR = join(base, 'tmp');

const db = new Database(join(base, 'probe.db'), { fileMustExist: false });
console.log('opened:', join(base, 'probe.db'));
console.log('journal before:', db.pragma('journal_mode')[0].journal_mode);
console.log('set journal DELETE:', db.pragma('journal_mode = DELETE')[0].journal_mode);
db.exec('CREATE TABLE IF NOT EXISTS t(x)');
db.prepare('INSERT INTO t(x) VALUES (?)').run(1);
console.log('row:', db.prepare('SELECT x FROM t').get());
db.close();
console.log('closed ok');
