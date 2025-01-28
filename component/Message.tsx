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
    <div className="overflow-y-auto p-4 space-y-4 max-h-80 w-full bg-gray-800 rounded-lg">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.sender === "AI" ? "justify-start" : "justify-end"}`}
        >
          <div
            className={`flex items-start ${message.sender === "AI" ? "" : "flex-row-reverse"}`}
          >
            <div className="w-12 h-12 rounded-full bg-gray-600 mr-2 flex items-center justify-center">
              {message.sender === "AI" ? (
                <span className="text-white text-lg">AI</span>
              ) : (
                <span className="text-white text-lg">Me</span>
              )}
            </div>
            <p
              className={`p-3 max-w-xs rounded-lg shadow-md ${
                message.sender === "AI"
                  ? "bg-gray-700 text-white"
                  : "bg-blue-500 text-white rounded-br-none"
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