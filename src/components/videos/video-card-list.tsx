"use client";

import { AlertTriangle, PlusIcon, RotateCw, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import VideoCard, { type VideoRecord } from "@/components/videos/video-card";
import { useVideos } from "@/hooks/use-videos";
import ScreenRecorderDialog from "../screen-recorder/screen-record-dialog";
import { Button } from "../ui/button";


interface VideoCardListProps {
  onPlay?: (video: VideoRecord) => void;
  onDelete?: (video: VideoRecord) => void;
  className?: string;
}

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-xl border border-white/5 bg-[#0D0F12]">
      <div className="aspect-video w-full animate-pulse bg-white/[0.04]" />
      <div className="space-y-2 p-3">
        <div className="h-3 w-24 animate-pulse rounded bg-white/[0.06]" />
        <div className="h-2.5 w-16 animate-pulse rounded bg-white/[0.04]" />
      </div>
    </div>
  );
}

export default function VideoCardList({
  onPlay,
  onDelete,
  className,
}: VideoCardListProps) {
  const {
    data,
    isLoading,
    isPending,
    isError,
    isFetching,
    refetch,
  } = useVideos()

  const loading = isLoading ?? isPending ?? false;

  if (loading) {
    return (
      <div
        className={cn(
          "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
          className
        )}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-6 py-16 text-center">
        <AlertTriangle className="h-6 w-6 text-red-400" strokeWidth={1.5} />
        <p className="font-mono text-xs text-red-400">
          Couldn&apos;t load recordings
        </p>
        {refetch && (
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-1.5 font-mono text-[11px] text-zinc-300 hover:bg-white/5"
          >
            <RotateCw className="h-3 w-3" />
            Retry
          </button>
        )}
      </div>
    );
  }

  const videos = data ?? [];

  if (videos.length === 0) {
    return (

      <>
       <div className="header w-full px-4 flex items-center justify-between py-4">
        <h2 className="text-lg font-semibold">Your Recordings</h2>
        <div className="actions flex items-center gap-2">
          <ScreenRecorderDialog>
          <Button>
            <PlusIcon/>
            Create New Recording
          </Button>
        </ScreenRecorderDialog>
       
        </div>
      </div>
        <div className="flex flex-col items-center justify-center gap-2  flex-1 px-6 py-16 text-center text-zinc-600">
        
        <Video className="h-6 w-6" strokeWidth={1.5} />
        <span className="font-mono text-[11px] tracking-[0.15em]">
          NO RECORDINGS YET
        </span>
      </div>
      </>
    
    );
  }

  const sorted = [...videos].sort((a, b) => b.created_at - a.created_at);

  return (
    <div className={cn("space-y-3 p-5", className)}>
      <div className="header w-full flex items-center justify-between py-4">
        <h2 className="text-lg font-semibold">Your Recordings</h2>
        <div className="actions flex items-center gap-2">
          <ScreenRecorderDialog>
          <Button>
            <PlusIcon/>
            Create New Recording
          </Button>
        </ScreenRecorderDialog>
        <Button onClick={()=>refetch}>
            <RotateCw/>
            Refresh
          </Button>
        </div>
      </div>
      {isFetching && (
        <div className="flex items-center gap-1.5 font-mono text-[10px] tracking-wide text-zinc-600">
          <RotateCw className="h-3 w-3 animate-spin" />
          REFRESHING
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((video) => (
          <VideoCard
            key={video.id}
            video={video}
            onPlay={onPlay}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}