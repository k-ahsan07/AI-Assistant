import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import notActive from "../public/notActive.gif";
import Active from '../public/active.png';

export const mimeType = "audio/webm";

function Recorder({
  uploadAudio,
}: {
  uploadAudio: (blob: Blob) => void;
}) {
  const [isClient, setIsClient] = useState(false); // Track if the component is client-side
  const [permission, setPermission] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recordingStatus, setRecordingStatus] = useState("inactive");
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]); // Add state for audio chunks
  const mediaRecorder = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== "undefined") {
      getMicrophonePermission();
    }
  }, []);

  const getMicrophonePermission = async () => {
    if ("MediaRecorder" in window && navigator.mediaDevices) {
      try {
        const streamData = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });
        setPermission(true);
        setStream(streamData);
      } catch (err: any) {
        console.error(err.message || "An error occurred while accessing the microphone.");
      }
    } else {
      console.error("The MediaRecorder API is not supported in your browser.");
    }
  };

  const startRecording = async () => {
    if (stream === null) return;

    setRecordingStatus("recording");

    const media = new MediaRecorder(stream, { mimeType });
    mediaRecorder.current = media;
    mediaRecorder.current.start();

    let localAudioChunks: Blob[] = [];
    mediaRecorder.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        localAudioChunks.push(event.data);
      }
    };

    mediaRecorder.current.onstop = () => {
      const blob = new Blob(localAudioChunks, { type: mimeType });
      uploadAudio(blob);
      setRecordingStatus("inactive");
      setAudioChunks([]); // Clear audio chunks after stopping
    };

    setAudioChunks(localAudioChunks);
  };

  const stopRecording = () => {
    if (mediaRecorder.current === null || recordingStatus !== "recording") return;
    setRecordingStatus("inactive");
    mediaRecorder.current.stop();
  };

  if (!isClient) {
    return null;
  }

  return (
    <div className="flex items-center justify-center w-full h-full">
      {!permission && (
        <button onClick={getMicrophonePermission} className="bg-blue-500 text-white p-2 rounded">
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
          onClick={stopRecording}
          priority
          className="cursor-pointer hover:scale-110 transition-all ease-in-out"
          alt="Stop Recording"
        />
      )}
    </div>
  );
}

export default Recorder;
