import { insertHead, getHeads as getHeadsFromDb } from "../../db/data.js";

export function addHead(name, status, user_id, chatroom_id) {
  const newHead = {
    name,
    status,
    user_id,
    chatroom_id,
  };

  return insertHead(newHead);
}

export function getHeads(user_id, chatroom_id) {
  return getHeadsFromDb({ user_id, chatroom_id });
}
