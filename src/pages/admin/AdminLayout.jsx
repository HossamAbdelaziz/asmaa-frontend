// src/pages/admin/AdminLayout.jsx
import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../styles/admin/AdminLayout.css";

const AdminLayout = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/admin-login");
    };

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <h3 className="sidebar-title">🛠 Admin Panel</h3>
                <nav className="admin-nav">
                    <NavLink to="/admin" end>🏠 Dashboard</NavLink>
                    <NavLink to="/admin/users">👥 Users Report</NavLink>
                    <NavLink to="/admin/add-user">➕ Add User</NavLink>
                    <NavLink to="/admin/edit-subscription">✏️ Edit Subscriptions</NavLink>
                    <NavLink to="/admin/add-weeks-sessions">⏳ Add Weeks/Sessions</NavLink>
                    <NavLink to="/admin/delete-subscription">🗑️ Delete Subscriptions</NavLink>
                    <NavLink to="/admin/bookings">📅 Manage Bookings</NavLink>
                    <NavLink to="/admin/availability">🕒 Set Availability</NavLink>
                    <NavLink to="/admin/calendar">🗓️ Coach Calendar</NavLink>
                    <NavLink to="/admin/questionnaire-results">🧠 Questionnaire</NavLink>
                    <NavLink to="/admin/manual-notifications">🔔 Manual Notifications</NavLink>
                </nav>
                <button className="logout-btn" onClick={handleLogout}>
                    Logout
                </button>
            </aside>

            <main className="admin-content">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
