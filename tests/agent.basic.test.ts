import { describe, it, expect, vi } from "vitest";
describe("agent basic", () => {
  it("returns final with mocked ollama", async () => {
    process.env.HYDRA_DB = ":memory:";
    const ollama = await import("../agent/ollama.js");
    const { runAgent } = await import("../agent/agent.js");

    vi.spyOn(ollama, "chatOllama").mockResolvedValueOnce(
      `{"type":"final","answer":"ok"}`
    );
    const result = await runAgent("ping", 1, "mock");
    expect(result.type).toBe("final");
    expect(result.answer).toBe("ok");
  });
});
