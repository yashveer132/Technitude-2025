import { db } from "../firebase/config";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";

export const saveUserChatHistory = async (userId, chatItem) => {
  try {
    const chatRef = doc(collection(db, `users/${userId}/chats`));
    await setDoc(chatRef, {
      ...chatItem,
      timestamp: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.error("Error saving chat history:", error);
    return false;
  }
};

export const getUserChatHistory = async (userId, domain, limit = 20) => {
  try {
    const chatsRef = collection(db, `users/${userId}/chats`);
    const q = query(
      chatsRef,
      where("domain", "==", domain),
      orderBy("timestamp", "desc"),
      limit(limit)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error getting chat history:", error);
    return [];
  }
};

export const saveUserPreferences = async (userId, preferences) => {
  try {
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, { preferences }, { merge: true });
    return true;
  } catch (error) {
    console.error("Error saving preferences:", error);
    return false;
  }
};

export const getUserPreferences = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      return docSnap.data().preferences;
    }
    return null;
  } catch (error) {
    console.error("Error getting preferences:", error);
    return null;
  }
};
