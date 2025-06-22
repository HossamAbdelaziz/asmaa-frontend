// src/pages/admin/AdminSendNotification.js
import React, { useEffect, useState } from 'react';
import { db } from '../../../firebase/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import axios from 'axios';

const AdminSendNotification = () => {
    const [users, setUsers] = useState([]);
    const [targetType, setTargetType] = useState('single'); // single | multi | all
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [image, setImage] = useState(null); // optional
    const [status, setStatus] = useState('');

    // 🔄 Fetch users
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const snapshot = await getDocs(collection(db, 'users'));
                const userList = snapshot.docs
                    .map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }))
                    .filter(user => user.messaging?.fcmToken);

                setUsers(userList);
            } catch (err) {
                console.error('Error fetching users:', err);
            }
        };

        fetchUsers();
    }, []);

    // 🔥 Submit notification
    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('Sending...');

        const payload = {
            title,
            body,
            targetType,
            userTokens: [], // we'll populate below
        };

        if (targetType === 'all') {
            payload.userTokens = users.map(user => user.messaging.fcmToken);
        } else {
            payload.userTokens = selectedUsers;
        }

        try {
            await axios.post('https://asmaa-backend.onrender.com/api/admin/send-notification', payload);            if (response.data.success) {
                setStatus('✅ Notification sent!');
                setTitle('');
                setBody('');
                setSelectedUsers([]);
                setImage(null);
            } else {
                setStatus('❌ Failed to send notification.');
            }
        } catch (err) {
            console.error(err);
            setStatus('❌ Error sending notification.');
        }
    };

    // 📥 Handle image selection
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) setImage(file);
    };

    return (
        <div className="container py-4">
            <h2 className="mb-4">📢 Send Notification</h2>

            {/* 🔘 Target Type */}
            <div className="mb-3">
                <label className="form-label">Target Audience</label>
                <div className="form-check">
                    <input
                        className="form-check-input"
                        type="radio"
                        name="target"
                        value="single"
                        checked={targetType === 'single'}
                        onChange={() => setTargetType('single')}
                    />
                    <label className="form-check-label">Single User</label>
                </div>
                <div className="form-check">
                    <input
                        className="form-check-input"
                        type="radio"
                        name="target"
                        value="multi"
                        checked={targetType === 'multi'}
                        onChange={() => setTargetType('multi')}
                    />
                    <label className="form-check-label">Multiple Users</label>
                </div>
                <div className="form-check">
                    <input
                        className="form-check-input"
                        type="radio"
                        name="target"
                        value="all"
                        checked={targetType === 'all'}
                        onChange={() => setTargetType('all')}
                    />
                    <label className="form-check-label">All Users</label>
                </div>
            </div>

            {/* 👤 User Select */}
            {(targetType === 'single' || targetType === 'multi') && (
                <div className="mb-3">
                    <label className="form-label">Select User(s)</label>
                    <select
                        className="form-select"
                        multiple={targetType === 'multi'}
                        value={selectedUsers}
                        onChange={(e) =>
                            setSelectedUsers(
                                Array.from(e.target.selectedOptions, (option) => option.value)
                            )
                        }
                    >
                        {users.map(user => {
                            const name = `${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`.trim();
                            const email = user.email || 'No Email';
                            const country = user.profile?.country || 'Unknown';

                            return (
                                <option key={user.id} value={user.messaging.fcmToken}>
                                    {name} – {country} ({email})
                                </option>
                            );
                        })}
                    </select>
                </div>
            )}

            {/* 📝 Title */}
            <div className="mb-3">
                <label className="form-label">Title</label>
                <input
                    className="form-control"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
            </div>

            {/* 💬 Message */}
            <div className="mb-3">
                <label className="form-label">Message</label>
                <textarea
                    className="form-control"
                    rows="3"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    required
                />
            </div>

            {/* 🖼 Optional Image Upload */}
            <div className="mb-3">
                <label className="form-label">Optional Image</label>
                <input className="form-control" type="file" accept="image/*" onChange={handleImageChange} />
                {image && <p className="mt-2 text-muted">Selected: {image.name}</p>}
            </div>

            {/* 🚀 Submit */}
            <button type="submit" onClick={handleSubmit} className="btn btn-primary">
                Send Notification
            </button>

            {status && <div className="mt-3">{status}</div>}
        </div>
    );
};

export default AdminSendNotification;
