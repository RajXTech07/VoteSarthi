"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const scenarios = [
  {
    id: "lost-id",
    title: "I lost my Voter ID",
    icon: "🤷‍♂️",
    meaning: "You can still vote if your name is on the electoral roll.",
    steps: [
      "Find your name on the electoral roll online.",
      "Bring one of the 11 alternative photo IDs (like Aadhaar, PAN card, Passport, Driving License).",
      "Show the alternative ID at the booth. You do not need the physical Voter ID card."
    ]
  },
  {
    id: "moved-city",
    title: "I moved to another city",
    icon: "🚚",
    meaning: "You must vote where your name is registered, or update your address.",
    steps: [
      "If the election is near: You must travel to your old city to vote at your registered booth.",
      "If you have time (weeks before): Fill Form 8 online to transfer your registration to your new address.",
      "Wait for the BLO (Booth Level Officer) to verify your new address."
    ]
  },
  {
    id: "name-missing",
    title: "My name is not in the voter list",
    icon: "🚫",
    meaning: "You cannot vote if your name is missing, even if you have a Voter ID.",
    steps: [
      "Double-check by searching with your EPIC number on the ECI portal.",
      "If it's truly missing, you must fill Form 6 to register as a new voter.",
      "Unfortunately, if it is voting day, you will not be allowed to vote."
    ]
  }
];

export default function WhatIfPage() {
  const router = useRouter();
  
  useEffect(() => {
    if (!localStorage.getItem("votesarthi_session")) {
      router.push("/login");
    }
  }, [router]);

  const [active, setActive] = useState(null);

  return (
    <div className="container" style={{ paddingBottom: '80px' }}>
      <div className="page-header">
        <span className="badge badge-saffron">Tool #4</span>
        <h1 className="heading-lg">
          <span className="text-gradient-saffron">What If?</span> Scenarios
        </h1>
        <p>Edge cases happen. Here's exactly what to do.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '800px', margin: '0 auto' }}>
        {scenarios.map(s => (
          <div key={s.id} className="glass-card" style={{ padding: '24px', cursor: 'pointer', border: active === s.id ? '1px solid var(--saffron)' : '', transition: 'all 0.3s' }} onClick={() => setActive(active === s.id ? null : s.id)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '2rem' }}>{s.icon}</span>
              <h2 className="heading-md" style={{ margin: 0 }}>{s.title}</h2>
              <span style={{ marginLeft: 'auto', transform: active === s.id ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>▼</span>
            </div>
            
            {active === s.id && (
              <div style={{ marginTop: '24px', borderTop: '1px solid var(--glass-border)', paddingTop: '20px', animation: 'fadeIn 0.3s' }}>
                <div style={{ padding: '12px 16px', background: 'rgba(255,153,51,0.1)', borderRadius: '8px', color: 'var(--saffron-light)', marginBottom: '16px', fontWeight: '500' }}>
                  👉 {s.meaning}
                </div>
                <h4 style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>Step-by-step fix:</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {s.steps.map((step, i) => (
                    <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--navy)', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', flexShrink: 0, marginTop: '2px' }}>
                        {i + 1}
                      </div>
                      <p style={{ margin: 0, color: 'var(--text-primary)', lineHeight: 1.5 }}>{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
