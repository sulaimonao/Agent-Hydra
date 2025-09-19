import { db } from './index.js';
export function insertHead({ user_id, chatroom_id, name, status, capabilities, preferences }) {
  const stmt = db.prepare(
    'INSERT INTO heads (user_id, chatroom_id, name, status, capabilities, preferences) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const info = stmt.run(user_id, chatroom_id, name, status, JSON.stringify(capabilities), JSON.stringify(preferences));
  return { id: info.lastInsertRowid };
}

export function upsertMemory({ user_id, chatroom_id, content }) {
  const selectStmt = db.prepare('SELECT id FROM memory_state WHERE user_id = ? AND chatroom_id = ?');
  const existing = selectStmt.get(user_id, chatroom_id);

  if (existing) {
    const updateStmt = db.prepare('UPDATE memory_state SET content = ?, created_at = CURRENT_TIMESTAMP WHERE id = ?');
    updateStmt.run(content, existing.id);
    return { id: existing.id, status: 'updated' };
  } else {
    const insertStmt = db.prepare('INSERT INTO memory_state (user_id, chatroom_id, content) VALUES (?, ?, ?)');
    const info = insertStmt.run(user_id, chatroom_id, content);
    return { id: info.lastInsertRowid, status: 'created' };
  }
}

export function getMemory({ user_id, chatroom_id }) {
    const stmt = db.prepare('SELECT content FROM memory_state WHERE user_id = ? AND chatroom_id = ?');
    const result = stmt.get(user_id, chatroom_id);
    return result ? result.content : null;
}

export function recordMetric({ user_id, chatroom_id, route, latency_ms, token_used }) {
    const stmt = db.prepare(
        'INSERT INTO api_metrics (user_id, chatroom_id, route, latency_ms, token_used) VALUES (?, ?, ?, ?, ?)'
    );
    stmt.run(user_id, chatroom_id, route, latency_ms, token_used);
}

export function insertTaskCard({ user_id, chatroom_id, goal, priority = 'High' }) {
    const stmt = db.prepare('INSERT INTO task_cards (user_id, chatroom_id, goal, priority) VALUES (?, ?, ?, ?)');
    const info = stmt.run(user_id, chatroom_id, goal, priority);
    return { id: info.lastInsertRowid };
}

export function getTaskCard(id, user_id, chatroom_id) {
    const stmt = db.prepare(`
        SELECT
            tc.id,
            tc.goal,
            tc.priority,
            tc.created_at,
            (
                SELECT json_group_array(
                    json_object('id', s.id, 'task', s.task, 'status', s.status)
                )
                FROM subtasks s
                WHERE s.task_id = tc.id
            ) as subtasks
        FROM task_cards tc
        WHERE tc.id = ? AND tc.user_id = ? AND tc.chatroom_id = ?
    `);
    const taskCard = stmt.get(id, user_id, chatroom_id);
    if (taskCard && taskCard.subtasks) {
        taskCard.subtasks = JSON.parse(taskCard.subtasks);
    } else if (taskCard) {
        taskCard.subtasks = [];
    }
    return taskCard;
}

export function insertSubtasks({ task_id, subtasks }) {
    const stmt = db.prepare('INSERT INTO subtasks (task_id, task, status) VALUES (?, ?, ?)');
    const insertMany = db.transaction((tasks) => {
        for (const task of tasks) {
            stmt.run(task_id, task.description, task.status || 'pending');
        }
    });
    insertMany(subtasks);
}

export function fetchTaskCards(user_id, chatroom_id) {
    const stmt = db.prepare(`
        SELECT
            tc.id,
            tc.goal,
            tc.priority,
            tc.created_at,
            (
                SELECT json_group_array(
                    json_object('id', s.id, 'task', s.task, 'status', s.status)
                )
                FROM subtasks s
                WHERE s.task_id = tc.id
            ) as subtasks
        FROM task_cards tc
        WHERE tc.user_id = ? AND tc.chatroom_id = ?
    `);
    return stmt.all(user_id, chatroom_id);
}

export function updateSubtaskStatus({ subtaskId, status, user_id, chatroom_id }) {
    const stmt = db.prepare(`
        UPDATE subtasks
        SET status = ?
        WHERE id = ?
        AND task_id IN (
            SELECT id FROM task_cards WHERE user_id = ? AND chatroom_id = ?
        )
    `);
    const info = stmt.run(status, subtaskId, user_id, chatroom_id);
    return { changes: info.changes };
}

export function updateTaskStatus({ taskId, status, user_id, chatroom_id }) {
    const stmt = db.prepare(`
        UPDATE subtasks
        SET status = ?
        WHERE task_id = ?
        AND task_id IN (
            SELECT id FROM task_cards WHERE user_id = ? AND chatroom_id = ?
        )
    `);
    const info = stmt.run(status, taskId, user_id, chatroom_id);
    return { changes: info.changes };
}

export function deleteTaskCard({ taskCardId, user_id, chatroom_id }) {
    const stmt = db.prepare('DELETE FROM task_cards WHERE id = ? AND user_id = ? AND chatroom_id = ?');
    const info = stmt.run(taskCardId, user_id, chatroom_id);
    return { changes: info.changes };
}

export function recordFeedback({ user_id, chatroom_id, rating, comment }) {
    const stmt = db.prepare('INSERT INTO feedback_entries (user_id, chatroom_id, rating, comment) VALUES (?, ?, ?, ?)');
    const info = stmt.run(user_id, chatroom_id, rating, comment);
    return { id: info.lastInsertRowid };
}

export function getFeedbackLog({ user_id, chatroom_id }) {
    const stmt = db.prepare('SELECT * FROM feedback_entries WHERE user_id = ? AND chatroom_id = ?');
    return stmt.all(user_id, chatroom_id);
}

export function generateFeedbackSummary({ user_id, chatroom_id }) {
    const stmt = db.prepare('SELECT COUNT(*) as count, AVG(rating) as average_rating FROM feedback_entries WHERE user_id = ? AND chatroom_id = ?');
    return stmt.get(user_id, chatroom_id);
}

export function getHeads({ user_id, chatroom_id }) {
    const stmt = db.prepare('SELECT * FROM heads WHERE user_id = ? AND chatroom_id = ?');
    return stmt.all(user_id, chatroom_id);
}

export function upsertContext({ user_id, chatroom_id, context }) {
  const selectStmt = db.prepare('SELECT id FROM context_state WHERE user_id = ? AND chatroom_id = ?');
  const existing = selectStmt.get(user_id, chatroom_id);

  if (existing) {
    const updateStmt = db.prepare('UPDATE context_state SET context = ?, created_at = CURRENT_TIMESTAMP WHERE id = ?');
    updateStmt.run(JSON.stringify(context), existing.id);
    return { id: existing.id, status: 'updated' };
  } else {
    const insertStmt = db.prepare('INSERT INTO context_state (user_id, chatroom_id, context) VALUES (?, ?, ?)');
    const info = insertStmt.run(user_id, chatroom_id, JSON.stringify(context));
    return { id: info.lastInsertRowid, status: 'created' };
  }
}

export function getContext({ user_id, chatroom_id }) {
    const stmt = db.prepare('SELECT context FROM context_state WHERE user_id = ? AND chatroom_id = ?');
    const result = stmt.get(user_id, chatroom_id);
    return result ? JSON.parse(result.context) : null;
}
