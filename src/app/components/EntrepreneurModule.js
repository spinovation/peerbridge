'use client';

import { useState, useEffect } from 'react';

export default function EntrepreneurModule({ state }) {
  const { campaigns, createCampaign, user, entrepreneurProfile, updateEntrepreneurProfile } = state;
  const myCampaigns = campaigns.filter(c => c.founder === user.name);

  // Tab State
  const [entrepreneurTab, setEntrepreneurTab] = useState('round_launcher'); // round_launcher, founder_pro

  // SaaS Gate & Upgrades
  const isFounderPro = state.customer?.subscription_tier === 'founder_pro';

  // Campaign Form States
  const [showLauncher, setShowLauncher] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [problem, setProblem] = useState('');
  const [solution, setSolution] = useState('');
  const [target, setTarget] = useState('150000');
  const [valuation, setValuation] = useState('5000000');
  const [sharePrice, setSharePrice] = useState('2.50');
  const [minInvest, setMinInvest] = useState('500');
  const [category, setCategory] = useState('CleanTech');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [offeringType, setOfferingType] = useState('equity');
  const [interestRate, setInterestRate] = useState('7.5');
  const [termMonths, setTermMonths] = useState('6');

  // Entrepreneur Profile Form States (Table #4)
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [companyNameProfile, setCompanyNameProfile] = useState(entrepreneurProfile.company_name || '');
  const [businessStage, setBusinessStage] = useState(entrepreneurProfile.business_stage || 'revenue');
  const [industry, setIndustry] = useState(entrepreneurProfile.industry || 'CleanTech');
  const [fundingGoal, setFundingGoal] = useState(entrepreneurProfile.funding_goal || 0);
  const [valuationProfile, setValuationProfile] = useState(entrepreneurProfile.valuation || 0);
  const [companySummary, setCompanySummary] = useState(entrepreneurProfile.company_summary || '');
  const [pitchDeckUrl, setPitchDeckUrl] = useState(entrepreneurProfile.pitch_deck_url || '');
  const [team, setTeam] = useState(entrepreneurProfile.team || []);

  // Team Member Input States
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('');
  const [newMemberLinkedin, setNewMemberLinkedin] = useState('');
  const [newMemberBio, setNewMemberBio] = useState('');

  // Founder Pro: AP Bill Pay States
  const [bills, setBills] = useState([
    { id: 'bill-1', name: 'AWS Cloud Services Hosting', amount: 45.00, dueDate: '2026-06-15', autoPay: true, status: 'unpaid' },
    { id: 'bill-2', name: 'Delaware Registered Agent Legal Retainer', amount: 250.00, dueDate: '2026-06-20', autoPay: false, status: 'unpaid' },
    { id: 'bill-3', name: 'WeWork Co-Working Desk Space', amount: 80.00, dueDate: '2026-06-25', autoPay: true, status: 'unpaid' }
  ]);

  // Founder Pro: Chore Delegation States
  const [chores, setChores] = useState([
    { id: 'chore-1', title: 'SEC Form C Financial Condition Vetting', incentive: 150.00, status: 'open', claimedBy: null },
    { id: 'chore-2', title: 'Q2 Carbon Capture Biomass Yield Audit', incentive: 200.00, status: 'claimed', claimedBy: 'Dr. Evelyn Chen' }
  ]);
  const [newChoreTitle, setNewChoreTitle] = useState('');
  const [newChoreIncentive, setNewChoreIncentive] = useState('100');

  // Keep local states synced if context changes
  useEffect(() => {
    if (entrepreneurProfile) {
      setTimeout(() => {
        setCompanyNameProfile(entrepreneurProfile.company_name || '');
        setBusinessStage(entrepreneurProfile.business_stage || 'revenue');
        setIndustry(entrepreneurProfile.industry || 'CleanTech');
        setFundingGoal(entrepreneurProfile.funding_goal || 0);
        setValuationProfile(entrepreneurProfile.valuation || 0);
        setCompanySummary(entrepreneurProfile.company_summary || '');
        setPitchDeckUrl(entrepreneurProfile.pitch_deck_url || '');
        setTeam(entrepreneurProfile.team || []);
      }, 0);
    }
  }, [entrepreneurProfile]);

  const handleLaunchRound = (e) => {
    e.preventDefault();
    if (!companyName.trim() || !tagline.trim() || !description.trim() || !problem.trim() || !solution.trim()) {
      setError('Please fill out all fields of your business plan.');
      return;
    }

    const res = createCampaign(
      companyName,
      tagline,
      description,
      problem,
      solution,
      target,
      valuation,
      sharePrice,
      minInvest,
      category,
      offeringType,
      interestRate,
      termMonths
    );

    if (res.success) {
      updateEntrepreneurProfile({
        company_name: companyName,
        business_stage: 'revenue',
        industry: category,
        funding_goal: parseFloat(target),
        valuation: offeringType === 'debt' ? 0 : parseFloat(valuation),
        company_summary: description
      });

      setCompanyName('');
      setTagline('');
      setDescription('');
      setProblem('');
      setSolution('');
      setError('');
      setShowLauncher(false);
      setSuccess(`Fundraising round for '${res.campaign.companyName}' has been successfully generated and listed on the Marketplace!`);
      setTimeout(() => setSuccess(''), 4000);
    } else {
      setError(res.error);
    }
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateEntrepreneurProfile({
      company_name: companyNameProfile,
      business_stage: businessStage,
      industry: industry,
      funding_goal: parseFloat(fundingGoal),
      valuation: parseFloat(valuationProfile),
      company_summary: companySummary,
      pitch_deck_url: pitchDeckUrl,
      team: team
    });
    setIsEditingProfile(false);
    setSuccess('Ecosystem Business Profile synced successfully to the Database!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleAddMember = (e) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberRole.trim()) return;
    const newMember = {
      name: newMemberName,
      role: newMemberRole,
      linkedin: newMemberLinkedin,
      bio: newMemberBio
    };
    const updatedTeam = [...team, newMember];
    setTeam(updatedTeam);
    updateEntrepreneurProfile({ team: updatedTeam });
    
    setNewMemberName('');
    setNewMemberRole('');
    setNewMemberLinkedin('');
    setNewMemberBio('');
    setShowAddMember(false);
  };

  const handleRemoveMember = (idxToRemove) => {
    const updatedTeam = team.filter((_, idx) => idx !== idxToRemove);
    setTeam(updatedTeam);
    updateEntrepreneurProfile({ team: updatedTeam });
  };

  // SaaS Upgrades
  const handleUpgradeToFounderPro = () => {
    state.updateUserProfile({ subscription_tier: 'founder_pro' });
    setSuccess('Welcome to Founder Pro! High-margin business automations unlocked.');
    setTimeout(() => setSuccess(''), 4000);
  };

  // Founder Pro: Settle accounts payable bills
  const handlePayBill = (billId, amount, billName) => {
    if (state.walletBalance < amount) {
      setError(`Insufficient balance to pay bill. Need $${amount}.`);
      setTimeout(() => setError(''), 4000);
      return;
    }
    
    // Deduct from wallet
    state.withdrawFunds(amount);
    setBills(bills.map(b => b.id === billId ? { ...b, status: 'paid' } : b));
    
    state.addNotification('System', `Bill Pay Success: Settled invoice for ${billName} of $${amount.toFixed(2)}.`);
    setSuccess(`Successfully settled ${billName} invoice of $${amount.toFixed(2)}.`);
    setTimeout(() => setSuccess(''), 4000);
  };

  const handleToggleAutoPay = (billId) => {
    setBills(bills.map(b => b.id === billId ? { ...b, autoPay: !b.autoPay } : b));
  };

  // Founder Pro: Create digital chores
  const handleCreateChore = (e) => {
    e.preventDefault();
    if (!newChoreTitle.trim()) return;
    
    const nextChore = {
      id: `chore-${Date.now()}`,
      title: newChoreTitle,
      incentive: parseFloat(newChoreIncentive || 100),
      status: 'open',
      claimedBy: null
    };

    setChores([nextChore, ...chores]);
    setNewChoreTitle('');
    setSuccess(`Chore listed: '${newChoreTitle}' posted for affiliate compliance vetting matching!`);
    setTimeout(() => setSuccess(''), 4000);
  };

  const renderCapTableSVG = (capTable) => {
    let accumulatedPercent = 0;
    const colors = ['#ffffff', '#00f2fe', '#8b5cf6', '#d4af37', '#737373'];
    return (
      <svg viewBox="0 0 100 100" style={styles.svg}>
        <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--border-color)" strokeWidth="15" />
        {capTable.map((item, idx) => {
          const strokeVal = (item.percentage / 100) * (2 * Math.PI * 40);
          const dashArray = `${strokeVal} ${2 * Math.PI * 40}`;
          const offset = -((accumulatedPercent / 100) * (2 * Math.PI * 40)) + (2 * Math.PI * 40) * 0.25;
          accumulatedPercent += item.percentage;
          
          return (
            <circle
              key={idx}
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke={colors[idx % colors.length]}
              strokeWidth="15"
              strokeDasharray={dashArray}
              strokeDashoffset={offset}
              style={{ transition: 'all 0.5s ease' }}
            />
          );
        })}
        <circle cx="50" cy="50" r="28" fill="var(--bg-primary)" />
      </svg>
    );
  };

  return (
    <div style={styles.container} className="animate-fade-in-up">
      {/* Header Row */}
      <div style={styles.headerRow}>
        <div>
          <h2 style={styles.title}>🏢 Founder's Growth Center & Operations Hub</h2>
          <p style={styles.sub}>Draft business plans, manage team credentials, monitor equity distributions, and automate accounts payable.</p>
        </div>
      </div>

      {/* Segmented sub-tab selectors */}
      <div style={styles.segmentedTabWrapper}>
        <div style={styles.tabContainer}>
          <button 
            onClick={() => { setEntrepreneurTab('round_launcher'); setShowLauncher(false); }}
            style={{ 
              ...styles.tabBtn, 
              color: entrepreneurTab === 'round_launcher' ? 'var(--border-accent)' : 'var(--color-text-secondary)',
              background: entrepreneurTab === 'round_launcher' ? 'var(--border-color)' : 'transparent',
              borderBottom: entrepreneurTab === 'round_launcher' ? '2px solid #00f2fe' : 'none'
            }}
          >
            📈 Round Launcher & Team
          </button>
          <button 
            onClick={() => setEntrepreneurTab('founder_pro')}
            style={{ 
              ...styles.tabBtn, 
              color: entrepreneurTab === 'founder_pro' ? 'var(--border-accent)' : 'var(--color-text-secondary)',
              background: entrepreneurTab === 'founder_pro' ? 'var(--border-color)' : 'transparent',
              borderBottom: entrepreneurTab === 'founder_pro' ? '2px solid #a78bfa' : 'none'
            }}
          >
            💼 Founder Pro Automations
          </button>
        </div>
      </div>

      {success && (
        <div style={styles.successToast}>
          ✨ {success}
        </div>
      )}

      {error && (
        <div style={{ ...styles.successToast, background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.25)', color: '#f43f5e' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Tab 1: Round Launcher and Team Hub (Original module flow) */}
      {entrepreneurTab === 'round_launcher' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Symmetrical Launch button row */}
          {myCampaigns.length === 0 && !showLauncher && (
            <div style={styles.launchButtonsRow}>
              <button
                onClick={() => { setOfferingType('equity'); setShowLauncher(true); }}
                className="btn-primary"
                style={styles.launcherBtnAction}
              >
                🚀 Launch Capital Round
              </button>
              <button
                onClick={() => { setOfferingType('debt'); setShowLauncher(true); }}
                className="btn-secondary"
                style={styles.launcherBtnAction}
              >
                🏛️ Launch Lending Request
              </button>
            </div>
          )}

          {/* Launcher Panel Wizard (Comp #3) */}
          {showLauncher && (
            <div className="glass-panel" style={styles.launcherCard}>
              <h3 style={styles.launcherTitle}>Launch a Private Capital Offering Round</h3>
              <p style={styles.launcherDesc}>
                Configure seed equity SAFEs or secured peer-to-peer debt notes mapped instantly to directory syndicates.
              </p>

              <form onSubmit={handleLaunchRound} style={styles.formGrid}>
                {/* Offering Type Selector Pills */}
                <div style={styles.fullWidth}>
                  <label style={styles.label}>Offering Security Type</label>
                  <div style={styles.pillsRow}>
                    <button
                      type="button"
                      onClick={() => setOfferingType('equity')}
                      style={{
                        ...styles.pillBtn,
                        background: offeringType === 'equity' ? 'rgba(0, 242, 254, 0.1)' : 'var(--border-color)',
                        borderColor: offeringType === 'equity' ? '#00f2fe' : 'var(--border-color)',
                        color: offeringType === 'equity' ? '#00f2fe' : '#a3a3a3'
                      }}
                    >
                      📈 Series Seed SAFE (Equity)
                    </button>
                    <button
                      type="button"
                      onClick={() => setOfferingType('debt')}
                      style={{
                        ...styles.pillBtn,
                        background: offeringType === 'debt' ? 'rgba(139, 92, 246, 0.1)' : 'var(--border-color)',
                        borderColor: offeringType === 'debt' ? '#a78bfa' : 'var(--border-color)',
                        color: offeringType === 'debt' ? '#a78bfa' : '#a3a3a3'
                      }}
                    >
                      🏛️ P2P Commercial Note (Debt)
                    </button>
                  </div>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Company Brand Name</label>
                  <input type="text" placeholder="e.g. Aether Dynamics" value={companyName} onChange={e => setCompanyName(e.target.value)} style={styles.input} required />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Campaign Pitch Tagline</label>
                  <input type="text" placeholder="Cold-chain temperature fleet expansion..." value={tagline} onChange={e => setTagline(e.target.value)} style={styles.input} required />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Target Funding Principal ($)</label>
                  <input type="number" value={target} onChange={e => setTarget(e.target.value)} style={styles.input} required />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Ecosystem Category Segment</label>
                  <select value={category} onChange={e => setCategory(e.target.value)} style={styles.select}>
                    <option value="CleanTech">CleanTech</option>
                    <option value="MedTech">MedTech</option>
                    <option value="Fintech">Fintech</option>
                    <option value="Logistics">Logistics</option>
                    <option value="AI/ML">AI/ML</option>
                  </select>
                </div>

                {offeringType === 'equity' ? (
                  <>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Valuation Cap ($)</label>
                      <input type="number" value={valuation} onChange={e => setValuation(e.target.value)} style={styles.input} required />
                    </div>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Share Price Placement ($)</label>
                      <input type="number" step="0.01" value={sharePrice} onChange={e => setSharePrice(e.target.value)} style={styles.input} required />
                    </div>
                  </>
                ) : (
                  <>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Annual Interest Gross Rate (%)</label>
                      <input type="number" step="0.1" value={interestRate} onChange={e => setInterestRate(e.target.value)} style={styles.input} required />
                    </div>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Maturity Tenor (Months)</label>
                      <input type="number" value={termMonths} onChange={e => setTermMonths(e.target.value)} style={styles.input} required />
                    </div>
                  </>
                )}

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Minimum Investment Threshold ($)</label>
                  <input type="number" value={minInvest} onChange={e => setMinInvest(e.target.value)} style={styles.input} required />
                </div>

                <div style={styles.fullWidth}>
                  <label style={styles.label}>Company Summary & Problem Statement</label>
                  <textarea placeholder="Outline start-up operations..." value={description} onChange={e => setDescription(e.target.value)} style={styles.textarea} rows="2" required />
                </div>

                <div style={styles.fullWidth}>
                  <label style={styles.label}>Proposed Technical Solution</label>
                  <textarea placeholder="Detail carbon photo-bioreactors cell specifications..." value={solution} onChange={e => setSolution(e.target.value)} style={styles.textarea} rows="2" required />
                </div>

                <div style={styles.fullWidth}>
                  <label style={styles.label}>Target Competencies / Risks</label>
                  <textarea placeholder="Detail key operational challenges..." value={problem} onChange={e => setProblem(e.target.value)} style={styles.textarea} rows="2" required />
                </div>

                {error && <div style={{ ...styles.errorText, gridColumn: 'span 2' }}>{error}</div>}

                <div style={{ ...styles.fullWidth, display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.82rem' }}>
                    Publish Security Offering
                  </button>
                  <button type="button" onClick={() => setShowLauncher(false)} className="btn-secondary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.82rem' }}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Double Column Grid: Left is Company Campaigns + Cap Tables, Right is Business Profile & Team */}
          <div style={styles.doubleGrid}>
            
            {/* Left Column: Campaigns & Cap Table */}
            <div style={styles.leftCol}>
              {myCampaigns.length === 0 ? (
                <div className="glass-panel" style={styles.emptyBox}>
                  <span>📭 No active capital rounds launched yet. Start a campaign using the launcher buttons above.</span>
                </div>
              ) : (
                myCampaigns.map((camp) => (
                  <div key={camp.id} className="glass-panel" style={styles.campaignCard}>
                    <div style={styles.campHeader}>
                      <div>
                        <h3 style={styles.campTitle}>{camp.companyName}</h3>
                        <span style={styles.campTag}>{camp.tagline}</span>
                      </div>
                      <span className="badge badge-primary">{camp.status} Round</span>
                    </div>

                    <div style={styles.specsLine}>
                      <div>
                        <span style={styles.specLabel}>Category:</span>
                        <strong style={styles.specVal}>{camp.category}</strong>
                      </div>
                      <div>
                        <span style={styles.specLabel}>Raised:</span>
                        <strong style={{ ...styles.specVal, color: '#00f2fe' }}>${camp.raised.toLocaleString()} / ${camp.target.toLocaleString()}</strong>
                      </div>
                      {camp.offering_type === 'equity' ? (
                        <div>
                          <span style={styles.specLabel}>Valuation Cap:</span>
                          <strong style={styles.specVal}>${camp.valuation.toLocaleString()}</strong>
                        </div>
                      ) : (
                        <div>
                          <span style={styles.specLabel}>Gross Interest Rate:</span>
                          <strong style={{ ...styles.specVal, color: '#a78bfa' }}>{camp.interest_rate}% ({camp.term_months}m tenor)</strong>
                        </div>
                      )}
                    </div>

                    {/* Cap Table Segment nested inside Campaign */}
                    <div style={styles.capSection}>
                      <h3 style={styles.capTitle}>📊 Shareholder Cap Table Registry</h3>
                      <div style={styles.capGrid}>
                        <div style={styles.capChartWrap}>
                          {renderCapTableSVG(camp.capTable)}
                        </div>
                        <div style={styles.shareholdersList}>
                          {camp.capTable.map((item, idx) => (
                            <div key={idx} style={styles.shareholderRow}>
                              <span style={styles.shareholderName}>• {item.name}</span>
                              <strong style={styles.shareholderPercent}>{item.percentage}% ({item.shares.toLocaleString()} shares)</strong>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Right Column: Business Profile Editor (Table #4) & Founding Team */}
            <div style={styles.rightCol}>
              <div className="glass-panel" style={styles.card}>
                <h3 style={styles.cardTitle}>🏢 Entrepreneur Profile (Table #4)</h3>
                <p style={styles.cardDesc}>Maintain cryptographic corporate records satisfying SEC exemptions criteria.</p>

                {isEditingProfile ? (
                  <form onSubmit={handleSaveProfile} style={styles.profileForm}>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Corporate Name</label>
                      <input type="text" value={companyNameProfile} onChange={e => setCompanyNameProfile(e.target.value)} style={styles.input} required />
                    </div>

                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Business Stage</label>
                      <select value={businessStage} onChange={e => setBusinessStage(e.target.value)} style={styles.select}>
                        <option value="idea">Idea Stage</option>
                        <option value="prototype">Prototype Stage</option>
                        <option value="revenue">Generating Revenue</option>
                        <option value="scaling">Scaling Operations</option>
                      </select>
                    </div>

                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Industry Segment</label>
                      <input type="text" value={industry} onChange={e => setIndustry(e.target.value)} style={styles.input} required />
                    </div>

                    <div style={styles.inputGroup}>
                      <label style={styles.label}>SEC SAFE Pitch Deck S3 URL</label>
                      <input type="text" value={pitchDeckUrl} onChange={e => setPitchDeckUrl(e.target.value)} style={styles.input} />
                    </div>

                    <div style={styles.fullWidth}>
                      <label style={styles.label}>Core Operations Summary</label>
                      <textarea value={companySummary} onChange={e => setCompanySummary(e.target.value)} style={styles.textarea} rows="3" required />
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <button type="submit" className="btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.78rem' }}>Save Profiles</button>
                      <button type="button" onClick={() => setIsEditingProfile(false)} className="btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.78rem' }}>Cancel</button>
                    </div>
                  </form>
                ) : (
                  <div style={styles.profileDetails}>
                    <div style={styles.profileRow}>
                      <span style={styles.specLabel}>Company Name:</span>
                      <strong style={styles.specVal}>{companyNameProfile || 'EcoSphere Solutions'}</strong>
                    </div>
                    <div style={styles.profileRow}>
                      <span style={styles.specLabel}>Ecosystem Industry:</span>
                      <strong style={styles.specVal}>{industry || 'CleanTech'}</strong>
                    </div>
                    <div style={styles.profileRow}>
                      <span style={styles.specLabel}>Operational Stage:</span>
                      <strong style={styles.specVal}>{businessStage.toUpperCase()}</strong>
                    </div>
                    <div style={styles.profileRow}>
                      <span style={styles.specLabel}>SAFE Pitch Deck:</span>
                      <a href={pitchDeckUrl || '#'} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: '#00f2fe', fontWeight: '700' }}>
                        {pitchDeckUrl ? '🔗 Expiring S3 PitchDeck' : 'No Pitch Deck Added'}
                      </a>
                    </div>
                    
                    <button onClick={() => setIsEditingProfile(true)} className="btn-secondary" style={{ alignSelf: 'flex-start', padding: '0.4rem 1rem', fontSize: '0.76rem', marginTop: '0.5rem' }}>
                      ⚙ Edit Corporate Profile
                    </button>
                  </div>
                )}
              </div>

              {/* Founding Team list */}
              <div className="glass-panel" style={styles.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={styles.cardTitle}>👥 Founding Partners Credentials</h3>
                  <button onClick={() => setShowAddMember(!showAddMember)} className="btn-secondary" style={{ padding: '0.2rem 0.65rem', fontSize: '0.68rem' }}>
                    {showAddMember ? 'Cancel' : '+ Add Partner'}
                  </button>
                </div>

                {showAddMember && (
                  <form onSubmit={handleAddMember} style={styles.profileForm}>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Full Name</label>
                      <input type="text" value={newMemberName} onChange={e => setNewMemberName(e.target.value)} style={styles.input} required />
                    </div>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Executive Role</label>
                      <input type="text" placeholder="e.g. COO & Chief Geneticist" value={newMemberRole} onChange={e => setNewMemberRole(e.target.value)} style={styles.input} required />
                    </div>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>LinkedIn Directory URL</label>
                      <input type="text" value={newMemberLinkedin} onChange={e => setNewMemberLinkedin(e.target.value)} style={styles.input} />
                    </div>
                    <div style={styles.fullWidth}>
                      <label style={styles.label}>Partner Bio Credentials</label>
                      <textarea value={newMemberBio} onChange={e => setNewMemberBio(e.target.value)} style={styles.textarea} rows="2" />
                    </div>
                    <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start', padding: '0.4rem 1rem', fontSize: '0.74rem' }}>
                      Issue Credentials Badge
                    </button>
                  </form>
                )}

                <div style={styles.teamList}>
                  {team.length === 0 ? (
                    <span style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>No team members registered yet. Add co-founders above.</span>
                  ) : (
                    team.map((member, idx) => (
                      <div key={idx} style={styles.teamItem}>
                        <div style={styles.teamHeader}>
                          <div>
                            <h4 style={styles.teamName}>{member.name}</h4>
                            <span style={styles.teamRole}>{member.role}</span>
                          </div>
                          <button onClick={() => handleRemoveMember(idx)} style={styles.removeBtn} title="Revoke partner security badges">×</button>
                        </div>
                        <p style={styles.teamBio}>{member.bio}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Founder Pro Automations Dashboard (Monetized high-margin views) */}
      {entrepreneurTab === 'founder_pro' && (
        <div style={styles.proPanelContainer}>
          {!isFounderPro ? (
            /* Promotional Glassmorphic SaaS Gated Panel Upgrades */
            <div className="glass-panel glow-purple-border animate-fade-in-up" style={styles.upsellCard}>
              <span style={styles.upsellBadge}>💼 FOUNDER PRO MEMBERSHIP REQUIRED</span>
              <h2 style={styles.upsellTitle}>Automate accounts payable, delegate chores, and manage your capitalization ledger securely</h2>
              <p style={styles.upsellDesc}>
                Unlock instant access to dynamic venture dashboards, 0% dilution updating, bookkeeping sweeps, accounts payable integrations, and compliant SEC Reg CF prep sheets.
              </p>
              <div style={styles.upsellMetricsRow}>
                <div style={styles.upsellMetricBox}>
                  <span style={styles.upsellLabel}>Dilution update fees</span>
                  <strong style={{ color: 'var(--color-text-primary)', fontSize: '1.25rem' }}>0% flat rate</strong>
                </div>
                <div style={styles.upsellMetricBox}>
                  <span style={styles.upsellLabel}>IRS Form generation</span>
                  <strong style={{ color: '#00f2fe', fontSize: '1.25rem' }}>Fully Automated</strong>
                </div>
                <div style={styles.upsellMetricBox}>
                  <span style={styles.upsellLabel}>Smart Escrow Chores</span>
                  <strong style={{ color: '#a78bfa', fontSize: '1.25rem' }}>Affiliate Synced</strong>
                </div>
              </div>
              <button 
                onClick={handleUpgradeToFounderPro} 
                className="btn-primary" 
                style={styles.upgradeBtn}
              >
                Upgrade to Founder Pro – $49/Month
              </button>
            </div>
          ) : (
            /* Full Founder Pro Automations Suite Dashboard */
            <div className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              <div style={styles.proTopGrid}>
                {/* 1. Accounts Payable Bill Pay Dashboard */}
                <div className="glass-panel" style={styles.card}>
                  <h3 style={styles.cardTitle}>🏛️ Automated Accounts Payable (Bill Pay)</h3>
                  <p style={styles.cardDesc}>Pay routine vendor invoices directly from your Peer Bridge balance ledger.</p>

                  <div style={styles.billsList}>
                    {bills.map(bill => (
                      <div key={bill.id} style={styles.billItem}>
                        <div style={styles.billLeft}>
                          <span style={{ fontSize: '1.2rem' }}>{bill.status === 'paid' ? '✅' : '📥'}</span>
                          <div>
                            <h4 style={{ ...styles.billNameText, textDecoration: bill.status === 'paid' ? 'line-through' : 'none' }}>{bill.name}</h4>
                            <span style={styles.billMeta}>Due: {bill.dueDate} • Auto-Pay: {bill.autoPay ? 'On' : 'Off'}</span>
                          </div>
                        </div>

                        <div style={styles.billRight}>
                          <strong style={{ fontSize: '0.85rem', color: 'var(--color-text-primary)' }}>${bill.amount.toFixed(2)}</strong>
                          {bill.status === 'paid' ? (
                            <span style={styles.billPaidBadge}>Settled</span>
                          ) : (
                            <div style={{ display: 'flex', gap: '0.35rem' }}>
                              <button onClick={() => handleToggleAutoPay(bill.id)} style={{ ...styles.actionBtn, padding: '0.2rem 0.5rem', fontSize: '0.62rem' }}>
                                {bill.autoPay ? 'Disable Auto' : 'Enable Auto'}
                              </button>
                              <button onClick={() => handlePayBill(bill.id, bill.amount, bill.name)} className="btn-primary" style={{ ...styles.downloadBtn, padding: '0.2rem 0.5rem', fontSize: '0.64rem', background: '#a78bfa', color: '#000000', fontWeight: '800' }}>
                                Pay Now
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Cash runway forecast metrics */}
                  <div style={styles.runwayCard}>
                    <span style={styles.specLabel}>Automated Cash flow runway forecast (12 months)</span>
                    <div style={styles.runwayWrap}>
                      <svg viewBox="0 0 400 40" style={{ width: '100%', height: '40px' }}>
                        <path d="M0,10 L100,12 L200,18 L300,28 L400,38" fill="none" stroke="#a78bfa" strokeWidth="2.5" />
                        <circle cx="400" cy="38" r="4.5" fill="#a78bfa" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* 2. Chore Delegation Wizard */}
                <div className="glass-panel" style={styles.card}>
                  <h3 style={styles.cardTitle}>🤝 Compliance Chore Delegation Panel</h3>
                  <p style={styles.cardDesc}>Outsource compliance, filings, and audit work directly to vetted network affiliates.</p>

                  <form onSubmit={handleCreateChore} style={styles.choreForm}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input 
                        type="text" 
                        placeholder="Task e.g. Form C Bookkeeping Audit..." 
                        value={newChoreTitle} 
                        onChange={e => setNewChoreTitle(e.target.value)} 
                        style={styles.input}
                        required
                      />
                      <input 
                        type="number" 
                        placeholder="Reward $" 
                        value={newChoreIncentive} 
                        onChange={e => setNewChoreIncentive(e.target.value)} 
                        style={{ ...styles.input, width: '100px' }}
                        required
                      />
                      <button type="submit" className="btn-primary" style={{ padding: '0 1rem', background: '#a78bfa', color: '#000000', fontWeight: '800' }}>
                        Post Chore
                      </button>
                    </div>
                  </form>

                  <div style={styles.choresList}>
                    {chores.map(chore => (
                      <div key={chore.id} style={styles.choreItem}>
                        <div>
                          <h4 style={styles.choreItemTitle}>{chore.title}</h4>
                          <span style={styles.choreItemMeta}>
                            Incentive reward: <strong style={{ color: '#00f2fe' }}>${chore.incentive.toFixed(2)}</strong> Escrowed split
                          </span>
                        </div>
                        
                        <span style={{
                          fontSize: '0.62rem',
                          padding: '0.1rem 0.4rem',
                          borderRadius: '4px',
                          fontWeight: '800',
                          background: chore.status === 'open' ? 'rgba(0, 242, 254, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                          color: chore.status === 'open' ? '#00f2fe' : '#10b981',
                          border: chore.status === 'open' ? '1px solid rgba(0, 242, 254, 0.15)' : '1px solid rgba(16, 185, 129, 0.15)'
                        }}>
                          {chore.status === 'open' ? 'Open for bidding' : `Claimed by ${chore.claimedBy}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. SEC Reg CF Prep Sheets (Spreadsheet format) */}
              <div className="glass-panel" style={styles.card}>
                <h3 style={styles.cardTitle}>📜 SEC Regulation Crowdfunding Filing Sheet (Form C)</h3>
                <p style={styles.cardDesc}>Export complete securities registration details compiled from your cap table registry dynamically.</p>

                <div style={{ overflowX: 'auto', marginTop: '0.5rem' }}>
                  <table style={styles.spreadTable}>
                    <thead>
                      <tr style={styles.spreadHeaderRow}>
                        <th style={styles.spreadHeaderCell}>Form C disclosure sector</th>
                        <th style={styles.spreadHeaderCell}>Ecosystem Parameter Value</th>
                        <th style={styles.spreadHeaderCell}>Filing Status</th>
                        <th style={styles.spreadHeaderCell}>Assigned compliance reviewer</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={styles.spreadRow}>
                        <td style={styles.spreadCell}>Issuer Corporate Structure</td>
                        <td style={styles.spreadCell}>EcoSphere Technologies SPV LLC (Delaware registered)</td>
                        <td style={styles.spreadCell}><span style={{ color: '#10b981' }}>✓ Completed</span></td>
                        <td style={styles.spreadCell}>Affiliate Agent (Autonomous Vetting)</td>
                      </tr>
                      <tr style={styles.spreadRow}>
                        <td style={styles.spreadCell}>Directors & Officers Details</td>
                        <td style={styles.spreadCell}>CEO: {user.name} • Geneticist: Dr. Evelyn Chen</td>
                        <td style={styles.spreadCell}><span style={{ color: '#10b981' }}>✓ Completed</span></td>
                        <td style={styles.spreadCell}>Compliance Committee Auditor</td>
                      </tr>
                      <tr style={styles.spreadRow}>
                        <td style={styles.spreadCell}>Outstanding Capitalization Table</td>
                        <td style={styles.spreadCell}>4 Shareholders registered (Diluted equity cap: 4%)</td>
                        <td style={styles.spreadCell}><span style={{ color: '#10b981' }}>✓ Autocalculated</span></td>
                        <td style={styles.spreadCell}>System Registry Engine</td>
                      </tr>
                      <tr style={styles.spreadRow}>
                        <td style={styles.spreadCell}>Prior Crowdfunding Exemptions</td>
                        <td style={styles.spreadCell}>None filed last 36 months (Clean sweep watchlists)</td>
                        <td style={styles.spreadCell}><span style={{ color: '#10b981' }}>✓ Watchlist Clear</span></td>
                        <td style={styles.spreadCell}>Layer 3 Watching Engine</td>
                      </tr>
                      <tr style={styles.spreadRow}>
                        <td style={styles.spreadCell}>Financial Condition Disclosures</td>
                        <td style={styles.spreadCell}>Total outstanding AP debt liabilities: $375.00</td>
                        <td style={styles.spreadCell}><span style={{ color: '#d4af37' }}>⚠️ Requires affiliate audit</span></td>
                        <td style={styles.spreadCell}>
                          <button onClick={() => alert('Bookkeeping audit assigned to advisory committee network.')} style={{ ...styles.actionBtn, padding: '0.15rem 0.45rem', fontSize: '0.62rem' }}>
                            Delegate Task
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <button onClick={() => alert('Generating cryptographic Form C filing bundle...\nBundle locked and SHA-256 stamped:\n0x88dfa9e2239f11...')} className="btn-primary" style={{ alignSelf: 'flex-end', marginTop: '0.5rem', background: '#a78bfa', color: '#000000', fontWeight: '800' }}>
                  📥 Export Completed Form C Bundle
                </button>
              </div>

            </div>
          )}
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
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '1rem',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '850',
    margin: 0,
  },
  sub: {
    fontSize: '0.9rem',
    color: 'var(--color-text-secondary)',
    marginTop: '0.25rem',
  },
  segmentedTabWrapper: {
    borderBottom: '1px solid var(--border-color)',
    marginTop: '-1.5rem',
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
  launchButtonsRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1.5rem',
    margin: '2rem 0',
  },
  launcherBtnAction: {
    width: '280px',
    height: '45px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
    fontSize: '0.9rem',
    cursor: 'pointer',
  },
  launcherCard: {
    padding: '2.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
  },
  launcherTitle: {
    fontSize: '1.35rem',
    fontWeight: '850',
    margin: 0,
  },
  launcherDesc: {
    fontSize: '0.85rem',
    color: 'var(--color-text-secondary)',
    lineHeight: '1.4',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.25rem',
    marginTop: '0.5rem',
  },
  pillsRow: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '0.35rem',
  },
  pillBtn: {
    flex: 1,
    padding: '0.65rem',
    fontSize: '0.8rem',
    fontWeight: '750',
    borderRadius: '8px',
    border: '1px solid',
    cursor: 'pointer',
    transition: 'all 0.2s',
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
  },
  fullWidth: {
    gridColumn: 'span 2',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
  },
  errorText: {
    fontSize: '0.76rem',
    color: '#f43f5e',
    fontWeight: '700',
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
  doubleGrid: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: '2rem',
  },
  leftCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  rightCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  emptyBox: {
    padding: '3rem',
    textAlign: 'center',
    color: 'var(--color-text-muted)',
    fontSize: '0.85rem',
    fontStyle: 'italic',
  },
  campaignCard: {
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  campHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '0.85rem',
  },
  campTitle: {
    fontSize: '1.2rem',
    fontWeight: '850',
    margin: 0,
  },
  campTag: {
    fontSize: '0.78rem',
    color: 'var(--color-text-secondary)',
  },
  specsLine: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
    background: 'rgba(0,0,0,0.15)',
    padding: '1rem',
    borderRadius: '6px',
  },
  specLabel: {
    fontSize: '0.62rem',
    color: 'var(--color-text-muted)',
    textTransform: 'uppercase',
    fontWeight: '750',
    display: 'block',
  },
  specVal: {
    fontSize: '0.85rem',
    color: 'var(--color-text-primary)',
    fontWeight: '700',
  },
  capSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.85rem',
    marginTop: '0.5rem',
  },
  capTitle: {
    fontSize: '0.92rem',
    fontWeight: '800',
    color: 'var(--color-text-primary)',
    margin: 0,
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
  },
  capGrid: {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
  },
  capChartWrap: {
    width: '100px',
    height: '100px',
  },
  svg: {
    width: '100%',
    height: '100%',
  },
  shareholdersList: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  shareholderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.76rem',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '0.25rem',
  },
  shareholderName: {
    color: 'var(--color-text-secondary)',
  },
  shareholderPercent: {
    color: 'var(--color-text-primary)',
    fontWeight: '800',
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
  profileForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.85rem',
  },
  profileDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.65rem',
  },
  profileRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.82rem',
  },
  teamList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginTop: '0.5rem',
  },
  teamItem: {
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
  },
  teamHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  teamName: {
    fontSize: '0.85rem',
    fontWeight: '800',
    color: 'var(--color-text-primary)',
    margin: 0,
  },
  teamRole: {
    fontSize: '0.68rem',
    color: 'var(--color-text-secondary)',
  },
  teamBio: {
    fontSize: '0.72rem',
    color: 'var(--color-text-muted)',
    margin: 0,
    lineHeight: '1.4',
  },
  removeBtn: {
    background: 'transparent',
    border: 'none',
    color: '#ef4444',
    fontSize: '1rem',
    cursor: 'pointer',
    lineHeight: '1',
  },

  // Founder Pro Styles
  proPanelContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  upsellCard: {
    padding: '3rem',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1.5rem',
    background: 'radial-gradient(circle, rgba(139,92,246,0.03) 0%, rgba(0,0,0,0.5) 100%)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
  },
  upsellBadge: {
    fontSize: '0.68rem',
    fontWeight: '850',
    background: 'rgba(167, 139, 250, 0.1)',
    color: '#a78bfa',
    padding: '0.2rem 0.65rem',
    borderRadius: '4px',
    border: '1px solid rgba(167, 139, 250, 0.25)',
  },
  upsellTitle: {
    fontSize: '1.45rem',
    fontWeight: '850',
    color: 'var(--color-text-primary)',
    maxWidth: '640px',
    lineHeight: '1.3',
  },
  upsellDesc: {
    fontSize: '0.85rem',
    color: 'var(--color-text-secondary)',
    maxWidth: '560px',
    lineHeight: '1.5',
  },
  upsellMetricsRow: {
    display: 'flex',
    gap: '2.5rem',
    marginTop: '0.5rem',
  },
  upsellMetricBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    textAlign: 'center',
  },
  upsellLabel: {
    fontSize: '0.62rem',
    color: 'var(--color-text-muted)',
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  upgradeBtn: {
    background: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)',
    color: '#000000',
    fontWeight: '900',
    fontSize: '0.9rem',
    padding: '0.75rem 2rem',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 5px 15px rgba(139,92,246,0.4)',
    transition: 'all 0.2s',
  },

  // Pro Console Dashboard
  proTopGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1.1fr',
    gap: '1.5rem',
  },
  billsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  billItem: {
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '0.85rem 1.25rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  billLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  billNameText: {
    fontSize: '0.82rem',
    fontWeight: '800',
    color: 'var(--color-text-primary)',
    margin: 0,
  },
  billMeta: {
    fontSize: '0.68rem',
    color: 'var(--color-text-muted)',
    display: 'block',
    marginTop: '0.1rem',
  },
  billRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '0.35rem',
  },
  billPaidBadge: {
    fontSize: '0.62rem',
    padding: '0.1rem 0.4rem',
    background: 'rgba(16,185,129,0.08)',
    color: '#10b981',
    border: '1px solid rgba(16,185,129,0.2)',
    borderRadius: '4px',
    fontWeight: '800',
  },
  runwayCard: {
    background: 'rgba(0,0,0,0.25)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginTop: '0.5rem',
  },
  runwayWrap: {
    marginTop: '0.35rem',
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
  downloadBtn: {
    padding: '0.5rem 1rem',
    fontSize: '0.8rem',
  },

  // Chore Delegation
  choreForm: {
    background: 'var(--bg-primary)',
    padding: '0.75rem',
    borderRadius: '6px',
    border: '1px solid var(--border-color)',
    marginBottom: '0.5rem',
  },
  choresList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  choreItem: {
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '0.85rem 1.25rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  choreItemTitle: {
    fontSize: '0.82rem',
    fontWeight: '800',
    color: 'var(--color-text-primary)',
    margin: 0,
  },
  choreItemMeta: {
    fontSize: '0.68rem',
    color: 'var(--color-text-muted)',
  },

  // Spreadsheet Reg CF
  spreadTable: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '0.78rem',
    marginTop: '0.5rem',
  },
  spreadHeaderRow: {
    borderBottom: '1px solid var(--border-color)',
  },
  spreadHeaderCell: {
    padding: '0.65rem 0.85rem',
    fontWeight: '800',
    color: 'var(--color-text-secondary)',
    textTransform: 'uppercase',
    fontSize: '0.62rem',
    letterSpacing: '0.03em',
  },
  spreadRow: {
    borderBottom: '1px solid var(--border-color)',
  },
  spreadCell: {
    padding: '0.75rem 0.85rem',
    verticalAlign: 'middle',
    color: 'var(--color-text-primary)',
  }
};
