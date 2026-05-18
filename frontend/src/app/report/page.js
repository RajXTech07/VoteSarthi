"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../lib/api";
import styles from "./page.module.css";

export default function ReportIssue() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [sessionToken, setSessionToken] = useState(null);
  
  const [formData, setFormData] = useState({
    title: "",
    category: "General",
    description: ""
  });

  useEffect(() => {
    // Make sure user is logged in to report an issue
    const token = localStorage.getItem("votesarthi_session");
    if (!token) {
      router.push("/login");
    } else {
      setSessionToken(token);
    }
  }, [router]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!formData.title || !formData.description) {
      setError("Please fill out all fields.");
      return;
    }
    
    setLoading(true);
    try {
      await api.reportIssue(sessionToken, formData);
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError("Failed to submit issue. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (!sessionToken) return null; // Avoid flicker while redirecting

  if (success) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.successMessage}>
            <div className={styles.successIcon}>✅</div>
            <h1 className={styles.title}>Issue Reported!</h1>
            <p className={styles.subtitle}>Thank you for helping us improve VoteSarthi. Our team will look into this right away.</p>
            <button className={styles.backBtn} onClick={() => router.push("/")}>
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Report an Issue</h1>
          <p className={styles.subtitle}>Found a bug or have a suggestion? Let us know!</p>
        </div>

        {error && <p style={{ color: "red", fontSize: "0.9rem", textAlign: "center", marginBottom: "1rem" }}>{error}</p>}

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>Issue Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={styles.input}
              placeholder="E.g., App freezes on eligibility page"
              maxLength={100}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={styles.select}
            >
              <option value="General">General Feedback</option>
              <option value="Bug">Software Bug / Glitch</option>
              <option value="Data">Incorrect Election Data</option>
              <option value="Feature">Feature Request</option>
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={styles.textarea}
              placeholder="Please provide as much detail as possible..."
              maxLength={1000}
              required
            />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "Submitting..." : "Submit Report"}
          </button>
        </form>
      </div>
    </div>
  );
}
