import { generateRecap } from '../util/recap.js';

export function contextRecap(history, compressedMemory) {
  return generateRecap(history, compressedMemory);
}
