// src/pages/Profile.js
import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { db, storage } from "../firebase/firebaseConfig";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import i18n from "../i18n";
import {
    updatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider,
    deleteUser
} from "firebase/auth";
import AvatarCropModal from "../components/AvatarCropModal";
import "../styles/Profile.css";


const Profile = () => {
    const { currentUser, refreshUserProfile } = useAuth();
    const topRef = useRef(null);

    const [profile, setProfile] = useState({
        firstName: "",
        lastName: "",
        email: "",
        whatsapp: "",
        country: "",
        age: "",
        language: "en",
        avatarUrl: "",
        remindersEnabled: true,
        programStatus: ""
    });
    const [avatarFile, setAvatarFile] = useState(null);
    const [successMsg, setSuccessMsg] = useState("");
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [showPasswords, setShowPasswords] = useState(false);
    const [deletePassword, setDeletePassword] = useState("");

    const [showCropModal, setShowCropModal] = useState(false);
    const [rawImagePreview, setRawImagePreview] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            if (!currentUser) return;
            const userRef = doc(db, "users", currentUser.uid);
            const snap = await getDoc(userRef);

            if (snap.exists()) {
                const data = snap.data();
                const profileData = data.profile || {};
                const rootFallback = {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    whatsapp: data.whatsapp,
                    country: data.country,
                    age: data.age,
                    language: data.language,
                    avatarUrl: data.avatarUrl
                };
                const subscription = data.subscription || {};

                setProfile((prev) => ({
                    ...prev,
                    ...rootFallback,
                    ...profileData,
                    email: currentUser.email,
                    programStatus: subscription?.status || "No Program"
                }));
            }
        };

        fetchProfile();
    }, [currentUser]);

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleAvatarChange = (e) => {
        if (e.target.files[0]) {
            const file = e.target.files[0];
            const previewUrl = URL.createObjectURL(file);
            setRawImagePreview(previewUrl);
            setShowCropModal(true);
        }
    };

    const handleCroppedImage = (blob) => {
        const file = new File([blob], "cropped.jpg", { type: "image/jpeg" });
        setAvatarFile(file);
        setShowCropModal(false);
        URL.revokeObjectURL(rawImagePreview);
    };

    const handleLanguageChange = (lang) => {
        setProfile({ ...profile, language: lang });
        i18n.changeLanguage(lang);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        setSuccessMsg("");

        try {
            let avatarUrl = profile.avatarUrl;
            if (avatarFile) {
                const storageRef = ref(storage, `avatars/${currentUser.uid}/profile.jpg`);
                await uploadBytes(storageRef, avatarFile);
                avatarUrl = await getDownloadURL(storageRef);
            }

            const userRef = doc(db, "users", currentUser.uid);
            await updateDoc(userRef, {
                profile: {
                    ...profile,
                    avatarUrl
                }
            });

            setSuccessMsg("Profile updated successfully.");
            await refreshUserProfile(); // <-- 🔄 Update context immediately
            topRef.current?.scrollIntoView({ behavior: "smooth" });

        } catch (err) {
            console.error(err);
            setError("Failed to save profile.");
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async () => {
        setError("");
        setSuccessMsg("");

        if (!oldPassword || !newPassword || !confirmNewPassword) {
            setError("Please fill in all password fields.");
            return;
        }

        if (newPassword !== confirmNewPassword) {
            setError("New passwords do not match.");
            return;
        }

        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        try {
            const credential = EmailAuthProvider.credential(currentUser.email, oldPassword);
            await reauthenticateWithCredential(currentUser, credential);
            await updatePassword(currentUser, newPassword);
            setSuccessMsg("Password updated successfully.");
            setOldPassword("");
            setNewPassword("");
            setConfirmNewPassword("");
            topRef.current?.scrollIntoView({ behavior: "smooth" });
        } catch (err) {
            setError("Failed to change password. Old password may be incorrect.");
        }
    };

    const handleDeleteAccount = async () => {
        setError("");
        setSuccessMsg("");

        if (!deletePassword) {
            setError("Please enter your password to confirm deletion.");
            return;
        }

        try {
            const credential = EmailAuthProvider.credential(currentUser.email, deletePassword);
            await reauthenticateWithCredential(currentUser, credential);
            await deleteDoc(doc(db, "users", currentUser.uid));
            await deleteUser(currentUser);
            alert("Your account has been deleted.");
            window.location.href = "/";
        } catch (err) {
            console.error(err);
            setError("Account deletion failed. Please check your password or try again.");
        }
    };

    return (
        <div className="container mt-5" style={{ maxWidth: "700px" }}>
            <div ref={topRef}></div>
            <h3 className="text-center mb-4">My Profile</h3>
            {successMsg && <div className="alert alert-success">{successMsg}</div>}
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="text-center mb-4">
                <img
                    src={avatarFile ? URL.createObjectURL(avatarFile) : profile.avatarUrl || "/default-avatar.png"}
                    onError={(e) => {
                        console.warn("Broken avatar URL:", profile.avatarUrl);
                        e.target.src = "/default-avatar.png";
                    }}
                    alt="Profile Avatar"
                    className="rounded-circle shadow"
                    style={{ width: "130px", height: "130px", objectFit: "cover", border: "4px solid #ccc" }}
                />

                <div className="mt-2">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="form-control"
                        style={{ maxWidth: "300px", margin: "0 auto" }}
                    />
                    <small className="text-muted">Click to upload a new profile picture</small>
                </div>
            </div>

            {showCropModal && (
                <AvatarCropModal
                    image={rawImagePreview}
                    onClose={() => setShowCropModal(false)}
                    onCropComplete={handleCroppedImage}
                />
            )}
            <form onSubmit={handleSave}>
                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label>First Name</label>
                        <input name="firstName" className="form-control" value={profile.firstName} onChange={handleChange} required />
                    </div>
                    <div className="col-md-6 mb-3">
                        <label>Last Name</label>
                        <input name="lastName" className="form-control" value={profile.lastName} onChange={handleChange} required />
                    </div>
                    <div className="col-md-6 mb-3">
                        <label>Email</label>
                        <input className="form-control" value={profile.email} readOnly disabled />
                    </div>
                    <div className="col-md-6 mb-3">
                        <label>WhatsApp</label>
                        <input name="whatsapp" className="form-control" value={profile.whatsapp} onChange={handleChange} />
                    </div>
                    <div className="col-md-6 mb-3">
                        <label>Country</label>
                        <input name="country" className="form-control" value={profile.country} onChange={handleChange} />
                    </div>
                    <div className="col-md-6 mb-3">
                        <label>Age</label>
                        <input name="age" type="number" className="form-control" value={profile.age} onChange={handleChange} />
                    </div>
                    <div className="col-md-6 mb-3">
                        <label>Language</label>
                        <select name="language" className="form-select" value={profile.language} onChange={(e) => handleLanguageChange(e.target.value)}>
                            <option value="en">English</option>
                            <option value="ar">العربية</option>
                        </select>
                    </div>
                    <div className="col-md-6 mb-3">
                        <label>Reminder Preferences</label>
                        <select name="remindersEnabled" className="form-select" value={profile.remindersEnabled ? "yes" : "no"} onChange={(e) => setProfile({ ...profile, remindersEnabled: e.target.value === "yes" })}>
                            <option value="yes">Enable Smart Reminders</option>
                            <option value="no">Disable Reminders</option>
                        </select>
                    </div>
                </div>

                <button type="submit" className="btn btn-success w-100 mb-4" disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                </button>
            </form>

            {/* Password Section */}
            <div className="card p-4 mb-4">
                <h5>Change Password</h5>
                <div className="form-group mb-2">
                    <label>Current Password</label>
                    <input
                        type={showPasswords ? "text" : "password"}
                        className="form-control"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                    />
                </div>
                <div className="form-group mb-2">
                    <label>New Password</label>
                    <input
                        type={showPasswords ? "text" : "password"}
                        className="form-control"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                </div>
                <div className="form-group mb-3">
                    <label>Confirm New Password</label>
                    <input
                        type={showPasswords ? "text" : "password"}
                        className="form-control"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                    />
                </div>
                <div className="form-check mb-3">
                    <input type="checkbox" className="form-check-input" id="showPasswords" checked={showPasswords} onChange={() => setShowPasswords(!showPasswords)} />
                    <label className="form-check-label" htmlFor="showPasswords">Show Passwords</label>
                </div>
                <button className="btn btn-outline-primary" onClick={handlePasswordChange}>Update Password</button>
            </div>

            {/* Delete Account */}
            <div className="card p-4 mb-4 border-danger">
                <h5 className="text-danger">Delete Account</h5>
                <p className="text-muted">This action is permanent. Please enter your password to confirm.</p>
                <input
                    type="password"
                    className="form-control mb-2"
                    placeholder="Your Password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                />
                <button className="btn btn-danger" onClick={handleDeleteAccount}>Delete My Account</button>
            </div>

            {/* Program Status */}
            <div className="card p-3">
                <h6>Program Status</h6>
                <p><strong>Status:</strong> {profile.programStatus}</p>
            </div>
        </div>
    );
};

export default Profile;
