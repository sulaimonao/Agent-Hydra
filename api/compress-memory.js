import { compressMemory } from "../src/actions/memory_compressor.js";
import { upsertMemory } from '../db/data.js';

import { compressMemorySchema } from '../lib/schemas.js';

export default async (req, res) => {
  try {
    const validation = compressMemorySchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.issues });
    }
    const { memory } = validation.data;
    const { user_id, chatroom_id } = req.session;

    // Perform memory compression
    const compressedResult = compressMemory(memory);
    const compressedMemory = compressedResult.compressedMemory;

    // Store compressed memory
    const result = upsertMemory({
        user_id,
        chatroom_id,
        content: compressedMemory
    });

    // Respond with compressed memory
    return res.status(200).json({
        compressedMemory,
        message: "Memory compressed and stored successfully.",
        ...result
    });
  } catch (error) {
    console.error("Error in compress-memory:", error);
    return res.status(500).json({ error: "Failed to compress memory. Please try again." });
  }
};
