"use client"; 

import React, { useState, useEffect, useRef } from "react";
import MessageComponent from "../component/Message";

const API_KEY = "AIzaSyBejdt8F9PlyZ5MqLAVFzdTVBnSTmD2czU"; // Your Gemini API key

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
        console.log("Transcription:", transcript); // Log transcription to terminal
        getGeminiResponse(transcript); // Get Gemini API response
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
        body: JSON.stringify({ prompt: question }), // Ensure the body matches the expected request format
      });
  
      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }
  
      const data = await response.json();
  
      // Ensure data structure is what you expect
      console.log(data);  // Log the data to see the structure
  
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
      setError(null); // Clear any previous errors
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setRecordingStatus("inactive");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-gray-900 text-white p-4">
      <div className="mb-5 w-full max-w-2xl">
        <MessageComponent messages={messages} />
      </div>

      <div className="mb-5 w-full max-w-2xl">
        <p className="text-lg font-bold">Transcription:</p>
        <p className="text-yellow-300 mt-2">{transcription}</p>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>

      <div className="flex flex-col items-center space-y-4 w-full">
        {recordingStatus === "inactive" ? (
          <button
            onClick={startRecording}
            className="bg-blue-500 text-white px-6 py-3 rounded-full shadow-md hover:bg-blue-600 transition-all"
          >
            Start Speech Recognition
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="bg-red-500 text-white px-6 py-3 rounded-full shadow-md hover:bg-red-600 transition-all"
          >
            Stop Speech Recognition
          </button>
        )}
      </div>
    </div>
  );
};

export default Home;
