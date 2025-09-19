import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { loadToolsFromYaml } from "../agent/yamlTools.js";

let tempFile: string;

describe("yaml tool registry", () => {
  beforeEach(() => {
    tempFile = path.join(os.tmpdir(), `hydra-tools-${Date.now()}.yaml`);
    fs.writeFileSync(
      tempFile,
      `actions:\n  - name: web_search\n  - name: fetch_page\n`
    );
  });

  afterEach(() => {
    if (tempFile && fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }
  });

  it("loads declared tools and always includes save_note", () => {
    const registry = loadToolsFromYaml(tempFile);
    expect(typeof registry.web_search).toBe("function");
    expect(typeof registry.fetch_page).toBe("function");
    expect(typeof registry.save_note).toBe("function");
  });
});
