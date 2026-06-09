'use client';

import { useState, useEffect } from 'react';

const AVATAR_OPTIONS = [
  { id: 'av-1', label: 'Ecosystem Tech Professional', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&q=80' },
  { id: 'av-2', label: 'CleanTech Innovator', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&q=80' },
  { id: 'av-3', label: 'Biotech Systems Analyst', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&q=80' },
  { id: 'av-4', label: 'Fintech Capital Advisor', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&q=80' },
  { id: 'av-5', label: 'Securities & Compliance Expert', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&q=80' }
];

export default function OnboardingWizard({ state }) {
  const { 
    customer, 
    basicProfile, 
    professionalProfile, 
    entrepreneurProfile, 
    investorProfile, 
    affiliateProfile, 
    updateProfiles, 
    updateEntrepreneurProfile, 
    updateInvestorProfile, 
    updateAffiliateProfile, 
    setCustomer, 
    setDirectory,
    directory 
  } = state;

  const [currentStep, setCurrentStep] = useState(0); // 0: OTP, 1: Basic Profile, 2: Entrepreneur, 3: Investor, 4: Affiliate
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Step 0: OTP Email states
  const [otpCode, setOtpCode] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);

  // Step 1: Basic Profile state variables
  const [selectedAvatar, setSelectedAvatar] = useState(basicProfile.profile_picture_url || AVATAR_OPTIONS[0].url);
  const [headline, setHeadline] = useState(professionalProfile.headline || '');
  const [summary, setSummary] = useState(professionalProfile.summary || '');
  const [address, setAddress] = useState(basicProfile.address || '');
  const [ssn, setSsn] = useState(customer.ssn || '');
  
  // Dynamic role checkboxes
  const [wantsInvestor, setWantsInvestor] = useState(customer.role_flags?.includes('Investor') || false);
  const [wantsEntrepreneur, setWantsEntrepreneur] = useState(customer.role_flags?.includes('Entrepreneur') || false);
  const [wantsAffiliate, setWantsAffiliate] = useState(customer.role_flags?.includes('Affiliate') || false);

  // Job List state
  const [jobs, setJobs] = useState(professionalProfile.experience || []);
  const [newTitle, setNewTitle] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newStart, setNewStart] = useState('');
  const [newDesc, setNewDesc] = useState('');

  // School List state
  const [schools, setSchools] = useState(professionalProfile.education || []);
  const [newDegree, setNewDegree] = useState('');
  const [newInstitution, setNewInstitution] = useState('');
  const [newYear, setNewYear] = useState('');

  // Step 2: Entrepreneur Profile states
  const [compName, setCompName] = useState(entrepreneurProfile.company_name || '');
  const [compStage, setCompStage] = useState(entrepreneurProfile.business_stage || 'revenue');
  const [compIndustry, setCompIndustry] = useState(entrepreneurProfile.industry || 'CleanTech');
  const [compGoal, setCompGoal] = useState(entrepreneurProfile.funding_goal || '250000');
  const [compValuation, setCompValuation] = useState(entrepreneurProfile.valuation || '5000000');
  const [compPitch, setCompPitch] = useState(entrepreneurProfile.company_summary || '');
  const [compDeck, setCompDeck] = useState(entrepreneurProfile.pitch_deck_url || 'https://peerbridge-vault.s3.amazonaws.com/Pitch_Deck.pdf');

  // Step 3: Investor Profile states
  const [invType, setInvType] = useState(investorProfile.investor_type || 'angel');
  const [invRisk, setInvRisk] = useState(investorProfile.risk_appetite || 'medium');
  const [invMin, setInvMin] = useState(investorProfile.investment_range?.min || '1000');
  const [invMax, setInvMax] = useState(investorProfile.investment_range?.max || '50000');
  const [isAccredited, setIsAccredited] = useState(investorProfile.accreditation_status || false);

  // Step 4: Affiliate Profile states
  const [affEntity, setAffEntity] = useState(affiliateProfile.entity_type || 'individual');
  const [affSpecialty, setAffSpecialty] = useState(affiliateProfile.specialty || '');
  const [affFirm, setAffFirm] = useState(affiliateProfile.firm || '');
  const [affBio, setAffBio] = useState(affiliateProfile.bio || '');

  // Deriving the dynamic 4 levels of verification in real-time!
  const hasIdentity = otpVerified;
  const hasJob = jobs.length > 0;
  const hasAcademic = schools.length > 0;
  const hasWealth = isAccredited;
  const hasAddressAndSsn = address.trim().length > 3 && ssn.length === 11;
  
  // Custom SSN formatting helper
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

  // Helper to compile the dynamic circular verification ring
  const renderVerificationRing = () => {
    // Circle perimeter: 2 * PI * 54 = 339.29
    // 4 equal sectors of stroke-length 78 and gap 6 = stroke-dasharray="78 261"
    
    // Dynamic glows based on verified state
    const colorId = hasIdentity ? (hasAddressAndSsn ? '#d4af37' : '#00f2fe') : 'var(--border-color)'; // Gold if address+SSN provided, Cyan if basic verified
    const colorJob = hasJob ? '#8f00ff' : 'var(--border-color)'; // Purple
    const colorAcad = hasAcademic ? '#6366f1' : 'var(--border-color)'; // Violet
    const colorWealth = hasWealth ? '#10b981' : 'var(--border-color)'; // Neon Emerald

    return (
      <svg width="120" height="120" viewBox="0 0 120 120" style={styles.svgRing}>
        <circle cx="60" cy="60" r="54" fill="none" stroke="var(--border-color)" strokeWidth="4" />
        
        {/* Quarter 1: Top-Right (Identity-Vetted) */}
        <circle 
          cx="60" 
          cy="60" 
          r="54" 
          fill="none" 
          stroke={colorId} 
          strokeWidth="5" 
          strokeDasharray="78 261" 
          strokeDashoffset="0"
          strokeLinecap="round"
          style={{ transition: 'stroke 0.4s ease' }}
        />
        {/* Quarter 2: Bottom-Right (Wealth-Vetted) */}
        <circle 
          cx="60" 
          cy="60" 
          r="54" 
          fill="none" 
          stroke={colorWealth} 
          strokeWidth="5" 
          strokeDasharray="78 261" 
          strokeDashoffset="-85"
          strokeLinecap="round"
          style={{ transition: 'stroke 0.4s ease' }}
        />
        {/* Quarter 3: Bottom-Left (Academic-Vetted) */}
        <circle 
          cx="60" 
          cy="60" 
          r="54" 
          fill="none" 
          stroke={colorAcad} 
          strokeWidth="5" 
          strokeDasharray="78 261" 
          strokeDashoffset="-170"
          strokeLinecap="round"
          style={{ transition: 'stroke 0.4s ease' }}
        />
        {/* Quarter 4: Top-Left (Job-Vetted) */}
        <circle 
          cx="60" 
          cy="60" 
          r="54" 
          fill="none" 
          stroke={colorJob} 
          strokeWidth="5" 
          strokeDasharray="78 261" 
          strokeDashoffset="-255"
          strokeLinecap="round"
          style={{ transition: 'stroke 0.4s ease' }}
        />
      </svg>
    );
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otpCode.trim() === '888888') {
      setOtpVerified(true);
      setError('');
      setSuccess('Email successfully authenticated! Proceeding to Profile Credentials.');
      setTimeout(() => {
        setSuccess('');
        setCurrentStep(1);
      }, 1500);
    } else {
      setError('Invalid simulated OTP key. Enter default token: 888888');
    }
  };

  const handleAddJob = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCompany.trim()) return;
    const newJob = {
      title: newTitle,
      company: newCompany,
      start_date: newStart || '2026-01',
      end_date: null,
      current: true,
      description: newDesc
    };
    setJobs([...jobs, newJob]);
    setNewTitle('');
    setNewCompany('');
    setNewStart('');
    setNewDesc('');
  };

  const handleAddSchool = (e) => {
    e.preventDefault();
    if (!newDegree.trim() || !newInstitution.trim()) return;
    const newSchool = {
      degree: newDegree,
      institution: newInstitution,
      year: newYear ? parseInt(newYear) : 2020
    };
    setSchools([...schools, newSchool]);
    setNewDegree('');
    setNewInstitution('');
    setNewYear('');
  };

  const handleSaveStep1 = (e) => {
    e.preventDefault();
    
    // Validate role checkboxes
    if (!wantsInvestor && !wantsEntrepreneur && !wantsAffiliate) {
      setError('Please select at least one registered listing role flag (Investor, Entrepreneur, or Affiliate).');
      return;
    }

    setError('');
    
    // Save to profiles
    const roleFlags = [];
    if (wantsInvestor) roleFlags.push('Investor');
    if (wantsEntrepreneur) roleFlags.push('Entrepreneur');
    if (wantsAffiliate) roleFlags.push('Affiliate');

    updateProfiles(
      { first_name: customer.first_name, last_name: customer.last_name, role_flags: roleFlags, ssn },
      { address, profile_picture_url: selectedAvatar },
      { headline, summary, experience: jobs, education: schools }
    );

    setSuccess('Step 1 credentials synced successfully!');
    
    // Determine the next step based on checkboxes
    setTimeout(() => {
      setSuccess('');
      if (wantsEntrepreneur) {
        setCurrentStep(2);
      } else if (wantsInvestor) {
        setCurrentStep(3);
      } else if (wantsAffiliate) {
        setCurrentStep(4);
      } else {
        finishOnboarding(roleFlags);
      }
    }, 1200);
  };

  const handleSaveStep2 = (e) => {
    e.preventDefault();
    if (!compName.trim()) {
      setError('Please enter your company name.');
      return;
    }
    setError('');
    
    updateEntrepreneurProfile({
      company_name: compName,
      business_stage: compStage,
      industry: compIndustry,
      funding_goal: parseFloat(compGoal),
      valuation: parseFloat(compValuation),
      company_summary: compPitch,
      pitch_deck_url: compDeck,
      team: [{ name: `${customer.first_name} ${customer.last_name}`, role: 'CEO & Founder', linkedin: '', bio: 'Verified Node' }]
    });

    setSuccess('Entrepreneur profile sheet synced!');
    setTimeout(() => {
      setSuccess('');
      if (wantsInvestor) {
        setCurrentStep(3);
      } else if (wantsAffiliate) {
        setCurrentStep(4);
      } else {
        const roleFlags = [];
        if (wantsInvestor) roleFlags.push('Investor');
        if (wantsEntrepreneur) roleFlags.push('Entrepreneur');
        if (wantsAffiliate) roleFlags.push('Affiliate');
        finishOnboarding(roleFlags);
      }
    }, 1200);
  };

  const handleSaveStep3 = (e) => {
    e.preventDefault();
    setError('');
    
    updateInvestorProfile({
      investor_type: invType,
      investment_range: { min: parseFloat(invMin), max: parseFloat(invMax), currency: 'USD' },
      risk_appetite: invRisk,
      accreditation_status: isAccredited
    });

    setSuccess('Investor profile sheet synced!');
    setTimeout(() => {
      setSuccess('');
      if (wantsAffiliate) {
        setCurrentStep(4);
      } else {
        const roleFlags = [];
        if (wantsInvestor) roleFlags.push('Investor');
        if (wantsEntrepreneur) roleFlags.push('Entrepreneur');
        if (wantsAffiliate) roleFlags.push('Affiliate');
        finishOnboarding(roleFlags);
      }
    }, 1200);
  };

  const handleSaveStep4 = (e) => {
    e.preventDefault();
    setError('');
    
    updateAffiliateProfile({
      entity_type: affEntity,
      specialty: affSpecialty,
      firm: affFirm,
      bio: affBio
    });

    setSuccess('Affiliate profile sheet synced!');
    setTimeout(() => {
      setSuccess('');
      const roleFlags = [];
      if (wantsInvestor) roleFlags.push('Investor');
      if (wantsEntrepreneur) roleFlags.push('Entrepreneur');
      if (wantsAffiliate) roleFlags.push('Affiliate');
      finishOnboarding(roleFlags);
    }, 1200);
  };

  const finishOnboarding = (roleFlags) => {
    // Sync final onboarded status
    const updatedCust = {
      ...customer,
      role_flags: roleFlags,
      isOnboarded: true,
      status: 'verified', // Vetted upon completing email + basic onboarding!
      ssn
    };

    const finalBasic = {
      ...basicProfile,
      profile_picture_url: selectedAvatar,
      address
    };

    const finalProf = {
      ...professionalProfile,
      headline,
      summary,
      experience: jobs,
      education: schools
    };

    // Save to own profile
    updateProfiles(updatedCust, finalBasic, finalProf);
    
    // Add to dynamic directory list so they are fully browsable!
    const newDirectoryMember = {
      customer_id: customer.customer_id,
      email: customer.email,
      first_name: customer.first_name,
      last_name: customer.last_name,
      phone: customer.phone || '+1 (555) 000-0000',
      role_flags: roleFlags,
      status: 'verified',
      isOnboarded: true,
      ssn,
      basicProfile: finalBasic,
      professionalProfile: finalProf,
      entrepreneurProfile: wantsEntrepreneur ? {
        company_name: compName,
        business_stage: compStage,
        industry: compIndustry,
        funding_goal: parseFloat(compGoal),
        valuation: parseFloat(compValuation),
        company_summary: compPitch,
        pitch_deck_url: compDeck,
        team: [{ name: `${customer.first_name} ${customer.last_name}`, role: 'CEO & Founder', linkedin: '', bio: 'Verified Node' }]
      } : null,
      investorProfile: wantsInvestor ? {
        investor_type: invType,
        investment_range: { min: parseFloat(invMin), max: parseFloat(invMax), currency: 'USD' },
        risk_appetite: invRisk,
        accreditation_status: isAccredited
      } : null,
      affiliateProfile: wantsAffiliate ? {
        entity_type: affEntity,
        specialty: affSpecialty,
        firm: affFirm,
        bio: affBio,
        rating: 5.0,
        reviews: 0
      } : null
    };

    // Save to directory array state!
    const updatedDir = [newDirectoryMember, ...directory.filter(d => d.customer_id !== customer.customer_id)];
    setDirectory(updatedDir);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pb_directory', JSON.stringify(updatedDir));
      localStorage.setItem('pb_cust', JSON.stringify(updatedCust));
      localStorage.setItem('pb_basic', JSON.stringify(finalBasic));
      localStorage.setItem('pb_prof', JSON.stringify(finalProf));
    }

    setSuccess('Onboarding Complete! Welcome to the Peer Bridge Network.');
    setTimeout(() => {
      // Force page state update
      setCustomer(updatedCust);
    }, 1500);
  };

  return (
    <div style={styles.container} className="animate-fade-in-up">
      {/* Visual Onboarding Progress header */}
      <div className="glass-panel responsive-progress-header" style={styles.progressHeader}>
        <div style={styles.logoBox}>
          <h2 style={styles.logoText}>PEER BRIDGE</h2>
          <span style={styles.logoSub}>FINTECH CREDENTIAL OVERVIEW</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={styles.stepsRow}>
            <div style={currentStep === 0 ? styles.stepIndicatorActive : styles.stepIndicator}>
              <span>1</span> Verification
            </div>
            <div style={currentStep === 1 ? styles.stepIndicatorActive : styles.stepIndicator}>
              <span>2</span> Credentials & Roles
            </div>
            {wantsEntrepreneur && (
              <div style={currentStep === 2 ? styles.stepIndicatorActive : styles.stepIndicator}>
                <span>3</span> Entrepreneur Profile
              </div>
            )}
            {wantsInvestor && (
              <div style={currentStep === 3 ? styles.stepIndicatorActive : styles.stepIndicator}>
                <span>{wantsEntrepreneur ? '4' : '3'}</span> Investor Profile
              </div>
            )}
            {wantsAffiliate && (
              <div style={currentStep === 4 ? styles.stepIndicatorActive : styles.stepIndicator}>
                <span>{wantsEntrepreneur && wantsInvestor ? '5' : (wantsEntrepreneur || wantsInvestor ? '4' : '3')}</span> Affiliate Profile
              </div>
            )}
          </div>

          <button 
            type="button" 
            onClick={() => state.logout()} 
            className="btn-secondary" 
            style={{ 
              padding: '0.4rem 0.8rem', 
              fontSize: '0.75rem', 
              borderRadius: '6px', 
              border: '1px solid var(--border-color)', 
              color: 'rgba(0, 0, 0, 0.105)', 
              cursor: 'pointer', 
              background: 'none',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.045)';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-color)';
              e.currentTarget.style.color = 'rgba(0, 0, 0, 0.105)';
            }}
          >
            Sign Out
          </button>
        </div>
      </div>

      {success && (
        <div style={styles.successToast}>
          ✨ {success}
        </div>
      )}

      {/* Dynamic onboarding form steps */}
      <div className="glass-panel responsive-wizard-card" style={styles.wizardCard}>
        {currentStep === 0 && (
          <form onSubmit={handleVerifyOtp} style={styles.stepForm}>
            <h3 style={styles.stepTitle}>🔒 Step 1: Email Verification Gate</h3>
            <p style={styles.stepDesc}>
              We have sent a simulated verification code to <strong>{customer.email}</strong>. Please enter the code below to prove your email identity and unlock credentials.
            </p>

            <div style={styles.inputGroupCenter}>
              <label style={styles.label}>6-Digit Simulated OTP Code</label>
              <input
                type="text"
                placeholder="888888"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                style={styles.otpInput}
                required
              />
              {error && <span style={styles.errorText}>{error}</span>}
            </div>

            <div style={styles.tipBox}>
              <strong>💡 Developer Verification Pin:</strong> Enter default code <code>888888</code> to satisfy verification gates!
            </div>

            <button type="submit" className="btn-primary" style={styles.centerBtn}>
              Submit Verification Key →
            </button>
          </form>
        )}

        {currentStep === 1 && (
          <form onSubmit={handleSaveStep1} style={styles.stepForm}>
            <h3 style={styles.stepTitle}>👤 Step 2: Vetted Basic Profile & Listing Roles</h3>
            <p style={styles.stepDesc}>
              Complete your standard professional profile. Your credential status ring updates dynamically as you fill out optional documents, previous work ledger history, and accredited tags.
            </p>

            <div className="responsive-split-grid" style={styles.basicLayoutGrid}>
              {/* Left Column: Interactive photo and credentials */}
              <div style={styles.avatarCol}>
                <div style={styles.photoRingContainer}>
                  {renderVerificationRing()}
                  <img src={selectedAvatar} alt="Selected Avatar" style={styles.photoAvatar} />
                  
                  {/* Inside badge */}
                  <div style={styles.ringBadge}>
                    {hasAddressAndSsn ? (
                      <span style={{ color: '#d4af37', fontWeight: '800', fontSize: '0.65rem' }}>GOLD TIER</span>
                    ) : (
                      <span style={{ color: '#00f2fe', fontWeight: '800', fontSize: '0.65rem' }}>IDENTITY</span>
                    )}
                  </div>
                </div>

                <div style={styles.ringLegends}>
                  <div style={styles.legendItem}>
                    <div style={{ ...styles.legendDot, background: hasIdentity ? (address.trim() && ssn ? '#d4af37' : '#00f2fe') : 'var(--border-color)' }}></div>
                    <span style={styles.legendLabel}>Identity: {hasIdentity ? (address.trim() && ssn ? 'Gold Vetted' : 'Email Vetted') : 'Unverified'}</span>
                  </div>
                  <div style={styles.legendItem}>
                    <div style={{ ...styles.legendDot, background: hasJob ? '#8f00ff' : 'var(--border-color)' }}></div>
                    <span style={styles.legendLabel}>Professional: {hasJob ? 'Job Vetted' : 'No Experience Added'}</span>
                  </div>
                  <div style={styles.legendItem}>
                    <div style={{ ...styles.legendDot, background: hasAcademic ? '#6366f1' : 'var(--border-color)' }}></div>
                    <span style={styles.legendLabel}>Academic: {hasAcademic ? 'Credentials Vetted' : 'No Education Added'}</span>
                  </div>
                  <div style={styles.legendItem}>
                    <div style={{ ...styles.legendDot, background: hasWealth ? '#10b981' : 'var(--border-color)' }}></div>
                    <span style={styles.legendLabel}>Capital: {hasWealth ? 'Accredited Vetted' : 'Unaccredited'}</span>
                  </div>
                </div>

                <label style={{ ...styles.label, marginTop: '1rem', alignSelf: 'flex-start' }}>Select Profile Picture</label>
                <div style={styles.avatarSelectionRow}>
                  {AVATAR_OPTIONS.map((av) => (
                    <img
                      key={av.id}
                      src={av.url}
                      alt={av.label}
                      onClick={() => setSelectedAvatar(av.url)}
                      style={selectedAvatar === av.url ? styles.avatarSelectOptionActive : styles.avatarSelectOption}
                      title={av.label}
                    />
                  ))}
                </div>
              </div>

              {/* Right Column: Profile fields and checklists */}
              <div style={styles.fieldsCol}>
                <div style={styles.sectionDivider}>
                  <span>🔒 DIRECTORY LISTING PERSPECTIVES (SELECT ALL APPLICABLE)</span>
                </div>
                
                <div style={styles.checkboxesRow}>
                  <label style={styles.checkboxContainer}>
                    <input
                      type="checkbox"
                      checked={wantsInvestor}
                      onChange={(e) => setWantsInvestor(e.target.checked)}
                      style={styles.checkbox}
                    />
                    <div>
                      <strong>Accredited Investor</strong>
                      <p>View capital opportunities, due diligence lists, and place seed assets.</p>
                    </div>
                  </label>

                  <label style={styles.checkboxContainer}>
                    <input
                      type="checkbox"
                      checked={wantsEntrepreneur}
                      onChange={(e) => setWantsEntrepreneur(e.target.checked)}
                      style={styles.checkbox}
                    />
                    <div>
                      <strong>Ecosystem Entrepreneur (Founder)</strong>
                      <p>Build corporate sheets, dilute cap tables, and list Reg CF funding campaigns.</p>
                    </div>
                  </label>

                  <label style={styles.checkboxContainer}>
                    <input
                      type="checkbox"
                      checked={wantsAffiliate}
                      onChange={(e) => setWantsAffiliate(e.target.checked)}
                      style={styles.checkbox}
                    />
                    <div>
                      <strong>Professional/Corporate Affiliate (Advisor)</strong>
                      <p>Answer tax or legal questions, supply content resources, and gain advisory leads.</p>
                    </div>
                  </label>
                </div>

                <div style={styles.sectionDivider}>
                  <span>💼 CURRENT WORK & BIO SUMMARY</span>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Headline Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Clean Energy Angel & DeepTech Founder"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    style={styles.input}
                    required
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Professional Summary</label>
                  <textarea
                    placeholder="Explain your career pedigree, capital objectives, or services summary..."
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    style={styles.textarea}
                    rows="3"
                    required
                  />
                </div>

                <div style={styles.sectionDivider}>
                  <span>🛡 OPTIONAL CREDENTIALS (UPGRADES TO GOLD VERIFICATION TIER)</span>
                </div>
                <p style={styles.sectionSubDesc}>
                  Providing your physical address and SSN triggers our simulated Cognito background check, giving you a gold highlighted badge in the networking directory.
                </p>

                <div className="responsive-grid-2" style={styles.formRow2Col}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Physical Address</label>
                    <input
                      type="text"
                      placeholder="e.g. 100 Securities Blvd, New York, NY"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Social Security Number (SSN)</label>
                    <input
                      type="text"
                      placeholder="XXX-XX-XXXX"
                      value={ssn}
                      maxLength={11}
                      onChange={(e) => handleSsnChange(e.target.value)}
                      style={styles.input}
                    />
                  </div>
                </div>

                {/* Work Experience dynamic list */}
                <div style={styles.sectionDivider}>
                  <span>💼 PREVIOUS WORK LEDGER</span>
                </div>

                {jobs.length > 0 && (
                  <div style={styles.addedList}>
                    {jobs.map((j, i) => (
                      <div key={i} style={styles.listItem}>
                        <strong>{j.title}</strong> at <span>{j.company}</span>
                        <button type="button" onClick={() => setJobs(jobs.filter((_, idx) => idx !== i))} style={styles.removeBtn}>✕</button>
                      </div>
                    ))}
                  </div>
                )}

                <div style={styles.addItemForm}>
                  <div className="responsive-grid-2" style={styles.formRow2Col}>
                    <input
                      type="text"
                      placeholder="Job Title"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      style={styles.smallInput}
                    />
                    <input
                      type="text"
                      placeholder="Company"
                      value={newCompany}
                      onChange={(e) => setNewCompany(e.target.value)}
                      style={styles.smallInput}
                    />
                  </div>
                  <div className="responsive-grid-2" style={styles.formRow2Col}>
                    <input
                      type="month"
                      value={newStart}
                      onChange={(e) => setNewStart(e.target.value)}
                      style={styles.smallInput}
                    />
                    <button type="button" onClick={handleAddJob} className="btn-secondary" style={styles.smallBtn}>
                      + Add Job
                    </button>
                  </div>
                </div>

                {/* Education dynamic list */}
                <div style={styles.sectionDivider}>
                  <span>🎓 ACADEMIC CREDENTIALS</span>
                </div>

                {schools.length > 0 && (
                  <div style={styles.addedList}>
                    {schools.map((s, i) => (
                      <div key={i} style={styles.listItem}>
                        <strong>{s.degree}</strong> from <span>{s.institution}</span> ({s.year})
                        <button type="button" onClick={() => setSchools(schools.filter((_, idx) => idx !== i))} style={styles.removeBtn}>✕</button>
                      </div>
                    ))}
                  </div>
                )}

                <div style={styles.addItemForm}>
                  <div className="responsive-grid-2" style={styles.formRow2Col}>
                    <input
                      type="text"
                      placeholder="Degree / Certificate"
                      value={newDegree}
                      onChange={(e) => setNewDegree(e.target.value)}
                      style={styles.smallInput}
                    />
                    <input
                      type="text"
                      placeholder="Institution / School"
                      value={newInstitution}
                      onChange={(e) => setNewInstitution(e.target.value)}
                      style={styles.smallInput}
                    />
                  </div>
                  <div className="responsive-grid-2" style={styles.formRow2Col}>
                    <input
                      type="number"
                      placeholder="Graduation Year"
                      value={newYear}
                      onChange={(e) => setNewYear(e.target.value)}
                      style={styles.smallInput}
                    />
                    <button type="button" onClick={handleAddSchool} className="btn-secondary" style={styles.smallBtn}>
                      + Add School
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {error && <div style={styles.errorBox}>{error}</div>}

            <div style={styles.wizardFooter}>
              <button type="submit" className="btn-primary" style={styles.nextBtn}>
                Save & Continue Onboarding →
              </button>
            </div>
          </form>
        )}

        {currentStep === 2 && (
          <form onSubmit={handleSaveStep2} style={styles.stepForm}>
            <h3 style={styles.stepTitle}>🏢 Step 3: Entrepreneur Profile Setup</h3>
            <p style={styles.stepDesc}>
              Setup your primary company raising details. This information will represent your startup profile and feed our live Cap Table engine.
            </p>

            <div className="responsive-grid-2" style={styles.formRow2Col}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Company Legal Name</label>
                <input
                  type="text"
                  placeholder="e.g. EcoSphere Technologies"
                  value={compName}
                  onChange={(e) => setCompName(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Startup Stage</label>
                <select
                  value={compStage}
                  onChange={(e) => setCompStage(e.target.value)}
                  style={styles.select}
                >
                  <option value="idea">Idea Concept</option>
                  <option value="prototype">Working Prototype</option>
                  <option value="revenue">Generating Revenue</option>
                  <option value="scaling">Scaling Operations</option>
                  <option value="startup">Growth Stage</option>
                </select>
              </div>
            </div>

            <div className="responsive-grid-2" style={styles.formRow2Col}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Target Capital Goal ($)</label>
                <input
                  type="number"
                  value={compGoal}
                  onChange={(e) => setCompGoal(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Pre-Money Valuation ($)</label>
                <input
                  type="number"
                  value={compValuation}
                  onChange={(e) => setCompValuation(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>
            </div>

            <div className="responsive-grid-2" style={styles.formRow2Col}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Industry Segment</label>
                <select
                  value={compIndustry}
                  onChange={(e) => setCompIndustry(e.target.value)}
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
                <label style={styles.label}>Pitch Deck S3 Vault Document URL</label>
                <input
                  type="text"
                  value={compDeck}
                  onChange={(e) => setCompDeck(e.target.value)}
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Company Summary Overview</label>
              <textarea
                placeholder="Describe your elevator pitch and product value proposition..."
                value={compPitch}
                onChange={(e) => setCompPitch(e.target.value)}
                style={styles.textarea}
                rows="4"
                required
              />
            </div>

            {error && <div style={styles.errorBox}>{error}</div>}

            <div style={styles.wizardFooter}>
              <button type="button" onClick={() => setCurrentStep(1)} className="btn-secondary">
                ← Back
              </button>
              <button type="submit" className="btn-primary" style={styles.nextBtn}>
                Save & Continue Onboarding →
              </button>
            </div>
          </form>
        )}

        {currentStep === 3 && (
          <form onSubmit={handleSaveStep3} style={styles.stepForm}>
            <h3 style={styles.stepTitle}>👤 Step 4: Investor Profile Setup</h3>
            <p style={styles.stepDesc}>
              Configure your risk levels, investment range capacities, and declare your regulatory accreditation.
            </p>

            <div className="responsive-grid-2" style={styles.formRow2Col}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Investor Classification</label>
                <select
                  value={invType}
                  onChange={(e) => setInvType(e.target.value)}
                  style={styles.select}
                >
                  <option value="angel">Angel Investor</option>
                  <option value="vc">Venture Capitalist</option>
                  <option value="institutional">Institutional Asset Manager</option>
                  <option value="group">Syndicate Group Manager</option>
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Risk Appetite Tolerance</label>
                <select
                  value={invRisk}
                  onChange={(e) => setInvRisk(e.target.value)}
                  style={styles.select}
                >
                  <option value="low">Conservative (Low)</option>
                  <option value="medium">Balanced (Medium)</option>
                  <option value="high">Speculative (High)</option>
                </select>
              </div>
            </div>

            <div className="responsive-grid-2" style={styles.formRow2Col}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Minimum Investment Range ($)</label>
                <input
                  type="number"
                  value={invMin}
                  onChange={(e) => setInvMin(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Maximum Investment Range ($)</label>
                <input
                  type="number"
                  value={invMax}
                  onChange={(e) => setInvMax(e.target.value)}
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.sectionDivider}>
              <span>⚖ REGULATORY ACCREDITATION SYSTEM</span>
            </div>

            <label style={styles.accreditCheckbox}>
              <input
                type="checkbox"
                checked={isAccredited}
                onChange={(e) => setIsAccredited(e.target.checked)}
                style={styles.checkboxLarge}
              />
              <div>
                <strong>Verify My Accredited Investor Status</strong>
                <p>I verify that my personal net worth exceeds $1,000,000 (excluding primary residence) or my annual income exceeds $200,000. Checking this immediately lights up the Wealth-Vetted sector on your dynamic directory ring.</p>
              </div>
            </label>

            {error && <div style={styles.errorBox}>{error}</div>}

            <div style={styles.wizardFooter}>
              <button 
                type="button" 
                onClick={() => {
                  if (wantsEntrepreneur) setCurrentStep(2);
                  else setCurrentStep(1);
                }} 
                className="btn-secondary"
              >
                ← Back
              </button>
              <button type="submit" className="btn-primary" style={styles.nextBtn}>
                Save & Continue Onboarding →
              </button>
            </div>
          </form>
        )}

        {currentStep === 4 && (
          <form onSubmit={handleSaveStep4} style={styles.stepForm}>
            <h3 style={styles.stepTitle}>👥 Step 5: Affiliate Professional Setup</h3>
            <p style={styles.stepDesc}>
              Configure your professional consulting credentials so early stage founders can source your legal, accounting, or bank services in the catalog.
            </p>

            <div className="responsive-grid-2" style={styles.formRow2Col}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Affiliate Category</label>
                <select
                  value={affEntity}
                  onChange={(e) => setAffEntity(e.target.value)}
                  style={styles.select}
                >
                  <option value="individual">Individual Professional (CPA, Lawyer, Insurance Agent)</option>
                  <option value="company">Corporate Entity (Bank, Accounting Firm, Law Firm)</option>
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Firm / Company Name</label>
                <input
                  type="text"
                  placeholder="e.g. Vance Advisory Group or Apex Bank"
                  value={affFirm}
                  onChange={(e) => setAffFirm(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Advisory Specialty & Practice Focus</label>
              <input
                type="text"
                placeholder="e.g. Securities Law & Joint Crowd SPV Structuring"
                value={affSpecialty}
                onChange={(e) => setAffSpecialty(e.target.value)}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Services Description Overview</label>
              <textarea
                placeholder="Detail the specialized services and financial audits you offer in the content catalog..."
                value={affBio}
                onChange={(e) => setAffBio(e.target.value)}
                style={styles.textarea}
                rows="4"
                required
              />
            </div>

            {error && <div style={styles.errorBox}>{error}</div>}

            <div style={styles.wizardFooter}>
              <button 
                type="button" 
                onClick={() => {
                  if (wantsInvestor) setCurrentStep(3);
                  else if (wantsEntrepreneur) setCurrentStep(2);
                  else setCurrentStep(1);
                }} 
                className="btn-secondary"
              >
                ← Back
              </button>
              <button type="submit" className="btn-primary" style={styles.nextBtn}>
                Complete Profile Onboarding ✓
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '960px',
    width: '100%',
    margin: '3rem auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
    padding: '0 1.5rem',
  },
  progressHeader: {
    padding: '1.5rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1.5rem',
  },
  logoBox: {
    display: 'flex',
    flexDirection: 'column',
  },
  logoText: {
    fontSize: '1.3rem',
    fontWeight: '900',
    letterSpacing: '0.05em',
  },
  logoSub: {
    fontSize: '0.65rem',
    color: 'var(--color-text-muted)',
    fontWeight: '700',
    letterSpacing: '0.1em',
    marginTop: '0.2rem',
  },
  stepsRow: {
    display: 'flex',
    gap: '1rem',
  },
  stepIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.78rem',
    color: 'var(--color-text-muted)',
    fontWeight: '600',
    background: 'var(--bg-primary)',
    padding: '0.4rem 0.8rem',
    borderRadius: '20px',
    border: '1px solid var(--border-color)',
  },
  stepIndicatorActive: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.78rem',
    color: '#00f2fe',
    fontWeight: '700',
    background: 'rgba(0, 242, 254, 0.05)',
    padding: '0.4rem 0.8rem',
    borderRadius: '20px',
    border: '1px solid rgba(0, 242, 254, 0.2)',
  },
  successToast: {
    background: 'rgba(16, 185, 129, 0.08)',
    border: '1px solid #10b981',
    color: 'var(--color-text-primary)',
    padding: '1rem',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: '600',
  },
  wizardCard: {
    padding: '3rem',
  },
  stepForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  stepTitle: {
    fontSize: '1.4rem',
    fontWeight: '800',
  },
  stepDesc: {
    fontSize: '0.9rem',
    color: 'var(--color-text-secondary)',
    lineHeight: '1.5',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    width: '100%',
  },
  inputGroupCenter: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    alignItems: 'center',
    margin: '2rem 0',
  },
  label: {
    fontSize: '0.72rem',
    fontWeight: '700',
    color: 'var(--color-text-muted)',
    textTransform: 'uppercase',
  },
  input: {
    width: '100%',
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    padding: '0.7rem 1rem',
    color: 'var(--color-text-primary)',
    fontSize: '0.9rem',
    outline: 'none',
  },
  otpInput: {
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '0.8rem 1.5rem',
    color: 'var(--color-text-primary)',
    fontSize: '1.8rem',
    fontWeight: '900',
    letterSpacing: '0.2em',
    textAlign: 'center',
    width: '200px',
    outline: 'none',
  },
  select: {
    width: '100%',
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    padding: '0.7rem 1rem',
    color: 'var(--color-text-primary)',
    fontSize: '0.9rem',
    outline: 'none',
    cursor: 'pointer',
  },
  textarea: {
    width: '100%',
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    padding: '0.7rem 1rem',
    color: 'var(--color-text-primary)',
    fontSize: '0.9rem',
    outline: 'none',
    resize: 'vertical',
  },
  tipBox: {
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    padding: '0.75rem 1rem',
    fontSize: '0.82rem',
    color: 'var(--color-text-secondary)',
    lineHeight: '1.4',
  },
  centerBtn: {
    alignSelf: 'center',
    padding: '0.7rem 2rem',
    fontSize: '0.9rem',
  },
  basicLayoutGrid: {
    display: 'grid',
    gridTemplateColumns: '220px 1fr',
    gap: '2.5rem',
    marginTop: '1rem',
  },
  avatarCol: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  photoRingContainer: {
    position: 'relative',
    width: '120px',
    height: '120px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  svgRing: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '120px',
    height: '120px',
    transform: 'rotate(-90deg)', // Rotate to start from top
  },
  photoAvatar: {
    width: '92px',
    height: '92px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  ringBadge: {
    position: 'absolute',
    bottom: '-10px',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    padding: '0.15rem 0.5rem',
    borderRadius: '10px',
  },
  ringLegends: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
    width: '100%',
    marginTop: '1.5rem',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '1rem',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  legendDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  legendLabel: {
    fontSize: '0.7rem',
    color: 'var(--color-text-secondary)',
    fontWeight: '550',
  },
  avatarSelectionRow: {
    display: 'flex',
    gap: '0.4rem',
    marginTop: '0.5rem',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  avatarSelectOption: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    cursor: 'pointer',
    objectFit: 'cover',
    border: '1px solid transparent',
    transition: 'all 0.2s ease',
  },
  avatarSelectOptionActive: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    cursor: 'pointer',
    objectFit: 'cover',
    border: '2px solid #00f2fe',
    transform: 'scale(1.15)',
  },
  fieldsCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  sectionDivider: {
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '0.5rem',
    marginTop: '0.5rem',
    display: 'flex',
  },
  sectionSubDesc: {
    fontSize: '0.8rem',
    color: 'var(--color-text-muted)',
    lineHeight: '1.4',
    marginTop: '-0.75rem',
  },
  checkboxesRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  checkboxContainer: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'flex-start',
    cursor: 'pointer',
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    ':hover': {
      background: 'var(--bg-primary)',
      borderColor: 'var(--border-color)'
    }
  },
  checkbox: {
    marginTop: '0.2rem',
    cursor: 'pointer',
  },
  checkboxLarge: {
    marginTop: '0.3rem',
    cursor: 'pointer',
    width: '18px',
    height: '18px',
  },
  formRow2Col: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
    width: '100%',
  },
  addedList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    padding: '0.75rem',
  },
  listItem: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.82rem',
    color: 'var(--color-text-secondary)',
  },
  removeBtn: {
    background: 'transparent',
    border: 'none',
    color: '#f43f5e',
    cursor: 'pointer',
    fontSize: '0.75rem',
  },
  addItemForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    padding: '0.75rem',
  },
  smallInput: {
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: '4px',
    padding: '0.4rem 0.75rem',
    color: 'var(--color-text-primary)',
    fontSize: '0.8rem',
    outline: 'none',
    width: '100%',
  },
  smallBtn: {
    padding: '0.4rem 1rem',
    fontSize: '0.75rem',
  },
  accreditCheckbox: {
    display: 'flex',
    gap: '1.25rem',
    alignItems: 'flex-start',
    cursor: 'pointer',
    background: 'rgba(16, 185, 129, 0.03)',
    border: '1px solid rgba(16, 185, 129, 0.1)',
    padding: '1.25rem',
    borderRadius: '8px',
  },
  wizardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '1.5rem',
    marginTop: '1rem',
  },
  nextBtn: {
    marginLeft: 'auto',
    padding: '0.6rem 1.5rem',
  },
  errorBox: {
    background: 'rgba(244, 63, 94, 0.08)',
    border: '1px solid #f43f5e',
    color: 'var(--color-text-primary)',
    padding: '0.75rem 1rem',
    borderRadius: '6px',
    fontSize: '0.85rem',
    fontWeight: '600',
  }
};
