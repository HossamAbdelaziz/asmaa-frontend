import React, { useState, useRef, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../styles/admin/AdminLayout.css";

const AdminLayout = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const sidebarRef = useRef(null);

    const handleLogout = () => {
        logout();
        navigate("/admin-login");
    };

    // ✅ Close sidebar when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                sidebarRef.current &&
                !sidebarRef.current.contains(e.target) &&
                e.target.className !== "hamburger"
            ) {
                setSidebarOpen(false);
            }
        };

        if (isSidebarOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isSidebarOpen]);

    return (
        <div className="admin-layout">
            {/* Hamburger: visible only when sidebar is closed */}
            {!isSidebarOpen && (
                <button
                    className="hamburger"
                    onClick={() => setSidebarOpen(true)}
                    aria-label="Open sidebar"
                >
                    <div className="bar"></div>
                    <div className="bar"></div>
                    <div className="bar"></div>
                </button>
            )}


            <aside
                ref={sidebarRef}
                className={`admin-sidebar ${isSidebarOpen ? "open" : ""}`}
            >
                {/* Close Button inside sidebar (mobile only) */}
                <button
                    className="close-sidebar"
                    onClick={() => setSidebarOpen(false)}
                    aria-label="Close sidebar"
                >
                    ✕
                </button>

                <h3 className="sidebar-title">🛠 Admin Panel</h3>
                <nav className="admin-nav">
                    <NavLink to="/admin">🏠 Dashboard</NavLink>
                    <NavLink to="/admin/users-report">👥 Users Report</NavLink>
                    <NavLink to="/admin/add-user">➕ Add User</NavLink>
                    <NavLink to="/admin/edit-subscriptions">✏️ Edit Subscriptions</NavLink>
                    <NavLink to="/admin/add-weeks-sessions">⏳ Add Weeks/Sessions</NavLink>   {/* FIXED */}
                    <NavLink to="/admin/delete-subscription">🗑️ Delete Subscriptions</NavLink> {/* FIXED */}
                    <NavLink to="/admin/bookings">📅 Manage Bookings</NavLink>
                    <NavLink to="/admin/set-availability">🕒 Set Availability</NavLink>
                    <NavLink to="/admin/calendar">📆 Coach Calendar</NavLink>
                    <NavLink to="/admin/questionnaire-results">🧠 Questionnaire</NavLink>     {/* FIXED */}
                    <NavLink to="/admin/manual-notifications">🔔 Manual Notifications</NavLink>

                </nav>

                <button onClick={() => navigate("/dashboard")} className="switch-btn">
                    🧑‍💻 Switch to User View
                </button>
                <button onClick={handleLogout} className="logout-btn">
                    📕 Logout
                </button>
            </aside>

            <main className="admin-content">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
