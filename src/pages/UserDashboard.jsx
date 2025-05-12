// src/pages/UserDashboard.js
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    doc,
    getDoc,
    getDocs,
    collection,
    query,
    where,
    orderBy
} from "firebase/firestore";

import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/firebaseConfig";

import ProgramProgressCard from "../components/Dashboard/ProgramProgressCard";
import BookSessionForm from "../components/Dashboard/BookingForm";
import UserBookings from "../components/Dashboard/UserBookings";
import PastSessionsTable from "../components/Dashboard/PastSessionsTable";
import NoSubscriptionDashboard from "../components/Dashboard/NoSubscriptionDashboard";

import "../styles/Dashboard/Dashboard.css";

export default function UserDashboard() {
    const { t } = useTranslation();
    const { currentUser, loading } = useAuth();

    const [userData, setUserData] = useState(null);
    const [availability, setAvailability] = useState(null);
    const [pastSessions, setPastSessions] = useState([]);
    const [sessionsUsed, setSessionsUsed] = useState(0);
    const [activeTab, setActiveTab] = useState("progress");

    useEffect(() => {
        if (!currentUser) return;
        (async () => {
            const snap = await getDoc(doc(db, "users", currentUser.uid));
            if (snap.exists()) {
                setUserData(snap.data());
            }
        })();
    }, [currentUser]);

    useEffect(() => {
        if (!currentUser) return;
        (async () => {
            try {
                const q = query(
                    collection(db, "pastBookings"),
                    where("userId", "==", currentUser.uid),
                    orderBy("selectedDateTime", "desc")
                );
                const snap = await getDocs(q);
                const past = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                setPastSessions(past);
                setSessionsUsed(past.length);
            } catch {
                setPastSessions([]);
                setSessionsUsed(0);
            }
        })();
    }, [currentUser]);

    useEffect(() => {
        (async () => {
            const snap = await getDoc(doc(db, "coach", "availability"));
            if (snap.exists()) {
                setAvailability(snap.data());
            }
        })();
    }, []);

    if (loading) return <h2 className="text-center mt-5">{t("dashboard.checkingLogin")}</h2>;
    if (!currentUser) return <Navigate to="/login" replace />;
    if (userData === null) return <h2 className="text-center mt-5">{t("dashboard.loadingUser")}</h2>;

    const profile = userData.profile || {};
    const subscription = userData.subscription;
    const hasSubscription = subscription?.status === "active";

    const requiredFields = ["firstName", "lastName", "whatsapp", "country", "age"];
    const isProfileComplete = requiredFields.every(f => {
        const value = profile[f];
        return value !== undefined && value !== null && value !== '';
    });

    if (!isProfileComplete) {
        return <Navigate to="/signup/complete-profile" replace />;
    }

    return (
        <div className="dashboard-container mt-4">
            {hasSubscription ? (
                <>
                    {/* 🔁 Tab Navigation */}
                    <div className="dashboard-tabs mb-4">
                        <button
                            className={`tab-button ${activeTab === "progress" ? "active" : ""}`}
                            onClick={() => setActiveTab("progress")}
                        >
                            {t("dashboard.tabs.programProgress")}
                        </button>
                        <button
                            className={`tab-button ${activeTab === "book" ? "active" : ""}`}
                            onClick={() => setActiveTab("book")}
                        >
                            {t("dashboard.tabs.bookSession")}
                        </button>
                        <button
                            className={`tab-button ${activeTab === "bookings" ? "active" : ""}`}
                            onClick={() => setActiveTab("bookings")}
                        >
                            {t("dashboard.tabs.myBookings")}
                        </button>
                        <button
                            className={`tab-button ${activeTab === "past" ? "active" : ""}`}
                            onClick={() => setActiveTab("past")}
                        >
                            {t("dashboard.tabs.pastSessions")}
                        </button>
                    </div>

                    {/* 🔁 Tab Panels */}
                    <div className="dashboard-tab-panel">
                        {activeTab === "progress" && (
                            <ProgramProgressCard
                                subscription={subscription}
                                userData={userData}
                            />
                        )}

                        {activeTab === "book" && (
                            <BookSessionForm
                                userData={userData}
                                availability={availability}
                                sessionsUsed={sessionsUsed}
                                totalSessions={
                                    (subscription.originalSessions || 0) +
                                    (subscription.bonusSessions || 0)
                                }
                                programId={subscription.programId}
                                programTitle={subscription.programTitle}
                            />
                        )}

                        {activeTab === "bookings" && <UserBookings />}
                        {activeTab === "past" && <PastSessionsTable pastSessions={pastSessions} />}
                    </div>
                </>
            ) : (
                <NoSubscriptionDashboard userData={userData} />
            )}
        </div>
    );
}
