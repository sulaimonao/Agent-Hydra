import { recordFeedback, getFeedbackLog as getFeedbackLogFromDb, generateFeedbackSummary as generateFeedbackSummaryFromDb } from "../../db/data.js";

export const collectFeedback = ({ user_id, chatroom_id, rating, comment }) => {
  return recordFeedback({ user_id, chatroom_id, rating, comment });
};

export const getFeedbackLog = ({ user_id, chatroom_id }) => {
  return getFeedbackLogFromDb({ user_id, chatroom_id });
};

export const generateFeedbackSummary = ({ user_id, chatroom_id }) => {
  return generateFeedbackSummaryFromDb({ user_id, chatroom_id });
};
