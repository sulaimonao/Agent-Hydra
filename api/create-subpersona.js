import { insertHead } from '../db/data.js';

import { createSubpersonaSchema } from '../lib/schemas.js';

export default async (req, res) => {
  try {
    const validation = createSubpersonaSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.issues });
    }
    const { name, status, capabilities, preferences } = validation.data;
    const { user_id, chatroom_id } = req.session;

    const result = insertHead({
        user_id,
        chatroom_id,
        name,
        status: status || 'active',
        capabilities: capabilities || {},
        preferences: preferences || {}
    });

    return res.status(201).json({
      message: "Sub-persona created successfully.",
      head_id: result.id
    });
  } catch (error) {
    console.error("Error in create-subpersona:", error);
    return res.status(500).json({ error: "Failed to create sub-persona. Please try again." });
  }
};
