export const extractLanguage = (messageText) => {
  if (!messageText) return null;
  const match = messageText.match(/^```(\w*)\n/);
  return match ? match[1] : null;
};

export const parseMessageContent = (messageText) => {
  if (!messageText || typeof messageText !== "string") {
    return [{ type: "text", content: "" }];
  }

  if (messageText.includes("```")) {
    const parts = messageText.split(/(```[\w]*\n[\s\S]*?\n```)/g);
    return parts
      .map((part) => {
        if (part.startsWith("```")) {
          const langMatch = part.match(/^```(\w*)\n/);
          const codeContent = part.replace(/^```[\w]*\n|\n```$/g, "");
          return {
            type: "code",
            content: codeContent,
            language: langMatch ? langMatch[1] : "plaintext",
          };
        }
        return { type: "text", content: part };
      })
      .filter((part) => part.content.trim() !== "");
  }

  return [{ type: "text", content: messageText }];
};

export const generateMessageId = (sender, content) => {
  return `${sender}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const createMessageObject = (sender, text, additionalProps = {}) => {
  const isAI = sender === "AI";
  const hasCodeBlocks = isAI && text.includes("```");

  return {
    id: generateMessageId(sender, text),
    sender,
    text,
    timestamp: new Date().toISOString(),
    isCode: isAI && text.startsWith("```") && text.endsWith("```"),
    language: isAI ? extractLanguage(text) : null,
    hasCodeBlocks,
    parsedContent: isAI ? parseMessageContent(text) : null,
    ...additionalProps,
  };
};
