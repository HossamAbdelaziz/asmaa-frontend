import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import moment from 'moment';
import { useAuth } from '../context/AuthContext'; // or your global auth context

const NotificationDetail = () => {
    const { id } = useParams(); // 📌 Extract notifId from URL
    const navigate = useNavigate();
    const { user } = useAuth(); // ✅ Logged-in user object

    const [notification, setNotification] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchNotification = async () => {
            try {
                const snap = await getDoc(doc(db, 'notifications', id));
                if (!snap.exists()) {
                    setError('Notification not found.');
                    return;
                }

                const data = snap.data();
                setNotification(data);

                // 🟢 Mark this user as "clicked"
                if (user?.uid) {
                    const deliveryIndex = data.delivery?.findIndex(d => d.uid === user.uid);
                    if (deliveryIndex !== -1 && !data.delivery[deliveryIndex].clicked) {
                        const deliveryUpdate = [...data.delivery];
                        deliveryUpdate[deliveryIndex] = {
                            ...deliveryUpdate[deliveryIndex],
                            clicked: true,
                            clickedAt: new Date()
                        };

                        await updateDoc(doc(db, 'notifications', id), {
                            delivery: deliveryUpdate
                        });
                    }
                }

            } catch (err) {
                console.error(err);
                setError('Failed to load notification.');
            } finally {
                setLoading(false);
            }
        };

        fetchNotification();
    }, [id, user]);

    if (loading) return <div className="container py-5">Loading...</div>;
    if (error) return <div className="container py-5 text-danger">{error}</div>;

    const { title, body, imageUrl, createdAt } = notification;

    return (
        <div className="container py-5" style={{ maxWidth: '700px' }}>
            <button className="btn btn-outline-secondary mb-4" onClick={() => navigate(-1)}>
                ⬅ Back
            </button>

            <h1 className="fw-bold mb-2">{title}</h1>
            <p className="text-muted mb-4">{moment(createdAt?.toDate?.()).format('MMMM D, YYYY • h:mm A')}</p>

            {imageUrl && (
                <img
                    src={imageUrl}
                    alt="Notification"
                    className="img-fluid rounded mb-4"
                    style={{ maxHeight: '350px', objectFit: 'cover' }}
                />
            )}

            <p className="fs-5 lh-lg">{body}</p>

            <div className="mt-5 text-center">
                <button className="btn btn-primary" onClick={() => navigate('/notifications')}>
                    🔔 View All Notifications
                </button>
            </div>
        </div>
    );
};

export default NotificationDetail;
