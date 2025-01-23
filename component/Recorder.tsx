"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import notActive from "../public/notActive.gif";
import Active from "../public/active.png";

export const mimeType = "audio/webm";

function Recorder({ uploadAudio }: { uploadAudio: (blob: Blob) => void }) {
  const [permission, setPermission] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState("inactive");
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);

  useEffect(() => {
    getMicrophonePermission();
  }, []);

  const getMicrophonePermission = async () => {
    try {
      const streamData = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      setPermission(true);
      stream.current = streamData;
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const startRecording = () => {
    if (!stream.current) return;
    setRecordingStatus("recording");

    const media = new MediaRecorder(stream.current, { mimeType });
    mediaRecorder.current = media;

    const localAudioChunks: Blob[] = [];
    mediaRecorder.current.ondataavailable = (event) => {
      if (event.data.size > 0) localAudioChunks.push(event.data);
    };

    mediaRecorder.current.onstop = () => {
      const blob = new Blob(localAudioChunks, { type: mimeType });
      uploadAudio(blob); // Pass the recorded audio for transcription
    };

    mediaRecorder.current.start();
  };

  const stopRecording = () => {
    if (mediaRecorder.current && recordingStatus === "recording") {
      setRecordingStatus("inactive");
      mediaRecorder.current.stop();
    }
  };

  return (
    <div className="flex items-center justify-center w-full h-full">
      {!permission && (
        <button
          onClick={getMicrophonePermission}
          className="bg-blue-500 text-white p-2 rounded"
        >
          Get Microphone
        </button>
      )}
      {permission && recordingStatus === "inactive" && (
        <Image
          src={Active}
          width={70}
          height={70}
          priority
          alt="Start Recording"
          className="cursor-pointer hover:scale-110 transition-all ease-in-out"
          onClick={startRecording}
        />
      )}
      {recordingStatus === "recording" && (
        <Image
          src={notActive}
          width={70}
          height={70}
          priority
          onClick={stopRecording}
          className="cursor-pointer hover:scale-110 transition-all ease-in-out"
          alt="Stop Recording"
        />
      )}
    </div>
  );
}

export default Recorder;