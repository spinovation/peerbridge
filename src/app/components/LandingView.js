'use client';

import { useState } from 'react';

const howItWorksSteps = {
  entrepreneur: {
    title: "Entrepreneur / Founder Journey",
    desc: "Raise growth capital without diluting unnecessarily or bypass standard banking delays using verified payroll flows.",
    debt: [
      { step: "01", title: "Sync Data Sources", text: "Securely link your enterprise payroll platform (ADP/Paychex) and cash accounts (Plaid). This aggregates real-time savings margins and debt coverage metrics." },
      { step: "02", title: "Configure Debt Terms", text: "Customize your P2P Promissory note parameters: set the requested principal, term (e.g. 6 months), and target yield profile based on verified cash buffers." },
      { step: "03", title: "Fractional Syndicate Matching", text: "The platform's matching engine splits your requested note into fractional tranches, auto-allocating them to active Lender Pro accounts." },
      { step: "04", title: "Payroll-Deducted Repayment", text: "Note repayments are automatically debited directly from subsequent payroll proceeds, bypassing standard collection processes." }
    ],
    equity: [
      { step: "01", title: "AI Prospectus Generation", text: "Compile regulatory compliance disclosures (Form C for Reg CF or Form D for Reg D) automatically using our integrated AI regulatory agent." },
      { step: "02", title: "Launch SAFE Campaign", text: "Open your venture offering to verified angel networks and retail crowds. Set custom valuation caps and share prices." },
      { step: "03", title: "e-Sign & Ledger Stamps", text: "Investors execute standard Y-Combinator SAFEs using our e-signature interface. Each contract is stamped with a SHA-256 validation hash." },
      { step: "04", title: "Capital Disbursal & Warrants", text: "Upon campaign close, funds are released. Peer Bridge registers a 1.5% equity warrant and collects a 4.0% success fee." }
    ]
  },
  investor: {
    title: "Accredited Investor / Lender Journey",
    desc: "Access institutional-grade private placements, high-yield debt notes, and startup equity warrants on a verified ledger.",
    debt: [
      { step: "01", title: "KYC & Bank Sync", text: "Perform automatic identity verification checks and securely link your bank account to sync your active wallet balance." },
      { step: "02", title: "Set Auto-Invest Rules", text: "Define your yield targets and risk thresholds (e.g. Balanced 7.5% APY, targeting Prime P2 grades) to matching syndicates." },
      { step: "03", title: "Acquire Note Tranches", text: "Acquire fractional tranches of verified business debt starting at $500, backed by real-time payroll synchronizations." },
      { step: "04", title: "Harvest Monthly Yield", text: "Receive interest and principal repayments monthly. Capital is credited directly to your Peer Bridge digital wallet." }
    ],
    equity: [
      { step: "01", title: "Browse Active Deals", text: "Filter through active SAFE campaigns. Audit startup revenue reports, cap tables, and founder backgrounds." },
      { step: "02", title: "Commit Funds & Sign", text: "Deploy capital into rounds and draw your legal signature on the digital agreement pad to finalize your investment." },
      { step: "03", title: "Mint Vault Certificates", text: "Receive a high-premium, gold-bordered digital Stock Acquisition Certificate representing your holding, securely stored in your Vault." },
      { step: "04", title: "Monitor Dilution", text: "Track cap table distributions, ARR growth charts, runway metrics, and warrant valuations on your active dashboard." }
    ]
  },
  affiliate: {
    title: "Vetted Partner & Affiliate Journey",
    desc: "Offer advisory services, compliance auditing, consulting, or corporate lending to ecosystem members.",
    debt: [
      { step: "01", title: "Register as Partner", text: "Register your advisory, business consulting, or banking credentials to establish your partner node in our directory." },
      { step: "02", title: "Evaluate Telemetry", text: "Inspect Plaid transaction streams, cash flow coverage, and BRS credit risk parameters for borrowing founders." },
      { step: "03", title: "Provide Capital / Attestation", text: "Offer direct note capital lines as a bank partner or sign off on underwriting checks before syndication starts." },
      { step: "04", title: "Collect Yield & Fees", text: "Earn direct interest yields from note tranches or collect advisory service revenue from note origination pools." }
    ],
    equity: [
      { step: "01", title: "Publish Advisory Profile", text: "Showcase legal, financial, or strategic business consulting solutions to founders prepping equity campaigns." },
      { step: "02", title: "Structure SPV / Warrants", text: "Advise on joint co-issuer Special Purpose Vehicles or structure equity warrants to maintain cap table hygiene." },
      { step: "03", title: "Compliance Vetting", text: "Audit financial conditions, past fundraising history, and SEC Regulation CF/D Form C filing drafts." },
      { step: "04", title: "Unlock Escrow Milestones", text: "Release locked campaign advisory fees automatically upon successful fundraising round settlement." }
    ]
  }
};

export default function LandingView({ state }) {
  const [inviteCode, setInviteCode] = useState('');
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [error, setError] = useState('');
  
  // Member login inputs
  const [activeGateTab, setActiveGateTab] = useState('login'); // 'login' or 'register'
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('password123'); // Default mock password pre-filled

  // Footer Modals state
  const [footerModalType, setFooterModalType] = useState(null); // 'support', 'legal_tos', 'legal_privacy', 'legal_disclaimers', 'about', 'contact'
  const [supportCategory, setSupportCategory] = useState(''); // 'General Support Request', 'Investor Support', 'Raise Capital', 'Press Inquiries', 'Technical'
  const [supportEmail, setSupportEmail] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSuccess, setSupportSuccess] = useState(false);

  // How it works section state
  const [howRole, setHowRole] = useState('entrepreneur'); // 'entrepreneur', 'investor', 'affiliate'
  const [howType, setHowType] = useState('debt'); // 'debt', 'equity'

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
          <img src="/logo.png" alt="PeerBridge" style={{ height: '36px', objectFit: 'contain' }} />
        </div>
        <div style={styles.inviteBadge}>🔒 MEMBERS ONLY</div>
      </header>

      {/* Main Section */}
      <main style={styles.main}>
        <section style={styles.heroSection}>
          <div style={styles.participantBadge}>
            🤝 Marketplace for Entrepreneurs • Investors • Affiliates
          </div>
          <h1 style={styles.heroTitle}>
            The Private Debt, Equity & <br/>
            <span style={styles.gradientText}>AI Brokerage Ecosystem</span>
          </h1>
          <p style={styles.heroSub}>
            The private capital marketplace connecting Entrepreneurs, Investors, and Professional Affiliates. We combine SEC-compliant Reg CF/D Equity campaigns, P2P Commercial Debt syndicates with ADP & Plaid underwriting bypass, and autonomous AI-agent brokerages securing real-time contract negotiations.
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

          {/* Feature Grid */}
          <div style={styles.featureGrid}>
            <div className="feature-pill-interactive" style={styles.featurePill}>
              <span style={styles.featureIcon}>🏛️</span>
              <span>P2P Commercial Debt Notes</span>
            </div>
            <div className="feature-pill-interactive" style={styles.featurePill}>
              <span style={styles.featureIcon}>🚀</span>
              <span>SAFE & Equity Campaigns</span>
            </div>
            <div className="feature-pill-interactive" style={styles.featurePill}>
              <span style={styles.featureIcon}>⚡</span>
              <span>ADP/Paychex Underwrite Bypass</span>
            </div>
            <div className="feature-pill-interactive" style={styles.featurePill}>
              <span style={styles.featureIcon}>🤖</span>
              <span>Autonomous AI Brokerage</span>
            </div>
          </div>
        </section>

        {/* Invite Gate Card */}
        <section style={styles.gateSection}>
          <div className="glass-panel glow-accent-border" style={styles.gateCard}>
            {/* Tab Navigation for Gate */}
            {!showRegisterForm && (
              <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => { setActiveGateTab('login'); setError(''); }}
                  style={{
                    flex: 1,
                    padding: '1rem',
                    background: 'none',
                    border: 'none',
                    borderBottom: activeGateTab === 'login' ? '2px solid var(--border-accent)' : '2px solid transparent',
                    color: activeGateTab === 'login' ? 'var(--border-accent)' : 'var(--color-text-muted)',
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
                    borderBottom: activeGateTab === 'register' ? '2px solid var(--border-accent)' : '2px solid transparent',
                    color: activeGateTab === 'register' ? 'var(--border-accent)' : 'var(--color-text-muted)',
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
              <div key={camp.id} className="glass-panel offering-card-interactive" style={styles.offeringCard}>
                <div style={styles.offeringHeader}>
                  <span style={styles.offeringCategory}>{camp.category}</span>
                  <span style={styles.offeringStatus}>{camp.offering_type === 'debt' ? '⚡ Active Note' : '🚀 Active Offer'}</span>
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
                  {camp.offering_type === 'debt' ? (
                    <>
                      <div>
                        <span style={styles.labelMuted}>Target Yield</span>
                        <p style={styles.footerVal}>{camp.interest_rate.toFixed(1)}% APY</p>
                      </div>
                      <div>
                        <span style={styles.labelMuted}>Term</span>
                        <p style={styles.footerVal}>{camp.term_months} Months</p>
                      </div>
                      <div>
                        <span style={styles.labelMuted}>Min Invest</span>
                        <p style={styles.footerVal}>${camp.minInvestment.toLocaleString()}</p>
                      </div>
                    </>
                  ) : (
                    <>
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
                    </>
                  )}
                </div>

                <div className="lock-overlay-interactive" style={styles.lockOverlay}>
                  <span style={styles.lockText}>🔒 Invite Verification Required to Invest</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works Section */}
      <section style={styles.howItWorksSection}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>How It Works</h2>
          <p style={styles.sectionSub}>Explore step-by-step capital flows designed for your specific role in our ecosystem.</p>
        </div>

        {/* Role Tabs */}
        <div style={styles.howTabsContainer}>
          <button 
            type="button"
            onClick={() => setHowRole('entrepreneur')}
            style={howRole === 'entrepreneur' ? styles.howTabActive : styles.howTab}
          >
            💼 Entrepreneur
          </button>
          <button 
            type="button"
            onClick={() => setHowRole('investor')}
            style={howRole === 'investor' ? styles.howTabActive : styles.howTab}
          >
            📈 Investor
          </button>
          <button 
            type="button"
            onClick={() => setHowRole('affiliate')}
            style={howRole === 'affiliate' ? styles.howTabActive : styles.howTab}
          >
            🤝 Vetted Affiliate
          </button>
        </div>

        {/* Dynamic Card Container */}
        <div className="glass-panel" style={styles.howCard}>
          <div style={styles.howCardHeader}>
            <div>
              <h3 style={styles.howCardTitle}>{howItWorksSteps[howRole].title}</h3>
              <p style={styles.howCardSub}>{howItWorksSteps[howRole].desc}</p>
            </div>
            
            {/* Debt vs Equity Toggle */}
            <div style={styles.howTypeToggle}>
              <button
                type="button"
                onClick={() => setHowType('debt')}
                style={howType === 'debt' ? styles.howTypeBtnActive : styles.howTypeBtn}
              >
                🏛️ Private Debt Notes
              </button>
              <button
                type="button"
                onClick={() => setHowType('equity')}
                style={howType === 'equity' ? styles.howTypeBtnActive : styles.howTypeBtn}
              >
                🚀 Venture Equity (SAFEs)
              </button>
            </div>
          </div>

          {/* Timeline Grid */}
          <div style={styles.howTimelineGrid}>
            {howItWorksSteps[howRole][howType].map((step, idx) => (
              <div key={idx} style={styles.howStepCard}>
                <div style={styles.howStepHeader}>
                  <span style={styles.howStepNumber}>{step.step}</span>
                  <div style={styles.howStepLine} />
                </div>
                <h4 style={styles.howStepTitle}>{step.title}</h4>
                <p style={styles.howStepText}>{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Expanded Landing Footer */}
      <footer style={styles.footerContainer}>
        <div className="footer-grid-responsive">
          {/* Column 1: About */}
          <div style={styles.footerColumn}>
            <h4 style={styles.footerColTitle}>About US</h4>
            <p style={styles.footerColText}>
              An invitation-only private capital ecosystem decoupling private debt & equity warrants via payroll-bypass underwriting and autonomous AI brokerage nodes.
            </p>
            <span 
              className="footer-list-item-hover"
              style={{ ...styles.footerListItem, textDecoration: 'underline', marginTop: '0.5rem', display: 'inline-block' }} 
              onClick={() => setFooterModalType('about')}
            >
              Read our mission →
            </span>
          </div>

          {/* Column 2: Support */}
          <div style={styles.footerColumn}>
            <h4 style={styles.footerColTitle}>Support</h4>
            <ul style={styles.footerList}>
              <li className="footer-list-item-hover" style={styles.footerListItem} onClick={() => { setFooterModalType('support'); setSupportCategory('General Support Request'); }}>💬 Raise a Support Request</li>
              <li className="footer-list-item-hover" style={styles.footerListItem} onClick={() => { setFooterModalType('support'); setSupportCategory('Investor Support'); }}>📈 Investor Support</li>
              <li className="footer-list-item-hover" style={styles.footerListItem} onClick={() => { setFooterModalType('support'); setSupportCategory('Raise Capital'); }}>💰 Raise Capital</li>
              <li className="footer-list-item-hover" style={styles.footerListItem} onClick={() => { setFooterModalType('support'); setSupportCategory('Press Inquiries'); }}>📰 Press Inquiries</li>
              <li className="footer-list-item-hover" style={styles.footerListItem} onClick={() => { setFooterModalType('support'); setSupportCategory('Technical'); }}>💻 Technical</li>
            </ul>
          </div>

          {/* Column 3: Legal */}
          <div style={styles.footerColumn}>
            <h4 style={styles.footerColTitle}>Legal</h4>
            <ul style={styles.footerList}>
              <li className="footer-list-item-hover" style={styles.footerListItem} onClick={() => setFooterModalType('legal_tos')}>Terms of Service</li>
              <li className="footer-list-item-hover" style={styles.footerListItem} onClick={() => setFooterModalType('legal_privacy')}>Privacy Policy</li>
              <li className="footer-list-item-hover" style={styles.footerListItem} onClick={() => setFooterModalType('legal_disclaimers')}>Disclaimers</li>
            </ul>
          </div>

          {/* Column 4: Contact Us */}
          <div style={styles.footerColumn}>
            <h4 style={styles.footerColTitle}>Contact US</h4>
            <p style={styles.footerColText}>
              Global Inquiries:<br/>
              <span className="footer-list-item-hover" style={{ color: 'var(--color-text-primary)', cursor: 'pointer' }} onClick={() => setFooterModalType('contact')}>contact@peerbridge.ai</span>
            </p>
            <p style={styles.footerColText}>
              Support Desk:<br/>
              <a href="mailto:support@peerbridge.ai" className="footer-list-item-hover" style={styles.footerLink}>support@peerbridge.ai</a>
            </p>
          </div>
        </div>

        <div style={styles.footerBottom}>
          <p>© 2026 Peer Bridge Networks Inc. SEC Regulation D / Reg CF Network Gateway. All rights reserved.</p>
          <p style={{ fontSize: '0.76rem', marginTop: '0.5rem', opacity: 0.5 }}>
            Alternative investing is high-risk. SEC verified network nodes represent private placements. Securities are offered under Reg CF or Reg D exclusions. Past performance does not guarantee future results.
          </p>
        </div>
      </footer>

      {/* Footer Modal Overlay */}
      {footerModalType && (
        <div style={styles.modalOverlay} onClick={() => setFooterModalType(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                {footerModalType === 'support' && `Raise Support: ${supportCategory}`}
                {footerModalType === 'about' && 'About Peer Bridge'}
                {footerModalType === 'contact' && 'Contact Us'}
                {footerModalType === 'legal_tos' && 'Terms of Service'}
                {footerModalType === 'legal_privacy' && 'Privacy Policy'}
                {footerModalType === 'legal_disclaimers' && 'Disclaimers'}
              </h3>
              <button style={styles.modalCloseBtn} onClick={() => setFooterModalType(null)}>×</button>
            </div>

            <div style={styles.modalBody}>
              {footerModalType === 'support' && (
                supportSuccess ? (
                  <div style={styles.successMessage}>
                    <h4 style={{ color: '#10b981', margin: '0 0 0.5rem 0' }}>✨ Ticket Created Successfully!</h4>
                    <p>Your support request for <strong>{supportCategory}</strong> has been logged. A notification was sent to <strong>support@peerbridge.ai</strong>.</p>
                    <p style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '1rem' }}>Closing in a few seconds...</p>
                  </div>
                ) : (
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (state.submitHelpTicket) {
                        state.submitHelpTicket(
                          supportCategory.toLowerCase().replace(/ /g, '_'), 
                          `[Public Support Request] ${supportMessage}`, 
                          supportEmail
                        );
                      } else {
                        console.log(`Public support ticket logged: [Category: ${supportCategory}] [Email: ${supportEmail}] Msg: ${supportMessage}`);
                        if (state.addNotification) {
                          state.addNotification('System', `Support ticket created for ${supportEmail} (Category: ${supportCategory})`);
                        }
                      }
                      setSupportSuccess(true);
                      setTimeout(() => {
                        setFooterModalType(null);
                        setSupportCategory('');
                        setSupportEmail('');
                        setSupportMessage('');
                        setSupportSuccess(false);
                      }, 3500);
                    }} 
                    style={styles.modalForm}
                  >
                    <div style={styles.modalInputGroup}>
                      <label style={styles.modalLabel}>Your Email Address</label>
                      <input 
                        type="email" 
                        placeholder="name@company.com" 
                        value={supportEmail}
                        onChange={(e) => setSupportEmail(e.target.value)}
                        style={styles.modalInput}
                        required
                      />
                    </div>
                    <div style={styles.modalInputGroup}>
                      <label style={styles.modalLabel}>Ticket Category</label>
                      <select
                        value={supportCategory}
                        onChange={(e) => setSupportCategory(e.target.value)}
                        style={styles.modalSelect}
                      >
                        <option value="General Support Request">General Support Request</option>
                        <option value="Investor Support">Investor Support</option>
                        <option value="Raise Capital">Raise Capital</option>
                        <option value="Press Inquiries">Press Inquiries</option>
                        <option value="Technical">Technical</option>
                      </select>
                    </div>
                    <div style={styles.modalInputGroup}>
                      <label style={styles.modalLabel}>Details for your Support Ticket</label>
                      <textarea 
                        placeholder={`Explain your ${supportCategory} inquiry in detail...`}
                        value={supportMessage}
                        onChange={(e) => setSupportMessage(e.target.value)}
                        style={styles.modalTextarea}
                        rows={5}
                        required
                      />
                    </div>
                    <button type="submit" className="btn-primary" style={styles.modalSubmitBtn}>
                      Submit Ticket to support@peerbridge.ai
                    </button>
                  </form>
                )
              )}

              {footerModalType === 'about' && (
                <div style={styles.legalText}>
                  <p><strong>Peer Bridge</strong> is an invitation-only capital gateway designed to modernize commercial debt syndication and equity crowdfunding.</p>
                  <p>Our platform introduces a <strong>Proprietary Risk Index (PRI)</strong> scoring engine that bypasses archaic credit bureau weights by integrating real-time gross-to-net payroll synchronization (ADP & Paychex) with transaction categories auditing (Plaid). This allows us to establish capital lines based on actual, live savings rates and debt-to-disposable income parameters rather than lagging historical summaries.</p>
                </div>
              )}

              {footerModalType === 'contact' && (
                <div style={styles.legalText}>
                  <p><strong>Global Operations & Inquiries:</strong></p>
                  <p>Email: <a href="mailto:contact@peerbridge.ai" style={styles.legalLink}>contact@peerbridge.ai</a></p>
                  <p><strong>Support & System Audits:</strong></p>
                  <p>Email: <a href="mailto:support@peerbridge.ai" style={styles.legalLink}>support@peerbridge.ai</a></p>
                  <p><strong>San Francisco Headquarters:</strong></p>
                  <p>Peer Bridge Networks Inc.<br />100 Pine Street, 21st Floor<br />San Francisco, CA 94111</p>
                  <p><strong>New York Office:</strong></p>
                  <p>One World Trade Center, Suite 85<br />New York, NY 10007</p>
                </div>
              )}

              {footerModalType === 'legal_tos' && (
                <div style={styles.legalText}>
                  <h4 style={{ color: 'var(--color-text-primary)', margin: '1rem 0 0.5rem 0', fontSize: '1rem' }}>1. Acceptance of Terms</h4>
                  <p>By accessing or using the Peer Bridge Private Gateway (peerbridge.ai), you agree to be bound by these Terms of Service. If you do not agree, you are legally restricted from viewing or participating in private note syndicates or crowdfunding placements.</p>
                  
                  <h4 style={{ color: 'var(--color-text-primary)', margin: '1rem 0 0.5rem 0', fontSize: '1rem' }}>2. Regulation Crowdfunding (Reg CF) & Reg D Limitations</h4>
                  <p>All fundraising offerings listed on the Peer Bridge gateway represent private placements under SEC Regulation D (Rule 506(c)) or Regulation Crowdfunding (Reg CF). Participating investors must satisfy specific accreditation standards, verify financial credentials, and acknowledge secondary-market transfer restrictions.</p>
                  
                  <h4 style={{ color: 'var(--color-text-primary)', margin: '1rem 0 0.5rem 0', fontSize: '1rem' }}>3. Direct API Vetting Authorization</h4>
                  <p>When you sync your payroll credentials (ADP, Paychex) or banking connections (Plaid), you authorize Peer Bridge to run real-time automated gross-to-net salary verification and category discretionary burn auditing. This information is utilized strictly to compute the BRS (Behavioral Risk Score) and Proprietary Risk Index (PRI), which bypass traditional credit bureau weights.</p>
                  
                  <h4 style={{ color: 'var(--color-text-primary)', margin: '1rem 0 0.5rem 0', fontSize: '1rem' }}>4. Platform Servicing & Origination Fees</h4>
                  <p>Lenders acknowledge that Peer Bridge extracts a 1.5% origination fee from disbursed principal notes and a 1.5% servicing fee from note repayment distributions. Equity campaign placements carry a 3.5% transaction success fee upon closing.</p>
                </div>
              )}

              {footerModalType === 'legal_privacy' && (
                <div style={styles.legalText}>
                  <h4 style={{ color: 'var(--color-text-primary)', margin: '1rem 0 0.5rem 0', fontSize: '1rem' }}>1. Information We Collect</h4>
                  <p>We collect personal information directly from your credential inputs, passport identity files (KYC), linked ADP/Paychex W-2 payroll telemetry, and Plaid transactional records. We do not inspect or store password credentials; payroll and bank synchronizations are executed securely via sandboxed OAuth redirects.</p>
                  
                  <h4 style={{ color: 'var(--color-text-primary)', margin: '1rem 0 0.5rem 0', fontSize: '1rem' }}>2. Use of Telemetry Data</h4>
                  <p>Telemetry data is parsed locally by the PRI risk engine to evaluate probability of default (PD) and savings buffers. We do not sell, rent, or distribute transactional details to marketing affiliates. Data is stored in secure Firebase Firestore instances using military-grade AES-256 field-level encryption.</p>
                  
                  <h4 style={{ color: 'var(--color-text-primary)', margin: '1rem 0 0.5rem 0', fontSize: '1rem' }}>3. SEC Audit Trails & Compliance</h4>
                  <p>Pursuant to FINRA and SEC funding portal guidelines, we are legally required to maintain secure audit trails of all transactions, SAFE warrants, promissory agreements, and identity verifications for a minimum of 6 years. Cryptographic SHA-256 agreement signatures are recorded on the public ledger.</p>
                </div>
              )}

              {footerModalType === 'legal_disclaimers' && (
                <div style={styles.legalText}>
                  <h4 style={{ color: '#f43f5e', margin: '1rem 0 0.5rem 0', fontSize: '1rem' }}>⚠️ PRIVATE PLACEMENT RISK DISCLOSURE</h4>
                  <p>Investments in private debt notes and early-stage startup SAFEs are highly speculative and carry extreme volatility. Lenders can lose their entire principal balance in default events. Debt note interest payments are not guaranteed by Peer Bridge, and holdings are not FDIC insured.</p>
                  
                  <h4 style={{ color: 'var(--color-text-primary)', margin: '1rem 0 0.5rem 0', fontSize: '1rem' }}>⚠️ NO RECOMMENDATION OR INVESTMENT ADVICE</h4>
                  <p>Peer Bridge is a technology gateway platform and does not offer financial advisory services. Listing campaigns on the credit registry does not constitute a platform recommendation. Investors must perform independent due diligence before placing fractional note balances.</p>
                  
                  <h4 style={{ color: 'var(--color-text-primary)', margin: '1rem 0 0.5rem 0', fontSize: '1rem' }}>⚠️ RESTRICTIONS ON TRANSFERS (DOMESTIC USA EXCLUSIONS)</h4>
                  <p>Securities issued under SEC Reg CF and Reg D are restricted and cannot be sold, transferred, or reassigned for a period of 12 months, except in limited cases (e.g. transfers to family members or trust estates). Retail debt syndicates are strictly restricted to domestic USA-to-USA routing channels.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--bg-primary)',
    padding: '0 2rem',
  },
  header: {
    height: '80px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--border-color)',
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
    color: 'var(--color-text-primary)',
    lineHeight: '1',
  },
  logoSlogan: {
    fontFamily: 'var(--font-script)',
    fontSize: '0.78rem',
    color: 'var(--color-text-primary)',
    lineHeight: '1',
    letterSpacing: '0.19em',
    marginTop: '0.25rem',
    opacity: 0.9,
  },
  inviteBadge: {
    padding: '0.35rem 0.75rem',
    borderRadius: '4px',
    border: '1px solid var(--border-color)',
    color: 'var(--color-text-primary)',
    fontSize: '0.75rem',
    fontWeight: '700',
  },
  main: {
    flex: '1',
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: '4rem',
    alignItems: 'center',
    padding: '1rem 0 2rem 0',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  heroSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  participantBadge: {
    alignSelf: 'flex-start',
    background: 'rgba(10, 102, 194, 0.06)',
    border: '1px solid rgba(10, 102, 194, 0.15)',
    borderRadius: '30px',
    padding: '0.4rem 1rem',
    fontSize: '0.85rem',
    fontWeight: '700',
    color: 'var(--border-accent)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '0.5rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  heroTitle: {
    fontSize: '3.5rem',
    lineHeight: '1.1',
    fontWeight: '800',
  },
  gradientText: {
    background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    display: 'inline-block',
  },
  heroSub: {
    fontSize: '1.15rem',
    color: 'var(--color-text-secondary)',
    maxWidth: '540px',
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '0.75rem',
    marginTop: '2.5rem',
    maxWidth: '540px',
  },
  featurePill: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '0.75rem 1rem',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'var(--color-text-primary)',
    backdropFilter: 'blur(8px)',
  },
  featureIcon: {
    fontSize: '1.1rem',
    background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.1) 0%, rgba(79, 172, 254, 0.1) 100%)',
    padding: '0.25rem',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(0, 242, 254, 0.15)',
  },
  metricsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1.5rem',
    marginTop: '2rem',
  },
  metricCard: {
    borderLeft: '2.5px solid var(--border-accent)',
    paddingLeft: '1rem',
  },
  metricVal: {
    display: 'block',
    fontSize: '1.75rem',
    fontWeight: '800',
    color: 'var(--color-text-primary)',
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
    color: 'var(--color-text-secondary)',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: 'var(--color-text-secondary)',
    textTransform: 'uppercase',
  },
  input: {
    width: '100%',
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '0.85rem 1rem',
    color: 'var(--color-text-primary)',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'border 0.2s ease',
  },
  select: {
    width: '100%',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '0.85rem 1rem',
    color: 'var(--color-text-primary)',
    fontSize: '0.95rem',
    outline: 'none',
    cursor: 'pointer',
  },
  tipBox: {
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    padding: '0.75rem',
    fontSize: '0.8rem',
    color: 'var(--color-text-primary)',
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
    padding: '2rem 0 3rem 0',
    borderTop: '1px solid var(--border-color)',
  },
  sectionHeader: {
    textAlign: 'center',
    marginBottom: '1.5rem',
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
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1.25rem',
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
    background: 'var(--bg-primary)',
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.7rem',
    fontWeight: '600',
    color: 'var(--color-text-secondary)',
    textTransform: 'uppercase',
  },
  offeringStatus: {
    color: 'var(--color-text-primary)',
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
    color: 'var(--color-text-secondary)',
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
    background: 'var(--bg-primary)',
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
    borderTop: '1px solid var(--border-color)',
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
    color: 'var(--color-text-primary)',
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
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: '30px',
    padding: '0.65rem 1.25rem',
    fontSize: '0.85rem',
    fontWeight: '700',
    color: 'var(--color-text-primary)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
  },
  footerContainer: {
    borderTop: '1px solid var(--border-color)',
    padding: '2rem 2rem 2rem 2rem',
    marginTop: '2rem',
    background: 'transparent',
    backdropFilter: 'none',
  },
  footerGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '2.5rem',
    maxWidth: '1200px',
    margin: '0 auto 3rem auto',
  },
  footerColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.85rem',
  },
  footerColTitle: {
    fontSize: '0.88rem',
    fontWeight: '800',
    color: 'var(--color-text-primary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    margin: 0,
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '0.5rem',
  },
  footerColText: {
    fontSize: '0.82rem',
    color: 'var(--color-text-secondary)',
    lineHeight: '1.55',
    margin: 0,
  },
  footerList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
  },
  footerListItem: {
    fontSize: '0.82rem',
    color: 'var(--color-text-secondary)',
    cursor: 'pointer',
    transition: 'color 0.2s ease',
  },
  footerLink: {
    color: 'var(--color-text-primary)',
    textDecoration: 'none',
    fontSize: '0.82rem',
    transition: 'opacity 0.2s ease',
  },
  footerBottom: {
    borderTop: '1px solid var(--border-color)',
    paddingTop: '2rem',
    textAlign: 'center',
    maxWidth: '1200px',
    margin: '0 auto',
    fontSize: '0.82rem',
    color: '#64748b',
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.75)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '1.5rem',
  },
  modalContent: {
    background: '#0b0f1a',
    border: '1px solid var(--border-color)',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '600px',
    maxHeight: '85vh',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem',
    borderBottom: '1px solid var(--border-color)',
  },
  modalTitle: {
    fontSize: '1.15rem',
    fontWeight: '800',
    color: 'var(--color-text-primary)',
    margin: 0,
  },
  modalCloseBtn: {
    background: 'none',
    border: 'none',
    fontSize: '1.75rem',
    color: 'var(--color-text-muted)',
    cursor: 'pointer',
    outline: 'none',
    transition: 'color 0.2s ease',
  },
  modalBody: {
    padding: '1.5rem',
    overflowY: 'auto',
  },
  modalForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  modalInputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  modalLabel: {
    fontSize: '0.72rem',
    fontWeight: '700',
    color: 'var(--color-text-muted)',
    textTransform: 'uppercase',
  },
  modalInput: {
    width: '100%',
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    color: 'var(--color-text-primary)',
    fontSize: '0.95rem',
    outline: 'none',
  },
  modalTextarea: {
    width: '100%',
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    color: 'var(--color-text-primary)',
    fontSize: '0.95rem',
    outline: 'none',
    resize: 'none',
    fontFamily: 'inherit',
  },
  modalSubmitBtn: {
    alignSelf: 'flex-start',
    padding: '0.75rem 1.5rem',
    fontSize: '0.85rem',
    marginTop: '0.5rem',
  },
  successMessage: {
    textAlign: 'center',
    padding: '2rem 1rem',
    color: 'var(--color-text-secondary)',
  },
  legalText: {
    color: 'var(--color-text-secondary)',
    fontSize: '0.88rem',
    lineHeight: '1.65',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  legalLink: {
    color: 'var(--border-accent)',
    textDecoration: 'underline',
  },
  modalSelect: {
    width: '100%',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    color: 'var(--color-text-primary)',
    fontSize: '0.95rem',
    outline: 'none',
    cursor: 'pointer',
  },
  howItWorksSection: {
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
    padding: '2rem 0 3rem 0',
    borderTop: '1px solid var(--border-color)',
  },
  howTabsContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  howTab: {
    padding: '0.8rem 1.75rem',
    borderRadius: '30px',
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    color: 'var(--color-text-secondary)',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '0.92rem',
    transition: 'all 0.3s ease',
  },
  howTabActive: {
    padding: '0.8rem 1.75rem',
    borderRadius: '30px',
    background: 'var(--border-accent)',
    border: '1px solid var(--border-accent)',
    color: '#ffffff',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '0.92rem',
    transition: 'all 0.3s ease',
  },
  howCard: {
    padding: '1.5rem 0',
    background: 'transparent',
    border: 'none',
    borderRadius: '0',
    backdropFilter: 'none',
  },
  howCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '2rem',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '1.5rem',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
  },
  howCardTitle: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: 'var(--color-text-primary)',
    margin: 0,
  },
  howCardSub: {
    fontSize: '0.92rem',
    color: 'var(--color-text-secondary)',
    marginTop: '0.35rem',
    maxWidth: '600px',
  },
  howTypeToggle: {
    display: 'flex',
    background: 'rgba(0, 0, 0, 0.05)',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    padding: '0.25rem',
    gap: '0.25rem',
  },
  howTypeBtn: {
    padding: '0.6rem 1.25rem',
    background: 'none',
    border: 'none',
    borderRadius: '8px',
    color: 'var(--color-text-secondary)',
    fontWeight: '600',
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  howTypeBtnActive: {
    padding: '0.6rem 1.25rem',
    background: 'var(--bg-secondary)',
    border: 'none',
    borderRadius: '8px',
    color: 'var(--color-text-primary)',
    fontWeight: '600',
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  howTimelineGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '2rem',
  },
  howStepCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  howStepHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '0.25rem',
  },
  howStepNumber: {
    fontSize: '1.25rem',
    fontWeight: '850',
    color: 'var(--border-accent)',
    fontFamily: 'monospace',
    background: 'rgba(10, 102, 194, 0.05)',
    border: '1px solid rgba(10, 102, 194, 0.15)',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  howStepLine: {
    flex: 1,
    height: '1px',
    background: 'linear-gradient(90deg, rgba(10, 102, 194, 0.2) 0%, var(--border-color) 100%)',
  },
  howStepTitle: {
    fontSize: '1.05rem',
    fontWeight: '750',
    color: 'var(--color-text-primary)',
    margin: 0,
  },
  howStepText: {
    fontSize: '0.82rem',
    color: 'var(--color-text-secondary)',
    lineHeight: '1.5',
    margin: 0,
  }
};
