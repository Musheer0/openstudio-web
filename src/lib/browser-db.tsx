import { openDB } from "idb";
import type { ScreenRecorderDB } from "@/types/db";

let dbPromise: ReturnType<typeof openDB<ScreenRecorderDB>> | null = null;

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<ScreenRecorderDB>("screen-recorder", 2, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("videos")) {
          db.createObjectStore("videos", {
            keyPath: "id",
          });
        }

        if (!db.objectStoreNames.contains("chunks")) {
          const store = db.createObjectStore("chunks", {
            keyPath: "id",
          });

          store.createIndex("video_id", "video_id");
        }
      },
    });
  }

  return dbPromise;
}