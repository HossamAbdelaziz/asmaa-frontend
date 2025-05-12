import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";
import "../styles/Login.css";

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            await result.user.reload();

            if (!result.user.emailVerified) {
                navigate("/signup/verify-email");
                return;
            }

            const docSnap = await getDoc(doc(db, "users", result.user.uid));
            const profile = docSnap.data()?.profile;

            if (
                !profile?.firstName ||
                !profile?.lastName ||
                !profile?.whatsapp ||
                !profile?.country ||
                !profile?.age ||
                !profile?.language
            ) {
                navigate("/signup/complete-profile");
            } else {
                const redirectLink = localStorage.getItem("redirectAfterAuth");
                if (redirectLink) {
                    localStorage.removeItem("redirectAfterAuth");
                    window.location.href = redirectLink;
                } else {
                    navigate("/dashboard");
                }
            }

        } catch (err) {
            console.error(err);
            setError("Invalid email or password.");
        }
    };

    const handleGoogleLogin = async () => {
        const provider = new GoogleAuthProvider();

        try {
            const result = await signInWithPopup(auth, provider);
            await result.user.reload();

            if (!result.user.emailVerified) {
                navigate("/signup/verify-email");
                return;
            }

            const docSnap = await getDoc(doc(db, "users", result.user.uid));
            const profile = docSnap.data()?.profile;

            if (
                !profile?.firstName ||
                !profile?.lastName ||
                !profile?.whatsapp ||
                !profile?.country ||
                !profile?.age ||
                !profile?.language
            ) {
                navigate("/signup/complete-profile");
            } else {
                const redirectLink = localStorage.getItem("redirectAfterAuth");
                if (redirectLink) {
                    localStorage.removeItem("redirectAfterAuth");
                    window.location.href = redirectLink;
                } else {
                    navigate("/dashboard");
                }
            }

        } catch (err) {
            console.error(err);
            setError("Google Login Failed.");
        }
    };

    return (
        <div className="container mt-5" style={{ maxWidth: "500px" }}>
            <h2>Login to Your Account</h2>

            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleLogin}>
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

                <div className="mb-3 password-wrapper">
                    <label>Password</label>
                    <div className="input-group">
                        <input
                            type={showPassword ? "text" : "password"}
                            className="form-control"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <span
                            className="toggle-password"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? "🙈" : "👁️"}
                        </span>
                    </div>
                </div>

                <div className="text-end mb-3">
                    <a href="/forgot-password">Forgot Password?</a>
                </div>

                <button type="submit" className="btn btn-primary w-100">
                    Login
                </button>
            </form>

            <div className="text-center my-3">or</div>

            <button
                type="button"
                className="btn btn-google w-100"
                onClick={handleGoogleLogin}
            >
                <img
                    src="https://developers.google.com/identity/images/g-logo.png"
                    alt="Google logo"
                    className="google-icon"
                />
                <span>Continue with Google</span>
            </button>
        </div>
    );
};

export default Login;
