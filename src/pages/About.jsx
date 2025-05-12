// src/pages/About.js

import React from "react";
import { useTranslation } from "react-i18next";
import "../styles/admin/About.css";

function About() {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === "ar";

    return (
        <div className={`about-page ${isRTL ? "rtl" : "ltr"}`}>
            {/* ✅ Main Container */}
            <div className="page-container">

                {/* ✅ Page Title + Intro */}
                <div className="text-center mb-5">
                    <h2 className="about-title">{t("about.title")}</h2>
                    <p className="about-intro">{t("about.bio")}</p>
                </div>

                {/* ✅ About Bio Section */}
                <div className="about-bio-section row align-items-center mb-5 gx-5">
                    {/* Profile Image */}
                    <div className="col-md-5 text-center mb-4 mb-md-0">
                        <img
                            src="/assets/(28).jpg"
                            alt="Coach Asmaa"
                            className="about-photo rounded shadow-sm"
                        />
                    </div>

                    {/* Bio Text */}
                    <div className="col-md-7">
                        <p className="about-paragraph">{t("about.bio2")}</p>
                        <p className="about-paragraph">{t("about.bio3")}</p>
                    </div>
                </div>

                {/* ✅ Certificates Section */}
                <div className="about-certificates">
                    <h4 className="certificates-title text-center mb-4">{t("about.certificates")}</h4>
                    <div className="row justify-content-center g-4">
                        {["1.png", "2.png", "3.png", "4.png", "5.png"].map((img, index) => (
                            <div className="col-6 col-sm-4 col-md-2 text-center" key={index}>
                                <img
                                    src={`/assets/Certificate/${img}`}
                                    alt={`Certificate ${index + 1}`}
                                    className="img-fluid rounded shadow-sm certificate-img"
                                />
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}

export default About;
