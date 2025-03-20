import { db } from "../firebase/config";
import { doc, setDoc, getDoc } from "firebase/firestore";

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
