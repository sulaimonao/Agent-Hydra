import fs from "node:fs";
import YAML from "yaml";
import type { ToolRegistry } from "./types.js";
import * as builtins from "./tools.js";

type ToolSpec = { name?: string };

type ParsedSpec = {
  actions?: ToolSpec[];
  [key: string]: unknown;
};

function collectNames(spec: ParsedSpec): string[] {
  const names = new Set<string>();
  if (Array.isArray(spec.actions)) {
    for (const entry of spec.actions) {
      if (entry && typeof entry.name === "string") {
        names.add(entry.name);
      }
    }
  }
  const extras = spec["x-hydra-tools"];
  if (Array.isArray(extras)) {
    for (const maybeName of extras) {
      if (typeof maybeName === "string") {
        names.add(maybeName);
      }
    }
  }
  if (!names.size) {
    Object.keys(builtins).forEach((key) => {
      if (typeof (builtins as Record<string, unknown>)[key] === "function") {
        names.add(key);
      }
    });
  }
  if (!names.has("save_note")) {
    names.add("save_note");
  }
  return [...names];
}

export function loadToolsFromYaml(path = "HydraFlow_actions.yaml"): ToolRegistry {
  let spec: ParsedSpec = {};
  if (fs.existsSync(path)) {
    const raw = fs.readFileSync(path, "utf-8");
    spec = (YAML.parse(raw) as ParsedSpec) ?? {};
  }
  const registry: ToolRegistry = {};
  const names = collectNames(spec);
  for (const name of names) {
    const fn = (builtins as Record<string, unknown>)[name];
    if (typeof fn === "function") {
      registry[name] = fn as any;
    }
  }
  return registry;
}
