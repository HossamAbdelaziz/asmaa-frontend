// src/pages/SuccessPage.jsx
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function SuccessPage() {
    const { currentUser, loading, refreshUserProfile } = useAuth();
    const [searchParams] = useSearchParams();
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const handleSuccess = async () => {
            const programId = searchParams.get("programId");
            if (!programId) {
                setError("Invalid program ID.");
                return;
            }

            // Wait for Firebase auth to finish loading
            if (loading) return;

            if (!currentUser) {
                // User not logged in, redirect to login with return param
                navigate(`/login?returnTo=/success?programId=${programId}`);
                return;
            }

            try {
                // Get program info from Firestore
                const programSnap = await getDoc(doc(db, "programs", programId));
                if (!programSnap.exists()) {
                    setError("Program not found.");
                    return;
                }

                const program = programSnap.data();

                // Save subscription to user's profile
                const userRef = doc(db, "users", currentUser.uid);
                await updateDoc(userRef, {
                    subscription: {
                        programId,
                        programTitle: program.title,
                        startDate: new Date().toISOString().split("T")[0],
                        endDate: new Date(Date.now() + program.durationWeeks * 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
                        status: "active",
                        totalWeeks: program.durationWeeks,
                        originalDuration: program.durationWeeks,
                        originalSessions: program.sessions,
                        sessionsLeft: program.sessions,
                        bonusWeeks: 0,
                        bonusSessions: 0,
                    },
                });

                // Refresh context and redirect
                await refreshUserProfile();
                navigate("/dashboard");
            } catch (err) {
                console.error("Success page error:", err);
                setError("Something went wrong while processing your subscription.");
            }
        };

        handleSuccess();
    }, [currentUser, loading, navigate, searchParams]);

    if (error) {
        return <div className="container mt-5"><h4>{error}</h4></div>;
    }

    return (
        <div className="container mt-5">
            <h4>⏳ Finalizing your subscription...</h4>
            <p>Please wait, you will be redirected to your dashboard shortly.</p>
        </div>
    );
}
