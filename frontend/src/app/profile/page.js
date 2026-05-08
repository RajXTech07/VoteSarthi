"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { api } from "../../lib/api";
import styles from "./page.module.css";

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    gender: "",
    dob: "",
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("votesarthi_user");
    if (!storedUser) {
      router.push("/login");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    setFormData({
      name: parsedUser.name || "",
      email: parsedUser.email || "",
      gender: parsedUser.gender || "",
      dob: parsedUser.dob || "",
    });
    setLoading(false);
  }, [router]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const sessionToken = localStorage.getItem("votesarthi_session");
      const updatedUser = await api.updateProfile(sessionToken, formData);
      
      setUser(updatedUser);
      localStorage.setItem("votesarthi_user", JSON.stringify(updatedUser));
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to save profile", err);
      alert("Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !user) {
    return <div className={styles.container}>Loading...</div>;
  }

  const getInitials = () => {
    if (user?.name) return user.name.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    if (user?.mobile_number) return "M";
    return "U";
  };

  return (
    <div className={styles.container}>
      <div className={styles.profileCard}>
        <div className={styles.header}>
          {!isEditing && (
            <button className={styles.editBtn} onClick={() => setIsEditing(true)}>
              Edit Profile
            </button>
          )}
          <div className={styles.avatarWrapper}>
            {user?.picture ? (
              <Image 
                src={user.picture} 
                alt="Profile Avatar" 
                width={100} 
                height={100} 
                className={styles.avatarImg} 
              />
            ) : (
              <span>{getInitials()}</span>
            )}
          </div>
          <h2 className={styles.name}>{user?.name || user?.mobile_number || "Complete Your Profile"}</h2>
        </div>

        <div className={styles.body}>
          <div className={styles.field}>
            <label className={styles.label}>Full Name</label>
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={styles.input}
                placeholder="Enter full name"
              />
            ) : (
              <div className={styles.value}>{user?.name || "Not provided"}</div>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Email ID</label>
            {isEditing ? (
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={styles.input}
                placeholder="Enter email address"
              />
            ) : (
              <div className={styles.value}>{user?.email || "Not provided"}</div>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Gender</label>
            {isEditing ? (
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={styles.select}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            ) : (
              <div className={styles.value}>{user?.gender || "Not provided"}</div>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Date of Birth</label>
            {isEditing ? (
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className={styles.input}
              />
            ) : (
              <div className={styles.value}>{user?.dob || "Not provided"}</div>
            )}
          </div>

          {isEditing && (
            <div className={styles.actionWrapper}>
              <button className={styles.cancelBtn} onClick={() => setIsEditing(false)} disabled={loading}>
                Cancel
              </button>
              <button className={styles.saveBtn} onClick={handleSave} disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
