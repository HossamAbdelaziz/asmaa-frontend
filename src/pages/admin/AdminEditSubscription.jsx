import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

export default function AdminEditSubscription() {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUserId, setSelectedUserId] = useState("");
    const [subscription, setSubscription] = useState(null);
    const [status, setStatus] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            const usersSnap = await getDocs(collection(db, "users"));
            const programsSnap = await getDocs(collection(db, "programs"));

            const userList = usersSnap.docs.map(doc => {
                const data = doc.data();
                const profile = data.profile || {};
                return {
                    id: doc.id,
                    ...profile,
                    ...data,
                };
            });
            const programList = programsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            setUsers(userList);
            setFilteredUsers(userList);
            setPrograms(programList);
        };
        fetchData();
    }, []);

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

    const formatDateInput = (val) => {
        if (!val) return "";
        const dateObj = typeof val === "string" ? new Date(val) : new Date(val.seconds * 1000);
        return dateObj.toISOString().split("T")[0];
    };

    const calculateEndDate = (start, weeks) => {
        if (!start || !weeks) return "";
        const startDate = new Date(start);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + weeks * 7);
        return endDate.toISOString().split("T")[0];
    };

    const handleSelectUser = (userId) => {
        setSelectedUserId(userId);
        const user = users.find(u => u.id === userId);

        if (user?.subscription) {
            setSubscription({ ...user.subscription });
        } else {
            setSubscription({
                programId: "",
                programTitle: "",
                startDate: new Date().toISOString().split("T")[0],
                originalDuration: 0,
                bonusWeeks: 0,
                originalSessions: 0,
                bonusSessions: 0,
                status: "active"
            });
        }
    };

    const handleProgramChange = (e) => {
        const programId = e.target.value;
        const program = programs.find(p => p.id === programId);
        if (program) {
            setSubscription(prev => ({
                ...prev,
                programId: program.id,
                programTitle: program.title || "",
                originalDuration: program.durationWeeks || 0,
                originalSessions: program.sessions || 0,
                bonusWeeks: 0,
                bonusSessions: 0,
            }));
        }
    };

    const handleChange = (e) => {
        setSubscription({ ...subscription, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        if (!selectedUserId || !subscription) return;

        const originalDuration = parseInt(subscription.originalDuration);
        const originalSessions = parseInt(subscription.originalSessions);
        const bonusWeeks = parseInt(subscription.bonusWeeks) || 0;
        const bonusSessions = parseInt(subscription.bonusSessions) || 0;

        const totalWeeks = originalDuration + bonusWeeks;
        const sessionsLeft = originalSessions + bonusSessions;

        const start = new Date(subscription.startDate);
        const end = new Date(start);
        end.setDate(start.getDate() + totalWeeks * 7);
        const endDate = end.toISOString().split("T")[0];

        try {
            await updateDoc(doc(db, "users", selectedUserId), {
                subscription: {
                    programId: subscription.programId,
                    programTitle: subscription.programTitle,
                    startDate: subscription.startDate,
                    endDate,
                    status: "active",

                    originalDuration,
                    bonusWeeks,
                    totalWeeks,

                    originalSessions,
                    bonusSessions,
                    sessionsLeft,
                }
            });
            setStatus("✅ Subscription saved successfully!");
        } catch (err) {
            console.error(err);
            setStatus("❌ Error: " + err.message);
        }
    };

    return (
        <div className="container" style={{ maxWidth: "1000px" }}>
            <h2 className="mb-4">📦 Edit or Add Subscription</h2>

            <input
                className="form-control mb-3"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />

            <div className="table-responsive mb-4" style={{ maxHeight: "250px", overflowY: "auto" }}>
                <table className="table table-hover table-sm">
                    <thead className="table-light">
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Country</th>
                            <th>Select</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.id}>
                                <td>{user.firstName} {user.lastName}</td>
                                <td>{user.email}</td>
                                <td>{user.country}</td>
                                <td>
                                    <button className="btn btn-outline-primary btn-sm" onClick={() => handleSelectUser(user.id)}>
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

            {subscription && (
                <>
                    <div className="mb-3">
                        <label>Select Program</label>
                        <select
                            className="form-select"
                            value={subscription.programId || ""}
                            onChange={handleProgramChange}
                        >
                            <option value="">-- Choose Program --</option>
                            {programs.map(p => (
                                <option key={p.id} value={p.id}>{p.title}</option>
                            ))}
                        </select>
                    </div>

                    <div className="row g-3">
                        <div className="col-md-6">
                            <label>Program Title</label>
                            <input
                                className="form-control"
                                name="programTitle"
                                value={subscription.programTitle || ""}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="col-md-6">
                            <label>Start Date</label>
                            <input
                                type="date"
                                name="startDate"
                                className="form-control"
                                value={formatDateInput(subscription.startDate)}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="col-md-6">
                            <label>Original Weeks</label>
                            <input
                                type="number"
                                name="originalDuration"
                                className="form-control"
                                value={subscription.originalDuration || ""}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="col-md-6">
                            <label>Bonus Weeks</label>
                            <input
                                type="number"
                                name="bonusWeeks"
                                className="form-control"
                                value={subscription.bonusWeeks || 0}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="col-md-6">
                            <label>Original Sessions</label>
                            <input
                                type="number"
                                name="originalSessions"
                                className="form-control"
                                value={subscription.originalSessions || ""}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="col-md-6">
                            <label>Bonus Sessions</label>
                            <input
                                type="number"
                                name="bonusSessions"
                                className="form-control"
                                value={subscription.bonusSessions || 0}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="col-md-6">
                            <label>End Date (Auto)</label>
                            <input
                                type="text"
                                className="form-control"
                                value={calculateEndDate(subscription.startDate, parseInt(subscription.originalDuration) + parseInt(subscription.bonusWeeks || 0))}
                                readOnly
                            />
                        </div>
                    </div>

                    <button className="btn btn-success mt-4 w-100" onClick={handleSave}>
                        Save Subscription
                    </button>
                </>
            )}

            {status && <p className="mt-3">{status}</p>}
        </div>
    );
}
