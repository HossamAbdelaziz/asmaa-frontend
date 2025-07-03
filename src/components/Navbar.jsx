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
import NotificationBell from '../components/NotificationBell'; // adjust path if needed
import { useAdmin } from '../context/AdminContext';


const Navbar = () => {
    const { t, i18n } = useTranslation();
    const { currentUser, userProfile, loading, avatarUrl, isAdmin } = useAuth();
    useEffect(() => {
  console.log("📱 Platform:", Capacitor.getPlatform());
  console.log("👤 currentUser:", currentUser);
  console.log("🔄 loading:", loading);
}, [currentUser, loading]);
    const profileName =
        userProfile?.profile?.firstName || userProfile?.firstName || "User";

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const location = useLocation();
    const navigate = useNavigate();
    const dropdownRef = useRef();
    const drawerRef = useRef();
    const [isAnimating, setIsAnimating] = useState(false);
    const [animateDrawerOpen, setAnimateDrawerOpen] = useState(false);

    const closeDrawer = () => {
        setAnimateDrawerOpen(false);
        setIsAnimating(true);
        setDrawerOpen(false);
    };


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

    // ✅ Close drawer when clicking outside of it
    useEffect(() => {
        const handleClickOutsideDrawer = (e) => {
            if (drawerRef.current && !drawerRef.current.contains(e.target)) {
                setDrawerOpen(false);
            }
        };

        if (drawerOpen) {
            document.addEventListener("mousedown", handleClickOutsideDrawer);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutsideDrawer);
        };
    }, [drawerOpen]);

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
                    <Link to="/" className="brand" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                        <img src="/assets/logos/logo3.png" alt="Logo" />
                        <span>Asmaa Gadelrab</span>
                    </Link>


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

                    {/* Language Toggle & Auth */}
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
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "/default-avatar.png";
                                        }}
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

                                        {isAdmin && (
                                            <Link to="/admin" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                                                <i className="fas fa-user-shield me-2" /> Admin Panel
                                            </Link>
                                        )}

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
                <div className="navbar-icons">
                    {currentUser && <NotificationBell />}
                    <button
                        className="hamburger-btn d-md-none"
                        onClick={() => {
                            setDrawerOpen(true);
                            setTimeout(() => setAnimateDrawerOpen(true), 10);
                        }}
                    >
                        ☰
                    </button>
                </div>


            </nav>

            {(drawerOpen || isAnimating) && (
                <div
                    className={`mobile-drawer ${drawerOpen && animateDrawerOpen ? "open" : drawerOpen ? "" : "closing"
                        }`}
                    ref={drawerRef}
                    onTransitionEnd={() => {
                        if (!drawerOpen) setIsAnimating(false);
                    }}
                >
                    <div className="drawer-header">
                        <button className="btn-close" onClick={closeDrawer}>×</button>
                    </div>

                    {currentUser && (
                        <div className="drawer-user text-center mb-4">
                            <img
                                src={avatarUrl}
                                alt="avatar"
                                className="drawer-avatar"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "/default-avatar.png";
                                }}
                            />

                            <p className="drawer-name">{profileName}</p>
                        </div>
                    )}

                    <div className="drawer-body d-flex flex-column gap-3">
                        <Link to="/" className="drawer-link" onClick={closeDrawer}>
                            <i className="fas fa-home me-2" /> {t("navbar.home")}
                        </Link>
                        <Link to="/about" className="drawer-link" onClick={closeDrawer}>
                            <i className="fas fa-info-circle me-2" /> {t("navbar.about")}
                        </Link>
                        <Link to="/programs" className="drawer-link" onClick={closeDrawer}>
                            <i className="fas fa-table me-2" /> {t("navbar.programs")}
                        </Link>
                        <Link to="/testimonials" className="drawer-link" onClick={closeDrawer}>
                            <i className="fas fa-comment-dots me-2" /> {t("navbar.testimonials")}
                        </Link>
                        <Link to="/contact" className="drawer-link" onClick={closeDrawer}>
                            <i className="fas fa-envelope me-2" /> {t("navbar.contact")}
                        </Link>

                        {!loading && currentUser ? (
                            <>
                                <Link to="/dashboard" className="drawer-link" onClick={closeDrawer}>
                                    <i className="fas fa-tachometer-alt me-2" /> Dashboard
                                </Link>

                                {isAdmin && (
                                    <Link to="/admin" className="drawer-link" onClick={closeDrawer}>
                                        <i className="fas fa-user-shield me-2" /> Admin Panel
                                    </Link>
                                )}

                                <Link to="/profile" className="drawer-link" onClick={closeDrawer}>
                                    <i className="fas fa-user me-2" /> Profile
                                </Link>

                                <button className="btn btn-danger mt-3" onClick={handleLogout}>
                                    <i className="fas fa-sign-out-alt me-2" /> Logout
                                </button>
                            </>
                        ) : !loading && (
                            <>
                                <Link to="/login" className="btn-login w-100 text-center" onClick={closeDrawer}>
                                    <i className="fas fa-sign-in-alt me-2" /> {t("navbar.login")}
                                </Link>
                                <Link to="/signup" className="btn-signup w-100 text-center" onClick={closeDrawer}>
                                    <i className="fas fa-user-plus me-2" /> {t("navbar.signup")}
                                </Link>
                            </>
                        )}
                        <div className="language-toggle text-center mt-4 mb-4">
                            <span className="lang-icon" onClick={() => changeLanguage('en')}>EN</span>
                            <span className="lang-icon" onClick={() => changeLanguage('ar')}>AR</span>
                        </div>


                    </div>
                </div>

            )}


        </>
    );
};

export default Navbar;
