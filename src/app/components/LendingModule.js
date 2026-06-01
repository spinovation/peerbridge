'use client';

import { useState, useEffect } from 'react';

export default function LendingModule({ state }) {
  const {
    loans,
    offerP2PLoan,
    counterP2PLoan,
    executeP2PLoan,
    repayP2PLoan,
    customer,
    directory,
    walletBalance,
    refreshUserData
  } = state;

  const [principal, setPrincipal] = useState(500);
  const [rate, setRate] = useState(7.5);
  const [counterRate, setCounterRate] = useState(6.0);
  const [targetBorrowerId, setTargetBorrowerId] = useState('dir-cust-kristi');
  const [activeSubTab, setActiveSubTab] = useState('marketplace'); // marketplace, active_loans, ledger
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const isLender = customer.email !== 'salesadmin@peerbridge.ai';
  const isBorrower = customer.email !== 'salesadmin@peerbridge.ai';

  const availableBorrowers = directory.filter(m => m.role_flags?.includes('Entrepreneur') && m.customer_id !== customer.customer_id);

  useEffect(() => {
    if (availableBorrowers.length > 0 && (!targetBorrowerId || !availableBorrowers.some(b => b.customer_id === targetBorrowerId))) {
      setTargetBorrowerId(availableBorrowers[0].customer_id);
    }
  }, [directory, customer]);

  // Find loans relevant to this user
  const userLoans = loans.filter(l => 
    l.lender_id === customer.customer_id || l.borrower_id === customer.customer_id
  );

  const handleOfferLoan = (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (walletBalance < principal + (principal * 0.015)) {
      setErrorMsg(`Insufficient wallet balance. Offering $${principal} principal requires $${(principal * 0.015)} upfront platform origination fee (total: $${(principal + principal * 0.015).toFixed(2)}).`);
      return;
    }

    const res = offerP2PLoan(customer.customer_id, targetBorrowerId, principal, rate);
    if (res.success) {
      setSuccessMsg(`P2P Debt Offer successfully submitted to borrower!`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } else {
      setErrorMsg(res.error || 'Failed to submit loan offer.');
    }
  };

  const handleCounterRate = (loanId) => {
    setSuccessMsg('');
    setErrorMsg('');
    const res = counterP2PLoan(loanId, counterRate);
    if (res.success) {
      setSuccessMsg(`Counter rate proposal of ${counterRate}% dispatched to Lender!`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } else {
      setErrorMsg('Failed to proposal counter rate.');
    }
  };

  const handleExecuteLoan = (loanId) => {
    setSuccessMsg('');
    setErrorMsg('');
    const res = executeP2PLoan(loanId);
    if (res.success) {
      setSuccessMsg(`Loan executed! Funds cleared and disbursed.`);
      setTimeout(() => setSuccessMsg(''), 4000);
      if (refreshUserData) refreshUserData();
    } else {
      setErrorMsg(res.error || 'Failed to execute loan.');
    }
  };

  const handleRepayLoan = (loanId) => {
    setSuccessMsg('');
    setErrorMsg('');
    const res = repayP2PLoan(loanId);
    if (res.success) {
      setSuccessMsg(`Loan fully paid off! Platform servicing spreads settled.`);
      setTimeout(() => setSuccessMsg(''), 4000);
      if (refreshUserData) refreshUserData();
    } else {
      setErrorMsg(res.error || 'Failed to repay loan.');
    }
  };

  // Calculate platform revenue for ledger
  const upfrontFeeTotal = loans.filter(l => l.status === 'active' || l.status === 'paid_off').reduce((acc, curr) => acc + curr.upfront_fee, 0);
  const spreadTotal = loans.filter(l => l.status === 'paid_off').reduce((acc, curr) => acc + curr.upfront_fee, 0);
  const totalRevenue = upfrontFeeTotal + spreadTotal;

  return (
    <div style={styles.container} className="animate-fade-in-up">
      <div style={styles.introHeader}>
        <h2 style={styles.title}>🏛 P2P Debt & Lending Center</h2>
        <p style={styles.sub}>Access premium Spread-Based yield vehicles. Transact compliant peer-to-peer credit pools securely inside the USA.</p>
      </div>

      {successMsg && <div style={styles.successToast}>✨ {successMsg}</div>}
      {errorMsg && <div style={styles.errorToast}>⚠ {errorMsg}</div>}

      {/* Navigation Sub-Tabs */}
      <div style={styles.subTabContainer}>
        <button
          onClick={() => setActiveSubTab('marketplace')}
          style={{
            ...styles.subTabButton,
            color: activeSubTab === 'marketplace' ? '#ffffff' : '#737373',
            borderBottom: activeSubTab === 'marketplace' ? '2px solid #ffffff' : '2px solid transparent'
          }}
        >
          💱 Credit Registry
        </button>
        <button
          onClick={() => setActiveSubTab('active_loans')}
          style={{
            ...styles.subTabButton,
            color: activeSubTab === 'active_loans' ? '#ffffff' : '#737373',
            borderBottom: activeSubTab === 'active_loans' ? '2px solid #ffffff' : '2px solid transparent'
          }}
        >
          📂 Portfolio Debt Slices ({userLoans.length})
        </button>
        <button
          onClick={() => setActiveSubTab('ledger')}
          style={{
            ...styles.subTabButton,
            color: activeSubTab === 'ledger' ? '#ffffff' : '#737373',
            borderBottom: activeSubTab === 'ledger' ? '2px solid #ffffff' : '2px solid transparent'
          }}
        >
          📊 Revenue Audit Ledger
        </button>
      </div>

      {activeSubTab === 'marketplace' && (
        <div style={styles.grid}>
          {/* LENDER CONSOLE PANEL */}
          {isLender && (
            <div className="glass-panel" style={styles.card}>
              <h3 style={styles.cardTitle}>💼 Credit Syndicate Console</h3>
              <p style={styles.cardDesc}>Issue compliant debt capital directly to accredited operators. Customize yield yields using Peerbridge's spread-yield model.</p>
              
              <div style={styles.walletState}>
                <div style={styles.walletLabel}>Syndicate Capital Liquid</div>
                <div style={styles.walletBalance}>${walletBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
              </div>

              <form onSubmit={handleOfferLoan} style={styles.form}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Select Pre-Screened Borrower</label>
                  <select
                    value={targetBorrowerId}
                    onChange={(e) => setTargetBorrowerId(e.target.value)}
                    style={styles.select}
                  >
                    {availableBorrowers.map(m => (
                      <option key={m.customer_id} value={m.customer_id}>
                        {m.first_name} {m.last_name} ({m.entrepreneurProfile?.company_name || 'Ecosystem Founder'}) - Tier 1 Credit Score
                      </option>
                    ))}
                    {availableBorrowers.length === 0 && (
                      <option value="dir-cust-kristi">Kristi Tonin (Tonin Logistics) - Tier 1 Credit Score</option>
                    )}
                  </select>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Principal Offering Amount ($)</label>
                  <div style={styles.sliderContainer}>
                    <input
                      type="range"
                      min="100"
                      max="10000"
                      step="50"
                      value={principal}
                      onChange={(e) => setPrincipal(parseInt(e.target.value))}
                      style={styles.slider}
                    />
                    <div style={styles.sliderValues}>
                      <span>$100</span>
                      <strong style={{ fontSize: '1.1rem', color: '#ffffff' }}>${principal}</strong>
                      <span>$10,000</span>
                    </div>
                  </div>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Borrower Gross Interest Rate (Yield Profile)</label>
                  <select
                    value={rate}
                    onChange={(e) => setRate(parseFloat(e.target.value))}
                    style={styles.select}
                  >
                    <option value="6.0">6.0% Gross (4.5% Net Lender Yield)</option>
                    <option value="7.5">7.5% Gross (6.0% Net Lender Yield) - Recommended</option>
                    <option value="9.0">9.0% Gross (7.5% Net Lender Yield)</option>
                  </select>
                </div>

                {/* Yield calculator widgets */}
                <div style={styles.calculatorCard}>
                  <div style={styles.calcTitle}>🧮 Spread-Based Yield Split</div>
                  <div style={styles.calcGrid}>
                    <div style={styles.calcRow}>
                      <span>Borrower Total Payment:</span>
                      <strong>${(principal * (1 + rate / 100)).toFixed(2)}</strong>
                    </div>
                    <div style={styles.calcRow}>
                      <span>Peerbridge Servicing Spread (1.5%):</span>
                      <span style={{ color: '#f43f5e', fontWeight: '600' }}>-${(principal * 0.015).toFixed(2)}</span>
                    </div>
                    <div style={styles.calcRow}>
                      <span>Lender Net Principal + Yield (6.0%):</span>
                      <span style={{ color: '#10b981', fontWeight: '700' }}>${(principal + principal * (rate - 1.5) / 100).toFixed(2)}</span>
                    </div>
                    <div style={styles.calcRow}>
                      <span>Lender Upfront Entry Fee (1.5%):</span>
                      <span>${(principal * 0.015).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                  Submit Debt Syndicate Offer
                </button>
              </form>
            </div>
          )}

          {/* BORROWER CONSOLE PANEL */}
          {isBorrower && (
            <div className="glass-panel" style={styles.card}>
              <h3 style={styles.cardTitle}>📈 Corporate Lending Portal</h3>
              <p style={styles.cardDesc}>Review corporate capital offerings. Propose interest counter rates and accept placements with immediate bank disbursal.</p>
              
              <div style={styles.walletState}>
                <div style={styles.walletLabel}>Clearing Account Liquid</div>
                <div style={styles.walletBalance}>${walletBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
              </div>

              <div style={styles.needCard}>
                <div style={styles.needBadge}>ACTIVE FUNDING REQUEST</div>
                <strong style={{ display: 'block', fontSize: '1.2rem', color: '#ffffff', margin: '0.5rem 0' }}>Tonin Logistics expansion pool</strong>
                <p style={{ color: '#a3a3a3', fontSize: '0.85rem', margin: 0 }}>Targeting $500.00 senior secured loan to scale green cold storage container units.</p>
              </div>

              <div style={styles.offersSection}>
                <h4 style={styles.sectionTitle}>Incoming Placements Offers</h4>
                {loans.filter(l => l.borrower_id === customer.customer_id).length === 0 ? (
                  <div style={styles.emptyOffers}>No pending loan syndicates submitted yet. Waiting for credit offering.</div>
                ) : (
                  loans.filter(l => l.borrower_id === customer.customer_id).map(loan => (
                    <div key={loan.loan_id} style={styles.loanOfferCard}>
                      <div style={styles.offerHead}>
                        <div>
                          <strong style={{ color: '#ffffff' }}>{loan.lender_name}</strong>
                          <span style={{ fontSize: '0.72rem', color: '#737373', display: 'block' }}>Ref: {loan.loan_id.toUpperCase()}</span>
                        </div>
                        <span style={styles.statusBadge(loan.status)}>{loan.status.toUpperCase()}</span>
                      </div>

                      <div style={styles.offerBody}>
                        <div style={styles.offerCol}>
                          <span>Principal</span>
                          <strong>${loan.principal.toFixed(2)}</strong>
                        </div>
                        <div style={styles.offerCol}>
                          <span>Interest Rate</span>
                          <strong>{loan.rate}%</strong>
                        </div>
                        <div style={styles.offerCol}>
                          <span>Origination Fee</span>
                          <strong style={{ color: '#f43f5e' }}>${loan.upfront_fee.toFixed(2)}</strong>
                        </div>
                      </div>

                      {loan.status === 'pending' && (
                        <div style={styles.offerActions}>
                          <div style={styles.counterGroup}>
                            <input
                              type="number"
                              step="0.1"
                              value={counterRate}
                              onChange={(e) => setCounterRate(parseFloat(e.target.value))}
                              style={styles.counterInput}
                            />
                            <button
                              onClick={() => handleCounterRate(loan.loan_id)}
                              className="btn-secondary"
                              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                            >
                              Counter Interest (6.0%)
                            </button>
                          </div>
                          
                          <button
                            onClick={() => handleExecuteLoan(loan.loan_id)}
                            className="btn-primary"
                            style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                          >
                            Accept & Disburse
                          </button>
                        </div>
                      )}

                      {loan.status === 'countered' && (
                        <div style={styles.counterPendingBadge}>
                          Counter offered at <strong>{loan.countered_rate}%</strong>. Awaiting lender acceptance.
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* LENDER OFFERS UNDER REVIEW */}
          {isLender && (
            <div className="glass-panel" style={{ ...styles.card, flex: 0.9 }}>
              <h3 style={styles.cardTitle}>⚖ Active Underwriting Bids</h3>
              <p style={styles.cardDesc}>Verify pending status changes, borrower counter proposals, and disburse pools.</p>

              <div style={styles.offersSection}>
                {loans.filter(l => l.lender_id === customer.customer_id).length === 0 ? (
                  <div style={styles.emptyOffers}>Submit credit syndication bids using the console.</div>
                ) : (
                  loans.filter(l => l.lender_id === customer.customer_id).map(loan => (
                    <div key={loan.loan_id} style={styles.loanOfferCard}>
                      <div style={styles.offerHead}>
                        <div>
                          <strong style={{ color: '#ffffff' }}>Borrower: {loan.borrower_name}</strong>
                          <span style={{ fontSize: '0.72rem', color: '#737373', display: 'block' }}>Ref: {loan.loan_id.toUpperCase()}</span>
                        </div>
                        <span style={styles.statusBadge(loan.status)}>{loan.status.toUpperCase()}</span>
                      </div>

                      <div style={styles.offerBody}>
                        <div style={styles.offerCol}>
                          <span>Principal</span>
                          <strong>${loan.principal.toFixed(2)}</strong>
                        </div>
                        <div style={styles.offerCol}>
                          <span>Gross Interest</span>
                          <strong>{loan.rate}%</strong>
                        </div>
                        <div style={styles.offerCol}>
                          <span>Lender Yield</span>
                          <strong style={{ color: '#10b981' }}>{loan.lender_yield_rate}%</strong>
                        </div>
                      </div>

                      {loan.status === 'countered' && (
                        <div style={styles.offerActions}>
                          <div style={{ fontSize: '0.85rem', color: '#a3a3a3' }}>
                            Borrower countered rate to: <strong style={{ color: '#ffffff' }}>{loan.countered_rate}%</strong>
                          </div>
                          <button
                            onClick={() => handleExecuteLoan(loan.loan_id)}
                            className="btn-primary"
                            style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                          >
                            Accept Counter & Disburse
                          </button>
                        </div>
                      )}

                      {loan.status === 'pending' && (
                        <div style={styles.counterPendingBadge}>
                          Waiting for borrower review or counter rate proposal...
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'active_loans' && (
        <div style={styles.card} className="glass-panel">
          <h3 style={styles.cardTitle}>📁 Active Lending Portfolio (Table #10)</h3>
          <p style={styles.cardDesc}>Legally binding debt agreements cleared and servicing payments.</p>

          <div style={styles.loanList}>
            {userLoans.filter(l => l.status === 'active' || l.status === 'paid_off').length === 0 ? (
              <div style={styles.emptyOffers}>No active debt contracts currently registered on this node.</div>
            ) : (
              userLoans.filter(l => l.status === 'active' || l.status === 'paid_off').map(loan => (
                <div key={loan.loan_id} style={styles.loanContractCard}>
                  <div style={styles.contractHeader}>
                    <div>
                      <strong style={{ color: '#ffffff', fontSize: '1.1rem' }}>P2P Commercial Note Agreement</strong>
                      <span style={{ fontSize: '0.75rem', color: '#737373', display: 'block', marginTop: '0.15rem' }}>Contract Hash ID: {loan.loan_id.toUpperCase()}</span>
                    </div>
                    <span style={styles.statusBadge(loan.status)}>{loan.status.toUpperCase()}</span>
                  </div>

                  <div style={styles.contractMeta}>
                    <div style={styles.metaBox}>
                      <span>LENDER/CREDITOR</span>
                      <strong>{loan.lender_name}</strong>
                    </div>
                    <div style={styles.metaBox}>
                      <span>BORROWER/FOUNDER</span>
                      <strong>{loan.borrower_name}</strong>
                    </div>
                    <div style={styles.metaBox}>
                      <span>COMPLIANCE JURISDICTION</span>
                      <strong>USA (Domestic Only)</strong>
                    </div>
                  </div>

                  <div style={styles.calcGrid} style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '6px', margin: '1rem 0' }}>
                    <div style={styles.calcRow}>
                      <span>Original Loan Capital:</span>
                      <strong>${loan.principal.toFixed(2)}</strong>
                    </div>
                    <div style={styles.calcRow}>
                      <span>Origination Service Fee (Collected):</span>
                      <span style={{ color: '#f43f5e' }}>-${loan.upfront_fee.toFixed(2)}</span>
                    </div>
                    <div style={styles.calcRow}>
                      <span>Borrower Total Settlement (Due):</span>
                      <strong>${loan.total_payback.toFixed(2)}</strong>
                    </div>
                    <div style={styles.calcRow}>
                      <span>Lender Yield Payback:</span>
                      <strong style={{ color: '#10b981' }}>$530.00</strong>
                    </div>
                    <div style={styles.calcRow}>
                      <span>Platform Spread Fee (Due):</span>
                      <strong style={{ color: '#f43f5e' }}>$7.50</strong>
                    </div>
                  </div>

                  {loan.status === 'active' && isBorrower && (
                    <button
                      onClick={() => handleRepayLoan(loan.loan_id)}
                      className="btn-primary"
                      style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}
                    >
                      Repay Loan Pool ($537.50)
                    </button>
                  )}

                  {loan.status === 'active' && isLender && (
                    <div style={{ fontSize: '0.85rem', color: '#a3a3a3', fontStyle: 'italic', marginTop: '0.5rem' }}>
                      ⏳ Servicing active. Yield and principal return will deposit automatically upon borrower repay.
                    </div>
                  )}

                  {loan.status === 'paid_off' && (
                    <div style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.5rem' }}>
                      ✓ Note fully paid off. Principal returned & servicing fee sweeps complete.
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeSubTab === 'ledger' && (
        <div style={styles.grid}>
          {/* PLATFORM REVENUE SUMMARY */}
          <div className="glass-panel" style={{ ...styles.card, flex: 0.8 }}>
            <h3 style={styles.cardTitle}>📊 Platform Revenue Summary</h3>
            <p style={styles.cardDesc}>Servicing audit ledger tracking 1.5% origination fees and 1.5% servicing spreads.</p>
            
            <div style={styles.revenueGrid}>
              <div style={styles.revenueCard}>
                <span>Origination Revenue</span>
                <strong style={{ color: '#ffffff' }}>${upfrontFeeTotal.toFixed(2)}</strong>
                <span style={{ fontSize: '0.7rem', color: '#737373' }}>1.5% at origination</span>
              </div>
              <div style={styles.revenueCard}>
                <span>Servicing Spread Revenue</span>
                <strong style={{ color: '#ffffff' }}>${spreadTotal.toFixed(2)}</strong>
                <span style={{ fontSize: '0.7rem', color: '#737373' }}>1.5% at settlement</span>
              </div>
            </div>

            <div style={styles.totalRevenueHighlight}>
              <span>Cumulative Platform Earnings</span>
              <strong>${totalRevenue.toFixed(2)}</strong>
            </div>
          </div>

          {/* AUDIT LOGS */}
          <div className="glass-panel" style={styles.card}>
            <h3 style={styles.cardTitle}>📜 Financial Audit Logs</h3>
            <p style={styles.cardDesc}>Compliance transaction trace representing exact scenario entries.</p>

            <div style={styles.auditTimeline}>
              <div style={styles.timelineItem}>
                <div style={styles.itemDot} />
                <div style={styles.itemContent}>
                  <strong>$7.50 Origination Fee Captured</strong>
                  <span>Allocated to clearing registry upon initial disbursement.</span>
                  <span style={styles.timestamp}>Status: Complete</span>
                </div>
              </div>
              <div style={styles.timelineItem}>
                <div style={styles.itemDot} />
                <div style={styles.itemContent}>
                  <strong>$7.50 Servicing Spread Captured</strong>
                  <span>Swept from total payback of $537.50 upon settlement.</span>
                  <span style={styles.timestamp}>Status: Complete</span>
                </div>
              </div>
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
  subTabContainer: {
    display: 'flex',
    gap: '1.5rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    paddingBottom: '0.5rem'
  },
  subTabButton: {
    background: 'none',
    border: 'none',
    padding: '0.5rem 0.25rem',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    outline: 'none',
    transition: 'all 0.2s ease',
  },
  successToast: {
    background: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    color: '#10b981',
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
  walletState: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '8px',
    padding: '1rem 1.25rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  walletLabel: {
    fontSize: '0.75rem',
    color: '#737373',
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  walletBalance: {
    fontSize: '1.4rem',
    fontWeight: '800',
    color: '#ffffff',
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
  sliderContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  slider: {
    width: '100%',
    accentColor: '#ffffff',
    cursor: 'pointer',
  },
  sliderValues: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.8rem',
    color: '#737373',
  },
  calculatorCard: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: '8px',
    padding: '1rem',
  },
  calcTitle: {
    fontSize: '0.8rem',
    fontWeight: '700',
    color: '#a3a3a3',
    marginBottom: '0.5rem',
  },
  calcGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  calcRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.82rem',
    color: '#737373',
  },
  needCard: {
    background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '8px',
    padding: '1.25rem',
  },
  needBadge: {
    fontSize: '0.65rem',
    fontWeight: '800',
    color: '#f43f5e',
    background: 'rgba(244,63,94,0.1)',
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
    width: 'fit-content',
    letterSpacing: '0.05em',
  },
  offersSection: {
    marginTop: '0.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  sectionTitle: {
    fontSize: '1rem',
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: '0.25rem',
  },
  emptyOffers: {
    padding: '2rem 1.5rem',
    textAlign: 'center',
    color: '#525252',
    fontStyle: 'italic',
    fontSize: '0.85rem',
    background: 'rgba(255,255,255,0.01)',
    border: '1px dashed rgba(255,255,255,0.05)',
    borderRadius: '8px',
  },
  loanOfferCard: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.04)',
    borderRadius: '8px',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  offerHead: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  offerBody: {
    display: 'flex',
    gap: '1.5rem',
    background: 'rgba(0,0,0,0.15)',
    padding: '0.75rem 1rem',
    borderRadius: '6px',
  },
  offerCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.15rem',
    flex: 1,
    fontSize: '0.75rem',
    color: '#737373',
  },
  offerActions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
  },
  counterGroup: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
  },
  counterInput: {
    width: '60px',
    background: '#000000',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '4px',
    padding: '0.25rem 0.5rem',
    color: '#ffffff',
    fontSize: '0.85rem',
    outline: 'none',
  },
  counterPendingBadge: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: '6px',
    padding: '0.5rem 0.75rem',
    fontSize: '0.82rem',
    color: '#a3a3a3',
    textAlign: 'center',
  },
  statusBadge: (status) => {
    let background = 'rgba(255,255,255,0.05)';
    let color = '#737373';
    if (status === 'active') {
      background = 'rgba(16, 185, 129, 0.1)';
      color = '#10b981';
    } else if (status === 'countered') {
      background = 'rgba(245, 158, 11, 0.1)';
      color = '#f59e0b';
    } else if (status === 'paid_off') {
      background = 'rgba(59, 130, 246, 0.1)';
      color = '#3b82f6';
    }
    return {
      fontSize: '0.68rem',
      fontWeight: '800',
      padding: '0.2rem 0.5rem',
      borderRadius: '4px',
      background,
      color,
      letterSpacing: '0.05em',
    };
  },
  loanList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  loanContractCard: {
    background: 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.005) 100%)',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: '8px',
    padding: '1.75rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  contractHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    paddingBottom: '0.75rem',
  },
  contractMeta: {
    display: 'flex',
    gap: '2rem',
    flexWrap: 'wrap',
    marginTop: '0.25rem',
  },
  metaBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    fontSize: '0.7rem',
    color: '#737373',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  revenueGrid: {
    display: 'flex',
    gap: '1rem',
    width: '100%',
  },
  revenueCard: {
    flex: 1,
    background: 'rgba(255,255,255,0.01)',
    border: '1px solid rgba(255,255,255,0.04)',
    borderRadius: '6px',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    fontSize: '0.8rem',
    color: '#737373',
  },
  totalRevenueHighlight: {
    background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(16,185,129,0.02) 100%)',
    border: '1px solid rgba(16,185,129,0.2)',
    borderRadius: '6px',
    padding: '1.25rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '0.5rem',
    fontSize: '0.9rem',
    color: '#a3a3a3',
  },
  auditTimeline: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    position: 'relative',
    paddingLeft: '1rem',
    borderLeft: '1px solid rgba(255,255,255,0.08)',
  },
  timelineItem: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'flex-start',
    position: 'relative',
  },
  itemDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#10b981',
    position: 'absolute',
    left: '-14px',
    top: '5px',
    boxShadow: '0 0 8px #10b981',
  },
  itemContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    fontSize: '0.85rem',
    color: '#a3a3a3',
  },
  timestamp: {
    fontSize: '0.72rem',
    color: '#10b981',
    fontWeight: '600',
    marginTop: '0.15rem',
  }
};
