"use client";

import { useState, useEffect } from "react";
import { useGoogleLogin, googleLogout } from "@react-oauth/google";
import Image from "next/image";
import { api } from "../lib/api";
import styles from "./Navbar.module.css";

export default function GoogleAuthButton() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("votesarthi_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem("votesarthi_user");
      }
    }
  }, []);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const userInfo = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        }).then(res => res.json());

        const data = await api.googleProfileAuth(userInfo);
        
        setUser(data.user);
        localStorage.setItem("votesarthi_session", data.session_token);
        localStorage.setItem("votesarthi_user", JSON.stringify(data.user));
      } catch (err) {
        console.error("Auth error:", err);
      } finally {
        setLoading(false);
      }
    },
    onError: () => console.error("Login Failed"),
  });

  const handleLogout = () => {
    googleLogout();
    setUser(null);
    localStorage.removeItem("votesarthi_session");
    localStorage.removeItem("votesarthi_user");
  };

  if (user) {
    return (
      <div className={styles.userProfile}>
        {user.picture ? (
          <Image src={user.picture} alt="Profile" width={32} height={32} className={styles.avatar} />
        ) : (
          <div className={styles.avatarFallback}>{user.name?.charAt(0) || "U"}</div>
        )}
        <div className={styles.userInfo}>
          <span className={styles.userName}>{user.name?.split(' ')[0]}</span>
          <button onClick={handleLogout} className={styles.logoutBtn}>Logout</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.authWrapper}>
      <button 
        onClick={() => login()} 
        className={styles.signInBtn}
        disabled={loading}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
          <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
          <path d="M3.964 10.707a5.41 5.41 0 010-3.414V4.961H.957a8.992 8.992 0 000 8.078l3.007-2.332z" fill="#FBBC05"/>
          <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.484 0 2.443 2.017.957 4.961L3.964 7.293c.708-2.127 2.692-3.713 5.036-3.713z" fill="#EA4335"/>
        </svg>
        <span>{loading ? "Connecting..." : "Sign In"}</span>
      </button>
      <span className={styles.subText}>Connect to Google</span>
    </div>
  );
}
