import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/firebaseConfig';
import { useNavigate } from 'react-router-dom';

const NotificationsList = () => {
    const { currentUser } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const navigate = useNavigate();

    // ✅ Helper to clean HTML tags from body
    const stripHtml = (unsafe) => {
        return typeof unsafe === 'string'
            ? unsafe.replace(/<\/?[^>]+(>|$)/g, "")
            : '';
    };

    useEffect(() => {
        window.scrollTo(0, 0);

        if (!currentUser?.uid) return;

        const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'));
        const unsub = onSnapshot(q, (snapshot) => {
            const notifs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })).filter(notif =>
                notif.delivery?.some(entry => entry.uid === currentUser.uid)
            );
            setNotifications(notifs);
        });

        return () => unsub();
    }, [currentUser]);

    const handleNotificationClick = async (notif) => {
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

        navigate(`/notifications/${notif.id}`);
    };

    return (
        <div className="container py-5" style={{ maxWidth: '800px' }}>
            <h2 className="mb-4 fw-bold">🔔 All Notifications</h2>

            {notifications.map((notif) => {
                const userEntry = notif.delivery.find(entry => entry.uid === currentUser.uid);
                const seen = userEntry?.seen;
                const clicked = userEntry?.clicked;
                const timestamp = notif.createdAt?.seconds
                    ? new Date(notif.createdAt.seconds * 1000).toLocaleString()
                    : 'Now';

                // ✅ Clean and trim body safely
                const cleanBody = stripHtml(notif.body);
                const preview = cleanBody.slice(0, 140) + (cleanBody.length > 140 ? '…' : '');

                return (
                    <div
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        style={{
                            border: '1px solid #eee',
                            borderRadius: '8px',
                            padding: '16px',
                            marginBottom: '16px',
                            display: 'flex',
                            gap: '16px',
                            cursor: 'pointer',
                            textDecoration: 'none',
                            color: '#333',
                            backgroundColor: seen ? '#fff' : '#f9f9f9',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                        }}
                    >
                        {notif.imageUrl && (
                            <img
                                src={notif.imageUrl}
                                alt="notif"
                                style={{
                                    width: '80px',
                                    height: '80px',
                                    objectFit: 'cover',
                                    borderRadius: '8px'
                                }}
                            />
                        )}

                        <div style={{ flex: 1 }}>
                            <div className="d-flex justify-content-between align-items-center mb-1">
                                <strong className="fs-5">{notif.title}</strong>
                                <span className="text-muted small">{timestamp}</span>
                            </div>

                            <p className="mb-2 text-muted" style={{ fontSize: '0.95rem' }}>
                                {preview}
                            </p>

                            <div className="d-flex align-items-center gap-3 mt-1">
                                {seen ? (
                                    <span className="text-success">✅ Seen</span>
                                ) : (
                                    <span className="text-secondary">🕑 Unseen</span>
                                )}
                                {clicked && <span className="text-primary">👁 Clicked</span>}
                            </div>
                        </div>
                    </div>
                );
            })}

            {notifications.length === 0 && (
                <div className="alert alert-info">You have no notifications yet.</div>
            )}
        </div>
    );
};

export default NotificationsList;
