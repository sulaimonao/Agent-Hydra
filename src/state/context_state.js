import { getContext as getContextFromDb, upsertContext } from "../../db/data.js";

export function updateContext(newData, userId, chatroomId) {
  let currentContext = getContextFromDb({ user_id: userId, chatroom_id: chatroomId }) || {};
  currentContext = { ...currentContext, ...newData };

  upsertContext({ user_id: userId, chatroom_id: chatroomId, context: currentContext });

  return currentContext;
}

export function getContext(userId, chatroomId) {
  return getContextFromDb({ user_id: userId, chatroom_id: chatroomId });
}
