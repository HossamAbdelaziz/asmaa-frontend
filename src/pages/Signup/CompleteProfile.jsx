import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { doc, updateDoc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../firebase/firebaseConfig";
import i18n from "../../i18n";
import AvatarCropModal from "../../components/AvatarCropModal";
import "../../styles/CompleteProfile.css";


const CompleteProfile = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const [profile, setProfile] = useState({
        firstName: "",
        lastName: "",
        whatsapp: "",
        country: "",
        age: "",
        language: "en",
        avatarUrl: ""
    });

    const [avatarFile, setAvatarFile] = useState(null);
    const [rawImagePreview, setRawImagePreview] = useState("");
    const [showCropModal, setShowCropModal] = useState(false);
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!currentUser) return;

            const profileRef = doc(db, "users", currentUser.uid);
            const snap = await getDoc(profileRef);

            if (snap.exists()) {
                const data = snap.data().profile || {};
                setProfile((prev) => ({
                    ...prev,
                    ...data,
                }));
                if (data.language) {
                    i18n.changeLanguage(data.language);
                }
            }
        };

        fetchProfile();
    }, [currentUser]);

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleLanguageChange = (lang) => {
        setProfile({ ...profile, language: lang });
        i18n.changeLanguage(lang);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");

        try {
            if (!currentUser) {
                setError("User not authenticated. Please log in again.");
                setSaving(false);
                return;
            }

            console.log("🔍 Submitting profile for UID:", currentUser.uid);

            let avatarUrl = profile.avatarUrl;
            if (avatarFile) {
                const storageRef = ref(storage, `avatars/${currentUser.uid}/profile.jpg`);
                await uploadBytes(storageRef, avatarFile);
                avatarUrl = await getDownloadURL(storageRef);
                console.log("✅ Avatar uploaded:", avatarUrl);
            }

            const profileRef = doc(db, "users", currentUser.uid);
            await setDoc(profileRef, {
                profile: {
                    ...profile,
                    avatarUrl
                },
                phone: profile.whatsapp,
                createdAt: serverTimestamp(),
            }, { merge: true });

            try {
                await currentUser.reload();
                console.log("🔄 User reloaded. Email verified:", currentUser.emailVerified);
            } catch (reloadError) {
                console.error("⚠️ Error reloading user:", reloadError);
            }

            const isGoogleUser = currentUser.providerData.some(
                (provider) => provider.providerId === "google.com"
            );
            console.log("🛂 Google User:", isGoogleUser);

            if (!currentUser.emailVerified && !isGoogleUser) {
                console.log("➡️ Redirecting to verify-email");
                navigate("/signup/verify-email");
            } else {
                const redirectLink = localStorage.getItem("redirectAfterAuth");
                console.log("➡️ Redirecting to:", redirectLink || "/dashboard");

                if (redirectLink) {
                    localStorage.removeItem("redirectAfterAuth");
                    window.location.assign(redirectLink);
                } else {
                    window.location.assign("/dashboard");
                }

                console.log("✅ Redirect issued — if you still see this page, check for route guards or broken router setup.");
            }

        } catch (err) {
            console.error("❌ Profile save error:", err);
            setError("Failed to save profile. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="container mt-5" style={{ maxWidth: "600px" }}>
            <h3>Complete Your Profile</h3>
            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label>First Name</label>
                        <input name="firstName" className="form-control" required value={profile.firstName} onChange={handleChange} />
                    </div>

                    <div className="col-md-6 mb-3">
                        <label>Last Name</label>
                        <input name="lastName" className="form-control" required value={profile.lastName} onChange={handleChange} />
                    </div>

                    <div className="col-md-6 mb-3">
                        <label>WhatsApp Number</label>
                        <input name="whatsapp" className="form-control" required value={profile.whatsapp} onChange={handleChange} placeholder="+966..." />
                    </div>

                    <div className="col-md-6 mb-3">
                        <label>Country</label>
                        <select name="country" className="form-select" required value={profile.country} onChange={handleChange}>
                            <option value="">Select Country</option>
                            <option value="Saudi Arabia">Saudi Arabia</option>
                            <option value="Canada">Canada</option>
                            <option value="Egypt">Egypt</option>
                            <option value="UAE">UAE</option>
                            <option value="Kuwait">Kuwait</option>
                            <option value="United States">United States</option>
                        </select>
                    </div>

                    <div className="col-md-6 mb-3">
                        <label>Age</label>
                        <input name="age" type="number" className="form-control" required value={profile.age} onChange={handleChange} />
                    </div>

                    <div className="col-md-6 mb-3">
                        <label>Language</label>
                        <select name="language" className="form-select" required value={profile.language} onChange={(e) => handleLanguageChange(e.target.value)}>
                            <option value="en">English</option>
                            <option value="ar">العربية</option>
                        </select>
                    </div>

                    <div className="col-md-12 mb-3">
                        <label>Upload Profile Picture</label>
                        <input type="file" accept="image/*" onChange={handleAvatarChange} className="form-control" />
                    </div>
                </div>

                <button className="btn btn-success w-100" disabled={saving}>
                    {saving ? "Saving..." : "Finish & Continue"}
                </button>
            </form>

            {showCropModal && (
                <AvatarCropModal
                    image={rawImagePreview}
                    onClose={() => setShowCropModal(false)}
                    onCropComplete={handleCroppedImage}
                />
            )}
        </div>
    );
};

export default CompleteProfile;
