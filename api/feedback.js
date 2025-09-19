import { recordFeedback, getFeedbackLog, generateFeedbackSummary } from '../db/data.js';

export default async function handler(req, res) {
  const { user_id, chatroom_id } = req.session;

  try {
    if (req.method === 'POST') {
      const { rating, comment } = req.body;
      if (rating === undefined || !comment) {
        return res.status(400).json({ error: 'Rating and comment are required.' });
      }
      const feedback = recordFeedback({ user_id, chatroom_id, rating, comment });
      return res.status(201).json({ message: 'Feedback submitted successfully.', feedback });
    } else if (req.method === 'GET') {
      const { type } = req.query;

      if (type === 'all') {
        const feedback = getFeedbackLog({ user_id, chatroom_id });
        return res.status(200).json({ feedback });
      } else if (type === 'summary') {
        const summary = generateFeedbackSummary({ user_id, chatroom_id });
        return res.status(200).json({ summary });
      } else {
        return res.status(400).json({ error: 'Invalid query type. Use "all" or "summary".' });
      }
    } else {
      res.setHeader('Allow', ['POST', 'GET']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error in feedback API:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
}
