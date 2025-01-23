'use client'

import Image from "next/image";
import { SettingsIcon } from 'lucide-react';
import Message from "../component/Message";
import Recorder, { mimeType } from "@/component/Recorder";
import { useEffect, useRef, useState } from "react";
import { useFormState } from "react-dom";
import { transcript } from "@/actions/transcript";

const initialState = {
  sender: "",
  response: "",
  id: ""
}

export default function Home() {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const submitButtonRef = useRef<HTMLButtonElement | null>(null);
  const [state, formAction] = useFormState(transcript, initialState);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (state.response && state.sender) {
      setMessages(messages =>
        [{ sender: state.sender || "", response: state.response || "", id: state.id || "" }, ...messages]
      );
    }
  }, [state]);

  const uploadAudio = (blob: Blob) => {
    const file = new File([blob], 'audio.webm', { type: mimeType });

    if (fileRef.current) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileRef.current.files = dataTransfer.files;
    }

    if (submitButtonRef.current) {
      submitButtonRef.current.click();
    }
  };

  console.log(messages);
  console.log("API Key:", process.env.REV_AI_API_KEY);


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

      <form action={formAction} className="flex flex-col bg-transparent h-full pt-20">
        <div className="flex-1 overflow-y-auto">
          <Message />
        </div>

        <input type="file" name="audio" hidden ref={fileRef} />
        <button type="submit" name="" hidden ref={submitButtonRef} />

        <div className="fixed bottom-0 w-full h-[200px] rounded-t-3xl p-5">
          <div className="flex items-center justify-center h-full">
            <Recorder uploadAudio={uploadAudio} />
          </div>
        </div>
      </form>
    </main>
  );
}

import { KokoroTTS } from "kokoro-js";

const model_id = "onnx-community/Kokoro-82M-ONNX";
const tts = await KokoroTTS.from_pretrained(model_id, {
  dtype: "q8", // Options: "fp32", "fp16", "q8", "q4", "q4f16"
});

const text = "Life is like a box of chocolates. You never know what you're gonna get.";
const audio = await tts.generate(text, {
  // Use tts.list_voices() to list all available voices
  voice: "af_bella",
});
audio.save("audio.wav");