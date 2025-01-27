"use client";

import React, { useState, useEffect, useRef } from "react";

const Recorder = () => {
  const [recordingStatus, setRecordingStatus] = useState<"inactive" | "recording">("inactive");
  const [transcription, setTranscription] = useState<string>("Press start to speak...");
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
    <div className="flex flex-col items-center justify-center w-full h-full text-white">
      <div className="mb-5">
        <p className="text-lg font-bold">Transcription:</p>
        <p className="text-yellow-300 mt-2">{transcription}</p>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>

      <div className="flex space-x-4">
        {recordingStatus === "inactive" ? (
          <button
            onClick={startRecording}
            className="bg-blue-500 text-white px-6 py-3 rounded shadow-md hover:bg-blue-600 transition-all"
          >
            Start Speech Recognition
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="bg-red-500 text-white px-6 py-3 rounded shadow-md hover:bg-red-600 transition-all"
          >
            Stop Speech Recognition
          </button>
        )}
      </div>
    </div>
  );
};

export default Recorder;
