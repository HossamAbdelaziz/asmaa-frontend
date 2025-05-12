// src/pages/admin/AdminDeleteSubscriptions.js

import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

const AdminDeleteSubscriptions = () => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusMessage, setStatusMessage] = useState("");

    useEffect(() => {
        fetchUsersWithSubscriptions();
    }, []);

    const fetchUsersWithSubscriptions = async () => {
        const snap = await getDocs(collection(db, "users"));
        const filtered = snap.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(user => user.subscription);

        setUsers(filtered);
    };

    const handleDelete = async (user) => {
        const confirm = window.confirm(`Are you sure you want to delete ${user.profile?.firstName}'s subscription?`);
        if (!confirm) return;

        try {
            const userRef = doc(db, "users", user.id);

            // Archive the subscription before deleting
            await setDoc(doc(db, "deletedSubscriptions", `${user.id}_${Date.now()}`), {
                userId: user.id,
                email: user.profile?.email || "Unknown",
                name: `${user.profile?.firstName || ""} ${user.profile?.lastName || ""}`.trim(),
                deletedAt: serverTimestamp(),
                subscription: user.subscription,
            });

            // Delete subscription field only
            await updateDoc(userRef, {
                subscription: null
            });

            setStatusMessage(`✅ Subscription deleted for ${user.profile?.firstName}`);
            fetchUsersWithSubscriptions();
        } catch (err) {
            console.error("Error deleting subscription:", err);
            setStatusMessage("❌ Failed to delete subscription.");
        }
    };

    const filteredUsers = users.filter(user => {
        const name = `${user.profile?.firstName || ""} ${user.profile?.lastName || ""}`.toLowerCase();
        const email = user.profile?.email?.toLowerCase() || "";
        return name.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase());
    });

    return (
        <div className="container mt-4">
            <h2 className="mb-3">🧹 Manage Subscriptions</h2>

            <input
                type="text"
                className="form-control mb-4"
                placeholder="Search by name or email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />

            {statusMessage && <div className="alert alert-info">{statusMessage}</div>}

            <table className="table table-bordered table-hover">
                <thead className="table-dark">
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Program</th>
                        <th>Status</th>
                        <th>Start</th>
                        <th>End</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredUsers.map(user => {
                        const s = user.subscription || {};
                        return (
                            <tr key={user.id}>
                                <td>{user.profile?.firstName} {user.profile?.lastName}</td>
                                <td>{user.profile?.email}</td>
                                <td>{s.programTitle}</td>
                                <td>{s.status}</td>
                                <td>{s.startDate}</td>
                                <td>{s.endDate}</td>
                                <td>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => handleDelete(user)}
                                    >
                                        Delete Subscription
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default AdminDeleteSubscriptions;
