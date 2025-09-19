import {
    insertTaskCard,
    insertSubtasks,
    getTaskCard as getTaskCardFromDb,
    updateTaskStatus as updateTaskStatusInDb
} from "../../db/data.js";

export const createTaskCard = (goal, subtasks, user_id, chatroom_id) => {
  const { id } = insertTaskCard({ user_id, chatroom_id, goal, priority: 'High' });

  if (id && subtasks && subtasks.length > 0) {
    const subtaskItems = subtasks.map(task => ({ description: task, status: 'pending' }));
    insertSubtasks({ task_id: id, subtasks: subtaskItems });
  }

  return getTaskCardFromDb(id, user_id, chatroom_id);
};

export const updateTaskStatus = (taskId, status) => {
    return updateTaskStatusInDb({ taskId, status });
};

export const getTaskCard = (taskId) => {
  return getTaskCardFromDb(taskId);
};
