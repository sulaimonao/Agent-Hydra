import { getMemory as getMemoryFromDb, upsertMemory } from "../../db/data.js";

export function appendMemory(newMemory, userId, chatroomId) {
  let currentMemory = getMemoryFromDb({ user_id: userId, chatroom_id: chatroomId }) || "";
  currentMemory += ` ${newMemory}`;

  upsertMemory({ user_id: userId, chatroom_id: chatroomId, content: currentMemory });

  return currentMemory;
}

export function getMemory(userId, chatroomId) {
  return getMemoryFromDb({ user_id: userId, chatroom_id: chatroomId });
}
