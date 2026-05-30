'use client';

import { useState } from 'react';

export default function BankingModule({ state }) {
  const { walletBalance, connectedBank, transactions, linkBankAccount, depositFunds, withdrawFunds } = state;
  const [showPlaidLink, setShowPlaidLink] = useState(false);
  const [depositAmount, setDepositAmount] = useState('10000');
  const [withdrawAmount, setWithdrawAmount] = useState('5000');
  const [bankName, setBankName] = useState('Chase Bank');
  const [accountNum, setAccountNum] = useState('4821');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLinkBank = (e) => {
    e.preventDefault();
    if (!bankName.trim() || !accountNum.trim()) return;

    linkBankAccount(bankName, `•••• ${accountNum}`);
    setShowPlaidLink(false);
    setSuccess(`Successfully linked ${bankName} account ending in ${accountNum}!`);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleDeposit = (e) => {
    e.preventDefault();
    const res = depositFunds(depositAmount);
    if (res.success) {
      setSuccess(`Successfully deposited $${parseFloat(depositAmount).toLocaleString()} into your Peer Bridge wallet!`);
      setDepositAmount('10000');
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(res.error);
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleWithdraw = (e) => {
    e.preventDefault();
    const res = withdrawFunds(withdrawAmount);
    if (res.success) {
      setSuccess(`Successfully processed withdrawal of $${parseFloat(withdrawAmount).toLocaleString()} to your bank!`);
      setWithdrawAmount('5000');
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(res.error);
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div style={styles.container} className="animate-fade-in-up">
      {/* Overview header */}
      <div style={styles.headerRow}>
        <div>
          <h2 style={styles.title}>Ecosystem Banking & Capital Wallet</h2>
          <p style={subStyle}>Secure alternative asset deposits, bank integrations, and capital ledgers.</p>
        </div>
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

      {/* Main Grid */}
      <div style={styles.grid}>
        {/* Wallet Controls */}
        <div style={styles.controlsCol}>
          {/* Internal Wallet */}
          <div className="glass-panel" style={styles.walletCard}>
            <div style={styles.walletCardHeader}>
              <span style={styles.walletLabel}>Ecosystem Wallet Capital</span>
              <div style={styles.walletIcon}></div>
            </div>
            <span style={styles.walletBalance}>
              ${walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <p style={styles.walletDesc}>
              Available balance to dedicate to Startup offerings. Funds are secured in regulated P2P ledger vaults.
            </p>
          </div>

          {/* Linked Bank Profile */}
          <div className="glass-panel" style={styles.card}>
            <h3 style={styles.cardTitle}>🔗 Bank Account Integration</h3>
            
            {!connectedBank ? (
              <div style={styles.bankEmptyBox}>
                <p style={styles.bankEmptyText}>No funding account connected. Please integrate a bank to deposit capital.</p>
                <button
                  onClick={() => setShowPlaidLink(true)}
                  className="btn-primary"
                  style={styles.connectBtn}
                >
                  Connect Funding Source (Plaid)
                </button>
              </div>
            ) : (
              <div style={styles.bankConnectedBox}>
                <div style={styles.bankMeta}>
                  <div style={styles.bankAvatar}>🏛</div>
                  <div>
                    <h4 style={styles.bankNameText}>{connectedBank.bankName}</h4>
                    <span style={styles.bankAccountText}>Account: {connectedBank.accountNumber}</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowPlaidLink(true)}
                  className="btn-secondary"
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                >
                  Switch Account
                </button>
              </div>
            )}
          </div>

          {/* Capital In / Out consoles */}
          {connectedBank && (
            <div style={styles.transfersRow}>
              {/* Deposit Console */}
              <div className="glass-panel" style={{ ...styles.card, flex: 1 }}>
                <h4 style={styles.consoleTitle}>📥 Deposit Capital</h4>
                <form onSubmit={handleDeposit} style={styles.consoleForm}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Transfer Amount ($)</label>
                    <input
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      style={styles.input}
                      required
                    />
                  </div>
                  <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                    Deposit Funds
                  </button>
                </form>
              </div>

              {/* Withdrawal Console */}
              <div className="glass-panel" style={{ ...styles.card, flex: 1 }}>
                <h4 style={styles.consoleTitle}>📤 Withdraw Capital</h4>
                <form onSubmit={handleWithdraw} style={styles.consoleForm}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Transfer Amount ($)</label>
                    <input
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      style={styles.input}
                      required
                    />
                  </div>
                  <button type="submit" className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                    Withdraw Funds
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Transaction History Ledger */}
        <div className="glass-panel" style={{ ...styles.card, flex: 1 }}>
          <h3 style={styles.cardTitle}>📜 Financial Ledger Audit</h3>
          <p style={styles.cardDesc}>Verifiable history of deposits, withdrawals, and equity purchases.</p>

          {transactions.length === 0 ? (
            <div style={styles.emptyLedgerBox}>
              <p>No transactions logged on this node yet.</p>
            </div>
          ) : (
            <div style={styles.ledgerList}>
              {transactions.map((tx) => (
                <div key={tx.id} style={styles.txItem}>
                  <div style={styles.txMeta}>
                    <span style={{ 
                      ...styles.txTypeBadge,
                      background: tx.type === 'Deposit' ? 'rgba(16, 185, 129, 0.1)' : tx.type === 'Withdrawal' ? 'rgba(245, 158, 11, 0.1)' : tx.type === 'Investment' ? 'rgba(143, 0, 255, 0.1)' : 'rgba(255,255,255,0.05)',
                      color: tx.type === 'Deposit' ? '#10b981' : tx.type === 'Withdrawal' ? '#f59e0b' : tx.type === 'Investment' ? '#c084fc' : '#ffffff',
                    }}>
                      {tx.type}
                    </span>
                    <div>
                      <h4 style={styles.txDescription}>{tx.description}</h4>
                      <span style={styles.txDate}>{new Date(tx.date).toLocaleString()} • ID: {tx.id}</span>
                    </div>
                  </div>
                  <span style={{ 
                    ...styles.txAmount,
                    color: tx.type === 'Deposit' ? '#10b981' : tx.type === 'Withdrawal' || tx.type === 'Investment' ? '#f43f5e' : '#ffffff'
                  }}>
                    {tx.type === 'Deposit' ? '+' : tx.type === 'Withdrawal' || tx.type === 'Investment' ? '-' : ''}
                    ${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mock Plaid Link Dialog */}
      {showPlaidLink && (
        <div style={styles.plaidBackdrop}>
          <div className="glass-panel glow-accent-border" style={styles.plaidCard}>
            <h3 style={styles.plaidTitle}>🏛 Plaid Bank Connector</h3>
            <p style={styles.plaidSub}>
              Select your institution and provide details. Peer Bridge connects directly to major banks under regulatory P2P protocols.
            </p>

            <form onSubmit={handleLinkBank} style={styles.plaidForm}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Select Institution</label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  style={styles.select}
                >
                  <option value="Chase Bank">Chase Bank</option>
                  <option value="Bank of America">Bank of America</option>
                  <option value="Wells Fargo">Wells Fargo</option>
                  <option value="Silicon Valley Bank">Silicon Valley Bank (SVB)</option>
                  <option value="Fidelity Cash Management">Fidelity Cash Management</option>
                </select>
              </div>

              <div style={styles.inputGroup2Col}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Routing Transit Number</label>
                  <input
                    type="text"
                    defaultValue="021000021"
                    maxLength={9}
                    style={styles.input}
                    required
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Account Number (Last 4 Digits)</label>
                  <input
                    type="text"
                    value={accountNum}
                    onChange={(e) => setAccountNum(e.target.value)}
                    maxLength={4}
                    style={styles.input}
                    required
                  />
                </div>
              </div>

              <div style={styles.plaidConsentBox}>
                ℹ By linking, you authorize Peer Bridge to securely request deposits under SEC and Plaid security rules.
              </div>

              <div style={styles.plaidButtons}>
                <button
                  type="button"
                  onClick={() => setShowPlaidLink(false)}
                  className="btn-secondary"
                  style={{ flex: 1 }}
                >
                  Back
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 2 }}>
                  Establish Direct Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const subStyle = {
  fontSize: '0.9rem',
  color: '#94a3b8',
  marginTop: '0.2rem',
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2.5rem',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '800',
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
  },
  controlsCol: {
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
    maxWidth: '540px',
  },
  walletCard: {
    background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.15) 0%, rgba(143, 0, 255, 0.15) 100%)',
    border: '1px solid var(--border-accent)',
    padding: '2.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    boxShadow: 'var(--shadow-glow)',
  },
  walletCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  walletLabel: {
    fontSize: '0.8rem',
    color: '#94a3b8',
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: '0.05em',
  },
  walletIcon: {
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    background: '#00f2fe',
    boxShadow: '0 0 10px #00f2fe',
  },
  walletBalance: {
    fontSize: '3rem',
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: '-0.02em',
  },
  walletDesc: {
    fontSize: '0.85rem',
    color: '#94a3b8',
    lineHeight: '1.4',
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
  bankEmptyBox: {
    background: 'rgba(255,255,255,0.01)',
    border: '1px dashed rgba(255,255,255,0.1)',
    borderRadius: '12px',
    padding: '2rem 1.5rem',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1.25rem',
  },
  bankEmptyText: {
    fontSize: '0.88rem',
    color: '#64748b',
    lineHeight: '1.4',
  },
  connectBtn: {
    padding: '0.65rem 1.25rem',
    fontSize: '0.85rem',
  },
  bankConnectedBox: {
    background: 'rgba(16, 185, 129, 0.05)',
    border: '1px solid rgba(16, 185, 129, 0.1)',
    borderRadius: '12px',
    padding: '1.25rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bankMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  bankAvatar: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    background: 'rgba(255,255,255,0.05)',
    fontSize: '1.25rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankNameText: {
    fontSize: '0.95rem',
    fontWeight: '700',
    color: '#ffffff',
  },
  bankAccountText: {
    fontSize: '0.78rem',
    color: '#64748b',
  },
  transfersRow: {
    display: 'flex',
    gap: '1.5rem',
  },
  consoleTitle: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#ffffff',
  },
  consoleForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  inputGroup2Col: {
    display: 'grid',
    gridTemplateColumns: '1.5fr 1fr',
    gap: '1rem',
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
    fontSize: '1.1rem',
    fontFamily: 'monospace',
    outline: 'none',
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
  emptyLedgerBox: {
    padding: '4rem 2rem',
    textAlign: 'center',
    color: '#64748b',
  },
  ledgerList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    maxHeight: '520px',
    overflowY: 'auto',
    paddingRight: '0.5rem',
  },
  txItem: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.04)',
    borderRadius: '8px',
    padding: '1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
  },
  txMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  txTypeBadge: {
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.7rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  txDescription: {
    fontSize: '0.88rem',
    fontWeight: '700',
    color: '#ffffff',
  },
  txDate: {
    display: 'block',
    fontSize: '0.75rem',
    color: '#64748b',
    marginTop: '0.2rem',
  },
  txAmount: {
    fontSize: '1.1rem',
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  plaidBackdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  plaidCard: {
    width: '100%',
    maxWidth: '460px',
    padding: '2.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  plaidTitle: {
    fontSize: '1.5rem',
    fontWeight: '800',
  },
  plaidSub: {
    fontSize: '0.88rem',
    color: '#94a3b8',
    lineHeight: '1.4',
  },
  plaidForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  plaidConsentBox: {
    background: 'rgba(0, 242, 254, 0.05)',
    border: '1px solid rgba(0, 242, 254, 0.1)',
    borderRadius: '6px',
    padding: '0.75rem 1rem',
    fontSize: '0.78rem',
    color: '#00f2fe',
    lineHeight: '1.4',
  },
  plaidButtons: {
    display: 'flex',
    gap: '1rem',
  }
};
