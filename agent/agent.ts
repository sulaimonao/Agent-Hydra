import type { Step, StepFinal, ToolRegistry } from "./types.js";
import { chatOllama } from "./ollama.js";
import { loadToolsFromYaml } from "./yamlTools.js";

const SYSTEM_PROMPT = `You are Hydra Agent. Only output JSON per step:
{"type":"plan","thought":"..."} | {"type":"tool","name":"...","args":{...}} | {"type":"final","answer":"...","sources":["..."]}
Prefer 1–2 tools then finalize. Be concise; cite sources when possible.`;

type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

function coerceJson(input: string): Step {
  const start = input.indexOf("{");
  const end = input.lastIndexOf("}");
  if (start < 0 || end < 0 || end <= start) {
    throw new Error("no json payload");
  }
  const sliced = input.slice(start, end + 1);
  return JSON.parse(sliced) as Step;
}

async function persistNote(
  tools: ToolRegistry,
  goal: string,
  finalStep: StepFinal
) {
  const saver = tools.save_note;
  if (!saver) return;
  const title = goal.slice(0, 120) || "Hydra Agent Note";
  const content = finalStep.answer.slice(0, 1000);
  try {
    await saver({ title, content });
  } catch (error) {
    console.warn("save_note failed", error);
  }
}

export async function runAgent(
  goal: string,
  maxSteps = 3,
  model = process.env.MODEL ?? "mistral"
): Promise<StepFinal> {
  const tools: ToolRegistry = loadToolsFromYaml();
  const messages: Message[] = [
    { role: "user", content: `Goal: ${goal}` },
  ];
  const sources = new Set<string>();

  for (let i = 0; i < maxSteps; i += 1) {
    const raw = await chatOllama(model, SYSTEM_PROMPT, messages);
    let action: Step;
    try {
      action = coerceJson(raw);
    } catch (error) {
      messages.push({ role: "assistant", content: raw });
      messages.push({
        role: "user",
        content: "Please respond with a single JSON object matching the contract.",
      });
      continue;
    }

    if (action.type === "plan") {
      messages.push({ role: "assistant", content: JSON.stringify(action) });
      continue;
    }

    if (action.type === "tool") {
      const fn = tools[action.name];
      let observation: Record<string, unknown>;
      try {
        if (!fn) {
          throw new Error(`unknown tool ${action.name}`);
        }
        const result = await fn(action.args ?? {});
        if (Array.isArray(result)) {
          for (const item of result) {
            if (item && typeof item === "object" && "url" in item) {
              const url = String((item as { url: unknown }).url ?? "");
              if (url) sources.add(url);
            }
          }
        }
        observation = { ok: true, result };
      } catch (error) {
        observation = { ok: false, error: error instanceof Error ? error.message : String(error) };
      }
      messages.push({ role: "assistant", content: JSON.stringify(action) });
      messages.push({
        role: "user",
        content: `Observation: ${JSON.stringify(observation)}`,
      });
      continue;
    }

    if (action.type === "final") {
      if (!action.sources || action.sources.length === 0) {
        action.sources = [...sources].slice(0, 5);
      }
      await persistNote(tools, goal, action);
      return action;
    }

    messages.push({ role: "assistant", content: JSON.stringify(action) });
  }

  const fallback: StepFinal = {
    type: "final",
    answer: "Reached step limit before finishing. See transcript for context.",
    sources: [...sources].slice(0, 5),
  };
  await persistNote(tools, goal, fallback);
  return fallback;
}
