"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import styles from "./AuthBadge.module.css";

export default function AuthBadge() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Check user on mount and when local storage changes
    const loadUser = () => {
      const storedUser = localStorage.getItem("votesarthi_user");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error("Failed to parse user from local storage");
        }
      } else {
        setUser(null);
      }
    };
    
    loadUser();

    // Setup an interval to watch for localStorage changes in case another tab/component updates it
    const intervalId = setInterval(loadUser, 1000);
    
    // Close dropdown on click outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      clearInterval(intervalId);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out from Firebase:", error);
    }
    localStorage.removeItem("votesarthi_session");
    localStorage.removeItem("votesarthi_user");
    setUser(null);
    setMenuOpen(false);
    router.push("/login");
  };

  const goToProfile = () => {
    setMenuOpen(false);
    router.push("/profile");
  };

  if (!user) {
    return (
      <div className={styles.wrapper}>
        <button onClick={() => router.push("/login")} className={styles.signInBtn}>
          Sign In
        </button>
      </div>
    );
  }

  const getInitials = () => {
    if (user?.name) return user.name.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    if (user?.mobile_number) return "M";
    return "U";
  };

  return (
    <div className={styles.wrapper} ref={dropdownRef}>
      <button 
        className={styles.avatarBtn} 
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle profile menu"
      >
        {user.picture ? (
          <Image src={user.picture} alt="Profile" width={40} height={40} className={styles.avatarImg} />
        ) : (
          <span className={styles.avatarFallback}>{getInitials()}</span>
        )}
      </button>

      {menuOpen && (
        <div className={styles.dropdown}>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user.name || user.mobile_number || "User"}</span>
            {user.email && <span className={styles.userEmail}>{user.email}</span>}
          </div>
          <button className={styles.menuItem} onClick={goToProfile}>
            My Profile
          </button>
          <button className={`${styles.menuItem} ${styles.logoutItem}`} onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
