"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import styles from "./page.module.css";

const STATUS_CONFIG = {
  accepted: {
    emoji: "✅",
    label: "Accepted",
    color: "var(--green)",
    bg: "rgba(19, 136, 8, 0.08)",
    border: "rgba(19, 136, 8, 0.25)",
    desc: "Valid at the polling booth",
  },
  not_accepted: {
    emoji: "❌",
    label: "Not Accepted",
    color: "var(--danger)",
    bg: "rgba(220, 53, 69, 0.08)",
    border: "rgba(220, 53, 69, 0.25)",
    desc: "Cannot be used for voting",
  },
  conditional: {
    emoji: "⚠️",
    label: "Conditional",
    color: "var(--saffron)",
    bg: "rgba(255, 153, 51, 0.08)",
    border: "rgba(255, 153, 51, 0.25)",
    desc: "Accepted only for registration",
  },
};

export default function DocumentsPage() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!localStorage.getItem("votesarthi_session")) {
      router.push("/login");
      return;
    }
    api
      .getDocuments()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className={styles.page}>
        <div className="container">
          <div className="page-header">
            <span className="badge badge-saffron">Tool #6</span>
            <h1 className="heading-lg">
              Document <span className="text-gradient-saffron">Validator</span>
            </h1>
          </div>
          <div className={styles.loading}>Loading documents...</div>
        </div>
      </div>
    );
  }

  const docs = data?.documents || [];
  const filtered =
    filter === "all" ? docs : docs.filter((d) => d.status === filter);

  return (
    <div className={styles.page}>
      <div className="container">
        <div className="page-header">
          <span className="badge badge-saffron">Tool #6</span>
          <h1 className="heading-lg">
            Document <span className="text-gradient-saffron">Validator</span>
          </h1>
          <p>
            Select a document → instantly know if it&apos;s valid for voting.
          </p>
        </div>

        {/* Stats Bar */}
        <div className={`${styles.statsBar} animate-fade-in-up`}>
          <button
            className={`${styles.statBtn} ${filter === "all" ? styles.activeAll : ""}`}
            onClick={() => setFilter("all")}
          >
            <span className={styles.statNum}>{data?.total}</span>
            <span className={styles.statLabel}>All Documents</span>
          </button>
          <button
            className={`${styles.statBtn} ${filter === "accepted" ? styles.activeAccepted : ""}`}
            onClick={() => setFilter("accepted")}
          >
            <span className={styles.statNum}>✅ {data?.accepted_count}</span>
            <span className={styles.statLabel}>Accepted</span>
          </button>
          <button
            className={`${styles.statBtn} ${filter === "not_accepted" ? styles.activeRejected : ""}`}
            onClick={() => setFilter("not_accepted")}
          >
            <span className={styles.statNum}>❌ {data?.not_accepted_count}</span>
            <span className={styles.statLabel}>Not Accepted</span>
          </button>
          <button
            className={`${styles.statBtn} ${filter === "conditional" ? styles.activeConditional : ""}`}
            onClick={() => setFilter("conditional")}
          >
            <span className={styles.statNum}>⚠️ {data?.conditional_count}</span>
            <span className={styles.statLabel}>Conditional</span>
          </button>
        </div>

        {/* Document Grid */}
        <div className={styles.grid}>
          {filtered.map((doc, i) => {
            const cfg = STATUS_CONFIG[doc.status];
            const isSelected = selected?.id === doc.id;

            return (
              <div
                key={doc.id}
                className={`${styles.docCard} ${isSelected ? styles.docSelected : ""} animate-fade-in-up`}
                style={{
                  "--status-color": cfg.color,
                  "--status-bg": cfg.bg,
                  "--status-border": cfg.border,
                  animationDelay: `${i * 0.04}s`,
                }}
                id={`doc-${doc.id}`}
              >
                <div 
                  className={styles.docTop} 
                  onClick={() => setSelected(isSelected ? null : doc)}
                  style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}
                >
                  <div className={styles.docHeaderContent}>
                    <span className={styles.docIcon}>{doc.icon}</span>
                    <div>
                      <h4 className={styles.docName}>{doc.name}</h4>
                      <p className={styles.docStatusDesc}>{cfg.desc}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span className={styles.docStatus} style={{ background: cfg.bg, padding: '4px 10px', borderRadius: '100px', border: `1px solid ${cfg.border}` }}>
                      {cfg.emoji} {cfg.label}
                    </span>
                    <span style={{ fontSize: '1.2rem', transform: isSelected ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>▼</span>
                  </div>
                </div>

                {isSelected && (
                  <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--glass-border)', animation: 'fadeIn 0.3s ease-out' }}>
                    <div className={styles.detailBody}>
                      {/* Valid For */}
                      {doc.use_for.length > 0 && (
                        <div className={styles.detailRow}>
                          <span className={styles.detailLabel}>Valid For</span>
                          <div className={styles.useTags}>
                            {doc.use_for.map((u) => (
                              <span key={u} className={styles.useTag}>
                                {u === "voting" ? "🗳️ Voting" : "📝 Registration"}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Conditions */}
                      {doc.conditions && (
                        <div className={styles.detailRow}>
                          <span className={styles.detailLabel}>
                            {doc.status === "accepted" ? "⚠️ Conditions" : "📋 Details"}
                          </span>
                          <p className={styles.detailText}>{doc.conditions}</p>
                        </div>
                      )}

                      {/* Tip */}
                      {doc.tip && (
                        <div className={styles.detailRow}>
                          <span className={styles.detailLabel}>💡 Tip</span>
                          <p className={styles.detailText}>{doc.tip}</p>
                        </div>
                      )}

                      {/* How to Get */}
                      {doc.how_to_get && (
                        <div className={styles.detailRow}>
                          <span className={styles.detailLabel}>📥 How to Get</span>
                          <p className={styles.detailText}>{doc.how_to_get}</p>
                        </div>
                      )}

                      {/* Apply Link */}
                      {doc.apply_link && (
                        <div style={{ marginTop: '16px' }}>
                          <a href={doc.apply_link} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ display: 'inline-flex', padding: '10px 24px' }}>
                            Apply for {doc.name} →
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Help Note */}
        <div className={`glass-card ${styles.helpNote} animate-fade-in-up`}>
          <h4>📌 Quick Reference</h4>
          <ul>
            <li>
              <strong>12 documents</strong> are approved by the Election
              Commission of India for voter identity at polling booths.
            </li>
            <li>
              <strong>Voter ID (EPIC)</strong> is the primary document — apply on{" "}
              <a href="https://voters.eci.gov.in" target="_blank" rel="noopener noreferrer">
                voters.eci.gov.in
              </a>
              .
            </li>
            <li>
              <strong>No Voter ID?</strong> Any one of the 11 other approved
              documents will work at the polling booth.
            </li>
            <li>
              Documents marked <strong>⚠️ Conditional</strong> are only accepted
              during voter registration — not at the booth.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
