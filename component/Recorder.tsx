"use client";

import React, { useState, useEffect, useRef } from "react";

interface RecorderProps {
  onTranscription: (transcript: string) => void;
  onError: (error: string) => void;
  onStart: () => void;
  onStop: () => void;
}

const Recorder: React.FC<RecorderProps> = ({ onTranscription, onError, onStart, onStop }) => {
  const [recordingStatus, setRecordingStatus] = useState<"inactive" | "recording">("inactive");
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
        onTranscription(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        onError(event.error);
      };

      recognitionRef.current.onend = () => {
        setRecordingStatus("inactive");
        onStop();
      };
    } else {
      onError("Speech recognition is not supported in this browser. Use Chrome or Edge.");
    }
  }, [onTranscription, onError, onStop]);

  const startRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
      setRecordingStatus("recording");
      onStart();
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setRecordingStatus("inactive");
      onStop();
    }
  };

  return (
    <div>
      {recordingStatus === "inactive" ? (
        <button onClick={startRecording}>Start Recording</button>
      ) : (
        <button onClick={stopRecording}>Stop Recording</button>
      )}
    </div>
  );
};

export default Recorder;