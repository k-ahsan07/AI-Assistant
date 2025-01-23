"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { SettingsIcon } from "lucide-react";
import Recorder from "@/component/Recorder";

export default function Home() {
  const [messages, setMessages] = useState<string[]>([]);
  const [transcription, setTranscription] = useState<string>("");

  // Function to handle audio recording and transcription
  const transcribeAudio = async (blob: Blob) => {
    const audioURL = URL.createObjectURL(blob);
    console.log("Transcribing audio...");
    await handleAudioTranscription(audioURL);
  };

  // Updated function to handle audio transcription safely without relying on speech recognition API directly
  const handleAudioTranscription = async (audioURL: string): Promise<void> => {
    const audio = new Audio(audioURL);
    audio.play();

    // Placeholder for transcription logic, assuming server-based transcription API
    audio.onended = () => {
      console.log("Audio finished playing.");
      // Proceed with any other actions like sending to server for transcription
      // setTranscription("Example transcription from server API...");
    };
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
            <p className="text-yellow-300 mt-2">{transcription || "Start speaking..."}</p>
          </div>
          <div className="mt-4">
            {messages.map((msg, idx) => (
              <div key={idx} className="mb-2">
                {msg}
              </div>
            ))}
          </div>
        </div>

        <div className="fixed bottom-0 w-full h-[200px] rounded-t-3xl p-5">
          <div className="flex items-center justify-center h-full">
            <Recorder uploadAudio={transcribeAudio} />
          </div>
        </div>
      </div>
    </main>
  );
}