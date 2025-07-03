import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { doc, updateDoc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../firebase/firebaseConfig";
import i18n from "../../i18n";
import AvatarCropModal from "../../components/AvatarCropModal";
import "../../styles/CompleteProfile.css";
import Select from "react-select";
import 'react-phone-number-input/style.css';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';




const countryOptions = [
    // 🌍 Western Countries
    {
        value: "Canada",
        label: (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <img src="https://flagcdn.com/w40/ca.png" alt="CA" width="20" />
                <span>Canada</span>
            </div>
        ),
    },
    {
        value: "United States",
        label: (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <img src="https://flagcdn.com/w40/us.png" alt="US" width="20" />
                <span>United States</span>
            </div>
        ),
    },
    {
        value: "Australia",
        label: (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <img src="https://flagcdn.com/w40/au.png" alt="AU" width="20" />
                <span>Australia</span>
            </div>
        ),
    },
    {
        value: "United Kingdom",
        label: (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <img src="https://flagcdn.com/w40/gb.png" alt="UK" width="20" />
                <span>United Kingdom</span>
            </div>
        ),
    },
    {
        value: "Germany",
        label: (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <img src="https://flagcdn.com/w40/de.png" alt="DE" width="20" />
                <span>Germany</span>
            </div>
        ),
    },
    {
        value: "France",
        label: (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <img src="https://flagcdn.com/w40/fr.png" alt="FR" width="20" />
                <span>France</span>
            </div>
        ),
    },
    {
        value: "Italy",
        label: (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <img src="https://flagcdn.com/w40/it.png" alt="IT" width="20" />
                <span>Italy</span>
            </div>
        ),
    },
    {
        value: "Netherlands",
        label: (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <img src="https://flagcdn.com/w40/nl.png" alt="NL" width="20" />
                <span>Netherlands</span>
            </div>
        ),
    },
    {
        value: "Sweden",
        label: (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <img src="https://flagcdn.com/w40/se.png" alt="SE" width="20" />
                <span>Sweden</span>
            </div>
        ),
    },
    {
        value: "Spain",
        label: (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <img src="https://flagcdn.com/w40/es.png" alt="ES" width="20" />
                <span>Spain</span>
            </div>
        ),
    },

    // 🇴🇲 Gulf Countries
    {
        value: "Saudi Arabia",
        label: (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <img src="https://flagcdn.com/w40/sa.png" alt="SA" width="20" />
                <span>Saudi Arabia</span>
            </div>
        ),
    },
    {
        value: "United Arab Emirates",
        label: (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <img src="https://flagcdn.com/w40/ae.png" alt="AE" width="20" />
                <span>United Arab Emirates</span>
            </div>
        ),
    },
    {
        value: "Kuwait",
        label: (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <img src="https://flagcdn.com/w40/kw.png" alt="KW" width="20" />
                <span>Kuwait</span>
            </div>
        ),
    },
    {
        value: "Qatar",
        label: (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <img src="https://flagcdn.com/w40/qa.png" alt="QA" width="20" />
                <span>Qatar</span>
            </div>
        ),
    },
    {
        value: "Bahrain",
        label: (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <img src="https://flagcdn.com/w40/bh.png" alt="BH" width="20" />
                <span>Bahrain</span>
            </div>
        ),
    },
    {
        value: "Oman",
        label: (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <img src="https://flagcdn.com/w40/om.png" alt="OM" width="20" />
                <span>Oman</span>
            </div>
        ),
    },

    // 🌍 African Arab Countries
    {
        value: "Egypt",
        label: (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <img src="https://flagcdn.com/w40/eg.png" alt="EG" width="20" />
                <span>Egypt</span>
            </div>
        ),
    },
    {
        value: "Morocco",
        label: (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <img src="https://flagcdn.com/w40/ma.png" alt="MA" width="20" />
                <span>Morocco</span>
            </div>
        ),
    },
    {
        value: "Algeria",
        label: (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <img src="https://flagcdn.com/w40/dz.png" alt="DZ" width="20" />
                <span>Algeria</span>
            </div>
        ),
    },
    {
        value: "Tunisia",
        label: (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <img src="https://flagcdn.com/w40/tn.png" alt="TN" width="20" />
                <span>Tunisia</span>
            </div>
        ),
    },
    {
        value: "Sudan",
        label: (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <img src="https://flagcdn.com/w40/sd.png" alt="SD" width="20" />
                <span>Sudan</span>
            </div>
        ),
    },
    {
        value: "Libya",
        label: (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <img src="https://flagcdn.com/w40/ly.png" alt="LY" width="20" />
                <span>Libya</span>
            </div>
        ),
    },
    {
        value: "Mauritania",
        label: (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <img src="https://flagcdn.com/w40/mr.png" alt="MR" width="20" />
                <span>Mauritania</span>
            </div>
        ),
    },
    {
        value: "Somalia",
        label: (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <img src="https://flagcdn.com/w40/so.png" alt="SO" width="20" />
                <span>Somalia</span>
            </div>
        ),
    },
    {
        value: "Comoros",
        label: (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <img src="https://flagcdn.com/w40/km.png" alt="KM" width="20" />
                <span>Comoros</span>
            </div>
        ),
    },
    {
        value: "Djibouti",
        label: (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <img src="https://flagcdn.com/w40/dj.png" alt="DJ" width="20" />
                <span>Djibouti</span>
            </div>
        ),
    },
];


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
                firstName: profile.firstName,
                lastName: profile.lastName,
                country: profile.country,
                age: profile.age,
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
                        <PhoneInput
                            international
                            defaultCountry="SA"
                            value={profile.whatsapp}
                            onChange={(value) =>
                                setProfile({ ...profile, whatsapp: value })
                            }
                            className="form-control"
                            placeholder="Enter your WhatsApp number"
                        />
                        {profile.whatsapp && !isValidPhoneNumber(profile.whatsapp) && (
                            <div className="text-danger mt-1">❌ Invalid phone number</div>
                        )}
                    </div>

                    <div className="col-md-6 mb-3">
                        <label>Country</label>
                        <Select
                            options={countryOptions}
                            value={countryOptions.find(opt => opt.value === profile.country)}
                            onChange={(selected) =>
                                setProfile({ ...profile, country: selected.value })
                            }
                            placeholder="Select Country"
                            isSearchable
                            styles={{
                                control: (base) => ({
                                    ...base,
                                    borderRadius: "6px",
                                    padding: "2px",
                                }),
                            }}
                        />
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
