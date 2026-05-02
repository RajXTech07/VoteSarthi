"use client";

import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import NextAction from "@/components/NextAction";
import styles from "./page.module.css";

export default function TimelinePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const activeRef = useRef(null);

  // Context form
  const [age, setAge] = useState("");
  const [hasVoterId, setHasVoterId] = useState(null);
  const [state, setState] = useState("");
  const [contextSet, setContextSet] = useState(false);

  useEffect(() => {
    if (!contextSet) {
      api.getTimeline()
        .then((d) => { setData(d); setLoading(false); })
        .catch((err) => { setError(err.message); setLoading(false); });
    }
  }, [contextSet]);

  const handlePersonalize = (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    api.getPersonalTimeline({ age: parseInt(age), has_voter_id: hasVoterId, state })
      .then((d) => { setData(d); setLoading(false); setContextSet(true); })
      .catch((err) => { setError(err.message); setLoading(false); });
  };

  const handleReset = () => {
    setContextSet(false);
    setLoading(true);
    api.getTimeline()
        .then((d) => { setData(d); setLoading(false); })
        .catch((err) => { setError(err.message); setLoading(false); });
  };

  // Auto-scroll to current phase after load
  useEffect(() => {
    if (activeRef.current) {
      setTimeout(() => {
        activeRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 600);
    }
  }, [data]);

  const statusBadge = (s) =>
    s === "completed"
      ? "badge badge-green"
      : s === "active"
      ? "badge badge-saffron"
      : "badge badge-danger";

  const statusLabel = (s) =>
    s === "completed" ? "✓ Completed" : s === "active" ? "● Active Now" : "◦ Upcoming";

  return (
    <div className={styles.page}>
      <div className="container">
        <div className="page-header">
          <span className="badge badge-saffron">Tool #3</span>
          <h1 className="heading-lg">
            Election <span className="text-gradient-saffron">Timeline</span>
          </h1>
          <p>Your personalized election timeline. </p>
        </div>

        {!contextSet && (
          <form
            className={`glass-card ${styles.contextForm} animate-fade-in-up`}
            onSubmit={handlePersonalize}
            style={{ marginBottom: '40px', maxWidth: '450px', margin: '0 auto', padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}
          >
            <div style={{ textAlign: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '2rem' }}>🎯</span>
              <h3 className="heading-md" style={{ marginTop: '12px' }}>Personalize Timeline</h3>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', color: 'var(--text-secondary)', fontWeight: '600' }}>Your Age</label>
              <input
                type="number"
                placeholder="e.g., 25"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                min="0"
                max="150"
                required
                style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'var(--surface)', color: 'white', fontSize: '1rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', color: 'var(--text-secondary)', fontWeight: '600' }}>Your State</label>
              <input
                type="text"
                placeholder="e.g., Delhi"
                value={state}
                onChange={(e) => setState(e.target.value)}
                style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'var(--surface)', color: 'white', fontSize: '1rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', color: 'var(--text-secondary)', fontWeight: '600' }}>Do you have a Voter ID?</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  style={{ flex: 1, padding: '14px', borderRadius: '10px', border: `1px solid ${hasVoterId === true ? 'var(--saffron)' : 'var(--glass-border)'}`, background: hasVoterId === true ? 'rgba(255, 153, 51, 0.15)' : 'var(--surface)', color: 'white', fontSize: '1rem', fontWeight: hasVoterId === true ? '600' : '400', transition: 'all 0.2s' }}
                  onClick={() => setHasVoterId(true)}
                >
                  ✅ Yes
                </button>
                <button
                  type="button"
                  style={{ flex: 1, padding: '14px', borderRadius: '10px', border: `1px solid ${hasVoterId === false ? 'var(--saffron)' : 'var(--glass-border)'}`, background: hasVoterId === false ? 'rgba(255, 153, 51, 0.15)' : 'var(--surface)', color: 'white', fontSize: '1rem', fontWeight: hasVoterId === false ? '600' : '400', transition: 'all 0.2s' }}
                  onClick={() => setHasVoterId(false)}
                >
                  ❌ No
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={!age || hasVoterId === null}
              style={{ width: "100%", justifyContent: "center", marginTop: '12px', padding: '16px', fontSize: '1.1rem' }}
            >
              Get Personalized Timeline →
            </button>
          </form>
        )}

        {contextSet && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', padding: '16px', background: 'rgba(255,153,51,0.1)', borderRadius: '12px', border: '1px solid rgba(255,153,51,0.2)' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--saffron)', textTransform: 'uppercase', letterSpacing: '1px' }}>Personalized View Active</span>
              <div style={{ fontSize: '1rem', marginTop: '4px' }}>
                For a {age}-year-old in {state || "India"} {hasVoterId ? "with Voter ID" : "without Voter ID"}
              </div>
            </div>
            <button className="btn btn-secondary" onClick={handleReset} style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
              Reset
            </button>
          </div>
        )}

        {loading && (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading timeline...</p>
          </div>
        )}
        {error && (
          <div className={`glass-card ${styles.errorCard}`}>
            <p>⚠️ {error}</p>
          </div>
        )}

        {data && (
          <>
            {/* Next Action — from API */}
            <div style={{ marginTop: '48px', marginBottom: '48px' }}>
              <NextAction
                icon={data.next_action_icon}
                action={data.next_action}
                detail={data.next_action_detail}
                url={data.next_action_url}
              />
            </div>

            {/* Summary Card */}
            <div
              className={`glass-card ${styles.summary} animate-fade-in-up`}
            >
              <h2 className="heading-md">{data.election_name}</h2>
              <div className={styles.summaryStats}>
                <div>
                  <span className={styles.num}>{data.total_phases}</span>
                  <span className={styles.lbl}>Phases</span>
                </div>
                <div>
                  <span className={styles.num}>
                    {data.phases.reduce((s, p) => s + p.seats, 0)}
                  </span>
                  <span className={styles.lbl}>Seats</span>
                </div>
                <div>
                  <span className={styles.num}>{data.result_date}</span>
                  <span className={styles.lbl}>Result Date</span>
                </div>
              </div>
            </div>

            {/* Current Action Banner */}
            {data.current_action && (
              <div
                className={`${styles.actionBanner} animate-fade-in-up`}
                id="current-action"
              >
                <div className={styles.actionIcon}>
                  {data.current_phase_index !== null ? "📢" : "📋"}
                </div>
                <div className={styles.actionBody}>
                  <span className={styles.actionLabel}>
                    {contextSet ? "Your Deadline & Action" : (data.current_phase_index !== null
                      ? `Phase ${data.phases[data.current_phase_index].phase} is active`
                      : "What you should do now")}
                  </span>
                  <p><strong>{data.current_action}</strong></p>
                  {data.user_deadline && (
                    <div style={{ marginTop: '8px', display: 'inline-flex', padding: '4px 12px', background: 'rgba(220, 38, 38, 0.1)', border: '1px solid rgba(220, 38, 38, 0.3)', borderRadius: '100px', color: '#f87171', fontSize: '0.85rem', alignItems: 'center', gap: '6px' }}>
                      ⏳ <b>Deadline:</b> {data.user_deadline}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* AI Summary — "what this means now" */}
            {data.ai_summary && (
              <div className={`${styles.aiSummary} animate-fade-in-up`} id="timeline-ai-summary">
                <div className={styles.aiLabel}>
                  <span>🤖</span>
                  <span>What this means for you</span>
                </div>
                <p>{data.ai_summary}</p>
              </div>
            )}

            {/* Timeline */}
            <div className={styles.timeline}>
              {data.phases.map((phase, i) => {
                const isCurrent = i === data.current_phase_index;
                return (
                  <div
                    key={phase.phase}
                    ref={isCurrent ? activeRef : null}
                    className={`${styles.phaseCard} ${
                      isCurrent ? styles.currentPhase : ""
                    } animate-fade-in-up`}
                    style={{ animationDelay: `${i * 0.1}s` }}
                    id={`phase-${phase.phase}`}
                  >

                    <div className={`glass-card ${styles.content}`}>
                      <div className={styles.phaseHeader}>
                        <div>
                          <span className={statusBadge(phase.status)}>
                            {statusLabel(phase.status)}
                          </span>
                          <h3 className={styles.phaseTitle}>
                            Phase {phase.phase}
                          </h3>
                        </div>
                        <span className={styles.date}>📅 {phase.date}</span>
                      </div>
                      <span className={styles.seats}>
                        🏛️ {phase.seats} seats
                      </span>
                      <div className={styles.states}>
                        {phase.states.map((s) => (
                          <span key={s} className={styles.stateTag}>
                            {s}
                          </span>
                        ))}
                      </div>

                      {/* Per-phase action */}
                      {phase.user_action && (
                        <div
                          className={`${styles.phaseAction} ${
                            isCurrent ? styles.phaseActionActive : ""
                          }`}
                        >
                          <span>👉</span>
                          <p>{phase.user_action}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Data Source */}
            <div className={styles.sourceInfo} id="timeline-source">
              <p>
                📊 Data sourced from{" "}
                <a
                  href="https://eci.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {data.data_source || "Election Commission of India"}
                </a>
              </p>
              {data.last_updated && (
                <p>Last updated: {data.last_updated}</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
