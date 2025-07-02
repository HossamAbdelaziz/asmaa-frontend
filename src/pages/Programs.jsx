// src/pages/Programs.js
import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom"; // ✅ Needed for navigation
import { getCurrencyDisplay } from "../utils/currencyConverter.jsx";
import "../styles/Programs.css";

const Programs = () => {
    const { t, i18n } = useTranslation();

    // 📦 Load array of programs from translation file
    const programs = t("programs", { returnObjects: true });

    return (
        <div className="programs-page container py-5">
            {/* 👩‍🏫 Intro Section with Coach Asmaa */}
            <div className="programs-intro row align-items-center gx-3 text-center text-lg-start mb-5">
                {/* 🖼 Coach Image */}
                <div className="col-lg-5 mb-4 mb-lg-0">
                    <img
                        src="/programs/coach-intro.jpg"
                        alt="Coach Asmaa"
                        className="img-fluid rounded shadow-sm w-100 intro-img"
                    />
                </div>

                {/* 📝 Intro Text */}
                <div className="col-lg-7">
                    <p className="programs-intro-text">{t("programs_intro")}</p>
                </div>
            </div>

            {/* 📛 Section Title */}
            <h2 className="programs-title text-center mb-4">
                {i18n.language === "ar" ? "برامجنا" : "Our Programs"}
            </h2>

            {/* 🧱 Program Cards */}
            <div className="row g-4">
                {programs.map((program, index) => (
                    <div key={index} className="col-12 col-md-6 col-lg-4" data-aos="zoom-in">

                        <div className="program-card card h-100">

                            {/* 🖼 Program Image */}
                            <img
                                src={`/programs/${program.image}`}
                                alt={program.title}
                                className="card-img-top program-img"
                            />

                            {/* 📋 Program Info */}
                            <div className="card-body d-flex flex-column">
                                <h5 className="program-title">{program.title}</h5>

                                {/* ⏳ Duration Field */}
                                {program.duration && (
                                    <span className="program-duration-badge">
                                        ⏳ {program.duration}
                                    </span>
                                )}

                                <p className="program-description">{program.description}</p>

                                {/* 🔗 Button to Program Details */}
                                <div className="mt-auto">
                                    <Link
                                        to={`/programs/${program.slug}`}
                                        className="btn btn-outline-accent mt-3"
                                    >
                                        <span>{t("programs_read_more")}</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Programs;
