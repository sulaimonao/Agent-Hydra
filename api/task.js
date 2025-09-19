import {
    insertTaskCard,
    insertSubtasks,
    fetchTaskCards,
    updateSubtaskStatus,
    deleteTaskCard,
} from '../db/data.js';
import { taskSchema, updateSubtaskStatusSchema, deleteTaskCardSchema } from '../lib/schemas.js';

export default async function handler(req, res) {
    const { user_id, chatroom_id } = req.session;

    try {
        if (req.method === 'POST') {
            const validation = taskSchema.safeParse(req.body);
            if (!validation.success) {
                return res.status(400).json({ error: validation.error.issues });
            }
            const { goal, priority, subtasks } = validation.data;
            const { id } = insertTaskCard({ user_id, chatroom_id, goal, priority });
            if (id && subtasks && subtasks.length > 0) {
                const subtaskItems = subtasks.map(task => ({ description: task, status: 'pending' }));
                insertSubtasks({ task_id: id, subtasks: subtaskItems });
            }
            const new_task_card = fetchTaskCards(user_id, chatroom_id).find(tc => tc.id === id);
            return res.status(201).json(new_task_card);
        } else if (req.method === 'GET') {
            const tasks = fetchTaskCards(user_id, chatroom_id);
            return res.status(200).json({ tasks });
        } else if (req.method === 'PUT') {
            const validation = updateSubtaskStatusSchema.safeParse(req.body);
            if (!validation.success) {
                return res.status(400).json({ error: validation.error.issues });
            }
            const { subtaskId, status } = validation.data;
            const updatedSubtask = updateSubtaskStatus({ subtaskId, status, user_id, chatroom_id });
            return res.status(200).json({ subtask: updatedSubtask });
        } else if (req.method === 'DELETE') {
            const validation = deleteTaskCardSchema.safeParse(req.body);
            if (!validation.success) {
                return res.status(400).json({ error: validation.error.issues });
            }
            const { taskCardId } = validation.data;
            const deletedTask = deleteTaskCard({ taskCardId, user_id, chatroom_id });
            return res.status(200).json({ task: deletedTask });
        } else {
            res.setHeader('Allow', ['POST', 'GET', 'PUT', 'DELETE']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        console.error('Error in task API:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
}
