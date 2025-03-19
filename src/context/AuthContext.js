import React, { createContext, useContext, useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth, db } from "../firebase/config";
import { doc, setDoc, getDoc } from "firebase/firestore";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!auth) {
      setError("Firebase Auth not initialized");
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          setUser(
            userDoc.exists() ? { ...user, preferences: userDoc.data() } : user
          );
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signup = async (email, password, displayName) => {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    await setDoc(doc(db, "users", userCredential.user.uid), {
      displayName,
      email,
      preferences: {},
      createdAt: new Date().toISOString(),
    });
    return userCredential;
  };

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    await setDoc(
      doc(db, "users", result.user.uid),
      {
        displayName: result.user.displayName,
        email: result.user.email,
        preferences: {},
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return result;
  };

  const logout = () => {
    return signOut(auth);
  };

  const updateUserPreferences = async (preferences) => {
    if (!user) return;
    await setDoc(
      doc(db, "users", user.uid),
      {
        preferences: { ...user.preferences?.preferences, ...preferences },
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  };

  const value = {
    user,
    signup,
    login,
    loginWithGoogle,
    logout,
    updateUserPreferences,
  };

  if (error) {
    console.error("Auth Error:", error);
    return <div>Error initializing authentication: {error}</div>;
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};
