'use client';

import { useState } from 'react';

export default function SupportModule({ state }) {
  const { helpTickets, submitHelpTicket, user } = state;
  const [category, setCategory] = useState('technical');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) {
      setError('Please provide details for your support request.');
      return;
    }

    const res = submitHelpTicket(category, message);
    if (res.success) {
      setMessage('');
      setError('');
      setSuccess(`Support Ticket ${res.ticket.ticket_id} opened successfully!`);
      setTimeout(() => setSuccess(''), 4000);
    } else {
      setError('Failed to open support ticket. Please try again.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'open':
        return <span className="badge badge-pending">Open</span>;
      case 'in_progress':
        return <span className="badge badge-admin">In Progress</span>;
      case 'resolved':
        return <span className="badge badge-verified">✓ Resolved</span>;
      case 'closed':
        return <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: '#737373' }}>Closed</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  const getCategoryLabel = (cat) => {
    switch (cat) {
      case 'technical':
        return '💻 Technical Issue';
      case 'billing':
        return '💳 Billing / Funds Transfer';
      case 'account':
        return '🔑 Cognito Credentials';
      default:
        return '❓ General Query';
    }
  };

  return (
    <div style={styles.container} className="animate-fade-in-up">
      <div style={styles.introHeader}>
        <h2 style={styles.title}>Customer Support Desk</h2>
        <p style={styles.sub}>Open technical audits, request credential resets, and verify banking ledger tickets directly on-chain.</p>
      </div>

      {success && (
        <div style={styles.successToast}>
          ✨ {success}
        </div>
      )}

      {error && (
        <div style={styles.errorToast}>
          ⚠ {error}
        </div>
      )}

      <div style={styles.grid}>
        {/* Submit Ticket Form */}
        <div className="glass-panel" style={styles.card}>
          <h3 style={styles.cardTitle}>💬 Raise a Support Request</h3>
          <p style={styles.cardDesc}>Submit a detailed log to our vetted system administrators. Most technical issues are resolved within 2 hours.</p>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Ticket Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={styles.select}
              >
                <option value="technical">Technical Issue (App / UI)</option>
                <option value="billing">Billing / Funds Placements (Plaid / Wallet)</option>
                <option value="account">Cognito Credentials / 2FA / KYC Badges</option>
                <option value="general">General Platform Query</option>
              </select>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Support Message Details</label>
              <textarea
                placeholder="Explain the issue or question in detail. Include any transaction IDs or error messages if applicable..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={styles.textarea}
                rows="5"
                required
              />
            </div>

            <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }}>
              Submit Ticket (Table #11)
            </button>
          </form>
        </div>

        {/* Support Tickets Ledger */}
        <div className="glass-panel" style={{ ...styles.card, flex: 0.9 }}>
          <h3 style={styles.cardTitle}>📜 Support Ledger (Table #11)</h3>
          <p style={styles.cardDesc}>Historical support ticket logs linked to your active Cognito customer account.</p>

          <div style={styles.ticketList}>
            {helpTickets.length === 0 ? (
              <div style={styles.emptyTickets}>
                <p>No active support tickets logged under this node.</p>
              </div>
            ) : (
              helpTickets.map((tkt) => (
                <div key={tkt.ticket_id} style={styles.ticketItem}>
                  <div style={styles.tktHeader}>
                    <div>
                      <strong style={styles.tktId}>{tkt.ticket_id.toUpperCase()}</strong>
                      <span style={styles.tktCategory}>{getCategoryLabel(tkt.category)}</span>
                    </div>
                    {getStatusBadge(tkt.status)}
                  </div>
                  <p style={styles.tktMsg}>"{tkt.message}"</p>
                  <div style={styles.tktFooter}>
                    <span>Submitted: {new Date(tkt.created_at).toLocaleString()}</span>
                  </div>
                </div>
              ))
            )}
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
    gap: '2.5rem',
  },
  introHeader: {
    marginBottom: '0.5rem',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '800',
  },
  sub: {
    fontSize: '0.9rem',
    color: '#a3a3a3',
    marginTop: '0.25rem',
  },
  successToast: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid #ffffff',
    color: '#ffffff',
    padding: '1rem',
    borderRadius: '6px',
    fontSize: '0.9rem',
    fontWeight: '600',
  },
  errorToast: {
    background: 'rgba(244, 63, 94, 0.1)',
    border: '1px solid rgba(244, 63, 94, 0.3)',
    color: '#f43f5e',
    padding: '1rem',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: '600',
  },
  grid: {
    display: 'flex',
    gap: '2rem',
    flexWrap: 'wrap',
  },
  card: {
    padding: '2rem',
    flex: '1.1',
    minWidth: '320px',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    height: 'fit-content',
  },
  cardTitle: {
    fontSize: '1.25rem',
    fontWeight: '800',
  },
  cardDesc: {
    fontSize: '0.9rem',
    color: '#a3a3a3',
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
    fontSize: '0.72rem',
    fontWeight: '700',
    color: '#737373',
    textTransform: 'uppercase',
  },
  select: {
    width: '100%',
    background: '#000000',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '6px',
    padding: '0.7rem 1rem',
    color: '#ffffff',
    fontSize: '0.9rem',
    outline: 'none',
    cursor: 'pointer',
  },
  textarea: {
    width: '100%',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '6px',
    padding: '0.75rem 1rem',
    color: '#ffffff',
    fontSize: '0.9rem',
    outline: 'none',
    resize: 'none',
    fontFamily: 'inherit',
  },
  ticketList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    width: '100%',
  },
  emptyTickets: {
    padding: '3rem 1.5rem',
    textAlign: 'center',
    color: '#525252',
    fontStyle: 'italic',
    fontSize: '0.85rem',
  },
  ticketItem: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.04)',
    borderRadius: '8px',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    width: '100%',
  },
  tktHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '1rem',
  },
  tktId: {
    fontSize: '0.95rem',
    color: '#ffffff',
    fontFamily: 'monospace',
    display: 'block',
  },
  tktCategory: {
    fontSize: '0.75rem',
    color: '#737373',
    display: 'block',
    marginTop: '0.15rem',
  },
  tktMsg: {
    fontSize: '0.85rem',
    color: '#a3a3a3',
    lineHeight: '1.4',
    background: 'rgba(255,255,255,0.01)',
    padding: '0.5rem 0.75rem',
    borderRadius: '4px',
    borderLeft: '2px solid #ffffff',
  },
  tktFooter: {
    fontSize: '0.72rem',
    color: '#525252',
  }
};
