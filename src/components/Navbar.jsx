// src/components/Navbar.js
import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import "../styles/components/Navbar.css";
import { useTranslation } from "react-i18next";

const Navbar = () => {
    const { t, i18n } = useTranslation();
    const { currentUser, userProfile, loading } = useAuth();

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [profileName, setProfileName] = useState("User");
    const [avatarUrl, setAvatarUrl] = useState("/default-avatar.png");

    const location = useLocation();
    const navigate = useNavigate();
    const dropdownRef = useRef();

    // Load the Firestore user doc for name & avatar when auth is ready
    useEffect(() => {
        if (!currentUser) {
            setProfileName("User");
            setAvatarUrl("/default-avatar.png");
            return;
        }
        (async () => {
            try {
                const snap = await getDoc(doc(db, "users", currentUser.uid));
                if (snap.exists()) {
                    const data = snap.data();
                    const prof = data.profile || {};
                    const nameFromProfile = prof.firstName || prof.displayName;
                    const avatarFromProfile = prof.avatarUrl;
                    const nameFromRoot = data.firstName || data.displayName;
                    const avatarFromRoot = data.avatarUrl;

                    setProfileName(nameFromProfile || nameFromRoot || "User");
                    setAvatarUrl(avatarFromProfile || avatarFromRoot || "/default-avatar.png");
                }
            } catch (err) {
                console.error("Navbar profile load error:", err);
            }
        })();
    }, [currentUser]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await signOut(auth);
        navigate("/login");
    };

    const changeLanguage = (lng) => {
        localStorage.setItem("i18nextLng", lng);
        i18n.changeLanguage(lng);
        window.location.reload();
    };

    return (
        <>
            <nav className="main-navbar">
                <div className="navbar-container">
                    {/* Brand */}
                    <div className="brand">
                        <img src="/assets/logos/logo3.png" alt="Logo" />
                        <span>Asmaa Gadelrab</span>
                    </div>

                    {/* Navigation Links */}
                    <div className="navbar-links">
                        {location.pathname !== "/" && (
                            <Link to="/"><i className="fas fa-home me-1" /> {t("navbar.home")}</Link>
                        )}
                        <Link to="/about"><i className="fas fa-info-circle me-1" /> {t("navbar.about")}</Link>
                        <Link to="/programs"><i className="fas fa-table me-1" /> {t("navbar.programs")}</Link>
                        <Link to="/testimonials"><i className="fas fa-comment-dots me-1" /> {t("navbar.testimonials")}</Link>
                        <Link to="/contact"><i className="fas fa-envelope me-1" /> {t("navbar.contact")}</Link>
                    </div>

                    {/* Language Toggle & Auth Buttons */}
                    <div className="auth-buttons">
                        <div className="language-toggle">
                            <span className="lang-icon" onClick={() => changeLanguage("en")}>EN</span>
                            <span className="lang-icon" onClick={() => changeLanguage("ar")}>AR</span>
                        </div>

                        {loading ? null : !currentUser ? (
                            <>
                                <Link to="/login" className="btn-login"><i className="fas fa-sign-in-alt me-1" /> {t("navbar.login")}</Link>
                                <Link to="/signup" className="btn-signup"><i className="fas fa-user-plus me-1" /> {t("navbar.signup")}</Link>
                            </>
                        ) : (
                            <div className="user-dropdown" ref={dropdownRef}>
                                <button className="btn user-toggle" onClick={() => setDropdownOpen(!dropdownOpen)}>
                                    <img
                                        src={avatarUrl}
                                        alt="avatar"
                                        className="rounded-circle"
                                        style={{ width: "35px", height: "35px", objectFit: "cover", marginRight: "8px" }}
                                    />
                                    {profileName} <i className="fas fa-caret-down ms-1" />
                                </button>

                                {dropdownOpen && (
                                    <div className="dropdown-menu show">
                                        <Link to="/dashboard" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                                            <i className="fas fa-tachometer-alt me-2" /> Dashboard
                                        </Link>
                                        <Link to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                                            <i className="fas fa-user me-2" /> Profile
                                        </Link>
                                        <button className="dropdown-item" onClick={handleLogout}>
                                            <i className="fas fa-sign-out-alt me-2" /> Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Hamburger (mobile) */}
                <button className="hamburger-btn d-md-none" onClick={() => setDrawerOpen(true)}>☰</button>
            </nav>

            {/* Mobile Drawer */}
            {drawerOpen && (
                <div className="mobile-drawer">
                    <div className="drawer-header">
                        <button className="btn-close" onClick={() => setDrawerOpen(false)}>×</button>
                    </div>

                    {currentUser && (
                        <div className="drawer-user text-center mb-4">
                            <img src={avatarUrl} alt="avatar" className="drawer-avatar" />
                            <p className="drawer-name">{profileName}</p>
                        </div>
                    )}

                    <div className="drawer-body d-flex flex-column gap-3">
                        <Link to="/" className="drawer-link" onClick={() => setDrawerOpen(false)}>
                            <i className="fas fa-home me-2" /> {t("navbar.home")}
                        </Link>
                        <Link to="/about" className="drawer-link" onClick={() => setDrawerOpen(false)}>
                            <i className="fas fa-info-circle me-2" /> {t("navbar.about")}
                        </Link>
                        <Link to="/programs" className="drawer-link" onClick={() => setDrawerOpen(false)}>
                            <i className="fas fa-table me-2" /> {t("navbar.programs")}
                        </Link>
                        <Link to="/testimonials" className="drawer-link" onClick={() => setDrawerOpen(false)}>
                            <i className="fas fa-comment-dots me-2" /> {t("navbar.testimonials")}
                        </Link>
                        <Link to="/contact" className="drawer-link" onClick={() => setDrawerOpen(false)}>
                            <i className="fas fa-envelope me-2" /> {t("navbar.contact")}
                        </Link>

                        {currentUser ? (
                            <>
                                <Link to="/dashboard" className="drawer-link" onClick={() => setDrawerOpen(false)}>
                                    <i className="fas fa-tachometer-alt me-2" /> Dashboard
                                </Link>
                                <Link to="/profile" className="drawer-link" onClick={() => setDrawerOpen(false)}>
                                    <i className="fas fa-user me-2" /> Profile
                                </Link>
                                <button className="btn btn-danger mt-3" onClick={handleLogout}>
                                    <i className="fas fa-sign-out-alt me-2" /> Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="btn-login w-100 text-center" onClick={() => setDrawerOpen(false)}>
                                    <i className="fas fa-sign-in-alt me-2" /> {t("navbar.login")}
                                </Link>
                                <Link to="/signup" className="btn-signup w-100 text-center" onClick={() => setDrawerOpen(false)}>
                                    <i className="fas fa-user-plus me-2" /> {t("navbar.signup")}
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;
