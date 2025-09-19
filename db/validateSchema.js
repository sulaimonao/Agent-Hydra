import { db } from './index.js';

export function validateSchema() {
  const required = {
    heads: ['id', 'user_id', 'chatroom_id', 'name', 'status', 'capabilities', 'preferences', 'created_at'],
    task_cards: ['id', 'user_id', 'chatroom_id', 'goal', 'priority', 'created_at'],
    subtasks: ['id', 'task_id', 'task', 'status', 'created_at'],
    memory_state: ['id', 'user_id', 'chatroom_id', 'content', 'created_at'],
    context_state: ['id', 'user_id', 'chatroom_id', 'context', 'created_at'],
    api_metrics: ['id', 'user_id', 'chatroom_id', 'route', 'latency_ms', 'token_used', 'created_at'],
    feedback_entries: ['id', 'user_id', 'chatroom_id', 'rating', 'comment', 'created_at'],
    _migrations: ['version'],
  };

  console.log('Validating schema...');
  for (const [table, cols] of Object.entries(required)) {
    console.log(`Checking table: ${table}`);
    const have = db.prepare(`PRAGMA table_info(${table})`).all();
    console.log(`Columns in ${table}:`, have.map(r => r.name));
    const missing = cols.filter(c => !have.map(r => r.name).includes(c));
    if (missing.length) {
      throw new Error(`Schema mismatch for ${table}: missing ${missing.join(', ')}`);
    }
  }
  console.log('✅ Database schema validated.');
}
