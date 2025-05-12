// src/pages/SuccessPage.js
import React, { useEffect, useState } from "react";
import { useSearchParams, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

export default function SuccessPage() {
    const { currentUser } = useAuth();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const programId = searchParams.get("programId");

    useEffect(() => {
        if (!currentUser || !programId) return;

        (async () => {
            try {
                const programRef = doc(db, "programs", programId);
                const programSnap = await getDoc(programRef);

                if (!programSnap.exists()) throw new Error("Program not found");

                const program = programSnap.data();

                const startDate = new Date();
                const endDate = new Date();
                endDate.setDate(startDate.getDate() + (program.durationWeeks || 8) * 7);

                const subscription = {
                    programId,
                    programTitle: program.title || "My Program",
                    startDate: startDate.toISOString().split("T")[0],
                    endDate: endDate.toISOString().split("T")[0],
                    status: "active",
                    originalDuration: program.durationWeeks || 8,
                    totalWeeks: program.durationWeeks || 8,
                    originalSessions: program.sessions || 4,
                    bonusSessions: 0,
                    bonusWeeks: 0,
                    sessionsLeft: program.sessions || 4,
                };

                await updateDoc(doc(db, "users", currentUser.uid), {
                    subscription,
                });

                setSuccess(true);
            } catch (err) {
                console.error("❌ Failed to apply subscription:", err);
                setError("Something went wrong.");
            } finally {
                setLoading(false);
            }
        })();
    }, [currentUser, programId]);

    if (!currentUser) return <Navigate to="/login" replace />;
    if (loading) return <h2 className="text-center mt-5">🎉 Processing your subscription...</h2>;
    if (error) return <h2 className="text-danger text-center mt-5">{error}</h2>;
    if (success) return <Navigate to="/dashboard" replace />;
}
