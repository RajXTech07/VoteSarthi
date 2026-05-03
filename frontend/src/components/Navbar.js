"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import styles from "./Navbar.module.css";
import GoogleAuthButton from "./GoogleAuthButton";

const navStructure = [
  { href: "/", label: "Home" },
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
  {
    label: "Help",
    subLinks: [
      { href: "/faq", label: "FAQ" },
      { href: "/contact", label: "Contact" },
    ],
  },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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

        <GoogleAuthButton />

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
    </nav>
  );
}
