"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function BoothFinderPage() {
  const router = useRouter();
  
  useEffect(() => {
    if (!localStorage.getItem("votesarthi_session")) {
      router.push("/login");
    }
  }, [router]);

  const [pincode, setPincode] = useState("");
  const [area, setArea] = useState("");
  const [searchDone, setSearchDone] = useState(false);
  const [embedSrc, setEmbedSrc] = useState("");
  const [searchLabel, setSearchLabel] = useState("");
  const [searchLinks, setSearchLinks] = useState({});
  const [iframeKey, setIframeKey] = useState(0);

  const handleSearch = useCallback(
    (e) => {
      e.preventDefault();
      if (!pincode && !area) return;

      const location = pincode ? `${pincode}, India` : `${area}, India`;
      const label = pincode ? `PIN ${pincode}` : area;

      // Embedded map — uses PIN/area to zoom into the location
      const embed = `https://maps.google.com/maps?q=${encodeURIComponent(location)}&z=15&output=embed`;

      // Build multiple search links with different query strategies
      // Google Maps works better with area names than PIN codes for POI search
      const areaForSearch = area || pincode;
      const links = {
        // Google Search — most reliable, always finds polling booths
        googleSearch: `https://www.google.com/search?q=polling+booth+near+${encodeURIComponent(areaForSearch)}+India`,
        // Google Maps — search with "polling booth" (Indian term)
        mapsPollingBooth: `https://www.google.com/maps/search/polling+booth+near+${encodeURIComponent(areaForSearch)}+India`,
        // Google Maps — search for schools (most booths are in govt schools)
        mapsSchools: `https://www.google.com/maps/search/government+school+near+${encodeURIComponent(location)}`,
        // ECI — official booth finder
        eciSearch: `https://electoralsearch.eci.gov.in`,
        // Voter Helpline
        voterApp: `https://play.google.com/store/apps/details?id=com.eci.citizen`,
      };

      setEmbedSrc(embed);
      setSearchLabel(label);
      setSearchLinks(links);
      setSearchDone(true);
      setIframeKey((k) => k + 1);
    },
    [pincode, area]
  );

  const handleReset = () => {
    setPincode("");
    setArea("");
    setSearchDone(false);
    setEmbedSrc("");
    setSearchLabel("");
    setSearchLinks({});
  };

  return (
    <div className={styles.page}>
      <div className="container">
        <div className="page-header">
          <span className="badge badge-saffron">Tool #5</span>
          <h1 className="heading-lg">
            Find Your{" "}
            <span className="text-gradient-saffron">Polling Booth</span>
          </h1>
          <p>Enter your PIN code → see your area and find nearby polling stations.</p>
        </div>

        {/* Search Form */}
        <form
          className={`glass-card ${styles.searchForm}`}
          onSubmit={handleSearch}
          id="booth-search-form"
        >
          <div className={styles.searchHeader}>
            <span className={styles.searchIcon}>📍</span>
            <div>
              <h3 className="heading-md">Locate Polling Stations</h3>
              <p>Enter your 6-digit PIN code or area name.</p>
            </div>
          </div>

          <div className={styles.inputRow}>
            <div className={styles.field}>
              <label className={styles.label}>PIN Code</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g., 110001"
                value={pincode}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setPincode(val);
                }}
                maxLength={6}
                id="input-pincode"
              />
            </div>

            <div className={styles.orDivider}>
              <span>or</span>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>City / Area Name</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g., Connaught Place, Delhi"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                id="input-area"
              />
            </div>
          </div>

          <div className={styles.actions}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!pincode && !area}
              id="btn-find-booth"
              style={{ flex: 1, justifyContent: "center" }}
            >
              🔍 Find Polling Booths →
            </button>
            {searchDone && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleReset}
                id="btn-reset-search"
              >
                Reset
              </button>
            )}
          </div>
        </form>

        {/* Results */}
        {searchDone && (
          <div className={styles.results}>
            {/* Info Banner */}
            <div className={`${styles.infoBanner} animate-fade-in-up`}>
              <div className={styles.infoIcon}>📢</div>
              <div className={styles.infoBody}>
                <strong>Your area: {searchLabel}</strong>
                <p>
                  Map shows your location. Use the buttons below to find polling
                  booths in this area.
                </p>
              </div>
            </div>

            {/* Map Embed — zoomed to the PIN code area */}
            <div
              className={`glass-card ${styles.mapCard} animate-fade-in-up`}
              id="booth-map"
            >
              <iframe
                key={iframeKey}
                src={embedSrc}
                className={styles.mapFrame}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Your Area Map"
                style={{ border: 0 }}
              ></iframe>
            </div>

            {/* ── Find Booths — Multiple Options ── */}
            <div className={`glass-card ${styles.boothActions} animate-fade-in-up`} id="booth-search-options">
              <h4 className={styles.sectionTitle}>🗳️ Find Polling Booths Near {searchLabel}</h4>
              <p className={styles.sectionDesc}>
                Use any of these methods to find exact polling booth locations:
              </p>

              <div className={styles.methodGrid}>
                {/* Method 1: Google Search — most reliable */}
                <a
                  href={searchLinks.googleSearch}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.methodCard}
                  id="method-google-search"
                >
                  <div className={styles.methodBadge}>Recommended</div>
                  <span className={styles.methodIcon}>🔍</span>
                  <strong>Google Search</strong>
                  <p>Search for polling booths — shows addresses, phone numbers, and directions.</p>
                </a>

                {/* Method 2: Google Maps — polling booth */}
                <a
                  href={searchLinks.mapsPollingBooth}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.methodCard}
                  id="method-maps"
                >
                  <span className={styles.methodIcon}>📍</span>
                  <strong>Google Maps Search</strong>
                  <p>Open Maps and search for &quot;polling booth&quot; with markers and directions.</p>
                </a>

                {/* Method 3: ECI — official */}
                <a
                  href={searchLinks.eciSearch}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.methodCard}
                  id="method-eci"
                >
                  <div className={styles.methodBadge} data-type="official">Official</div>
                  <span className={styles.methodIcon}>🏛️</span>
                  <strong>ECI Electoral Search</strong>
                  <p>Official booth finder — enter your Voter ID to find your exact assigned booth.</p>
                </a>

                {/* Method 4: Voter App */}
                <a
                  href={searchLinks.voterApp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.methodCard}
                  id="method-app"
                >
                  <span className={styles.methodIcon}>📱</span>
                  <strong>Voter Helpline App</strong>
                  <p>Download the ECI app — shows your exact booth, voter slip, and queue status.</p>
                </a>
              </div>
            </div>

            {/* Tips */}
            <div className={`glass-card ${styles.tipsCard} animate-fade-in-up`}>
              <h4 className={styles.tipsTitle}>💡 How to Find Your Exact Booth</h4>
              <ul className={styles.tipsList}>
                <li>
                  <strong>Best method:</strong> Go to{" "}
                  <a href="https://electoralsearch.eci.gov.in" target="_blank" rel="noopener noreferrer">
                    electoralsearch.eci.gov.in
                  </a>
                  , enter your Voter ID (EPIC) number → it shows your exact assigned
                  polling booth with address.
                </li>
                <li>
                  <strong>No Voter ID?</strong> Search by your name, father&apos;s name,
                  and area on the same website to find your booth.
                </li>
                <li>
                  <strong>Most booths are in schools:</strong> Government schools,
                  community halls, and panchayat buildings are commonly used as
                  polling stations.
                </li>
                <li>
                  <strong>Visit beforehand:</strong> Go to your booth the day before
                  election day to check the exact location and entry points.
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
