// src/components/Dashboard/NoSubscriptionDashboard.jsx

import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import avatarDefault from "../../../public/assets/avatars/avatar-default.png";
import "../../styles/Dashboard/NoSubscriptionDashboard.css";

function NoSubscriptionDashboard({ userData }) {
    const { t } = useTranslation();
    const avatarUrl = userData?.avatarUrl || avatarDefault;
    const displayName = userData?.firstName || "User";

    return (
        <div className="no-sub-dashboard">
            <div className="no-sub-header">
                <div className="no-sub-avatar-block">
                    <img src={avatarUrl} alt="User Avatar" className="no-sub-avatar" />
                    <h2>{t("dashboard.welcomeBack")}, {displayName}</h2>
                </div>
                <p>{t("dashboard.noSubscription.description")}</p>
            </div>

            <div className="no-sub-actions">
                <div className="no-sub-card">
                    <h4>{t("dashboard.noSubscription.freeQuestionnaire")}</h4>
                    <p>{t("dashboard.noSubscription.freeQuestionnaireDesc")}</p>
                    <Link to="/questionnaire" className="no-sub-btn">
                        {t("dashboard.noSubscription.takeQuiz")}
                    </Link>
                </div>

                <div className="no-sub-card">
                    <h4>{t("dashboard.noSubscription.browsePrograms")}</h4>
                    <p>{t("dashboard.noSubscription.browseProgramsDesc")}</p>
                    <Link to="/programs" className="no-sub-btn">
                        {t("dashboard.noSubscription.viewPrograms")}
                    </Link>
                </div>
            </div>

            <div className="no-sub-quote">
                <blockquote>
                    “{t("dashboard.noSubscription.quote")}”
                </blockquote>
            </div>
        </div>
    );
}

export default NoSubscriptionDashboard;
