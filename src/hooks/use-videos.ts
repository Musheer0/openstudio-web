"use client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getDB } from "@/lib/browser-db";
import type { Video } from "@/types/db";

export function useVideos() {
  return useQuery({
    queryKey: ["videos"],
    queryFn: async (): Promise<Video[]> => {
      const db = await getDB();

      const videos = await db.getAll("videos");

      return videos.sort(
        (a, b) => b.created_at - a.created_at
      );
    },
  });
}

export function useDeleteVideo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const db = await getDB();

      await db.delete("videos", id);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["videos"],
      });
    },
  });
}