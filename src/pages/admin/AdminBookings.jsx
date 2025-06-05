// src/pages/admin/AdminBookings.js
import React, { useEffect, useState } from "react";
import {
    collection,
    getDocs,
    updateDoc,
    deleteDoc,
    doc,
    getDoc,
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import axios from "axios";
import moment from "moment-timezone";
import "../../styles/admin/AdminBookings.css";


export default function AdminBookings() {
    // existing state setup
    const [bookings, setBookings] = useState([]);
    const [statusFilter, setStatusFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [actionStatus, setActionStatus] = useState("");
    const [rescheduleId, setRescheduleId] = useState(null);
    const [newDate, setNewDate] = useState("");
    const [newTime, setNewTime] = useState("");

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        setLoading(true);
        const snap = await getDocs(collection(db, "booking"));
        const allBookings = snap.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(booking => booking.selectedDateTime);

        const enriched = await Promise.all(
            allBookings.map(async booking => {
                if (!booking.userId) {
                    console.warn("❗ Booking missing userId:", booking.id);
                    return {
                        ...booking,
                        userName: "Unknown",
                        userEmail: "Unknown",
                    };
                }

                try {
                    const userSnap = await getDoc(doc(db, "users", booking.userId));
                    if (!userSnap.exists()) {
                        console.warn("❗ User not found for userId:", booking.userId);
                        return {
                            ...booking,
                            userName: "Unknown",
                            userEmail: "Unknown",
                        };
                    }

                    const userData = userSnap.data();
                    const profile = userData.profile || {};
                    const firstName = profile.firstName || "";
                    const lastName = profile.lastName || "";
                    const email = profile.email || "";

                    return {
                        ...booking,
                        userName: `${firstName} ${lastName}`.trim() || "Unknown",
                        userEmail: email || "Unknown",
                    };
                } catch (error) {
                    console.error("❌ Error fetching user data for:", booking.userId, error);
                    return {
                        ...booking,
                        userName: "Unknown",
                        userEmail: "Unknown",
                    };
                }
            })
        );

        setBookings(enriched);
        setLoading(false);
    };

    const handleApprove = async (booking) => {
        setActionStatus("Processing approval...");
        const BACKEND_BASE_URL = "https://zoom-backend-5mf0.onrender.com";

        try {
            const res = await axios.post(`${BACKEND_BASE_URL}/api/zoom/create-meeting`, {
                topic: booking.programTitle || "Coaching Session",
                start_time: booking.selectedDateTime,
                duration: 60,
                timezone: booking.timezone || "America/Toronto",
                userEmail: booking.userEmail,
                userName: booking.userName,
            });

            const zoomLink = res.data.zoomLink || "https://zoom.us/my/coachasmaa";

            await updateDoc(doc(db, "booking", booking.id), {
                status: "approved",
                zoomLink: zoomLink,
            });

            setActionStatus("✅ Booking approved & Zoom link sent.");
            fetchBookings();
        } catch (err) {
            console.error(err);
            setActionStatus("❌ Failed to approve booking.");
        }
    };

    const handleDecline = async (id) => {
        try {
            await updateDoc(doc(db, "booking", id), { status: "declined" });
            setActionStatus("❌ Booking declined.");
            fetchBookings();
        } catch (err) {
            console.error(err);
            setActionStatus("❌ Failed to decline booking.");
        }
    };

    const handleDelete = async (id) => {
        try {
            await updateDoc(doc(db, "booking", id), { status: "deleted" });
            setActionStatus("🗑️ Booking marked as deleted.");
            fetchBookings();
        } catch (err) {
            console.error(err);
            setActionStatus("❌ Failed to mark as deleted.");
        }
    };

    const handleReschedule = async (id) => {
        try {
            const newDateTime = moment(`${newDate} ${newTime}`, "YYYY-MM-DD HH:mm").toISOString();
            await updateDoc(doc(db, "booking", id), {
                selectedDateTime: newDateTime,
                status: "pending",
                zoomLink: "",
            });
            setActionStatus("🔄 Booking rescheduled.");
            setRescheduleId(null);
            setNewDate("");
            setNewTime("");
            fetchBookings();
        } catch (err) {
            console.error(err);
            setActionStatus("❌ Failed to reschedule booking.");
        }
    };

    const handleCopyZoom = (link) => {
        navigator.clipboard.writeText(link);
        setActionStatus("📋 Zoom link copied to clipboard.");
    };

    const filtered = bookings.filter(b => {
        const matchesStatus = statusFilter === "all" || b.status === statusFilter;
        const matchesSearch = [b.userName, b.userEmail].join(" ").toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    return (
        <div className="admin-bookings">

            <h2 className="mb-3">📅 Manage Bookings</h2>
            {/* Filter Controls */}
            <div className="booking-filters">
                <div className="col-md-4">
                    <label>Status Filter:</label>
                    <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="all">All Bookings</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="declined">Declined</option>
                        <option value="deleted">Deleted</option>
                    </select>
                </div>
                <div className="col-md-4">
                    <label>Search by Name or Email:</label>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search user..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Bookings Table */}
            {loading ? (
                <p>Loading bookings...</p>
            ) : filtered.length === 0 ? (
                <p>No bookings found.</p>
            ) : (
                <div className="table-responsive">
                    <table className="table table-striped align-middle">
                        <thead className="table-dark">
                            <tr>
                                <th>User</th>
                                <th>Email</th>
                                <th>Program</th>
                                <th>User Time</th>
                                <th>Coach Time</th>
                                <th>Status</th>
                                <th>Zoom</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((booking) => {
                                const userTime = booking.selectedDateTime
                                    ? moment(booking.selectedDateTime).tz(booking.userTimeZone || "America/Toronto").format("dddd, MMM D YYYY - h:mm A")
                                    : "N/A";

                                const coachTime = moment(booking.selectedDateTime)
                                    .tz("America/Toronto")
                                    .format("dddd, MMM D YYYY - h:mm A");

                                return (
                                    <tr key={booking.id}>
                                        <td>{booking.userName}</td>
                                        <td>{booking.userEmail}</td>
                                        <td>{booking.programTitle}</td>
                                        <td>{userTime}</td>
                                        <td>{coachTime}</td>
                                        <td>
                                            <span className={`badge bg-${booking.status === "approved"
                                                ? "success"
                                                : booking.status === "declined"
                                                    ? "danger"
                                                    : booking.status === "deleted"
                                                        ? "secondary"
                                                        : "warning"
                                                }`}>
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td>
                                            {booking.zoomLink ? (
                                                <button
                                                    className="btn btn-outline-secondary btn-sm"
                                                    onClick={() => handleCopyZoom(booking.zoomLink)}
                                                >
                                                    Copy Link
                                                </button>
                                            ) : (
                                                "-"
                                            )}
                                        </td>
                                        <td>
                                            {rescheduleId === booking.id ? (
                                                <div>
                                                    <input
                                                        type="date"
                                                        className="form-control form-control-sm mb-1"
                                                        value={newDate}
                                                        onChange={(e) => setNewDate(e.target.value)}
                                                    />
                                                    <input
                                                        type="time"
                                                        className="form-control form-control-sm mb-1"
                                                        value={newTime}
                                                        onChange={(e) => setNewTime(e.target.value)}
                                                    />
                                                    <button className="btn btn-sm btn-primary me-2" onClick={() => handleReschedule(booking.id)}>
                                                        Save
                                                    </button>
                                                    <button className="btn btn-sm btn-secondary" onClick={() => setRescheduleId(null)}>
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    {booking.status === "pending" && (
                                                        <>
                                                            <button
                                                                className="btn btn-success btn-sm me-2"
                                                                onClick={() => handleApprove(booking)}
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                className="btn btn-warning btn-sm me-2"
                                                                onClick={() => handleDecline(booking.id)}
                                                            >
                                                                Decline
                                                            </button>
                                                        </>
                                                    )}
                                                    <button
                                                        className="btn btn-sm btn-info me-2"
                                                        onClick={() => setRescheduleId(booking.id)}
                                                    >
                                                        Reschedule
                                                    </button>
                                                    <button
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() => handleDelete(booking.id)}
                                                    >
                                                        Delete
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {actionStatus && <div className="alert alert-info mt-3">{actionStatus}</div>}
        </div>
    );
}
