#!/usr/bin/env node
import { runAgent } from "../agent/agent.js";

const goal = process.argv.slice(2).join(" ") || "Summarize this repo and save a note.";

runAgent(goal)
  .then((result) => {
    console.log(JSON.stringify(result, null, 2));
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
