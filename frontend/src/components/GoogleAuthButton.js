"use client";

import { useState, useEffect } from "react";
import { GoogleLogin, googleLogout } from "@react-oauth/google";
import Image from "next/image";
import styles from "./Navbar.module.css";

export default function GoogleAuthButton() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is already logged in (prototype: check localStorage)
    const storedUser = localStorage.getItem("votesarthi_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user session", e);
      }
    }
  }, []);

  const handleSuccess = async (credentialResponse) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        localStorage.setItem("votesarthi_session", data.session_token);
        localStorage.setItem("votesarthi_user", JSON.stringify(data.user));
      } else {
        console.error("Authentication failed on backend");
      }
    } catch (err) {
      console.error("Auth error:", err);
    }
  };

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
        <span className={styles.userName}>{user.name?.split(' ')[0]}</span>
        <button onClick={handleLogout} className={styles.logoutBtn}>Logout</button>
      </div>
    );
  }

  return (
    <div className={styles.authWrapper}>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => console.error("Google Login Failed")}
        useOneTap
        shape="pill"
        theme="filled_black"
        text="continue_with"
      />
    </div>
  );
}
