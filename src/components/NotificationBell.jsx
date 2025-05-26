// src/components/NotificationBell.jsx
import React, { useEffect, useState, useRef } from 'react';
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    doc,
    updateDoc
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { useAuth } from '../context/AuthContext';
import '../styles/components/NotificationBell.css';
import { BsBell } from 'react-icons/bs'; // or HiOutlineBell, MdNotificationsNone


const NotificationBell = () => {
    const { currentUser } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [expandedId, setExpandedId] = useState(null);
    const dropdownRef = useRef();

    // 🔁 Real-time notification fetch
    useEffect(() => {
        if (!currentUser?.uid) return;

        const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const notifs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })).filter(notif =>
                notif.delivery?.some(entry => entry.uid === currentUser?.uid)
            );
            setNotifications(notifs);
        });

        return () => unsubscribe();
    }, [currentUser]);

    // ✅ Count unseen
    const unseenCount = notifications.filter(notif =>
        notif.delivery?.some(entry => entry.uid === currentUser?.uid && !entry.seen)
    ).length;

    const markAllAsSeen = async () => {
        if (!currentUser?.uid) return;

        const batch = notifications.filter(notif =>
            notif.delivery?.some(entry => entry.uid === currentUser.uid && !entry.seen)
        );

        for (const notif of batch) {
            const updatedDelivery = notif.delivery.map(entry =>
                entry.uid === currentUser.uid
                    ? { ...entry, seen: true, seenAt: new Date() }
                    : entry
            );

            await updateDoc(doc(db, 'notifications', notif.id), {
                delivery: updatedDelivery
            });
        }
    };

    const handleNotificationClick = async (notif) => {
        if (!currentUser?.uid) return;

        const updatedDelivery = notif.delivery.map(entry =>
            entry.uid === currentUser.uid
                ? {
                    ...entry,
                    clicked: true,
                    clickedAt: new Date(),
                    seen: true,
                    seenAt: new Date()
                }
                : entry
        );

        await updateDoc(doc(db, 'notifications', notif.id), {
            delivery: updatedDelivery
        });

        setExpandedId(expandedId === notif.id ? null : notif.id);
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
                setExpandedId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleDropdown = () => {
        if (!currentUser) return;
        setDropdownOpen(!dropdownOpen);
        if (!dropdownOpen) markAllAsSeen();
    };

    return (
        <div className="notification-bell-container" ref={dropdownRef}>
            <div className="bell-icon" onClick={toggleDropdown}>
                <BsBell size={22} />
                {currentUser && unseenCount > 0 && (
                    <span className="badge">{unseenCount}</span>
                )}
            </div>


            {currentUser && dropdownOpen && (
                <div className="dropdown notif-dropdown">
                    <h4 className="dropdown-header">Notifications</h4>

                    <div className="notif-scroll">
                        {notifications.slice(0, 5).map((notif) => {
                            const userEntry = notif.delivery?.find(entry => entry.uid === currentUser?.uid);
                            const isUnread = userEntry && !userEntry.seen;

                            return (
                                <div
                                    key={notif.id}
                                    className={`dropdown-item ${isUnread ? 'unread' : ''}`}
                                    onClick={async () => {
                                        const updatedDelivery = notif.delivery.map(entry =>
                                            entry.uid === currentUser.uid
                                                ? {
                                                    ...entry,
                                                    clicked: true,
                                                    clickedAt: new Date(),
                                                    seen: true,
                                                    seenAt: new Date()
                                                }
                                                : entry
                                        );

                                        await updateDoc(doc(db, 'notifications', notif.id), {
                                            delivery: updatedDelivery
                                        });

                                        // 🔁 Navigate to full detail page
                                        window.location.href = `/notifications/${notif.id}`;
                                    }}
                                >
                                    {notif.imageUrl && (
                                        <img
                                            src={notif.imageUrl}
                                            alt="preview"
                                            className="notif-thumbnail"
                                        />
                                    )}

                                    <div className="notif-content">
                                        <div className="notif-header">
                                            <span className="notif-title">{notif.title}</span>
                                            {isUnread && <span className="unread-dot" />}
                                        </div>

                                        <div className="notif-snippet">
                                            {notif.body?.slice(0, 80)}
                                            {notif.body?.length > 80 ? "…" : ""}
                                        </div>

                                        <div className="notif-time">
                                            {notif.createdAt?.seconds
                                                ? new Date(notif.createdAt.seconds * 1000).toLocaleString()
                                                : 'Now'}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {notifications.length === 0 && (
                            <div className="dropdown-item">No notifications yet.</div>
                        )}
                    </div>

                    <div className="see-all-btn-wrapper">
                        <button
                            className="see-all-btn"
                            onClick={() => window.location.href = '/notifications'}
                        >
                            See all notifications →
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default NotificationBell;
