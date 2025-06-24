import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
        console.log("🧠 AdminContext: Auth state changed", user);

        if (user) {
            const docRef = doc(db, "admins", user.uid);
            console.log("🔍 Checking admin record for UID:", user.uid);

            try {
                const snap = await getDoc(docRef);
                if (snap.exists()) {
                    console.log("✅ Admin record found.");
                    setIsAdmin(true);
                } else {
                    console.warn("❌ No admin record found.");
                    setIsAdmin(false);
                }
            } catch (error) {
                console.error("🔥 Error reading admin document:", error);
                setIsAdmin(false);
            }
        } else {
            console.log("🚫 No user logged in.");
            setIsAdmin(false);
        }

        setLoading(false);
    });

    return () => unsubscribe();
}, []);

    return (
        <AdminContext.Provider value={{ isAdmin, loading }}>
            {children}
        </AdminContext.Provider>
    );
};

export const useAdmin = () => useContext(AdminContext);
