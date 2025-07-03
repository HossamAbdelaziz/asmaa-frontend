// src/components/BookingForm.js

import React, { useEffect, useState } from "react";
import {
    addDoc,
    collection,
    serverTimestamp,
    query,
    where,
    getDocs,
    doc,
    getDoc,
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { getAuth } from "firebase/auth";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment-timezone";
import "../../styles/Dashboard/BookingForm.css";

function BookingForm({ programId, programTitle }) {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedTime, setSelectedTime] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [timezone, setTimezone] = useState("");
    const [availableTimes, setAvailableTimes] = useState([]);
    const [use24Hour, setUse24Hour] = useState(false);

    const auth = getAuth();

    useEffect(() => {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        setTimezone(tz);
    }, []);

    useEffect(() => {
        const loadTimes = async () => {
            const docRef = doc(db, "coach", "availability");
            const snapshot = await getDoc(docRef);
            if (!snapshot.exists()) return setAvailableTimes([]);

            const allAvailability = snapshot.data();
            const selectedDayKey = moment(selectedDate).format("YYYY-MM-DD");
            const slotsForUserDate = [];

            for (const coachDateKey in allAvailability) {
                const slotList = allAvailability[coachDateKey];

                for (const slot of slotList) {
                    const startTime = typeof slot === "string" ? slot : slot.start;
                    const endTime = typeof slot === "object" && slot.end ? slot.end : null;

                    const startInUserTZ = moment.tz(`${coachDateKey} ${startTime}`, "YYYY-MM-DD HH:mm", "America/Toronto").tz(timezone);
                    const endInUserTZ = endTime
                        ? moment.tz(`${coachDateKey} ${endTime}`, "YYYY-MM-DD HH:mm", "America/Toronto").tz(timezone)
                        : null;

                    const userSlotDate = startInUserTZ.format("YYYY-MM-DD");

                    if (userSlotDate === selectedDayKey) {
                        const display = endInUserTZ
                            ? `${startInUserTZ.format(use24Hour ? "HH:mm" : "h:mm A")} - ${endInUserTZ.format(use24Hour ? "HH:mm" : "h:mm A")}`
                            : startInUserTZ.format(use24Hour ? "HH:mm" : "h:mm A");

                        const slotKey = startInUserTZ.format("HH:mm");
                        slotsForUserDate.push({ display, slotKey });
                    }
                }
            }

            const dayStart = moment.tz(selectedDate, timezone).startOf("day").toDate();
            const dayEnd = moment.tz(selectedDate, timezone).endOf("day").toDate();

            const bookingsSnap = await getDocs(
                query(
                    collection(db, "booking"),
                    where("selectedDateTime", ">=", dayStart.toISOString()),
                    where("selectedDateTime", "<=", dayEnd.toISOString())
                )
            );

            const bookedTimes = bookingsSnap.docs.map((doc) =>
                moment(doc.data().selectedDateTime).tz(timezone).format("HH:mm")
            );

            const filtered = slotsForUserDate.filter(slot => !bookedTimes.includes(slot.slotKey));
            setAvailableTimes(filtered);
        };

        if (timezone) {
            loadTimes();
        }
    }, [selectedDate, timezone, use24Hour]);

    const handleBooking = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!auth.currentUser) {
            return setError("You must be logged in to book a session.");
        }

        if (!selectedDate || !selectedTime) {
            return setError("Please select both a date and a time.");
        }

        const timeRange = selectedTime.split(" - ");
        const selected24 = moment(timeRange[0], ["h:mm A", "HH:mm"]).format("HH:mm");
        const [hours, minutes] = selected24.split(":").map(Number);

        const fullDateTime = moment(selectedDate)
            .set({ hour: hours, minute: minutes, second: 0, millisecond: 0 })
            .toDate();

        const now = new Date();
        const diff = (fullDateTime - now) / (1000 * 60 * 60);
        if (diff < 48) {
            return setError("You must book at least 48 hours in advance.");
        }

        const startOfWeek = new Date(fullDateTime);
        startOfWeek.setDate(fullDateTime.getDate() - fullDateTime.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        const q = query(
            collection(db, "booking"),
            where("userId", "==", auth.currentUser.uid),
            where("selectedDateTime", ">=", startOfWeek.toISOString()),
            where("selectedDateTime", "<=", endOfWeek.toISOString())
        );

        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
            return setError("You already have a session booked this week. Please reschedule instead.");
        }

        try {
            const bookingData = {
                userId: auth.currentUser.uid,
                programId,
                programTitle,
                selectedDateTime: fullDateTime.toISOString(),
                timezone,
                createdAt: serverTimestamp(),
                status: "pending",
            };

            await addDoc(collection(db, "booking"), bookingData);
            setSuccess("✅ Booking submitted! You'll receive your Zoom link once confirmed.");
            setSelectedTime("");
        } catch (err) {
            console.error("❌ Booking error:", err);
            setError("Something went wrong. Please try again later.");
        }
    };

    return (
        <div className="booking-card">
            <h4 className="booking-title">📅 Book a Session</h4>
            <p className="booking-note">Sessions must be booked at least 48 hours in advance.</p>
            <p className="timezone-label">
                Your Timezone: <strong>{timezone}</strong>
            </p>

            <div className="mb-3">
                <label>
                    <input
                        type="checkbox"
                        checked={use24Hour}
                        onChange={() => setUse24Hour(prev => !prev)}
                        className="form-check-input me-2"
                    />
                    Show time in 24-hour format
                </label>
            </div>

            <form onSubmit={handleBooking}>
                <div className="booking-section-wrapper">
                    <div className="booking-section">
                        <label className="booking-label">Pick a Date</label>
                        <DatePicker
                            inline
                            selected={selectedDate}
                            onChange={(date) => setSelectedDate(date)}
                            minDate={new Date()}
                        />
                    </div>

                    <div className="booking-section">
                        <label className="booking-label">Pick a Time</label>
                        {availableTimes.length === 0 ? (
                            <p className="text-muted">No available times for this date.</p>
                        ) : (
                            <div className="time-grid">
                                {availableTimes.map((slot, index) => (
                                    <button
                                        type="button"
                                        key={index}
                                        className={`time-button ${selectedTime === slot.display ? "selected" : ""}`}
                                        onClick={() => setSelectedTime(slot.display)}
                                    >
                                        {slot.display}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {error && <div className="text-error mt-2">{error}</div>}
                {success && <div className="text-success mt-2">{success}</div>}

                <div className="booking-submit-wrapper">
                    <button type="submit" className="booking-submit">
                        Book Session
                    </button>
                </div>
            </form>
        </div>
    );
}

export default BookingForm;
