import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCredential,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";
import "../styles/Login.css";

import { Capacitor } from "@capacitor/core";
import { GoogleAuth } from "@codetrix-studio/capacitor-google-auth";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();

const { currentUser, loading } = useAuth();

useEffect(() => {
  if (!loading && currentUser) {
    (async () => {
      const docSnap = await getDoc(doc(db, "users", currentUser.uid));
      const profile = docSnap.data()?.profile;

      const isIncomplete =
        !profile?.firstName ||
        !profile?.lastName ||
        !profile?.whatsapp ||
        !profile?.country ||
        !profile?.age ||
        !profile?.language;

      if (isIncomplete) {
        navigate("/signup/complete-profile");
      } else {
        const link = localStorage.getItem("redirectAfterAuth");
        localStorage.removeItem("redirectAfterAuth");
        navigate(link || "/dashboard");
      }
    })();
  }
}, [currentUser, loading, navigate]);



  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  /*const redirectAfterLogin = async (uid) => {
    const docSnap = await getDoc(doc(db, "users", uid));
    const profile = docSnap.data()?.profile;

    const isIncomplete =
      !profile?.firstName ||
      !profile?.lastName ||
      !profile?.whatsapp ||
      !profile?.country ||
      !profile?.age ||
      !profile?.language;

    if (isIncomplete) {
      navigate("/signup/complete-profile");
    } else {
      const link = localStorage.getItem("redirectAfterAuth");
      localStorage.removeItem("redirectAfterAuth");
      navigate(link || "/dashboard");
    }
  };*/

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await result.user.reload();

      if (!result.user.emailVerified) {
        return navigate("/signup/verify-email");
      }

      /*await redirectAfterLogin(result.user.uid);*/
    } catch (err) {
      console.error(err);
      setError("Invalid email or password.");
    }
  };

  const handleGoogleLogin = async () => {
  setError("");

  try {
    let userCredential;

    if (Capacitor.isNativePlatform()) {
      // ✅ Native login (iOS/Android)
      try {
        await GoogleAuth.initialize(); // Safely initialize
      } catch (initError) {
        console.warn("GoogleAuth already initialized or not needed:", initError);
      }

      const googleUser = await GoogleAuth.signIn();

      const credential = GoogleAuthProvider.credential(
        googleUser.authentication.idToken
      );

      userCredential = await signInWithCredential(auth, credential);
    } else {
      // ✅ Web login
      const provider = new GoogleAuthProvider();
      userCredential = await signInWithPopup(auth, provider);
    }

    await userCredential.user.reload();

    if (!userCredential.user.emailVerified) {
      return navigate("/signup/verify-email");
    }

    /*await redirectAfterLogin(userCredential.user.uid);*/
    // ✅ We now rely on AuthContext + useEffect to auto-redirect
  } catch (err) {
    console.error("Google Login Error:", err);
    setError("Google Login Failed.");
  }
};

  return (
    <div className="page-wrapper">
        <div className="login-container login-card">
          <h2>Login to Your Account</h2>

        {error && <div className="alert alert-danger" role="alert">{error}</div>}

        <form onSubmit={handleLogin} autoComplete="on" style={{ width: '100%' }}>
          <div className="mb-3">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              className="form-control"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              aria-label="Email address"
              style={{ fontSize: '16px' }}
            />
          </div>

          <div className="mb-3 password-wrapper">
            <label htmlFor="login-password">Password</label>
            <div className="input-group">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                className="form-control"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                aria-label="Password"
                style={{ fontSize: '16px' }}
              />
              <span
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={0}
                role="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setShowPassword(!showPassword); }}
              >
                {showPassword ? "🙈" : "👁️"}
              </span>
            </div>
          </div>

          <div className="text-end mb-3">
            <a href="/forgot-password">Forgot Password?</a>
          </div>

          <button type="submit" className="btn btn-primary w-100" aria-label="Login">
            Login
          </button>
        </form>

        <div className="text-center my-3">or</div>

        <button type="button" className="btn btn-google w-100" onClick={handleGoogleLogin} aria-label="Continue with Google">
          <img
            src="https://developers.google.com/identity/images/g-logo.png"
            alt="Google logo"
            className="google-icon"
          />
          <span>Continue with Google</span>
        </button>
      </div>
    </div>
  );
};

export default Login;