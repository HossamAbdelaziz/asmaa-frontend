// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, arrayUnion } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";

import { Capacitor } from "@capacitor/core";
import { FirebaseMessaging } from "@capacitor-firebase/messaging";
import { saveFCMTokenForUser, testFirestoreWrite } from '../utils/fcmService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState("/assets/avatars/avatar-default.png");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const refreshUserProfile = async () => {
    if (!auth.currentUser) return;
    const snap = await getDoc(doc(db, "users", auth.currentUser.uid));
    if (snap.exists()) {
      const data = snap.data();
      setUserProfile(data);
      const avatar = data.avatarUrl || data.profile?.avatarUrl || "/assets/avatars/avatar-default.png";
      setAvatarUrl(avatar);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("🔥 onAuthStateChanged fired:", user);
      setLoading(true);
      setCurrentUser(user);

      if (user) {
        const userDoc = doc(db, "users", user.uid);
        console.log("✅ Auth: Logged in:", user.uid);

        // Fetch user profile
        try {
          const userSnap = await getDoc(userDoc);
          if (userSnap.exists()) {
            const data = userSnap.data();
            setUserProfile(data);
            const avatar = data.avatarUrl || data.profile?.avatarUrl || "/assets/avatars/avatar-default.png";
            setAvatarUrl(avatar);
            console.log("✅ Firestore profile:", data);
          } else {
            console.warn("⚠️ No user profile found in Firestore.");
          }
        } catch (err) {
          console.error("🔥 Error fetching user profile:", err.message);
        }

        // Check admin status
        try {
          const adminSnap = await getDoc(doc(db, "admins", user.uid));
          setIsAdmin(adminSnap.exists());
          console.log(adminSnap.exists() ? "✅ User is admin" : "❌ User is not admin");
        } catch (err) {
          console.error("🔥 Error checking admin status:", err.message);
        }

        // FCM Token Logic - Simple and direct approach
        const platform = Capacitor.getPlatform();
        console.log("📱 Detected platform:", platform);
        console.log("📱 Is native platform:", Capacitor.isNativePlatform());

        // Save FCM token for native platforms (iOS/Android)
        if (Capacitor.isNativePlatform()) {
          try {
            console.log("🚀🚀🚀 FCM SAVE ATTEMPT STARTED 🚀🚀🚀");
            console.log("📱 Native platform detected. Saving FCM token...");
            
            // Test Firestore write permissions first
            console.log("🧪 Testing Firestore write permissions...");
            const writeTest = await testFirestoreWrite(user.uid);
            console.log("🧪 Firestore write test result:", writeTest);
            
            if (writeTest) {
              await saveFCMTokenForUser(user.uid);
              console.log("✅✅✅ FCM SAVE ATTEMPT COMPLETED ✅✅✅");
            } else {
              console.log("❌❌❌ Firestore write test failed, skipping FCM save ❌❌❌");
            }
          } catch (err) {
            console.error("❌❌❌ FCM token save failed:", err.message);
          }
        } else {
          console.log("🌐 Web platform detected - FCM handled separately");
        }

      } else {
        console.log("⛔ No user logged in.");
        setUserProfile(null);
        setAvatarUrl("/assets/avatars/avatar-default.png");
        setIsAdmin(false);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const isProfileComplete = () => {
    if (!userProfile) return false;
    const { firstName, lastName, phone, country, age } = userProfile;
    return firstName && lastName && phone && country && age;
  };

  const cleanupFcmTokenOnLogout = async () => {
    try {
      if (!currentUser || Capacitor.getPlatform() === "ios") return;

      const tokenResult = await FirebaseMessaging.getToken();
      const token = tokenResult.token;
      if (!token) return;

      const userDocRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userDocRef);
      const existingTokens = userSnap.data()?.messaging?.fcmTokens || [];
      const filteredTokens = existingTokens.filter(entry => entry.token !== token);

      await setDoc(userDocRef, {
        messaging: {
          fcmTokens: filteredTokens,
          updatedAt: new Date()
        }
      }, { merge: true });

      console.log("🧹 FCM token removed on logout");
    } catch (error) {
      console.error("⚠️ FCM logout cleanup error:", error.message);
    }
  };

  const logout = async () => {
    await cleanupFcmTokenOnLogout();
    return signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        setUserProfile,
        avatarUrl,
        setAvatarUrl,
        isAdmin,
        loading,
        logout,
        isEmailVerified: currentUser?.emailVerified || false,
        isProfileComplete,
        refreshUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);