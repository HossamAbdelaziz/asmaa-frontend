// src/pages/Home.jsx

import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import "../styles/Home.css";
// import TestimonialsSection from "../components/TestimonialsSection";

import TestimonialsCarousel from "../components/TestimonialsCarousel";


function Home() {
    const { t, i18n } = useTranslation();

    return (
    <div className="home-wrapper">
        <div className="container home-container">
                <div className="row align-items-center">
                {/* Left: Hero Text */}
                <div className="col-md-6 home-hero-text">
                    <h1 className="display-4 fw-bold">{t("home.title")}</h1>
                    <p className="lead mt-3">{t("home.subtitle")}</p>

                    <div className="hero-button-group">
                        <Link to="/programs" className="button">{t("home.cta")}</Link>
                        <Link to="/questionnaire" className="button">{t("home.questionnaire")}</Link>
                    </div>
                </div>

                {/* Right: Hero Image */}
                <div className="col-md-6 text-center">
                    <img
                        src="/images/home/hero.jpg"
                        alt="Coach Asmaa"
                        className="img-fluid rounded shadow"
                    />
                </div>
            </div>

            {/* About Section (with language direction) */}
            <div className={i18n.language === "ar" ? "arabic-text" : "english-text"}>
                <section className="home-about-section py-5">
                    <div className="container">
                        <h3 className="fw-bold mb-3">{t("home.aboutTitle")}</h3>
                        <p className="lead text-muted">{t("home.aboutText")}</p>
                    </div>
                </section>
            </div>

            {/* About Coach Section */}
            <section className="about-coach-section container py-5">
                <div className="row align-items-center">
                    <div className="col-md-6 text-center mb-4 mb-md-0">
                        <img
                            src="/images/home/asmaabio.jpg"
                            alt="Coach Asmaa"
                            className="img-fluid rounded shadow"
                            style={{ maxWidth: "350px" }}
                        />
                    </div>
                    <div className="col-md-6 text-md-start text-center">
                        <h2 className="fw-bold mb-3">{t("home.aboutCoachTitle")}</h2>
                        <p className="text-muted">{t("home.aboutCoachShort")}</p>
                        <Link to="/about" className="button mt-3">{t("home.readMore")}</Link>

                    </div>
                </div>
            </section>

            {/* Testimonials Placeholder */}
            {/* <TestimonialsSection /> */}

            <TestimonialsCarousel />

        </div>
        </div>

);
}

export default Home;
