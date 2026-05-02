import Link from "next/link";
import NextAction from "@/components/NextAction";
import SmartDashboard from "@/components/SmartDashboard";
import styles from "./page.module.css";

const features = [
  {
    icon: "✅",
    title: "Eligibility Checker",
    description: "3 questions → instant result.",
    href: "/eligibility",
    color: "saffron",
  },
  {
    icon: "📋",
    title: "Voting Steps",
    description: "Personalized guide: registration → voting day.",
    href: "/steps",
    color: "green",
  },
  {
    icon: "📅",
    title: "Election Timeline",
    description: "All phases · dates · your next action.",
    href: "/timeline",
    color: "saffron",
  },
  {
    icon: "📍",
    title: "Find Polling Booth",
    description: "Enter PIN code → see booths on Google Maps.",
    href: "/booth-finder",
    color: "green",
  },
  {
    icon: "📄",
    title: "Document Validator",
    description: "Check if your ID is valid for voting.",
    href: "/documents",
    color: "saffron",
  },
  {
    icon: "💬",
    title: "FAQ Assistant",
    description: "Ask anything → clear, sourced answers.",
    href: "/faq",
    color: "green",
  },
];

export default function HomePage() {
  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroContent}>
            <span className="badge badge-saffron animate-fade-in-up">
              🇮🇳 Your Smart Election Guide
            </span>
            <h1 className="heading-xl animate-fade-in-up delay-1">
              Understand Elections.
              <br />
              <span className="text-gradient-tricolor">Exercise Your Right.</span>
            </h1>
            <p className={`${styles.heroSubtitle} animate-fade-in-up delay-2`}>
              Personalized guidance · Smart recommendations · Real-time updates
            </p>
            <div className={`${styles.heroCta} animate-fade-in-up delay-3`}>
              <Link href="/eligibility" className="btn btn-primary">
                Check Eligibility →
              </Link>
              <Link href="/steps" className="btn btn-secondary">
                View Voting Steps
              </Link>
            </div>
          </div>

          {/* Smart Dashboard — the brain */}
          <div className="animate-fade-in-up delay-3">
            <SmartDashboard />
          </div>

          {/* Stats */}
          <div className={`${styles.stats} animate-fade-in-up delay-4`}>
            <div className={styles.stat}>
              <span className={styles.statNumber}>96.8 Cr</span>
              <span className={styles.statLabel}>Registered Voters</span>
            </div>
            <div className={styles.statDivider}></div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>543</span>
              <span className={styles.statLabel}>Lok Sabha Seats</span>
            </div>
            <div className={styles.statDivider}></div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>7</span>
              <span className={styles.statLabel}>Election Phases</span>
            </div>
            <div className={styles.statDivider}></div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>10.5L+</span>
              <span className={styles.statLabel}>Polling Stations</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className={styles.features}>
        <div className="container">
          <div className={styles.featureGrid}>
            {features.map((feature, i) => (
              <Link
                key={feature.href}
                href={feature.href}
                className={`glass-card ${styles.featureCard} animate-fade-in-up delay-${i + 1}`}
                id={`feature-${feature.href.slice(1)}`}
              >
                <span className={styles.featureIcon}>{feature.icon}</span>
                <h3 className="heading-md">{feature.title}</h3>
                <p>{feature.description}</p>
                <span
                  className={`${styles.featureArrow} ${
                    feature.color === "saffron"
                      ? "text-gradient-saffron"
                      : "text-gradient-green"
                  }`}
                >
                  Explore →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <div className="container">
          <div className={`glass-card ${styles.ctaCard}`}>
            <h2 className="heading-lg">
              Every vote counts.{" "}
              <span className="text-gradient-saffron">Make yours count too.</span>
            </h2>
            <p>Takes less than 30 seconds.</p>
            <Link href="/eligibility" className="btn btn-primary">
              Get Started →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
