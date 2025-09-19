import { generateRecap } from '../src/util/recap.js';

import { contextRecapSchema } from '../lib/schemas.js';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const validation = contextRecapSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({ error: validation.error.issues });
    }
    const { history, compressedMemory } = validation.data;

    const recap = generateRecap(history, compressedMemory);

    res.status(200).json({ recap });
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
