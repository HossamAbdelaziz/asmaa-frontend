import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");

    const handleReset = async (e) => {
        e.preventDefault();
        setError("");
        setSent(false);

        try {
            await sendPasswordResetEmail(auth, email);
            setSent(true);
        } catch (err) {
            setError("Failed to send reset email. Please check your email address.");
            console.error(err);
        }
    };

    return (
        <div className="container mt-5" style={{ maxWidth: "500px" }}>
            <h2>Reset Your Password</h2>

            {error && <div className="alert alert-danger">{error}</div>}
            {sent && <div className="alert alert-success">Reset email sent. Please check your inbox.</div>}

            <form onSubmit={handleReset}>
                <div className="mb-3">
                    <label>Email Address</label>
                    <input type="email" className="form-control" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>

                <button type="submit" className="btn btn-primary w-100">Send Reset Email</button>
            </form>
        </div>
    );
};

export default ForgotPassword;
