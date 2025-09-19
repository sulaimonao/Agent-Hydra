import { getTaskCard } from "../state/task_manager.js";

const COMPRESSION_THRESHOLD = 20;
const INITIAL_COMPRESSION_THRESHOLD = 10;

const TOKEN_LIMIT = 1000;
const MAX_HEADS = 5;

const shouldCreateHead = (actionItems) => {
  return actionItems.includes("create head");
};

const shouldSummarizeLogs = (actionItems) => {
  return actionItems.includes("summarize logs");
};

const hasPendingDependencies = (taskId, user_id, chatroom_id) => {
  const taskCard = getTaskCard(taskId, user_id, chatroom_id);

  if (!taskCard) {
    console.warn(`Task ${taskId} not found for user ${user_id} in chatroom ${chatroom_id}`);
    return false;
  }

  return taskCard.subtasks.some((subtask) => subtask.dependencies.length > 0);
};

const shouldCompressMemory = (tokenCount) => {
  return tokenCount > TOKEN_LIMIT; 
};

const canCreateNewHead = (headCount) => {
  return headCount < MAX_HEADS;
};

export {
  COMPRESSION_THRESHOLD,
  INITIAL_COMPRESSION_THRESHOLD,
  TOKEN_LIMIT,
  MAX_HEADS,
  shouldCreateHead,
  shouldSummarizeLogs,
  hasPendingDependencies,
  shouldCompressMemory,
  canCreateNewHead,
};
