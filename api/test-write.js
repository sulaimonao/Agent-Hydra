import { db } from '../db/index.js';
export default (app) => {
  app.post?.('/api/test-write', (_req, res) => {
    db.exec(`CREATE TABLE IF NOT EXISTS smoke(k TEXT PRIMARY KEY, v TEXT);`);
    db.prepare(`INSERT OR REPLACE INTO smoke(k, v) VALUES ('probe','ok')`).run();
    res.end('WROTE_OK');
  });
  // Convenience GET variant:
  app.get?.('/api/test-write', (_req, res) => {
    db.exec(`CREATE TABLE IF NOT EXISTS smoke(k TEXT PRIMARY KEY, v TEXT);`);
    db.prepare(`INSERT OR REPLACE INTO smoke(k, v) VALUES ('probe','ok')`).run();
    res.end('WROTE_OK');
  });
};
