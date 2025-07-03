import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

export default function AdminAddWeeksSessions() {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [bonusWeeks, setBonusWeeks] = useState(0);
    const [bonusSessions, setBonusSessions] = useState(0);
    const [status, setStatus] = useState("");

    // 🔄 Load users
    useEffect(() => {
        const fetchUsers = async () => {
            const snap = await getDocs(collection(db, "users"));
            const list = snap.docs.map(doc => {
                const data = doc.data();
                const profile = data.profile || {};
                return {
                    id: doc.id,
                    ...profile,  // spreads firstName, lastName, email, etc.
                    ...data,     // includes root fields like subscription, phone, createdAt
                };
            });

            setUsers(list);
            setFilteredUsers(list);
        };
        fetchUsers();
    }, []);

    // 🔍 Filter users
    useEffect(() => {
        const term = searchTerm.toLowerCase();
        const filtered = users.filter(
            user =>
                user.firstName?.toLowerCase().includes(term) ||
                user.lastName?.toLowerCase().includes(term) ||
                user.email?.toLowerCase().includes(term)
        );
        setFilteredUsers(filtered);
    }, [searchTerm, users]);

    const handleSelectUser = (userId) => {
        const user = users.find(u => u.id === userId);
        setSelectedUser(user);
        setBonusWeeks(0);
        setBonusSessions(0);
        setStatus("");
    };

    // ➕ Add Bonus Weeks
    const handleAddWeeks = async () => {
        if (!selectedUser?.subscription) {
            setStatus("❌ No subscription found for this user.");
            return;
        }

        const current = selectedUser.subscription;
        const newBonusWeeks = parseInt(bonusWeeks);

        if (!newBonusWeeks || newBonusWeeks <= 0) {
            setStatus("⚠️ Please enter a valid number of bonus weeks.");
            return;
        }

        const original = current.originalDuration || 0;
        const currentBonus = current.bonusWeeks || 0;
        const updatedBonusWeeks = currentBonus + newBonusWeeks;
        const totalWeeks = original + updatedBonusWeeks;

        try {
            await updateDoc(doc(db, "users", selectedUser.id), {
                "subscription.bonusWeeks": updatedBonusWeeks,
                "subscription.totalWeeks": totalWeeks,
            });
            setStatus(`✅ Added ${newBonusWeeks} bonus week(s)!`);
            setBonusWeeks(0);
        } catch (err) {
            console.error(err);
            setStatus("❌ Failed to update weeks: " + err.message);
        }
    };

    // ➕ Add Bonus Sessions
    const handleAddSessions = async () => {
        if (!selectedUser?.subscription) {
            setStatus("❌ No subscription found for this user.");
            return;
        }

        const current = selectedUser.subscription;
        const newBonusSessions = parseInt(bonusSessions);

        if (!newBonusSessions || newBonusSessions <= 0) {
            setStatus("⚠️ Please enter a valid number of bonus sessions.");
            return;
        }

        const currentBonus = current.bonusSessions || 0;
        const updatedBonusSessions = currentBonus + newBonusSessions;

        const currentLeft = current.sessionsLeft || 0;
        const updatedSessionsLeft = currentLeft + newBonusSessions;

        try {
            await updateDoc(doc(db, "users", selectedUser.id), {
                "subscription.bonusSessions": updatedBonusSessions,
                "subscription.sessionsLeft": updatedSessionsLeft,
            });
            setStatus(`✅ Added ${newBonusSessions} bonus session(s)!`);
            setBonusSessions(0);
        } catch (err) {
            console.error(err);
            setStatus("❌ Failed to update sessions: " + err.message);
        }
    };

    return (
        <div className="container" style={{ maxWidth: "1000px" }}>
            <h2 className="mb-4">➕ Add Weeks / Sessions</h2>

            {/* 🔍 Search */}
            <input
                className="form-control mb-3"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />

            {/* 👤 User Table */}
            <div className="table-responsive mb-4" style={{ maxHeight: "250px", overflowY: "auto" }}>
                <table className="table table-hover table-sm">
                    <thead className="table-light">
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Program</th>
                            <th>Select</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.id}>
                                <td>{user.firstName} {user.lastName}</td>
                                <td>{user.email}</td>
                                <td>{user.subscription?.programTitle || "None"}</td>
                                <td>
                                    <button
                                        className="btn btn-outline-primary btn-sm"
                                        onClick={() => handleSelectUser(user.id)}
                                    >
                                        Select
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredUsers.length === 0 && (
                            <tr>
                                <td colSpan="4" className="text-center text-muted">No users found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* ➕ Add Controls */}
            {selectedUser && selectedUser.subscription && (
                <>
                    <div className="row g-3 mb-4">
                        <div className="col-md-6">
                            <label>Bonus Weeks</label>
                            <input
                                type="number"
                                className="form-control"
                                value={bonusWeeks}
                                onChange={(e) => setBonusWeeks(e.target.value)}
                            />
                            <button className="btn btn-success mt-2 w-100" onClick={handleAddWeeks}>
                                Add Bonus Weeks
                            </button>
                        </div>

                        <div className="col-md-6">
                            <label>Bonus Sessions</label>
                            <input
                                type="number"
                                className="form-control"
                                value={bonusSessions}
                                onChange={(e) => setBonusSessions(e.target.value)}
                            />
                            <button className="btn btn-success mt-2 w-100" onClick={handleAddSessions}>
                                Add Bonus Sessions
                            </button>
                        </div>
                    </div>
                </>
            )}

            {selectedUser && !selectedUser.subscription && (
                <p className="text-danger">This user does not have a subscription.</p>
            )}

            {status && <p className="mt-3">{status}</p>}
        </div>
    );
}
