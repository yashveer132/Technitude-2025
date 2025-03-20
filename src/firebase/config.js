import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics, logEvent } from "firebase/analytics";
import { getPerformance, trace } from "firebase/performance";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

if (!process.env.REACT_APP_FIREBASE_API_KEY) {
  throw new Error("Firebase API key is missing in environment variables");
}

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
