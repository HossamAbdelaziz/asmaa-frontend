// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);      // Firebase user object
    const [userProfile, setUserProfile] = useState(null);      // User's profile from Firestore
    const [isAdmin, setIsAdmin] = useState(false);             // Admin check
    const [loading, setLoading] = useState(true);              // Auth check loading

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setLoading(true);
            setCurrentUser(user);

            if (user) {
                // 🔍 Check regular user profile
                const userDoc = doc(db, "users", user.uid);
                const userSnap = await getDoc(userDoc);
                if (userSnap.exists()) {
                    const data = userSnap.data();
                    setUserProfile(data);
                } else {
                    setUserProfile(null);
                }

                // 🔐 Check if user is an admin (in "admins" collection)
                const adminDoc = doc(db, "admins", user.uid);
                const adminSnap = await getDoc(adminDoc);
                setIsAdmin(adminSnap.exists());
            } else {
                setUserProfile(null);
                setIsAdmin(false);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // ✅ Profile completeness check
    const isProfileComplete = () => {
        if (!userProfile) return false;
        const { firstName, lastName, phone, country, age } = userProfile;
        return firstName && lastName && phone && country && age;
    };

    // ✅ Logout (shared for both user/admin)
    const logout = () => {
        return signOut(auth);
    };

    return (
        <AuthContext.Provider
            value={{
                currentUser,
                userProfile,
                isAdmin,
                loading,
                logout,
                isEmailVerified: currentUser?.emailVerified || false,
                isProfileComplete,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
