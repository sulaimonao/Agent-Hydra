import { getContext } from "../state/context_state.js";
import { getMemory } from "../state/memory_state.js";
import { getHeads } from "../state/heads_state.js";
import { fetchTaskCards } from "../../db/data.js";

export async function gatherGaugeData({ user_id, chatroom_id }) {
  const c = getContext(user_id, chatroom_id) || {};
  const m = getMemory(user_id, chatroom_id) || "";
  const heads = getHeads(user_id, chatroom_id) || [];
  const headCount = heads.length;

  const allTasks = fetchTaskCards(user_id, chatroom_id) || [];

  const activeTasks = allTasks.filter(
    (task) => 
      task.subtasks && 
      JSON.parse(task.subtasks).some((st) => st.status !== "completed")
  );

  return {
    priority: c.priority || "Normal",
    keywords: c.keywords || [],
    memoryUsage: m.length,
    headCount,
    activeTasksCount: activeTasks.length,
  };
}
