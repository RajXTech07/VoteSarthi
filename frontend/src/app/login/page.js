"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RecaptchaVerifier, signInWithPhoneNumber, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { api } from "../../lib/api";
import GoogleAuthButton from "../../components/GoogleAuthButton";
import styles from "./page.module.css";

export default function Login() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState("MAIN"); // MAIN, PHONE_MOBILE, PHONE_OTP
  
  // Email Auth State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Phone Auth State
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const processFirebaseLogin = async (result) => {
    // Get the secure ID Token
    const idToken = await result.user.getIdToken();
    
    // Save session immediately (Firebase is the source of truth)
    localStorage.setItem("votesarthi_session", idToken);
    
    // Try to sync with backend (best-effort — don't block login if backend is down)
    try {
      const response = await api.verifyFirebaseToken(idToken);
      localStorage.setItem("votesarthi_user", JSON.stringify(response.user));
    } catch (backendErr) {
      console.warn("Backend sync failed (will retry later):", backendErr.message);
      // Save basic user info from Firebase directly
      localStorage.setItem("votesarthi_user", JSON.stringify({
        name: result.user.displayName || "",
        email: result.user.email || "",
        picture: result.user.photoURL || "",
        uid: result.user.uid,
      }));
    }
    
    router.push("/profile");
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("Please enter both email and password.");
      setLoading(false);
      return;
    }

    // Password Validation only on Sign Up
    if (!isLogin) {
      const passwordRegex = /^[a-zA-Z0-9@#\.]{8,16}$/;
      if (!passwordRegex.test(password)) {
        setError("Password must be 8 to 16 characters. Only letters, numbers, and the symbols @, #, . are allowed.");
        setLoading(false);
        return;
      }
    }

    try {
      let result;
      if (isLogin) {
        result = await signInWithEmailAndPassword(auth, email, password);
      } else {
        result = await createUserWithEmailAndPassword(auth, email, password);
      }
      await processFirebaseLogin(result);
    } catch (err) {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        setError("This email is already in use. Please log in.");
      } else if (err.code === "auth/invalid-credential") {
        setError("Invalid email or password.");
      } else if (err.code === "auth/weak-password") {
        setError("Password should be at least 6 characters.");
      } else {
        setError("Authentication failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError("");
    
    // Add country code if missing
    const formattedNumber = mobileNumber.startsWith("+") 
      ? mobileNumber 
      : `+91${mobileNumber}`;

    if (formattedNumber.length < 12) {
      setError("Please enter a valid mobile number");
      return;
    }
    
    setLoading(true);
    try {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
      
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
      });

      const appVerifier = window.recaptchaVerifier;
      const confirmationResult = await signInWithPhoneNumber(auth, formattedNumber, appVerifier);
      
      window.confirmationResult = confirmationResult;
      setStep("PHONE_OTP");
    } catch (err) {
      console.error(err);
      setError("Failed to send OTP. Try again.");
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError("");
    if (!otp || otp.length < 4) {
      setError("Please enter a valid OTP");
      return;
    }
    setLoading(true);
    try {
      const result = await window.confirmationResult.confirm(otp);
      await processFirebaseLogin(result);
    } catch (err) {
      console.error(err);
      setError("Invalid OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>
          {step === "MAIN" 
            ? (isLogin ? "Welcome Back" : "Create Account") 
            : "Phone Verification"}
        </h1>
        <p className={styles.subtitle}>
          {step === "MAIN" 
            ? (isLogin ? "Log in to manage your voter profile" : "Sign up to track your election journey")
            : "We will send you a secure verification code"}
        </p>

        {error && <p style={{ color: "red", fontSize: "0.9rem", marginBottom: "1rem", textAlign: "center" }}>{error}</p>}

        {/* Required for Firebase Phone Auth */}
        <div id="recaptcha-container"></div>

        {step === "MAIN" && (
          <>
            <form className={styles.form} onSubmit={handleEmailAuth}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Email Address</label>
                <input
                  type="email"
                  className={styles.input}
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Password</label>
                <input
                  type="password"
                  className={styles.input}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                {!isLogin && (
                  <span style={{ fontSize: "0.75rem", color: "#666", marginTop: "-0.2rem" }}>
                    8-16 characters. Allowed symbols: @, #, .
                  </span>
                )}
              </div>
              <button type="submit" className={styles.button} disabled={loading}>
                {loading ? "Please wait..." : (isLogin ? "Log In" : "Sign Up")}
              </button>
            </form>

            <div className={styles.divider}>OR</div>

            <div className={styles.secondaryAuthGroup}>
              <div className={styles.googleBtnWrapper}>
                <GoogleAuthButton isFullWidth={true} />
              </div>

              <button 
                type="button" 
                className={styles.secondaryBtn}
                onClick={() => { setError(""); setStep("PHONE_MOBILE"); }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                <span>Continue with Phone Number</span>
              </button>
            </div>

            <div className={styles.toggleText}>
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <span className={styles.toggleLink} onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? "Create one" : "Log in"}
              </span>
            </div>
          </>
        )}

        {step === "PHONE_MOBILE" && (
          <form className={styles.form} onSubmit={handleSendOTP}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Mobile Number</label>
              <input
                type="tel"
                className={styles.input}
                placeholder="Enter 10-digit number"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                maxLength={10}
              />
            </div>
            <button type="submit" className={styles.button} disabled={loading}>
              {loading ? "Sending OTP..." : "Get OTP"}
            </button>
            <button
              type="button"
              className={styles.toggleLink}
              style={{ marginTop: "1rem", border: "none", background: "none" }}
              onClick={() => { setError(""); setStep("MAIN"); }}
            >
              Back to Email Login
            </button>
          </form>
        )}

        {step === "PHONE_OTP" && (
          <form className={styles.form} onSubmit={handleVerifyOTP}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Enter OTP sent to +91 {mobileNumber}</label>
              <input
                type="text"
                className={styles.input}
                placeholder="Enter OTP code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>
            <button type="submit" className={styles.button} disabled={loading}>
              {loading ? "Verifying..." : "Verify & Continue"}
            </button>
            <button
              type="button"
              className={styles.toggleLink}
              style={{ marginTop: "1rem", border: "none", background: "none" }}
              onClick={() => { setError(""); setStep("PHONE_MOBILE"); }}
            >
              Change Mobile Number
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
