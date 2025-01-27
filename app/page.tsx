"use client";

import React, { useState, useEffect, useRef } from "react";
import MessageComponent from "../component/Message";  

const API_KEY = process.env.NEXT_PUBLIC_API_KEY || ""; 

const Home = () => {
  const [recordingStatus, setRecordingStatus] = useState<"inactive" | "recording">("inactive");
  const [transcription, setTranscription] = useState<string>("Press start to speak...");
  const [messages, setMessages] = useState<{ sender: string; response: string; id: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = "en-US";
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        const results = event.results;
        const latestResult = results[results.length - 1];
        const { transcript } = latestResult[0];
        setTranscription((prev) => `${prev} ${transcript}`);
        getGeminiResponse(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        if (event.error === "no-speech") {
          setError("No speech detected. Please try again.");
        } else {
          setError("An error occurred with speech recognition.");
        }
      };

      recognitionRef.current.onend = () => {
        setRecordingStatus("inactive");
        setError(null);
      };
    } else {
      setError("Speech recognition is not supported in this browser. Use Chrome or Edge.");
    }
  }, []);

  const getGeminiResponse = async (question: string) => {
    try {
      const response = await fetch("https://gemini-api-url-here", {  // Replace with actual URL
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
    } catch (error) {
      console.error("Error fetching Gemini API:", error);
      setError(`An error occurred: ${error.message}`);
    }
  };

  const startRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
      setRecordingStatus("recording");
      setTranscription("Listening...");
      setError(null); 
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setRecordingStatus("inactive");
    }
  };

  return (
    <div className="flex flex-col items-center justify-between w-full h-full bg-gray-900 text-white p-4">
      
      
      {/* Main Content */}
      <div className="flex w-full justify-between mb-5">
        
        
        {/* Left side (Transcription) */}
        <div className="w-1/2 pr-4">
          <p className="text-lg font-bold">Transcription:</p>
          <p className="text-yellow-300 mt-2">{transcription}</p>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>



        {/* Right side (Gemini Response) */}
        <div className="w-1/2 pl-4">
          <MessageComponent messages={messages} />
        </div>
      </div>

      <div className="flex justify-center items-center w-full">
        {recordingStatus === "inactive" ? (
          <img
            src="/active.png"
            alt="Start Recording"
            onClick={startRecording}
            className="cursor-pointer"
          />
        ) : (
          <img
            src="/notActive.gif"
            alt="Stop Recording"
            onClick={stopRecording}
            className="cursor-pointer"
          />
        )}
      </div>
    </div>
  );
};

export default Home;
