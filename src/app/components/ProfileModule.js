'use client';

import { useState, useEffect } from 'react';
import BankingModule from './BankingModule';
import TaxModule from './TaxModule';

export default function ProfileModule({ state }) {
  const { 
    customer, 
    basicProfile, 
    professionalProfile, 
    investorProfile,
    settings, 
    updateProfiles, 
    updateSettings,
    directory,
    connections,
    toggleConnectionNode,
    connectionRequests,
    sendConnectionRequest,
    acceptConnectionRequest,
    declineConnectionRequest,
    disconnectConnectionNode,
    directoryRoleFilter,
    setDirectoryRoleFilter
  } = state;
  
  // Local profile sub-tabs
  const [activeSubTab, setActiveSubTab] = useState(state.profileActiveSubTab || 'my-profile'); // 'my-profile' or 'network-directory'

  useEffect(() => {
    if (state.profileActiveSubTab) {
      setTimeout(() => {
        setActiveSubTab(state.profileActiveSubTab);
      }, 0);
    }
  }, [state.profileActiveSubTab]);

  const [searchQuery, setSearchQuery] = useState('');



  // Local profile states
  const [firstName, setFirstName] = useState(customer.first_name);
  const [lastName, setLastName] = useState(customer.last_name);
  const [phone, setPhone] = useState(customer.phone);
  const [dob, setDob] = useState(basicProfile.dob);
  const [nationality, setNationality] = useState(basicProfile.nationality);
  const [address, setAddress] = useState(basicProfile.address);
  const [bio, setBio] = useState(basicProfile.bio);
  
  // Professional resume states
  const [headline, setHeadline] = useState(professionalProfile.headline);
  const [summary, setSummary] = useState(professionalProfile.summary);
  const [addressCred, setAddressCred] = useState(basicProfile.address || '');
  const [ssn, setSsn] = useState(customer.ssn || '');
  const [newSkill, setNewSkill] = useState('');
  const [skills, setSkills] = useState(professionalProfile.skills || []);
  const [experience, setExperience] = useState(professionalProfile.experience || []);
  const [education, setEducation] = useState(professionalProfile.education || []);

  // Job experience form inputs
  const [jobTitle, setJobTitle] = useState('');
  const [jobCompany, setJobCompany] = useState('');
  const [jobStart, setJobStart] = useState('');
  const [jobEnd, setJobEnd] = useState('');
  const [jobCurrent, setJobCurrent] = useState(true);
  const [jobDesc, setJobDesc] = useState('');

  // Collapsible card expand/collapse states
  const [showProfessionalProf, setShowProfessionalProf] = useState(true);
  const [showFounderProf, setShowFounderProf] = useState(false);
  const [showInvestorProf, setShowInvestorProf] = useState(false);
  const [showAffiliateProf, setShowAffiliateProf] = useState(false);
  const [showNodeSettings, setShowNodeSettings] = useState(false);
  const [showCognitoSecurity, setShowCognitoSecurity] = useState(false);

  // Entrepreneur role edit states
  const [companyName, setCompanyName] = useState(state.entrepreneurProfile?.company_name || '');
  const [businessStage, setBusinessStage] = useState(state.entrepreneurProfile?.business_stage || 'revenue');
  const [entIndustry, setEntIndustry] = useState(state.entrepreneurProfile?.industry || '');
  const [fundingGoal, setFundingGoal] = useState(state.entrepreneurProfile?.funding_goal || 0);
  const [valuation, setValuation] = useState(state.entrepreneurProfile?.valuation || 0);
  const [companySummary, setCompanySummary] = useState(state.entrepreneurProfile?.company_summary || '');

  // Investor role edit states
  const [investorType, setInvestorType] = useState(state.investorProfile?.investor_type || 'angel');
  const [minInvest, setMinInvest] = useState(state.investorProfile?.investment_range?.min || 1000);
  const [maxInvest, setMaxInvest] = useState(state.investorProfile?.investment_range?.max || 50000);
  const [prefIndustries, setPrefIndustries] = useState(state.investorProfile?.preferred_industries || []);
  const [newPrefIndustry, setNewPrefIndustry] = useState('');
  const [riskAppetite, setRiskAppetite] = useState(state.investorProfile?.risk_appetite || 'medium');
  const [portfolioSize, setPortfolioSize] = useState(state.investorProfile?.portfolio_size || 0);

  // Affiliate role edit states
  const [entityType, setEntityType] = useState(state.affiliateProfile?.entity_type || 'individual');
  const [specialty, setSpecialty] = useState(state.affiliateProfile?.specialty || '');
  const [firmName, setFirmName] = useState(state.affiliateProfile?.firm || '');
  const [affiliateBio, setAffiliateBio] = useState(state.affiliateProfile?.bio || '');

  // 2FA state variables
  const [show2FAWizard, setShow2FAWizard] = useState(false);
  const [totpToken, setTotpToken] = useState('');
  const [twoFaError, setTwoFaError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingFounder, setIsEditingFounder] = useState(false);
  const [isEditingInvestor, setIsEditingInvestor] = useState(false);
  const [isEditingAffiliate, setIsEditingAffiliate] = useState(false);
  const [showExpForm, setShowExpForm] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSsnChange = (val) => {
    const cleaned = val.replace(/\D/g, '');
    let formatted = cleaned;
    if (cleaned.length > 3 && cleaned.length <= 5) {
      formatted = `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    } else if (cleaned.length > 5) {
      formatted = `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5, 9)}`;
    }
    setSsn(formatted);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    
    // Write directly to customers, basic_profile, and professional_profile tables!
    updateProfiles(
      { first_name: firstName, last_name: lastName, phone, ssn },
      { dob, nationality, address: addressCred, bio },
      { headline, summary, skills, experience, education }
    );

    // Save Entrepreneur Profile if they are an Entrepreneur
    if (customer.role_flags?.includes('Entrepreneur')) {
      state.updateEntrepreneurProfile({
        company_name: companyName,
        business_stage: businessStage,
        industry: entIndustry,
        funding_goal: parseFloat(fundingGoal) || 0,
        valuation: parseFloat(valuation) || 0,
        company_summary: companySummary
      });
    }

    // Save Investor Profile if they are an Investor
    if (customer.role_flags?.includes('Investor')) {
      state.updateInvestorProfile({
        investor_type: investorType,
        investment_range: { min: parseFloat(minInvest) || 0, max: parseFloat(maxInvest) || 0, currency: 'USD' },
        preferred_industries: prefIndustries,
        risk_appetite: riskAppetite,
        portfolio_size: parseFloat(portfolioSize) || 0
      });
    }

    // Save Affiliate Profile if they are an Affiliate
    if (customer.role_flags?.includes('Affiliate')) {
      state.updateAffiliateProfile({
        entity_type: entityType,
        specialty: specialty,
        firm: firmName,
        bio: affiliateBio
      });
    }
    
    setIsEditing(false);
    setSuccessMsg('Vetted professional credentials synced successfully to the Database!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleSaveFounderProfile = (e) => {
    e.preventDefault();
    state.updateEntrepreneurProfile({
      company_name: companyName,
      business_stage: businessStage,
      industry: entIndustry,
      funding_goal: parseFloat(fundingGoal) || 0,
      valuation: parseFloat(valuation) || 0,
      company_summary: companySummary
    });
    setIsEditingFounder(false);
    setSuccessMsg('Startup Founder credentials updated successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleSaveInvestorProfile = (e) => {
    e.preventDefault();
    state.updateInvestorProfile({
      investor_type: investorType,
      investment_range: { min: parseFloat(minInvest) || 0, max: parseFloat(maxInvest) || 0, currency: 'USD' },
      preferred_industries: prefIndustries,
      risk_appetite: riskAppetite,
      portfolio_size: parseFloat(portfolioSize) || 0
    });
    setIsEditingInvestor(false);
    setSuccessMsg('Accredited Investor credentials updated successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleSaveAffiliateProfile = (e) => {
    e.preventDefault();
    state.updateAffiliateProfile({
      entity_type: entityType,
      specialty: specialty,
      firm: firmName,
      bio: affiliateBio
    });
    setIsEditingAffiliate(false);
    setSuccessMsg('Vetted Advisor credentials updated successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleAddPrefIndustry = (e) => {
    e.preventDefault();
    if (!newPrefIndustry.trim() || prefIndustries.includes(newPrefIndustry.trim())) return;
    const updated = [...prefIndustries, newPrefIndustry.trim()];
    setPrefIndustries(updated);
    setNewPrefIndustry('');
  };

  const handleRemovePrefIndustry = (indToRemove) => {
    const updated = prefIndustries.filter(i => i !== indToRemove);
    setPrefIndustries(updated);
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!newSkill.trim() || skills.includes(newSkill.trim())) return;
    const updatedSkills = [...skills, newSkill.trim()];
    setSkills(updatedSkills);
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove) => {
    const updatedSkills = skills.filter(s => s !== skillToRemove);
    setSkills(updatedSkills);
  };

  const handleAddExperience = (e) => {
    e.preventDefault();
    if (!jobTitle.trim() || !jobCompany.trim()) return;

    const newJob = {
      title: jobTitle,
      company: jobCompany,
      start_date: jobStart || '2026-01',
      end_date: jobCurrent ? null : (jobEnd || '2026-05'),
      current: jobCurrent,
      description: jobDesc
    };

    const updatedExp = [newJob, ...experience];
    setExperience(updatedExp);
    setJobTitle('');
    setJobCompany('');
    setJobStart('');
    setJobEnd('');
    setJobCurrent(true);
    setJobDesc('');
    setShowExpForm(false);
  };

  const handleToggle2FA = () => {
    if (customer.phone) {
      if (show2FAWizard) {
        setShow2FAWizard(false);
      } else {
        setShow2FAWizard(true);
      }
    } else {
      setTwoFaError('Please add a contact phone number in your profile before enabling 2FA.');
      setTimeout(() => setTwoFaError(''), 4000);
    }
  };

  const handleConfirm2FA = (e) => {
    e.preventDefault();
    if (totpToken.trim() === '123456') {
      updateProfiles({ status: 'verified' });
      setShow2FAWizard(false);
      setTotpToken('');
      setTwoFaError('');
      setSuccessMsg('2-Factor Authentication successfully configured!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } else {
      setTwoFaError('Invalid PIN code. Use default simulation token 123456.');
    }
  };

  const handleTogglePreference = (field) => {
    const updatedPrefs = {
      ...settings.notification_preferences,
      [field]: !settings.notification_preferences[field]
    };
    updateSettings({ notification_preferences: updatedPrefs });
  };

  // Circular verification ring renderer
  const renderMemberRing = (memberCustomer, memberBasic, memberProf, memberInv, size = 120, ringWidth = 5) => {
    const hasId = true;
    const hasJobVal = memberProf?.experience && memberProf.experience.length > 0;
    const hasAcadVal = memberProf?.education && memberProf.education.length > 0;
    const hasWealthVal = memberInv?.accreditation_status || false;
    const hasAddressAndSsn = memberBasic?.address?.trim()?.length > 3 && memberCustomer?.ssn?.trim()?.length > 0;

    const colorId = hasId ? (hasAddressAndSsn ? '#d4af37' : '#00f2fe') : 'rgba(255,255,255,0.08)'; // Gold or Cyan
    const colorJob = hasJobVal ? '#8f00ff' : 'rgba(255,255,255,0.08)'; // Purple
    const colorAcad = hasAcadVal ? '#6366f1' : 'rgba(255,255,255,0.08)'; // Indigo
    const colorWealth = hasWealthVal ? '#10b981' : 'rgba(255,255,255,0.08)'; // Emerald

    const radius = 54;
    const perimeter = 2 * Math.PI * radius; // 339.29
    const strokeDash = `${(perimeter / 4) - 6} ${perimeter}`; // Roughly 78 261

    return (
      <svg width={size} height={size} viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
        <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth={ringWidth - 1} />
        {/* Tier 1: Identity */}
        <circle cx="60" cy="60" r={radius} fill="none" stroke={colorId} strokeWidth={ringWidth} strokeDasharray="78 261" strokeDashoffset="0" strokeLinecap="round" />
        {/* Tier 4: Wealth */}
        <circle cx="60" cy="60" r={radius} fill="none" stroke={colorWealth} strokeWidth={ringWidth} strokeDasharray="78 261" strokeDashoffset="-85" strokeLinecap="round" />
        {/* Tier 3: Academic */}
        <circle cx="60" cy="60" r={radius} fill="none" stroke={colorAcad} strokeWidth={ringWidth} strokeDasharray="78 261" strokeDashoffset="-170" strokeLinecap="round" />
        {/* Tier 2: Job */}
        <circle cx="60" cy="60" r={radius} fill="none" stroke={colorJob} strokeWidth={ringWidth} strokeDasharray="78 261" strokeDashoffset="-255" strokeLinecap="round" />
      </svg>
    );
  };

  // Directory filter logic
  const filteredDirectory = directory.filter((member) => {
    const matchesSearch = 
      `${member.first_name} ${member.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.professionalProfile?.headline?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (directoryRoleFilter === 'All') return matchesSearch;
    if (directoryRoleFilter === 'Connections') {
      return matchesSearch && connections.includes(member.customer_id);
    }
    return matchesSearch && member.role_flags?.includes(directoryRoleFilter);
  });

  return (
    <div style={styles.container} className="animate-fade-in-up">
      {/* Subnavigation Bar */}
      <div style={styles.tabButtons}>
        <button
          onClick={() => {
            setActiveSubTab('my-profile');
            state.setProfileActiveSubTab('my-profile');
          }}
          style={activeSubTab === 'my-profile' ? styles.tabActive : styles.tabInactive}
        >
          👤 My Vetted Credentials
        </button>
        <button
          onClick={() => {
            setActiveSubTab('network-directory');
            state.setProfileActiveSubTab('network-directory');
          }}
          style={activeSubTab === 'network-directory' ? styles.tabActive : styles.tabInactive}
        >
          🌐 Network Directory
        </button>
        <button
          onClick={() => {
            setActiveSubTab('wallet');
            state.setProfileActiveSubTab('wallet');
          }}
          style={activeSubTab === 'wallet' ? styles.tabActive : styles.tabInactive}
        >
          💳 Wallet & Banking
        </button>
        <button
          onClick={() => {
            setActiveSubTab('tax');
            state.setProfileActiveSubTab('tax');
          }}
          style={activeSubTab === 'tax' ? styles.tabActive : styles.tabInactive}
        >
          🧾 Tax Center
        </button>
      </div>

      {activeSubTab === 'my-profile' ? (
        <>
          {/* Cover Banner */}
          <div className="glass-panel" style={styles.coverPanel}>
            <div style={styles.coverBg}></div>
            <div style={styles.profileSummaryRow}>
              <div style={{ position: 'relative', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {renderMemberRing(customer, basicProfile, professionalProfile, investorProfile)}
                {basicProfile.profile_picture_url ? (
                  <img src={basicProfile.profile_picture_url} alt="Profile" style={styles.photoAvatar} />
                ) : (
                  <div style={styles.initialsAvatar}>
                    {customer.first_name.charAt(0)}{customer.last_name.charAt(0)}
                  </div>
                )}
                {customer.status === 'verified' && <div style={styles.verifiedIcon} title="Vetted Security Badge">✓</div>}
              </div>
              
              <div style={styles.metaContainer}>
                <div style={styles.nameRow}>
                  <h2 style={styles.nameText}>{customer.first_name} {customer.last_name}</h2>
                  <span className={`badge ${customer.status === 'verified' ? 'badge-verified' : 'badge-pending'}`}>
                    {customer.status === 'verified' ? '✓ Vetted Member' : '⚠ KYC Pending'}
                  </span>
                  {customer.role_flags?.map((role) => (
                    <span key={role} className="badge badge-admin" style={{ marginLeft: '0.5rem' }}>
                      {role}
                    </span>
                  ))}
                </div>
                <p style={styles.titleSub}>{professionalProfile.headline || 'Ecosystem Node member'}</p>
                <p style={styles.bioText}>&quot;{basicProfile.bio || 'Enter bio details below.'}&quot;</p>
              </div>
            </div>
          </div>

          {successMsg && (
            <div style={styles.successToast}>
              ✨ {successMsg}
            </div>
          )}

          {/* Main Column Framework */}
          <div style={styles.grid}>
            {/* Left Column containing Profile Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {/* Profile Details & Form Resume */}
              <div className="glass-panel" style={styles.card}>
                <div 
                  style={{ ...styles.cardHeader, cursor: 'pointer', userSelect: 'none' }} 
                  onClick={() => setShowProfessionalProf(!showProfessionalProf)}
                >
                  <h3 style={styles.cardTitle}>
                    {showProfessionalProf ? '− ' : '＋ '}💼 Professional Profile
                  </h3>
                  {showProfessionalProf && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsEditing(!isEditing);
                      }}
                      className="btn-secondary"
                      style={styles.editBtn}
                    >
                      {isEditing ? 'Cancel Edit' : 'Edit Resume'}
                    </button>
                  )}
                </div>

                {showProfessionalProf && (
                  <>
                    {!isEditing ? (
                <div style={styles.resumeDisplay}>
                  {/* Headline */}
                  <div style={styles.resumeSection}>
                    <h4 style={styles.sectionHeader}>headline</h4>
                    <p style={styles.resumeTitle}>{professionalProfile.headline}</p>
                    <p style={styles.resumeText}>{professionalProfile.summary}</p>
                  </div>

                  {/* Core Demographics & Credentials */}
                  <div style={styles.resumeSection}>
                    <h4 style={styles.sectionHeader}>demographics & credentials</h4>
                    <div style={styles.demographicsGrid}>
                      <p><strong>DOB:</strong> {basicProfile.dob || 'Not set'}</p>
                      <p><strong>Nationality:</strong> {basicProfile.nationality}</p>
                      <p><strong>Phone:</strong> {customer.phone || 'Not set'}</p>
                      <p><strong>Address:</strong> {basicProfile.address || 'Not set'}</p>
                      <p><strong>Credential Badge:</strong> {customer.ssn ? '🔒 SSN Verified Node' : '⚠ Address & SSN Missing'}</p>
                    </div>
                  </div>

                  {/* Career Experience */}
                  <div style={styles.resumeSection}>
                    <h4 style={styles.sectionHeader}>Work Experience</h4>
                    {experience.length === 0 ? (
                      <p style={styles.emptyText}>No work experience recorded.</p>
                    ) : (
                      <div style={styles.experienceList}>
                        {experience.map((job, i) => (
                          <div key={i} style={styles.jobItem}>
                            <div style={styles.jobHeader}>
                              <strong style={styles.jobTitleText}>{job.title}</strong>
                              <span style={styles.jobDuration}>{job.start_date} • {job.current ? 'Present' : job.end_date}</span>
                            </div>
                            <span style={styles.jobCompany}>{job.company}</span>
                            <p style={styles.jobDescText}>{job.description}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Skills Tags */}
                  <div style={styles.resumeSection}>
                    <h4 style={styles.sectionHeader}>Vetted Skill Sets</h4>
                    <div style={styles.skillsTagRow}>
                      {skills.length === 0 ? (
                        <p style={styles.emptyText}>Add skills to showcase your professional competencies.</p>
                      ) : (
                        skills.map((skill, i) => (
                          <span key={i} style={styles.skillTag}>
                            {skill}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSaveProfile} style={styles.form}>
                  <div style={styles.formRow2Col}>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>First Name</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        style={styles.input}
                        required
                      />
                    </div>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Last Name</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        style={styles.input}
                        required
                      />
                    </div>
                  </div>

                  <div style={styles.formRow2Col}>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Email (Unique Cognito ID)</label>
                      <input
                        type="text"
                        value={customer.email}
                        disabled
                        style={{ ...styles.input, opacity: 0.5, cursor: 'not-allowed' }}
                      />
                    </div>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Phone Contact</label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. +1 (555) 000-0000"
                        style={styles.input}
                      />
                    </div>
                  </div>

                  <div style={styles.formRow2Col}>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Date of Birth</label>
                      <input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        style={styles.input}
                      />
                    </div>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Nationality</label>
                      <input
                        type="text"
                        value={nationality}
                        onChange={(e) => setNationality(e.target.value)}
                        style={styles.input}
                      />
                    </div>
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Headline Title</label>
                    <input
                      type="text"
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Professional Summary</label>
                    <textarea
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      style={styles.textarea}
                      rows="3"
                    />
                  </div>

                  <div style={styles.sectionDivider}>
                    <span>🛡 OPTIONAL CREDENTIALS (GOLD TIER OVERLAY)</span>
                  </div>

                  <div style={styles.formRow2Col}>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Physical Address</label>
                      <input
                        type="text"
                        value={addressCred}
                        onChange={(e) => setAddressCred(e.target.value)}
                        style={styles.input}
                      />
                    </div>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>SSN (Formatted)</label>
                      <input
                        type="text"
                        value={ssn}
                        maxLength={11}
                        onChange={(e) => handleSsnChange(e.target.value)}
                        style={styles.input}
                      />
                    </div>
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Bio Quote</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      style={styles.textarea}
                      rows="2"
                    />
                  </div>

                  {/* Edit Skills Tag Area */}
                  <div style={styles.skillsEditSection}>
                    <label style={styles.label}>Edit Skill sets</label>
                    <div style={styles.skillsTagRow}>
                      {skills.map((skill, i) => (
                        <span key={i} style={styles.skillTagEditable} onClick={() => handleRemoveSkill(skill)}>
                          {skill} ✕
                        </span>
                      ))}
                    </div>
                    <div style={styles.addSkillRow}>
                      <input
                        type="text"
                        placeholder="Add new skill..."
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        style={styles.smallInput}
                      />
                      <button type="button" onClick={handleAddSkill} className="btn-secondary" style={styles.smallBtn}>
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Edit Experience Block */}
                  <div style={styles.skillsEditSection}>
                    <div style={styles.expHeader}>
                      <label style={styles.label}>Work Experience Ledger</label>
                      <button type="button" onClick={() => setShowExpForm(!showExpForm)} className="btn-secondary" style={styles.smallBtn}>
                        {showExpForm ? 'Cancel Add' : '+ Add Job'}
                      </button>
                    </div>

                    {/* Render current jobs ledger inside the edit form so users see changes in real-time */}
                    {experience.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem', background: 'rgba(255,255,255,0.01)', padding: '0.5rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.03)' }}>
                        {experience.map((job, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.35rem 0.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '4px', fontSize: '0.74rem' }}>
                            <div>
                              <strong style={{ color: '#ffffff' }}>{job.title}</strong> at <span style={{ color: '#00f2fe' }}>{job.company}</span>
                              <div style={{ fontSize: '0.62rem', color: '#525252', marginTop: '0.05rem' }}>
                                {job.start_date} • {job.current ? 'Present' : job.end_date}
                              </div>
                            </div>
                            <button 
                              type="button" 
                              onClick={() => setExperience(experience.filter((_, i) => i !== idx))}
                              style={{ background: 'transparent', border: 'none', color: '#f43f5e', cursor: 'pointer', fontSize: '0.75rem', padding: '0.2rem' }}
                              title="Delete Job"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {showExpForm && (
                      <div style={styles.jobFormBox}>
                        <div style={styles.formRow2Col}>
                          <input
                            type="text"
                            placeholder="Job Title"
                            value={jobTitle}
                            onChange={(e) => setJobTitle(e.target.value)}
                            style={styles.smallInput}
                          />
                          <input
                            type="text"
                            placeholder="Company"
                            value={jobCompany}
                            onChange={(e) => setJobCompany(e.target.value)}
                            style={styles.smallInput}
                          />
                        </div>
                        <div style={styles.formRow2Col}>
                          <input
                            type="month"
                            value={jobStart}
                            onChange={(e) => setJobStart(e.target.value)}
                            style={styles.smallInput}
                            title="Start Date"
                          />
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                            <span 
                              onClick={() => setJobCurrent(!jobCurrent)} 
                              style={{ 
                                fontSize: '0.78rem', 
                                color: jobCurrent ? '#00f2fe' : 'rgba(255,255,255,0.4)', 
                                cursor: 'pointer', 
                                alignSelf: 'center',
                                fontWeight: '700',
                                textDecoration: 'underline',
                                textUnderlineOffset: '3px',
                                transition: 'all 0.2s ease',
                                userSelect: 'none'
                              }}
                            >
                              {jobCurrent ? 'Currently working here ✓' : 'Currently working here?'}
                            </span>
                            
                            {!jobCurrent && (
                              <input
                                type="month"
                                value={jobEnd}
                                onChange={(e) => setJobEnd(e.target.value)}
                                style={{ ...styles.smallInput, flex: 1, padding: '0.2rem 0.35rem', height: '28px', fontSize: '0.7rem' }}
                                title="End Date"
                              />
                            )}
                          </div>
                        </div>
                        <textarea
                          placeholder="Role Description"
                          value={jobDesc}
                          onChange={(e) => setJobDesc(e.target.value)}
                          style={styles.smallTextarea}
                          rows="2"
                        />
                        <button type="button" onClick={handleAddExperience} className="btn-primary" style={styles.smallBtn}>
                          Save Job Item
                        </button>
                      </div>
                    )}
                  </div>

                  <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }}>
                    Save Database Profiles
                  </button>
                </form>
              )}
            </>
          )}
        </div>

        {/* 🚀 Startup Founder Profile Card */}
        {customer.role_flags?.includes('Entrepreneur') && (
          <div className="glass-panel" style={styles.card}>
            <div style={{ ...styles.cardHeader, cursor: 'pointer', userSelect: 'none' }} onClick={() => setShowFounderProf(!showFounderProf)}>
              <h3 style={styles.cardTitle}>
                {showFounderProf ? '− ' : '＋ '}🚀 Startup Founder Profile
              </h3>
              {showFounderProf && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditingFounder(!isEditingFounder);
                  }}
                  className="btn-secondary"
                  style={styles.editBtn}
                >
                  {isEditingFounder ? 'Cancel Edit' : 'Edit Founder'}
                </button>
              )}
            </div>

            {showFounderProf && (
              <>
                {!isEditingFounder ? (
                  <div style={styles.resumeDisplay}>
                    <div style={styles.resumeSection}>
                      <h4 style={styles.sectionHeader}>Company Profile</h4>
                      <div style={styles.demographicsGrid}>
                        <p><strong>Company Name:</strong> {companyName || 'Not set'}</p>
                        <p><strong>Business Stage:</strong> <span style={{ textTransform: 'capitalize' }}>{businessStage}</span></p>
                        <p><strong>Industry/Sector:</strong> {entIndustry || 'Not set'}</p>
                        <p><strong>Funding Goal:</strong> ${parseFloat(fundingGoal).toLocaleString()}</p>
                        <p><strong>Valuation Target:</strong> ${parseFloat(valuation).toLocaleString()}</p>
                      </div>
                    </div>

                    <div style={styles.resumeSection}>
                      <h4 style={styles.sectionHeader}>Company Summary</h4>
                      <p style={styles.resumeText}>{companySummary || 'No summary recorded.'}</p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSaveFounderProfile} style={styles.form}>
                    <div style={styles.formRow2Col}>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Company Name</label>
                        <input
                          type="text"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          style={styles.input}
                          required
                        />
                      </div>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Business Stage</label>
                        <select
                          value={businessStage}
                          onChange={(e) => setBusinessStage(e.target.value)}
                          style={styles.input}
                        >
                          <option value="idea">Idea Stage</option>
                          <option value="prototype">Prototype Stage</option>
                          <option value="revenue">Generating Revenue</option>
                          <option value="scaling">Scaling Operations</option>
                          <option value="startup">Established Startup</option>
                        </select>
                      </div>
                    </div>

                    <div style={styles.formRow2Col}>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Industry / Sector</label>
                        <input
                          type="text"
                          value={entIndustry}
                          onChange={(e) => setEntIndustry(e.target.value)}
                          style={styles.input}
                          placeholder="e.g. CleanTech, SaaS, MedTech"
                        />
                      </div>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Funding Goal ($)</label>
                        <input
                          type="number"
                          value={fundingGoal}
                          onChange={(e) => setFundingGoal(e.target.value)}
                          style={styles.input}
                        />
                      </div>
                    </div>

                    <div style={styles.formRow2Col}>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Valuation Target ($)</label>
                        <input
                          type="number"
                          value={valuation}
                          onChange={(e) => setValuation(e.target.value)}
                          style={styles.input}
                        />
                      </div>
                    </div>

                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Company Summary</label>
                      <textarea
                        value={companySummary}
                        onChange={(e) => setCompanySummary(e.target.value)}
                        style={styles.textarea}
                        rows="3"
                        placeholder="Provide a detailed description of your startup..."
                      />
                    </div>

                    <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }}>
                      Save Founder Profile
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        )}

        {/* 📈 Accredited Investor Profile Card */}
        {customer.role_flags?.includes('Investor') && (
          <div className="glass-panel" style={styles.card}>
            <div style={{ ...styles.cardHeader, cursor: 'pointer', userSelect: 'none' }} onClick={() => setShowInvestorProf(!showInvestorProf)}>
              <h3 style={styles.cardTitle}>
                {showInvestorProf ? '− ' : '＋ '}📈 Accredited Investor Profile
              </h3>
              {showInvestorProf && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditingInvestor(!isEditingInvestor);
                  }}
                  className="btn-secondary"
                  style={styles.editBtn}
                >
                  {isEditingInvestor ? 'Cancel Edit' : 'Edit Investor'}
                </button>
              )}
            </div>

            {showInvestorProf && (
              <>
                {!isEditingInvestor ? (
                  <div style={styles.resumeDisplay}>
                    <div style={styles.resumeSection}>
                      <h4 style={styles.sectionHeader}>Investor Type & Parameters</h4>
                      <div style={styles.demographicsGrid}>
                        <p><strong>Investor Type:</strong> <span style={{ textTransform: 'capitalize' }}>{investorType}</span></p>
                        <p><strong>Accreditation Status:</strong> {investorProfile.accreditation_status ? '✅ Vetted & Verified Accredited' : '⚠️ Pending Verification'}</p>
                        <p><strong>Min Investment:</strong> ${parseFloat(minInvest).toLocaleString()}</p>
                        <p><strong>Max Investment:</strong> ${parseFloat(maxInvest).toLocaleString()}</p>
                        <p><strong>Risk Appetite:</strong> <span style={{ textTransform: 'capitalize' }}>{riskAppetite}</span></p>
                        <p><strong>Portfolio Assets:</strong> ${parseFloat(portfolioSize).toLocaleString()}</p>
                      </div>
                    </div>

                    <div style={styles.resumeSection}>
                      <h4 style={styles.sectionHeader}>Preferred Industries</h4>
                      <div style={styles.skillsTagRow}>
                        {prefIndustries.length === 0 ? (
                          <p style={styles.emptyText}>No preferred industries selected.</p>
                        ) : (
                          prefIndustries.map((ind, i) => (
                            <span key={i} style={styles.skillTag}>
                              {ind}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSaveInvestorProfile} style={styles.form}>
                    <div style={styles.formRow2Col}>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Investor Type</label>
                        <select
                          value={investorType}
                          onChange={(e) => setInvestorType(e.target.value)}
                          style={styles.input}
                        >
                          <option value="angel">Angel Investor</option>
                          <option value="vc">Venture Capitalist</option>
                          <option value="institutional">Institutional Investor</option>
                          <option value="group">Investor Syndicate / Group</option>
                        </select>
                      </div>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Risk Appetite</label>
                        <select
                          value={riskAppetite}
                          onChange={(e) => setRiskAppetite(e.target.value)}
                          style={styles.input}
                        >
                          <option value="low">Low Risk Profile</option>
                          <option value="medium">Balanced (Medium) Profile</option>
                          <option value="high">High Yield / Speculative Profile</option>
                        </select>
                      </div>
                    </div>

                    <div style={styles.formRow2Col}>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Min Investment Allocation ($)</label>
                        <input
                          type="number"
                          value={minInvest}
                          onChange={(e) => setMinInvest(e.target.value)}
                          style={styles.input}
                        />
                      </div>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Max Investment Allocation ($)</label>
                        <input
                          type="number"
                          value={maxInvest}
                          onChange={(e) => setMaxInvest(e.target.value)}
                          style={styles.input}
                        />
                      </div>
                    </div>

                    <div style={styles.formRow2Col}>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Ecosystem Portfolio Size ($)</label>
                        <input
                          type="number"
                          value={portfolioSize}
                          onChange={(e) => setPortfolioSize(e.target.value)}
                          style={styles.input}
                        />
                      </div>
                    </div>

                    {/* Preferred Industries Edit Tags */}
                    <div style={styles.skillsEditSection}>
                      <label style={styles.label}>Edit Preferred Sectors</label>
                      <div style={styles.skillsTagRow}>
                        {prefIndustries.map((ind, i) => (
                          <span key={i} style={styles.skillTagEditable} onClick={() => handleRemovePrefIndustry(ind)}>
                            {ind} ✕
                          </span>
                        ))}
                      </div>
                      <div style={styles.addSkillRow}>
                        <input
                          type="text"
                          placeholder="Add sector..."
                          value={newPrefIndustry}
                          onChange={(e) => setNewPrefIndustry(e.target.value)}
                          style={styles.smallInput}
                        />
                        <button type="button" onClick={handleAddPrefIndustry} className="btn-secondary" style={styles.smallBtn}>
                          Add
                        </button>
                      </div>
                    </div>

                    <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }}>
                      Save Investor Profile
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        )}

        {/* 👥 Vetted Advisor Profile Card */}
        {customer.role_flags?.includes('Affiliate') && (
          <div className="glass-panel" style={styles.card}>
            <div style={{ ...styles.cardHeader, cursor: 'pointer', userSelect: 'none' }} onClick={() => setShowAffiliateProf(!showAffiliateProf)}>
              <h3 style={styles.cardTitle}>
                {showAffiliateProf ? '− ' : '＋ '}👥 Vetted Advisor Profile
              </h3>
              {showAffiliateProf && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditingAffiliate(!isEditingAffiliate);
                  }}
                  className="btn-secondary"
                  style={styles.editBtn}
                >
                  {isEditingAffiliate ? 'Cancel Edit' : 'Edit Advisor'}
                </button>
              )}
            </div>

            {showAffiliateProf && (
              <>
                {!isEditingAffiliate ? (
                  <div style={styles.resumeDisplay}>
                    <div style={styles.resumeSection}>
                      <h4 style={styles.sectionHeader}>Advisory Credentials</h4>
                      <div style={styles.demographicsGrid}>
                        <p><strong>Entity Type:</strong> <span style={{ textTransform: 'capitalize' }}>{entityType}</span></p>
                        <p><strong>Advisory Firm:</strong> {firmName || 'Independent'}</p>
                        <p><strong>Professional Specialty:</strong> {specialty || 'General Business Consulting'}</p>
                        <p><strong>Vetted Advisory Rating:</strong> {state.affiliateProfile?.rating || '5.0'} ⭐</p>
                      </div>
                    </div>

                    <div style={styles.resumeSection}>
                      <h4 style={styles.sectionHeader}>Advisor Bio & Mission</h4>
                      <p style={styles.resumeText}>{affiliateBio || 'No advisory bio recorded.'}</p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSaveAffiliateProfile} style={styles.form}>
                    <div style={styles.formRow2Col}>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Entity Type</label>
                        <select
                          value={entityType}
                          onChange={(e) => setEntityType(e.target.value)}
                          style={styles.input}
                        >
                          <option value="individual">Individual Consultant</option>
                          <option value="company">Consulting Firm / Corporate Agency</option>
                        </select>
                      </div>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Advisory Firm Name</label>
                        <input
                          type="text"
                          value={firmName}
                          onChange={(e) => setFirmName(e.target.value)}
                          style={styles.input}
                          placeholder="e.g. Vance & Partners LLC"
                        />
                      </div>
                    </div>

                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Professional Specialty</label>
                      <input
                        type="text"
                        value={specialty}
                        onChange={(e) => setSpecialty(e.target.value)}
                        style={styles.input}
                        placeholder="e.g. SEC Reg CF Filings, Startup Cap Tables"
                        required
                      />
                    </div>

                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Advisor Bio & Services Statement</label>
                      <textarea
                        value={affiliateBio}
                        onChange={(e) => setAffiliateBio(e.target.value)}
                        style={styles.textarea}
                        rows="3"
                        placeholder="Provide details about the advisory services you offer..."
                      />
                    </div>

                    <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }}>
                      Save Advisor Profile
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        )}
      </div>

            {/* Settings & Security Columns */}
            <div style={styles.settingsCol}>
              {/* Table #10: Preferences Settings */}
              <div className="glass-panel" style={styles.card}>
                <div 
                  style={{ ...styles.cardHeader, cursor: 'pointer', userSelect: 'none' }} 
                  onClick={() => setShowNodeSettings(!showNodeSettings)}
                >
                  <h3 style={styles.cardTitle}>
                    {showNodeSettings ? '− ' : '＋ '}⚙ Node Settings
                  </h3>
                </div>
                {showNodeSettings && (
                  <>
                    <p style={styles.cardDesc}>Maintain user configurations, visible security levels, and notification triggers.</p>

                    <div style={styles.preferencesList}>
                      <div style={styles.prefItem}>
                        <div>
                          <h4 style={styles.prefTitle}>Email Notification Alerts</h4>
                          <p style={styles.prefSub}>Receive deal offerings, bank compliance slips, and ticket replies.</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.notification_preferences.email}
                          onChange={() => handleTogglePreference('email')}
                          style={styles.checkbox}
                        />
                      </div>

                      <div style={styles.prefItem}>
                        <div>
                          <h4 style={styles.prefTitle}>SMS Compliance Warnings</h4>
                          <p style={styles.prefSub}>Fast alert overrides for high-value wallet transactions.</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.notification_preferences.sms}
                          onChange={() => handleTogglePreference('sms')}
                          style={styles.checkbox}
                        />
                      </div>

                      <div style={styles.prefItem}>
                        <div>
                          <h4 style={styles.prefTitle}>Investment Bulletins</h4>
                          <p style={styles.prefSub}>Get alerts when new verified campaigns are launched.</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.notification_preferences.investment_alerts}
                          onChange={() => handleTogglePreference('investment_alerts')}
                          style={styles.checkbox}
                        />
                      </div>

                      <div style={styles.prefRow}>
                        <span style={styles.prefLabel}>Ecosystem Interface Theme</span>
                        <span style={styles.prefVal}>Dark Mode Only</span>
                      </div>

                      <div style={styles.prefRow}>
                        <span style={styles.prefLabel}>Privacy Security Level</span>
                        <select
                          value={settings.privacy_level}
                          onChange={(e) => updateSettings({ privacy_level: e.target.value })}
                          style={styles.miniSelect}
                        >
                          <option value="public">Public (Open Directory Feed)</option>
                          <option value="restricted">Restricted (Connections Only)</option>
                          <option value="private">Private (Matches Only)</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Security & 2FA */}
              <div className="glass-panel" style={styles.card}>
                <div 
                  style={{ ...styles.cardHeader, cursor: 'pointer', userSelect: 'none' }} 
                  onClick={() => setShowCognitoSecurity(!showCognitoSecurity)}
                >
                  <h3 style={styles.cardTitle}>
                    {showCognitoSecurity ? '− ' : '＋ '}🛡 Cognito Node Security
                  </h3>
                </div>
                {showCognitoSecurity && (
                  <>
                    <p style={styles.cardDesc}>Link 2-Factor Authentication keys to protect investment payouts and bank transfers.</p>

                    <div style={styles.securityBox}>
                      <div>
                        <h4 style={styles.securityTitle}>Cognito 2FA Verification</h4>
                        <p style={styles.securitySub}>
                          {customer.status === 'verified'
                            ? '🔒 Verified: Secured with time-based TOTP encryption tokens.'
                            : '🔓 Unverified: Please configure SMS or TOTP keys.'}
                        </p>
                      </div>
                      <button
                        onClick={handleToggle2FA}
                        className={customer.status === 'verified' ? 'btn-secondary' : 'btn-primary'}
                        style={styles.securityBtn}
                      >
                        {customer.status === 'verified' ? 'Reset Keys' : 'Configure 2FA'}
                      </button>
                    </div>

                    {twoFaError && <span style={styles.errorText}>{twoFaError}</span>}

                    {show2FAWizard && (
                      <div style={styles.wizard}>
                        <h4 style={styles.wizardTitle}>🔑 Authenticator Setup</h4>
                        
                        <div style={styles.qrContainer}>
                          <div style={styles.qrCode}>
                            <div style={styles.qrInner}>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px', width: '80px', height: '80px' }}>
                                {Array.from({ length: 25 }).map((_, i) => (
                                  <div key={i} style={{ 
                                    background: (i % 2 === 0 && i % 3 !== 0) || i === 0 || i === 4 || i === 20 || i === 24 ? '#ffffff' : 'transparent',
                                    borderRadius: '2px'
                                  }}></div>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div style={styles.qrDetails}>
                            <span style={styles.secretLabel}>Manual Secret Key</span>
                            <code style={styles.secretCode}>PEERBRIDGE-COGNITO-7718</code>
                          </div>
                        </div>

                        <form onSubmit={handleConfirm2FA} style={styles.wizardForm}>
                          <div style={styles.inputGroup}>
                            <label style={styles.label}>Enter Code (Use simulation default: 123456)</label>
                            <input
                              type="text"
                              placeholder="123456"
                              value={totpToken}
                              onChange={(e) => setTotpToken(e.target.value)}
                              style={styles.totpInput}
                              maxLength={6}
                              required
                            />
                          </div>
                          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                            Verify & Configure
                          </button>
                        </form>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      ) : activeSubTab === 'network-directory' ? (
        /* Vetted Network Directory tabbed system */
        <div style={styles.directoryContainer} className="animate-fade-in-up">
          <div style={styles.introHeader}>
            <h2 style={styles.title}>Ecosystem Network Directory</h2>
            <p style={styles.sub}>Search and connect with accredited investors, entrepreneurs, and professional affiliates listed in Peer Bridge.</p>
          </div>

          {/* Search and filter row */}
          <div className="glass-panel" style={styles.searchBarBox}>
            <div style={styles.searchRow}>
              <input
                type="text"
                placeholder="Search fellow nodes by name, title, or bio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
              />
              <select
                value={directoryRoleFilter}
                onChange={(e) => {
                  setDirectoryRoleFilter(e.target.value);
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('pb_directory_filter', JSON.stringify(e.target.value));
                  }
                }}
                style={styles.filterSelect}
              >
                <option value="All">All Listing Roles</option>
                <option value="Connections">🤝 My Connections Only</option>
                <option value="Investor">Accredited Investors Only</option>
                <option value="Entrepreneur">Ecosystem Entrepreneurs Only</option>
                <option value="Affiliate">Professional Affiliates Only</option>
              </select>
            </div>
          </div>

          {/* Directory grid list */}
          <div style={styles.dirGrid}>
            {filteredDirectory.length === 0 ? (
              <div className="glass-panel" style={styles.emptyDirCard}>
                <p>No verified directory members found matching your search parameters.</p>
              </div>
            ) : (
              filteredDirectory.map((member) => (
                <div key={member.customer_id} className="glass-panel" style={styles.dirMemberCard}>
                  <div style={styles.dirCardHeader}>
                    {/* Ring and photo */}
                    <div style={{ position: 'relative', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {renderMemberRing(member, member.basicProfile, member.professionalProfile, member.investorProfile, 80, 4)}
                      {member.basicProfile?.profile_picture_url ? (
                        <img src={member.basicProfile.profile_picture_url} alt={member.first_name} style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, #00f2fe 0%, #8f00ff 100%)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: '800' }}>
                          {member.first_name.charAt(0)}{member.last_name.charAt(0)}
                        </div>
                      )}
                    </div>
                    
                    <div style={styles.dirMetaCol}>
                      <h4 style={styles.dirMemberName}>{member.first_name} {member.last_name}</h4>
                      <span style={styles.dirMemberHeadline}>{member.professionalProfile?.headline || 'Ecosystem Node'}</span>
                    </div>
                  </div>

                  <p style={styles.dirMemberBio}>&quot;{member.basicProfile?.bio?.slice(0, 100)}...&quot;</p>

                  <div style={styles.dirRolesRow}>
                    {member.role_flags?.map((role) => (
                      <span key={role} className="badge badge-admin" style={{ fontSize: '0.62rem', padding: '0.1rem 0.4rem' }}>
                        {role}
                      </span>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <button 
                      onClick={() => {
                        state.setInspectedCustomer(member);
                      }}
                      className="btn-secondary"
                      style={{ flex: 1, justifyContent: 'center', padding: '0.45rem', fontSize: '0.7rem', whiteSpace: 'nowrap' }}
                    >
                      🔍 Inspect
                    </button>
                    {member.customer_id !== customer.customer_id && (() => {
                      const isConnected = connections.includes(member.customer_id);
                      const outgoingRequest = (connectionRequests || []).find(
                        r => r.from_id === customer.customer_id && r.to_id === member.customer_id && r.status === 'pending'
                      );
                      const incomingRequest = (connectionRequests || []).find(
                        r => r.from_id === member.customer_id && r.to_id === customer.customer_id && r.status === 'pending'
                      );

                      if (isConnected) {
                        return (
                          <button 
                            onClick={() => disconnectConnectionNode(member.customer_id)}
                            className="btn-secondary"
                            style={{ 
                              flex: 1.2, 
                              justifyContent: 'center', 
                              padding: '0.45rem', 
                              fontSize: '0.7rem',
                              whiteSpace: 'nowrap',
                              background: 'rgba(16, 185, 129, 0.1)',
                              color: '#10b981',
                              border: '1px solid rgba(16, 185, 129, 0.3)',
                              cursor: 'pointer'
                            }}
                          >
                            🤝 Connected ✓
                          </button>
                        );
                      }

                      if (outgoingRequest) {
                        return (
                          <button 
                            disabled
                            className="btn-secondary"
                            style={{ 
                              flex: 1.2, 
                              justifyContent: 'center', 
                              padding: '0.45rem', 
                              fontSize: '0.7rem',
                              whiteSpace: 'nowrap',
                              background: 'rgba(212, 175, 55, 0.05)',
                              color: '#d4af37',
                              border: '1px solid rgba(212, 175, 55, 0.2)',
                              opacity: 0.8,
                              cursor: 'not-allowed'
                            }}
                          >
                            ⏱ Requested...
                          </button>
                        );
                      }

                      if (incomingRequest) {
                        return (
                          <div style={{ display: 'flex', gap: '0.25rem', flex: 1.2 }}>
                            <button 
                              onClick={() => acceptConnectionRequest(incomingRequest.id)}
                              className="btn-primary"
                              style={{ 
                                flex: 1,
                                justifyContent: 'center',
                                padding: '0.45rem 0.25rem', 
                                fontSize: '0.68rem',
                                whiteSpace: 'nowrap',
                                background: '#10b981',
                                borderColor: '#10b981',
                                color: '#000000',
                                fontWeight: '700'
                              }}
                            >
                              Accept
                            </button>
                            <button 
                              onClick={() => declineConnectionRequest(incomingRequest.id)}
                              className="btn-secondary"
                              style={{ 
                                flex: 1,
                                justifyContent: 'center',
                                padding: '0.45rem 0.25rem', 
                                fontSize: '0.68rem',
                                whiteSpace: 'nowrap',
                                borderColor: 'rgba(239, 68, 68, 0.3)',
                                color: '#ef4444'
                              }}
                            >
                              Decline
                            </button>
                          </div>
                        );
                      }

                      return (
                        <button 
                          onClick={() => sendConnectionRequest(member.customer_id)}
                          className="btn-primary"
                          style={{ 
                            flex: 1.2, 
                            justifyContent: 'center', 
                            padding: '0.45rem', 
                            fontSize: '0.7rem',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          ➕ Connect
                        </button>
                      );
                    })()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : activeSubTab === 'wallet' ? (
        <BankingModule state={state} />
      ) : activeSubTab === 'tax' ? (
        <TaxModule state={state} />
      ) : null}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  coverPanel: {
    overflow: 'hidden',
    position: 'relative',
    paddingBottom: '2rem',
  },
  coverBg: {
    height: '140px',
    background: 'linear-gradient(180deg, #1f1f1f 0%, #0a0a0a 100%)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  },
  profileSummaryRow: {
    display: 'flex',
    padding: '0 2rem',
    marginTop: '-40px',
    gap: '2rem',
    alignItems: 'flex-end',
  },
  photoAvatar: {
    width: '76px',
    height: '76px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  initialsAvatar: {
    width: '76px',
    height: '76px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #00f2fe 0%, #8f00ff 100%)',
    color: '#000000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.8rem',
    fontWeight: '800',
  },
  verifiedIcon: {
    position: 'absolute',
    bottom: '6px',
    right: '6px',
    background: '#ffffff',
    color: '#000000',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    fontWeight: '800',
    border: '2px solid #0a0a0a',
  },
  metaContainer: {
    flex: 1,
    paddingBottom: '0.5rem',
  },
  nameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  nameText: {
    fontSize: '1.75rem',
    fontWeight: '800',
  },
  titleSub: {
    fontSize: '0.92rem',
    color: '#a3a3a3',
    marginTop: '0.2rem',
  },
  bioText: {
    fontSize: '0.9rem',
    color: '#737373',
    marginTop: '0.75rem',
    fontStyle: 'italic',
    maxWidth: '700px',
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
  grid: {
    display: 'grid',
    gridTemplateColumns: '1.4fr 1fr',
    gap: '2rem',
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
    fontSize: '0.78rem',
  },
  resumeDisplay: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  resumeSection: {
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    paddingTop: '1.25rem',
  },
  sectionHeader: {
    fontSize: '0.7rem',
    fontWeight: '700',
    color: '#737373',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '0.5rem',
  },
  resumeTitle: {
    fontSize: '1.05rem',
    fontWeight: '700',
    color: '#ffffff',
  },
  resumeText: {
    fontSize: '0.88rem',
    color: '#a3a3a3',
    marginTop: '0.4rem',
    lineHeight: '1.5',
  },
  demographicsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.75rem',
    fontSize: '0.88rem',
    color: '#a3a3a3',
  },
  experienceList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  jobItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  jobHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  jobTitleText: {
    fontSize: '0.95rem',
    color: '#ffffff',
  },
  jobDuration: {
    fontSize: '0.78rem',
    color: '#737373',
  },
  jobCompany: {
    fontSize: '0.82rem',
    color: '#a3a3a3',
  },
  jobDescText: {
    fontSize: '0.85rem',
    color: '#737373',
    lineHeight: '1.4',
    marginTop: '0.2rem',
  },
  skillsTagRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  skillTag: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#ffffff',
    padding: '0.3rem 0.65rem',
    borderRadius: '4px',
    fontSize: '0.78rem',
    fontWeight: '550',
  },
  skillTagEditable: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#ffffff',
    padding: '0.3rem 0.65rem',
    borderRadius: '4px',
    fontSize: '0.78rem',
    cursor: 'pointer',
    ':hover': {
      background: 'rgba(255,0,0,0.1)',
      borderColor: 'rgba(255,0,0,0.2)'
    }
  },
  emptyText: {
    fontSize: '0.85rem',
    color: '#525252',
    fontStyle: 'italic',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  formRow2Col: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
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
    resize: 'vertical',
  },
  skillsEditSection: {
    borderTop: '1px solid rgba(255,255,255,0.05)',
    paddingTop: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  addSkillRow: {
    display: 'flex',
    gap: '0.75rem',
  },
  smallInput: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '4px',
    padding: '0.4rem 0.75rem',
    color: '#ffffff',
    fontSize: '0.8rem',
    outline: 'none',
  },
  smallBtn: {
    padding: '0.4rem 1rem',
    fontSize: '0.75rem',
  },
  expHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  jobFormBox: {
    background: 'rgba(255,255,255,0.01)',
    border: '1px solid rgba(255,255,255,0.04)',
    borderRadius: '6px',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  smallTextarea: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '4px',
    padding: '0.4rem 0.75rem',
    color: '#ffffff',
    fontSize: '0.8rem',
    outline: 'none',
    resize: 'vertical',
  },
  settingsCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  preferencesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  prefItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1.5rem',
  },
  prefTitle: {
    fontSize: '0.88rem',
    fontWeight: '700',
    color: '#ffffff',
  },
  prefSub: {
    fontSize: '0.78rem',
    color: '#737373',
    lineHeight: '1.3',
    marginTop: '0.15rem',
  },
  checkbox: {
    cursor: 'pointer',
  },
  prefRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    paddingTop: '1rem',
    fontSize: '0.82rem',
  },
  prefLabel: {
    color: '#a3a3a3',
  },
  prefVal: {
    fontWeight: '700',
  },
  miniSelect: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '4px',
    padding: '0.35rem 0.65rem',
    color: '#ffffff',
    fontSize: '0.78rem',
    outline: 'none',
    cursor: 'pointer',
  },
  securityBox: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'rgba(255,255,255,0.01)',
    border: '1px solid rgba(255,255,255,0.04)',
    padding: '1rem 1.25rem',
    borderRadius: '8px',
  },
  securityTitle: {
    fontSize: '0.88rem',
    fontWeight: '700',
  },
  securitySub: {
    fontSize: '0.78rem',
    color: '#737373',
    marginTop: '0.2rem',
  },
  securityBtn: {
    padding: '0.4rem 0.8rem',
    fontSize: '0.78rem',
  },
  errorText: {
    color: '#f43f5e',
    fontSize: '0.75rem',
    fontWeight: '600',
    marginTop: '0.25rem',
  },
  wizard: {
    background: 'rgba(255,255,255,0.01)',
    border: '1px solid rgba(255,255,255,0.04)',
    padding: '1.5rem',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  wizardTitle: {
    fontSize: '0.95rem',
    fontWeight: '700',
  },
  qrContainer: {
    display: 'flex',
    gap: '1.25rem',
    alignItems: 'center',
    background: 'rgba(255,255,255,0.02)',
    padding: '1rem',
    borderRadius: '6px',
  },
  qrCode: {
    background: '#000000',
    border: '1px solid rgba(255,255,255,0.1)',
    padding: '0.5rem',
    borderRadius: '4px',
  },
  qrInner: {
    width: '80px',
    height: '80px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  secretLabel: {
    fontSize: '0.68rem',
    color: '#737373',
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  secretCode: {
    fontSize: '0.8rem',
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  wizardForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  totpInput: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '6px',
    padding: '0.6rem 1rem',
    color: '#ffffff',
    fontSize: '1.1rem',
    fontWeight: '700',
    letterSpacing: '0.15em',
    textAlign: 'center',
    outline: 'none',
  },
  sectionDivider: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    paddingBottom: '0.5rem',
    marginTop: '0.5rem',
    display: 'flex',
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
  directoryContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  searchBarBox: {
    padding: '1rem 1.5rem',
  },
  searchRow: {
    display: 'grid',
    gridTemplateColumns: '1.5fr 1fr',
    gap: '1.5rem',
  },
  searchInput: {
    background: 'transparent',
    border: 'none',
    color: '#ffffff',
    fontSize: '0.9rem',
    outline: 'none',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    padding: '0.5rem 0',
  },
  filterSelect: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '6px',
    color: '#ffffff',
    fontSize: '0.82rem',
    padding: '0.5rem 1rem',
    outline: 'none',
    cursor: 'pointer',
  },
  dirGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1.5rem',
  },
  dirMemberCard: {
    padding: '1.75rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  dirCardHeader: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
  },
  dirMetaCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem',
    flex: 1,
  },
  dirMemberName: {
    fontSize: '1rem',
    fontWeight: '700',
  },
  dirMemberHeadline: {
    fontSize: '0.75rem',
    color: '#737373',
    lineHeight: '1.3',
  },
  dirMemberBio: {
    fontSize: '0.8rem',
    color: '#a3a3a3',
    lineHeight: '1.4',
    fontStyle: 'italic',
    flex: 1,
  },
  dirRolesRow: {
    display: 'flex',
    gap: '0.35rem',
    flexWrap: 'wrap',
    borderTop: '1px solid rgba(255,255,255,0.05)',
    paddingTop: '0.75rem',
  },
  emptyDirCard: {
    gridColumn: 'span 3',
    padding: '3rem',
    textAlign: 'center',
    fontSize: '0.9rem',
    color: '#737373',
  },
  modalBackdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'rgba(0,0,0,0.8)',
    backdropFilter: 'blur(8px)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCard: {
    width: '720px',
    maxWidth: '90%',
    maxHeight: '85vh',
    padding: '2.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    overflowY: 'auto',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalMemberName: {
    fontSize: '1.4rem',
    fontWeight: '800',
  },
  modalMemberHeadline: {
    fontSize: '0.85rem',
    color: '#a3a3a3',
    marginTop: '0.15rem',
  },
  closeModalBtn: {
    background: 'transparent',
    border: 'none',
    color: '#737373',
    fontSize: '1.2rem',
    cursor: 'pointer',
    ':hover': {
      color: '#ffffff'
    }
  },
  modalTabRow: {
    display: 'flex',
    gap: '0.5rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    paddingBottom: '0.5rem',
  },
  modalTabActive: {
    background: 'rgba(255,255,255,0.03)',
    color: '#00f2fe',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    fontSize: '0.78rem',
    fontWeight: '700',
    cursor: 'pointer',
  },
  modalTabInactive: {
    background: 'transparent',
    color: '#737373',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    fontSize: '0.78rem',
    fontWeight: '550',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    ':hover': {
      color: '#ffffff'
    }
  },
  modalBody: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  modalTabBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  modalSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  modalSecHeader: {
    fontSize: '0.7rem',
    fontWeight: '700',
    color: '#737373',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  modalText: {
    fontSize: '0.88rem',
    color: '#a3a3a3',
    lineHeight: '1.5',
  },
  modalEmptyText: {
    fontSize: '0.82rem',
    color: '#525252',
    fontStyle: 'italic',
  },
  modalJobList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    background: 'rgba(255,255,255,0.01)',
    border: '1px solid rgba(255,255,255,0.03)',
    padding: '0.75rem 1rem',
    borderRadius: '6px',
  },
  modalJobItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem',
  },
  modalJobHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.85rem',
    color: '#ffffff',
  },
  modalJobCompany: {
    fontSize: '0.78rem',
    color: '#a3a3a3',
  },
  modalJobDesc: {
    fontSize: '0.78rem',
    color: '#737373',
    lineHeight: '1.4',
    marginTop: '0.15rem',
  },
  modalEduItem: {
    fontSize: '0.82rem',
    color: '#a3a3a3',
  }
};
