'use client';

import { useState, useRef } from 'react';
import { calculatePRI, RISK_GRADES, MOCK_BORROWERS_PRI } from './RiskEngine';

export default function SalesAdminModule({ state }) {
  const [activeAdminTab, setActiveAdminTab] = useState('admittance'); // admittance, risk_console, portfolio_risk
  
  // Existing Admissions States
  const [newCode, setNewCode] = useState('');
  const [emails, setEmails] = useState('');
  const [selectedCode, setSelectedCode] = useState(state.invites[0]?.code || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [singleEmail, setSingleEmail] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const fileInputRef = useRef(null);

  // Risk Underwriting Console States
  const [selectedCandidate, setSelectedCandidate] = useState('kristi@toninlogistics.com');
  const [underwritingNotes, setUnderwritingNotes] = useState('');
  const [showAdjustSliders, setShowAdjustSliders] = useState(false);
  const [customLimit, setCustomLimit] = useState(5000);
  const [customTenor, setCustomTenor] = useState(12);
  const [activeAuditLayer, setActiveAuditLayer] = useState('layer0');
  const [underwritingStatus, setUnderwritingStatus] = useState('pending'); // pending, approved, declined, approved_adjusted
  const [auditTrail, setAuditTrail] = useState([
    { user: 'RiskOps System', action: 'KYC Document verification pipeline successfully passed', timestamp: '2026-06-01T10:15:00Z' },
    { user: 'Compliance Vetting Node', action: 'Watchlist / PEP / OFAC clearances confirmed', timestamp: '2026-06-01T10:16:12Z' }
  ]);

  // Capital Partner Filters
  const [filterCohort, setFilterCohort] = useState('All');
  const [filterGrade, setFilterGrade] = useState('All');

  // Content Publisher Form States
  const [announceTitle, setAnnounceTitle] = useState('');
  const [announceText, setAnnounceText] = useState('');
  const [newsHeading, setNewsHeading] = useState('');
  const [newsText, setNewsText] = useState('');
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventCategory, setEventCategory] = useState('Deal-Flow Pitch');
  const [spotlightTitle, setSpotlightTitle] = useState(state.spotlight?.title || '');
  const [spotlightText, setSpotlightText] = useState(state.spotlight?.text || '');
  const [spotlightMin, setSpotlightMin] = useState(state.spotlight?.minEntry || '');
  const [spotlightCamp, setSpotlightCamp] = useState(state.spotlight?.campaignId || 'camp-1');

  // Load active candidate PRI details
  const priDetails = MOCK_BORROWERS_PRI[selectedCandidate] || MOCK_BORROWERS_PRI['kristi@toninlogistics.com'];

  // Content Publisher Handlers
  const handlePublishAnnouncement = (e) => {
    e.preventDefault();
    if (!announceTitle.trim() || !announceText.trim()) {
      setError('Please provide both announcement title and description.');
      return;
    }
    state.addAnnouncement(announceTitle, announceText);
    setSuccess(`Successfully published node announcement: "${announceTitle}"`);
    setAnnounceTitle('');
    setAnnounceText('');
    setError('');
  };

  const handlePublishNews = (e) => {
    e.preventDefault();
    if (!newsHeading.trim() || !newsText.trim()) {
      setError('Please provide both news heading and summary text.');
      return;
    }
    state.addNews(newsHeading, newsText);
    setSuccess(`Successfully published news bulletin: "${newsHeading}"`);
    setNewsHeading('');
    setNewsText('');
    setError('');
  };

  const handlePublishEvent = (e) => {
    e.preventDefault();
    if (!eventTitle.trim() || !eventDate.trim() || !eventDesc.trim()) {
      setError('Please fill in all event fields.');
      return;
    }
    state.addEvent(eventTitle, eventDate, eventDesc, eventCategory);
    setSuccess(`Successfully published ecosystem event: "${eventTitle}"`);
    setEventTitle('');
    setEventDate('');
    setEventDesc('');
    setError('');
  };

  const handleUpdateSpotlight = (e) => {
    e.preventDefault();
    if (!spotlightTitle.trim() || !spotlightText.trim() || !spotlightMin.trim()) {
      setError('Please provide spotlight title, description, and minimum entry.');
      return;
    }
    state.updateSpotlight(spotlightTitle, spotlightText, spotlightMin, spotlightCamp);
    setSuccess(`Successfully updated sponsored spotlight banner: "${spotlightTitle}"`);
    setError('');
  };

  // Existing Waitlist token generator handlers
  const handleGenerateCode = (e) => {
    e.preventDefault();
    if (!newCode.trim()) {
      setError('Please provide a code name.');
      return;
    }
    const res = state.generateInviteCode(newCode);
    if (res.success) {
      setNewCode('');
      setError('');
      setSuccess(`Invite code '${newCode.toUpperCase()}' generated successfully!`);
      setTimeout(() => setSuccess(''), 4000);
      if (!selectedCode) setSelectedCode(newCode.toUpperCase());
    } else {
      setError(res.error);
    }
  };

  const handleBulkInvite = (e) => {
    e.preventDefault();
    if (!emails.trim()) {
      setError('Please provide email addresses.');
      return;
    }
    if (!selectedCode) {
      setError('Please select or generate an invite code first.');
      return;
    }

    const res = state.sendBulkInvitations(emails, selectedCode);
    if (res.success) {
      setEmails('');
      setError('');
      setSuccess(`Dispatched invitation emails with code '${selectedCode}' to ${res.count} recipient(s)!`);
      setTimeout(() => setSuccess(''), 4000);
    } else {
      setError(res.error);
    }
  };

  const handleSingleInvite = (e) => {
    e.preventDefault();
    if (!singleEmail.trim()) {
      setError('Please provide an email address.');
      return;
    }

    const cleanEmail = singleEmail.trim().toLowerCase();
    const emailPrefix = cleanEmail.split('@')[0].toUpperCase().replace(/[^A-Z0-9]/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const code = `PB-INV-${emailPrefix}-${randomSuffix}`;

    const res = state.generateInviteCode(code);
    if (res.success) {
      setGeneratedCode(code);
      setSuccess(`Waitlist invite registered successfully for ${cleanEmail}!`);
      setTimeout(() => setSuccess(''), 4000);
      setError('');
      state.sendBulkInvitations(cleanEmail, code);
      setSingleEmail('');
    } else {
      setError(res.error);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const parseTextForEmails = (text) => {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const matches = text.match(emailRegex);
    if (matches && matches.length > 0) {
      const uniqueEmails = [...new Set(matches)];
      setEmails(prev => {
        const existing = prev ? prev.split(',').map(x => x.trim()).filter(Boolean) : [];
        const combined = [...new Set([...existing, ...uniqueEmails])];
        return combined.join(', ');
      });
      setError('');
      setSuccess(`Parsed ${uniqueEmails.length} valid email address(es) from file successfully!`);
      setTimeout(() => setSuccess(''), 4000);
    } else {
      setError('No valid email addresses found in the uploaded file.');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      parseTextForEmails(text);
    };
    reader.readAsText(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // Administration Vetting / Password Override overrides
  const handleResetPassword = (userId, name) => {
    if (confirm(`Are you sure you want to reset password for ${name}?`)) {
      const res = state.resetUserPassword(userId);
      if (res.success) {
        setSuccess(`Password for ${name} reset to temporary 'password123'!`);
        setTimeout(() => setSuccess(''), 4000);
      }
    }
  };

  const handleToggleBlock = (userId, name, status) => {
    const isBlocking = status !== 'blocked';
    if (confirm(`Are you sure you want to ${isBlocking ? 'BLOCK' : 'UNBLOCK'} ${name}?`)) {
      const res = state.toggleBlockUser(userId);
      if (res.success) {
        setSuccess(`Successfully ${isBlocking ? 'BLOCKED' : 'UNBLOCKED'} user ${name}.`);
        setTimeout(() => setSuccess(''), 4000);
      }
    }
  };

  const handleDeleteUser = (userId, name) => {
    if (confirm(`🗑 WARNING: Are you sure you want to completely DELETE user ${name}? This action is irreversible.`)) {
      const res = state.deleteUserFromDirectory(userId);
      if (res.success) {
        setSuccess(`User profile ${name} purged from global invitation registry.`);
        setTimeout(() => setSuccess(''), 4000);
      }
    }
  };

  const handleToggleVetCredentials = (userId, name, status) => {
    const isVetting = status !== 'verified';
    if (confirm(`Are you sure you want to ${isVetting ? 'APPROVE and VET' : 'REVOKE vetting for'} ${name}?`)) {
      const res = state.vetUserCredentials(userId);
      if (res.success) {
        setSuccess(`Successfully ${isVetting ? 'vetted' : 'unvetted'} credentials for ${name}.`);
        setTimeout(() => setSuccess(''), 4000);
      }
    }
  };

  // Underwriting Action Handlers
  const handleUnderwriteDecision = (decisionType) => {
    let text = `Manual underwriting decision: ${decisionType.toUpperCase()} registered for borrower candidate.`;
    if (decisionType === 'approved_adjusted') {
      text = `Manual underwriting decision: APPROVED WITH ADJUSTED TERMS ($${customLimit.toLocaleString()} principal at ${customTenor} months tenor).`;
    }
    
    setUnderwritingStatus(decisionType);
    setAuditTrail([
      ...auditTrail,
      { user: `${state.customer.first_name} ${state.customer.last_name} (RiskOps)`, action: text, timestamp: new Date().toISOString() }
    ]);
    
    state.addNotification('System', `RiskOps Security: Kristi Tonin Cold-Storage note application set to status ${decisionType.toUpperCase()} by credit committee.`);
    setSuccess(`Underwriting decision locked: ${decisionType.toUpperCase()}`);
    setTimeout(() => setSuccess(''), 4000);
    setShowAdjustSliders(false);
  };

  // Count active / pending stats dynamically from directory
  const activeMembersCount = state.directory.filter(m => m.status !== 'blocked').length;
  const blockedMembersCount = state.directory.filter(m => m.status === 'blocked').length;
  const vettedMembersCount = state.directory.filter(m => m.status === 'verified').length;

  const filteredDirectory = state.directory.filter(member => {
    const fullName = `${member.first_name || ''} ${member.last_name || ''}`.toLowerCase();
    const email = (member.email || '').toLowerCase();
    const role = (member.role_flags || []).join(' ').toLowerCase();
    const query = memberSearchQuery.toLowerCase();
    return fullName.includes(query) || email.includes(query) || role.includes(query);
  });

  const getSimulatedAuditInfo = (memberId) => {
    switch (memberId) {
      case 'dir-cust-marcus': return { joined: '2026-01-18', lastLogin: '2026-06-04 11:35 AM', inviteCode: 'SYSTEM-VIP' };
      case 'dir-cust-mohit': return { joined: '2026-03-12', lastLogin: '2026-06-04 11:28 AM', inviteCode: 'PEER-BRIDGE-2026' };
      case 'dir-cust-kristi': return { joined: '2026-04-01', lastLogin: '2026-06-04 11:31 AM', inviteCode: 'SYSTEM-VIP' };
      case 'db-cust-evelyn': return { joined: '2026-01-15', lastLogin: '2026-06-04 11:33 AM', inviteCode: 'SYSTEM-VIP' };
      case 'db-cust-jenkins': return { joined: '2026-02-01', lastLogin: '2026-06-04 07:12 AM', inviteCode: 'SYSTEM-VIP' };
      default: return { joined: '2026-05-30', lastLogin: '2026-06-03 04:15 PM', inviteCode: 'PEER-BRIDGE-2026' };
    }
  };

  return (
    <div style={styles.container} className="animate-fade-in-up">
      {/* Sleek Title Banner */}
      <div style={styles.headerTitleRow}>
        <div>
          <h2 style={styles.mainTitle}>🔑 Institutional Admissions & Risk Operations Cockpit</h2>
          <p style={styles.subTitle}>
            Manage invite waitlists, audit user files, score credits with our Proprietary Risk Engine, and monitor vintage cohort performance metrics.
          </p>
        </div>
      </div>

      {/* Modern Segmented Tab Bar */}
      <div style={styles.segmentedTabWrapper}>
        <div style={styles.tabContainer}>
          <button 
            onClick={() => setActiveAdminTab('admittance')}
            style={{ 
              ...styles.tabBtn, 
              color: activeAdminTab === 'admittance' ? 'var(--border-accent)' : 'var(--color-text-secondary)',
              background: activeAdminTab === 'admittance' ? 'var(--border-color)' : 'transparent',
              borderBottom: activeAdminTab === 'admittance' ? '2px solid #00f2fe' : 'none'
            }}
          >
            🎟 Admittance & User Ledger
          </button>
          <button 
            onClick={() => setActiveAdminTab('risk_console')}
            style={{ 
              ...styles.tabBtn, 
              color: activeAdminTab === 'risk_console' ? 'var(--border-accent)' : 'var(--color-text-secondary)',
              background: activeAdminTab === 'risk_console' ? 'var(--border-color)' : 'transparent',
              borderBottom: activeAdminTab === 'risk_console' ? '2px solid #00f2fe' : 'none'
            }}
          >
            🏛 Underwriting Risk Console
          </button>
          <button 
            onClick={() => setActiveAdminTab('portfolio_risk')}
            style={{ 
              ...styles.tabBtn, 
              color: activeAdminTab === 'portfolio_risk' ? 'var(--border-accent)' : 'var(--color-text-secondary)',
              background: activeAdminTab === 'portfolio_risk' ? 'var(--border-color)' : 'transparent',
              borderBottom: activeAdminTab === 'portfolio_risk' ? '2px solid #00f2fe' : 'none'
            }}
          >
            📈 Vintage Risk Analytics
          </button>
          <button 
            onClick={() => setActiveAdminTab('content_publisher')}
            style={{ 
              ...styles.tabBtn, 
              color: activeAdminTab === 'content_publisher' ? 'var(--border-accent)' : 'var(--color-text-secondary)',
              background: activeAdminTab === 'content_publisher' ? 'var(--border-color)' : 'transparent',
              borderBottom: activeAdminTab === 'content_publisher' ? '2px solid #00f2fe' : 'none'
            }}
          >
            📢 Content Publisher
          </button>
        </div>
      </div>

      {success && (
        <div style={styles.successToast}>
          ✨ {success}
        </div>
      )}

      {/* Tab 1: Admittance & User Accounts Administration (Original Cockpit) */}
      {activeAdminTab === 'admittance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Overview Analytics Metrics */}
          <div style={styles.metricsRow}>
            <div className="glass-panel" style={styles.metricCard}>
              <div style={styles.metricHeader}>
                <span style={styles.metricLabel}>Admitted Members</span>
                <span style={{ fontSize: '1.2rem' }}>🌐</span>
              </div>
              <span style={styles.metricVal}>{activeMembersCount}</span>
              <span style={{ fontSize: '0.62rem', color: '#10b981' }}>🟢 Active nodes in ecosystem</span>
            </div>
            <div className="glass-panel" style={styles.metricCard}>
              <div style={styles.metricHeader}>
                <span style={styles.metricLabel}>Vetted credentials</span>
                <span style={{ fontSize: '1.2rem' }}>🛡</span>
              </div>
              <span style={{ ...styles.metricVal, color: '#00f2fe' }}>{vettedMembersCount}</span>
              <span style={{ fontSize: '0.62rem', color: '#00f2fe' }}>🌟 SEC compliant audited profiles</span>
            </div>
            <div className="glass-panel" style={styles.metricCard}>
              <div style={styles.metricHeader}>
                <span style={styles.metricLabel}>Blocked Accounts</span>
                <span style={{ fontSize: '1.2rem' }}>🚫</span>
              </div>
              <span style={{ ...styles.metricVal, color: '#ef4444' }}>{blockedMembersCount}</span>
              <span style={{ fontSize: '0.62rem', color: '#ef4444' }}>⚠️ Lockouts active</span>
            </div>
            <div className="glass-panel" style={styles.metricCard}>
              <div style={styles.metricHeader}>
                <span style={styles.metricLabel}>Invite Keys Issued</span>
                <span style={{ fontSize: '1.2rem' }}>🎟</span>
              </div>
              <span style={{ ...styles.metricVal, color: '#d4af37' }}>{state.invites.length}</span>
              <span style={{ fontSize: '0.62rem', color: '#d4af37' }}>🔑 Private key tokens registered</span>
            </div>
          </div>

          <div style={styles.grid}>
            {/* Bulk Imports & Code Generator (Left Column) */}
            <div style={styles.formCol}>
              {/* Create Invitation Token */}
              <div className="glass-panel" style={styles.card}>
                <h3 style={styles.cardTitle}>🎟 Create Private Admission Token</h3>
                <p style={styles.cardDesc}>
                  Generate cryptographic tokens to allow high-profile network members to bypass waitlist vetting.
                </p>

                <form onSubmit={handleGenerateCode} style={styles.form}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Token Code Name</label>
                    <input
                      type="text"
                      placeholder="e.g. VIP-ANGEL-COFI"
                      value={newCode}
                      onChange={(e) => setNewCode(e.target.value)}
                      style={styles.input}
                      required
                    />
                  </div>
                  {error && !emails && <span style={styles.errorText}>{error}</span>}
                  <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start', padding: '0.5rem 1.25rem', fontSize: '0.76rem' }}>
                    Generate Key Token
                  </button>
                </form>
              </div>

              {/* Single Waitlist Email Invitation */}
              <div className="glass-panel" style={styles.card}>
                <h3 style={styles.cardTitle}>✉ Single waitlist email invitation</h3>
                <p style={styles.cardDesc}>
                  Generate a unique waitlist bypass code for a prospective member. They can copy this code and register immediately.
                </p>

                <form onSubmit={handleSingleInvite} style={styles.form}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Recipient Email Address</label>
                    <input
                      type="email"
                      placeholder="e.g. testuser@peerbridge.ai"
                      value={singleEmail}
                      onChange={(e) => setSingleEmail(e.target.value)}
                      style={styles.input}
                      required
                    />
                  </div>
                  {error && singleEmail && <span style={styles.errorText}>{error}</span>}
                  <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start', padding: '0.5rem 1.25rem', fontSize: '0.76rem' }}>
                    Generate & Register Invite Code
                  </button>
                </form>

                {generatedCode && (
                  <div style={styles.bypassTokenBox}>
                    <span style={{ fontSize: '0.7rem', color: '#00f2fe', fontWeight: '800', textTransform: 'uppercase' }}>
                      🔑 Cryptographic Waitlist Bypass Code
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.3)', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                      <code style={{ fontSize: '0.9rem', color: 'var(--color-text-primary)', fontWeight: '800', letterSpacing: '0.05em' }}>
                        {generatedCode}
                      </code>
                      <button 
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(generatedCode);
                          setSuccess('Copied to clipboard!');
                          setTimeout(() => setSuccess(''), 2000);
                        }}
                        style={{ background: 'transparent', border: 'none', color: '#00f2fe', fontSize: '0.7rem', fontWeight: '750', cursor: 'pointer' }}
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Bulk Email Invitations & Drag Drop Parser */}
              <div className="glass-panel" style={styles.card}>
                <h3 style={styles.cardTitle}>✉ Bulk Member Invitation (CSV / XLS Parser)</h3>
                <p style={styles.cardDesc}>
                  Import prospective member registries. Supports dragging/dropping any `.csv` or text file to extract emails instantly.
                </p>

                <form onSubmit={handleBulkInvite} style={styles.form}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Select Invite Token</label>
                    <select
                      value={selectedCode}
                      onChange={(e) => setSelectedCode(e.target.value)}
                      style={styles.select}
                    >
                      {state.invites.map(inv => (
                        <option key={inv.code} value={inv.code}>
                          {inv.code} (Uses: {inv.usedCount})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div 
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={triggerFileInput}
                    style={styles.dragZone}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileInputChange} 
                      style={{ display: 'none' }} 
                      accept=".csv,.txt,.xls,.xlsx"
                    />
                    <span style={{ fontSize: '1.5rem', marginBottom: '0.35rem' }}>📂</span>
                    <span style={{ fontSize: '0.76rem', color: 'var(--color-text-primary)', fontWeight: '700' }}>
                      Drag & Drop CSV / XLS list here
                    </span>
                    <span style={{ fontSize: '0.62rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
                      or click to browse local storage files
                    </span>
                  </div>

                  <div style={styles.inputGroup}>
                    <textarea
                      placeholder="investor1@firm.com, founder2@startup.io, partner3@legal.net"
                      value={emails}
                      onChange={(e) => setEmails(e.target.value)}
                      style={styles.textarea}
                      rows="3"
                      required
                    />
                  </div>
                  {error && emails && <span style={styles.errorText}>{error}</span>}
                  <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start', padding: '0.5rem 1.25rem', fontSize: '0.76rem' }}>
                    Dispatch Bulk Invitations
                  </button>
                </form>
              </div>
            </div>

            {/* Invite Code Ledgers Logs */}
            <div className="glass-panel" style={{ ...styles.card, flex: '0.9', minWidth: '320px' }}>
              <h3 style={styles.cardTitle}>📊 Invitation Registry Audit Logs</h3>
              <p style={styles.cardDesc}>
                Monitor active tokens and audits of verified user onboardings.
              </p>

              <div style={styles.logsList}>
                {state.invites.map((inv) => (
                  <div key={inv.code} style={styles.inviteLogItem}>
                    <div style={styles.logHeader}>
                      <code style={styles.logCode}>{inv.code}</code>
                      <span style={styles.logUses}>
                        Uses: <strong>{inv.usedCount}</strong>
                      </span>
                    </div>
                    
                    <div style={styles.logBody}>
                      <p style={styles.logMeta}>Created by: <strong>{inv.createdBy}</strong></p>
                      {inv.logs && inv.logs.length > 0 ? (
                        <div style={styles.subLogs}>
                          <span style={styles.subLogTitle}>Audit Trail:</span>
                          <ul style={styles.ul}>
                            {inv.logs.map((log, i) => (
                              <li key={i} style={styles.li}>{log}</li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <p style={styles.emptyLog}>No users registered under this code yet.</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Table: Registered Users Audit & Maintenance Ledger */}
          <div className="glass-panel" style={{ ...styles.card, padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={styles.cardTitle}>👥 Ecosystem Accounts Ledger & Maintenance Console</h3>
                <p style={styles.cardDesc}>
                  Override accounts credentials, perform lockout sweeps, revoke verification status, or delete files directly in clientside sandbox memory.
                </p>
              </div>
              
              <input
                type="text"
                placeholder="Search accounts name, email, or role..."
                value={memberSearchQuery}
                onChange={(e) => setMemberSearchQuery(e.target.value)}
                style={{
                  ...styles.input,
                  width: '280px',
                  height: '32px',
                  fontSize: '0.74rem',
                  padding: '0.2rem 0.75rem',
                  borderRadius: '6px'
                }}
              />
            </div>

            <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeaderRow}>
                    <th style={styles.tableHeaderCell}>Member Profile</th>
                    <th style={styles.tableHeaderCell}>Ecosystem Roles</th>
                    <th style={styles.tableHeaderCell}>SaaS Subscription</th>
                    <th style={styles.tableHeaderCell}>Verification Status</th>
                    <th style={styles.tableHeaderCell}>Joined Date</th>
                    <th style={styles.tableHeaderCell}>Last Login</th>
                    <th style={{ ...styles.tableHeaderCell, textAlign: 'right' }}>Security Override Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDirectory.map((member) => {
                    const audit = getSimulatedAuditInfo(member.customer_id);
                    const isCurrentUser = member.customer_id === state.customer.customer_id;
                    
                    return (
                      <tr key={member.customer_id} style={styles.tableRow}>
                        <td style={styles.tableCell}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            {member.basicProfile?.profile_picture_url ? (
                              <img src={member.basicProfile.profile_picture_url} alt={member.first_name} style={styles.avatarImg} />
                            ) : (
                              <div style={styles.avatarInitials}>
                                {member.first_name.charAt(0)}{member.last_name.charAt(0)}
                              </div>
                            )}
                            <div>
                              <div style={{ fontWeight: '800', color: 'var(--color-text-primary)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <span>{member.first_name} {member.last_name}</span>
                                {isCurrentUser && <span style={{ fontSize: '0.62rem', color: '#8b5cf6', background: 'rgba(139,92,246,0.1)', padding: '0.05rem 0.25rem', borderRadius: '4px' }}>Me</span>}
                              </div>
                              <span style={{ fontSize: '0.68rem', color: 'var(--color-text-secondary)' }}>{member.email}</span>
                            </div>
                          </div>
                        </td>

                        <td style={styles.tableCell}>
                          <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                            {member.role_flags?.map(r => (
                              <span key={r} className="badge" style={{ fontSize: '0.58rem', padding: '0.08rem 0.35rem', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--color-text-primary)', fontWeight: '700' }}>
                                {r}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td style={styles.tableCell}>
                          <span style={{
                            fontSize: '0.64rem',
                            padding: '0.1rem 0.45rem',
                            borderRadius: '4px',
                            fontWeight: '700',
                            background: member.subscription_tier === 'lender_pro' ? 'rgba(0, 242, 254, 0.08)' : member.subscription_tier === 'founder_pro' ? 'rgba(139, 92, 246, 0.08)' : 'var(--border-color)',
                            color: member.subscription_tier === 'lender_pro' ? '#00f2fe' : member.subscription_tier === 'founder_pro' ? '#a78bfa' : '#737373',
                            border: member.subscription_tier === 'lender_pro' ? '1px solid rgba(0, 242, 254, 0.2)' : member.subscription_tier === 'founder_pro' ? '1px solid rgba(139, 92, 246, 0.2)' : '1px solid var(--border-color)'
                          }}>
                            {member.subscription_tier === 'lender_pro' ? 'Lender Pro' : member.subscription_tier === 'founder_pro' ? 'Founder Pro' : 'Standard'}
                          </span>
                        </td>

                        <td style={styles.tableCell}>
                          {member.status === 'blocked' ? (
                            <span style={{ ...styles.statusBadge, color: '#ef4444', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>🚫 Blocked</span>
                          ) : member.status === 'verified' ? (
                            <span style={{ ...styles.statusBadge, color: '#10b981', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>🛡 Vetted Member</span>
                          ) : (
                            <span style={{ ...styles.statusBadge, color: '#d4af37', background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}>⚠️ KYC Pending</span>
                          )}
                        </td>

                        <td style={styles.tableCell}>
                          <span style={{ fontSize: '0.76rem', color: 'var(--color-text-secondary)' }}>{audit.joined}</span>
                        </td>

                        <td style={styles.tableCell}>
                          <span style={{ fontSize: '0.76rem', color: '#00f2fe', fontFamily: 'monospace' }}>{audit.lastLogin}</span>
                        </td>

                        <td style={{ ...styles.tableCell, textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                            <button onClick={() => handleResetPassword(member.customer_id, `${member.first_name} ${member.last_name}`)} className="btn-secondary" style={styles.actionBtn}>🔑 Reset</button>
                            <button onClick={() => handleToggleVetCredentials(member.customer_id, `${member.first_name} ${member.last_name}`, member.status)} className="btn-secondary" style={{ ...styles.actionBtn, color: member.status === 'verified' ? '#d4af37' : '#00f2fe', borderColor: member.status === 'verified' ? 'rgba(212,175,55,0.2)' : 'rgba(0,242,254,0.2)' }}>🛡 Vet</button>
                            <button onClick={() => handleToggleBlock(member.customer_id, `${member.first_name} ${member.last_name}`, member.status)} className="btn-secondary" style={{ ...styles.actionBtn, color: member.status === 'blocked' ? '#10b981' : '#f43f5e', borderColor: member.status === 'blocked' ? 'rgba(16,185,129,0.2)' : 'rgba(244,63,94,0.2)' }} disabled={isCurrentUser}>🚫 Block</button>
                            <button onClick={() => handleDeleteUser(member.customer_id, `${member.first_name} ${member.last_name}`)} className="btn-secondary" style={{ ...styles.actionBtn, color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }} disabled={isCurrentUser}>🗑 Purge</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Internal Risk Console (Sleek Glassmorphic Detail Panel) */}
      {activeAdminTab === 'risk_console' && (
        <div style={styles.riskConsoleContainer} className="animate-fade-in-up">
          {/* Main detail top header banner */}
          <div className="glass-panel" style={styles.riskDetailHeader}>
            <div style={styles.riskHeaderLeft}>
              <span style={styles.applicationIdLabel}>ID: PB-39820 | Application in Review</span>
              <div style={styles.candidateSelectorRow}>
                <span style={styles.candidateLabel}>Underwriting Candidate:</span>
                <select 
                  value={selectedCandidate} 
                  onChange={(e) => setSelectedCandidate(e.target.value)}
                  style={styles.candidateSelect}
                >
                  <option value="kristi@toninlogistics.com">Kristi Tonin (Cold-Storage Fleet Expansion Note)</option>
                  <option value="sarah@skynet-rebel.io">Sarah Connor (EcoSphere Solutions SAFE Placement)</option>
                  <option value="marcus@aureliusfinance.com">Marcus Aurelius (Accredited P2P Syndicate Offer)</option>
                  <option value="devon@auroratech.io">Devon Vance (Aurora Energy Systems Series Seed Note)</option>
                  <option value="elena@rostova.ai">Elena Rostova (NeuroWeb AI Series Seed Placement)</option>
                </select>
              </div>
            </div>

            <div style={styles.riskHeaderRight}>
              <span style={styles.riskTimestamp}>Received: 2026-06-01 • Time: 08:00 PM</span>
              <div style={styles.topHeaderBtnGroup}>
                <button onClick={() => alert('Viewing Cryptographic Audit Trail:\nKYC verification token matches blockchain block 129481.\nDevice IP: 198.162.1.8 validated.\nWatchlist hash matches 0x8df31...')} className="btn-secondary" style={styles.topHeaderBtn}>
                  👁 View Audit Trail
                </button>
                <button onClick={() => alert('Generating Decision Underwriting Report...\nDownloading secure decision ledger.pdf...')} className="btn-primary" style={styles.topHeaderBtn}>
                  📥 Download Decision PDF
                </button>
              </div>
            </div>
          </div>

          {/* Underwriting metrics grid */}
          <div style={styles.riskMainGrid}>
            
            {/* Left side details: layers audit and accordions */}
            <div style={styles.riskLeftCol}>
              <div className="glass-panel" style={styles.riskLeftCard}>
                <div style={styles.auditLayersHeader}>
                  <h3 style={styles.cardTitle}>🛡 Credit Underwriting Layers</h3>
                  <div style={styles.layerTabs}>
                    <button onClick={() => setActiveAuditLayer('layer0')} style={{ ...styles.layerTabBtn, color: activeAuditLayer === 'layer0' ? '#00f2fe' : '#737373', background: activeAuditLayer === 'layer0' ? 'rgba(0,242,254,0.05)' : 'transparent' }}>Layer 0</button>
                    <button onClick={() => setActiveAuditLayer('layer1')} style={{ ...styles.layerTabBtn, color: activeAuditLayer === 'layer1' ? '#00f2fe' : '#737373', background: activeAuditLayer === 'layer1' ? 'rgba(0,242,254,0.05)' : 'transparent' }}>Layer 1</button>
                    <button onClick={() => setActiveAuditLayer('layer2')} style={{ ...styles.layerTabBtn, color: activeAuditLayer === 'layer2' ? '#00f2fe' : '#737373', background: activeAuditLayer === 'layer2' ? 'rgba(0,242,254,0.05)' : 'transparent' }}>Layer 2</button>
                    <button onClick={() => setActiveAuditLayer('layer3')} style={{ ...styles.layerTabBtn, color: activeAuditLayer === 'layer3' ? '#00f2fe' : '#737373', background: activeAuditLayer === 'layer3' ? 'rgba(0,242,254,0.05)' : 'transparent' }}>Layer 3</button>
                  </div>
                </div>

                {/* Audit layer content */}
                <div style={styles.layerDetailsContent}>
                  {activeAuditLayer === 'layer0' && (
                    <div className="animate-fade-in-up" style={styles.layerDetailsInner}>
                      <span style={styles.layerTitle}>Layer 0: Cryptographic Identity & Fraud Vetting</span>
                      <div style={styles.auditSpecGrid}>
                        <div style={styles.auditSpecBox}>
                          <span style={styles.specLabel}>ID Biometrics KYC</span>
                          <strong style={{ ...styles.specVal, color: '#10b981' }}>{priDetails.layersBreakdown.layer0.kyc} (Verified Liveness)</strong>
                        </div>
                        <div style={styles.auditSpecBox}>
                          <span style={styles.specLabel}>Sanctions / PEP Lists</span>
                          <strong style={{ ...styles.specVal, color: '#10b981' }}>{priDetails.layersBreakdown.layer0.sanctions}</strong>
                        </div>
                        <div style={styles.auditSpecBox}>
                          <span style={styles.specLabel}>Synthetic Identity Risk</span>
                          <strong style={{ ...styles.specVal, color: '#00f2fe' }}>{priDetails.layersBreakdown.layer0.syntheticRisk} (Score 12/100)</strong>
                        </div>
                        <div style={styles.auditSpecBox}>
                          <span style={styles.specLabel}>Device / IP Security</span>
                          <strong style={styles.specVal}>{priDetails.layersBreakdown.layer0.deviceRisk}</strong>
                        </div>
                      </div>
                      <div style={styles.auditAlertBanner}>
                        ✓ Symmetrical passport hash validated with international SEC Watchlist registries.
                      </div>
                    </div>
                  )}

                  {activeAuditLayer === 'layer1' && (
                    <div className="animate-fade-in-up" style={styles.layerDetailsInner}>
                      <span style={styles.layerTitle}>Layer 1: BCS - Bureau Credit Score & History</span>
                      <div style={styles.auditSpecGrid}>
                        <div style={styles.auditSpecBox}>
                          <span style={styles.specLabel}>FICO Credit Band</span>
                          <strong style={{ ...styles.specVal, color: '#00f2fe' }}>{priDetails.layersBreakdown.layer1.bureauBand}</strong>
                        </div>
                        <div style={styles.auditSpecBox}>
                          <span style={styles.specLabel}>Score</span>
                          <strong style={styles.specVal}>{priDetails.layersBreakdown.layer1.bcsScore} / 850</strong>
                        </div>
                        <div style={styles.auditSpecBox}>
                          <span style={styles.specLabel}>Active Tradelines</span>
                          <strong style={styles.specVal}>{priDetails.layersBreakdown.layer1.tradelines} lines</strong>
                        </div>
                        <div style={styles.auditSpecBox}>
                          <span style={styles.specLabel}>Revolving Utilization</span>
                          <strong style={{ ...styles.specVal, color: '#f43f5e' }}>{priDetails.layersBreakdown.layer1.utilization}</strong>
                        </div>
                      </div>
                      
                      {/* Mini sparkline visualization */}
                      <div style={styles.sparklineCard}>
                        <span style={styles.specLabel}>Bureau Score Historical Sparkline (6m Trend)</span>
                        <div style={styles.sparklineWrap}>
                          <svg viewBox="0 0 300 40" style={{ width: '100%', height: '40px' }}>
                            <path d="M0,35 L40,32 L80,28 L120,31 L160,20 L200,25 L240,15 L300,10" fill="none" stroke="#00f2fe" strokeWidth="2.5" />
                            <circle cx="300" cy="10" r="4.5" fill="#00f2fe" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeAuditLayer === 'layer2' && (
                    <div className="animate-fade-in-up" style={styles.layerDetailsInner}>
                      <span style={styles.layerTitle}>Layer 2: BRS - Behavioral Cash Flow Risk Analytics</span>
                      
                      {priDetails.layersBreakdown.layer2.adpConnected ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          {/* Bypass weights and metrics banner */}
                          <div style={{
                            background: 'linear-gradient(90deg, rgba(0, 242, 254, 0.08) 0%, rgba(16, 185, 129, 0.08) 100%)',
                            border: '1px solid rgba(0, 242, 254, 0.2)',
                            borderRadius: '8px',
                            padding: '0.75rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '0.72rem',
                          }}>
                            <div>
                              <strong style={{ color: '#00f2fe' }}>⚡ DYNAMIC BUREAU-BYPASS SYSTEM ACTIVE:</strong> FICO score weight discounted to <strong style={{ color: '#00f2fe' }}>10%</strong>, cash-flow metrics given <strong style={{ color: '#10b981' }}>90%</strong> weight.
                            </div>
                            <span style={{
                              background: '#10b981',
                              color: '#000',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontWeight: 'bold',
                              fontSize: '0.6rem',
                              textTransform: 'uppercase'
                            }}>Synced</span>
                          </div>

                          {/* Dual Columns */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1rem' }}>
                            
                            {/* Left Column: FICO path */}
                            <div style={{
                              background: 'var(--bg-primary)',
                              border: '1px solid var(--border-color)',
                              borderRadius: '8px',
                              padding: '0.85rem',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.75rem'
                            }}>
                              <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--color-text-muted)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.35rem' }}>TRADITIONAL CREDIT PATH (10% WT)</span>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                                  <span style={{ color: 'var(--color-text-secondary)' }}>Traditional Bureau FICO:</span>
                                  <strong style={{ color: priDetails.layersBreakdown.layer1.bcsScore >= 660 ? '#10b981' : '#f43f5e' }}>{priDetails.layersBreakdown.layer1.bcsScore} / 850</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                                  <span style={{ color: 'var(--color-text-secondary)' }}>Active Tradelines:</span>
                                  <strong>{priDetails.layersBreakdown.layer1.tradelines}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                                  <span style={{ color: 'var(--color-text-secondary)' }}>Bureau Utilization:</span>
                                  <strong style={{ color: parseFloat(priDetails.layersBreakdown.layer1.utilization) > 60 ? '#f43f5e' : '#10b981' }}>{priDetails.layersBreakdown.layer1.utilization}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                                  <span style={{ color: 'var(--color-text-secondary)' }}>Payment Reliability:</span>
                                  <strong>{priDetails.layersBreakdown.layer2.onTimePaymentRatio}</strong>
                                </div>
                              </div>
                              <div style={{
                                fontSize: '0.62rem',
                                color: 'var(--color-text-muted)',
                                padding: '0.5rem',
                                background: 'rgba(0,0,0,0.15)',
                                borderRadius: '4px',
                                borderLeft: '3px solid #f43f5e'
                              }}>
                                FICO classifies this candidate as <strong style={{ color: '#f43f5e' }}>{priDetails.layersBreakdown.layer1.bureauBand}</strong> risk due to thin file / revolving card limits.
                              </div>
                            </div>

                            {/* Right Column: Modern Cash Flow Path */}
                            <div style={{
                              background: 'var(--bg-primary)',
                              border: '1px solid var(--border-color)',
                              borderRadius: '8px',
                              padding: '0.85rem',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.75rem'
                            }}>
                              <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#10b981', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.35rem' }}>MODERN CASH-FLOW PATH (90% WT)</span>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  <span style={{ fontSize: '0.58rem', color: 'var(--color-text-muted)' }}>VERIFIED ANNUAL GROSS (ADP)</span>
                                  <strong style={{ fontSize: '0.85rem', color: 'var(--color-text-primary)' }}>${priDetails.layersBreakdown.layer2.grossIncome.toLocaleString()}</strong>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  <span style={{ fontSize: '0.58rem', color: 'var(--color-text-muted)' }}>MONTHLY NET TAKE-HOME</span>
                                  <strong style={{ fontSize: '0.85rem', color: 'var(--color-text-primary)' }}>${priDetails.layersBreakdown.layer2.netPaycheck.toLocaleString()}/mo</strong>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  <span style={{ fontSize: '0.58rem', color: 'var(--color-text-muted)' }}>PRE-TAX RETIREMENT SAVINGS</span>
                                  <strong style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>${priDetails.layersBreakdown.layer2.taxSavings.toLocaleString()}/mo</strong>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  <span style={{ fontSize: '0.58rem', color: 'var(--color-text-muted)' }}>MONTHLY TAX WITHHOLDING</span>
                                  <strong style={{ fontSize: '0.75rem', color: '#f43f5e' }}>${priDetails.layersBreakdown.layer2.withholdings.toLocaleString()}/mo</strong>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  <span style={{ fontSize: '0.58rem', color: 'var(--color-text-muted)' }}>PLAID MANDATORY OBLIGATIONS</span>
                                  <strong style={{ fontSize: '0.75rem', color: 'var(--color-text-primary)' }}>${priDetails.layersBreakdown.layer2.mandatorySpend.toLocaleString()}/mo</strong>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  <span style={{ fontSize: '0.58rem', color: 'var(--color-text-muted)' }}>PLAID DISCRETIONARY SPEND</span>
                                  <strong style={{ fontSize: '0.75rem', color: priDetails.layersBreakdown.layer2.discretionarySpend > priDetails.layersBreakdown.layer2.netPaycheck * 0.4 ? '#f43f5e' : '#fff' }}>
                                    ${priDetails.layersBreakdown.layer2.discretionarySpend.toLocaleString()}/mo
                                  </strong>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  <span style={{ fontSize: '0.58rem', color: 'var(--color-text-muted)' }}>TRUE NET MONTHLY SAVINGS</span>
                                  <strong style={{ fontSize: '0.85rem', color: priDetails.layersBreakdown.layer2.monthlySavings > 0 ? '#10b981' : '#f43f5e' }}>
                                    ${Math.round(priDetails.layersBreakdown.layer2.monthlySavings).toLocaleString()}/mo
                                  </strong>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  <span style={{ fontSize: '0.58rem', color: 'var(--color-text-muted)' }}>VERIFIED SAVINGS RATE</span>
                                  <strong style={{ fontSize: '0.85rem', color: parseFloat(priDetails.layersBreakdown.layer2.savingsRate) >= 25 ? '#10b981' : '#f43f5e' }}>
                                    {priDetails.layersBreakdown.layer2.savingsRate}
                                  </strong>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Underwriting Alert Indicator Card */}
                          {parseFloat(priDetails.layersBreakdown.layer2.savingsRate) < 10 ? (
                            <div style={{
                              background: 'rgba(244, 63, 94, 0.05)',
                              borderLeft: '4px solid #f43f5e',
                              borderRadius: '4px',
                              padding: '0.75rem',
                              fontSize: '0.7rem',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.25rem'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: '#f43f5e' }}>
                                <span>⚠ UNDERWRITING ADVISORY: SEVERE LIFESTYLE CASHFLOW DRAIN (DDI {100 - parseInt(priDetails.layersBreakdown.layer2.savingsRate)}%)</span>
                                <span>Status: DECLINED BY ENGINE</span>
                              </div>
                              <p style={{ color: '#d4d4d4', margin: 0, lineHeight: '1.4' }}>
                                Despite earning a massive <strong>${priDetails.layersBreakdown.layer2.grossIncome.toLocaleString()}</strong>, the candidate's aggressive tax withholdings, high mortgage overheads, and <strong>${priDetails.layersBreakdown.layer2.discretionarySpend.toLocaleString()}/mo</strong> discretionary luxury online burn rate leave them with only a <strong>{priDetails.layersBreakdown.layer2.savingsRate} savings rate ($1,500/mo net)</strong>. Revolving credit cards are maxed out. Bypassing FICO confirms high debt-obligation fragility.
                              </p>
                            </div>
                          ) : (
                            <div style={{
                              background: 'rgba(16, 185, 129, 0.05)',
                              borderLeft: '4px solid #10b981',
                              borderRadius: '4px',
                              padding: '0.75rem',
                              fontSize: '0.7rem',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.25rem'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: '#10b981' }}>
                                <span>✓ UNDERWRITING ADVISORY: HYPER-OPTIMIZED CASH RESERVE (DDI {100 - parseInt(priDetails.layersBreakdown.layer2.savingsRate)}%)</span>
                                <span>Status: COMPLIANT APPROVAL</span>
                              </div>
                              <p style={{ color: '#d4d4d4', margin: 0, lineHeight: '1.4' }}>
                                Verified savings rate is extremely robust at <strong>{priDetails.layersBreakdown.layer2.savingsRate} ($6,300/mo)</strong>. The candidate has highly optimized their tax structures and maintains zero credit card debt with minimal mandatory obligations. Cash-flow bypass indicates exceptionally low default risk, overriding their thin credit history.
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <>
                          <div style={styles.auditSpecGrid}>
                            <div style={styles.auditSpecBox}>
                              <span style={styles.specLabel}>BRS Proprietary Score</span>
                              <strong style={{ ...styles.specVal, color: '#10b981' }}>{priDetails.layersBreakdown.layer2.brsScore} / 100</strong>
                            </div>
                            <div style={styles.auditSpecBox}>
                              <span style={styles.specLabel}>Income Regularity</span>
                              <strong style={styles.specVal}>{priDetails.layersBreakdown.layer2.salaryRegularity}</strong>
                            </div>
                            <div style={styles.auditSpecBox}>
                              <span style={styles.specLabel}>Overdraft Incidents</span>
                              <strong style={{ ...styles.specVal, color: '#10b981' }}>{priDetails.layersBreakdown.layer2.overdraftFrequency} (Last 12m)</strong>
                            </div>
                            <div style={styles.auditSpecBox}>
                              <span style={styles.specLabel}>Cash Balance Average</span>
                              <strong style={styles.specVal}>${priDetails.layersBreakdown.layer2.monthEndBalance.toLocaleString()}</strong>
                            </div>
                          </div>
                          <div style={styles.auditAlertBanner} style={{ ...styles.auditAlertBanner, borderLeftColor: '#10b981', background: 'rgba(16,185,129,0.03)' }}>
                            ℹ️ {priDetails.layersBreakdown.layer2.note}
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {activeAuditLayer === 'layer3' && (
                    <div className="animate-fade-in-up" style={styles.layerDetailsInner}>
                      <span style={styles.layerTitle}>Layer 3: Watchlists & Public Legal Records</span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                        <div style={styles.auditSpecBox}>
                          <span style={styles.specLabel}>Ecosystem Risk Code</span>
                          <strong style={{ ...styles.specVal, color: '#00f2fe' }}>{priDetails.layersBreakdown.layer3.code}</strong>
                        </div>
                        <div style={styles.auditSpecBox}>
                          <span style={styles.specLabel}>Vetting Rule Applied</span>
                          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.78rem', color: 'var(--color-text-primary)', lineHeight: '1.4' }}>
                            {priDetails.layersBreakdown.layer3.ruleApplied}
                          </p>
                        </div>
                        <div style={styles.auditSpecBox}>
                          <span style={styles.specLabel}>Watchlist Records Details</span>
                          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.74rem', color: 'var(--color-text-secondary)' }}>
                            {priDetails.layersBreakdown.layer3.details}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right side: PRI Cockpit card and SHAP explainability */}
            <div style={styles.riskRightCol}>
              {/* Summary Dashboard Card */}
              <div className="glass-panel glow-accent-border" style={styles.priCockpitCard}>
                <h3 style={{ ...styles.cardTitle, textAlign: 'center', fontSize: '0.85rem', color: 'var(--color-text-secondary)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  Proprietary Risk Index Dashboard
                </h3>
                
                <div style={styles.priMainGaugeRow}>
                  {/* Glowing PRI score circle */}
                  <div style={styles.priScoreCircle}>
                    <span style={styles.gaugeVal}>{priDetails.priScore}</span>
                    <span style={styles.gaugeLabel}>Index Score</span>
                  </div>

                  <div style={styles.priBadgeDetails}>
                    <div style={styles.priDetailRow}>
                      <span style={styles.specLabel}>Credit Grade:</span>
                      <span style={{ fontWeight: '800', color: '#00f2fe', fontSize: '0.95rem' }}>{priDetails.gradeName} ({priDetails.grade})</span>
                    </div>
                    <div style={styles.priDetailRow}>
                      <span style={styles.specLabel}>12m Prob. of Default:</span>
                      <span style={{ fontWeight: '800', color: '#f43f5e', fontSize: '0.95rem' }}>{priDetails.pd}</span>
                    </div>
                    <div style={styles.priDetailRow}>
                      <span style={styles.specLabel}>Decision Status:</span>
                      <span style={{ 
                        fontWeight: '800', 
                        fontSize: '0.85rem',
                        color: underwritingStatus === 'approved' || underwritingStatus === 'approved_adjusted' ? '#10b981' : underwritingStatus === 'declined' ? '#ef4444' : '#d4af37' 
                      }}>
                        {underwritingStatus.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Underwriting recommendations limits */}
                <div style={styles.recomTermsSection}>
                  <span style={{ ...styles.specLabel, display: 'block', marginBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.25rem' }}>
                    Recommended Underwriting Limits
                  </span>
                  <div style={styles.recomTermsGrid}>
                    <div style={styles.recomBox}>
                      <span style={styles.specLabel}>Max Principal</span>
                      <strong style={{ fontSize: '1rem', color: 'var(--color-text-primary)' }}>${priDetails.recommendedTerms.maxAmount.toLocaleString()}</strong>
                    </div>
                    <div style={styles.recomBox}>
                      <span style={styles.specLabel}>Max Tenor</span>
                      <strong style={{ fontSize: '1rem', color: 'var(--color-text-primary)' }}>{priDetails.recommendedTerms.maxTenor} months</strong>
                    </div>
                    <div style={styles.recomBox}>
                      <span style={styles.specLabel}>APR Bands</span>
                      <strong style={{ fontSize: '1rem', color: 'var(--color-text-primary)' }}>{priDetails.recommendedTerms.aprRange}</strong>
                    </div>
                  </div>
                </div>

                {/* Professional Status chips flags */}
                <div style={styles.chipsSection}>
                  {priDetails.flags.map(f => (
                    <span key={f} style={styles.flagsChip}>{f}</span>
                  ))}
                </div>
              </div>

              {/* SHAP explainability drivers card */}
              <div className="glass-panel" style={styles.shapCard}>
                <h3 style={styles.cardTitle}>🔬 Credit Drivers Explainability (SHAP Vectors)</h3>
                <div style={styles.shapList}>
                  {priDetails.keyDrivers.map((driver, index) => {
                    const isPositive = driver.type === 'strong_positive' || driver.type === 'positive' || driver.type === 'mitigating';
                    const isStrong = driver.type === 'strong_positive';
                    return (
                      <div key={index} style={{
                        ...styles.shapItem,
                        borderLeftColor: isPositive ? '#10b981' : '#f43f5e',
                        background: isPositive ? 'rgba(16, 185, 129, 0.02)' : 'rgba(244, 63, 94, 0.02)'
                      }}>
                        <span style={{ fontSize: '0.85rem' }}>{isPositive ? '✓' : '⚠'}</span>
                        <div style={{ flex: 1 }}>
                          <span style={{
                            fontSize: '0.62rem',
                            fontWeight: '800',
                            textTransform: 'uppercase',
                            color: isPositive ? '#10b981' : '#f43f5e',
                            display: 'block'
                          }}>
                            {driver.type.toUpperCase()}
                          </span>
                          <span style={{ fontSize: '0.74rem', color: 'var(--color-text-primary)', fontWeight: '500' }}>
                            {driver.text}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Underwriting Actions Bar */}
          <div className="glass-panel" style={styles.actionsBarCard}>
            <div style={styles.actionsBarHeader}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-primary)', fontWeight: '800' }}>
                  Decisions Committee Action Deck
                </h4>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                  Decisions lock immediately and update ecosystem directory registers.
                </span>
              </div>
              
              <div style={styles.actionBtnRow}>
                <button onClick={() => handleUnderwriteDecision('approved')} className="btn-primary" style={{ ...styles.underwriteBtn, background: '#10b981', color: '#000000', fontWeight: '800' }}>
                  ✓ Approve (Pre-seeded Terms)
                </button>
                <button onClick={() => setShowAdjustSliders(!showAdjustSliders)} className="btn-secondary" style={{ ...styles.underwriteBtn, borderColor: '#d4af37', color: '#d4af37' }}>
                  ⚙ Approve with Custom Terms
                </button>
                <button onClick={() => handleUnderwriteDecision('declined')} className="btn-secondary" style={{ ...styles.underwriteBtn, borderColor: '#ef4444', color: '#ef4444' }}>
                  🚫 Decline Candidate
                </button>
                <button onClick={() => alert('Document Vetting Request initiated.\nEmail request sent to candidate.')} className="btn-secondary" style={styles.underwriteBtn}>
                  📁 Request More Documents
                </button>
              </div>
            </div>

            {/* Custom adjustment sliders if clicked */}
            {showAdjustSliders && (
              <div className="animate-fade-in-up" style={styles.adjustSlidersCard}>
                <span style={{ fontSize: '0.74rem', color: '#d4af37', fontWeight: '800', textTransform: 'uppercase', display: 'block', marginBottom: '0.75rem' }}>
                  Custom Credit Adjustments Panel (Approved ranges only)
                </span>
                
                <div style={styles.sliderGrid}>
                  <div style={styles.sliderBox}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem' }}>
                      <span style={styles.specLabel}>Custom Allocation Principal</span>
                      <strong style={{ color: 'var(--color-text-primary)' }}>${customLimit.toLocaleString()}</strong>
                    </div>
                    <input 
                      type="range" 
                      min="500" 
                      max={priDetails.recommendedTerms.maxAmount} 
                      step="250"
                      value={customLimit}
                      onChange={(e) => setCustomLimit(parseInt(e.target.value))}
                      style={styles.sliderInput} 
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: 'var(--color-text-muted)' }}>
                      <span>Min: $500</span>
                      <span>Max recommended: ${priDetails.recommendedTerms.maxAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  <div style={styles.sliderBox}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem' }}>
                      <span style={styles.specLabel}>Custom Payback Tenor</span>
                      <strong style={{ color: 'var(--color-text-primary)' }}>{customTenor} Months</strong>
                    </div>
                    <input 
                      type="range" 
                      min="6" 
                      max={priDetails.recommendedTerms.maxTenor}
                      step="6"
                      value={customTenor}
                      onChange={(e) => setCustomTenor(parseInt(e.target.value))}
                      style={styles.sliderInput} 
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: 'var(--color-text-muted)' }}>
                      <span>Min: 6m</span>
                      <span>Max recommended: {priDetails.recommendedTerms.maxTenor}m</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => handleUnderwriteDecision('approved_adjusted')}
                  className="btn-primary" 
                  style={{ alignSelf: 'flex-start', marginTop: '0.85rem', padding: '0.4rem 1rem', fontSize: '0.76rem', background: '#d4af37', color: '#000000', fontWeight: '800' }}
                >
                  Confirm Adjusted Terms & Commit
                </button>
              </div>
            )}
          </div>

          {/* Underwriting audit log ledger */}
          <div className="glass-panel" style={styles.card}>
            <h3 style={styles.cardTitle}>📜 Credit Vetting Committee Audit Trail</h3>
            <div style={styles.auditTrailContainer}>
              {auditTrail.map((trail, index) => (
                <div key={index} style={styles.trailItem}>
                  <span style={styles.trailUser}>{trail.user}</span>
                  <span style={styles.trailAction}>{trail.action}</span>
                  <span style={styles.trailTime}>{new Date(trail.timestamp).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Vintage Cohort Risk Performance Dashboard (SVG Analytics Plots) */}
      {activeAdminTab === 'portfolio_risk' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }} className="animate-fade-in-up">
          {/* Capital partner global filters */}
          <div className="glass-panel" style={styles.filtersBar}>
            <div style={styles.filterGroup}>
              <span style={styles.specLabel}>Ecosystem Cohort Vintage:</span>
              <select value={filterCohort} onChange={(e) => setFilterCohort(e.target.value)} style={styles.filterSelect}>
                <option value="All">All Vintages (2024 - 2026)</option>
                <option value="2026">2026 Cohort (Active)</option>
                <option value="2025">2025 Cohort (Matured)</option>
                <option value="2024">2024 Cohort (Archived)</option>
              </select>
            </div>
            
            <div style={styles.filterGroup}>
              <span style={styles.specLabel}>PRI Risk Grade:</span>
              <select value={filterGrade} onChange={(e) => setFilterGrade(e.target.value)} style={styles.filterSelect}>
                <option value="All">All Grades (P1 - P5)</option>
                <option value="P1">P1 - Super Prime Only</option>
                <option value="P2_P3">P2 / P3 Prime Bands</option>
                <option value="P4_P5">P4 / P5 Subprime Placements</option>
              </select>
            </div>
          </div>

          {/* SVG Analytics Charts Grid */}
          <div style={styles.chartsGrid}>
            
            {/* Chart 1: Volume by PRI Grade (SVG Bar Chart) */}
            <div className="glass-panel" style={styles.chartCard}>
              <h3 style={styles.cardTitle}>📊 Capital Allocation Volume by PRI Grade</h3>
              <p style={styles.cardDesc}>Total outstanding commercial debt assets segmented by Proprietary Underwriting bands.</p>
              
              <div style={styles.chartCanvas}>
                <svg viewBox="0 0 400 200" style={{ width: '100%', height: '200px' }}>
                  {/* Grid Lines */}
                  <line x1="40" y1="20" x2="380" y2="20" stroke="var(--border-color)" strokeDasharray="3" />
                  <line x1="40" y1="70" x2="380" y2="70" stroke="var(--border-color)" strokeDasharray="3" />
                  <line x1="40" y1="120" x2="380" y2="120" stroke="var(--border-color)" strokeDasharray="3" />
                  <line x1="40" y1="170" x2="380" y2="170" stroke="var(--border-color)" />

                  {/* Bars (P1 to P5) */}
                  {/* P1: $245k */}
                  <rect x="70" y="40" width="30" height="130" rx="3" fill="#10b981" opacity="0.85" />
                  <text x="85" y="32" fill="#10b981" fontSize="10" textAnchor="middle" fontWeight="700">$245k</text>
                  
                  {/* P2: $310k */}
                  <rect x="130" y="25" width="30" height="145" rx="3" fill="#00f2fe" opacity="0.85" />
                  <text x="145" y="17" fill="#00f2fe" fontSize="10" textAnchor="middle" fontWeight="700">$310k</text>

                  {/* P3: $120k */}
                  <rect x="190" y="90" width="30" height="80" rx="3" fill="#d4af37" opacity="0.85" />
                  <text x="205" y="82" fill="#d4af37" fontSize="10" textAnchor="middle" fontWeight="700">$120k</text>

                  {/* P4: $45k */}
                  <rect x="250" y="140" width="30" height="30" rx="3" fill="#f43f5e" opacity="0.85" />
                  <text x="265" y="132" fill="#f43f5e" fontSize="10" textAnchor="middle" fontWeight="700">$45k</text>

                  {/* P5: $15k */}
                  <rect x="310" y="160" width="30" height="10" rx="3" fill="#ef4444" opacity="0.85" />
                  <text x="325" y="152" fill="#ef4444" fontSize="10" textAnchor="middle" fontWeight="700">$15k</text>

                  {/* X Axis Labels */}
                  <text x="85" y="186" fill="#737373" fontSize="9" textAnchor="middle" fontWeight="700">P1 (Super)</text>
                  <text x="145" y="186" fill="#737373" fontSize="9" textAnchor="middle" fontWeight="700">P2 (Prime)</text>
                  <text x="205" y="186" fill="#737373" fontSize="9" textAnchor="middle" fontWeight="700">P3 (Near)</text>
                  <text x="265" y="186" fill="#737373" fontSize="9" textAnchor="middle" fontWeight="700">P4 (Sub)</text>
                  <text x="325" y="186" fill="#737373" fontSize="9" textAnchor="middle" fontWeight="700">P5 (Deep)</text>
                </svg>
              </div>
            </div>

            {/* Chart 2: Expected PD vs Realized Default Rate (SVG Dual Curves) */}
            <div className="glass-panel" style={styles.chartCard}>
              <h3 style={styles.cardTitle}>📈 Expected PD vs. Realized Default Rate</h3>
              <p style={styles.cardDesc}>Visual validation comparing algorithmic 12m Probability of Default models against actual outcomes.</p>
              
              <div style={styles.chartCanvas}>
                <svg viewBox="0 0 400 200" style={{ width: '100%', height: '200px' }}>
                  {/* Grid Lines */}
                  <line x1="40" y1="20" x2="380" y2="20" stroke="var(--border-color)" strokeDasharray="3" />
                  <line x1="40" y1="70" x2="380" y2="70" stroke="var(--border-color)" strokeDasharray="3" />
                  <line x1="40" y1="120" x2="380" y2="120" stroke="var(--border-color)" strokeDasharray="3" />
                  <line x1="40" y1="170" x2="380" y2="170" stroke="var(--border-color)" />

                  {/* Curve 1: Expected PD (Blue) */}
                  <path d="M50,165 Q120,150 200,90 T350,30" fill="none" stroke="#00f2fe" strokeWidth="2.5" />
                  <circle cx="50" cy="165" r="3.5" fill="#00f2fe" />
                  <circle cx="200" cy="90" r="3.5" fill="#00f2fe" />
                  <circle cx="350" cy="30" r="3.5" fill="#00f2fe" />
                  
                  {/* Curve 2: Realized defaults (Amber) */}
                  <path d="M50,168 Q120,153 200,105 T350,45" fill="none" stroke="#d4af37" strokeWidth="2" strokeDasharray="3" />
                  <circle cx="50" cy="168" r="3" fill="#d4af37" />
                  <circle cx="200" cy="105" r="3" fill="#d4af37" />
                  <circle cx="350" cy="45" r="3" fill="#d4af37" />

                  {/* Axis Legend */}
                  <rect x="55" y="25" width="8" height="8" fill="#00f2fe" rx="1.5" />
                  <text x="68" y="32" fill="#a3a3a3" fontSize="8">Expected PD Model</text>
                  <rect x="185" y="25" width="8" height="8" fill="#d4af37" rx="1.5" />
                  <text x="198" y="32" fill="#a3a3a3" fontSize="8">Realized Default Rate</text>

                  {/* Labels */}
                  <text x="50" y="184" fill="#737373" fontSize="8" textAnchor="middle">Prime (P1)</text>
                  <text x="200" y="184" fill="#737373" fontSize="8" textAnchor="middle">Near-Prime (P3)</text>
                  <text x="350" y="184" fill="#737373" fontSize="8" textAnchor="middle">Subprime (P5)</text>
                </svg>
              </div>
            </div>

            {/* Chart 3: Vintage curves cumulative losses (SVG Cohorts area plots) */}
            <div className="glass-panel" style={{ ...styles.chartCard, gridColumn: 'span 2' }}>
              <h3 style={styles.cardTitle}>📉 Cohort Vintage Curves (Cumulative Losses over Time)</h3>
              <p style={styles.cardDesc}>Vintage loss profiles tracking credit quality shifts across historical origination cycles.</p>
              
              <div style={styles.chartCanvas}>
                <svg viewBox="0 0 800 200" style={{ width: '100%', height: '200px' }}>
                  {/* Grid Lines */}
                  <line x1="40" y1="20" x2="760" y2="20" stroke="var(--border-color)" strokeDasharray="3" />
                  <line x1="40" y1="70" x2="760" y2="70" stroke="var(--border-color)" strokeDasharray="3" />
                  <line x1="40" y1="120" x2="760" y2="120" stroke="var(--border-color)" strokeDasharray="3" />
                  <line x1="40" y1="170" x2="760" y2="170" stroke="var(--border-color)" />

                  {/* Vintage 2024 Cumulative Loss Area (crimson) */}
                  <path d="M40,170 Q140,165 240,150 T440,120 T640,95 T760,90 L760,170 Z" fill="rgba(239, 68, 68, 0.05)" stroke="#ef4444" strokeWidth="1.5" />
                  <text x="730" y="85" fill="#ef4444" fontSize="8" fontWeight="800">Vintage 2024 (2.2% loss)</text>

                  {/* Vintage 2025 Cumulative Loss Area (purple) */}
                  <path d="M40,170 Q140,167 240,158 T440,135 T640,118 T760,112 L760,170 Z" fill="rgba(139, 92, 246, 0.05)" stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="4" />
                  <text x="730" y="108" fill="#8b5cf6" fontSize="8" fontWeight="800">Vintage 2025 (1.4% loss)</text>

                  {/* Vintage 2026 Cumulative Loss Area (glowing blue - P1/P2/P3 rules) */}
                  <path d="M40,170 Q140,169 240,165 T440,152 T640,145 T760,140 L760,170 Z" fill="rgba(0, 242, 254, 0.05)" stroke="#00f2fe" strokeWidth="2.5" />
                  <text x="730" y="135" fill="#00f2fe" fontSize="8" fontWeight="800">Vintage 2026 (0.4% loss)</text>

                  {/* X Axis Labels (Months on book) */}
                  <text x="40" y="185" fill="#737373" fontSize="8" textAnchor="middle">0m (Origination)</text>
                  <text x="240" y="185" fill="#737373" fontSize="8" textAnchor="middle">6m (Active)</text>
                  <text x="440" y="185" fill="#737373" fontSize="8" textAnchor="middle">12m</text>
                  <text x="640" y="185" fill="#737373" fontSize="8" textAnchor="middle">18m (Payback)</text>
                  <text x="760" y="185" fill="#737373" fontSize="8" textAnchor="middle">24m (Matured)</text>
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Content Publisher Control Center (2x2 Dynamic Grid Form) */}
      {activeAdminTab === 'content_publisher' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }} className="animate-fade-in-up">
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <h3 style={{ ...styles.cardTitle, color: '#00f2fe' }}>📢 Ecosystem Content Publisher Control Center</h3>
            <p style={styles.cardDesc}>Publish live bulletins, announcements, deal-flow event sessions, and manage sponsored spotlights across all peer endpoints reactively.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            
            {/* Form 1: Node Announcements */}
            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#00f2fe', letterSpacing: '0.04em' }}>📣 ANNOUNCE REGULATORY / NODE STATUS</span>
              <form onSubmit={handlePublishAnnouncement} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={styles.specLabel}>Announcement Header</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Reg D Sync Node Completed" 
                    value={announceTitle} 
                    onChange={(e) => setAnnounceTitle(e.target.value)}
                    style={styles.input} 
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={styles.specLabel}>Announcement Content Detail</label>
                  <textarea 
                    placeholder="Provide full announcement details..." 
                    value={announceText} 
                    onChange={(e) => setAnnounceText(e.target.value)}
                    style={{ ...styles.input, minHeight: '80px', fontFamily: 'inherit', resize: 'vertical' }} 
                  />
                </div>
                <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start', padding: '0.6rem 1.25rem' }}>
                  🚀 Publish Node Announcement
                </button>
              </form>
            </div>

            {/* Form 2: News Bulletin */}
            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#00f2fe', letterSpacing: '0.04em' }}>📰 PUBLISH NEWS BULLETIN ITEM</span>
              <form onSubmit={handlePublishNews} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={styles.specLabel}>News Headline / Topic</label>
                  <input 
                    type="text" 
                    placeholder="e.g. SEC Form C Adjustments" 
                    value={newsHeading} 
                    onChange={(e) => setNewsHeading(e.target.value)}
                    style={styles.input} 
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={styles.specLabel}>Brief Summary Bulletin Description</label>
                  <textarea 
                    placeholder="Enter short bulletin text (under 120 chars suggested)..." 
                    value={newsText} 
                    onChange={(e) => setNewsText(e.target.value)}
                    style={{ ...styles.input, minHeight: '80px', fontFamily: 'inherit', resize: 'vertical' }} 
                  />
                </div>
                <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start', padding: '0.6rem 1.25rem' }}>
                  🚀 Publish News Bulletin
                </button>
              </form>
            </div>

            {/* Form 3: Events Scheduler */}
            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#00f2fe', letterSpacing: '0.04em' }}>📅 SCHEDULE ECOSYSTEM EVENT</span>
              <form onSubmit={handlePublishEvent} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label style={styles.specLabel}>Event Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Reg D Private Pitch Round" 
                      value={eventTitle} 
                      onChange={(e) => setEventTitle(e.target.value)}
                      style={styles.input} 
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label style={styles.specLabel}>Event Category</label>
                    <select 
                      value={eventCategory} 
                      onChange={(e) => setEventCategory(e.target.value)}
                      style={styles.filterSelect}
                    >
                      <option value="Deal-Flow Pitch">Deal-Flow Pitch</option>
                      <option value="Legal Audit">Legal Audit</option>
                      <option value="Community Forum">Community Forum</option>
                      <option value="Technical Seminar">Technical Seminar</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={styles.specLabel}>Scheduled Date & Time Description</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Tomorrow, 2:00 PM EST or June 12, 1:00 PM EST" 
                    value={eventDate} 
                    onChange={(e) => setEventDate(e.target.value)}
                    style={styles.input} 
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={styles.specLabel}>Brief Event Prospectus / Agenda Summary</label>
                  <textarea 
                    placeholder="Outline event agenda and speakers..." 
                    value={eventDesc} 
                    onChange={(e) => setEventDesc(e.target.value)}
                    style={{ ...styles.input, minHeight: '80px', fontFamily: 'inherit', resize: 'vertical' }} 
                  />
                </div>
                <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start', padding: '0.6rem 1.25rem' }}>
                  🚀 Publish Ecosystem Event
                </button>
              </form>
            </div>

            {/* Form 4: Sponsored Spotlight Manager */}
            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#10b981', letterSpacing: '0.04em' }}>🎯 SPONSORED SPOTLIGHT AD BANNER</span>
              <form onSubmit={handleUpdateSpotlight} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label style={styles.specLabel}>Ad/Campaign Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Tonin Logistics Fleet Note" 
                      value={spotlightTitle} 
                      onChange={(e) => setSpotlightTitle(e.target.value)}
                      style={styles.input} 
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label style={styles.specLabel}>Min Entry</label>
                    <input 
                      type="text" 
                      placeholder="e.g. $500" 
                      value={spotlightMin} 
                      onChange={(e) => setSpotlightMin(e.target.value)}
                      style={styles.input} 
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={styles.specLabel}>Target Campaign Allocation Link</label>
                  <select 
                    value={spotlightCamp} 
                    onChange={(e) => setSpotlightCamp(e.target.value)}
                    style={styles.filterSelect}
                  >
                    {(state.campaigns || []).map(c => (
                      <option key={c.id} value={c.id}>
                        {c.companyName} ({c.category} - {c.offering_type})
                      </option>
                    ))}
                    {state.campaigns.length === 0 && (
                      <option value="camp-1">EcoSphere Technologies Series A</option>
                    )}
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={styles.specLabel}>High-Conversion Ad Body Text</label>
                  <textarea 
                    placeholder="Write a compelling investment description..." 
                    value={spotlightText} 
                    onChange={(e) => setSpotlightText(e.target.value)}
                    style={{ ...styles.input, minHeight: '80px', fontFamily: 'inherit', resize: 'vertical' }} 
                  />
                </div>
                <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start', padding: '0.6rem 1.25rem', background: '#10b981', color: '#000' }}>
                  💾 Update Sponsored Spotlight Ad
                </button>
              </form>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.75rem',
  },
  headerTitleRow: {
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '1rem',
  },
  mainTitle: {
    fontSize: '1.45rem',
    fontWeight: '850',
    color: 'var(--color-text-primary)',
    margin: 0,
  },
  subTitle: {
    fontSize: '0.8rem',
    color: 'var(--color-text-secondary)',
    marginTop: '0.2rem',
  },
  segmentedTabWrapper: {
    borderBottom: '1px solid var(--border-color)',
    marginTop: '-0.5rem',
  },
  tabContainer: {
    display: 'flex',
    gap: '0.5rem',
  },
  tabBtn: {
    padding: '0.75rem 1.5rem',
    fontSize: '0.82rem',
    fontWeight: '700',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    outline: 'none',
  },
  metricsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.25rem',
  },
  metricCard: {
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
  },
  metricHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: '0.72rem',
    color: 'var(--color-text-secondary)',
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: '0.03em',
  },
  metricVal: {
    fontSize: '1.85rem',
    fontWeight: '800',
    color: 'var(--color-text-primary)',
  },
  grid: {
    display: 'flex',
    gap: '1.5rem',
    flexWrap: 'wrap',
  },
  formCol: {
    flex: '1.2',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    minWidth: '320px',
  },
  card: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  cardTitle: {
    fontSize: '1.05rem',
    fontWeight: '800',
    color: 'var(--color-text-primary)',
    margin: 0,
  },
  cardDesc: {
    fontSize: '0.76rem',
    color: 'var(--color-text-secondary)',
    lineHeight: '1.35',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
  },
  label: {
    fontSize: '0.68rem',
    fontWeight: '700',
    color: 'var(--color-text-secondary)',
    textTransform: 'uppercase',
  },
  input: {
    width: '100%',
    background: 'rgba(0, 0, 0, 0.25)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '0.65rem 0.85rem',
    color: 'var(--color-text-primary)',
    fontSize: '0.85rem',
    outline: 'none',
    transition: 'all 0.2s',
  },
  dragZone: {
    border: '2px dashed var(--border-color)',
    borderRadius: '8px',
    padding: '1.25rem 1rem',
    textAlign: 'center',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    transition: 'all 0.2s',
  },
  textarea: {
    width: '100%',
    background: 'rgba(0, 0, 0, 0.25)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '0.65rem 0.85rem',
    color: 'var(--color-text-primary)',
    fontSize: '0.85rem',
    outline: 'none',
    resize: 'none',
    fontFamily: 'inherit',
    transition: 'all 0.2s',
  },
  select: {
    width: '100%',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '0.65rem 0.85rem',
    color: 'var(--color-text-primary)',
    fontSize: '0.85rem',
    outline: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  errorText: {
    fontSize: '0.74rem',
    color: '#f43f5e',
    fontWeight: '600',
  },
  successToast: {
    background: 'rgba(16, 185, 129, 0.08)',
    border: '1px solid rgba(16, 185, 129, 0.25)',
    color: '#10b981',
    padding: '0.85rem 1.25rem',
    borderRadius: '8px',
    fontSize: '0.82rem',
    fontWeight: '700',
  },
  logsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    maxHeight: '440px',
    overflowY: 'auto',
    paddingRight: '0.4rem',
  },
  inviteLogItem: {
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  logHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logCode: {
    fontSize: '0.88rem',
    fontWeight: '800',
    color: '#00f2fe',
  },
  logUses: {
    fontSize: '0.7rem',
    color: 'var(--color-text-secondary)',
  },
  logBody: {
    fontSize: '0.74rem',
  },
  logMeta: {
    color: 'var(--color-text-muted)',
    margin: 0,
    marginBottom: '0.35rem',
  },
  subLogs: {
    background: 'rgba(0, 0, 0, 0.3)',
    padding: '0.5rem 0.65rem',
    borderRadius: '6px',
    borderLeft: '2px solid #8b5cf6',
  },
  subLogTitle: {
    fontSize: '0.62rem',
    fontWeight: '800',
    color: '#a78bfa',
    textTransform: 'uppercase',
  },
  ul: {
    paddingLeft: '1rem',
    margin: '0.15rem 0 0 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.15rem',
  },
  li: {
    color: 'var(--color-text-secondary)',
    fontSize: '0.68rem',
    lineHeight: '1.2'
  },
  emptyLog: {
    color: 'var(--color-text-muted)',
    fontStyle: 'italic',
    margin: 0,
    fontSize: '0.68rem',
  },
  bypassTokenBox: {
    marginTop: '0.75rem',
    background: 'rgba(0, 242, 254, 0.05)',
    border: '1px solid rgba(0, 242, 254, 0.25)',
    borderRadius: '8px',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '0.8rem',
  },
  tableHeaderRow: {
    borderBottom: '1px solid var(--border-color)',
  },
  tableHeaderCell: {
    padding: '0.75rem 1rem',
    fontWeight: '800',
    color: 'var(--color-text-secondary)',
    fontSize: '0.7rem',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  tableRow: {
    borderBottom: '1px solid var(--border-color)',
    transition: 'background 0.2s',
  },
  tableCell: {
    padding: '0.85rem 1rem',
    verticalAlign: 'middle',
  },
  avatarImg: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '1.5px solid var(--border-color)'
  },
  avatarInitials: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #00f2fe 0%, #8f00ff 100%)',
    color: '#000000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
    fontSize: '0.85rem'
  },
  statusBadge: {
    fontSize: '0.64rem',
    padding: '0.1rem 0.45rem',
    borderRadius: '4px',
    fontWeight: '700',
    whiteSpace: 'nowrap',
    display: 'inline-block',
  },
  actionBtn: {
    padding: '0.25rem 0.5rem',
    fontSize: '0.64rem',
    borderRadius: '4px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid var(--border-color)',
    cursor: 'pointer',
    background: 'var(--bg-primary)',
    color: 'var(--color-text-primary)'
  },

  // Risk Console Styles
  riskConsoleContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  riskDetailHeader: {
    padding: '1.5rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  riskHeaderLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  applicationIdLabel: {
    fontSize: '1rem',
    fontWeight: '900',
    color: 'var(--color-text-primary)',
    letterSpacing: '0.02em',
  },
  candidateSelectorRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  candidateLabel: {
    fontSize: '0.74rem',
    color: 'var(--color-text-secondary)',
  },
  candidateSelect: {
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    color: 'var(--color-text-primary)',
    fontSize: '0.78rem',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    cursor: 'pointer',
    outline: 'none',
  },
  riskHeaderRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '0.5rem',
  },
  riskTimestamp: {
    fontSize: '0.74rem',
    color: 'var(--color-text-muted)',
  },
  topHeaderBtnGroup: {
    display: 'flex',
    gap: '0.5rem',
  },
  topHeaderBtn: {
    padding: '0.4rem 0.85rem',
    fontSize: '0.72rem',
  },
  riskMainGrid: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: '1.5rem',
  },
  riskLeftCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  riskLeftCard: {
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  auditLayersHeader: {
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.85rem',
  },
  layerTabs: {
    display: 'flex',
    gap: '0.35rem',
  },
  layerTabBtn: {
    padding: '0.35rem 0.75rem',
    fontSize: '0.72rem',
    fontWeight: '800',
    border: '1px solid var(--border-color)',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  layerDetailsContent: {
    minHeight: '260px',
  },
  layerDetailsInner: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  layerTitle: {
    fontSize: '0.85rem',
    fontWeight: '800',
    color: '#00f2fe',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  auditSpecGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  auditSpecBox: {
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    padding: '0.85rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
  },
  specLabel: {
    fontSize: '0.62rem',
    color: 'var(--color-text-muted)',
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  specVal: {
    fontSize: '0.82rem',
    color: 'var(--color-text-primary)',
    fontWeight: '800',
  },
  auditAlertBanner: {
    background: 'rgba(0, 242, 254, 0.02)',
    borderLeft: '2px solid #00f2fe',
    padding: '0.65rem 0.85rem',
    borderRadius: '0 6px 6px 0',
    fontSize: '0.74rem',
    color: 'var(--color-text-secondary)',
  },
  sparklineCard: {
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  sparklineWrap: {
    marginTop: '0.35rem',
  },
  riskRightCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  priCockpitCard: {
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  priMainGaugeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  priScoreCircle: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0,242,254,0.05) 0%, rgba(139,92,246,0.05) 100%)',
    border: '3px solid #00f2fe',
    boxShadow: '0 0 15px rgba(0,242,254,0.3)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeVal: {
    fontSize: '1.85rem',
    fontWeight: '900',
    color: 'var(--color-text-primary)',
    fontFamily: 'monospace',
    lineHeight: '1',
  },
  gaugeLabel: {
    fontSize: '0.52rem',
    color: '#00f2fe',
    textTransform: 'uppercase',
    fontWeight: '800',
  },
  priBadgeDetails: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.65rem',
  },
  priDetailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.74rem',
  },
  recomTermsSection: {
    display: 'flex',
    flexDirection: 'column',
  },
  recomTermsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '0.5rem',
  },
  recomBox: {
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: '4px',
    padding: '0.65rem',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem',
  },
  chipsSection: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.35rem',
  },
  flagsChip: {
    fontSize: '0.58rem',
    padding: '0.1rem 0.4rem',
    background: 'rgba(0, 242, 254, 0.05)',
    color: '#00f2fe',
    border: '1px solid rgba(0, 242, 254, 0.15)',
    borderRadius: '3px',
    fontWeight: '800',
  },
  shapCard: {
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  shapList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.65rem',
  },
  shapItem: {
    padding: '0.85rem',
    borderLeftWidth: '3px',
    borderLeftStyle: 'solid',
    borderRadius: '0 6px 6px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  actionsBarCard: {
    padding: '1.5rem 2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  actionsBarHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  actionBtnRow: {
    display: 'flex',
    gap: '0.5rem',
  },
  underwriteBtn: {
    padding: '0.5rem 1rem',
    fontSize: '0.74rem',
  },
  adjustSlidersCard: {
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginTop: '0.5rem',
  },
  sliderGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
  },
  sliderBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  sliderInput: {
    width: '100%',
    accentColor: '#00f2fe',
    cursor: 'pointer',
  },
  auditTrailContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.65rem',
    maxHeight: '150px',
    overflowY: 'auto',
  },
  trailItem: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.74rem',
    paddingBottom: '0.5rem',
    borderBottom: '1px solid var(--border-color)',
  },
  trailUser: {
    fontWeight: '800',
    color: 'var(--color-text-primary)',
    width: '180px',
  },
  trailAction: {
    flex: 1,
    color: 'var(--color-text-secondary)',
  },
  trailTime: {
    color: 'var(--color-text-muted)',
    fontSize: '0.68rem',
  },

  // Capital Partner Analytics Dashboard Styles
  filtersBar: {
    padding: '1.25rem 2rem',
    display: 'flex',
    gap: '1.5rem',
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  filterSelect: {
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    color: 'var(--color-text-primary)',
    fontSize: '0.78rem',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    cursor: 'pointer',
    outline: 'none',
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
  },
  chartCard: {
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  chartCanvas: {
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    padding: '1rem 0.5rem 0.5rem 0.5rem',
    marginTop: '0.5rem',
  }
};
