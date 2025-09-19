import { request } from "undici";

type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

export async function chatOllama(
  model: string,
  system: string,
  messages: Message[],
  temperature = 0.2
): Promise<string> {
  const body = {
    model,
    stream: false,
    options: { temperature },
    messages: [{ role: "system", content: system }, ...messages],
  };
  const { body: res } = await request(
    process.env.OLLAMA_URL ?? "http://localhost:11434/api/chat",
    {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "content-type": "application/json" },
    }
  );
  const json = (await res.json()) as any;
  return String(json?.message?.content ?? "");
}
