export function generateRecap(history, compressedMemory) {
    return `
      === Context Recap ===
      Compressed Memory:
      ${compressedMemory}

      Conversation History:
      ${JSON.stringify(history, null, 2)}
    `.trim();
}
