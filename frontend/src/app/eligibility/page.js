"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import NextAction from "@/components/NextAction";
import styles from "./page.module.css";

const STATES = [
  "", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
  "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh",
  "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
  "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi",
  "Jammu & Kashmir", "Ladakh", "Chandigarh", "Puducherry",
  "Andaman & Nicobar", "Dadra & Nagar Haveli", "Daman & Diu", "Lakshadweep",
];

export default function EligibilityPage() {
  const [form, setForm] = useState({
    age: "",
    is_citizen: null,
    has_voter_id: null,
    state: "",
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await api.checkEligibility({
        age: parseInt(form.age),
        is_citizen: form.is_citizen,
        has_voter_id: form.has_voter_id,
        state: form.state,
      });
      setResult(data);
    } catch (err) {
      setError(err.message || "Failed to check eligibility. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    form.age !== "" &&
    form.is_citizen !== null &&
    form.has_voter_id !== null;

  return (
    <div className={styles.page}>
      <div className="container">
        <div className="page-header">
          <span className="badge badge-saffron">Tool #1</span>
          <h1 className="heading-lg">
            Eligibility <span className="text-gradient-saffron">Checker</span>
          </h1>
          <p>3 questions → instant result.</p>
        </div>

        {/* Next Action — shown after result */}
        {result && (
          <NextAction
            icon={result.next_action_icon}
            action={result.next_action}
            detail={result.next_action_detail}
            url={result.next_action_url}
          />
        )}

        <div className={styles.layout}>
          {/* Form */}
          <form
            className={`glass-card ${styles.form}`}
            onSubmit={handleSubmit}
            id="eligibility-form"
          >
            {/* Age */}
            <div className={styles.field}>
              <label className={styles.label}>What is your age?</label>
              <input
                type="number"
                className={styles.input}
                placeholder="Enter your age"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
                min="0"
                max="150"
                required
                id="input-age"
              />
            </div>

            {/* State */}
            <div className={styles.field}>
              <label className={styles.label}>Your State / UT (optional)</label>
              <select
                className={styles.input}
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                id="input-state"
              >
                <option value="">Select your state</option>
                {STATES.filter(Boolean).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Citizenship */}
            <div className={styles.field}>
              <label className={styles.label}>
                Are you an Indian citizen?
              </label>
              <div className={styles.toggleGroup}>
                <button
                  type="button"
                  className={`${styles.toggle} ${
                    form.is_citizen === true ? styles.toggleActive : ""
                  }`}
                  onClick={() => setForm({ ...form, is_citizen: true })}
                  id="btn-citizen-yes"
                >
                  ✅ Yes
                </button>
                <button
                  type="button"
                  className={`${styles.toggle} ${
                    form.is_citizen === false ? styles.toggleActive : ""
                  }`}
                  onClick={() => setForm({ ...form, is_citizen: false })}
                  id="btn-citizen-no"
                >
                  ❌ No
                </button>
              </div>
            </div>

            {/* Voter ID */}
            <div className={styles.field}>
              <label className={styles.label}>
                Do you have a Voter ID (EPIC)?
              </label>
              <div className={styles.toggleGroup}>
                <button
                  type="button"
                  className={`${styles.toggle} ${
                    form.has_voter_id === true ? styles.toggleActive : ""
                  }`}
                  onClick={() => setForm({ ...form, has_voter_id: true })}
                  id="btn-voterid-yes"
                >
                  ✅ Yes
                </button>
                <button
                  type="button"
                  className={`${styles.toggle} ${
                    form.has_voter_id === false ? styles.toggleActive : ""
                  }`}
                  onClick={() => setForm({ ...form, has_voter_id: false })}
                  id="btn-voterid-no"
                >
                  ❌ No
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={!isFormValid || loading}
              id="btn-check-eligibility"
              style={{ width: "100%", justifyContent: "center" }}
            >
              {loading ? "Checking..." : "Check My Eligibility →"}
            </button>
          </form>

          {/* Result */}
          <div className={styles.resultArea}>
            {error && (
              <div className={`glass-card ${styles.resultCard} ${styles.error}`}>
                <span className={styles.resultIcon}>⚠️</span>
                <h3>Error</h3>
                <p>{error}</p>
              </div>
            )}

            {result && (
              <div
                className={`glass-card ${styles.resultCard} ${
                  result.eligible ? styles.eligible : styles.notEligible
                } animate-fade-in-up`}
                id="eligibility-result"
              >
                <span className={styles.resultIcon}>
                  {result.eligible ? "🎉" : "⚠️"}
                </span>

                {/* Bold status line */}
                <h3 className={styles.resultTitle}>
                  <strong>Status:</strong>{" "}
                  {result.eligible
                    ? "You are eligible to vote"
                    : "Not eligible yet"}
                </h3>

                {/* Primary reason — just the first one */}
                {result.reasons.length > 0 && (
                  <p className={styles.reasonLine}>
                    <strong>Why:</strong> {result.reasons[0]}
                  </p>
                )}

                {/* AI Explanation */}
                {result.ai_explanation && (
                  <div className={styles.aiExplanation} id="ai-explanation">
                    <div className={styles.aiHeader}>
                      <span>🤖</span>
                      <span>AI Summary</span>
                    </div>
                    <p>{result.ai_explanation}</p>
                  </div>
                )}

                {/* Next action — top 2 only */}
                {result.next_steps.length > 0 && (
                  <div className={styles.section}>
                    <h4>Do This Now</h4>
                    <ul>
                      {result.next_steps.slice(0, 2).map((s, i) => (
                        <li key={i}><strong>{i === 0 ? "→ " : ""}</strong>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {!result && !error && (
              <div className={`glass-card ${styles.placeholder}`}>
                <span className={styles.placeholderIcon}>🗳️</span>
                <p>Fill out the form → your result appears here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
