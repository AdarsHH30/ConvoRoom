"use client";
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "@/components/ui/code-block";
import UserAvatar from "./UserAvatar";
import { MessageActions } from "./MessageActions";

export function MessageDisplay({ message, username, copyToClipboard }) {
  const isAIMessage = message.sender === "AI";
  const _isUserMessage = message.sender === username;

  return (
    <div
      className={`flex flex-col ${isAIMessage ? "items-start" : "items-end"}`}
    >
      <UserAvatar name={message.sender} isAI={isAIMessage} />

      <div
        className={`max-w-[85%] md:max-w-[80%] p-2.5 rounded-2xl message-bubble overflow-hidden ${
          isAIMessage
            ? "bg-gray-100 text-black dark:bg-zinc-800 dark:text-white"
            : "bg-green-800 text-white"
        } shadow-sm relative`}
      >
        <MessageActions message={message} copyToClipboard={copyToClipboard} />

        {renderMessageContent(message, copyToClipboard)}

        <span
          className="text-xs opacity-70 mt-1 inline-block hover:opacity-100 transition-opacity cursor-default message-timestamp"
          title={new Date(message.timestamp).toLocaleString()}
        >
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
}

function renderMessageContent(message, _copyToClipboard) {
  if (message.sender === "AI" && message.hasCodeBlocks) {
    return (
      <div className="w-full overflow-hidden">
        {message.parsedContent.map((part, index) => (
          <React.Fragment key={index}>
            {part.type === "text" ? (
              <div className="break-words text-sm mb-2 overflow-hidden">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ node, ...props }) => (
                      <p
                        {...props}
                        className="prose dark:prose-invert prose-sm max-w-none whitespace-pre-wrap overflow-hidden"
                      />
                    ),
                    code: ({ node, inline, ...props }) => (
                      <code
                        {...props}
                        className={`${
                          inline
                            ? "bg-gray-200 dark:bg-zinc-700 px-1 py-0.5 rounded"
                            : ""
                        } overflow-x-auto whitespace-pre-wrap break-words max-w-full`}
                      />
                    ),
                  }}
                >
                  {part.content}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="my-2 relative code-block-container overflow-hidden">
                <div className="overflow-hidden w-full">
                  <CodeBlock
                    language={part.language || "jsx"}
                    filename={`${part.language || "jsx"}`}
                    code={part.content}
                  />
                </div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  } else if (message.isCode) {
    return (
      <div className="relative code-block-container overflow-hidden w-full">
        <div className="overflow-hidden w-full">
          <CodeBlock
            language={message.language || "jsx"}
            filename={`${message.language || "jsx"}`}
            code={message.text.replace(/^```[\w]*\n|\n```$/g, "")}
          />
        </div>
      </div>
    );
  } else {
    return (
      <div className="break-words text-sm overflow-hidden">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({ node, ...props }) => (
              <p
                {...props}
                className="prose dark:prose-invert prose-sm max-w-none whitespace-pre-wrap overflow-hidden"
              />
            ),
            code: ({ node, inline, ...props }) => (
              <code
                {...props}
                className={`${
                  inline
                    ? "bg-gray-200 dark:bg-zinc-700 px-1 py-0.5 rounded"
                    : ""
                } overflow-x-auto whitespace-pre-wrap break-words max-w-full`}
              />
            ),
          }}
        >
          {message.text}
        </ReactMarkdown>
      </div>
    );
  }
}
