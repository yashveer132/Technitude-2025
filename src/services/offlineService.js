import { openDB } from "idb";

const DB_NAME = "technitudeOfflineDB";
const DB_VERSION = 1;

const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("cachedResponses")) {
        db.createObjectStore("cachedResponses", { keyPath: "key" });
      }
    },
  });
};

export const getCachedResponse = async (key) => {
  const db = await initDB();
  const cached = await db.get("cachedResponses", key);
  if (cached && Date.now() - new Date(cached.timestamp) < 24 * 60 * 60 * 1000) {
    return cached.data;
  }
  return null;
};
