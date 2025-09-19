import { db } from '../db/index.js';

function runDbDoctor() {
    console.log('Running DB Doctor...');

    const dbPath = db.name;
    console.log(`Resolved DB Path: ${dbPath}`);

    const journalMode = db.pragma('journal_mode', { simple: true });
    console.log(`Journal Mode: ${journalMode}`);

    const tmpDir = process.env.TMPDIR;
    console.log(`TMPDIR: ${tmpDir}`);

    try {
        db.exec(`CREATE TABLE IF NOT EXISTS doctor_test(id INTEGER PRIMARY KEY, value TEXT)`);
        const insertStmt = db.prepare(`INSERT INTO doctor_test (value) VALUES (?)`);
        const info = insertStmt.run('test');
        const selectStmt = db.prepare(`SELECT * FROM doctor_test WHERE id = ?`);
        const row = selectStmt.get(info.lastInsertRowid);
        if (row.value === 'test') {
            console.log('✅ DB write/read test passed.');
        } else {
            console.error('❌ DB write/read test failed.');
        }
        db.exec(`DROP TABLE doctor_test`);
    } catch (e) {
        console.error('❌ DB write/read test failed:', e);
    }
}

runDbDoctor();
