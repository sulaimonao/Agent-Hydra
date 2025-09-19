// summarize-logs.js

import winston from "winston";

import { summarizeLogsSchema } from '../lib/schemas.js';

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const validation = summarizeLogsSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ error: validation.error.issues });
        }
      const { logs } = validation.data;

      // Set up the logger
      const logger = winston.createLogger({
        level: "info",
        format: winston.format.json(),
        transports: [new winston.transports.Console()],
      });

      // Analyze logs
      const errorPattern = /error|fail|exception/i;
      const errorCount = (logs.match(errorPattern) || []).length;

      // Summarize logs
      const totalEntries = logs.split("\n").length;
      const firstFiveLines = logs.split("\n").slice(0, 5).join("\n");

      const summaryReport = {
        totalEntries,
        errorCount,
        firstFiveLines: `${firstFiveLines}...`,
      };

      // Log the analysis
      logger.info("Logs analyzed", summaryReport);

      res.status(200).json({ summaryReport });
    } catch (error) {
      console.error("Error in summarize-logs:", error);
      res.status(500).json({ error: "Failed to summarize logs." });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}
