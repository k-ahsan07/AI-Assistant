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
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setError("Speech recognition error. Please try again.");
      };

      recognitionRef.current.onend = () => {
        setRecordingStatus("inactive");
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
    <div>
      <p>{transcription}</p>
      {error && <p>{error}</p>}
      {recordingStatus === "inactive" ? (
        <button onClick={startRecording}>Start Recording</button>
      ) : (
        <button onClick={stopRecording}>Stop Recording</button>
      )}
    </div>
  );
};

export default Recorder;
