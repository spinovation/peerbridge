'use client';

import { useState, useEffect } from 'react';

export default function EntrepreneurModule({ state }) {
  const { campaigns, createCampaign, user, entrepreneurProfile, updateEntrepreneurProfile } = state;
  const myCampaigns = campaigns.filter(c => c.founder === user.name);

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
      category
    );

    if (res.success) {
      // Sync the profile too
      updateEntrepreneurProfile({
        company_name: companyName,
        business_stage: 'revenue',
        industry: category,
        funding_goal: parseFloat(target),
        valuation: parseFloat(valuation),
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

  // Helper to render cap table pie chart
  const renderCapTableSVG = (capTable) => {
    let accumulatedPercent = 0;
    const colors = ['#ffffff', '#e5e5e5', '#a3a3a3', '#525252', '#262626'];
    
    return (
      <svg viewBox="0 0 100 100" style={styles.svg}>
        <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="15" />
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
        <circle cx="50" cy="50" r="28" fill="#000000" />
      </svg>
    );
  };

  return (
    <div style={styles.container} className="animate-fade-in-up">
      {/* Header Row */}
      <div style={styles.headerRow}>
        <div>
          <h2 style={styles.title}>Ecosystem Business Portal</h2>
          <p style={styles.sub}>Draft business analytical plans, launch private investment offerings, and track equity distributions.</p>
        </div>
        <button
          onClick={() => setShowLauncher(!showLauncher)}
          className="btn-primary"
          style={styles.launchBtn}
        >
          {showLauncher ? 'View Company Portals' : '🚀 Launch Capital Round'}
        </button>
      </div>

      {success && (
        <div style={styles.successToast}>
          ✨ {success}
        </div>
      )}

      {showLauncher ? (
        /* Form Campaign Builder */
        <div className="glass-panel" style={styles.cardLauncher}>
          <h3 style={styles.cardTitle}>🚀 Draft Form C Crowdfunding Round</h3>
          <p style={styles.cardDesc}>
            Prepare your offering metadata. Peer Bridge will automatically calculate your cap table distribution, equity dilution factors, and publish your card to accredited investors.
          </p>

          <form onSubmit={handleLaunchRound} style={styles.formGrid}>
            <div style={styles.formCol}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Company Legal Name</label>
                <input
                  type="text"
                  placeholder="e.g. EcoSphere Technologies"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Elevator Pitch Tagline</label>
                <input
                  type="text"
                  placeholder="e.g. Carbon negative liquid gas capture for city transit fleets."
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>The Core Problem</label>
                <textarea
                  placeholder="What market inefficiency or technological deficit are you resolving?"
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  style={styles.textarea}
                  rows="3"
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Your Technical Solution</label>
                <textarea
                  placeholder="Detail your proprietary technology, intellectual property, or business process."
                  value={solution}
                  onChange={(e) => setSolution(e.target.value)}
                  style={styles.textarea}
                  rows="3"
                  required
                />
              </div>
            </div>

            <div style={styles.formCol}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Target Capital Raised ($)</label>
                <input
                  type="number"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Pre-Money Valuation ($)</label>
                <input
                  type="number"
                  value={valuation}
                  onChange={(e) => setValuation(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.inputGroup2Col}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Share Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={sharePrice}
                    onChange={(e) => setSharePrice(e.target.value)}
                    style={styles.input}
                    required
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Min Investment ($)</label>
                  <input
                    type="number"
                    value={minInvest}
                    onChange={(e) => setMinInvest(e.target.value)}
                    style={styles.input}
                    required
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Market Segment Sector</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={styles.select}
                >
                  <option value="CleanTech">Clean Energy & Environment</option>
                  <option value="MedTech">Biomedical & Neural Systems</option>
                  <option value="SaaS">SaaS & Enterprise Automation</option>
                  <option value="Fintech">Financial Infrastructure</option>
                  <option value="DeepTech">Advanced Robotics & Quantum Computing</option>
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Company Profile Detailed Pitch</label>
                <textarea
                  placeholder="Provide an in-depth breakdown of your product, team achievements, and future timelines..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={styles.textarea}
                  rows="3"
                  required
                />
              </div>
            </div>

            <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              {error && <span style={styles.errorText}>{error}</span>}
              <button
                type="button"
                onClick={() => setShowLauncher(false)}
                className="btn-secondary"
                style={{ flex: 1 }}
              >
                Cancel Setup
              </button>
              <button type="submit" className="btn-primary" style={{ flex: 2 }}>
                Confirm Form C & Launch Offering
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Double Column Grid: Left is Company Campaigns + Cap Tables, Right is Business Profile & Team */
        <div style={styles.dashboardGrid}>
          {/* Left Column: Campaigns and Cap Table */}
          <div style={styles.leftCol}>
            {myCampaigns.length === 0 ? (
              <div className="glass-panel" style={styles.emptyCard}>
                <h3>No Registered Campaigns</h3>
                <p>{"You have not launched any Reg CF capital rounds yet. Click 'Launch Capital Round' to begin raising."}</p>
                <button
                  onClick={() => setShowLauncher(true)}
                  className="btn-primary"
                  style={{ marginTop: '1rem' }}
                >
                  Get Started
                </button>
              </div>
            ) : (
              myCampaigns.map((camp) => {
                const pct = Math.min(100, Math.round((camp.raised / camp.target) * 100));
                const sharesIssued = Math.floor(camp.valuation / camp.sharePrice);
                const colors = ['#ffffff', '#e5e5e5', '#a3a3a3', '#525252', '#262626'];
                
                return (
                  <div key={camp.id} className="glass-panel" style={styles.campaignCard}>
                    <div style={styles.campBadgeRow}>
                      <span className="badge badge-verified">✓ Reg CF Active</span>
                      <span style={styles.campSector}>{camp.category}</span>
                    </div>

                    <h2 style={styles.companyTitle}>{camp.companyName}</h2>
                    <p style={styles.campTagline}>{camp.tagline}</p>
                    
                    {/* Metrics Dashboard */}
                    <div style={styles.statsGrid}>
                      <div style={styles.statBox}>
                        <span style={styles.statLabel}>Funding Raised</span>
                        <span style={styles.statVal}>${camp.raised.toLocaleString()}</span>
                      </div>
                      <div style={styles.statBox}>
                        <span style={styles.statLabel}>Target Round Goal</span>
                        <span style={styles.statVal}>${camp.target.toLocaleString()}</span>
                      </div>
                      <div style={styles.statBox}>
                        <span style={styles.statLabel}>Pre-Money Valuation</span>
                        <span style={styles.statVal}>${(camp.valuation / 1000000).toFixed(2)}M</span>
                      </div>
                      <div style={styles.statBox}>
                        <span style={styles.statLabel}>Vetted Investors</span>
                        <span style={styles.statVal}>{camp.investorsCount}</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div style={styles.progressSection}>
                      <div style={styles.progressBar}>
                        <div style={{ ...styles.progressFill, width: `${pct}%` }}></div>
                      </div>
                      <div style={styles.progressLabels}>
                        <span>Offering Round Progress</span>
                        <span>{pct}% Fulfilled</span>
                      </div>
                    </div>

                    {/* Problem and Solution */}
                    <div style={styles.qaTabs}>
                      <div style={styles.qaTabItem}>
                        <h4 style={styles.qaTabTitle}>🚨 Problem Statement</h4>
                        <p style={styles.qaText}>{camp.problem}</p>
                      </div>
                      <div style={styles.qaTabItem}>
                        <h4 style={styles.qaTabTitle}>💡 Tech Solution</h4>
                        <p style={styles.qaText}>{camp.solution}</p>
                      </div>
                    </div>

                    {/* Cap Table Segment nested inside Campaign */}
                    <div style={styles.nestedCapSection}>
                      <h3 style={styles.capTitle}>📊 Shareholder Cap Table</h3>
                      <p style={styles.capSub}>
                        Total Stocks: <strong>{sharesIssued.toLocaleString()} Shares</strong>. Showing real-time distributions.
                      </p>

                      <div style={styles.capRowFlex}>
                        <div style={styles.svgContainer}>
                          {renderCapTableSVG(camp.capTable)}
                          <div style={styles.svgCenterText}>
                            <span style={styles.svgInnerLabel}>Raised</span>
                            <span style={styles.svgInnerVal}>{pct}%</span>
                          </div>
                        </div>

                        <div style={styles.capLedger}>
                          {camp.capTable.map((item, idx) => (
                            <div key={idx} style={styles.ledgerRow}>
                              <div style={styles.ledgerHeader}>
                                <div style={{ ...styles.ledgerColorBox, background: colors[idx % colors.length] }}></div>
                                <span style={styles.ledgerName}>{item.name}</span>
                              </div>
                              <div style={styles.ledgerValues}>
                                <span style={styles.ledgerShares}>
                                  {item.shares ? item.shares.toLocaleString() : Math.floor((sharesIssued * item.percentage) / 100).toLocaleString()} Shs
                                </span>
                                <span style={styles.ledgerPct}>{item.percentage}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Business Profile Editor (Table #4) & Founding Team */}
          <div style={styles.rightCol}>
            {/* Table #4 Business Profile Card */}
            <div className="glass-panel" style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>🏢 Entrepreneur Profile (Table #4)</h3>
                <button
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className="btn-secondary"
                  style={styles.editBtn}
                >
                  {isEditingProfile ? 'Cancel Edit' : 'Edit Business Sheet'}
                </button>
              </div>

              {!isEditingProfile ? (
                <div style={styles.profileDisplay}>
                  <div style={styles.profileMetaRow}>
                    <p style={styles.profileField}><strong>Registered Name:</strong> {companyNameProfile || 'Not registered yet'}</p>
                    <p style={styles.profileField}>
                      <strong>Business Stage:</strong> 
                      <span className="badge badge-verified" style={{ marginLeft: '0.5rem', textTransform: 'capitalize' }}>{businessStage}</span>
                    </p>
                    <p style={styles.profileField}><strong>Industry Sector:</strong> {industry}</p>
                    <p style={styles.profileField}><strong>Funding Target:</strong> ${parseFloat(fundingGoal).toLocaleString()}</p>
                    <p style={styles.profileField}><strong>Target Valuation:</strong> ${parseFloat(valuationProfile).toLocaleString()}</p>
                    {pitchDeckUrl && (
                      <p style={styles.profileField}>
                        <strong>Pitch Deck:</strong>{' '}
                        <a href={pitchDeckUrl} target="_blank" rel="noreferrer" style={styles.link}>
                          View PDF Document 🔗
                        </a>
                      </p>
                    )}
                  </div>
                  <div style={styles.profileSummarySection}>
                    <h4 style={styles.sectionHeader}>Company Overview</h4>
                    <p style={styles.summaryText}>{companySummary || 'Provide a company overview by editing your profile sheet.'}</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSaveProfile} style={styles.profileForm}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Registered Company Name</label>
                    <input
                      type="text"
                      value={companyNameProfile}
                      onChange={(e) => setCompanyNameProfile(e.target.value)}
                      style={styles.input}
                      required
                    />
                  </div>

                  <div style={styles.formRow2Col}>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Startup Stage</label>
                      <select
                        value={businessStage}
                        onChange={(e) => setBusinessStage(e.target.value)}
                        style={styles.select}
                      >
                        <option value="idea">Idea Concept</option>
                        <option value="prototype">Working Prototype</option>
                        <option value="revenue">Generating Revenue</option>
                        <option value="scaling">Scaling Operations</option>
                        <option value="startup">Growth Stage</option>
                      </select>
                    </div>

                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Industry</label>
                      <input
                        type="text"
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        style={styles.input}
                        required
                      />
                    </div>
                  </div>

                  <div style={styles.formRow2Col}>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Funding Goal ($)</label>
                      <input
                        type="number"
                        value={fundingGoal}
                        onChange={(e) => setFundingGoal(e.target.value)}
                        style={styles.input}
                      />
                    </div>

                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Current Valuation ($)</label>
                      <input
                        type="number"
                        value={valuationProfile}
                        onChange={(e) => setValuationProfile(e.target.value)}
                        style={styles.input}
                      />
                    </div>
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Pitch Deck S3 URL</label>
                    <input
                      type="text"
                      value={pitchDeckUrl}
                      onChange={(e) => setPitchDeckUrl(e.target.value)}
                      placeholder="https://..."
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Company Summary Overview</label>
                    <textarea
                      value={companySummary}
                      onChange={(e) => setCompanySummary(e.target.value)}
                      style={styles.textarea}
                      rows="4"
                    />
                  </div>

                  <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }}>
                    Sync Business Profile
                  </button>
                </form>
              )}
            </div>

            {/* Core Founding Team JSON Array Editor */}
            <div className="glass-panel" style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>👥 Founding Team Directory</h3>
                <button
                  onClick={() => setShowAddMember(!showAddMember)}
                  className="btn-secondary"
                  style={styles.editBtn}
                >
                  {showAddMember ? 'Cancel Member' : '+ Add Partner'}
                </button>
              </div>

              {showAddMember && (
                <form onSubmit={handleAddMember} style={styles.memberForm}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Partner Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      value={newMemberName}
                      onChange={(e) => setNewMemberName(e.target.value)}
                      style={styles.smallInput}
                      required
                    />
                  </div>

                  <div style={styles.formRow2Col}>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Ecosystem Role</label>
                      <input
                        type="text"
                        placeholder="e.g. CTO & Co-Founder"
                        value={newMemberRole}
                        onChange={(e) => setNewMemberRole(e.target.value)}
                        style={styles.smallInput}
                        required
                      />
                    </div>

                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Professional Profile URL</label>
                      <input
                        type="text"
                        placeholder="https://peerbridge.ai/directory/..."
                        value={newMemberLinkedin}
                        onChange={(e) => setNewMemberLinkedin(e.target.value)}
                        style={styles.smallInput}
                      />
                    </div>
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Professional Bio</label>
                    <textarea
                      placeholder="Brief work pedigree..."
                      value={newMemberBio}
                      onChange={(e) => setNewMemberBio(e.target.value)}
                      style={styles.smallTextarea}
                      rows="2"
                    />
                  </div>

                  <button type="submit" className="btn-primary" style={styles.smallBtn}>
                    Save Team Member
                  </button>
                </form>
              )}

              <div style={styles.teamList}>
                {team.length === 0 ? (
                  <p style={styles.emptyText}>No founding team members recorded.</p>
                ) : (
                  team.map((member, idx) => (
                    <div key={idx} style={styles.teamMemberCard}>
                      <div style={styles.memberHeader}>
                        <div>
                          <strong style={styles.memberNameText}>{member.name}</strong>
                          <span style={styles.memberRoleText}>{member.role}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          {member.linkedin && (
                            <a href={member.linkedin} target="_blank" rel="noreferrer" style={styles.memberLink}>
                              🔗 Profile
                            </a>
                          )}
                          <button
                            onClick={() => handleRemoveMember(idx)}
                            style={styles.deleteMemberBtn}
                            title="Remove Member"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                      {member.bio && <p style={styles.memberBioText}>{member.bio}</p>}
                    </div>
                  ))
                )}
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
    gap: '2rem',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1.5rem',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '800',
  },
  sub: {
    fontSize: '0.9rem',
    color: '#a3a3a3',
    marginTop: '0.2rem',
  },
  launchBtn: {
    padding: '0.7rem 1.4rem',
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
  cardLauncher: {
    padding: '2.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  cardTitle: {
    fontSize: '1.2rem',
    fontWeight: '800',
  },
  cardDesc: {
    fontSize: '0.85rem',
    color: '#a3a3a3',
    lineHeight: '1.5',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '2rem',
  },
  formCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    width: '100%',
  },
  inputGroup2Col: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  formRow2Col: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
    width: '100%',
  },
  label: {
    fontSize: '0.72rem',
    fontWeight: '700',
    color: '#737373',
    textTransform: 'uppercase',
  },
  input: {
    width: '100%',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '6px',
    padding: '0.7rem 1rem',
    color: '#ffffff',
    fontSize: '0.9rem',
    outline: 'none',
  },
  textarea: {
    width: '100%',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '6px',
    padding: '0.7rem 1rem',
    color: '#ffffff',
    fontSize: '0.9rem',
    outline: 'none',
    resize: 'none',
    fontFamily: 'inherit',
  },
  select: {
    width: '100%',
    background: '#0a0a0a',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '6px',
    padding: '0.7rem 1rem',
    color: '#ffffff',
    fontSize: '0.9rem',
    outline: 'none',
    cursor: 'pointer',
  },
  errorText: {
    fontSize: '0.8rem',
    color: '#f43f5e',
    fontWeight: '500',
  },
  dashboardGrid: {
    display: 'grid',
    gridTemplateColumns: '1.4fr 1fr',
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
  emptyCard: {
    padding: '4rem',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
  },
  campaignCard: {
    padding: '2.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  campBadgeRow: {
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
  companyTitle: {
    fontSize: '2rem',
    fontWeight: '800',
  },
  campTagline: {
    fontSize: '1.05rem',
    color: '#a3a3a3',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1.25rem',
  },
  statBox: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: '8px',
    padding: '1.25rem',
  },
  statLabel: {
    fontSize: '0.72rem',
    color: '#737373',
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  statVal: {
    display: 'block',
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#ffffff',
    marginTop: '0.25rem',
  },
  progressSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  progressBar: {
    height: '6px',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: '#ffffff',
    borderRadius: '3px',
  },
  progressLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.75rem',
    color: '#737373',
  },
  qaTabs: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    borderTop: '1px solid rgba(255,255,255,0.05)',
    paddingTop: '1.5rem',
  },
  qaTabItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  qaTabTitle: {
    fontSize: '0.9rem',
    fontWeight: '700',
    color: '#ffffff',
  },
  qaText: {
    fontSize: '0.88rem',
    color: '#a3a3a3',
    lineHeight: '1.5',
  },
  nestedCapSection: {
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    paddingTop: '1.5rem',
    marginTop: '0.5rem',
  },
  capRowFlex: {
    display: 'flex',
    gap: '2rem',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  svgContainer: {
    width: '150px',
    height: '150px',
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
  capLedger: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    minWidth: '200px',
  },
  ledgerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '0.4rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
  },
  ledgerHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  ledgerColorBox: {
    width: '8px',
    height: '8px',
    borderRadius: '2px',
  },
  ledgerName: {
    fontSize: '0.82rem',
    color: '#a3a3a3',
  },
  ledgerValues: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
  },
  ledgerShares: {
    fontSize: '0.82rem',
    color: '#ffffff',
    fontFamily: 'monospace',
  },
  ledgerPct: {
    fontSize: '0.82rem',
    fontWeight: '700',
    color: '#ffffff',
    width: '45px',
    textAlign: 'right',
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
  editBtn: {
    padding: '0.4rem 0.8rem',
    fontSize: '0.75rem',
  },
  profileDisplay: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  profileMetaRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    fontSize: '0.88rem',
    color: '#a3a3a3',
  },
  profileField: {
    display: 'flex',
    alignItems: 'center',
  },
  link: {
    color: '#ffffff',
    textDecoration: 'underline',
    fontWeight: '600',
  },
  profileSummarySection: {
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    paddingTop: '1rem',
  },
  sectionHeader: {
    fontSize: '0.7rem',
    fontWeight: '700',
    color: '#737373',
    textTransform: 'uppercase',
    marginBottom: '0.5rem',
  },
  summaryText: {
    fontSize: '0.88rem',
    color: '#a3a3a3',
    lineHeight: '1.5',
  },
  profileForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  memberForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: '8px',
    padding: '1.25rem',
  },
  smallInput: {
    width: '100%',
    background: '#0a0a0a',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '4px',
    padding: '0.5rem 0.75rem',
    color: '#ffffff',
    fontSize: '0.85rem',
    outline: 'none',
  },
  smallTextarea: {
    width: '100%',
    background: '#0a0a0a',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '4px',
    padding: '0.5rem 0.75rem',
    color: '#ffffff',
    fontSize: '0.85rem',
    outline: 'none',
    resize: 'none',
    fontFamily: 'inherit',
  },
  smallBtn: {
    padding: '0.4rem 0.8rem',
    fontSize: '0.8rem',
    alignSelf: 'flex-start',
  },
  teamList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  emptyText: {
    fontSize: '0.85rem',
    color: '#525252',
    fontStyle: 'italic',
  },
  teamMemberCard: {
    background: 'rgba(255,255,255,0.01)',
    border: '1px solid rgba(255,255,255,0.03)',
    borderRadius: '8px',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  memberHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  memberNameText: {
    fontSize: '0.95rem',
    color: '#ffffff',
    display: 'block',
  },
  memberRoleText: {
    fontSize: '0.78rem',
    color: '#737373',
    display: 'block',
  },
  memberLink: {
    fontSize: '0.78rem',
    color: '#ffffff',
    textDecoration: 'underline',
  },
  deleteMemberBtn: {
    background: 'transparent',
    border: 'none',
    color: '#737373',
    fontSize: '0.8rem',
    cursor: 'pointer',
    padding: '0.2rem',
    ':hover': {
      color: '#ffffff'
    }
  },
  memberBioText: {
    fontSize: '0.82rem',
    color: '#a3a3a3',
    lineHeight: '1.4',
  }
};
