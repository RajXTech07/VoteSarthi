"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import styles from "./SmartDashboard.module.css";

/**
 * SmartDashboard — The "brain" UI of the assistant.
 * Shows personalized recommendations, urgency, quick links,
 * and Google Maps polling booth finder based on user context.
 */
export default function SmartDashboard() {
  const [form, setForm] = useState({
    age: "",
    is_citizen: null,
    has_voter_id: null,
    state: "",
  });
  const [context, setContext] = useState(null);
  const [loading, setLoading] = useState(false);
  const [configured, setConfigured] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api.getContext({
        age: form.age ? parseInt(form.age) : undefined,
        is_citizen: form.is_citizen,
        has_voter_id: form.has_voter_id,
        state: form.state || undefined,
      });
      setContext(data);
      setConfigured(true);
    } catch (err) {
      console.error("Context failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const urgencyColors = {
    critical: "var(--danger)",
    high: "var(--saffron)",
    moderate: "#e6a817",
    low: "var(--green)",
  };

  return (
    <div className={styles.dashboard} id="smart-dashboard">
      {!configured ? (
        /* ── Setup Form ── */
        <form className={`glass-card ${styles.setupForm}`} onSubmit={handleSubmit} id="dashboard-form">
          <div className={styles.setupHeader}>
            <span className={styles.setupIcon}>🧠</span>
            <div>
              <h3 className="heading-md">Smart Assistant</h3>
              <p>Tell me about yourself — I&apos;ll give you a personalized action plan.</p>
            </div>
          </div>

          <div className={styles.fields}>
            <div className={styles.field}>
              <label>Age</label>
              <input
                type="number"
                placeholder="Your age"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
                min="0" max="150" required
                className={styles.input}
                id="dashboard-age"
              />
            </div>

            <div className={styles.field}>
              <label>State / UT</label>
              <input
                type="text"
                placeholder="e.g., Delhi"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                className={styles.input}
                id="dashboard-state"
              />
            </div>

            <div className={styles.field}>
              <label>Indian Citizen?</label>
              <div className={styles.toggleRow}>
                <button type="button"
                  className={`${styles.toggle} ${form.is_citizen === true ? styles.active : ""}`}
                  onClick={() => setForm({ ...form, is_citizen: true })}>Yes</button>
                <button type="button"
                  className={`${styles.toggle} ${form.is_citizen === false ? styles.active : ""}`}
                  onClick={() => setForm({ ...form, is_citizen: false })}>No</button>
              </div>
            </div>

            <div className={styles.field}>
              <label>Voter ID?</label>
              <div className={styles.toggleRow}>
                <button type="button"
                  className={`${styles.toggle} ${form.has_voter_id === true ? styles.active : ""}`}
                  onClick={() => setForm({ ...form, has_voter_id: true })}>Yes</button>
                <button type="button"
                  className={`${styles.toggle} ${form.has_voter_id === false ? styles.active : ""}`}
                  onClick={() => setForm({ ...form, has_voter_id: false })}>No</button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={!form.age || form.is_citizen === null || loading}
            style={{ width: "100%", justifyContent: "center" }}
            id="dashboard-submit"
          >
            {loading ? "Analyzing..." : "Get My Action Plan →"}
          </button>
        </form>
      ) : context && (
        /* ── Smart Dashboard Result ── */
        <div className={styles.result}>
          {/* Status + Urgency Bar */}
          <div className={`glass-card ${styles.statusCard}`}>
            <div className={styles.statusTop}>
              <div>
                <span className={styles.statusBadge}
                  style={{ borderColor: urgencyColors[context.urgency.level] }}>
                  {context.urgency.label}
                </span>
                <h3 className={styles.statusTitle}>{context.user_status_label}</h3>
              </div>
              <button className={styles.resetBtn} onClick={() => { setConfigured(false); setContext(null); }}>
                Change →
              </button>
            </div>

            {/* AI Guidance */}
            {context.ai_guidance && (
              <div className={styles.aiGuidance}>
                <span className={styles.aiLabel}>🤖 AI Guidance</span>
                <p>{context.ai_guidance}</p>
              </div>
            )}
          </div>

          {/* Recommendations */}
          <div className={styles.recsGrid}>
            {context.recommendations.slice(0, 4).map((rec, i) => (
              <div key={i} className={`glass-card ${styles.recCard} ${i === 0 ? styles.primary : ""}`}>
                <span className={styles.recIcon}>{rec.icon}</span>
                <h4>{rec.action}</h4>
                <p>{rec.detail}</p>
                {rec.url && (
                  <a href={rec.url} target="_blank" rel="noopener noreferrer" className={styles.recLink}>
                    Open →
                  </a>
                )}
              </div>
            ))}
          </div>

          {/* Quick Links */}
          <div className={styles.quickLinks}>
            <h4 className={styles.sectionTitle}>🔗 Quick Links</h4>
            <div className={styles.linksGrid}>
              {context.quick_links.map((link, i) => (
                <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                  className={styles.linkCard} id={`quick-link-${i}`}>
                  <span className={styles.linkIcon}>{link.icon}</span>
                  <div>
                    <strong>{link.label}</strong>
                    <span>{link.desc}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Polling Booth Finder */}
          <div className={`glass-card ${styles.mapSection}`} id="polling-booth-map">
            <h4 className={styles.sectionTitle}>📍 Find Your Polling Booth</h4>
            <p className={styles.mapHint}>
              Enter your PIN code to see all polling stations in your area on Google Maps.
            </p>
            <a
              href="/booth-finder"
              className="btn btn-primary"
              style={{ marginTop: 12 }}
            >
              🔍 Find My Polling Booth →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
