"use client";

import React, { useState, useRef, useEffect } from "react";

const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "";

const Home = () => {
  const [transcription, setTranscription] = useState<string>("Press start to speak...");
  const [messages, setMessages] = useState<{ sender: string; response: string; id: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const getGeminiResponse = async (question: string) => {
    try {
      const response = await fetch("https://api.gemini.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({ prompt: question }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.answer) {
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "User", response: question, id: `${Date.now()}-user` },
          { sender: "AI", response: data.answer, id: `${Date.now()}-ai` },
        ]);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error: any) {
      console.error("Error fetching Gemini API:", error);
      setError(`An error occurred: ${error.message}`);
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    setError(null);
    setTranscription("Listening...");

    if (!recognitionRef.current) {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setError("Speech recognition is not supported in this browser.");
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.continuous = true;
      recognition.interimResults = true; // Enable interim results for live transcription

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            const finalTranscript = event.results[i][0].transcript;
            setTranscription(finalTranscript);
            getGeminiResponse(finalTranscript); // Send final transcription to Gemini API
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        // Show interim transcription on screen
        if (interimTranscript) {
          setTranscription(interimTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        setError(`Speech recognition error: ${event.error}`);
        stopRecording();
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }

    recognitionRef.current.start();
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
    setTranscription("Press start to speak...");
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col items-center justify-between w-full h-screen bg-gray-900 text-white p-4">
      {/* Chat Area */}
      <div
        ref={chatContainerRef}
        className="flex flex-col w-full h-4/5 bg-gray-800 rounded-md p-4 overflow-y-auto mb-4"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender === "User" ? "justify-end" : "justify-start"
            } mb-2`}
          >
            <div
              className={`${
                msg.sender === "User" ? "bg-blue-500" : "bg-gray-700"
              } max-w-xs rounded-lg p-3 text-white`}
            >
              <p className="font-semibold">{msg.sender}:</p>
              <p>{msg.response}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Transcription/Error Display */}
      <div className="w-full mb-4">
        <p className="text-yellow-300">{transcription}</p>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>

      {/* Start/Stop Recording Button */}
      <div className="flex justify-center items-center w-full">
        {isRecording ? (
          <img
            src="/notActive.gif"
            alt="Stop Recording"
            onClick={stopRecording}
            className="cursor-pointer w-20 h-20"
          />
        ) : (
          <img
            src="/active.png"
            alt="Start Recording"
            onClick={startRecording}
            className="cursor-pointer w-20 h-20"
          />
        )}
      </div>
    </div>
  );
};

export default Home;
