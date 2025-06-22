// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";
import { arrayUnion } from "firebase/firestore";

import { Capacitor } from "@capacitor/core";
import { FirebaseMessaging } from "@capacitor-firebase/messaging";

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
        console.log("✅ Auth: Logged in:", user.uid);

        const userDoc = doc(db, "users", user.uid);
        const userSnap = await getDoc(userDoc);

        if (userSnap.exists()) {
          const data = userSnap.data();
          setUserProfile(data);
          console.log("✅ Firestore profile:", data);
          const avatar = data.avatarUrl || data.profile?.avatarUrl || "/assets/avatars/avatar-default.png";
          setAvatarUrl(avatar);
        } else {
          setUserProfile(null);
          setAvatarUrl("/assets/avatars/avatar-default.png");
        }

        // 🔐 Admin check
        const adminDoc = doc(db, "admins", user.uid);
        const adminSnap = await getDoc(adminDoc);
        setIsAdmin(adminSnap.exists());

        // ✅ Native FCM Token (skip iOS to avoid APNS error)
        const platform = Capacitor.getPlatform();
        if (Capacitor.isNativePlatform() && platform !== "ios") {
          try {
            const perm = await FirebaseMessaging.requestPermissions();
            if (perm.receive === "granted") {
              const tokenResult = await FirebaseMessaging.getToken();
              const token = tokenResult?.token;
              console.log("🔐 FCM token:", token || "❌ Not received");

              if (token) {
                const existingTokens = userSnap.data()?.messaging?.fcmTokens || [];
                const alreadyExists = existingTokens.some(t => t.token === token);
                if (!alreadyExists) {
                  await setDoc(userDoc, {
                    messaging: {
                      fcmTokens: arrayUnion({
                        token,
                        platform,
                        lastUsed: new Date(),
                        isActive: true,
                      }),
                      updatedAt: new Date(),
                    }
                  }, { merge: true });
                  console.log("✅ FCM token saved to Firestore.");
                }
              }
            } else {
              console.warn("❌ Notification permission denied.");
            }
          } catch (err) {
            console.error("🔥 Native FCM error:", err);
          }
        } else {
          console.log("📱 Skipping FCM (iOS or web)");
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