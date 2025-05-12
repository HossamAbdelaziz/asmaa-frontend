import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { sendEmailVerification } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase/firebaseConfig";
import "../../styles/VerifyEmailNotice.css";


const VerifyEmailNotice = () => {
    const { currentUser } = useAuth();
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleResend = async () => {
        try {
            await sendEmailVerification(currentUser);
            setSent(true);
            setError("");
        } catch (err) {
            console.error(err);
            setError("Failed to send verification email.");
        }
    };

    const handleRefresh = async () => {
        try {
            await auth.currentUser.reload(); // ✅ Force real reload
            const updatedUser = auth.currentUser;

            if (updatedUser.emailVerified) {
                const redirectLink = localStorage.getItem("redirectAfterAuth");
                if (redirectLink) {
                    localStorage.removeItem("redirectAfterAuth");
                    window.location.href = redirectLink;
                } else {
                    navigate("/dashboard");
                }
            } else {
                setError("Email still not verified.");
            }
        } catch (err) {
            console.error(err);
            setError("Failed to refresh status.");
        }
    };

    return (
        <div className="container mt-5" style={{ maxWidth: "600px" }}>
            <h3>Please Verify Your Email</h3>
            <p>
                We’ve sent a verification email to:{" "}
                <strong>{currentUser?.email}</strong>
            </p>
            <p>
                Click the link in that email, then return here and click
                Refresh below.
            </p>

            {error && <div className="alert alert-danger">{error}</div>}
            {sent && (
                <div className="alert alert-success">
                    Verification email sent again.
                </div>
            )}

            <div className="d-flex gap-3 mt-4">
                <button onClick={handleResend} className="btn btn-outline-primary">
                    Resend Email
                </button>
                <button onClick={handleRefresh} className="btn btn-success">
                    Refresh Status
                </button>
            </div>
        </div>
    );
};

export default VerifyEmailNotice;
