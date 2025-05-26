// src/utils/ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * 🔒 ProtectedRoute
 * Checks if user is logged in, has completed their profile, and verified email
 */
const ProtectedRoute = ({ children }) => {
    const {
        currentUser,
        isEmailVerified,
        isProfileComplete,
        loading,
    } = useAuth();

    const location = useLocation();

    // ⏳ Wait until loading is complete
    if (loading) {
        return <div className="loading-screen">Loading...</div>;
    }

    // ⛔ Not logged in — redirect to login
    if (!currentUser) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // ⚠️ Profile incomplete — redirect to profile completion page
    if (!isProfileComplete()) {
        return <Navigate to="/signup/complete-profile" replace />;
    }

    // ⚠️ Email not verified — redirect to verification notice
    if (!isEmailVerified) {
        return <Navigate to="/signup/verify-email" replace />;
    }

    // ✅ All checks passed — allow access
    return children;
};

export default ProtectedRoute;
