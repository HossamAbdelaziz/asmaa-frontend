// src/components/UserBookings.js
import React, { useEffect, useState } from "react";
import { db } from "../../firebase/firebaseConfig";
import {
    collection,
    query,
    where,
    onSnapshot,
    updateDoc,
    doc,
    deleteDoc,
    Timestamp,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

function UserBookings() {
    const [bookings, setBookings] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [newDateTime, setNewDateTime] = useState("");
    const [error, setError] = useState("");
    const [cancelError, setCancelError] = useState("");

    const auth = getAuth();

    // ✅ Load all bookings for the logged-in user
    useEffect(() => {
        const q = query(
            collection(db, "booking"),
            where("userId", "==", auth.currentUser.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setBookings(list);
        });

        return () => unsubscribe();
    }, [auth.currentUser.uid]);

    // ✅ Reschedule the session
    const handleReschedule = async (bookingId) => {
        const selected = new Date(newDateTime);
        const now = new Date();
        const diff = (selected - now) / (1000 * 60 * 60); // hours

        if (isNaN(selected.getTime()) || diff < 48) {
            return setError("You must select a valid time at least 48 hours from now.");
        }

        try {
            await updateDoc(doc(db, "booking", bookingId), {
                selectedDateTime: selected.toISOString(),
                status: "pending",
                rescheduledAt: Timestamp.now(),
            });
            setEditingId(null);
            setNewDateTime("");
            setError("");
        } catch (err) {
            console.error("❌ Reschedule error:", err);
            setError("Something went wrong while rescheduling.");
        }
    };

    // ✅ Cancel the session if more than 24 hours ahead
    const handleCancel = async (booking) => {
        const now = new Date();
        const sessionTime = new Date(booking.selectedDateTime);
        const hoursDiff = (sessionTime - now) / (1000 * 60 * 60);

        if (hoursDiff < 24) {
            return setCancelError("⚠️ Cannot cancel within 24 hours. Please contact the coach.");
        }

        try {
            await deleteDoc(doc(db, "booking", booking.id));
            setCancelError("");
        } catch (err) {
            console.error("❌ Cancel error:", err);
            setCancelError("Something went wrong while canceling the session.");
        }
    };

    return (
        <div className="card mt-4 p-3">
            <h5>📋 Your Booked Sessions</h5>

            {cancelError && <div className="alert alert-warning">{cancelError}</div>}

            {bookings.length === 0 ? (
                <p>No sessions booked yet.</p>
            ) : (
                bookings.map((b) => (
                    <div key={b.id} className="border rounded p-2 mb-3">
                        <p>
                            <strong>{b.programTitle}</strong><br />
                            📅 {new Date(b.selectedDateTime).toLocaleString()} ({b.timezone})<br />
                            Status: <span className="badge bg-info text-dark">{b.status}</span>
                        </p>

                        {editingId === b.id ? (
                            <>
                                <input
                                    type="datetime-local"
                                    className="form-control mb-2"
                                    value={newDateTime}
                                    onChange={(e) => setNewDateTime(e.target.value)}
                                />
                                {error && <div className="alert alert-danger py-1">{error}</div>}
                                <button
                                    className="btn btn-success btn-sm me-2"
                                    onClick={() => handleReschedule(b.id)}
                                >
                                    Save New Time
                                </button>
                                <button className="btn btn-secondary btn-sm" onClick={() => setEditingId(null)}>
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    className="btn btn-outline-primary btn-sm me-2"
                                    onClick={() => {
                                        setEditingId(b.id);
                                        setNewDateTime(new Date(b.selectedDateTime).toISOString().slice(0, 16));
                                    }}
                                >
                                    Reschedule
                                </button>
                                <button
                                    className="btn btn-outline-danger btn-sm"
                                    onClick={() => handleCancel(b)}
                                >
                                    Cancel Session
                                </button>
                            </>
                        )}
                    </div>
                ))
            )}
        </div>
    );
}

export default UserBookings;
