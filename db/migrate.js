import { db } from './index.js';

const migrations = [
  () => {
    db.exec(`
        CREATE TABLE IF NOT EXISTS heads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        chatroom_id TEXT NOT NULL,
        name TEXT,
        status TEXT,
        capabilities TEXT,
        preferences TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);
    db.exec(`
        CREATE TABLE IF NOT EXISTS task_cards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        chatroom_id TEXT NOT NULL,
        goal TEXT,
        priority TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);
    db.exec(`
        CREATE TABLE IF NOT EXISTS subtasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_id INTEGER,
        task TEXT,
        status TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (task_id) REFERENCES task_cards(id) ON DELETE CASCADE
        );
    `);
    db.exec(`
        CREATE TABLE IF NOT EXISTS memory_state (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        chatroom_id TEXT NOT NULL,
        content TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);
    db.exec(`
        CREATE TABLE IF NOT EXISTS context_state (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        chatroom_id TEXT NOT NULL,
        context TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);
    db.exec(`
        CREATE TABLE IF NOT EXISTS api_metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        chatroom_id TEXT NOT NULL,
        route TEXT,
        latency_ms INTEGER,
        token_used INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);
    db.exec(`
        CREATE TABLE IF NOT EXISTS feedback_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        chatroom_id TEXT NOT NULL,
        rating INTEGER,
        comment TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);
    db.exec('CREATE INDEX IF NOT EXISTS idx_heads_user_chatroom ON heads (user_id, chatroom_id);');
    db.exec('CREATE INDEX IF NOT EXISTS idx_task_cards_user_chatroom ON task_cards (user_id, chatroom_id);');
    db.exec('CREATE INDEX IF NOT EXISTS idx_memory_state_user_chatroom ON memory_state (user_id, chatroom_id);');
    db.exec('CREATE INDEX IF NOT EXISTS idx_context_state_user_chatroom ON context_state (user_id, chatroom_id);');
    db.exec('CREATE TABLE IF NOT EXISTS sessions (sid TEXT PRIMARY KEY, sess TEXT NOT NULL, expire INTEGER NOT NULL)');
  },
];

export function migrate() {
  db.exec(`CREATE TABLE IF NOT EXISTS _migrations (version INTEGER PRIMARY KEY)`);
  const row = db.prepare(`SELECT MAX(version) as v FROM _migrations`).get();
  let current = row?.v ?? 0;
  for (let i = current; i < migrations.length; i++) {
    migrations[i]();
    db.prepare(`INSERT INTO _migrations(version) VALUES (?)`).run(i + 1);
  }
}
