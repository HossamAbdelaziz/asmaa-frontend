// src/pages/admin/adminNotification/SendNotificationTab.js
import React, { useEffect, useState } from 'react';
import { db, storage } from '../../../firebase/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const SendNotificationTab = () => {
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imageUrl, setImageUrl] = useState(null);
    const [uploadedPath, setUploadedPath] = useState('');
    const [uploading, setUploading] = useState(false);
    const [status, setStatus] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const usersPerPage = 10;

    const filteredUsers = users.filter(user => {
        const name = `${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`.toLowerCase();
        const email = (user.profile?.email || '').toLowerCase();
        return name.includes(searchQuery) || email.includes(searchQuery);
    });
    const paginatedUsers = filteredUsers.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const snapshot = await getDocs(collection(db, 'users'));
                const userList = snapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter(user => user.messaging?.fcmTokens?.length);
                setUsers(userList);
            } catch (err) {
                console.error('❌ Error fetching users:', err);
            }
        };
        fetchUsers();
    }, []);

    const handleSelectUser = (user) => {
        if (selectedUsers.some(u => u.id === user.id)) {
            setSelectedUsers(prev => prev.filter(u => u.id !== user.id));
        } else {
            setSelectedUsers(prev => [...prev, user]);
        }
    };

    const handleSelectAll = () => {
        const currentPageUsers = paginatedUsers.filter(
            user => !selectedUsers.some(u => u.id === user.id)
        );

        if (selectAll) {
            setSelectedUsers(prev =>
                prev.filter(u => !paginatedUsers.some(pu => pu.id === u.id))
            );
        } else {
            setSelectedUsers(prev => [...prev, ...currentPageUsers]);
        }

        setSelectAll(!selectAll);
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setImageFile(file);
        setUploading(true);
        setStatus('Uploading image...');

        const filename = `FCMImages/${uuidv4()}-${file.name}`;
        const storageRef = ref(storage, filename);

        try {
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);
            setImageUrl(url);
            setUploadedPath(filename);
            setStatus('✅ Image uploaded successfully');
        } catch (err) {
            console.error('❌ Image upload failed:', err);
            setStatus('❌ Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const removeImage = async () => {
        if (!uploadedPath) return;

        const storageRef = ref(storage, uploadedPath);

        try {
            await deleteObject(storageRef);
            setImageFile(null);
            setImageUrl(null);
            setUploadedPath('');
            setStatus('🗑️ Image removed successfully');
        } catch (err) {
            console.error('❌ Failed to remove image:', err);
            setStatus('⚠️ Failed to delete image from storage');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedUsers.length) {
            setStatus('❌ Please select at least one user');
            return;
        }

        setStatus('Sending...');

        const cleanBody = typeof body === 'string'
            ? body.trim().replace(/<\/?[^>]+(>|$)/g, '') // remove HTML tags
            : String(body).trim().replace(/<\/?[^>]+(>|$)/g, '');

        const payload = {
            title: title.trim(),
            body: cleanBody,
            imageUrl: imageUrl || null,
            userIds: selectedUsers.map(user => user.id),
        };



        try {
            console.log("🚀 Sending payload:", payload);

            const response = await axios.post('http://localhost:5001/api/admin/send-notification', payload);
            if (response.data.success) {
                setStatus('✅ Notification sent!');
                resetForm();
            } else {
                setStatus('❌ Failed to send notification.');
            }
        } catch (err) {
            console.error(err);
            setStatus('❌ Error sending notification.');
        }
    };

    const resetForm = () => {
        setTitle('');
        setBody('');
        setSelectedUsers([]);
        setSelectAll(false);
        setImageFile(null);
        setImageUrl(null);
        setUploadedPath('');
        setSearchQuery('');
        setCurrentPage(1);
    };

    return (
        <div className="card p-4 shadow-sm">
            <h4 className="mb-4">📢 Send Notification</h4>

            <input
                type="text"
                className="form-control mb-3"
                placeholder="Search by name or email"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
            />

            {selectedUsers.length > 0 && (
                <div className="alert alert-info d-flex flex-wrap align-items-center">
                    <strong className="me-2">Selected Users:</strong>
                    {selectedUsers.map((user, index) => {
                        const name = `${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`.trim();
                        return (
                            <span key={user.id} className="me-3 mb-1">
                                {name}{index < selectedUsers.length - 1 ? ',' : ''}
                            </span>
                        );
                    })}
                </div>
            )}



            <table className="table table-hover">
                <thead>
                    <tr>
                        <th>
                            <input
                                type="checkbox"
                                checked={paginatedUsers.every(user => selectedUsers.some(u => u.id === user.id))}
                                onChange={handleSelectAll}
                            />
                        </th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Country</th>
                    </tr>
                </thead>
                <tbody>
                    {paginatedUsers.map(user => {
                        const name = `${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`.trim();
                        const email = user.profile?.email || 'No Email';
                        const country = user.profile?.country || 'Unknown Country';

                        return (
                            <tr key={user.id}>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={selectedUsers.some(u => u.id === user.id)}
                                        onChange={() => handleSelectUser(user)}
                                    />
                                </td>
                                <td>{name}</td>
                                <td>{email}</td>
                                <td>{country}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            <div className="d-flex justify-content-between align-items-center mb-4">
                <button
                    className="btn btn-outline-secondary"
                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                >
                    ⬅ Previous
                </button>
                <span>Page {currentPage} of {Math.ceil(filteredUsers.length / usersPerPage)}</span>
                <button
                    className="btn btn-outline-secondary"
                    onClick={() => setCurrentPage(p => Math.min(p + 1, Math.ceil(filteredUsers.length / usersPerPage)))}
                    disabled={currentPage === Math.ceil(filteredUsers.length / usersPerPage)}
                >
                    Next ➡
                </button>
            </div>

            <div className="mb-3">
                <label className="form-label">Title</label>
                <input
                    type="text"
                    className="form-control"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
            </div>

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

            <div className="mb-3">
                <label className="form-label">Optional Image</label>
                <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={uploading}
                />
                {imageUrl && (
                    <div className="mt-2 position-relative" style={{ maxWidth: '200px' }}>
                        <img src={imageUrl} alt="Uploaded" className="img-thumbnail w-100" />
                        <button className="btn btn-sm btn-danger mt-2" onClick={removeImage}>
                            🗑 Remove Image
                        </button>
                    </div>
                )}
            </div>

            <button className="btn btn-success" onClick={handleSubmit} disabled={uploading || !selectedUsers.length}>
                {uploading ? 'Uploading Image...' : 'Send Notification'}
            </button>

            {status && <div className="mt-3 fw-bold">{status}</div>}
        </div>
    );
};

export default SendNotificationTab;
