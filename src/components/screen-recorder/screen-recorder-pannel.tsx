"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Circle, Loader2, Pause, Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type useScreenRecorder from "@/hooks/use-screen-recorder";
import { toast } from "sonner";

type RecorderState = ReturnType<typeof useScreenRecorder>;

type ScreenRecorderPanelProps =RecorderState & {
  className?: string;
};

function formatTimecode(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return hours > 0
    ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
    : `${pad(minutes)}:${pad(seconds)}`;
}

export default function ScreenRecorderPanel({
  recording,
  isPaused,
  startRecording,
  stopRecording,
  pauseRecording,
  resumeRecording,
  videoRef,
  videoIdRef,
  className,
}: ScreenRecorderPanelProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [lastSavedId, setLastSavedId] = useState<string | null>(null);
  
  // Accumulated ms from finished segments, plus the start of the segment
  // currently running (null while paused or not recording).
  const accumulatedMsRef = useRef(0);
  const segmentStartRef = useRef<number | null>(null);

  // Drive the timecode display, pausing the clock (not resetting it) while
  // isPaused is true, and resetting only when recording stops entirely.
  useEffect(() => {
    if (!recording) {
      if(elapsedMs>0){
         const idBeforeStop = videoIdRef.current;
              setLastSavedId(idBeforeStop);
     setIsSaving(false);
      setElapsedMs(0);
      toast.success("stopped recording")
      }
      accumulatedMsRef.current = 0;
      segmentStartRef.current = null;
      setElapsedMs(0);

      return;
    }

    if (isPaused) {
      if (segmentStartRef.current) {
        accumulatedMsRef.current += Date.now() - segmentStartRef.current;
        segmentStartRef.current = null;
      }
      setElapsedMs(accumulatedMsRef.current);
      return;
    }

    segmentStartRef.current = Date.now();
    const interval = setInterval(() => {
      if (segmentStartRef.current) {
        setElapsedMs(accumulatedMsRef.current + (Date.now() - segmentStartRef.current));
      }
    }, 250);

    return () => clearInterval(interval);
  }, [recording, isPaused]);

  const handleStart = async () => {
    setError(null);
    setLastSavedId(null);
    try {
      await startRecording();
    } catch (err) {
      const message =
        err instanceof Error && err.name === "NotAllowedError"
          ? "Screen-share permission was denied. Allow access to record."
          : "Couldn't start recording. Try again.";
      setError(message);
    }
  };

  const handleStop = async () => {
    const idBeforeStop = videoIdRef.current;
    setIsSaving(true);
    try {
      await stopRecording();
      setLastSavedId(idBeforeStop);
    } catch {
      setError("Recording stopped, but saving failed. Try again.");
    } finally {
      setIsSaving(false);
      setElapsedMs(0);
      toast.success("stopped recording")
    }
  };

  return (
    <div
      className={cn(
        "mx-auto w-full max-w-xl rounded-xl border border-white/10 bg-[#0D0F12] p-4 shadow-2xl shadow-black/40",
        className
      )}
    >
      {/* Top bar: rec light, timecode, status */}
      <div className="flex items-center justify-between px-1 pb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            {recording && !isPaused && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#E8433D] opacity-75" />
            )}
            <span
              className={cn(
                "relative inline-flex h-2.5 w-2.5 rounded-full",
                recording && !isPaused && "bg-[#E8433D]",
                recording && isPaused && "bg-[#FFB627]",
                !recording && "bg-zinc-600"
              )}
            />
          </span>
          <span className="font-mono text-xs tracking-[0.2em] text-zinc-400">
            {recording ? (isPaused ? "PAUSED" : "REC") : "STANDBY"}
          </span>
        </div>

        <span
          className={cn(
            "font-mono text-lg tabular-nums tracking-wider",
            recording ? "text-[#FFB627]" : "text-zinc-600"
          )}
        >
          {formatTimecode(elapsedMs)}
        </span>

        <Badge
          variant="outline"
          className={cn(
            "border-white/10 font-mono text-[10px] tracking-wide",
            isSaving
              ? "border-amber-400/30 text-amber-400"
              : recording && isPaused
              ? "border-[#FFB627]/30 text-[#FFB627]"
              : recording
              ? "border-[#E8433D]/30 text-[#E8433D]"
              : "text-zinc-500"
          )}
        >
          {isSaving ? "SAVING…" : recording ? (isPaused ? "PAUSED" : "LIVE") : "IDLE"}
        </Badge>
      </div>

      {/* Preview */}
      <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-white/10 bg-black">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="h-full w-full object-contain"
        />

        {!recording && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-zinc-600">
            <Square className="h-6 w-6" strokeWidth={1.5} />
            <span className="font-mono text-[11px] tracking-[0.15em]">
              NO SIGNAL
            </span>
          </div>
        )}

        {/* Viewfinder corner brackets, appear while recording */}
        {(["top-left", "top-right", "bottom-left", "bottom-right"] as const).map(
          (corner) => (
            <span
              key={corner}
              className={cn(
                "pointer-events-none absolute h-4 w-4 border-[#FFB627] transition-opacity duration-300",
                recording ? "opacity-70" : "opacity-0",
                corner === "top-left" && "left-2 top-2 border-l-2 border-t-2",
                corner === "top-right" && "right-2 top-2 border-r-2 border-t-2",
                corner === "bottom-left" &&
                  "bottom-2 left-2 border-b-2 border-l-2",
                corner === "bottom-right" &&
                  "bottom-2 right-2 border-b-2 border-r-2"
              )}
            />
          )
        )}
      </div>

      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Shutter control */}
      <div className="mt-4 flex flex-col items-center gap-2">
        <div className="flex items-center gap-3">
          {recording && (
            <Button
              type="button"
              size="icon"
              variant="ghost"
              disabled={isSaving}
              onClick={isPaused ? resumeRecording : pauseRecording}
              className="h-10 w-10 rounded-full border border-white/10 text-zinc-300 hover:bg-white/10 hover:text-white"
            >
              {isPaused ? (
                <Play className="h-4 w-4 fill-current" />
              ) : (
                <Pause className="h-4 w-4 fill-current" />
              )}
            </Button>
          )}

          <Button
            type="button"
            size="icon"
            disabled={isSaving}
            onClick={recording ? handleStop : handleStart}
            className={cn(
              "h-14 w-14 rounded-full border-2 bg-transparent transition-all hover:bg-transparent",
              recording
                ? "border-[#E8433D] bg-[#E8433D]/10 hover:bg-[#E8433D]/20"
                : "border-white/20 bg-white/5 hover:bg-white/10"
            )}
          >
            {isSaving ? (
              <Loader2 className="h-5 w-5 animate-spin text-zinc-300" />
            ) : recording ? (
              <Square className="h-5 w-5 fill-[#E8433D] text-[#E8433D]" />
            ) : (
              <Circle className="h-6 w-6 fill-[#E8433D] text-[#E8433D]" />
            )}
          </Button>

          {/* Spacer to keep the shutter visually centered once the pause
              control appears on its left. */}
          {recording && <div className="h-10 w-10" aria-hidden />}
        </div>

        <span className="font-mono text-[11px] tracking-[0.15em] text-zinc-500">
          {isSaving
            ? "SAVING RECORDING"
            : recording
            ? isPaused
              ? "PAUSED · TAP TO STOP"
              : "STOP RECORDING"
            : "START RECORDING"}
        </span>
      </div>

      {lastSavedId && !recording && !isSaving && (
        <p className="mt-3 text-center font-mono text-[10px] text-zinc-600">
          saved as {lastSavedId.slice(0, 8)}
        </p>
      )}
    </div>
  );
}