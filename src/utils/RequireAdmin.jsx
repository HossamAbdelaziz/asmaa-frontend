import React from "react";
import { Navigate } from "react-router-dom";
import { useAdmin } from "../context/AdminContext";

export default function RequireAdmin({ children }) {
    const { isAdmin, loading } = useAdmin();

    if (loading) return <div className="text-center p-5">🔐 Checking admin access...</div>;

    if (!isAdmin) return <Navigate to="/" replace />;

    return children;
}
