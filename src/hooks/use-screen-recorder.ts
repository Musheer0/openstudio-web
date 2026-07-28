import { useEffect, useRef, useState } from "react";
import { getDB } from "@/lib/browser-db";
const db = await getDB()
async function deleteChunks(videoId: string) {
  const tx = db.transaction("chunks", "readwrite");
  const index = tx.store.index("video_id");

  let cursor = await index.openCursor(videoId);

  while (cursor) {
    await cursor.delete();
    cursor = await cursor.continue();
  }

  await tx.done;
}
async function saveVideo(videoId: string) {
  const chunks = await db
    .transaction("chunks")
    .store
    .index("video_id")
    .getAll(videoId);

  if (chunks.length === 0) return;

  chunks.sort((a, b) => a.created_at - b.created_at);

  const blob = new Blob(
    chunks.map((c) => c.blob),
    {
      type: "video/webm",
    }
  );

  const video = await db.get("videos", videoId);

  if (!video) return;

  await db.put("videos", {
    ...video,
    blob,
    finished_recording: true,
  });
}
async function initializeVideo() {
  const id = crypto.randomUUID();

  await db.add("videos", {
    id,
    blob: null,
    finished_recording: false,
    created_at: Date.now(),
  });

  return id;
}

export default function useScreenRecorder() {
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const videoIdRef = useRef<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [recording, setRecording] = useState(false);
  const [isPaused,setIsPaused] = useState(false)
  useEffect(() => {
  if (!videoRef.current || !streamRef.current) return;

  videoRef.current.srcObject = streamRef.current;
}, [recording]);
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        frameRate: 60,
      },
      audio: true,
    });

    streamRef.current = stream;
stream.getVideoTracks()[0].addEventListener("ended", () => {
  console.log("Sharing stopped");
  stopRecording();
});

    const recorder = new MediaRecorder(stream, {
      mimeType: "video/webm;codecs=vp9",
    });

    recorderRef.current = recorder;

    const videoId = await initializeVideo();
    videoIdRef.current = videoId;

    recorder.ondataavailable = async (event) => {
      if (event.data.size === 0) return;

      await db.add("chunks", {
        id: crypto.randomUUID(),
        video_id: videoId,
        blob: event.data,
        created_at: Date.now(),
      });
    };

    recorder.start(1000);
    recorder.onerror = ()=>stopRecording
    recorder.onpause = ()=>{setIsPaused(true)}
    recorder.onresume= ()=>{setIsPaused(false)}
    setRecording(true);
  };

  const stopRecording = async () => {
    const recorder = recorderRef.current;
    const videoId = videoIdRef.current;

    if (!recorder || !videoId) return;

  await new Promise<void>((resolve) => {
  recorder.addEventListener(
    "stop",
    () => resolve(),
    { once: true }
  );

  recorder.stop();
});
    streamRef.current?.getTracks().forEach((track) => track.stop());

    await saveVideo(videoId);
    await deleteChunks(videoId);

    recorderRef.current = null;
    streamRef.current = null;
    videoIdRef.current = null;

    setRecording(false);
  };
  const resumeRecording =async ()=>{
  recorderRef.current?.resume()
  }
  const pauseRecording = ()=>recorderRef.current?.pause()
  return {
    recording,
    startRecording,
    stopRecording,
    currentVideoId: videoIdRef.current,
    videoRef,
    videoIdRef,
    isPaused,
    pauseRecording,
    resumeRecording
  };
}