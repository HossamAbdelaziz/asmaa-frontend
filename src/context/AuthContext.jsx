// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";
import { arrayUnion } from "firebase/firestore";

// ✅ Capacitor + Firebase Messaging for mobile push
import { Capacitor } from "@capacitor/core";
import { FirebaseMessaging } from "@capacitor-firebase/messaging";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [avatarUrl, setAvatarUrl] = useState("/assets/avatars/avatar-default.png");
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    // 🔄 Refresh user profile manually
    const refreshUserProfile = async () => {
        if (!auth.currentUser) return;
        const snap = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (snap.exists()) {
            const data = snap.data();
            setUserProfile(data);
            const avatar =
                data.avatarUrl || data.profile?.avatarUrl || "/assets/avatars/avatar-default.png";
            setAvatarUrl(avatar);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setLoading(true);
            setCurrentUser(user);

            if (user) {
                console.log("✅ AuthContext: User logged in:", user.uid);

                // 🔄 Load Firestore user profile
                const userDoc = doc(db, "users", user.uid);
                const userSnap = await getDoc(userDoc);

                if (userSnap.exists()) {
                    const data = userSnap.data();
                    setUserProfile(data);
                    const avatar =
                        data.avatarUrl || data.profile?.avatarUrl || "/assets/avatars/avatar-default.png";
                    setAvatarUrl(avatar);
                } else {
                    setUserProfile(null);
                    setAvatarUrl("/assets/avatars/avatar-default.png");
                }

                // 🔐 Check admin status
                const adminDoc = doc(db, "admins", user.uid);
                const adminSnap = await getDoc(adminDoc);
                setIsAdmin(adminSnap.exists());

                // ✅ Handle FCM only in native app
                // ✅ Handle FCM only in native app
                if (Capacitor.isNativePlatform()) {
                    console.log("📱 Native platform detected. Starting FCM setup...");

                    try {
                        const perm = await FirebaseMessaging.requestPermissions();
                        console.log("📲 FCM Permission response:", JSON.stringify(perm));

                        if (perm.receive === 'granted') {
                            const tokenResult = await FirebaseMessaging.getToken();
                            const token = tokenResult.token;

                            console.log("🔐 Received FCM token:", token || "❌ No token returned");

                            if (token) {
                                const userDocRef = doc(db, "users", user.uid);

                                // ✅ Load existing tokens first to prevent duplicates
                                const userSnap = await getDoc(userDocRef);
                                const existingTokens = userSnap.data()?.messaging?.fcmTokens || [];

                                const alreadyExists = existingTokens.some(entry => entry.token === token);

                                if (!alreadyExists) {
                                    await setDoc(
                                        userDocRef,
                                        {
                                            messaging: {
                                                fcmTokens: arrayUnion({
                                                    token,
                                                    platform: Capacitor.getPlatform(),
                                                    lastUsed: new Date(),
                                                    isActive: true,
                                                }),
                                                updatedAt: new Date()
                                            }
                                        },
                                        { merge: true }
                                    );

                                    console.log("✅ FCM token added to fcmTokens array for:", user.email);
                                } else {
                                    console.log("🔁 FCM token already exists, skipping duplicate add.");
                                }
                            } else {
                                console.warn("⚠️ getToken() returned null or undefined");
                            }
                        } else {
                            console.warn("❌ Notification permission was not granted.");
                        }
                    } catch (err) {
                        console.error("🔥 FCM error:", err.message || err);
                    }
                }
                else {
                    console.log("🌐 Not running on native platform — skipping FCM.");
                }
            } else {
                console.log("⛔ AuthContext: No user logged in.");
                setUserProfile(null);
                setAvatarUrl("/assets/avatars/avatar-default.png");
                setIsAdmin(false);
            }

            setLoading(false);
        });

        return () => unsubscribe(); // Cleanup listener
    }, []);

    // ✅ Check if user profile is complete
    const isProfileComplete = () => {
        if (!userProfile) return false;
        const { firstName, lastName, phone, country, age } = userProfile;
        return firstName && lastName && phone && country && age;
    };

    // 🧹 Token Cleanup Function (on logout)
    const cleanupFcmTokenOnLogout = async () => {
        try {
            if (!currentUser) return;
            if (!Capacitor.isNativePlatform()) return;

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
            console.error("⚠️ Error during FCM cleanup:", error.message || error);
        }
    };

    // 🚪 Final logout function with cleanup
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
