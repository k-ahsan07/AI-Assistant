"use client";

import React, { useState } from "react";
import Image from "next/image";
import { SettingsIcon } from "lucide-react";

export default function Home() {
  const [transcription, setTranscription] = useState<string>("Press start to speak...");
  const [error, setError] = useState<string>("");
  const [isRecording, setIsRecording] = useState<boolean>(false); // To track the recording state

  let recognition: SpeechRecognition | undefined;

  const startSpeechRecognition = () => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setError("Speech recognition is not supported in this browser. Use Chrome or Edge.");
        return;
      }

      recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setError("");
        setTranscription("Listening...");
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join(" ");
        setTranscription(transcript);
        console.log("Transcription:", transcript); // Log transcription to terminal
      };

      recognition.onerror = (event) => {
        if (event.error === "no-speech") {
          setError("No speech detected. Please try again.");
        } else if (event.error !== "aborted") {
          console.error("Speech recognition error:", event.error);
          setError("An error occurred: " + event.error);
        }
      };

      recognition.onend = () => {
        setTranscription("Speech recognition stopped.");
        setError(null);
        setIsRecording(false); // Set recording to false when it stops
      };

      recognition.start();
      setIsRecording(true); // Set recording to true when it starts
    }
  };

  const stopSpeechRecognition = () => {
    if (recognition) {
      recognition.stop();
      setIsRecording(false); // Set recording to false when stopped
    }
  };

  return (
    <main className="bg-gradient-to-b from-gray-500 to-black h-screen overflow-hidden">
      <header className="fixed top-0 text-white p-5 w-full flex items-center justify-between z-10">
        <div className="w-12 h-12 overflow-hidden rounded-full">
          <Image
            src="/ai.jpg"
            alt="AI"
            width={50}
            height={50}
            priority
            className="object-cover"
          />
        </div>
        <SettingsIcon
          size={40}
          className="p-2 m-2 rounded cursor-pointer bg-gray-500 text-black transition-all ease-in-out duration-150 hover:bg-gray-700 hover:text-white"
        />
      </header>

      <div className="flex flex-col bg-transparent h-full pt-20">
        <div className="flex-1 overflow-y-auto p-5 text-white">
          <div>
            <p className="font-bold">Real-Time Transcription:</p>
            <p className="text-yellow-300 mt-2">{transcription}</p>
            {error && <p className="text-red-500 mt-2">{error}</p>}
          </div>
        </div>

        <div className="fixed bottom-0 w-full h-[200px] rounded-t-3xl p-5">
          <div className="flex items-center justify-center h-full space-x-4">
            <div
              onClick={isRecording ? stopSpeechRecognition : startSpeechRecognition}
              className="cursor-pointer"
            >
              <Image
                src={isRecording ? "/notActive.gif" : "/active.png"} // Swapped image paths
                alt={isRecording ? "Not Recording" : "Recording"}
                width={100}
                height={100}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
