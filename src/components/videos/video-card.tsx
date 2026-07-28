"use client";

import { useEffect, useState } from "react";
import { Download, Play, Trash2, VideoOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDeleteVideo } from "@/hooks/use-videos";

export interface VideoRecord {
  id: string;
  blob: Blob | null;
  finished_recording: boolean;
  created_at: number;
}

interface VideoCardProps {
  video: VideoRecord;
  onPlay?: (video: VideoRecord) => void;
  onDelete?: (video: VideoRecord) => void;
  className?: string;
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDuration(seconds: number) {
  if (!Number.isFinite(seconds)) return null;
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function VideoCard({
  video,
  onPlay,
  onDelete,
  className,
}: VideoCardProps) {
  const { id, blob, finished_recording, created_at } = video;
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const {mutate, isPending} = useDeleteVideo()
  // Blobs from IndexedDB aren't URLs — mint one locally and clean it up
  // when the blob changes or the card unmounts.
  useEffect(() => {
    if (!blob) {
      setObjectUrl(null);
      return;
    }
    const url = URL.createObjectURL(blob);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [blob]);

  const isReady = finished_recording && !!objectUrl;
  const isIncomplete = !finished_recording;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-[#0D0F12] transition-colors",
        isIncomplete
          ? "border-white/5 opacity-70"
          : "border-white/10 hover:border-white/20",
        className
      )}
    >
      {/* Thumbnail / preview */}
      <div className="relative aspect-video w-full overflow-hidden bg-black">
        {isReady ? (
          <video
            src={objectUrl!}
            preload="metadata"
            muted
            className="h-full w-full object-cover"
            onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-zinc-700">
            <VideoOff className="h-6 w-6" strokeWidth={1.5} />
            <span className="font-mono text-[10px] tracking-[0.15em]">
              INCOMPLETE
            </span>
          </div>
        )}

        {isReady && (
          <>
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
              <Button
                type="button"
                size="icon"
                onClick={() => onPlay?.(video)}
                className="h-11 w-11 rounded-full border-2 border-white/30 bg-black/50 text-white hover:bg-black/70"
              >
                <Play className="h-5 w-5 fill-current" />
              </Button>
            </div>

            {duration != null && (
              <span className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 font-mono text-[10px] tabular-nums text-zinc-200">
                {formatDuration(duration)}
              </span>
            )}
          </>
        )}
      </div>

      {/* Meta */}
      <div className="flex items-start justify-between gap-2 p-3">
        <div className="min-w-0">
          <p className="truncate font-mono text-xs text-zinc-300">
            {formatDate(created_at)}
          </p>
          <p className="mt-0.5 truncate font-mono text-[10px] text-zinc-600">
            {formatTime(created_at)} · {id.slice(0, 8)}
          </p>
        </div>

        <Badge
          variant="outline"
          className={cn(
            "shrink-0 font-mono text-[9px] tracking-wide",
            isReady
              ? "border-emerald-400/20 text-emerald-400"
              : "border-white/10 text-zinc-500"
          )}
        >
          {isReady ? "READY" : "INCOMPLETE"}
        </Badge>
      </div>

      {/* Actions */}
        <div className="flex items-center gap-1 border-t border-white/5 px-2 py-1.5">
          {isReady && objectUrl && (
            <a
              href={objectUrl}
              download={`recording-${id.slice(0, 8)}.webm`}
              className="inline-flex h-7 items-center gap-1 rounded-md px-2 font-mono text-[10px] text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
            >
              <Download className="h-3 w-3" />
              Download
            </a>
          )}
            <button
              type="button"
              onClick={() => mutate(video.id)}
              className="ml-auto inline-flex h-7 items-center gap-1 rounded-md px-2 font-mono text-[10px] text-zinc-500 hover:bg-red-500/10 hover:text-red-400"
            >
              <Trash2 className="h-3 w-3" />
              Delete
            </button>
        </div>
    </div>
  );
}