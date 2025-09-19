import { getContext } from "../src/state/context_state.js";
import { getMemory } from "../src/state/memory_state.js";
import { getHeads } from "../src/state/heads_state.js";
import { fetchTaskCards } from '../db/data.js';
import { STATUS } from "../src/util/constants.js";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const { user_id, chatroom_id } = req.session;

      const context = getContext(user_id, chatroom_id) || {};
      const memory = getMemory(user_id, chatroom_id) || "";
      const heads = getHeads(user_id, chatroom_id) || [];
      const headCount = heads.length;

      const allTasks = fetchTaskCards(user_id, chatroom_id) || [];

      const activeTasks = allTasks.filter((task) => {
        return (
          task.subtasks &&
          JSON.parse(task.subtasks).some((st) => st.status !== "completed")
        );
      });

      const environment = process.env.NODE_ENV || "development";
      const gaugeData = {
        status: STATUS.SUCCESS,
        environment,
        user_id: user_id,
        chatroom_id: chatroom_id,
        contextSnapshot: {
          priority: context.priority || "Normal",
          keywords: context.keywords || [],
        },
        memoryUsage: memory.length,
        headCount,
        activeTasksCount: activeTasks.length,
        limitationNotes: [
          "Example: Max heads = 5",
          "Token limit = 1000 (conditions.js)", 
        ],
      };

      return res.status(200).json(gaugeData);
    } catch (error) {
      console.error("Error in gauge route:", error);
      return res
        .status(500)
        .json({ status: STATUS.ERROR, error: "Internal server error." });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
