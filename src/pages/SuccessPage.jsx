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
    const [status, setStatus] = useState("loading"); // ⏳ loading | success | error
    const navigate = useNavigate();

    useEffect(() => {
        const processProgramPurchase = async () => {
            const programId = searchParams.get("programId");
            if (!programId) {
                setError("Invalid program ID in URL.");
                setStatus("error");
                return;
            }

            if (loading) return; // ⏳ Wait until Firebase finishes loading

            if (!currentUser) {
                // ❌ Not logged in – save intended redirect and programId
                localStorage.setItem("pendingProgramId", programId);
                navigate("/login");
                return;
            }

            try {
                // 🧠 Check if already has a subscription
                const userRef = doc(db, "users", currentUser.uid);
                const userSnap = await getDoc(userRef);
                const existingSub = userSnap.data()?.subscription;

                if (existingSub?.programId === programId) {
                    // Already subscribed – skip
                    navigate("/dashboard");
                    return;
                }

                // ✅ Fetch program info
                const programSnap = await getDoc(doc(db, "programs", programId));
                if (!programSnap.exists()) {
                    console.warn("Program ID from Stripe is:", programId);
                    setError(`Program not found. Please contact support and provide this ID: ${programId}`);
                    setStatus("error");
                    return;
                }


                const program = programSnap.data();
                const startDate = new Date();
                const endDate = new Date();
                endDate.setDate(startDate.getDate() + program.durationWeeks * 7);

                // 🔐 Assign program to user
                await updateDoc(userRef, {
                    subscription: {
                        programId,
                        programTitle: program.title,
                        startDate: startDate.toISOString().split("T")[0],
                        endDate: endDate.toISOString().split("T")[0],
                        status: "active",
                        totalWeeks: program.durationWeeks,
                        originalDuration: program.durationWeeks,
                        originalSessions: program.sessions,
                        sessionsLeft: program.sessions,
                        bonusWeeks: 0,
                        bonusSessions: 0,
                    },
                });

                await refreshUserProfile();
                navigate("/dashboard");
            } catch (err) {
                console.error("Failed to assign program:", err);
                setError("Something went wrong while processing your subscription.");
                setStatus("error");
            }
        };

        processProgramPurchase();
    }, [currentUser, loading, navigate, searchParams]);

    return (
        <div className="container mt-5 text-center">
            {status === "loading" && (
                <>
                    <h3>⏳ Finalizing Your Subscription...</h3>
                    <p>Please wait, you will be redirected shortly.</p>
                </>
            )}
            {status === "error" && (
                <>
                    <h3>⚠️ Something Went Wrong</h3>
                    <p className="text-danger">{error}</p>
                </>
            )}
        </div>
    );
}
