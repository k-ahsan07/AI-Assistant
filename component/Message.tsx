import React from "react";

interface Message {
  sender: string;
  response: string;
  id: string;
}

interface Props {
  messages: Message[];
}

const MessageComponent: React.FC<Props> = ({ messages }) => {
  return (
    <div className="overflow-y-auto p-4 space-y-4 max-h-80">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.sender === "AI" ? "justify-start" : "justify-end"}`}
        >
          <div
            className={`flex items-start ${message.sender === "AI" ? "" : "flex-row-reverse"}`}
          >
            <div className="w-10 h-10 rounded-full bg-gray-400 mr-2">
              {message.sender === "AI" ? (
                <span className="text-white text-center text-xl">AI</span>
              ) : (
                <span className="text-white text-center text-xl">Me</span>
              )}
            </div>
            <p
              className={`p-3 max-w-xs rounded-lg ${
                message.sender === "AI"
                  ? "bg-gray-800 text-white rounded-bl-none"
                  : "bg-green-500 text-white rounded-br-none"
              }`}
            >
              {message.response}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageComponent;
