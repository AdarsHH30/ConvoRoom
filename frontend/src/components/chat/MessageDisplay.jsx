"use client";
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "@/components/ui/code-block";
import MessageSender from "./MessageSender";
import { MessageActions } from "./MessageActions";

export function MessageDisplay({ message, username, copyToClipboard }) {
  // Determine if the message is from AI
  const isAIMessage = message.sender === "AI";
  // Determine if the message is from the current user
  const isUserMessage = message.sender === username;

  return (
    <div
      className={`flex flex-col ${isAIMessage ? "items-start" : "items-end"}`}
    >
      <MessageSender name={message.sender} isAI={isAIMessage} />

      <div
        className={`max-w-[70%] md:max-w-[80%] p-2.5 rounded-2xl message-bubble ${
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

function renderMessageContent(message, copyToClipboard) {
  if (message.sender === "AI" && message.hasCodeBlocks) {
    return (
      <div>
        {message.parsedContent.map((part, index) => (
          <React.Fragment key={index}>
            {part.type === "text" ? (
              <div className="break-words text-sm mb-2">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ node, ...props }) => (
                      <p
                        {...props}
                        className="prose dark:prose-invert prose-sm max-w-none"
                      />
                    ),
                  }}
                >
                  {part.content}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="my-2 relative code-block-container">
                <div className="absolute top-0 right-0 z-10">
                  <button
                    onClick={() => copyToClipboard(part.content)}
                    className="text-xs p-1 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors code-copy-button"
                    title="Copy code"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </button>
                </div>
                <CodeBlock
                  language={part.language || "jsx"}
                  filename={`${part.language || "jsx"}`}
                  code={part.content}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  } else if (message.isCode) {
    return (
      <div className="relative code-block-container">
        <div className="absolute top-0 right-0 z-10">
          <button
            onClick={() =>
              copyToClipboard(message.text.replace(/^```[\w]*\n|\n```$/g, ""))
            }
            className="text-xs p-1 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors code-copy-button"
            title="Copy code"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </button>
        </div>
        <CodeBlock
          language={message.language || "jsx"}
          filename={`${message.language || "jsx"}`}
          code={message.text.replace(/^```[\w]*\n|\n```$/g, "")}
        />
      </div>
    );
  } else {
    return (
      <div className="break-words text-sm">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({ node, ...props }) => (
              <p
                {...props}
                className="prose dark:prose-invert prose-sm max-w-none whitespace-pre-wrap"
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
