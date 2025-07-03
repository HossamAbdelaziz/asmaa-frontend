// src/pages/admin/AdminSetAvailability.jsx
import React, { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import moment from "moment-timezone";
import "../../styles/AdminSetAvailability.css";


const TIMEZONE = "America/Toronto";
const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

const AdminSetAvailability = () => {
    const [selectedDays, setSelectedDays] = useState([]);
    const [selectedHours, setSelectedHours] = useState([]);
    const [availability, setAvailability] = useState({});
    const [status, setStatus] = useState("");
    const [weekOffset, setWeekOffset] = useState(0);
    const [timeFormat, setTimeFormat] = useState("24h");

    const hours = Array.from({ length: 24 }, (_, i) => {
        const start = `${i < 10 ? "0" : ""}${i}:00`;
        const end = `${i + 1 < 10 ? "0" : ""}${i + 1}:00`;
        return { start, end };
    });

    const formatTime = (time) => {
        if (timeFormat === "24h") return time;
        return moment(time, "HH:mm").format("h:mm A");
    };

    useEffect(() => {
        const fetchAvailability = async () => {
            const snap = await getDoc(doc(db, "coach", "availability"));
            if (snap.exists()) setAvailability(snap.data());
        };
        fetchAvailability();
    }, []);

    const getDateKey = (dayName) => {
        const dayMap = {
            sunday: 0, monday: 1, tuesday: 2,
            wednesday: 3, thursday: 4, friday: 5, saturday: 6
        };
        const base = moment().tz(TIMEZONE).startOf("day");
        const todayIndex = base.day();
        const targetIndex = dayMap[dayName];
        const diff = (targetIndex + 7 - todayIndex) % 7 + (weekOffset * 7);
        return base.clone().add(diff, "days").format("YYYY-MM-DD");
    };

    const getWeekDates = () => {
        const weekDates = {};
        days.forEach(day => {
            weekDates[getDateKey(day)] = day;
        });
        return weekDates;
    };

    const toggleDay = (day) => {
        setSelectedDays(prev =>
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        );
    };

    const toggleHour = (hour) => {
        const key = hour.start;
        setSelectedHours(prev =>
            prev.find(h => h.start === key)
                ? prev.filter(h => h.start !== key)
                : [...prev, hour]
        );
    };

    const applySlots = () => {
        if (!selectedDays.length || !selectedHours.length) return;
        const updated = { ...availability };
        selectedDays.forEach(day => {
            const dateKey = getDateKey(day);
            if (!updated[dateKey]) updated[dateKey] = [];
            selectedHours.forEach(hour => {
                if (!updated[dateKey].find(h => h.start === hour.start)) {
                    updated[dateKey].push(hour);
                }
            });
        });
        setAvailability(updated);
        setSelectedDays([]);
        setSelectedHours([]);
        setStatus("✅ Slots added (not saved yet)");
    };

    const removeSlot = (dateKey, start) => {
        const updated = { ...availability };
        updated[dateKey] = updated[dateKey].filter(h => h.start !== start);
        setAvailability(updated);
    };

    const saveAvailability = async () => {
        try {
            await setDoc(doc(db, "coach", "availability"), availability);
            setStatus("✅ Availability saved successfully!");
        } catch (err) {
            console.error(err);
            setStatus("❌ Failed to save availability.");
        }
    };

    const weekDates = getWeekDates();

    return (
        <div className="container mt-4" style={{ maxWidth: "1100px" }}>
            <h2 className="mb-4">🕒 Set Coach Availability</h2>

            <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                    <button className="btn btn-outline-secondary btn-sm me-2" onClick={() => setWeekOffset(prev => prev - 1)}>⬅️ Previous Week</button>
                    <button className="btn btn-outline-secondary btn-sm" onClick={() => setWeekOffset(prev => prev + 1)}>➡️ Next Week</button>
                </div>
                <div>
                    <span className="me-2">🗓 Week Offset: {weekOffset >= 0 ? `+${weekOffset}` : weekOffset}</span>
                    <button className="btn btn-outline-dark btn-sm" onClick={() => setTimeFormat(prev => prev === "24h" ? "12h" : "24h")}>
                        Switch to {timeFormat === "24h" ? "12h" : "24h"}
                    </button>
                </div>
            </div>

            <div className="mb-4">
                <label className="fw-bold">1️⃣ Select Days</label>
                <div className="d-flex flex-wrap gap-2 mt-2">
                    {days.map(day => (
                        <button
                            key={day}
                            className={`btn btn-sm ${selectedDays.includes(day) ? "btn-primary" : "btn-outline-secondary"}`}
                            onClick={() => toggleDay(day)}
                        >
                            {day.charAt(0).toUpperCase() + day.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="mb-4">
                <label className="fw-bold">2️⃣ Select Hour Blocks ({timeFormat})</label>
                <div className="d-flex flex-wrap gap-2 mt-2">
                    {hours.map(h => (
                        <button
                            key={h.start}
                            className={`btn btn-outline-dark btn-sm ${selectedHours.find(sel => sel.start === h.start) ? "active" : ""}`}
                            onClick={() => toggleHour(h)}
                        >
                            {formatTime(h.start)} - {formatTime(h.end)}
                        </button>
                    ))}
                </div>
            </div>

            <button className="btn btn-success mb-5" onClick={applySlots}>
                ➕ Add Selected Slots to Days
            </button>

            <h4 className="mb-3">📅 Current Availability</h4>
            <div className="bg-light p-3 rounded shadow-sm mb-4">
                {Object.entries(weekDates)
                    .sort(([a], [b]) => new Date(a) - new Date(b))
                    .map(([dateKey, dayName]) => (
                        <div key={dateKey} className="mb-3 border-bottom pb-2">
                            <strong className="d-block mb-2">{moment(dateKey).tz(TIMEZONE).format("dddd, MMMM D, YYYY")}</strong>
                            <div className="d-flex flex-wrap gap-2">
                                {availability[dateKey]?.length ? (
                                    availability[dateKey].map(slot => (
                                        <div key={slot.start} className="badge bg-secondary p-2 d-flex align-items-center">
                                            <span>{formatTime(slot.start)} - {formatTime(slot.end)}</span>
                                            <button className="btn-close btn-close-white btn-sm ms-2" onClick={() => removeSlot(dateKey, slot.start)}></button>
                                        </div>
                                    ))
                                ) : (
                                    <span className="text-muted">No slots</span>
                                )}
                            </div>
                        </div>
                    ))}
            </div>

            <button className="btn btn-primary w-100" onClick={saveAvailability}>
                💾 Save All Changes
            </button>

            {status && <p className="mt-3">{status}</p>}
        </div>
    );
};

export default AdminSetAvailability;
