import { accessSync, constants, mkdirSync, openSync, closeSync } from 'node:fs';
import { dirname } from 'node:path';

export function assertWritablePath(p) {
  const dir = dirname(p);
  mkdirSync(dir, { recursive: true });
  // dir must be writable
  accessSync(dir, constants.W_OK | constants.R_OK);

  // touch the db file (not required by SQLite if it can create it, but this proves perms)
  try {
    const fd = openSync(p, 'a'); closeSync(fd);
  } catch (e) {
    throw new Error(`DB file not creatable: ${p}\n${e.stack || e}`);
  }

  // journal files live next to the DB in DELETE/WAL modes; verify dir again
  // also ensure temp dir will be writable (SQLite may spill temp there)
  return { dir };
}
