'use client';

import Image from "next/image";
import { SettingsIcon } from 'lucide-react';
import Message from "../component/Message";
import Recorder, { mimeType } from "@/component/Recorder";
import { useRef } from "react";

export default function Home() {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const submitButtonRef = useRef<HTMLButtonElement | null>(null);

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

  return (
    <main className="bg-gradient-to-b from-gray-500 to-black h-screen overflow-hidden">
      {/* Header */}
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

      {/* Form */}
      <form  className="flex flex-col bg-transparent h-full pt-20">
        {/* Message Section */}
        <div className="flex-1 overflow-y-auto">
          <Message />
        </div>

        <input type="file" name="audio" hidden ref={fileRef} />
        <button type="submit" name="" hidden ref={submitButtonRef} />

        {/* Recorder Section */}
        <div className="fixed bottom-0 w-full h-[200px] rounded-t-3xl p-5">
          <div className="flex items-center justify-center h-full">
            <Recorder uploadAudio={uploadAudio} />
          </div>
        </div>
      </form>
    </main>
  );
}
