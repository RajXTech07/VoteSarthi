"use client";

import styles from "./NextAction.module.css";

/**
 * Pinned "Next Action" card — shown at the top of every page
 * after the user gets a result from any API.
 *
 * Props:
 *   icon    — emoji string (e.g. "🗳️")
 *   action  — one-line directive (e.g. "Apply for your Voter ID")
 *   detail  — brief explanation
 *   url     — optional external link
 */
export default function NextAction({ icon, action, detail, url }) {
  if (!action) return null;

  return (
    <div className={`${styles.card} animate-fade-in-up`} id="next-action-card">
      <div className={styles.left}>
        <span className={styles.icon}>{icon || "🔍"}</span>
        <div className={styles.text}>
          <span className={styles.label}>Your Next Action</span>
          <p className={styles.action}>{action}</p>
          {detail && <p className={styles.detail}>{detail}</p>}
        </div>
      </div>
      {url && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.link}
          id="next-action-link"
        >
          Go →
        </a>
      )}
    </div>
  );
}
