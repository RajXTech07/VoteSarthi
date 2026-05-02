"use client";

import { useState } from "react";

const simSteps = [
  {
    title: "Arriving at the Booth",
    icon: "🏫",
    desc: "When you arrive, you'll see a queue. The police/security will guide you to your designated room based on your part number.",
    action: "Wait in line quietly. No campaigning or party symbols are allowed within 100 meters."
  },
  {
    title: "Polling Officer 1: Verification",
    icon: "🪪",
    desc: "The first officer checks your name on the electoral roll.",
    action: "Show your Voter ID or alternative ID. They will call out your name and serial number loudly for polling agents to hear."
  },
  {
    title: "Polling Officer 2: Ink & Register",
    icon: "🖋️",
    desc: "The second officer marks your finger with indelible ink.",
    action: "They will apply ink to your left index finger, ask for your signature/thumb impression in the register, and give you a voting slip."
  },
  {
    title: "Polling Officer 3: The Slip",
    icon: "📄",
    desc: "The third officer takes your voting slip.",
    action: "Hand over the slip. They will press a button on the Control Unit to activate the EVM for you."
  },
  {
    title: "Voting on the EVM",
    icon: "🗳️",
    desc: "You enter the voting compartment. It is completely private.",
    action: "Press the blue button next to your chosen candidate's symbol. The red light will glow and you will hear a loud beep."
  },
  {
    title: "VVPAT Verification",
    icon: "🖨️",
    desc: "The VVPAT machine next to the EVM prints a paper slip.",
    action: "Look through the glass for 7 seconds. You will see the serial number, name, and symbol of the candidate you voted for. The slip will drop into the sealed box."
  }
];

export default function SimulationPage() {
  const [step, setStep] = useState(0);

  return (
    <div className="container" style={{ paddingBottom: '80px' }}>
      <div className="page-header">
        <span className="badge badge-green">Tool #5</span>
        <h1 className="heading-lg">
          Voting Day <span className="text-gradient-green">Simulation</span>
        </h1>
        <p>Walk through exactly what happens on election day.</p>
      </div>

      <div className="glass-card" style={{ maxWidth: '700px', margin: '0 auto', padding: '40px', textAlign: 'center', minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        
        {step < simSteps.length ? (
          <div style={{ animation: 'fadeInUp 0.5s ease-out' }} key={step}>
            <div style={{ fontSize: '4rem', marginBottom: '20px', animation: 'float 3s ease-in-out infinite' }}>{simSteps[step].icon}</div>
            <h2 className="heading-md" style={{ marginBottom: '16px' }}>{step + 1}. {simSteps[step].title}</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.6 }}>{simSteps[step].desc}</p>
            <div style={{ background: 'rgba(19, 136, 8, 0.1)', border: '1px solid rgba(19, 136, 8, 0.2)', padding: '16px', borderRadius: '12px', color: 'var(--green-light)' }}>
              <strong>👉 Your Action:</strong> {simSteps[step].action}
            </div>
          </div>
        ) : (
          <div style={{ animation: 'fadeInUp 0.5s ease-out' }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px', animation: 'pulse 2s infinite' }}>🎉</div>
            <h2 className="heading-md" style={{ marginBottom: '16px' }}>You've Voted!</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.6 }}>That's the entire process. It takes just 5-10 minutes. You can now leave the polling station with pride.</p>
          </div>
        )}

        <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button className="btn btn-secondary" disabled={step === 0} onClick={() => setStep(step - 1)}>← Back</button>
            
            {step < simSteps.length ? (
                <button className="btn btn-primary" onClick={() => setStep(step + 1)}>Next Step →</button>
            ) : (
                <button className="btn btn-success" onClick={() => setStep(0)}>Restart Simulation</button>
            )}
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '32px' }}>
            {simSteps.map((_, i) => (
                <div key={i} style={{ width: '10px', height: '10px', borderRadius: '50%', background: i === step ? 'var(--green)' : 'var(--glass-border)', transition: 'background 0.3s' }}></div>
            ))}
        </div>
      </div>
    </div>
  )
}
