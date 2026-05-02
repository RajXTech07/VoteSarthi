import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer} id="footer">
      <div className={`container ${styles.inner}`}>
        {/* Trust Bar */}
        <div className={styles.trustBar} id="trust-bar">
          <div className={styles.trustItem}>
            <span className={styles.trustIcon}>🏛️</span>
            <div>
              <span className={styles.trustLabel}>Data sourced from</span>
              <a
                href="https://eci.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.trustLink}
              >
                Election Commission of India
              </a>
            </div>
          </div>
          <div className={styles.trustItem}>
            <span className={styles.trustIcon}>📋</span>
            <div>
              <span className={styles.trustLabel}>Voter Services</span>
              <a
                href="https://voters.eci.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.trustLink}
              >
                National Voter Service Portal
              </a>
            </div>
          </div>
          <div className={styles.trustItem}>
            <span className={styles.trustIcon}>🕐</span>
            <div>
              <span className={styles.trustLabel}>Last updated</span>
              <span className={styles.trustValue}>June 2024</span>
            </div>
          </div>
        </div>

        <div className={styles.divider}></div>

        {/* Main Footer */}
        <div className={styles.top}>
          <div className={styles.brand}>
            <span className={styles.logo}>
              <img src="/logo.png" alt="VoteSarthi Logo" width={24} height={24} style={{ borderRadius: '6px', objectFit: 'cover' }} />
              VoteSarthi
            </span>
            <p className={styles.tagline}>
              Making Indian elections simpler for every citizen.
            </p>
          </div>
          <div className={styles.linkGroups}>
            <div className={styles.group}>
              <h4>Tools</h4>
              <Link href="/eligibility">Eligibility Checker</Link>
              <Link href="/steps">Voting Steps</Link>
              <Link href="/timeline">Election Timeline</Link>
              <Link href="/faq">FAQ Assistant</Link>
            </div>
            <div className={styles.group}>
              <h4>Official Resources</h4>
              <a href="https://voters.eci.gov.in" target="_blank" rel="noopener noreferrer">
                NVSP Portal ↗
              </a>
              <a href="https://eci.gov.in" target="_blank" rel="noopener noreferrer">
                Election Commission ↗
              </a>
              <a href="https://results.eci.gov.in" target="_blank" rel="noopener noreferrer">
                Election Results ↗
              </a>
            </div>
          </div>
        </div>

        <div className={styles.divider}></div>

        <div className={styles.bottom}>
          <p>© 2024 VoteSarthi. For educational purposes only.</p>
          <p className={styles.disclaimer}>
            Not affiliated with the Election Commission of India. All data is publicly available.
          </p>
        </div>
      </div>
    </footer>
  );
}
