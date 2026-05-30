'use client';

import { useState } from 'react';

export default function SalesAdminModule({ state }) {
  const [newCode, setNewCode] = useState('');
  const [emails, setEmails] = useState('');
  const [selectedCode, setSelectedCode] = useState(state.invites[0]?.code || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
      setTimeout(() => setSuccess(''), 3000);
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

  return (
    <div style={styles.container} className="animate-fade-in-up">
      {/* Overview Cards */}
      <div style={styles.metricsRow}>
        <div className="glass-panel" style={styles.metricCard}>
          <span style={styles.metricLabel}>Total Invitation Codes</span>
          <span style={styles.metricVal}>{state.invites.length}</span>
        </div>
        <div className="glass-panel" style={styles.metricCard}>
          <span style={styles.metricLabel}>Active Network Members</span>
          <span style={styles.metricVal}>128</span>
        </div>
        <div className="glass-panel" style={styles.metricCard}>
          <span style={styles.metricLabel}>Pending Invitations</span>
          <span style={styles.metricVal}>43</span>
        </div>
      </div>

      {success && (
        <div style={styles.successToast}>
          ✨ {success}
        </div>
      )}

      {/* Main Grid */}
      <div style={styles.grid}>
        {/* Creator & Bulk Invite Form */}
        <div style={styles.formCol}>
          {/* Generate Code */}
          <div className="glass-panel" style={styles.card}>
            <h3 style={styles.cardTitle}>🎟 Create Invitation Code</h3>
            <p style={styles.cardDesc}>
              Provision private invitation keys for new founders, angels, or legal affiliates.
            </p>

            <form onSubmit={handleGenerateCode} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Custom Code Text</label>
                <input
                  type="text"
                  placeholder="e.g. ANGEL-VIP-2026"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>

              {error && !emails && <span style={styles.errorText}>{error}</span>}

              <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }}>
                Generate Token
              </button>
            </form>
          </div>

          {/* Bulk Emails */}
          <div className="glass-panel" style={styles.card}>
            <h3 style={styles.cardTitle}>✉ Bulk Member Invitation</h3>
            <p style={styles.cardDesc}>
              Input comma-separated professional emails to dispatch secure invitations.
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
                      {inv.code} (Used: {inv.usedCount} time)
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Email Addresses (Comma separated)</label>
                <textarea
                  placeholder="investor1@firm.com, founder2@startup.io, partner3@legal.net"
                  value={emails}
                  onChange={(e) => setEmails(e.target.value)}
                  style={styles.textarea}
                  rows="4"
                  required
                />
              </div>

              {error && emails && <span style={styles.errorText}>{error}</span>}

              <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }}>
                Dispatch Invitations
              </button>
            </form>
          </div>
        </div>

        {/* Invite Code Ledgers */}
        <div className="glass-panel" style={{ ...styles.card, flex: 1 }}>
          <h3 style={styles.cardTitle}>📊 Invitation Registry Logs</h3>
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
                  
                  {inv.logs.length > 0 ? (
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
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  metricsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1.5rem',
  },
  metricCard: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  metricLabel: {
    fontSize: '0.8rem',
    color: '#64748b',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  metricVal: {
    fontSize: '2rem',
    fontWeight: '800',
    color: '#ffffff',
  },
  grid: {
    display: 'flex',
    gap: '2rem',
  },
  formCol: {
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  card: {
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  cardTitle: {
    fontSize: '1.25rem',
    fontWeight: '800',
  },
  cardDesc: {
    fontSize: '0.9rem',
    color: '#94a3b8',
    lineHeight: '1.4',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  input: {
    width: '100%',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    color: '#ffffff',
    fontSize: '0.95rem',
    outline: 'none',
  },
  textarea: {
    width: '100%',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    color: '#ffffff',
    fontSize: '0.95rem',
    outline: 'none',
    resize: 'none',
    fontFamily: 'inherit',
  },
  select: {
    width: '100%',
    background: 'rgba(25, 33, 52, 1)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    color: '#ffffff',
    fontSize: '0.95rem',
    outline: 'none',
    cursor: 'pointer',
  },
  errorText: {
    fontSize: '0.8rem',
    color: '#f43f5e',
    fontWeight: '500',
  },
  successToast: {
    background: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    color: '#10b981',
    padding: '1rem',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: '600',
  },
  logsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    maxHeight: '480px',
    overflowY: 'auto',
    paddingRight: '0.5rem',
  },
  inviteLogItem: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: '8px',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  logHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logCode: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#00f2fe',
  },
  logUses: {
    fontSize: '0.8rem',
    color: '#64748b',
  },
  logBody: {
    fontSize: '0.85rem',
  },
  logMeta: {
    color: '#94a3b8',
    marginBottom: '0.5rem',
  },
  subLogs: {
    background: 'rgba(0,0,0,0.15)',
    padding: '0.75rem',
    borderRadius: '6px',
    borderLeft: '2px solid var(--border-accent)',
  },
  subLogTitle: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#c084fc',
    textTransform: 'uppercase',
  },
  ul: {
    paddingLeft: '1.25rem',
    marginTop: '0.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem',
  },
  li: {
    color: '#94a3b8',
    fontSize: '0.8rem',
  },
  emptyLog: {
    color: '#64748b',
    fontStyle: 'italic',
    fontSize: '0.8rem',
  }
};
