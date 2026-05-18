"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { api } from "../../lib/api";
import { storage } from "../../lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import styles from "./page.module.css";

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    gender: "",
    dob: "",
    state: "",
    district: "",
    picture: "",
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
      state: parsedUser.state || "",
      district: parsedUser.district || "",
      picture: parsedUser.picture || "",
    });
    setLoading(false);
  }, [router]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingPhoto(true);

    try {
      // 1. Client-side Image Compression (Resize & WebP)
      const compressedBlob = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
          const img = new window.Image(); // Use standard Image API
          img.src = event.target.result;
          img.onload = () => {
            const canvas = document.createElement("canvas");
            const maxSize = 300; // Profile pictures don't need to be huge
            
            let width = img.width;
            let height = img.height;
            
            if (width > height && width > maxSize) {
              height *= maxSize / width;
              width = maxSize;
            } else if (height > maxSize) {
              width *= maxSize / height;
              height = maxSize;
            }
            
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, width, height);
            
            canvas.toBlob((blob) => resolve(blob), "image/webp", 0.8);
          };
          img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
      });

      // 2. Upload Compressed Image
      const storageRef = ref(storage, `profiles/${user.uid}_${Date.now()}.webp`);
      const uploadTask = uploadBytesResumable(storageRef, compressedBlob);

      uploadTask.on(
        "state_changed",
        (snapshot) => {},
        (error) => {
          console.error("Upload failed", error);
          alert("Failed to upload photo. Ensure Firebase Storage is activated and rules allow writes.");
          setUploadingPhoto(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          // Set the picture locally immediately so they see it
          setFormData(prev => ({ ...prev, picture: downloadURL }));
          // Also instantly update the parent user object so the Avatar changes live
          setUser(prev => ({ ...prev, picture: downloadURL }));
          setUploadingPhoto(false);
        }
      );
    } catch (err) {
      console.error("Error setting up upload", err);
      setUploadingPhoto(false);
    }
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

  const [activeTab, setActiveTab] = useState("My Profile");

  if (loading && !user) {
    return <div className={styles.container}>Loading...</div>;
  }

  const getInitials = () => {
    if (user?.name) return user.name.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    if (user?.mobile_number) return "M";
    return "U";
  };

  const sidebarItems = [
    { id: "My Profile", icon: "👤" },
    { id: "Notification", icon: "🔔" },
    { id: "Security", icon: "🔒" },
    { id: "Appearance", icon: "🎨" }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.pageLayout}>
        {/* SIDEBAR */}
        <div className={styles.sidebar}>
          <div className={styles.sidebarTitle}>
            <span style={{ fontSize: "1.2rem" }}></span> ⚙️settings
          </div>
          {sidebarItems.map(item => (
            <button
              key={item.id}
              className={`${styles.sidebarItem} ${activeTab === item.id ? styles.sidebarItemActive : ""}`}
              onClick={() => setActiveTab(item.id)}
            >
              <span>{item.icon}</span> {item.id}
            </button>
          ))}
          <div style={{ marginTop: "auto" }}>
            <button
              className={`${styles.sidebarItem} ${activeTab === "Help" ? styles.sidebarItemActive : ""}`}
              onClick={() => setActiveTab("Help")}
              title="Help"
            >
              <span>❓</span>
            </button>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className={styles.mainContent}>
          {activeTab === "My Profile" && (
            <>
              <div className={styles.headerTop}>
                <h2 className={styles.pageTitle}>Welcome to Profile</h2>
                
                <div className={styles.avatarContainer}>
                  <div className={styles.avatarWrapper}>
                    {user?.picture ? (
                      <Image 
                        src={user.picture} 
                        alt="Profile Avatar" 
                        width={70} 
                        height={70} 
                        className={styles.avatarImg} 
                      />
                    ) : (
                      <span>{getInitials()}</span>
                    )}
                  </div>
                  {isEditing && (
                    <label className={styles.cameraOverlay}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                        <circle cx="12" cy="13" r="4"></circle>
                      </svg>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className={styles.hiddenInput}
                        disabled={uploadingPhoto}
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className={styles.formBody}>
                {/* Row 1 */}
                <div className={styles.gridRow}>
                  <div className={styles.field}>
                    <label className={styles.label}>Full Name</label>
                    {isEditing ? (
                      <input type="text" name="name" value={formData.name} onChange={handleChange} className={styles.input} />
                    ) : (
                      <div className={styles.value}>{user?.name || "Not provided"}</div>
                    )}
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Gender</label>
                    {isEditing ? (
                      <select name="gender" value={formData.gender} onChange={handleChange} className={styles.select}>
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    ) : (
                      <div className={styles.value}>{user?.gender || "Not provided"}</div>
                    )}
                  </div>
                </div>

                {/* Row 2 - Email & DOB */}
                <div className={styles.gridRow}>
                  <div className={styles.field}>
                    <label className={styles.label}>Email</label>
                    {isEditing ? (
                      <input type="email" name="email" value={formData.email} onChange={handleChange} className={styles.input} />
                    ) : (
                      <div className={styles.value}>{user?.email || "Not provided"}</div>
                    )}
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Date of Birth</label>
                    {isEditing ? (
                      <input type="date" name="dob" value={formData.dob} onChange={handleChange} className={styles.input} />
                    ) : (
                      <div className={styles.value}>{user?.dob || "Not provided"}</div>
                    )}
                  </div>
                </div>

                {/* Row 3 - Full Width */}
                <div className={styles.field}>
                  <label className={styles.label}>Contact Number</label>
                  {isEditing ? (
                    <input type="text" disabled value={user?.mobile_number || ""} className={styles.input} style={{ opacity: 0.6, cursor: "not-allowed" }} />
                  ) : (
                    <div className={styles.value}>{user?.mobile_number || "Not provided"}</div>
                  )}
                </div>

                {/* Row 4 - City & State */}
                <div className={styles.gridRow}>
                  <div className={styles.field}>
                    <label className={styles.label}>City / District</label>
                    {isEditing ? (
                      <input type="text" name="district" value={formData.district} onChange={handleChange} className={styles.input} placeholder="e.g. Mumbai" />
                    ) : (
                      <div className={styles.value}>{user?.district || "Not provided"}</div>
                    )}
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>State</label>
                    {isEditing ? (
                      <select name="state" value={formData.state} onChange={handleChange} className={styles.select}>
                        <option value="">Select State</option>
                        <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
                        <option value="Andhra Pradesh">Andhra Pradesh</option>
                        <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                        <option value="Assam">Assam</option>
                        <option value="Bihar">Bihar</option>
                        <option value="Chandigarh">Chandigarh</option>
                        <option value="Chhattisgarh">Chhattisgarh</option>
                        <option value="Dadra and Nagar Haveli">Dadra and Nagar Haveli</option>
                        <option value="Daman and Diu">Daman and Diu</option>
                        <option value="Delhi">Delhi</option>
                        <option value="Goa">Goa</option>
                        <option value="Gujarat">Gujarat</option>
                        <option value="Haryana">Haryana</option>
                        <option value="Himachal Pradesh">Himachal Pradesh</option>
                        <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                        <option value="Jharkhand">Jharkhand</option>
                        <option value="Karnataka">Karnataka</option>
                        <option value="Kerala">Kerala</option>
                        <option value="Ladakh">Ladakh</option>
                        <option value="Lakshadweep">Lakshadweep</option>
                        <option value="Madhya Pradesh">Madhya Pradesh</option>
                        <option value="Maharashtra">Maharashtra</option>
                        <option value="Manipur">Manipur</option>
                        <option value="Meghalaya">Meghalaya</option>
                        <option value="Mizoram">Mizoram</option>
                        <option value="Nagaland">Nagaland</option>
                        <option value="Odisha">Odisha</option>
                        <option value="Puducherry">Puducherry</option>
                        <option value="Punjab">Punjab</option>
                        <option value="Rajasthan">Rajasthan</option>
                        <option value="Sikkim">Sikkim</option>
                        <option value="Tamil Nadu">Tamil Nadu</option>
                        <option value="Telangana">Telangana</option>
                        <option value="Tripura">Tripura</option>
                        <option value="Uttar Pradesh">Uttar Pradesh</option>
                        <option value="Uttarakhand">Uttarakhand</option>
                        <option value="West Bengal">West Bengal</option>
                      </select>
                    ) : (
                      <div className={styles.value}>{user?.state || "Not provided"}</div>
                    )}
                  </div>
                </div>

                {/* Buttons */}
                <div className={styles.actionWrapper} style={{ justifyContent: "flex-end" }}>
                  {isEditing ? (
                    <>
                      <button className={styles.cancelBtn} onClick={() => setIsEditing(false)} disabled={loading || uploadingPhoto}>
                        Cancel
                      </button>
                      <button className={styles.saveBtn} onClick={handleSave} disabled={loading || uploadingPhoto}>
                        {loading || uploadingPhoto ? "Saving..." : "Save"}
                      </button>
                    </>
                  ) : (
                    <button className={styles.saveBtn} onClick={() => setIsEditing(true)}>
                      Edit profile
                    </button>
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === "Security" && (
            <>
              <div className={styles.headerTop}>
                <h2 className={styles.pageTitle}>Security Settings</h2>
              </div>
              <div className={styles.formBody}>
                <div className={styles.field} style={{ marginBottom: "2rem" }}>
                  <label className={styles.label} style={{ fontSize: "1.1rem" }}>Change Password</label>
                  <p style={{ color: "#666", fontSize: "0.9rem", marginBottom: "1rem" }}>
                    Update your account password. You will be logged out and required to sign in again.
                  </p>
                  <button className={styles.cancelBtn} style={{ width: "fit-content" }} onClick={() => alert("Change password logic coming soon!")}>
                    Change Password
                  </button>
                </div>

                <div className={styles.field} style={{ borderTop: "1px solid #eee", paddingTop: "2rem" }}>
                  <label className={styles.label} style={{ fontSize: "1.1rem" }}>Two-Factor Authentication (TOTP)</label>
                  <p style={{ color: "#666", fontSize: "0.9rem", marginBottom: "1rem" }}>
                    Protect your account with Google Authenticator or Authy. Phone/SMS OTP is disabled by request.
                  </p>
                  <button className={styles.saveBtn} style={{ width: "fit-content" }} onClick={() => alert("Google Authenticator setup coming soon!")}>
                    Enable Google Authenticator
                  </button>
                </div>
              </div>
            </>
          )}

          {activeTab === "Appearance" && (
            <>
              <div className={styles.headerTop}>
                <h2 className={styles.pageTitle}>Appearance Settings</h2>
              </div>
              <div className={styles.formBody}>
                {/* Theme Options */}
                <div className={styles.field} style={{ borderBottom: "1px solid #eee", paddingBottom: "2rem" }}>
                  <label className={styles.label} style={{ fontSize: "1.1rem", marginBottom: "0.2rem" }}>Theme Preference</label>
                  <p style={{ color: "#666", fontSize: "0.9rem", marginBottom: "1rem" }}>
                    Choose your preferred theme. VoteSarthi uses Dark Mode by default.
                  </p>
                  <div style={{ display: "flex", gap: "1rem" }}>
                    <button className={styles.cancelBtn} style={{ background: "#ff7f00", color: "white" }} onClick={() => alert("Theme changing functionality coming soon!")}>Dark</button>
                    <button className={styles.cancelBtn} onClick={() => alert("Theme changing functionality coming soon!")}>Light</button>
                    <button className={styles.cancelBtn} onClick={() => alert("Theme changing functionality coming soon!")}>System Default</button>
                  </div>
                </div>

                {/* Text Size */}
                <div className={styles.field} style={{ borderBottom: "1px solid #eee", paddingBottom: "2rem" }}>
                  <label className={styles.label} style={{ fontSize: "1.1rem", marginBottom: "0.2rem" }}>Accessibility & Text Size</label>
                  <p style={{ color: "#666", fontSize: "0.9rem", marginBottom: "1rem" }}>
                    Adjust the global font size for better readability across the application.
                  </p>
                  <div style={{ display: "flex", gap: "1rem" }}>
                    <button className={styles.cancelBtn} style={{ background: "#ff7f00", color: "white" }} onClick={() => alert("Text resizing functionality coming soon!")}>Normal</button>
                    <button className={styles.cancelBtn} onClick={() => alert("Text resizing functionality coming soon!")}>Large</button>
                    <button className={styles.cancelBtn} onClick={() => alert("Text resizing functionality coming soon!")}>Extra Large</button>
                  </div>
                </div>

                {/* Default Language */}
                <div className={styles.field}>
                  <label className={styles.label} style={{ fontSize: "1.1rem", marginBottom: "0.2rem" }}>Default Application Language</label>
                  <p style={{ color: "#666", fontSize: "0.9rem", marginBottom: "1rem" }}>
                    Choose the language the app should load in automatically.
                  </p>
                  <div style={{ display: "flex", gap: "1rem" }}>
                    <button 
                      className={styles.cancelBtn} 
                      style={!document.cookie.includes("googtrans=/en/hi") ? { background: "#ff7f00", color: "white" } : {}} 
                      onClick={() => {
                        document.cookie = "googtrans=/en/en; path=/";
                        document.cookie = "googtrans=/en/en; domain=localhost; path=/";
                        window.location.reload();
                      }}
                    >
                      English
                    </button>
                    <button 
                      className={styles.cancelBtn} 
                      style={document.cookie.includes("googtrans=/en/hi") ? { background: "#ff7f00", color: "white" } : {}} 
                      onClick={() => {
                        document.cookie = "googtrans=/en/hi; path=/";
                        document.cookie = "googtrans=/en/hi; domain=localhost; path=/";
                        window.location.reload();
                      }}
                    >
                      Hindi (हिंदी)
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {["Notification"].includes(activeTab) && (
            <div className={styles.headerTop}>
              <h2 className={styles.pageTitle}>{activeTab}</h2>
              <p style={{ marginTop: "1rem", color: "#666" }}>This section is under construction.</p>
            </div>
          )}

          {activeTab === "Help" && (
            <>
              <div className={styles.headerTop}>
                <h2 className={styles.pageTitle}>Help & Support</h2>
              </div>
              <div className={styles.formBody}>
                <div className={styles.field} style={{ borderBottom: "1px solid #eee", paddingBottom: "2rem" }}>
                  <label className={styles.label} style={{ fontSize: "1.1rem", marginBottom: "0.2rem" }}>Contact Support</label>
                  <p style={{ color: "#666", fontSize: "0.9rem", marginBottom: "1rem" }}>
                    Get in touch with our team for any queries or assistance.
                  </p>
                  <Link href="/contact" style={{ display: "inline-block", padding: "10px 20px", background: "#f8f9fa", border: "1px solid #ddd", borderRadius: "8px", color: "#333", textDecoration: "none", fontWeight: "600", width: "fit-content" }}>
                    💬 Go to Contact Page
                  </Link>
                </div>

                <div className={styles.field}>
                  <label className={styles.label} style={{ fontSize: "1.1rem", marginBottom: "0.2rem" }}>Report an Issue</label>
                  <p style={{ color: "#666", fontSize: "0.9rem", marginBottom: "1rem" }}>
                    Found a bug or incorrect information? Let us know so we can fix it.
                  </p>
                  <Link href="/report" style={{ display: "inline-block", padding: "10px 20px", background: "#fff0f0", border: "1px solid #ffcccc", borderRadius: "8px", color: "#d9534f", textDecoration: "none", fontWeight: "600", width: "fit-content" }}>
                    ⚠️ Report Issue
                  </Link>
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
