// autonomous.js
import { orchestrateContextWorkflow } from "../src/logic/workflow_manager.js";

export default async (req, res) => {
  try {
    const { query, memory, logs, feedback } = req.body;

    // Validate required input
    if (!query) {
      return res.status(400).json({ error: "Query is required." });
    }

    // Delegate task orchestration to workflow_manager
    const { user_id, chatroom_id } = req.session;
    const result = await orchestrateContextWorkflow({ query, memory, logs, feedback, user_id, chatroom_id });

    // Respond with the results of the workflow
    res.status(200).json({ message: "Workflow executed successfully", ...result });
  } catch (error) {
    console.error("Error in autonomous workflow:", error);
    res.status(500).json({ error: error.message || "Failed to execute workflow." });
  }
};
