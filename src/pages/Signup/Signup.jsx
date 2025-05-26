import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase/firebaseConfig";
import {
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    sendEmailVerification,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import "../../styles/Signup.css";

import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { signInWithCredential } from 'firebase/auth';


const Signup = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [error, setError] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleEmailSignup = async (e) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await sendEmailVerification(user);

            await setDoc(doc(db, "users", user.uid), {
                profile: {
                    firstName,
                    lastName,
                    email,
                    createdAt: serverTimestamp(),
                },
            });

            const redirectLink = localStorage.getItem("redirectAfterAuth");
            if (redirectLink) {
                localStorage.removeItem("redirectAfterAuth");
                window.location.href = redirectLink;
            } else {
                navigate("/signup/complete-profile");
            }

        } catch (err) {
            console.error(err);
            setError(err.message);
        }
    };

    const handleGoogleSignup = async () => {
        setError("");
        const provider = new GoogleAuthProvider();

        try {
            let userCredential;

            if (Capacitor.isNativePlatform()) {
                // ✅ Native app: initialize before signIn
                await GoogleAuth.initialize({
                    scopes: ['profile', 'email'], // ✅ REQUIRED for Android
                    clientId: '687684731229-l6296i32tsdet0nfdgd5olk34hd0o259.apps.googleusercontent.com', // ✅ Your real Web Client ID
                    forceCodeForRefreshToken: true
                });


                const googleUser = await GoogleAuth.signIn();

                const credential = GoogleAuthProvider.credential(
                    googleUser.authentication.idToken
                );

                userCredential = await signInWithCredential(auth, credential);
            } else {
                // ✅ Web browser
                userCredential = await signInWithPopup(auth, provider);
            }

            const user = userCredential.user;

            await setDoc(doc(db, "users", user.uid), {
                profile: {
                    firstName: user.displayName?.split(" ")[0] || "",
                    lastName: user.displayName?.split(" ")[1] || "",
                    email: user.email,
                    createdAt: serverTimestamp(),
                },
            }, { merge: true });

            const redirectLink = localStorage.getItem("redirectAfterAuth");
            if (redirectLink) {
                localStorage.removeItem("redirectAfterAuth");
                window.location.href = redirectLink;
            } else {
                navigate("/signup/complete-profile");
            }

        } catch (err) {
            console.error("Google Signup Error:", err);
            setError("Google Signup Failed.");
        }
    };



    return (
        <div className="container mt-5" style={{ maxWidth: "500px" }}>
            <h2>Create Your Account</h2>

            <form onSubmit={handleEmailSignup}>
                {error && <div className="alert alert-danger">{error}</div>}

                <div className="mb-3">
                    <label>First Name</label>
                    <input
                        type="text"
                        className="form-control"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                    />
                </div>

                <div className="mb-3">
                    <label>Last Name</label>
                    <input
                        type="text"
                        className="form-control"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                    />
                </div>

                <div className="mb-3">
                    <label>Email</label>
                    <input
                        type="email"
                        className="form-control"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                {/* Password Field */}
                <div className="mb-3 password-wrapper">
                    <label>Password</label>
                    <div className="input-group">
                        <input
                            type={showPassword ? "text" : "password"}
                            className="form-control"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            pattern=".{8,}"
                            title="Minimum 8 characters required"
                        />
                        <span
                            className="toggle-password"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? "🙈" : "👁️"}
                        </span>
                    </div>
                </div>

                {/* Confirm Password Field */}
                <div className="mb-3 password-wrapper">
                    <label>Confirm Password</label>
                    <div className="input-group">
                        <input
                            type={showPassword ? "text" : "password"}
                            className="form-control"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <span
                            className="toggle-password"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? "🙈" : "👁️"}
                        </span>
                    </div>
                </div>

                <button type="submit" className="btn btn-primary w-100">
                    Sign Up with Email
                </button>
            </form>

            <div className="text-center my-3">or</div>

            {/* Google Button */}
            <button
                type="button"
                className="btn btn-google w-100"
                onClick={handleGoogleSignup}
            >
                <img
                    src="https://developers.google.com/identity/images/g-logo.png
"
                    alt="Google logo"
                    className="google-icon"
                />
                <span>Continue with Google</span>
            </button>
        </div>
    );
};

export default Signup;
