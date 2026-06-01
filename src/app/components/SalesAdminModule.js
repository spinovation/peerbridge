'use client';

import { useState, useRef } from 'react';

export default function SalesAdminModule({ state }) {
  const [newCode, setNewCode] = useState('');
  const [emails, setEmails] = useState('');
  const [selectedCode, setSelectedCode] = useState(state.invites[0]?.code || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  
  // Single waitlist invite states
  const [singleEmail, setSingleEmail] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  
  const fileInputRef = useRef(null);

  // Simulated last login times and invite codes for existing users to make ledger rich and realistic
  const getSimulatedAuditInfo = (memberId) => {
    switch (memberId) {
      case 'dir-cust-marcus':
        return { joined: '2026-01-18', lastLogin: 'Active now', inviteCode: 'SYSTEM-VIP' };
      case 'dir-cust-elena':
        return { joined: '2026-03-22', lastLogin: '12 mins ago', inviteCode: 'PEER-BRIDGE-2026' };
      case 'dir-cust-devon':
        return { joined: '2026-02-10', lastLogin: '1 hour ago', inviteCode: 'INV-DEMO-7721' };
      case 'dir-cust-clara':
        return { joined: '2026-04-05', lastLogin: '2 days ago', inviteCode: 'PEER-BRIDGE-2026' };
      case 'dir-cust-kofi':
        return { joined: '2026-05-29', lastLogin: '5 mins ago', inviteCode: 'PEER-BRIDGE-2026' };
      case 'db-cust-evelyn':
        return { joined: '2026-01-15', lastLogin: 'Active now', inviteCode: 'SYSTEM-VIP' };
      case 'db-cust-jenkins':
        return { joined: '2026-02-01', lastLogin: '4 hours ago', inviteCode: 'SYSTEM-VIP' };
      default:
        return { joined: '2026-05-30', lastLogin: 'Offline', inviteCode: 'PEER-BRIDGE-2026' };
    }
  };

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
      
      // Link invite to email logs
      state.sendBulkInvitations(cleanEmail, code);
      setSingleEmail('');
    } else {
      setError(res.error);
    }
  };

  // CSV/XLS File Upload & Parsing Logic
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
    // Regex matching standard valid emails
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const matches = text.match(emailRegex);
    if (matches && matches.length > 0) {
      // De-duplicate
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

  // Administration Controls
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
    if (confirm(`🗑 WARNING: Are you sure you want to completely DELETE user ${name} from the global directory? This action is irreversible.`)) {
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

  return (
    <div style={styles.container} className="animate-fade-in-up">
      {/* Sleek Title Banner */}
      <div style={styles.headerTitleRow}>
        <div>
          <h2 style={styles.mainTitle}>🔑 Admissions & Maintenance Cockpit</h2>
          <p style={styles.subTitle}>
            Manage cryptographic invite registries, perform secure user accounts override sweeps, block access, and vet credentials.
          </p>
        </div>
      </div>

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

      {success && (
        <div style={styles.successToast}>
          ✨ {success}
        </div>
      )}

      {/* Middle Interactive Grid: Creator & Bulk File Imports */}
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

              <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start', padding: '0.5rem 1rem', fontSize: '0.76rem' }}>
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

              <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start', padding: '0.5rem 1rem', fontSize: '0.76rem' }}>
                Generate & Register Invite Code
              </button>
            </form>

            {generatedCode && (
              <div style={{
                marginTop: '0.75rem',
                background: 'rgba(0, 242, 254, 0.05)',
                border: '1px solid rgba(0, 242, 254, 0.25)',
                borderRadius: '8px',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}>
                <span style={{ fontSize: '0.7rem', color: '#00f2fe', fontWeight: '800', textTransform: 'uppercase' }}>
                  🔑 Cryptographic Waitlist Bypass Code
                </span>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.3)', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <code style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: '800', letterSpacing: '0.05em' }}>
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
                <span style={{ fontSize: '0.64rem', color: '#a3a3a3', lineHeight: '1.25' }}>
                  Provide this code to the user. They can click the <strong>Invite Gate</strong> tab on the landing page, enter this code, and register instantly!
                </span>
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

              {/* Drag and Drop Box */}
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={triggerFileInput}
                style={{
                  ...styles.dragZone,
                  borderColor: dragActive ? '#00f2fe' : 'rgba(255,255,255,0.08)',
                  background: dragActive ? 'rgba(0, 242, 254, 0.03)' : 'rgba(0, 0, 0, 0.2)'
                }}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileInputChange} 
                  style={{ display: 'none' }} 
                  accept=".csv,.txt,.xls,.xlsx"
                />
                <span style={{ fontSize: '1.5rem', marginBottom: '0.35rem' }}>📂</span>
                <span style={{ fontSize: '0.76rem', color: '#ffffff', fontWeight: '700' }}>
                  Drag & Drop CSV / XLS list here
                </span>
                <span style={{ fontSize: '0.62rem', color: '#a3a3a3', marginTop: '0.2rem' }}>
                  or click to browse local storage files
                </span>
              </div>

              <div style={styles.inputGroup}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={styles.label}>Emails Queue (Comma separated)</label>
                  {emails && (
                    <button 
                      type="button" 
                      onClick={() => setEmails('')} 
                      style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '0.65rem', fontWeight: '700', cursor: 'pointer' }}
                    >
                      Clear Queue
                    </button>
                  )}
                </div>
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

      {/* Massive Bottom Interactive Grid: Registered Users Audit & Maintenance Ledger */}
      <div className="glass-panel" style={{ ...styles.card, padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
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
                <th style={styles.tableHeaderCell}>Credential Verification</th>
                <th style={styles.tableHeaderCell}>Joined Date</th>
                <th style={styles.tableHeaderCell}>Last Active Session</th>
                <th style={styles.tableHeaderCell}>Invite Code Used</th>
                <th style={{ ...styles.tableHeaderCell, textAlign: 'right' }}>Security Override Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDirectory.map((member) => {
                const audit = getSimulatedAuditInfo(member.customer_id);
                const isCurrentUser = member.customer_id === state.customer.customer_id;
                
                return (
                  <tr key={member.customer_id} style={styles.tableRow}>
                    {/* User profile with avatar */}
                    <td style={styles.tableCell}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        {member.basicProfile?.profile_picture_url ? (
                          <img 
                            src={member.basicProfile.profile_picture_url} 
                            alt={member.first_name} 
                            style={styles.avatarImg} 
                          />
                        ) : (
                          <div style={styles.avatarInitials}>
                            {member.first_name.charAt(0)}{member.last_name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: '800', color: '#ffffff', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <span>{member.first_name} {member.last_name}</span>
                            {isCurrentUser && <span style={{ fontSize: '0.62rem', color: '#8b5cf6', background: 'rgba(139,92,246,0.1)', padding: '0.05rem 0.25rem', borderRadius: '4px' }}>Me</span>}
                          </div>
                          <span style={{ fontSize: '0.68rem', color: '#a3a3a3' }}>{member.email}</span>
                        </div>
                      </div>
                    </td>

                    {/* Roles Badges */}
                    <td style={styles.tableCell}>
                      <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                        {member.role_flags?.map(r => (
                          <span 
                            key={r} 
                            className="badge badge-admin" 
                            style={{ fontSize: '0.58rem', padding: '0.08rem 0.35rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Verification / Security Status */}
                    <td style={styles.tableCell}>
                      {member.status === 'blocked' ? (
                        <span style={{ ...styles.statusBadge, color: '#ef4444', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                          🚫 Blocked
                        </span>
                      ) : member.status === 'verified' ? (
                        <span style={{ ...styles.statusBadge, color: '#10b981', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                          🛡 Vetted Member
                        </span>
                      ) : (
                        <span style={{ ...styles.statusBadge, color: '#d4af37', background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}>
                          ⚠️ KYC Pending
                        </span>
                      )}
                    </td>

                    {/* Joined Date */}
                    <td style={styles.tableCell}>
                      <span style={{ fontSize: '0.76rem', color: '#a3a3a3' }}>{audit.joined}</span>
                    </td>

                    {/* Last active session */}
                    <td style={styles.tableCell}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span style={{
                          width: '5px',
                          height: '5px',
                          borderRadius: '50%',
                          background: audit.lastLogin === 'Active now' ? '#10b981' : '#525252',
                          boxShadow: audit.lastLogin === 'Active now' ? '0 0 6px #10b981' : 'none'
                        }} />
                        <span style={{ fontSize: '0.76rem', color: audit.lastLogin === 'Active now' ? '#10b981' : '#a3a3a3' }}>
                          {audit.lastLogin}
                        </span>
                      </div>
                    </td>

                    {/* Invitation Code */}
                    <td style={styles.tableCell}>
                      <code style={{ fontSize: '0.74rem', color: '#d4af37' }}>{audit.inviteCode}</code>
                    </td>

                    {/* Actions Row */}
                    <td style={{ ...styles.tableCell, textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        {/* Reset password override */}
                        <button
                          onClick={() => handleResetPassword(member.customer_id, `${member.first_name} ${member.last_name}`)}
                          className="btn-secondary"
                          style={styles.actionBtn}
                          title="Override credentials to standard password123"
                        >
                          🔑 Reset
                        </button>

                        {/* Accreditation Vetting override */}
                        <button
                          onClick={() => handleToggleVetCredentials(member.customer_id, `${member.first_name} ${member.last_name}`, member.status)}
                          className="btn-secondary"
                          style={{
                            ...styles.actionBtn,
                            color: member.status === 'verified' ? '#d4af37' : '#00f2fe',
                            borderColor: member.status === 'verified' ? 'rgba(212,175,55,0.2)' : 'rgba(0,242,254,0.2)'
                          }}
                          title={member.status === 'verified' ? 'Revoke vetted SEC credential status' : 'Approve credentials & issue security vetting badge'}
                        >
                          {member.status === 'verified' ? 'Revoke Vet' : '🛡 Vet'}
                        </button>

                        {/* Block Account toggle */}
                        <button
                          onClick={() => handleToggleBlock(member.customer_id, `${member.first_name} ${member.last_name}`, member.status)}
                          className="btn-secondary"
                          style={{
                            ...styles.actionBtn,
                            color: member.status === 'blocked' ? '#10b981' : '#f43f5e',
                            borderColor: member.status === 'blocked' ? 'rgba(16,185,129,0.2)' : 'rgba(244,63,94,0.2)'
                          }}
                          disabled={isCurrentUser}
                          title={member.status === 'blocked' ? 'Unblock user account' : 'Bar user from login & terminate active sessions'}
                        >
                          {member.status === 'blocked' ? 'Unblock' : '🚫 Block'}
                        </button>

                        {/* Permanent Account Purge */}
                        <button
                          onClick={() => handleDeleteUser(member.customer_id, `${member.first_name} ${member.last_name}`)}
                          className="btn-secondary"
                          style={{
                            ...styles.actionBtn,
                            color: '#ef4444',
                            borderColor: 'rgba(239,68,68,0.2)'
                          }}
                          disabled={isCurrentUser}
                          title="Purge user files completely from ecosystem directory database"
                        >
                          🗑 Delete
                        </button>
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
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.75rem',
  },
  headerTitleRow: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    paddingBottom: '1rem',
  },
  mainTitle: {
    fontSize: '1.45rem',
    fontWeight: '850',
    color: '#ffffff',
    margin: 0,
  },
  subTitle: {
    fontSize: '0.8rem',
    color: '#a3a3a3',
    marginTop: '0.2rem',
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
    color: '#a3a3a3',
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: '0.03em',
  },
  metricVal: {
    fontSize: '1.85rem',
    fontWeight: '800',
    color: '#ffffff',
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
    color: '#ffffff',
    margin: 0,
  },
  cardDesc: {
    fontSize: '0.76rem',
    color: '#a3a3a3',
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
    color: '#a3a3a3',
    textTransform: 'uppercase',
  },
  input: {
    width: '100%',
    background: 'rgba(0, 0, 0, 0.25)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '8px',
    padding: '0.65rem 0.85rem',
    color: '#ffffff',
    fontSize: '0.85rem',
    outline: 'none',
    transition: 'all 0.2s',
  },
  dragZone: {
    border: '2px dashed rgba(255,255,255,0.08)',
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
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '8px',
    padding: '0.65rem 0.85rem',
    color: '#ffffff',
    fontSize: '0.85rem',
    outline: 'none',
    resize: 'none',
    fontFamily: 'inherit',
    transition: 'all 0.2s',
  },
  select: {
    width: '100%',
    background: 'rgba(10, 10, 10, 0.95)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '8px',
    padding: '0.65rem 0.85rem',
    color: '#ffffff',
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
    background: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
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
    color: '#a3a3a3',
  },
  logBody: {
    fontSize: '0.74rem',
  },
  logMeta: {
    color: '#737373',
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
    color: '#a3a3a3',
    fontSize: '0.68rem',
    lineHeight: '1.2'
  },
  emptyLog: {
    color: '#525252',
    fontStyle: 'italic',
    margin: 0,
    fontSize: '0.68rem',
  },
  // Table Audit Styles
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '0.8rem',
  },
  tableHeaderRow: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  },
  tableHeaderCell: {
    padding: '0.75rem 1rem',
    fontWeight: '800',
    color: '#a3a3a3',
    fontSize: '0.7rem',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  tableRow: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
    transition: 'background 0.2s',
    ':hover': {
      background: 'rgba(255, 255, 255, 0.01)'
    }
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
    border: '1.5px solid rgba(255,255,255,0.1)'
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
    border: '1px solid rgba(255,255,255,0.08)'
  }
};
