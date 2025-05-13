import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../context/AuthContext";

export default function SuccessPage() {
    const [searchParams] = useSearchParams();
    const programId = searchParams.get("programId");
    const navigate = useNavigate();
    const { currentUser, loading } = useAuth();

    const [error, setError] = useState("");

    useEffect(() => {
        const assignProgramToUser = async () => {
            if (!currentUser || loading) return;

            try {
                const programRef = doc(db, "programs", programId);
                const programSnap = await getDoc(programRef);

                if (!programSnap.exists()) {
                    setError(`Program not found. Please contact support and provide this ID: ${programId}`);
                    return;
                }

                const program = programSnap.data();
                const startDate = new Date();
                const endDate = new Date();
                endDate.setDate(startDate.getDate() + program.durationWeeks * 7);

                const subscription = {
                    programId,
                    programTitle: program.title,
                    status: "active",
                    startDate: startDate.toISOString().split("T")[0],
                    endDate: endDate.toISOString().split("T")[0],
                    originalDuration: program.durationWeeks,
                    totalWeeks: program.durationWeeks,
                    originalSessions: program.sessions,
                    sessionsLeft: program.sessions,
                    bonusWeeks: 0,
                    bonusSessions: 0,
                    createdAt: serverTimestamp()
                };

                await updateDoc(doc(db, "users", currentUser.uid), {
                    subscription
                });

                navigate("/dashboard");
            } catch (err) {
                console.error("🔥 Error assigning program:", err);
                setError("Something went wrong. Please contact support.");
            }
        };

        if (!loading) {
            if (!currentUser) {
                // Not logged in – redirect to login with return path
                navigate(`/login?redirect=/success?programId=${programId}`);
            } else {
                assignProgramToUser();
            }
        }
    }, [currentUser, loading, programId, navigate]);

    return (
        <div className="container mt-5 text-center">
            {error ? (
                <div className="alert alert-danger">
                    <h4>⚠️ Something Went Wrong</h4>
                    <p>{error}</p>
                </div>
            ) : (
                <div className="alert alert-info">
                    Processing your program... please wait ⏳
                </div>
            )}
        </div>
    );
}
