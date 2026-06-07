'use client';

import { useState, useEffect, useRef } from 'react';

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
  const [isCustomRate, setIsCustomRate] = useState(false);
  const [customRate, setCustomRate] = useState(8.5);

  // Promissory Note e-Sign States
  const [selectedLoanForExecution, setSelectedLoanForExecution] = useState(null);
  const [sigWizardStep, setSigWizardStep] = useState(1);
  const [signatureDataUrl, setSignatureDataUrl] = useState('');
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Drawing event handlers for P2P Promissory Note
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#191919';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ctx = canvas.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (canvasRef.current) {
      setSignatureDataUrl(canvasRef.current.toDataURL());
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureDataUrl('');
  };

  const startDrawingTouch = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const offsetX = touch.clientX - rect.left;
    const offsetY = touch.clientY - rect.top;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const drawTouch = (e) => {
    e.preventDefault();
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const offsetX = touch.clientX - rect.left;
    const offsetY = touch.clientY - rect.top;
    const ctx = canvas.getContext('2d');
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
  };

  const handleStartExecuteWizard = (loan) => {
    setSelectedLoanForExecution(loan);
    setSigWizardStep(1);
    setSignatureDataUrl('');
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleExecuteLoanWithSignature = (e) => {
    e.preventDefault();
    if (!signatureDataUrl) return;

    const res = executeP2PLoan(selectedLoanForExecution.loan_id, signatureDataUrl);
    if (res.success) {
      setSigWizardStep(2);
      if (refreshUserData) refreshUserData();
    } else {
      setErrorMsg(res.error || 'Failed to execute Promissory Note.');
    }
  };

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

    const activeRate = isCustomRate ? customRate : rate;
    const res = offerP2PLoan(customer.customer_id, targetBorrowerId, principal, activeRate);
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
    <>
      <div style={styles.container}>
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
            color: activeSubTab === 'marketplace' ? 'var(--border-accent)' : 'var(--color-text-secondary)',
            borderBottom: activeSubTab === 'marketplace' ? '2px solid var(--border-accent)' : '2px solid transparent'
          }}
        >
          💱 Credit Registry
        </button>
        <button
          onClick={() => setActiveSubTab('active_loans')}
          style={{
            ...styles.subTabButton,
            color: activeSubTab === 'active_loans' ? 'var(--border-accent)' : 'var(--color-text-secondary)',
            borderBottom: activeSubTab === 'active_loans' ? '2px solid var(--border-accent)' : '2px solid transparent'
          }}
        >
          📂 Portfolio Debt Slices ({userLoans.length})
        </button>
        <button
          onClick={() => setActiveSubTab('ledger')}
          style={{
            ...styles.subTabButton,
            color: activeSubTab === 'ledger' ? 'var(--border-accent)' : 'var(--color-text-secondary)',
            borderBottom: activeSubTab === 'ledger' ? '2px solid var(--border-accent)' : '2px solid transparent'
          }}
        >
          📊 Revenue Audit Ledger
        </button>
      </div>

      {activeSubTab === 'marketplace' && (
        <div style={styles.grid} className="animate-fade-in-up">
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
                      <strong style={{ fontSize: '1.1rem', color: 'var(--color-text-primary)' }}>${principal}</strong>
                      <span>$10,000</span>
                    </div>
                  </div>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Borrower Gross Interest Rate (Yield Profile)</label>
                  <select
                    value={isCustomRate ? 'custom' : rate}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'custom') {
                        setIsCustomRate(true);
                      } else {
                        setIsCustomRate(false);
                        setRate(parseFloat(val));
                      }
                    }}
                    style={styles.select}
                  >
                    <option value="6.0">6.0% Gross (4.5% Net Lender Yield)</option>
                    <option value="7.5">7.5% Gross (6.0% Net Lender Yield) - Recommended</option>
                    <option value="9.0">9.0% Gross (7.5% Net Lender Yield)</option>
                    <option value="custom">Custom Gross Yield...</option>
                  </select>
                </div>

                {isCustomRate && (
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Enter Custom Gross Interest Rate (%)</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <input
                        type="number"
                        step="0.1"
                        min="1"
                        max="30"
                        value={customRate}
                        onChange={(e) => setCustomRate(parseFloat(e.target.value) || 0)}
                        style={{ ...styles.select, width: '120px' }}
                      />
                      <span style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
                        % Gross Rate ({Math.max(0, (customRate - 1.5).toFixed(2))}% Net Lender Yield after spread)
                      </span>
                    </div>
                  </div>
                )}

                {/* Yield calculator widgets */}
                <div style={styles.calculatorCard}>
                  <div style={styles.calcTitle}>🧮 Spread-Based Yield Split</div>
                  <div style={styles.calcGrid}>
                    <div style={styles.calcRow}>
                      <span>Borrower Total Payment:</span>
                      <strong>${(principal * (1 + (isCustomRate ? customRate : rate) / 100)).toFixed(2)}</strong>
                    </div>
                    <div style={styles.calcRow}>
                      <span>Peerbridge Servicing Spread (1.5%):</span>
                      <span style={{ color: '#f43f5e', fontWeight: '600' }}>-${(principal * 0.015).toFixed(2)}</span>
                    </div>
                    <div style={styles.calcRow}>
                      <span>Lender Net Principal + Yield ({((isCustomRate ? customRate : rate) - 1.5).toFixed(1)}%):</span>
                      <span style={{ color: '#10b981', fontWeight: '700' }}>${(principal + principal * ((isCustomRate ? customRate : rate) - 1.5) / 100).toFixed(2)}</span>
                    </div>
                    <div style={styles.calcRow}>
                      <span>Lender Upfront Entry Fee (1.5%):</span>
                      <span>${(principal * 0.015).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Local Feedback Toast inside Card above submit button */}
                {successMsg && <div style={{ ...styles.successToast, marginTop: '1rem', padding: '0.75rem 1rem' }}>✨ {successMsg}</div>}
                {errorMsg && <div style={{ ...styles.errorToast, marginTop: '1rem', padding: '0.75rem 1rem' }}>⚠ {errorMsg}</div>}

                <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                  {successMsg ? '✓ Offer Submitted successfully!' : 'Submit Debt Syndicate Offer'}
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
                <strong style={{ display: 'block', fontSize: '1.2rem', color: 'var(--color-text-primary)', margin: '0.5rem 0' }}>Tonin Logistics expansion pool</strong>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', margin: 0 }}>Targeting $500.00 senior secured loan to scale green cold storage container units.</p>
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
                          <strong style={{ color: 'var(--color-text-primary)' }}>{loan.lender_name}</strong>
                          <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', display: 'block' }}>Ref: {loan.loan_id.toUpperCase()}</span>
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
                            onClick={() => handleStartExecuteWizard(loan)}
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
                          <strong style={{ color: 'var(--color-text-primary)' }}>Borrower: {loan.borrower_name}</strong>
                          <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', display: 'block' }}>Ref: {loan.loan_id.toUpperCase()}</span>
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
                          <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                            Borrower countered rate to: <strong style={{ color: 'var(--color-text-primary)' }}>{loan.countered_rate}%</strong>
                          </div>
                          <button
                            onClick={() => handleStartExecuteWizard(loan)}
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
        <div style={styles.card} className="glass-panel animate-fade-in-up">
          <h3 style={styles.cardTitle}>📁 Active Lending Portfolio</h3>
          <p style={styles.cardDesc}>Legally binding debt agreements cleared and servicing payments.</p>

          <div style={styles.loanList}>
            {userLoans.filter(l => l.status === 'active' || l.status === 'paid_off').length === 0 ? (
              <div style={styles.emptyOffers}>No active debt contracts currently registered on this node.</div>
            ) : (
              userLoans.filter(l => l.status === 'active' || l.status === 'paid_off').map(loan => (
                <div key={loan.loan_id} style={styles.loanContractCard}>
                  <div style={styles.contractHeader}>
                    <div>
                      <strong style={{ color: 'var(--color-text-primary)', fontSize: '1.1rem' }}>P2P Commercial Note Agreement</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block', marginTop: '0.15rem' }}>Contract Hash ID: {loan.loan_id.toUpperCase()}</span>
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

                  <div style={styles.calcGrid} style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: '6px', margin: '1rem 0' }}>
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
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontStyle: 'italic', marginTop: '0.5rem' }}>
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
        <div style={styles.grid} className="animate-fade-in-up">
          {/* PLATFORM REVENUE SUMMARY */}
          <div className="glass-panel" style={{ ...styles.card, flex: 0.8 }}>
            <h3 style={styles.cardTitle}>📊 Platform Revenue Summary</h3>
            <p style={styles.cardDesc}>Servicing audit ledger tracking 1.5% origination fees and 1.5% servicing spreads.</p>
            
            <div style={styles.revenueGrid}>
              <div style={styles.revenueCard}>
                <span>Origination Revenue</span>
                <strong style={{ color: 'var(--color-text-primary)' }}>${upfrontFeeTotal.toFixed(2)}</strong>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>1.5% at origination</span>
              </div>
              <div style={styles.revenueCard}>
                <span>Servicing Spread Revenue</span>
                <strong style={{ color: 'var(--color-text-primary)' }}>${spreadTotal.toFixed(2)}</strong>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>1.5% at settlement</span>
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

      {/* Promissory Note e-Sign Signature Wizard */}
      {selectedLoanForExecution && (
        <div style={styles.modalBackdrop}>
          <div 
            className="glass-panel glow-accent-border animate-fade-in-up" 
            style={{ 
              ...styles.modalCard, 
              maxWidth: sigWizardStep === 2 ? '640px' : '480px',
              width: '95%',
              background: 'var(--bg-secondary)',
              backdropFilter: 'blur(20px)',
              border: '1px solid var(--border-color)',
              padding: '2.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <h3 style={styles.modalTitle}>
                {sigWizardStep === 1 && `🏛 SEC Reg D Promissory Note Wizard`}
                {sigWizardStep === 2 && `🎉 Credit Pool Disbursed!`}
              </h3>
              <button 
                onClick={() => {
                  setSelectedLoanForExecution(null);
                  setSigWizardStep(1);
                  setSignatureDataUrl('');
                }}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {sigWizardStep === 1 && (
              <form onSubmit={handleExecuteLoanWithSignature} style={styles.modalForm}>
                <p style={styles.modalSub}>
                  Please review the dynamically compiled SEC Reg D Commercial Promissory Note below and draw your signature to authorize the placement.
                </p>

                {/* Promissory Note Textbox */}
                <div style={{
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  fontSize: '0.8rem',
                  color: 'var(--color-text-secondary)',
                  lineHeight: '1.5',
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-line'
                }}>
                  {`PEERBRIDGE CREDIT PLACEMENT REGISTRY
                  SEC REGULATION D COMMERCIAL PROMISSORY NOTE

                  This Promissory Note ("Note") is executed as of ${new Date().toLocaleDateString()} between the undersigned parties:
                  
                  LENDER: ${selectedLoanForExecution.lender_name}
                  BORROWER: ${selectedLoanForExecution.borrower_name}

                  1. Principal Advance: The Lender hereby agrees to advance a principal sum of $${selectedLoanForExecution.principal.toLocaleString()} to the Borrower at an annual gross borrower rate of ${(selectedLoanForExecution.countered_rate || selectedLoanForExecution.rate)}%.
                  
                  2. Payback Terms: The Borrower covenants and agrees to repay the full principal plus accrued interest totaling $${selectedLoanForExecution.total_payback.toLocaleString()} in a single bullet payment at the end of the 6-month term.
                  
                  3. Spread & Servicing: Peer Bridge acts as secure placement broker, retaining a 1.5% borrower origination fee ($${(selectedLoanForExecution.principal * 0.015).toFixed(2)}) from proceeds, and collecting a 1.0% servicing spread sweep upon maturity.
                  
                  4. Tamper-Proof Cryptographic Lock: This Note is registered under Regulation D rules, signed, and stamped with a unique SHA-256 audit block hash.`}
                </div>

                {/* signature drawing canvas pad */}
                <div style={styles.inputGroup}>
                  <label style={styles.label}>🖋 Authorized Signature Pad (Draw with Mouse/Touch)</label>
                  <div style={{ position: 'relative' }}>
                    <canvas
                      ref={canvasRef}
                      width={400}
                      height={120}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawingTouch}
                      onTouchMove={drawTouch}
                      onTouchEnd={stopDrawing}
                      style={{
                        background: 'var(--bg-primary)',
                        border: '1px dashed var(--border-color)',
                        borderRadius: '6px',
                        cursor: 'crosshair',
                        width: '100%',
                        height: '120px',
                        display: 'block',
                      }}
                    />
                    {signatureDataUrl && (
                      <div style={{ position: 'absolute', bottom: 5, right: 5, fontSize: '0.65rem', color: '#10b981', background: 'var(--bg-primary)', padding: '2px 5px', borderRadius: '3px' }}>
                        ✓ Capture Active
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.35rem' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>Use mouse or trackpad to sign in the box.</span>
                    <button
                      type="button"
                      onClick={clearSignature}
                      style={{ background: 'none', border: 'none', color: '#f43f5e', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      ✕ Clear Canvas
                    </button>
                  </div>
                </div>

                {errorMsg && <div style={styles.errorToast}>{errorMsg}</div>}

                <div style={styles.modalButtons}>
                  <button
                    type="button"
                    onClick={() => setSelectedLoanForExecution(null)}
                    className="btn-secondary"
                    style={{ flex: 1 }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    style={{ flex: 2 }}
                    disabled={!signatureDataUrl}
                  >
                    Sign & Disburse Funds
                  </button>
                </div>
              </form>
            )}

            {sigWizardStep === 2 && (
              <div style={{ textAlign: 'center', padding: '1.5rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(16,185,129,0.1)',
                  border: '2px solid #10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  color: '#10b981',
                  boxShadow: '0 0 15px rgba(16,185,129,0.3)',
                }}>
                  ✓
                </div>
                <div>
                  <h4 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>P2P Promissory Note Executed!</h4>
                  <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', lineHeight: '1.5', maxWidth: '360px' }}>
                    The commercial Promissory Note is now cryptographically locked with a unique SHA-256 compliance hash. Duplicate executed copies have been deposited in the **Document Vault** for both lender and borrower.
                  </p>
                </div>

                {/* Gold certificate mockup inside success dialog */}
                <div style={{
                  border: '2px solid #3b82f6',
                  background: 'linear-gradient(135deg, rgba(20,20,20,0.95) 0%, rgba(10,10,10,0.99) 100%)',
                  boxShadow: '0 10px 30px rgba(59, 130, 246, 0.15)',
                  padding: '1.25rem',
                  borderRadius: '8px',
                  width: '100%',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  position: 'relative'
                }}>
                  <div style={{ position: 'absolute', top: 5, right: 5, fontSize: '0.55rem', color: '#3b82f6', fontWeight: 'bold', border: '1px solid #3b82f6', padding: '1px 3px', borderRadius: '3px' }}>
                    SEC REG D
                  </div>
                  <span style={{ fontSize: '0.65rem', color: '#3b82f6', fontWeight: '700', letterSpacing: '0.1em' }}>PEERBRIDGE CREDIT NETWORK</span>
                  <strong style={{ color: 'var(--color-text-primary)', fontSize: '0.9rem' }}>COMMERCIAL PROMISSORY NOTE CERTIFICATE</strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>LENDER: <strong>{selectedLoanForExecution.lender_name}</strong></span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>BORROWER: <strong>{selectedLoanForExecution.borrower_name}</strong></span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>PRINCIPAL TARGET: <strong>${selectedLoanForExecution.principal.toFixed(2)}</strong></span>
                  <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem' }}>RATE: <strong>{(selectedLoanForExecution.countered_rate || selectedLoanForExecution.rate)}% Gross Yield</strong></span>
                  <span style={{ fontSize: '0.58rem', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>SEC SHA256 BLOCK: 77f8aa8810eb0cf83b77abffea56bc18</span>
                </div>

                <button
                  onClick={() => {
                    setSelectedLoanForExecution(null);
                    setSigWizardStep(1);
                    setSignatureDataUrl('');
                  }}
                  className="btn-primary"
                  style={{ width: '100%' }}
                >
                  Close & Return to Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

const styles = {
  modalBackdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.8)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
  },
  modalCard: {
    width: '100%',
    maxWidth: '480px',
    padding: '2.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  modalTitle: {
    fontSize: '1.5rem',
    fontWeight: '800',
  },
  modalSub: {
    fontSize: '0.9rem',
    color: 'var(--color-text-secondary)',
    lineHeight: '1.4',
  },
  modalForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  modalButtons: {
    display: 'flex',
    gap: '1rem',
  },
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
    color: 'var(--color-text-secondary)',
    marginTop: '0.25rem',
  },
  subTabContainer: {
    display: 'flex',
    gap: '1.5rem',
    borderBottom: '1px solid var(--border-color)',
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
    color: 'var(--color-text-secondary)',
    lineHeight: '1.4',
  },
  walletState: {
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '1rem 1.25rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  walletLabel: {
    fontSize: '0.75rem',
    color: 'var(--color-text-muted)',
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  walletBalance: {
    fontSize: '1.4rem',
    fontWeight: '800',
    color: 'var(--color-text-primary)',
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
    color: 'var(--color-text-muted)',
    textTransform: 'uppercase',
  },
  select: {
    width: '100%',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    padding: '0.7rem 1rem',
    color: 'var(--color-text-primary)',
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
    color: 'var(--color-text-muted)',
  },
  calculatorCard: {
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '1rem',
  },
  calcTitle: {
    fontSize: '0.8rem',
    fontWeight: '700',
    color: 'var(--color-text-secondary)',
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
    color: 'var(--color-text-muted)',
  },
  needCard: {
    background: 'linear-gradient(135deg, var(--border-color) 0%, var(--border-color) 100%)',
    border: '1px solid var(--border-color)',
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
    color: 'var(--color-text-primary)',
    marginBottom: '0.25rem',
  },
  emptyOffers: {
    padding: '2rem 1.5rem',
    textAlign: 'center',
    color: 'var(--color-text-muted)',
    fontStyle: 'italic',
    fontSize: '0.85rem',
    background: 'var(--bg-primary)',
    border: '1px dashed var(--border-color)',
    borderRadius: '8px',
  },
  loanOfferCard: {
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
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
    color: 'var(--color-text-muted)',
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
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: '4px',
    padding: '0.25rem 0.5rem',
    color: 'var(--color-text-primary)',
    fontSize: '0.85rem',
    outline: 'none',
  },
  counterPendingBadge: {
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    padding: '0.5rem 0.75rem',
    fontSize: '0.82rem',
    color: 'var(--color-text-secondary)',
    textAlign: 'center',
  },
  statusBadge: (status) => {
    let background = 'var(--border-color)';
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
    background: 'linear-gradient(135deg, var(--border-color) 0%, var(--border-color) 100%)',
    border: '1px solid var(--border-color)',
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
    borderBottom: '1px solid var(--border-color)',
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
    color: 'var(--color-text-muted)',
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
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    fontSize: '0.8rem',
    color: 'var(--color-text-muted)',
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
    color: 'var(--color-text-secondary)',
  },
  auditTimeline: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    position: 'relative',
    paddingLeft: '1rem',
    borderLeft: '1px solid var(--border-color)',
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
    color: 'var(--color-text-secondary)',
  },
  timestamp: {
    fontSize: '0.72rem',
    color: '#10b981',
    fontWeight: '600',
    marginTop: '0.15rem',
  }
};
