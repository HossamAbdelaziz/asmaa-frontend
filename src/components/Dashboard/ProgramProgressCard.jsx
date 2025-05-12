// src/components/Dashboard/ProgramProgressCard.jsx

import React from "react";
import { useTranslation } from "react-i18next";
import avatarDefault from "../../../public/assets/avatars/avatar-default.png";
import "../../styles/Dashboard/ProgramProgressCard.css";

const ProgramProgressCard = ({ subscription, userData }) => {
    const { t } = useTranslation();

    if (!subscription) return null;

    const {
        programTitle,
        startDate,
        endDate,
        status,
        totalWeeks,
        originalSessions = 0,
        bonusSessions = 0,
        sessionsLeft = 0,
    } = subscription;

    const avatarUrl = userData?.avatarUrl || avatarDefault;
    const displayName = userData?.firstName || "User";

    // Dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();

    const formattedStart = start.toLocaleDateString();
    const formattedEnd = end.toLocaleDateString();

    // Week progress
    const elapsedDays = Math.floor((today - start) / (1000 * 60 * 60 * 24));
    const currentWeek = Math.min(Math.ceil(elapsedDays / 7), totalWeeks);
    const progressPercent = Math.min((elapsedDays / (totalWeeks * 7)) * 100, 100);

    // Sessions
    const totalSessions = originalSessions + bonusSessions;
    const sessionsUsed = Math.max(totalSessions - sessionsLeft, 0);

    const isExpired = status === "expired" || today > end;

    return (
        <div className="program-progress-card">
            <div className="card-columns">
                {/* Left Column */}
                <div className="card-left">
                    <div className="avatar-heading-wrapper">
                        <img src={avatarUrl} alt="User Avatar" className="progress-avatar" />
                        <h4 className="progress-heading">
                            {t("dashboard.welcomeBack")}, {displayName}
                        </h4>
                    </div>

                    <div className="program-meta">
                        <p><strong>{t("dashboard.program")}:</strong> {programTitle}</p>
                        <p><strong>{t("dashboard.startDate")}:</strong> {formattedStart}</p>
                        <p><strong>{t("dashboard.endDate")}:</strong> {formattedEnd}</p>
                        <p><strong>{t("dashboard.status")}:</strong> {isExpired ? "❌ " + t("dashboard.expired") : "✅ " + t("dashboard.active")}</p>
                    </div>
                </div>

                {/* Right Column */}
                <div className="card-right">
                    <div className="progress-block">
                        <label className="progress-label"><strong>{t("dashboard.progress")}:</strong></label>
                        <div className="week-progress-wrapper">
                            {[...Array(totalWeeks)].map((_, i) => (
                                <span key={i} className={`week-badge ${i + 1 < currentWeek ? "done" : i + 1 === currentWeek ? "current" : "future"}`}>
                                    {t("dashboard.week")} {i + 1}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="program-summary">
                        <p><strong>{t("dashboard.currentWeek")}:</strong> {currentWeek} / {totalWeeks}</p>
                        <p><strong>{t("dashboard.sessionsUsed")}:</strong> {sessionsUsed} / {totalSessions}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProgramProgressCard;
