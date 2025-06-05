import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import "../../styles/admin/AdminUsersReport.css";


export default function AdminUsersReport() {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [countryFilter, setCountryFilter] = useState("All");

    useEffect(() => {
        const fetchUsers = async () => {
            const snap = await getDocs(collection(db, "users"));
            const list = snap.docs.map(doc => {
                const data = doc.data();
                const profile = data.profile || {};
                const firstName = profile.firstName || "";
                const lastName = profile.lastName || "";
                const fullName = `${firstName} ${lastName}`.trim();

                return {
                    id: doc.id,
                    name: fullName || "🗑️ Deleted User",
                    email: profile.email || data.email || "N/A",
                    phone: data.phone || profile.phone || profile.whatsapp || "N/A",
                    country: profile.country || data.country || "N/A",
                    createdAt: data.createdAt?.toDate() || null,
                    createdLabel: data.createdAt
                        ? data.createdAt.toDate().toLocaleDateString()
                        : "Unknown",
                    fcmTokens: data.messaging?.fcmTokens || []
                };
            });

            list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

            setUsers(list);
            setFilteredUsers(list);
        };

        fetchUsers();
    }, []);

    useEffect(() => {
        const lowerSearch = searchTerm.toLowerCase();
        const filtered = users.filter(user => {
            const matchesSearch =
                user.name.toLowerCase().includes(lowerSearch) ||
                user.email.toLowerCase().includes(lowerSearch);
            const matchesCountry = countryFilter === "All" || user.country === countryFilter;
            return matchesSearch && matchesCountry;
        });

        setFilteredUsers(filtered);
    }, [searchTerm, countryFilter, users]);

    const uniqueCountries = ["All", ...new Set(users.map(u => u.country).filter(Boolean))];

    return (
        <div className="admin-users-report">
            <h2 className="mb-4">👥 All Registered Users</h2>

            <div className="user-filter-bar">
                <input
                    type="text"
                    className="form-control"
                    placeholder="🔍 Search by name or email..."
                    style={{ maxWidth: "300px" }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                    className="form-select"
                    style={{ maxWidth: "200px" }}
                    value={countryFilter}
                    onChange={(e) => setCountryFilter(e.target.value)}
                >
                    {uniqueCountries.map((country, idx) => (
                        <option key={idx} value={country}>
                            {country}
                        </option>
                    ))}
                </select>
                <button
                    className="btn btn-outline-secondary"
                    onClick={() => {
                        setSearchTerm("");
                        setCountryFilter("All");
                    }}
                >
                    🔄 Reset
                </button>
            </div>

            <div className="table-responsive">
                <table className="table table-bordered align-middle text-center">
                    <thead className="table-dark">
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Country</th>
                            <th>Account Created</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map(user => (
                                <React.Fragment key={user.id}>
                                    <tr>
                                        <td>{user.name}</td>
                                        <td className={user.email === "N/A" ? "text-muted fst-italic" : ""}>
                                            {user.email}
                                        </td>
                                        <td className={user.phone === "N/A" ? "text-muted fst-italic" : ""}>
                                            {user.phone}
                                        </td>
                                        <td className={user.country === "N/A" ? "text-muted fst-italic" : ""}>
                                            {user.country}
                                        </td>
                                        <td className={user.createdLabel === "Unknown" ? "text-muted fst-italic" : ""}>
                                            {user.createdLabel}
                                        </td>
                                    </tr>

                                    {/* FCM Device Tokens Table (if any) */}
                                    {user.fcmTokens.length > 0 && (
                                        <tr>
                                            <td colSpan="5">
                                                <div className="token-table-wrapper">
                                                    <table className="table token-table">
                                                        <thead>
                                                            <tr className="table-light">
                                                                <th>📱 Platform</th>
                                                                <th>🔐 Token (truncated)</th>
                                                                <th>🕒 Last Used</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {user.fcmTokens.map((t, idx) => (
                                                                <tr key={idx}>
                                                                    <td>{t.platform || "?"}</td>
                                                                    <td>{t.token?.slice(0, 12)}...</td>
                                                                    <td>
                                                                        {t.lastUsed
                                                                            ? new Date(t.lastUsed.seconds * 1000).toLocaleString()
                                                                            : "N/A"}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </td>
                                        </tr>

                                    )}
                                </React.Fragment>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-muted">
                                    No users found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
