// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);      // Firebase user object
    const [userProfile, setUserProfile] = useState(null);      // Firestore user profile
    const [avatarUrl, setAvatarUrl] = useState("/assets/avatars/avatar-default.png"); // 🔄 Avatar for UI
    const [isAdmin, setIsAdmin] = useState(false);             // Admin check
    const [loading, setLoading] = useState(true);              // Auth check loading

    // ✅ Refresh profile manually (e.g. after update)
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
            setLoading(true);
            setCurrentUser(user);

            if (user) {
                const userDoc = doc(db, "users", user.uid);
                const userSnap = await getDoc(userDoc);

                if (userSnap.exists()) {
                    const data = userSnap.data();
                    setUserProfile(data);
                    const avatar = data.avatarUrl || data.profile?.avatarUrl || "/assets/avatars/avatar-default.png";
                    setAvatarUrl(avatar);
                } else {
                    setUserProfile(null);
                    setAvatarUrl("/assets/avatars/avatar-default.png");
                }

                const adminDoc = doc(db, "admins", user.uid);
                const adminSnap = await getDoc(adminDoc);
                setIsAdmin(adminSnap.exists());
            } else {
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

    const logout = () => {
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
                refreshUserProfile, // ✅ You must expose this
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
