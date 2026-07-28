// types.ts

import { DBSchema } from "idb";

export interface Video {
  id: string;
  blob: Blob | null;
  finished_recording: boolean;
  created_at: number;
}

export interface VideoChunk {
  id: string;
  video_id: string;
  blob: Blob;
  created_at: number;
}

export interface ScreenRecorderDB extends DBSchema {
  videos: {
    key: string;
    value: Video;
  };

  chunks: {
    key: string;
    value: VideoChunk;
    indexes: {
      video_id: string;
    };
  };
}