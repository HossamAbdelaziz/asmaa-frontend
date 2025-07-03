import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
// AdminCoachCalendar.jsx (or similar)
import "@fullcalendar/common/main.css";






export default function AdminCoachCalendar() {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        const fetchBookings = async () => {
            const snap = await getDocs(collection(db, "booking"));
            const all = await Promise.all(
                snap.docs.map(async (docSnap) => {
                    const data = docSnap.data();
                    const start = new Date(data.selectedDateTime);
                    const end = new Date(start);
                    end.setHours(start.getHours() + 1);

                    let title = data.programTitle || "Session";

                    if (data.userId) {
                        const userRef = doc(db, "users", data.userId);
                        const userSnap = await getDoc(userRef);
                        if (userSnap.exists()) {
                            const user = userSnap.data();
                            title = `${user.firstName || ""} ${user.lastName || ""} - ${title}`;
                        }
                    }

                    return {
                        title,
                        start,
                        end,
                        backgroundColor:
                            data.status === "approved"
                                ? "#28a745"
                                : data.status === "declined"
                                    ? "#dc3545"
                                    : "#ffc107",
                    };
                })
            );
            setEvents(all);
        };

        fetchBookings();
    }, []);

    return (
        <div className="container mt-4">
            <h2 className="mb-4">📅 Coach Session Calendar</h2>
            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                    left: "prev,next today",
                    center: "title",
                    right: "dayGridMonth,timeGridWeek,timeGridDay",
                }}
                events={events}
                height="80vh"
            />
        </div>
    );
}
