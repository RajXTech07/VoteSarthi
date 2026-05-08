"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../lib/api";
import GoogleAuthButton from "../../components/GoogleAuthButton";
import styles from "./page.module.css";

export default function Login() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("MOBILE"); // MOBILE, OTP
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError("");
    if (!mobileNumber || mobileNumber.length < 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }
    setLoading(true);
    try {
      await api.sendOTP(mobileNumber);
      setStep("OTP");
    } catch (err) {
      setError("Failed to send OTP. Try again.");
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
      const data = await api.verifyOTP(mobileNumber, otp);
      localStorage.setItem("votesarthi_session", data.session_token);
      localStorage.setItem("votesarthi_user", JSON.stringify(data.user));
      router.push("/profile");
    } catch (err) {
      setError("Invalid OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>{isLogin ? "Welcome Back" : "Create Account"}</h1>
        <p className={styles.subtitle}>
          {isLogin ? "Log in to manage your voter profile" : "Sign up to track your election journey"}
        </p>

        {error && <p style={{ color: "red", fontSize: "0.9rem", marginBottom: "1rem" }}>{error}</p>}

        {step === "MOBILE" ? (
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
          </form>
        ) : (
          <form className={styles.form} onSubmit={handleVerifyOTP}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Enter OTP sent to {mobileNumber}</label>
              <input
                type="text"
                className={styles.input}
                placeholder="Enter OTP (Hint: 123456)"
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
              onClick={() => setStep("MOBILE")}
            >
              Change Mobile Number
            </button>
          </form>
        )}

        <div className={styles.divider}>OR</div>

        <div className={styles.googleBtnWrapper}>
          <GoogleAuthButton />
        </div>

        <div className={styles.toggleText}>
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <span className={styles.toggleLink} onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Create one" : "Log in"}
          </span>
        </div>
      </div>
    </div>
  );
}
