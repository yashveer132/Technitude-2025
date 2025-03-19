import { openDB } from "idb";

const DB_NAME = "technitudeOfflineDB";
const DB_VERSION = 1;

const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("pendingActions")) {
        db.createObjectStore("pendingActions", {
          keyPath: "id",
          autoIncrement: true,
        });
      }
      if (!db.objectStoreNames.contains("cachedResponses")) {
        db.createObjectStore("cachedResponses", { keyPath: "key" });
      }
    },
  });
};

export const saveOfflineAction = async (action) => {
  const db = await initDB();
  return db.add("pendingActions", {
    ...action,
    timestamp: new Date().toISOString(),
    synced: false,
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

export const syncOfflineActions = async () => {
  const db = await initDB();
  const tx = db.transaction("pendingActions", "readwrite");
  const store = tx.objectStore("pendingActions");

  const pendingActions = await store.getAll();

  for (const action of pendingActions) {
    if (!action.synced) {
      try {
        switch (action.type) {
          case "booking":
            break;
          case "order":
            break;
          default:
            console.warn("Unknown action type:", action.type);
        }

        await store.put({ ...action, synced: true });
      } catch (error) {
        console.error("Failed to sync action:", error);
      }
    }
  }

  await tx.done;
};
