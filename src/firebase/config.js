import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics, logEvent } from "firebase/analytics";
import { getPerformance, trace } from "firebase/performance";

const firebaseConfig = {
  apiKey: "AIzaSyBT9jRM-75LyBKwJZKN2hqgBujigsgaW_0",
  authDomain: "technitude-2025.firebaseapp.com",
  projectId: "technitude-2025",
  storageBucket: "technitude-2025.firebasestorage.app",
  messagingSenderId: "937254841609",
  appId: "1:937254841609:web:aed1e63d297bd7b40837d8",
  measurementId: "G-EYQBTW9PH4",
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);
const performance = getPerformance(app);

if (!auth || !db) {
  throw new Error("Firebase services failed to initialize");
}

export const logChatInteraction = (actionType, data) => {
  logEvent(analytics, "chat_interaction", {
    action_type: actionType,
    ...data,
    timestamp: new Date().toISOString(),
  });
};

export const analyticsEvents = {
  CHAT_INTERACTION: "chat_interaction",
  BOOKING_CREATED: "booking_created",
  ORDER_PLACED: "order_placed",
  ERROR_OCCURRED: "error_occurred",
  USER_ACTION: "user_action",
};

export const logAnalyticsEvent = (eventName, data) => {
  try {
    logEvent(analytics, eventName, {
      ...data,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    });
  } catch (error) {
    console.error("Analytics logging failed:", error);
  }
};

export const startTrace = (traceName) => {
  try {
    return performance.trace(traceName);
  } catch (error) {
    console.error("Performance trace failed:", error);
    return null;
  }
};

export { db, auth, app, analytics, performance };
