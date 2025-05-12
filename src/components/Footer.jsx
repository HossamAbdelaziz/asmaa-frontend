// src/components/Footer.js

import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaInstagram, FaWhatsapp } from "react-icons/fa";
import "../styles/Footer.css";

function Footer() {
    const { t, i18n } = useTranslation();

    // ✅ Change language + save in localStorage
    const toggleLanguage = (lang) => {
        i18n.changeLanguage(lang);
        localStorage.setItem("language", lang);
    };

    return (
        <footer className="footer-section">
            <div className="footer-container">

                {/* ✅ Row 1: Logo + Name + Tagline */}
                <div className="footer-left">
                    <img src="/assets/logos/logo3.png" alt="Coach Logo" />
                    <div className="footer-name-tagline">
                        <span className="footer-logo-name">Asmaa Gadelrab</span>
                        <span className="footer-tagline">Certified Eating Disorder Recovery Coach</span>
                        <span className="footer-tagline">Asmaa.amr.gadelrab@gmail.com</span>
                        <span className="footer-tagline">Oakville,ON Canada</span>


                    </div>
                </div>

                {/* ✅ Row 2: Navigation Links (horizontally inline on desktop, stacked on mobile) */}
                <div className="footer-links">
                    <Link to="/">{t("navbar.home")}</Link>
                    <Link to="/about">{t("navbar.about")}</Link>
                    <Link to="/programs">{t("navbar.programs")}</Link>
                    <Link to="/contact">{t("navbar.contact")}</Link>
                </div>

                {/* ✅ Row 3: Social Icons + Language Selector */}
                <div className="footer-right">
                    {/* Social Media Icons */}
                    <div className="social-icons">
                        <a href="https://www.instagram.com/asmaa_recoverycoach?igsh=MWNmanlybGJ6cDNnbA%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer">
                            <FaInstagram />
                        </a>
                        <a href="https://wa.me/16476130760" target="_blank" rel="noopener noreferrer">
                            <FaWhatsapp />
                        </a>
                    </div>

                    {/* Language Toggle (EN / AR) */}
                    <div className="footer-lang">
                        🌍 {t("navbar.language")}:
                        <button onClick={() => toggleLanguage("en")}>EN</button>
                        <button onClick={() => toggleLanguage("ar")}>AR</button>
                    </div>
                </div>
            </div>

            {/* ✅ Footer Bottom Copyright */}
            <div className="footer-bottom">
                © 2025 NorthViaTech. All rights reserved.
            </div>
        </footer>
    );
}

export default Footer;
