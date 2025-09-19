import { Router } from "express";
import { runAgent } from "../../agent/agent.js";

export const agentRouter = Router();

agentRouter.post("/run", async (req, res, next) => {
  try {
    const { goal, maxSteps, model } = req.body ?? {};
    const result = await runAgent(
      typeof goal === "string" ? goal : String(goal ?? "Say hello"),
      typeof maxSteps === "number" ? maxSteps : Number(maxSteps ?? 3),
      typeof model === "string" ? model : String(model ?? process.env.MODEL ?? "mistral")
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default agentRouter;
