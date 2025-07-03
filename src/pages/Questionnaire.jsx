// src/pages/Questionnaire.js

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../firebase/firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import "../styles/Questionnaire.css";

const Questionnaire = () => {
    const { t } = useTranslation();
    const auth = getAuth();

    const [user, setUser] = useState(null);
    const [answers, setAnswers] = useState({});
    const [currentIndex, setCurrentIndex] = useState(0);
    const [submitted, setSubmitted] = useState(false);
    const [result, setResult] = useState({ message: "", showCTA: false });
    const [statusKey, setStatusKey] = useState("");
    const [guestInfo, setGuestInfo] = useState({ name: "", phone: "", country: "" });
    const [guestError, setGuestError] = useState("");
    const [guestSubmitted, setGuestSubmitted] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
        });
        return () => unsubscribe();
    }, [auth]);

    const questions = [
        t("questionnaire.q1"), t("questionnaire.q2"), t("questionnaire.q3"), t("questionnaire.q4"),
        t("questionnaire.q5"), t("questionnaire.q6"), t("questionnaire.q7"), t("questionnaire.q8"),
        t("questionnaire.q9"), t("questionnaire.q10")
    ];

    const handleAnswer = (index, value) => {
        setAnswers((prev) => ({ ...prev, [index]: value }));
        if (index < questions.length - 1) {
            setCurrentIndex(index + 1);
        }
    };

    const handleGuestInput = (e) => {
        const { name, value } = e.target;
        setGuestInfo((prev) => ({ ...prev, [name]: value }));
    };

    const saveSubmission = async (customInfo = {}) => {
        try {
            await addDoc(collection(db, "questionnaire_submissions"), {
                uid: user?.uid || null,
                email: user?.email || null,
                name: customInfo.name || null,
                phone: customInfo.phone || null,
                country: customInfo.country || null,
                result: statusKey,
                answers,
                createdAt: serverTimestamp(),
                approvedForConsultation: false,
            });
        } catch (error) {
            console.error("Error saving questionnaire submission:", error);
        }
    };

    const handleSubmit = () => {
        const yesCount = Object.values(answers).filter((val) => val === "yes").length;
        let resultKey = "safe";

        if (yesCount >= 5) {
            resultKey = "disorder";
            setResult({ message: t("questionnaire.result_disorder"), showCTA: true });
        } else if (yesCount === 4) {
            resultKey = "warning";
            setResult({ message: t("questionnaire.result_warning"), showCTA: false });
        } else {
            resultKey = "safe";
            setResult({ message: t("questionnaire.result_safe"), showCTA: false });
        }

        setStatusKey(resultKey);
        setSubmitted(true);

        if (resultKey !== "disorder") {
            saveSubmission();
        }
    };

    const handleGuestSubmit = async () => {
        if (!guestInfo.name || !guestInfo.phone || !guestInfo.country) {
            setGuestError("Please fill in all required fields.");
            return;
        }
        await saveSubmission(guestInfo);
        setGuestSubmitted(true);
        setGuestError("");
    };

    return (
        <div className="questionnaire-container container py-5">
            <h2 className="questionnaire-title text-center mb-4">{t("questionnaire.title")}</h2>
            <p className="questionnaire-intro text-center mb-4">{t("questionnaire.intro")}</p>

            {!submitted && (
                <div className="text-center">
                    <div className="question-card card p-4 mb-4">
                        <div className="progress-label mb-2">
                            {t("questionnaire.progress", { current: currentIndex + 1, total: questions.length })}
                        </div>

                        <div key={currentIndex} className="question-text animated-question">
                            {questions[currentIndex]}
                        </div>


                        <div className="btn-group mt-3">
                            <button
                                className={`btn btn-success me-2 ${answers[currentIndex] === "yes" ? "active" : ""}`}
                                onClick={() => handleAnswer(currentIndex, "yes")}
                            >
                                {t("questionnaire.yes")}
                            </button>
                            <button
                                className={`btn btn-danger ${answers[currentIndex] === "no" ? "active" : ""}`}
                                onClick={() => handleAnswer(currentIndex, "no")}
                            >
                                {t("questionnaire.no")}
                            </button>
                        </div>

                        {currentIndex > 0 && (
                            <button
                                className="btn btn-link mt-3"
                                onClick={() => setCurrentIndex(currentIndex - 1)}
                            >
                                ⬅️ {t("questionnaire.back")}
                            </button>
                        )}

                        {currentIndex === questions.length - 1 && (
                            <button
                                className="btn btn-primary mt-4"
                                onClick={handleSubmit}
                                disabled={Object.keys(answers).length !== questions.length}
                            >
                                {t("questionnaire.submit")}
                            </button>
                        )}
                    </div>
                </div>
            )}

            {submitted && (
                <div className="result-section text-center mt-5">
                    <p className="result-message">{result.message}</p>

                    {result.showCTA && (
                        <div className="guest-form mt-4">
                            <h5>{t("questionnaire.free_consultation_form")}</h5>
                            <input name="name" placeholder={t("questionnaire.name")} value={guestInfo.name} onChange={handleGuestInput} className="form-control my-2" />
                            <input name="phone" placeholder={t("questionnaire.phone")} value={guestInfo.phone} onChange={handleGuestInput} className="form-control my-2" />
                            <input name="country" placeholder={t("questionnaire.country")} value={guestInfo.country} onChange={handleGuestInput} className="form-control my-2" />
                            {guestError && <p className="text-danger">{guestError}</p>}
                            <button className="btn btn-outline-primary mt-2" onClick={handleGuestSubmit}>{t("questionnaire.submit_info")}</button>

                            {guestSubmitted && (
                                <div className="alert alert-success mt-4">
                                    {t("questionnaire.whatsapp_notice")}
                                    <div className="mt-3">
                                        <a href="/programs" className="btn btn-primary">
                                            {t("questionnaire.explore_programs")}
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Questionnaire;
