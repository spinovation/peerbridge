'use client';

import { useState, useEffect, useRef } from 'react';

export default function InvestorModule({ state }) {
  const { 
    campaigns, 
    investInCampaign, 
    portfolio, 
    walletBalance, 
    user, 
    investorProfile, 
    updateInvestorProfile 
  } = state;

  const [subTab, setSubTab] = useState('marketplace'); // marketplace, portfolio, profile, diligence
  
  // Investment states
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [investAmount, setInvestAmount] = useState('1000');
  const [investError, setInvestError] = useState('');
  const [investSuccess, setInvestSuccess] = useState('');

  // SAFE Placement Wizard States
  const [wizardStep, setWizardStep] = useState(1);
  const [signatureDataUrl, setSignatureDataUrl] = useState('');
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [offeringTypeFilter, setOfferingTypeFilter] = useState('equity');

  // Drawing event handlers
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#ffffff';
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

  // Investor Profile Form States (Table #5)
  const [investorType, setInvestorType] = useState(investorProfile.investor_type || 'angel');
  const [minRange, setMinRange] = useState(investorProfile.investment_range?.min || 1000);
  const [maxRange, setMaxRange] = useState(investorProfile.investment_range?.max || 50000);
  const [riskAppetite, setRiskAppetite] = useState(investorProfile.risk_appetite || 'medium');
  const [preferredIndustries, setPreferredIndustries] = useState(investorProfile.preferred_industries || []);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Diligence checklist states
  const [diligenceList, setDiligenceList] = useState({
    secFormC: true,
    legalAudit: false,
    capTableReview: true,
    techPatentVerification: false,
    backgroundChecksVerified: true
  });

  // Sync state if context changes
  useEffect(() => {
    if (investorProfile) {
      setTimeout(() => {
        setInvestorType(investorProfile.investor_type || 'angel');
        setMinRange(investorProfile.investment_range?.min || 1000);
        setMaxRange(investorProfile.investment_range?.max || 50000);
        setRiskAppetite(investorProfile.risk_appetite || 'medium');
        setPreferredIndustries(investorProfile.preferred_industries || []);
      }, 0);
    }
  }, [investorProfile]);

  const handleOpenInvest = (camp) => {
    setSelectedCampaign(camp);
    setInvestAmount(camp.minInvestment.toString());
    setInvestError('');
    setInvestSuccess('');
  };

  useEffect(() => {
    if (state.targetCampaignId) {
      const camp = campaigns.find(c => c.id === state.targetCampaignId);
      if (camp) {
        setTimeout(() => {
          setSubTab('marketplace');
          handleOpenInvest(camp);
        }, 0);
      }
      setTimeout(() => {
        state.setTargetCampaignId(null);
      }, 0);
    }
  }, [state.targetCampaignId, campaigns]);

  const handleInvestSubmit = (e) => {
    e.preventDefault();
    if (!selectedCampaign) return;

    const res = investInCampaign(selectedCampaign.id, investAmount, signatureDataUrl);
    if (res.success) {
      setInvestSuccess(`SAFE Placement successfully executed! Tamper-proof certificate generated.`);
      setWizardStep(3);
    } else {
      setInvestError(res.error);
    }
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateInvestorProfile({
      investor_type: investorType,
      investment_range: {
        min: parseFloat(minRange),
        max: parseFloat(maxRange),
        currency: 'USD'
      },
      risk_appetite: riskAppetite,
      preferred_industries: preferredIndustries
    });
    setIsEditingProfile(false);
  };

  const handleToggleIndustry = (ind) => {
    if (preferredIndustries.includes(ind)) {
      setPreferredIndustries(preferredIndustries.filter(i => i !== ind));
    } else {
      setPreferredIndustries([...preferredIndustries, ind]);
    }
  };

  // Helper to draw portfolio allocation SVG
  const renderPortfolioSVG = () => {
    const cash = walletBalance;
    const assets = portfolio.reduce((acc, curr) => acc + curr.amount_invested, 0);
    const total = cash + assets;
    
    if (total === 0) {
      return (
        <svg viewBox="0 0 100 100" style={styles.svg}>
          <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="15" />
          <circle cx="50" cy="50" r="28" fill="#000000" />
        </svg>
      );
    }

    const cashPct = (cash / total) * 100;
    const assetPct = (assets / total) * 100;

    const strokeCash = (cashPct / 100) * (2 * Math.PI * 40);
    const strokeAsset = (assetPct / 100) * (2 * Math.PI * 40);

    return (
      <svg viewBox="0 0 100 100" style={styles.svg}>
        <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="15" />
        {/* Cash Circle (White) */}
        {cash > 0 && (
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="transparent"
            stroke="#ffffff"
            strokeWidth="15"
            strokeDasharray={`${strokeCash} ${2 * Math.PI * 40}`}
            strokeDashoffset={(2 * Math.PI * 40) * 0.25}
          />
        )}
        {/* Assets Circle (Dark Gray) */}
        {assets > 0 && (
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="transparent"
            stroke="#525252"
            strokeWidth="15"
            strokeDasharray={`${strokeAsset} ${2 * Math.PI * 40}`}
            strokeDashoffset={-strokeCash + (2 * Math.PI * 40) * 0.25}
          />
        )}
        <circle cx="50" cy="50" r="28" fill="#000000" />
      </svg>
    );
  };

  const industriesList = ['CleanTech', 'MedTech', 'Fintech', 'AI/ML', 'SaaS', 'DeepTech'];

  return (
    <>
      <div style={styles.container}>
        {/* Subnavigation Bar */}
        <div style={styles.navRow}>
        <div style={styles.tabButtons}>
          <button
            onClick={() => setSubTab('marketplace')}
            style={subTab === 'marketplace' ? styles.tabActive : styles.tabInactive}
          >
            🌐 Discovery Marketplace
          </button>
          <button
            onClick={() => setSubTab('portfolio')}
            style={subTab === 'portfolio' ? styles.tabActive : styles.tabInactive}
          >
            📈 Portfolio Asset Tracker
          </button>
          <button
            onClick={() => setSubTab('profile')}
            style={subTab === 'profile' ? styles.tabActive : styles.tabInactive}
          >
            👤 Investor Profile (Table #5)
          </button>
          <button
            onClick={() => setSubTab('diligence')}
            style={subTab === 'diligence' ? styles.tabActive : styles.tabInactive}
          >
            📋 Due Diligence Workspace
          </button>
        </div>

        <div style={styles.walletBadge}>
          Wallet Balance: <strong>${walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
        </div>
      </div>

      {/* Main View Render */}
      {subTab === 'marketplace' && (
        <div style={styles.marketplaceView} className="animate-fade-in-up">
          <div style={styles.introHeader}>
            <h2 style={styles.title}>Capital Placement Offerings</h2>
            <p style={styles.sub}>Vetted private placement campaigns open to accredited Peer Bridge members. Verify KYC to unlock transactions.</p>
          </div>

          {/* HSL Segment Pills switcher */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
            padding: '0.4rem',
            borderRadius: '30px',
            width: 'fit-content',
            marginBottom: '1.5rem'
          }}>
            <button
              onClick={() => setOfferingTypeFilter('equity')}
              style={{
                background: offeringTypeFilter === 'equity' ? '#ffffff' : 'transparent',
                color: offeringTypeFilter === 'equity' ? '#000000' : '#a3a3a3',
                border: 'none',
                padding: '0.5rem 1.25rem',
                borderRadius: '25px',
                fontSize: '0.85rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.25s ease'
              }}
            >
              📈 Equity Placements ({campaigns.filter(c => c.offering_type !== 'debt').length})
            </button>
            <button
              onClick={() => setOfferingTypeFilter('debt')}
              style={{
                background: offeringTypeFilter === 'debt' ? '#ffffff' : 'transparent',
                color: offeringTypeFilter === 'debt' ? '#000000' : '#a3a3a3',
                border: 'none',
                padding: '0.5rem 1.25rem',
                borderRadius: '25px',
                fontSize: '0.85rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.25s ease'
              }}
            >
              🏛 P2P Debt Placements ({campaigns.filter(c => c.offering_type === 'debt').length})
            </button>
          </div>

          <div style={styles.grid}>
            {campaigns
              .filter(c => {
                if (offeringTypeFilter === 'debt') {
                  return c.offering_type === 'debt';
                } else {
                  return c.offering_type !== 'debt';
                }
              })
              .map((camp) => {
                const pct = Math.min(100, Math.round((camp.raised / camp.target) * 100));
                const isDebt = camp.offering_type === 'debt';
                return (
                  <div key={camp.id} className="glass-panel" style={styles.campCard}>
                    <div style={styles.campHeader}>
                      <span style={{
                        ...styles.campSector,
                        background: isDebt ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                        color: isDebt ? '#3b82f6' : '#a3a3a3'
                      }}>
                        {isDebt ? '🏛 P2P Note' : camp.category}
                      </span>
                      <span style={styles.campActive}>Active Offering</span>
                    </div>
                    <h3 style={styles.campTitleText}>{camp.companyName}</h3>
                    <p style={styles.campTagline}>{camp.tagline}</p>
                    
                    <div style={styles.progressContainer}>
                      <div style={styles.progressBar}>
                        <div style={{ ...styles.progressFill, width: `${pct}%`, background: isDebt ? '#3b82f6' : '#ffffff' }}></div>
                      </div>
                      <div style={styles.progressLabelRow}>
                        <span>Funded: <strong>${camp.raised.toLocaleString()}</strong></span>
                        <span>{pct}% of ${camp.target.toLocaleString()}</span>
                      </div>
                    </div>

                    <div style={styles.cardInfoGrid}>
                      <div style={styles.infoCol}>
                        <span style={styles.infoLabel}>{isDebt ? 'Annual Rate' : 'Share Value'}</span>
                        <span style={styles.infoVal}>{isDebt ? `${camp.interest_rate}%` : `$${camp.sharePrice.toFixed(2)}`}</span>
                      </div>
                      <div style={styles.infoCol}>
                        <span style={styles.infoLabel}>{isDebt ? 'Term Months' : 'Min Entry'}</span>
                        <span style={styles.infoVal}>{isDebt ? `${camp.term_months}m` : `$${camp.minInvestment.toLocaleString()}`}</span>
                      </div>
                      <div style={styles.infoCol}>
                        <span style={styles.infoLabel}>{isDebt ? 'Net Yield' : 'Market Valuation'}</span>
                        <span style={{
                          ...styles.infoVal,
                          color: isDebt ? '#10b981' : '#ffffff'
                        }}>
                          {isDebt ? `${(camp.interest_rate - 1.5).toFixed(1)}%` : `$${(camp.valuation / 1000000).toFixed(2)}M`}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (isDebt) {
                          state.setActiveModule('lending');
                        } else {
                          handleOpenInvest(camp);
                        }
                      }}
                      className="btn-primary"
                      style={{
                        ...styles.investBtn,
                        background: isDebt ? 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)' : 'linear-gradient(135deg, #ffffff 0%, #737373 100%)',
                        color: isDebt ? '#ffffff' : '#000000',
                        border: isDebt ? '1px solid rgba(59, 130, 246, 0.4)' : 'none'
                      }}
                    >
                      {isDebt ? '🔑 Fund Commercial Note' : 'Invest in Campaign'}
                    </button>
                  </div>
                );
              })}
          </div>

          
        </div>
      )}

      {subTab === 'portfolio' && (
        <div style={styles.portfolioView} className="animate-fade-in-up">
          <div style={styles.introHeader}>
            <h2 style={styles.title}>Asset Portfolio Tracker</h2>
            <p style={styles.sub}>Analyze your private equity acquisitions, wallet distributions, and annual ROI calculations.</p>
          </div>

          <div style={styles.portfolioGrid}>
            {/* Visual Allocation Card */}
            <div className="glass-panel" style={styles.visualAllocationCard}>
              <h3 style={styles.panelTitle}>📊 Capital Allocation</h3>
              <p style={styles.panelDesc}>Visual overview of your active Peer Bridge assets.</p>
              
              <div style={styles.svgSection}>
                {renderPortfolioSVG()}
                <div style={styles.svgCenterText}>
                  <span style={styles.svgInnerLabel}>Net Worth</span>
                  <span style={styles.svgInnerVal}>
                    ${(walletBalance + portfolio.reduce((acc, curr) => acc + curr.amount_invested, 0)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>

              <div style={styles.legendContainer}>
                <div style={styles.legendItem}>
                  <div style={{ ...styles.legendBox, background: '#ffffff' }}></div>
                  <span style={styles.legendLabel}>Wallet Capital</span>
                  <span style={styles.legendVal}>${walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div style={styles.legendItem}>
                  <div style={{ ...styles.legendBox, background: '#525252' }}></div>
                  <span style={styles.legendLabel}>Startup Equity</span>
                  <span style={styles.legendVal}>${portfolio.reduce((acc, curr) => acc + curr.amount_invested, 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Portfolio Logs Table */}
            <div className="glass-panel" style={styles.investmentsTableCard}>
              <h3 style={styles.panelTitle}>📄 Private Placements Portfolio Ledger (Table #6)</h3>
              
              {portfolio.length === 0 ? (
                <div style={styles.emptyPortfolioBox}>
                  <p>You have not executed any investment transactions yet.</p>
                  <button onClick={() => setSubTab('marketplace')} className="btn-primary" style={{ marginTop: '1rem' }}>
                    Browse Offerings
                  </button>
                </div>
              ) : (
                <div style={styles.tableContainer}>
                  <table style={styles.table}>
                    <thead>
                      <tr style={styles.tr}>
                        <th style={styles.th}>Company Name</th>
                        <th style={styles.th}>Capital Placed</th>
                        <th style={styles.th}>Shares Purchased</th>
                        <th style={styles.th}>Avg Buy Price</th>
                        <th style={styles.th}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {portfolio.map((inv) => (
                        <tr key={inv.portfolio_id} style={styles.trItem}>
                          <td style={styles.tdBold}>{inv.companyName}</td>
                          <td style={styles.td}>${inv.amount_invested.toLocaleString()}</td>
                          <td style={styles.td}>{inv.shares.toLocaleString()} Shares</td>
                          <td style={styles.td}>${inv.sharePrice.toFixed(2)}</td>
                          <td style={styles.td}>
                            <span className="badge badge-verified" style={{ textTransform: 'capitalize' }}>{inv.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {subTab === 'profile' && (
        <div style={styles.profileView} className="animate-fade-in-up">
          <div style={styles.introHeader}>
            <h2 style={styles.title}>Investor Profile Sheet (Table #5)</h2>
            <p style={styles.sub}>Configure your preferred industry filters, risk tolerances, and accreditation limits linked to your database records.</p>
          </div>

          <div className="glass-panel" style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>👤 Database Record Ledger</h3>
              <button
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="btn-secondary"
                style={styles.editBtn}
              >
                {isEditingProfile ? 'Cancel Edit' : 'Edit Preferences'}
              </button>
            </div>

            {!isEditingProfile ? (
              <div style={styles.profileDetailsGrid}>
                <div style={styles.profileItem}>
                  <span style={styles.profileLabel}>Investor Type Classification</span>
                  <strong style={{ ...styles.profileVal, textTransform: 'capitalize' }}>{investorType} Investor</strong>
                </div>

                <div style={styles.profileItem}>
                  <span style={styles.profileLabel}>Risk Tolerance Level</span>
                  <strong style={{ ...styles.profileVal, textTransform: 'capitalize' }}>{riskAppetite} Risk</strong>
                </div>

                <div style={styles.profileItem}>
                  <span style={styles.profileLabel}>Investment Range Thresholds</span>
                  <strong style={styles.profileVal}>
                    ${minRange.toLocaleString()} Min – ${maxRange.toLocaleString()} Max
                  </strong>
                </div>

                <div style={styles.profileItem}>
                  <span style={styles.profileLabel}>Accreditation Compliance Status</span>
                  <strong style={{ 
                    ...styles.profileVal, 
                    color: investorProfile.accreditation_status ? '#ffffff' : '#f43f5e'
                  }}>
                    {investorProfile.accreditation_status ? '✓ KYC Verified & Accredited' : '⚠ Action Required: KYC Unverified'}
                  </strong>
                </div>

                <div style={{ ...styles.profileItem, gridColumn: 'span 2' }}>
                  <span style={styles.profileLabel}>Preferred Investment Sectors</span>
                  <div style={styles.preferredRow}>
                    {preferredIndustries.length === 0 ? (
                      <span style={styles.emptyText}>No sectors selected. Edit preferences to select sectors.</span>
                    ) : (
                      preferredIndustries.map((ind) => (
                        <span key={ind} style={styles.industryTag}>{ind}</span>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveProfile} style={styles.profileForm}>
                <div style={styles.formRow2Col}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Investor Type</label>
                    <select
                      value={investorType}
                      onChange={(e) => setInvestorType(e.target.value)}
                      style={styles.select}
                    >
                      <option value="angel">Angel Investor</option>
                      <option value="vc">Venture Capitalist</option>
                      <option value="institutional">Institutional Asset Manager</option>
                      <option value="group">Syndicate Group Manager</option>
                    </select>
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Risk Appetite</label>
                    <select
                      value={riskAppetite}
                      onChange={(e) => setRiskAppetite(e.target.value)}
                      style={styles.select}
                    >
                      <option value="low">Conservative (Low)</option>
                      <option value="medium">Balanced (Medium)</option>
                      <option value="high">Speculative (High)</option>
                    </select>
                  </div>
                </div>

                <div style={styles.formRow2Col}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Minimum Investment Capacity ($)</label>
                    <input
                      type="number"
                      value={minRange}
                      onChange={(e) => setMinRange(e.target.value)}
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Maximum Investment Capacity ($)</label>
                    <input
                      type="number"
                      value={maxRange}
                      onChange={(e) => setMaxRange(e.target.value)}
                      style={styles.input}
                    />
                  </div>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Toggle Preferred Sectors</label>
                  <div style={styles.preferredRow}>
                    {industriesList.map((ind) => {
                      const isSelected = preferredIndustries.includes(ind);
                      return (
                        <button
                          key={ind}
                          type="button"
                          onClick={() => handleToggleIndustry(ind)}
                          style={{
                            ...styles.sectorToggleBtn,
                            background: isSelected ? '#ffffff' : 'transparent',
                            color: isSelected ? '#000000' : '#ffffff',
                            border: isSelected ? '1px solid #ffffff' : '1px solid rgba(255,255,255,0.1)'
                          }}
                        >
                          {ind} {isSelected ? '✕' : '+'}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }}>
                  Sync Investor Profile
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {subTab === 'diligence' && (
        <div style={styles.diligenceView} className="animate-fade-in-up">
          <div style={styles.introHeader}>
            <h2 style={styles.title}>Due Diligence Compliance Workspace</h2>
            <p style={styles.sub}>Check off compliance parameters, review filing dates, and inspect audits before committing investment assets.</p>
          </div>

          <div className="glass-panel" style={styles.diligenceCard}>
            <h3 style={styles.panelTitle}>📂 Form C SEC Filing Checklist</h3>
            <p style={styles.panelDesc}>Verify active regulatory items to satisfy SEC Regulation Crowdfunding placement rules.</p>
            
            <div style={styles.checklist}>
              <div style={styles.checkItem}>
                <div style={styles.checkMain}>
                  <input
                    type="checkbox"
                    checked={diligenceList.secFormC}
                    onChange={(e) => setDiligenceList({ ...diligenceList, secFormC: e.target.checked })}
                    style={styles.checkbox}
                  />
                  <div>
                    <h4 style={styles.checkTitle}>SEC Form C Filing & Financial Audit</h4>
                    <p style={styles.checkSub}>Operating company must have filed standard Form C with historical P&L audits.</p>
                  </div>
                </div>
                <span className={`badge ${diligenceList.secFormC ? 'badge-verified' : 'badge-unverified'}`}>
                  {diligenceList.secFormC ? 'Audited' : 'Pending Review'}
                </span>
              </div>

              <div style={styles.checkItem}>
                <div style={styles.checkMain}>
                  <input
                    type="checkbox"
                    checked={diligenceList.legalAudit}
                    onChange={(e) => setDiligenceList({ ...diligenceList, legalAudit: e.target.checked })}
                    style={styles.checkbox}
                  />
                  <div>
                    <h4 style={styles.checkTitle}>Startup Bylaws & Articles of Incorporation</h4>
                    <p style={styles.checkSub}>Corporate bylaws, member agreements, board appointments must be in regulatory standing.</p>
                  </div>
                </div>
                <span className={`badge ${diligenceList.legalAudit ? 'badge-verified' : 'badge-unverified'}`}>
                  {diligenceList.legalAudit ? 'Audited' : 'Pending Review'}
                </span>
              </div>

              <div style={styles.checkItem}>
                <div style={styles.checkMain}>
                  <input
                    type="checkbox"
                    checked={diligenceList.capTableReview}
                    onChange={(e) => setDiligenceList({ ...diligenceList, capTableReview: e.target.checked })}
                    style={styles.checkbox}
                  />
                  <div>
                    <h4 style={styles.checkTitle}>Shareholder Cap Table Distribution Review</h4>
                    <p style={styles.checkSub}>Review dilution tables, investor preference sheets, option pools, and convertible notes.</p>
                  </div>
                </div>
                <span className={`badge ${diligenceList.capTableReview ? 'badge-verified' : 'badge-unverified'}`}>
                  {diligenceList.capTableReview ? 'Audited' : 'Pending Review'}
                </span>
              </div>

              <div style={styles.checkItem}>
                <div style={styles.checkMain}>
                  <input
                    type="checkbox"
                    checked={diligenceList.techPatentVerification}
                    onChange={(e) => setDiligenceList({ ...diligenceList, techPatentVerification: e.target.checked })}
                    style={styles.checkbox}
                  />
                  <div>
                    <h4 style={styles.checkTitle}>Technical IP & Patent Verification</h4>
                    <p style={styles.checkSub}>Vetting that all software designs, bioscience patents, and manufacturing licenses are legally claimed.</p>
                  </div>
                </div>
                <span className={`badge ${diligenceList.techPatentVerification ? 'badge-verified' : 'badge-unverified'}`}>
                  {diligenceList.techPatentVerification ? 'Audited' : 'Pending Review'}
                </span>
              </div>

              <div style={styles.checkItem}>
                <div style={styles.checkMain}>
                  <input
                    type="checkbox"
                    checked={diligenceList.backgroundChecksVerified}
                    onChange={(e) => setDiligenceList({ ...diligenceList, backgroundChecksVerified: e.target.checked })}
                    style={styles.checkbox}
                  />
                  <div>
                    <h4 style={styles.checkTitle}>Founder & Core Executive Background checks</h4>
                    <p style={styles.checkSub}>Verify that executive profiles have passed standard anti-fraud and criminal background audits.</p>
                  </div>
                </div>
                <span className={`badge ${diligenceList.backgroundChecksVerified ? 'badge-verified' : 'badge-unverified'}`}>
                  {diligenceList.backgroundChecksVerified ? 'Audited' : 'Pending Review'}
                </span>
              </div>
            </div>

            <div style={styles.diligenceTip}>
              <strong>💡 Pro Tip:</strong> If you are unsure about structural compliance on a campaign, navigate to the **Advisory Forum** tab and ask a vetted legal advisor!
            </div>
          </div>
        </div>
      )}
    
      </div>

      {/* Investment Transaction Wizard Dialog */}
          {selectedCampaign && (
            <div style={styles.modalBackdrop}>
              <div 
                className="glass-panel glow-accent-border animate-fade-in-up" 
                style={{ 
                  ...styles.modalCard, 
                  maxWidth: wizardStep === 2 ? '680px' : '480px',
                  width: '95%'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
                  <h3 style={styles.modalTitle}>
                    {wizardStep === 1 && `⚡ Invest in ${selectedCampaign.companyName}`}
                    {wizardStep === 2 && `🖋 Secure SAFE Execution Wizard`}
                    {wizardStep === 3 && `🎉 Allocation Confirmed!`}
                  </h3>
                  <button 
                    onClick={() => {
                      setSelectedCampaign(null);
                      setWizardStep(1);
                      setSignatureDataUrl('');
                    }}
                    style={{ background: 'none', border: 'none', color: '#737373', fontSize: '1.2rem', cursor: 'pointer' }}
                  >
                    ✕
                  </button>
                </div>

                {wizardStep === 1 && (
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      setWizardStep(2);
                    }} 
                    style={styles.modalForm}
                  >
                    <p style={styles.modalSub}>
                      Enter the amount you would like to invest. Minimum entry limit: <strong>${selectedCampaign.minInvestment.toLocaleString()}</strong>.
                    </p>

                    <div style={styles.modalMetaRow}>
                      <div>
                        <span style={styles.metaLabel}>Ecosystem Wallet Balance:</span>
                        <span style={styles.metaVal}>${walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div>
                        <span style={styles.metaLabel}>KYC Legal Badge Status:</span>
                        <span style={{ 
                          ...styles.metaVal, 
                          color: user.isVerified ? '#ffffff' : '#f43f5e'
                        }}>
                          {user.isVerified ? '✓ Vetted Accredit' : '⚠ Verification Required'}
                        </span>
                      </div>
                    </div>

                    <div style={styles.inputGroup}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <label style={styles.label}>Investment Capital Amount ($)</label>
                        <input
                          type="number"
                          min={selectedCampaign.minInvestment}
                          max={walletBalance}
                          value={investAmount}
                          onChange={(e) => {
                            let val = e.target.value;
                            setInvestAmount(val);
                          }}
                          style={{
                            ...styles.input,
                            width: '120px',
                            padding: '0.4rem 0.6rem',
                            fontSize: '0.95rem',
                            textAlign: 'right',
                          }}
                          required
                        />
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                        <input
                          type="range"
                          min={selectedCampaign.minInvestment}
                          max={walletBalance}
                          step={500}
                          value={investAmount || selectedCampaign.minInvestment}
                          onChange={(e) => setInvestAmount(e.target.value)}
                          style={{
                            flex: 1,
                            accentColor: '#ffffff',
                            cursor: 'pointer',
                          }}
                        />
                      </div>

                      <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '0.75rem', 
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '8px',
                        padding: '1rem',
                        marginTop: '1rem' 
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#a3a3a3' }}>
                          <span>Approximate Shares to Purchase:</span>
                          <strong style={{ color: '#ffffff' }}>
                            {Math.floor(parseFloat(investAmount || 0) / selectedCampaign.sharePrice).toLocaleString()} Stocks
                          </strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#a3a3a3' }}>
                          <span>Venture Valuation Cap:</span>
                          <span style={{ color: '#ffffff' }}>${selectedCampaign.valuation.toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#a3a3a3', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem' }}>
                          <span>Projected Equity Stake:</span>
                          <strong style={{ color: '#10b981', fontSize: '0.9rem' }}>
                            {((parseFloat(investAmount || 0) / selectedCampaign.valuation) * 100).toFixed(4)}%
                          </strong>
                        </div>
                      </div>
                    </div>

                    {investError && <div style={styles.errorBox}>{investError}</div>}

                    <div style={styles.modalButtons}>
                      <button
                        type="button"
                        onClick={() => setSelectedCampaign(null)}
                        className="btn-secondary"
                        style={{ flex: 1 }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn-primary"
                        style={{ flex: 2 }}
                        disabled={!user.isVerified || walletBalance < parseFloat(investAmount)}
                      >
                        {!user.isVerified 
                          ? 'Complete KYC to Unlock' 
                          : walletBalance < parseFloat(investAmount)
                          ? 'Insufficient Funds'
                          : 'Review & Sign SAFE Contract'}
                      </button>
                    </div>
                  </form>
                )}

                {wizardStep === 2 && (
                  <form onSubmit={handleInvestSubmit} style={styles.modalForm}>
                    <p style={styles.modalSub}>
                      Please review the dynamically compiled Y-Combinator SAFE placement contract below and sign to authorize.
                    </p>

                    {/* SAFE Document scrollbox */}
                    <div style={{
                      background: 'rgba(0,0,0,0.4)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '8px',
                      padding: '1.5rem',
                      maxHeight: '220px',
                      overflowY: 'auto',
                      fontSize: '0.8rem',
                      color: '#a3a3a3',
                      lineHeight: '1.5',
                      fontFamily: 'monospace',
                      whiteSpace: 'pre-line'
                    }}>
                      {`PEERBRIDGE VENTURE PLACEMENTS SYSTEM
                      SIMPLE AGREEMENT FOR FUTURE EQUITY (SAFE)

                      This Simple Agreement for Future Equity ("SAFE") is made as of ${new Date().toLocaleDateString()} between ${state.customer?.first_name || 'Sarah'} ${state.customer?.last_name || 'Connor'} ("Investor") and ${selectedCampaign.companyName} ("Company") for the investment amount of $${parseFloat(investAmount).toLocaleString()}.

                      1. Valuation Cap. The Valuation Cap for this offering is $${selectedCampaign.valuation.toLocaleString()}.
                      2. Series A Equity. Upon the closing of the Company's next equity financing round exceeding $1,000,000, this SAFE shall automatically convert into fully paid, non-assessable Common Shares at the specified share price of $${selectedCampaign.sharePrice.toFixed(2)}.
                      3. Compliance. This placement is executed under Regulation Crowdfunding (Reg CF) / Regulation D rules within the United States. Cross-border transfers outside of US jurisdictions are legally restricted.`}
                    </div>

                    {/* e-Signature Pad */}
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>🖋 Accredit e-Signature Pad (Draw with Mouse/Touch)</label>
                      <div style={{ position: 'relative' }}>
                        <canvas
                          ref={canvasRef}
                          width={600}
                          height={120}
                          onMouseDown={startDrawing}
                          onMouseMove={draw}
                          onMouseUp={stopDrawing}
                          onMouseLeave={stopDrawing}
                          onTouchStart={startDrawingTouch}
                          onTouchMove={drawTouch}
                          onTouchEnd={stopDrawing}
                          style={{
                            background: '#0a0a0a',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '6px',
                            cursor: 'crosshair',
                            width: '100%',
                            height: '120px'
                          }}
                        />
                        {signatureDataUrl && (
                          <div style={{
                            position: 'absolute',
                            bottom: '10px',
                            right: '10px',
                            background: 'rgba(16,185,129,0.15)',
                            border: '1px solid #10b981',
                            color: '#10b981',
                            fontSize: '0.65rem',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            pointerEvents: 'none'
                          }}>
                            ✓ Signature Captured
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                        <span style={{ fontSize: '0.7rem', color: '#737373' }}>
                          SHA-256 Tamper Lock: <strong style={{ fontFamily: 'monospace' }}>SEC-REG-D-A1</strong>
                        </span>
                        <button
                          type="button"
                          onClick={clearSignature}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#f43f5e',
                            fontSize: '0.72rem',
                            cursor: 'pointer',
                            padding: 0
                          }}
                        >
                          Clear Signature Pad
                        </button>
                      </div>
                    </div>

                    {investError && <div style={styles.errorBox}>{investError}</div>}

                    <div style={styles.modalButtons}>
                      <button
                        type="button"
                        onClick={() => setWizardStep(1)}
                        className="btn-secondary"
                        style={{ flex: 1 }}
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        className="btn-primary"
                        style={{ flex: 2 }}
                        disabled={!signatureDataUrl}
                      >
                        Execute SAFE & Claim Stock Cert
                      </button>
                    </div>
                  </form>
                )}

                {wizardStep === 3 && (
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
                      <h4 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#ffffff', marginBottom: '0.5rem' }}>Investment Executed Successfully!</h4>
                      <p style={{ fontSize: '0.88rem', color: '#a3a3a3', lineHeight: '1.5', maxWidth: '360px' }}>
                        Your Y-Combinator SAFE contract has been cryptographically signed with a SHA-256 stamp. Your gold-framed Stock Certificate is now secure in your <strong>Ecosystem Vault</strong>.
                      </p>
                    </div>

                    {/* Gold certificate mockup inside success dialog */}
                    <div style={{
                      border: '2px solid #d4af37',
                      background: 'linear-gradient(135deg, rgba(20,20,20,0.95) 0%, rgba(10,10,10,0.99) 100%)',
                      boxShadow: '0 10px 30px rgba(212,175,55,0.15)',
                      padding: '1.25rem',
                      borderRadius: '8px',
                      width: '100%',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                      position: 'relative'
                    }}>
                      <div style={{ position: 'absolute', top: 5, right: 5, fontSize: '0.55rem', color: '#d4af37', fontWeight: 'bold', border: '1px solid #d4af37', padding: '1px 3px', borderRadius: '3px' }}>
                        GOLD FRAMED
                      </div>
                      <span style={{ fontSize: '0.65rem', color: '#d4af37', fontWeight: '700', letterSpacing: '0.1em' }}>PEERBRIDGE SECURITY INC.</span>
                      <strong style={{ color: '#ffffff', fontSize: '0.9rem' }}>STOCK ACQUISITION CERTIFICATE</strong>
                      <span style={{ fontSize: '0.8rem', color: '#a3a3a3' }}>ISSUED TO: <strong>{state.customer?.first_name} {state.customer?.last_name}</strong></span>
                      <span style={{ fontSize: '0.75rem', color: '#a3a3a3' }}>SHARES QUANTITY: <strong>{Math.floor(parseFloat(investAmount || 0) / selectedCampaign.sharePrice).toLocaleString()} Stocks</strong></span>
                      <span style={{ fontSize: '0.58rem', color: '#525252', fontFamily: 'monospace' }}>SEC SHA256 BLOCK: d41d8cd98f00b204e9800998ecf8427e</span>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedCampaign(null);
                        setWizardStep(1);
                        setSignatureDataUrl('');
                      }}
                      className="btn-primary"
                      style={{ width: '100%' }}
                    >
                      Return to Deal Feed
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
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2.5rem',
  },
  navRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    paddingBottom: '1rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  tabButtons: {
    display: 'flex',
    gap: '0.5rem',
  },
  tabActive: {
    background: 'rgba(255,255,255,0.05)',
    color: '#ffffff',
    border: '1px solid rgba(255, 255, 255, 0.25)',
    padding: '0.6rem 1.25rem',
    borderRadius: '6px',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  tabInactive: {
    background: 'transparent',
    color: '#a3a3a3',
    border: '1px solid transparent',
    padding: '0.6rem 1.25rem',
    borderRadius: '6px',
    fontWeight: '500',
    cursor: 'pointer',
    fontSize: '0.85rem',
    transition: 'all 0.2s ease',
    ':hover': {
      color: '#ffffff'
    }
  },
  walletBadge: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '0.5rem 1rem',
    borderRadius: '30px',
    fontSize: '0.85rem',
    color: '#ffffff',
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
  marketplaceView: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  introHeader: {
    marginBottom: '0.5rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '2rem',
  },
  campCard: {
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  campHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  campSector: {
    background: 'rgba(255,255,255,0.05)',
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.7rem',
    fontWeight: '600',
    color: '#a3a3a3',
    textTransform: 'uppercase',
  },
  campActive: {
    color: '#ffffff',
    fontSize: '0.7rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  campTitleText: {
    fontSize: '1.5rem',
    fontWeight: '700',
  },
  campTagline: {
    fontSize: '0.9rem',
    color: '#a3a3a3',
    lineHeight: '1.4',
    height: '42px',
    overflow: 'hidden',
  },
  progressContainer: {
    marginTop: '0.5rem',
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
    color: '#737373',
  },
  cardInfoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
    borderTop: '1px solid rgba(255,255,255,0.05)',
    paddingTop: '1rem',
  },
  infoCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem',
  },
  infoLabel: {
    fontSize: '0.7rem',
    color: '#737373',
    textTransform: 'uppercase',
  },
  infoVal: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#ffffff',
  },
  investBtn: {
    marginTop: '0.5rem',
    width: '100%',
    justifyContent: 'center',
    padding: '0.85rem',
  },
  modalBackdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.8)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
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
    color: '#a3a3a3',
    lineHeight: '1.4',
  },
  modalMetaRow: {
    background: 'rgba(255,255,255,0.02)',
    padding: '1rem',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  metaLabel: {
    fontSize: '0.8rem',
    color: '#737373',
    marginRight: '0.5rem',
  },
  metaVal: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#ffffff',
  },
  modalForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  input: {
    width: '100%',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '8px',
    padding: '0.85rem 1rem',
    color: '#ffffff',
    fontSize: '1.1rem',
    fontFamily: 'monospace',
    outline: 'none',
  },
  shareCountLabel: {
    fontSize: '0.75rem',
    color: '#a3a3a3',
    marginTop: '0.4rem',
  },
  modalButtons: {
    display: 'flex',
    gap: '1rem',
  },
  successBox: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid #ffffff',
    color: '#ffffff',
    padding: '1.25rem',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontWeight: '600',
    lineHeight: '1.5',
    textAlign: 'center',
  },
  errorBox: {
    background: 'rgba(244, 63, 94, 0.1)',
    border: '1px solid rgba(244, 63, 94, 0.3)',
    color: '#f43f5e',
    padding: '0.85rem',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: '500',
  },
  portfolioView: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  portfolioGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1.6fr',
    gap: '2rem',
  },
  visualAllocationCard: {
    padding: '2rem',
    height: 'fit-content',
  },
  panelTitle: {
    fontSize: '1.2rem',
    fontWeight: '800',
  },
  panelDesc: {
    fontSize: '0.8rem',
    color: '#737373',
    marginTop: '0.2rem',
  },
  svgSection: {
    width: '150px',
    height: '150px',
    margin: '2rem auto',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    width: '100%',
    height: '100%',
    transform: 'rotate(-90deg)',
  },
  svgCenterText: {
    position: 'absolute',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
  },
  svgInnerLabel: {
    fontSize: '0.65rem',
    color: '#737373',
    textTransform: 'uppercase',
  },
  svgInnerVal: {
    fontSize: '1.25rem',
    fontWeight: '800',
    color: '#ffffff',
  },
  legendContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    marginTop: '1.5rem',
    borderTop: '1px solid rgba(255,255,255,0.05)',
    paddingTop: '1.5rem',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  legendBox: {
    width: '10px',
    height: '10px',
    borderRadius: '3px',
  },
  legendLabel: {
    fontSize: '0.85rem',
    color: '#a3a3a3',
    flex: '1',
  },
  legendVal: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#ffffff',
  },
  investmentsTableCard: {
    padding: '2rem',
  },
  emptyPortfolioBox: {
    padding: '4rem 2rem',
    textAlign: 'center',
    color: '#737373',
  },
  tableContainer: {
    marginTop: '1.5rem',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  tr: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  },
  th: {
    padding: '0.75rem 1rem',
    fontSize: '0.75rem',
    color: '#737373',
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  trItem: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
  },
  td: {
    padding: '1rem',
    fontSize: '0.85rem',
    color: '#a3a3a3',
  },
  tdBold: {
    padding: '1rem',
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#ffffff',
  },
  diligenceView: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  diligenceCard: {
    padding: '2.5rem',
  },
  checklist: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    marginTop: '2rem',
  },
  checkItem: {
    background: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    borderRadius: '12px',
    padding: '1.25rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1.5rem',
  },
  checkMain: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    marginTop: '0.15rem',
    cursor: 'pointer',
    accentColor: '#ffffff',
  },
  checkTitle: {
    fontSize: '0.95rem',
    fontWeight: '700',
    color: '#ffffff',
  },
  checkSub: {
    fontSize: '0.8rem',
    color: '#737373',
    marginTop: '0.25rem',
  },
  diligenceTip: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    padding: '1rem',
    color: '#ffffff',
    fontSize: '0.85rem',
    marginTop: '2rem',
  },
  card: {
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    height: 'fit-content',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: '1.2rem',
    fontWeight: '800',
  },
  cardDesc: {
    fontSize: '0.85rem',
    color: '#a3a3a3',
    lineHeight: '1.4',
  },
  editBtn: {
    padding: '0.4rem 0.8rem',
    fontSize: '0.75rem',
  },
  profileDetailsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    paddingTop: '1.5rem',
  },
  profileItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
  },
  profileLabel: {
    fontSize: '0.7rem',
    fontWeight: '700',
    color: '#737373',
    textTransform: 'uppercase',
  },
  profileVal: {
    fontSize: '1.05rem',
    color: '#ffffff',
  },
  preferredRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginTop: '0.25rem',
  },
  industryTag: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#ffffff',
    padding: '0.3rem 0.65rem',
    borderRadius: '4px',
    fontSize: '0.78rem',
    fontWeight: '550',
  },
  emptyText: {
    fontSize: '0.85rem',
    color: '#525252',
    fontStyle: 'italic',
  },
  profileForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    paddingTop: '1.5rem',
  },
  formRow2Col: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
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
  sectorToggleBtn: {
    padding: '0.4rem 0.8rem',
    fontSize: '0.8rem',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  }
};
