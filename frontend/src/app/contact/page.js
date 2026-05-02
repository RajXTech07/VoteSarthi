"use client";

export default function ContactPage() {
  return (
    <div className="container" style={{ paddingBottom: '80px' }}>
      <div className="page-header">
        <span className="badge badge-saffron">Help</span>
        <h1 className="heading-lg">
          Election <span className="text-gradient-saffron">Contact Info</span>
        </h1>
        <p>Official helplines and contact details for the Election Commission of India.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* National Helpline */}
        <div className="glass-card" style={{ padding: '32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📞</div>
          <h2 className="heading-md" style={{ marginBottom: '8px' }}>National Helpline</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Toll-free number for all voter-related queries across India.</p>
          <a href="tel:1950" className="btn btn-primary" style={{ fontSize: '1.2rem', padding: '12px 32px' }}>Call 1950</a>
        </div>

        {/* Email Support */}
        <div className="glass-card" style={{ padding: '32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📧</div>
          <h2 className="heading-md" style={{ marginBottom: '8px' }}>Email Support</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>For official correspondence and technical support for portals.</p>
          <a href="mailto:complaints@eci.gov.in" className="btn btn-secondary">complaints@eci.gov.in</a>
        </div>

        {/* Official Portal */}
        <div className="glass-card" style={{ padding: '32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🌐</div>
          <h2 className="heading-md" style={{ marginBottom: '8px' }}>Official Portal</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Access all voter services including registration and corrections online.</p>
          <a href="https://voters.eci.gov.in" target="_blank" rel="noopener noreferrer" className="btn btn-secondary">voters.eci.gov.in</a>
        </div>
        
        {/* Physical Address */}
        <div className="glass-card" style={{ padding: '32px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gridColumn: '1 / -1' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🏢</div>
          <h2 className="heading-md" style={{ marginBottom: '8px' }}>Headquarters Address</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            <strong>Election Commission of India</strong><br />
            Nirvachan Sadan, Ashoka Road,<br />
            New Delhi 110001
          </p>
        </div>

      </div>
    </div>
  )
}
