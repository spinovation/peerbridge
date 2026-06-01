'use client';

import { useState } from 'react';

export default function LandingView({ state }) {
  const [inviteCode, setInviteCode] = useState('');
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [error, setError] = useState('');
  
  // Member login inputs
  const [activeGateTab, setActiveGateTab] = useState('login'); // 'login' or 'register'
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('password123'); // Default mock password pre-filled

  // Registration form inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Investor');

  const handleVerifyCode = (e) => {
    e.preventDefault();
    if (!inviteCode.trim()) {
      setError('Please enter a valid invite code.');
      return;
    }
    
    const exists = state.invites.find(
      inv => inv.code.toUpperCase() === inviteCode.trim().toUpperCase()
    );

    if (exists) {
      setError('');
      setShowRegisterForm(true);
    } else {
      setError('Access Denied. Code not found in the invitation registry.');
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    const res = state.loginWithInvite(inviteCode, name, email, role);
    if (res.success) {
      state.setActiveTab('dashboard');
    } else {
      setError(res.error);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    const res = state.loginWithCredentials(loginEmail, loginPassword);
    if (res.success) {
      setError('');
    } else {
      setError(res.error);
    }
  };

  return (
    <div style={styles.container}>
      {/* Hero Header */}
      <header style={styles.header}>
        <div style={styles.logoContainer}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
            <span style={styles.logoText}>PEER BRIDGE</span>
            <span style={styles.logoSlogan}>Fund Smarter, Build Together</span>
          </div>
        </div>
        <div style={styles.inviteBadge}>🔒 MEMBERS ONLY</div>
      </header>

      {/* Main Section */}
      <main style={styles.main}>
        <section style={styles.heroSection}>
          <h1 style={styles.heroTitle}>
            The Secure Bridge to <br/>
            <span style={styles.gradientText}>Private Equity Funding</span>
          </h1>
          <p style={styles.heroSub}>
            Connecting visionaries, accredited investors, and regulatory affiliates in an exclusive, vetted P2P ecosystem that unites advanced professional networking, detailed business analytics, and a private capital marketplace.
          </p>

          {/* Quick Metrics */}
          <div style={styles.metricsContainer}>
            <div style={styles.metricCard}>
              <span style={styles.metricVal}>$42M+</span>
              <span style={styles.metricLabel}>Capital Processed</span>
            </div>
            <div style={styles.metricCard}>
              <span style={styles.metricVal}>1,200+</span>
              <span style={styles.metricLabel}>Vetted Partners</span>
            </div>
            <div style={styles.metricCard}>
              <span style={styles.metricVal}>99.4%</span>
              <span style={styles.metricLabel}>KYC Verification Rate</span>
            </div>
          </div>
        </section>

        {/* Invite Gate Card */}
        <section style={styles.gateSection}>
          <div className="glass-panel glow-accent-border" style={styles.gateCard}>
            {/* Tab Navigation for Gate */}
            {!showRegisterForm && (
              <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => { setActiveGateTab('login'); setError(''); }}
                  style={{
                    flex: 1,
                    padding: '1rem',
                    background: 'none',
                    border: 'none',
                    borderBottom: activeGateTab === 'login' ? '2px solid #00f2fe' : '2px solid transparent',
                    color: activeGateTab === 'login' ? '#ffffff' : 'rgba(255,255,255,0.4)',
                    fontWeight: '700',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    transition: 'all 0.3s ease'
                  }}
                >
                  👤 Member Sign-In
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveGateTab('register'); setError(''); }}
                  style={{
                    flex: 1,
                    padding: '1rem',
                    background: 'none',
                    border: 'none',
                    borderBottom: activeGateTab === 'register' ? '2px solid #00f2fe' : '2px solid transparent',
                    color: activeGateTab === 'register' ? '#ffffff' : 'rgba(255,255,255,0.4)',
                    fontWeight: '700',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    transition: 'all 0.3s ease'
                  }}
                >
                  🔒 Invite Gate
                </button>
              </div>
            )}

            {showRegisterForm ? (
              <form onSubmit={handleRegister} style={styles.form}>
                <h3 style={styles.gateCardTitle}>✨ Create Vetted Profile</h3>
                <p style={styles.gateCardSub}>
                  Invitation code approved. Complete your registration below to generate your dashboard credentials.
                </p>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Full Name</label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={styles.input}
                    required
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Email Address</label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={styles.input}
                    required
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Primary Platform Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    style={styles.select}
                  >
                    <option value="Investor">Accredited Investor (Portfolio Allocation)</option>
                    <option value="Entrepreneur">Entrepreneur / Founder (Business Profile)</option>
                    <option value="Affiliate">Professional Affiliate (Vetted Compliance Network)</option>
                    <option value="Sales Admin">Sales Operations (Invite code administrator)</option>
                  </select>
                </div>

                {error && <span style={styles.errorText}>{error}</span>}

                <div style={styles.buttonRow}>
                  <button
                    type="button"
                    onClick={() => { setShowRegisterForm(false); setActiveGateTab('register'); }}
                    className="btn-secondary"
                    style={{ flex: 1 }}
                  >
                    Back
                  </button>
                  <button type="submit" className="btn-primary" style={{ flex: 2 }}>
                    Enter Ecosystem
                  </button>
                </div>
              </form>
            ) : activeGateTab === 'login' ? (
              <form onSubmit={handleLogin} style={styles.form}>
                <h3 style={styles.gateCardTitle}>🔑 Secure Member Login</h3>
                <p style={styles.gateCardSub}>
                  Sign in using your pre-verified credentials. Select any preloaded demo profile below for instant access:
                </p>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Select Preloaded Demo Member</label>
                  <select
                    onChange={(e) => {
                      const email = e.target.value;
                      setLoginEmail(email);
                      setLoginPassword('password123');
                      
                      // Auto-authenticate for instant access
                      setTimeout(() => {
                        const res = state.loginWithCredentials(email, 'password123');
                        if (res.success) {
                          setError('');
                        } else {
                          setError(res.error);
                        }
                      }, 50);
                    }}
                    style={styles.select}
                    defaultValue=""
                  >
                    <option value="" disabled>-- Choose a Member --</option>
                    <option value="sarah@skynet-rebel.io">Sarah Connor (Ex-Dir Investor - 1 Sector Vetted)</option>
                    <option value="salesadmin@peerbridge.ai">Sales Operations (salesadmin@peerbridge.ai Admin Control)</option>
                    <option value="mohit@mehraventures.com">Mohit Mehra (P2P Lender - $500 Capital Balance)</option>
                    <option value="kristi@toninlogistics.com">Kristi Tonin (P2P Borrower Logistics Founder - $500 Request)</option>
                    <option value="marcus@vancegroup.ai">Marcus Vance (Fintech CPA GP - All 4 Sectors Vetted)</option>
                    <option value="elena@rostova.ai">Elena Rostova (AI Founder Investor - 1 Sector Vetted)</option>
                    <option value="devon@auroratech.io">Devon Lane (Hacker Dropout - 3 Sectors Vetted)</option>
                    <option value="clara@hsin-law.com">Clara Hsin (Securities Atty Affiliate - 3 Sectors Vetted)</option>
                    <option value="kofi@helium-energy.com">Kofi Anan (MIT Grad Entrepreneur - 2 Sectors Vetted)</option>
                  </select>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Email Address</label>
                  <input
                    type="email"
                    placeholder="Enter email address"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    style={styles.input}
                    required
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Security Password</label>
                  <input
                    type="password"
                    placeholder="Enter password (use password123)"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    style={styles.input}
                    required
                  />
                </div>

                {error && <span style={styles.errorText}>{error}</span>}

                <div style={{ ...styles.tipBox, marginTop: '0.5rem' }}>
                  <strong>💡 Tester Credentials:</strong> All preloaded profiles use password <code>password123</code>.
                </div>

                <button type="submit" className="btn-primary" style={styles.submitBtn}>
                  Authenticate & Sign In →
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyCode} style={styles.form}>
                <h3 style={styles.gateCardTitle}>🔒 Enter Invitation Code</h3>
                <p style={styles.gateCardSub}>
                  Peer Bridge is an exclusive, invitation-only platform. Enter the code provided by an existing member to explore and invest.
                </p>
                
                <div style={styles.inputGroup}>
                  <input
                    type="text"
                    placeholder="e.g. PEER-BRIDGE-2026"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    style={styles.input}
                  />
                  {error && <span style={styles.errorText}>{error}</span>}
                </div>

                <div style={styles.tipBox}>
                  <strong>💡 Guest Invite Code:</strong> Use <code>PEER-BRIDGE-2026</code> to unlock registration!
                </div>

                <button type="submit" className="btn-primary" style={styles.submitBtn}>
                  Verify Invitation Code →
                </button>
              </form>
            )}
          </div>
        </section>
      </main>

      {/* Featured Offerings Section */}
      <section style={styles.offeringsSection}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Featured P2P Offerings</h2>
          <p style={styles.sectionSub}>Explore live capital campaigns scaling in our private ecosystem.</p>
        </div>

        <div style={styles.cardGrid}>
          {state.campaigns.map((camp) => {
            const pct = Math.min(100, Math.round((camp.raised / camp.target) * 100));
            return (
              <div key={camp.id} className="glass-panel" style={styles.offeringCard}>
                <div style={styles.offeringHeader}>
                  <span style={styles.offeringCategory}>{camp.category}</span>
                  <span style={styles.offeringStatus}>Active Offer</span>
                </div>
                <h3 style={styles.companyName}>{camp.companyName}</h3>
                <p style={styles.tagline}>{camp.tagline}</p>
                
                <div style={styles.progressContainer}>
                  <div style={styles.progressBar}>
                    <div style={{ ...styles.progressFill, width: `${pct}%` }}></div>
                  </div>
                  <div style={styles.progressLabelRow}>
                    <span>Raised: <strong>${camp.raised.toLocaleString()}</strong></span>
                    <span>{pct}% of ${camp.target.toLocaleString()}</span>
                  </div>
                </div>

                <div style={styles.offeringFooter}>
                  <div>
                    <span style={styles.labelMuted}>Share Price</span>
                    <p style={styles.footerVal}>${camp.sharePrice.toFixed(2)}</p>
                  </div>
                  <div>
                    <span style={styles.labelMuted}>Min Invest</span>
                    <p style={styles.footerVal}>${camp.minInvestment.toLocaleString()}</p>
                  </div>
                  <div>
                    <span style={styles.labelMuted}>Valuation</span>
                    <p style={styles.footerVal}>${(camp.valuation / 1000000).toFixed(2)}M</p>
                  </div>
                </div>

                <div style={styles.lockOverlay}>
                  <span style={styles.lockText}>🔒 Invite Verification Required to Invest</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Landing Footer */}
      <footer style={styles.footer}>
        <p>© 2026 Peer Bridge SEC Regulation D / Reg CF Network Gateway. All rights reserved.</p>
        <p style={{ fontSize: '0.8rem', marginTop: '0.5rem', opacity: 0.5 }}>
          Alternative investing is high-risk. SEC verified network nodes represent private placements.
        </p>
      </footer>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: '#000000',
    backgroundImage: 'radial-gradient(circle at 50% 50%, #0a0a0a 0%, #000000 100%)',
    padding: '0 2rem',
  },
  header: {
    height: '80px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },

  logoText: {
    fontSize: '1.5rem',
    fontWeight: '850',
    letterSpacing: '0.06em',
    color: '#ffffff',
    lineHeight: '1',
  },
  logoSlogan: {
    fontFamily: 'var(--font-script)',
    fontSize: '0.78rem',
    color: '#ffffff',
    lineHeight: '1',
    letterSpacing: '0.19em',
    marginTop: '0.25rem',
    opacity: 0.9,
  },
  inviteBadge: {
    padding: '0.35rem 0.75rem',
    borderRadius: '4px',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    color: '#ffffff',
    fontSize: '0.75rem',
    fontWeight: '700',
  },
  main: {
    flex: '1',
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: '4rem',
    alignItems: 'center',
    padding: '4rem 0',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  heroSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  heroTitle: {
    fontSize: '3.5rem',
    lineHeight: '1.1',
    fontWeight: '800',
  },
  gradientText: {
    color: '#ffffff',
  },
  heroSub: {
    fontSize: '1.15rem',
    color: '#94a3b8',
    maxWidth: '540px',
  },
  metricsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1.5rem',
    marginTop: '2rem',
  },
  metricCard: {
    borderLeft: '2.5px solid #ffffff',
    paddingLeft: '1rem',
  },
  metricVal: {
    display: 'block',
    fontSize: '1.75rem',
    fontWeight: '800',
    color: '#ffffff',
  },
  metricLabel: {
    fontSize: '0.8rem',
    color: '#64748b',
  },
  gateSection: {
    display: 'flex',
    justifyContent: 'center',
  },
  gateCard: {
    width: '100%',
    maxWidth: '440px',
    padding: '2.5rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  gateCardTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
  },
  gateCardSub: {
    fontSize: '0.9rem',
    color: '#94a3b8',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  input: {
    width: '100%',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '8px',
    padding: '0.85rem 1rem',
    color: '#ffffff',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'border 0.2s ease',
  },
  select: {
    width: '100%',
    background: '#121212',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '8px',
    padding: '0.85rem 1rem',
    color: '#ffffff',
    fontSize: '0.95rem',
    outline: 'none',
    cursor: 'pointer',
  },
  tipBox: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    padding: '0.75rem',
    fontSize: '0.8rem',
    color: '#ffffff',
    lineHeight: '1.4',
  },
  submitBtn: {
    width: '100%',
    justifyContent: 'center',
    padding: '1rem',
  },
  buttonRow: {
    display: 'flex',
    gap: '1rem',
    marginTop: '0.5rem',
  },
  errorText: {
    fontSize: '0.8rem',
    color: '#f43f5e',
    fontWeight: '500',
  },
  offeringsSection: {
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
    padding: '4rem 0 6rem 0',
    borderTop: '1px solid rgba(255,255,255,0.05)',
  },
  sectionHeader: {
    textAlign: 'center',
    marginBottom: '3rem',
  },
  sectionTitle: {
    fontSize: '2rem',
    fontWeight: '800',
  },
  sectionSub: {
    color: '#64748b',
    marginTop: '0.5rem',
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '2rem',
  },
  offeringCard: {
    padding: '2rem',
    position: 'relative',
    overflow: 'hidden',
  },
  offeringHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '1rem',
  },
  offeringCategory: {
    background: 'rgba(255,255,255,0.05)',
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.7rem',
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  offeringStatus: {
    color: '#ffffff',
    fontSize: '0.7rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  companyName: {
    fontSize: '1.5rem',
    fontWeight: '700',
    marginBottom: '0.5rem',
  },
  tagline: {
    fontSize: '0.9rem',
    color: '#94a3b8',
    height: '42px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: '2',
    WebkitBoxOrient: 'vertical',
  },
  progressContainer: {
    marginTop: '1.5rem',
    marginBottom: '1.5rem',
  },
  progressBar: {
    height: '6px',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '3px',
    overflow: 'hidden',
    marginBottom: '0.5rem',
  },
  progressFill: {
    height: '100%',
    background: '#ffffff',
    borderRadius: '3px',
  },
  progressLabelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.75rem',
    color: '#64748b',
  },
  offeringFooter: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
    borderTop: '1px solid rgba(255,255,255,0.05)',
    paddingTop: '1.25rem',
  },
  labelMuted: {
    fontSize: '0.7rem',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  footerVal: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#ffffff',
    marginTop: '0.2rem',
  },
  lockOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(7, 9, 14, 0.8)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
    transition: 'opacity 0.25s ease',
    cursor: 'pointer',
    ':hover': {
      opacity: 1,
    }
  },
  // Simple CSS hover handler mock: this class behaves like the overlay hover
  offeringCardHover: {
    opacity: 1
  },
  lockText: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '30px',
    padding: '0.65rem 1.25rem',
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#ffffff',
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
  },
  footer: {
    height: '100px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    padding: '2rem 0',
    marginTop: 'auto',
    textAlign: 'center',
  }
};
