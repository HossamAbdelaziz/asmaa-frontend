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

export default function AdminBookings() {
    const [bookings, setBookings] = useState([]);
    const [statusFilter, setStatusFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [actionStatus, setActionStatus] = useState("");

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        setLoading(true);
        const snap = await getDocs(collection(db, "booking"));
        const allBookings = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const enriched = await Promise.all(
            allBookings.map(async booking => {
                const userSnap = await getDoc(doc(db, "users", booking.userId));
                const userData = userSnap.exists() ? userSnap.data() : {};
                return {
                    ...booking,
                    userName: userData.firstName + " " + userData.lastName || "Unknown",
                    userEmail: userData.email || "Unknown",
                    userTimeZone: booking.timezone || "America/New_York",
                };
            })
        );

        setBookings(enriched);
        setLoading(false);
    };

    const handleApprove = async (booking) => {
        setActionStatus("Processing approval...");
        try {
            const res = await axios.post("https://zoom-backend-5mf0.onrender.com/api/zoom/create-meeting", {
                email: booking.userEmail,
                name: booking.userName,
                dateTime: booking.selectedDateTime,
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
            await updateDoc(doc(db, "booking", id), { status: "deleted" }); // use status instead of hard delete
            setActionStatus("🗑️ Booking marked as deleted.");
            fetchBookings();
        } catch (err) {
            console.error(err);
            setActionStatus("❌ Failed to mark as deleted.");
        }
    };

    const handleCopyZoom = (link) => {
        navigator.clipboard.writeText(link);
        setActionStatus("📋 Zoom link copied to clipboard.");
    };

    const filtered = bookings.filter(b => {
        const matchesStatus = statusFilter === "all" || b.status === statusFilter;
        const matchesSearch = [b.userName, b.userEmail]
            .join(" ")
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    return (
        <div className="container mt-4">
            <h2 className="mb-3">📅 Manage Bookings</h2>

            <div className="row g-3 mb-4">
                <div className="col-md-4">
                    <label>Status Filter:</label>
                    <select
                        className="form-select"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
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
                            {filtered.map(booking => {
                                const userTime = moment(booking.selectedDateTime)
                                    .tz(booking.userTimeZone)
                                    .format("dddd, MMM D YYYY - h:mm A");
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
                                                        : "warning"}`}>
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
                                            ) : "-"}
                                        </td>
                                        <td>
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
                                                className="btn btn-danger btn-sm"
                                                onClick={() => handleDelete(booking.id)}
                                            >
                                                Delete
                                            </button>
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
