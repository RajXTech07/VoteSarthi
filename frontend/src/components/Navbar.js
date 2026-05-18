"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./Navbar.module.css";
import AuthBadge from "./AuthBadge";

const navStructure = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  {
    label: "Get Started",
    subLinks: [
      { href: "/eligibility", label: "Eligibility" },
      { href: "/steps", label: "Voting Steps" },
      { href: "/timeline", label: "Timeline" },
    ],
  },
  {
    label: "Explore",
    subLinks: [
      { href: "/documents", label: "Documents" },
      { href: "/steps", label: "Voting Day Guide" },
    ],
  },
  {
    label: "Tools",
    subLinks: [
      { href: "/simulation", label: "Simulation" },
      { href: "/what-if", label: "What If?" },
      { href: "/booth-finder", label: "Find Booth" },
    ],
  },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim().toLowerCase();
    if (!q) return;

    // Flatten all nav links to search through them
    const allLinks = navStructure.flatMap(item => {
      if (item.href) return [{ label: item.label.toLowerCase(), href: item.href }];
      if (item.subLinks) return item.subLinks.map(sub => ({ label: sub.label.toLowerCase(), href: sub.href }));
      return [];
    });

    // Find first match
    const match = allLinks.find(link => link.label.includes(q) || q.includes(link.label));

    if (match) {
      router.push(match.href);
    } else {
      // Fallbacks
      if (q.includes("eligibility") || q.includes("voter id")) router.push("/eligibility");
      else if (q.includes("step") || q.includes("vote")) router.push("/steps");
      else if (q.includes("news") || q.includes("timeline")) router.push("/timeline");
      else if (q.includes("report") || q.includes("issue")) router.push("/report");
      else if (q.includes("faq") || q.includes("question")) router.push("/faq");
      else if (q.includes("simulation") || q.includes("game")) router.push("/simulation");
      else if (q.includes("booth") || q.includes("find")) router.push("/booth-finder");
      else window.alert(`Sorry, no exact page found for "${searchQuery}".`);
    }
    setSearchQuery("");
  };

  useEffect(() => {
    const checkLogin = () => {
      setIsLoggedIn(!!localStorage.getItem("votesarthi_session"));
    };
    checkLogin();
    const interval = setInterval(checkLogin, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const onScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Add scrolled background when past 20px
      setScrolled(currentScrollY > 20);

      // Hide navbar when scrolling down, show when scrolling up
      // Add a small threshold (e.g., 10px) to prevent jittering
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setHidden(true); // Scrolling down (or user swiping up)
      } else if (currentScrollY < lastScrollY - 10 || currentScrollY <= 80) {
        setHidden(false); // Scrolling up
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`${styles.navbar} ${scrolled ? styles.scrolled : ""} ${
        hidden ? styles.hidden : ""
      }`}
      id="main-navbar"
    >
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          <Image src="/logo.png" alt="VoteSarthi Logo" width={32} height={32} className={styles.logoImage} />
          <span className={styles.logoText}>
            Vote<span className="text-gradient-saffron">Sarthi</span>
          </span>
        </Link>

        <div className={`${styles.links} ${menuOpen ? styles.open : ""}`}>
          {navStructure.map((item) => {
            // Dynamic filtering based on auth state
            if (isLoggedIn && (item.label === "Home" || item.label === "Get Started")) return null;
            if (!isLoggedIn && item.label === "Dashboard") return null;

            if (item.href) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.link} ${pathname === item.href ? styles.active : ""}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              );
            }

            const isActive = item.subLinks.some(sub => pathname === sub.href);
            return (
              <div key={item.label} className={styles.dropdown}>
                <button className={`${styles.dropdownToggle} ${isActive ? styles.active : ""}`}>
                  {item.label} ▾
                </button>
                <div className={styles.dropdownMenu}>
                  {item.subLinks.map((sub) => (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      className={`${styles.dropdownItem} ${pathname === sub.href ? styles.active : ""}`}
                      onClick={() => setMenuOpen(false)}
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className={styles.rightSection}>
          <div className={styles.toolsArea}>
            <form className={styles.searchForm} onSubmit={handleSearch}>
              <input 
                type="text" 
                placeholder="Search..." 
                className={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className={styles.searchBtn}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </button>
            </form>
          </div>

          <AuthBadge />

          <button
            className={`${styles.hamburger} ${menuOpen ? styles.open : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            id="navbar-toggle"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </nav>
  );
}
