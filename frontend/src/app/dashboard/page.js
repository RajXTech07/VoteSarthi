"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import styles from "./page.module.css";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [news, setNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [timeline, setTimeline] = useState(null);
  const [eligibility, setEligibility] = useState(null);

  // Load user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("votesarthi_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        router.push("/login");
      }
    } else {
      router.push("/login");
    }
  }, [router]);

  // Fetch news feed
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const data = await api.getNews();
        setNews(data.articles || []);
      } catch (err) {
        console.error("Failed to fetch news:", err);
      } finally {
        setNewsLoading(false);
      }
    };
    fetchNews();
  }, []);

  // Fetch timeline
  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        const data = await api.getTimeline();
        setTimeline(data);
      } catch (err) {
        console.error("Failed to fetch timeline:", err);
      }
    };
    fetchTimeline();
  }, []);

  // Helper: format time ago
  const timeAgo = (dateStr) => {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (!user) return null;

  return (
    <div className={styles.page}>
      <div className="container">
        {/* Page Header */}
        <div className={styles.header}>
          <h1 className={styles.greeting}>
            Welcome back, <span className="text-gradient-saffron">{user.name || user.email || "Voter"}</span>
          </h1>
          <p className={styles.headerSub}>Your personalized election dashboard</p>
        </div>

        {/* Bento Grid */}
        <div className={styles.bentoGrid}>

          {/* ─── Card 1: Eligibility Status ─── */}
          <div className={`${styles.card} ${styles.eligibility}`}>
            <div className={styles.cardIcon}>
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="22" stroke="var(--green)" strokeWidth="3" fill="rgba(19, 136, 8, 0.1)"/>
                <path d="M16 24L22 30L34 18" stroke="var(--green-light)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className={styles.eligibilityContent}>
              <span className={styles.cardLabel}>My Eligibility Status</span>
              <h2 className={styles.eligibilityTitle}>Eligible to Vote</h2>
              <div className={styles.eligibilityChecks}>
                <div className={styles.checkItem}>
                  <span className={styles.checkIcon}>✅</span>
                  <span><strong>Age:</strong> 18+ <span className={styles.verified}>(Verified)</span></span>
                </div>
                <div className={styles.checkItem}>
                  <span className={styles.checkIcon}>✅</span>
                  <span><strong>Citizenship:</strong> Indian <span className={styles.verified}>(Verified)</span></span>
                </div>
                <div className={styles.checkItem}>
                  <span className={styles.checkIcon}>✅</span>
                  <span><strong>Voter ID:</strong> Linked</span>
                </div>
              </div>
              <Link href="/eligibility" className={styles.cardBtn}>
                Update Details
              </Link>
            </div>
          </div>

          {/* ─── Card 2: Election Timeline ─── */}
          <div className={`${styles.card} ${styles.timeline}`}>
            <h3 className={styles.cardTitle}>Election Timeline</h3>
            <div className={styles.timelineTrack}>
              {[
                { label: "Notification", icon: "📢", done: true },
                { label: "Nomination", icon: "📝", done: true },
                { label: "Scrutiny", icon: "🔍", done: true },
                { label: "Polling Day", icon: "📅", done: false, active: true },
                { label: "Results", icon: "🏛️", done: false },
              ].map((step, i) => (
                <div key={i} className={`${styles.timelineStep} ${step.done ? styles.done : ""} ${step.active ? styles.active : ""}`}>
                  <div className={styles.timelineDot}>
                    <span>{step.icon}</span>
                  </div>
                  <span className={styles.timelineLabel}>{step.label}</span>
                </div>
              ))}
            </div>
            <Link href="/timeline" className={styles.timelineLink}>
              View Full Timeline →
            </Link>
          </div>

          {/* ─── Card 3: Polling Station Finder ─── */}
          <div className={`${styles.card} ${styles.polling}`}>
            <div className={styles.pollingIcon}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--saffron)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <h3 className={styles.cardTitle}>Polling Station Finder</h3>
            <Link href="/booth-finder" className={styles.pollingBtn}>
              Find Your Station
            </Link>
            <p className={styles.pollingHint}>Enter PIN code to locate nearest booth</p>
          </div>

          {/* ─── Card 4: Smart Election Assistant ─── */}
          <div className={`${styles.card} ${styles.assistant}`}>
            <div className={styles.assistantHeader}>
              <span className={styles.assistantIcon}>🧠</span>
              <h3 className={styles.assistantTitle}>Smart Election Assistant</h3>
            </div>
            <p className={styles.assistantDesc}>
              Get personalized voting guidance, action plans, and smart recommendations powered by AI — tailored to your profile.
            </p>
            <Link href="/#smart-dashboard" className={styles.assistantBtn}>
              Launch Assistant →
            </Link>
          </div>

          {/* ─── Card 5: Voter Guide & Resources ─── */}
          <div className={`${styles.card} ${styles.resources}`}>
            <h3 className={styles.cardTitle}>Voter Guide & Resources</h3>
            <div className={styles.resourceGrid}>
              <Link href="/steps" className={styles.resourceItem}>
                <span className={styles.resourceIcon}>📋</span>
                <span className={styles.resourceLabel}>How to Vote</span>
                <span className={styles.resourceArrow}>Learn More ↗</span>
              </Link>
              <Link href="/documents" className={styles.resourceItem}>
                <span className={styles.resourceIcon}>📄</span>
                <span className={styles.resourceLabel}>Documents</span>
                <span className={styles.resourceArrow}>Learn More ↗</span>
              </Link>
              <Link href="/faq" className={styles.resourceItem}>
                <span className={styles.resourceIcon}>💬</span>
                <span className={styles.resourceLabel}>FAQs</span>
                <span className={styles.resourceArrow}>Learn More ↗</span>
              </Link>
              <Link href="/what-if" className={styles.resourceItem}>
                <span className={styles.resourceIcon}>⚖️</span>
                <span className={styles.resourceLabel}>Election Laws</span>
                <span className={styles.resourceArrow}>Learn More ↗</span>
              </Link>
            </div>
          </div>

          {/* ─── Card 6: Latest News Feed ─── */}
          <div className={`${styles.card} ${styles.newsFeed}`}>
            <h3 className={styles.cardTitle}>Latest News Feed</h3>
            <div className={styles.newsScroll}>
              {newsLoading ? (
                <>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className={`${styles.newsItem} ${styles.skeleton}`}>
                      <div className={styles.newsText}>
                        <div className={`${styles.skeletonText} ${styles.skeletonTitle}`}></div>
                        <div className={`${styles.skeletonText} ${styles.skeletonMeta}`}></div>
                      </div>
                      <div className={`${styles.newsThumb} ${styles.skeletonThumb}`}></div>
                    </div>
                  ))}
                </>
              ) : news.length === 0 ? (
                <p className={styles.newsEmpty}>No news available right now.</p>
              ) : (
                news.slice(0, 5).map((article, i) => (
                  <a
                    key={i}
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.newsItem}
                  >
                    <div className={styles.newsText}>
                      <h4 className={styles.newsTitle}>{article.title}</h4>
                      <span className={styles.newsMeta}>
                        {article.source} · {timeAgo(article.publishedAt)}
                      </span>
                    </div>
                    {article.image && (
                      <img
                        src={article.image}
                        alt=""
                        className={styles.newsThumb}
                        onError={(e) => { e.target.style.display = "none"; }}
                      />
                    )}
                  </a>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
