'use client';

import { useState, useEffect } from 'react';
import { usePeerBridge } from './usePeerBridge';
import LandingView from './components/LandingView';
import ProfileModule from './components/ProfileModule';
import SalesAdminModule from './components/SalesAdminModule';
import EntrepreneurModule from './components/EntrepreneurModule';
import InvestorModule from './components/InvestorModule';
import AffiliateModule from './components/AffiliateModule';
import BankingModule from './components/BankingModule';
import DocumentModule from './components/DocumentModule';
import TaxModule from './components/TaxModule';
import SupportModule from './components/SupportModule';
import OnboardingWizard from './components/OnboardingWizard';

export default function Home() {
  const state = usePeerBridge();

  const [showViewersModal, setShowViewersModal] = useState(false);
  const [showImpressionsModal, setShowImpressionsModal] = useState(false);
  
  // Dynamic header and chat cockpit states
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [chatExpanded, setChatExpanded] = useState(false);
  const [activeChatRecipient, setActiveChatRecipient] = useState(null);
  const [chatInputText, setChatInputText] = useState('');
  const [chatThreads, setChatThreads] = useState({});
  const [chatSearchQuery, setChatSearchQuery] = useState('');

  // Sync chats with localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedChats = localStorage.getItem('pb_chats');
      if (storedChats) {
        setChatThreads(JSON.parse(storedChats));
      }
    }
  }, []);

  const syncChats = (threads) => {
    setChatThreads(threads);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pb_chats', JSON.stringify(threads));
    }
  };

  // Discovery Search Hub states
  const [searchTab, setSearchTab] = useState('people'); // 'people' | 'investments' | 'advisors'
  const [searchLocation, setSearchLocation] = useState('');
  const [searchIndustry, setSearchIndustry] = useState('All');
  const [vettedCreds, setVettedCreds] = useState({
    identity: false,
    wealth: false,
    academic: false,
    job: false
  });

  // Profile inspector states
  const [inspectorTab, setInspectorTab] = useState('professional');
  
  useEffect(() => {
    if (state.inspectedCustomer) {
      setInspectorTab('professional');
    }
  }, [state.inspectedCustomer]);

  if (!state.isAuthenticated) {
    return <LandingView state={state} />;
  }

  if (state.customer && !state.customer.isOnboarded) {
    return <OnboardingWizard state={state} />;
  }

  const renderSidebarProfileRing = () => {
    const cust = state.customer || {};
    const basic = state.basicProfile || {};
    const prof = state.professionalProfile || {};
    const inv = state.investorProfile || {};

    const hasId = true; // Email verified
    const hasJobVal = prof.experience && prof.experience.length > 0;
    const hasAcadVal = prof.education && prof.education.length > 0;
    const hasWealthVal = inv.accreditation_status || false;
    const hasAddressAndSsn = basic.address?.trim().length > 3 && cust.ssn?.trim().length > 0;

    const colorId = hasId ? (hasAddressAndSsn ? '#d4af37' : '#00f2fe') : 'rgba(255,255,255,0.08)';
    const colorJob = hasJobVal ? '#8f00ff' : 'rgba(255,255,255,0.08)';
    const colorAcad = hasAcadVal ? '#6366f1' : 'rgba(255,255,255,0.08)';
    const colorWealth = hasWealthVal ? '#10b981' : 'rgba(255,255,255,0.08)';

    const radius = 50;

    return (
      <>
        <svg width="60" height="60" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
          <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="4" />
          <circle cx="60" cy="60" r={radius} fill="none" stroke={colorId} strokeWidth="8" strokeDasharray="72.5 241.6" strokeDashoffset="0" strokeLinecap="round" />
          <circle cx="60" cy="60" r={radius} fill="none" stroke={colorWealth} strokeWidth="8" strokeDasharray="72.5 241.6" strokeDashoffset="-78.5" strokeLinecap="round" />
          <circle cx="60" cy="60" r={radius} fill="none" stroke={colorAcad} strokeWidth="8" strokeDasharray="72.5 241.6" strokeDashoffset="-157" strokeLinecap="round" />
          <circle cx="60" cy="60" r={radius} fill="none" stroke={colorJob} strokeWidth="8" strokeDasharray="72.5 241.6" strokeDashoffset="-235.5" strokeLinecap="round" />
        </svg>
        {basic.profile_picture_url ? (
          <img 
            src={basic.profile_picture_url} 
            alt={state.user.name} 
            style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', zIndex: 1 }} 
          />
        ) : (
          <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#00f2fe', color: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: '800', zIndex: 1 }}>
            {state.user.name.charAt(0)}
          </div>
        )}
      </>
    );
  };

  // Dynamic Multi-Role Profile Inspector Modal (Root Level to prevent container overlap CSS bugs)
  const renderInspectedCustomerModal = () => {
    const inspectedMember = state.inspectedCustomer;
    if (!inspectedMember) return null;

    const renderMemberRing = (memberCustomer, memberBasic, memberProf, memberInv, size = 120, ringWidth = 5) => {
      const hasId = true;
      const hasJobVal = memberProf?.experience && memberProf.experience.length > 0;
      const hasAcadVal = memberProf?.education && memberProf.education.length > 0;
      const hasWealthVal = memberInv?.accreditation_status || false;
      const hasAddressAndSsn = memberBasic?.address?.trim().length > 3 && memberCustomer?.ssn?.trim().length > 0;

      const colorId = hasId ? (hasAddressAndSsn ? '#d4af37' : '#00f2fe') : 'rgba(255,255,255,0.08)'; // Gold or Cyan
      const colorJob = hasJobVal ? '#8f00ff' : 'rgba(255,255,255,0.08)'; // Purple
      const colorAcad = hasAcadVal ? '#6366f1' : 'rgba(255,255,255,0.08)'; // Indigo
      const colorWealth = hasWealthVal ? '#10b981' : 'rgba(255,255,255,0.08)'; // Emerald

      const radius = 54;
      const perimeter = 2 * Math.PI * radius; // 339.29

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

    return (
      <div style={styles.modalOverlay}>
        <div className="glass-panel glow-accent-border animate-fade-in-up" style={styles.modalCard}>
          
          {/* Modal Header */}
          <div style={styles.modalHeader}>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <div style={{ position: 'relative', width: '90px', height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {renderMemberRing(inspectedMember, inspectedMember.basicProfile, inspectedMember.professionalProfile, inspectedMember.investorProfile, 90, 4.5)}
                {inspectedMember.basicProfile?.profile_picture_url ? (
                  <img src={inspectedMember.basicProfile.profile_picture_url} alt={inspectedMember.first_name} style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', zIndex: 1 }} />
                ) : (
                  <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'linear-gradient(135deg, #00f2fe 0%, #8f00ff 100%)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: '800', zIndex: 1 }}>
                    {inspectedMember.first_name.charAt(0)}{inspectedMember.last_name.charAt(0)}
                  </div>
                )}
              </div>

              <div>
                <h3 style={styles.modalMemberName}>{inspectedMember.first_name} {inspectedMember.last_name}</h3>
                <p style={styles.modalMemberHeadline}>{inspectedMember.professionalProfile?.headline}</p>
                <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                  {inspectedMember.role_flags?.map((role) => (
                    <span key={role} className="badge badge-verified" style={{ fontSize: '0.62rem' }}>{role}</span>
                  ))}
                  {inspectedMember.ssn && <span className="badge badge-admin" style={{ fontSize: '0.62rem' }}>✓ ID Verified Node</span>}
                </div>
              </div>
            </div>

            <button onClick={() => state.setInspectedCustomer(null)} style={styles.closeModalBtn}>✕</button>
          </div>

          {/* Modal Tab Buttons */}
          <div style={styles.modalTabRow}>
            <button
              onClick={() => setInspectorTab('professional')}
              style={inspectorTab === 'professional' ? styles.modalTabActive : styles.modalTabInactive}
            >
              💼 Professional Credentials
            </button>

            {inspectedMember.role_flags?.includes('Entrepreneur') && inspectedMember.entrepreneurProfile && (
              <button
                onClick={() => setInspectorTab('entrepreneur')}
                style={inspectorTab === 'entrepreneur' ? styles.modalTabActive : styles.modalTabInactive}
              >
                🏢 Entrepreneur Portfolio
              </button>
            )}

            {inspectedMember.role_flags?.includes('Investor') && inspectedMember.investorProfile && (
              <button
                onClick={() => setInspectorTab('investor')}
                style={inspectorTab === 'investor' ? styles.modalTabActive : styles.modalTabInactive}
              >
                👤 Investor Profile
              </button>
            )}

            {inspectedMember.role_flags?.includes('Affiliate') && inspectedMember.affiliateProfile && (
              <button
                onClick={() => setInspectorTab('affiliate')}
                style={inspectorTab === 'affiliate' ? styles.modalTabActive : styles.modalTabInactive}
              >
                👥 Professional Advisory
              </button>
            )}
          </div>

          {/* Modal Tab Body */}
          <div style={styles.modalBody}>
            {inspectorTab === 'professional' && (
              <div style={styles.modalTabBody}>
                <div style={styles.modalSection}>
                  <h4 style={styles.modalSecHeader}>Summary Pedigree</h4>
                  <p style={styles.modalText}>{inspectedMember.professionalProfile?.summary || 'No summary recorded.'}</p>
                  <p style={{ ...styles.modalText, fontStyle: 'italic', color: '#737373', marginTop: '0.5rem' }}>
                    "{inspectedMember.basicProfile?.bio || 'No bio quote.'}"
                  </p>
                </div>

                <div style={styles.modalSection}>
                  <h4 style={styles.modalSecHeader}>demographics</h4>
                  <div style={styles.demographicsGrid}>
                    <p><strong>Nationality:</strong> {inspectedMember.basicProfile?.nationality || 'Not listed'}</p>
                    <p><strong>SSN Credentials:</strong> {inspectedMember.ssn ? '🔒 Background checked & verified' : '⚠ Optional verification missing'}</p>
                  </div>
                </div>

                <div style={styles.modalSection}>
                  <h4 style={styles.modalSecHeader}>Work Ledger History</h4>
                  {(!inspectedMember.professionalProfile?.experience || inspectedMember.professionalProfile.experience.length === 0) ? (
                    <p style={styles.modalEmptyText}>No previous jobs logged.</p>
                  ) : (
                    <div style={styles.modalJobList}>
                      {inspectedMember.professionalProfile.experience.map((job, idx) => (
                        <div key={idx} style={styles.modalJobItem}>
                          <div style={styles.modalJobHeader}>
                            <strong>{job.title}</strong>
                            <span>{job.start_date} • {job.current ? 'Present' : job.end_date}</span>
                          </div>
                          <span style={styles.modalJobCompany}>{job.company}</span>
                          <p style={styles.modalJobDesc}>{job.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={styles.modalSection}>
                  <h4 style={styles.modalSecHeader}>Education & Academics</h4>
                  {(!inspectedMember.professionalProfile?.education || inspectedMember.professionalProfile.education.length === 0) ? (
                    <p style={styles.modalEmptyText}>No educational credentials recorded.</p>
                  ) : (
                    <div style={styles.modalJobList}>
                      {inspectedMember.professionalProfile.education.map((edu, idx) => (
                        <div key={idx} style={styles.modalEduItem}>
                          <strong>{edu.degree}</strong> from <span>{edu.institution}</span> ({edu.year})
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {inspectorTab === 'entrepreneur' && inspectedMember.entrepreneurProfile && (
              <div style={styles.modalTabBody}>
                <div style={styles.modalSection}>
                  <h4 style={styles.modalSecHeader}>Company raising sheet</h4>
                  <div style={styles.demographicsGrid}>
                    <p><strong>Company Name:</strong> {inspectedMember.entrepreneurProfile.company_name}</p>
                    <p><strong>Industry Stage:</strong> <span style={{ textTransform: 'capitalize' }}>{inspectedMember.entrepreneurProfile.business_stage}</span></p>
                    <p><strong>Funding Goal:</strong> ${inspectedMember.entrepreneurProfile.funding_goal?.toLocaleString()}</p>
                    <p><strong>Valuation Target:</strong> ${inspectedMember.entrepreneurProfile.valuation?.toLocaleString()}</p>
                    <p><strong>Sector:</strong> {inspectedMember.entrepreneurProfile.industry}</p>
                    {inspectedMember.entrepreneurProfile.pitch_deck_url && (
                      <p>
                        <strong>Pitch Deck:</strong>{' '}
                        <a href={inspectedMember.entrepreneurProfile.pitch_deck_url} target="_blank" rel="noreferrer" style={{ color: '#00f2fe' }}>
                          View S3 Document 🔗
                        </a>
                      </p>
                    )}
                  </div>
                </div>

                <div style={styles.modalSection}>
                  <h4 style={styles.modalSecHeader}>Company Overview</h4>
                  <p style={styles.modalText}>{inspectedMember.entrepreneurProfile.company_summary || 'No overview recorded.'}</p>
                </div>
              </div>
            )}

            {inspectorTab === 'investor' && inspectedMember.investorProfile && (
              <div style={styles.modalTabBody}>
                <div style={styles.modalSection}>
                  <h4 style={styles.modalSecHeader}>Investor profile settings</h4>
                  <div style={styles.demographicsGrid}>
                    <p><strong>Investor Type:</strong> <span style={{ textTransform: 'capitalize' }}>{inspectedMember.investorProfile.investor_type} Investor</span></p>
                    <p><strong>Risk Appetite:</strong> <span style={{ textTransform: 'capitalize' }}>{inspectedMember.investorProfile.risk_appetite}</span></p>
                    <p>
                      <strong>Investment Limits:</strong>{' '}
                      ${inspectedMember.investorProfile.investment_range?.min?.toLocaleString()} Min – ${inspectedMember.investorProfile.investment_range?.max?.toLocaleString()} Max
                    </p>
                    <p>
                      <strong>Accreditation Status:</strong>{' '}
                      <span style={{ color: inspectedMember.investorProfile.accreditation_status ? '#10b981' : '#f43f5e' }}>
                        {inspectedMember.investorProfile.accreditation_status ? '✓ KYC Accredited & Vetted' : '⚠ Non-Accredited'}
                      </span>
                    </p>
                  </div>
                </div>

                {inspectedMember.investorProfile.preferred_industries && inspectedMember.investorProfile.preferred_industries.length > 0 && (
                  <div style={styles.modalSection}>
                    <h4 style={styles.modalSecHeader}>Preferred Industries</h4>
                    <div style={styles.skillsTagRow}>
                      {inspectedMember.investorProfile.preferred_industries.map((ind) => (
                        <span key={ind} style={styles.skillTag}>{ind}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {inspectorTab === 'affiliate' && inspectedMember.affiliateProfile && (
              <div style={styles.modalTabBody}>
                <div style={styles.modalSection}>
                  <h4 style={styles.modalSecHeader}>Advisory & certified services</h4>
                  <div style={styles.demographicsGrid}>
                    <p><strong>Advisor Classification:</strong> <span style={{ textTransform: 'capitalize' }}>{inspectedMember.affiliateProfile.entity_type} Entity</span></p>
                    <p><strong>Firm name:</strong> {inspectedMember.affiliateProfile.firm || 'Individual Practice'}</p>
                    <p><strong>Specialty Focus:</strong> {inspectedMember.affiliateProfile.specialty}</p>
                    <p>
                      <strong>Vouch Ratings:</strong>{' '}
                      ★ <strong>{inspectedMember.affiliateProfile.rating || '5.0'}</strong> ({inspectedMember.affiliateProfile.reviews || '0'} Vouched reviews)
                    </p>
                  </div>
                </div>

                <div style={styles.modalSection}>
                  <h4 style={styles.modalSecHeader}>Services bio overview</h4>
                  <p style={styles.modalText}>{inspectedMember.affiliateProfile.bio || 'No services overview logged.'}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Profile Viewers Modal
  const renderViewersModal = () => {
    return (
      <div style={styles.modalOverlay}>
        <div className="glass-panel" style={styles.modalContent}>
          <div style={styles.modalHeader}>
            <h3 style={{ fontSize: '1.1rem', color: '#ffffff', margin: 0 }}>Recent Profile Viewers Log</h3>
            <button onClick={() => setShowViewersModal(false)} style={styles.closeModalBtn}>✕</button>
          </div>
          <p style={{ fontSize: '0.78rem', color: '#a3a3a3', marginBottom: '1rem', lineHeight: '1.4' }}>
            The following verified network nodes have inspected your credentials and placement portfolio within the last 72 hours:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={styles.viewerItem}>
              <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&q=80" alt="Evelyn" style={styles.viewerAvatar} />
              <div style={{ flex: 1 }}>
                <h4 style={styles.viewerName}>Dr. Evelyn Chen</h4>
                <p style={styles.viewerTitle}>Chief Algae Geneticist & Stanford PhD</p>
                <span style={styles.viewerTime}>Viewed your company cap table • 2h ago</span>
              </div>
              <button 
                onClick={() => {
                  setShowViewersModal(false);
                  state.setActiveModule('profile');
                  state.setProfileActiveSubTab('network-directory');
                }}
                className="btn-secondary" 
                style={styles.viewerBtn}
              >
                Inspect
              </button>
            </div>

            <div style={styles.viewerItem}>
              <img src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&q=80" alt="Sarah" style={styles.viewerAvatar} />
              <div style={{ flex: 1 }}>
                <h4 style={styles.viewerName}>Sarah Jenkins, Esq.</h4>
                <p style={styles.viewerTitle}>Managing Securities Placement Partner</p>
                <span style={styles.viewerTime}>Inspected your IRS W-9 filing • 1d ago</span>
              </div>
              <button 
                onClick={() => {
                  setShowViewersModal(false);
                  state.setActiveModule('profile');
                  state.setProfileActiveSubTab('network-directory');
                }}
                className="btn-secondary" 
                style={styles.viewerBtn}
              >
                Inspect
              </button>
            </div>

            <div style={styles.viewerItem}>
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&q=80" alt="Alex" style={styles.viewerAvatar} />
              <div style={{ flex: 1 }}>
                <h4 style={styles.viewerName}>Alex Rivera</h4>
                <p style={styles.viewerTitle}>EcoSphere Bioreactor Co-Founder</p>
                <span style={styles.viewerTime}>Viewed professional experience ledger • 3d ago</span>
              </div>
              <button 
                onClick={() => {
                  setShowViewersModal(false);
                  state.setActiveModule('profile');
                  state.setProfileActiveSubTab('network-directory');
                }}
                className="btn-secondary" 
                style={styles.viewerBtn}
              >
                Inspect
              </button>
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem', marginTop: '1.25rem', textAlign: 'right' }}>
            <button className="btn-primary" onClick={() => setShowViewersModal(false)} style={{ padding: '0.4rem 1rem', fontSize: '0.75rem' }}>
              Acknowledge & Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Post Impressions Modal
  const renderImpressionsModal = () => {
    return (
      <div style={styles.modalOverlay}>
        <div className="glass-panel" style={styles.modalContent}>
          <div style={styles.modalHeader}>
            <h3 style={{ fontSize: '1.1rem', color: '#ffffff', margin: 0 }}>Ecosystem Node Analytics</h3>
            <button onClick={() => setShowImpressionsModal(false)} style={styles.closeModalBtn}>✕</button>
          </div>
          <p style={{ fontSize: '0.78rem', color: '#a3a3a3', marginBottom: '1.25rem', lineHeight: '1.4' }}>
            Cumulative organic reach and transaction interest on your launched deal-flow campaigns and regulatory forum postings:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={styles.analyticCard}>
              <span style={styles.analyticLabel}>Post Impressions</span>
              <strong style={styles.analyticVal}>{state.postImpressions}</strong>
              <span style={styles.analyticSub}>+12.4% vs last week</span>
            </div>
            <div style={styles.analyticCard}>
              <span style={styles.analyticLabel}>Ecosystem Views</span>
              <strong style={styles.analyticVal}>{state.profileViewers}</strong>
              <span style={styles.analyticSub}>Average session: 4m 12s</span>
            </div>
          </div>

          <h4 style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: '#ffffff', letterSpacing: '0.05em', marginBottom: '0.65rem' }}>Audience Demography</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#a3a3a3', marginBottom: '0.2rem' }}>
                <span>Venture Placement Directors / Investors</span>
                <span style={{ color: '#ffffff', fontWeight: '700' }}>48%</span>
              </div>
              <div style={{ height: '5px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: '48%', height: '100%', background: '#00f2fe' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#a3a3a3', marginBottom: '0.2rem' }}>
                <span>Ecosystem Founders / Entrepreneurs</span>
                <span style={{ color: '#ffffff', fontWeight: '700' }}>35%</span>
              </div>
              <div style={{ height: '5px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: '35%', height: '100%', background: '#8f00ff' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#a3a3a3', marginBottom: '0.2rem' }}>
                <span>Securities Auditors / Legal Affiliates</span>
                <span style={{ color: '#ffffff', fontWeight: '700' }}>17%</span>
              </div>
              <div style={{ height: '5px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: '17%', height: '100%', background: '#10b981' }}></div>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem', marginTop: '1.25rem', textAlign: 'right' }}>
            <button className="btn-primary" onClick={() => setShowImpressionsModal(false)} style={{ padding: '0.4rem 1rem', fontSize: '0.75rem' }}>
              Dismiss Analytics
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Active module router
  const renderActiveModule = () => {
    switch (state.activeModule) {
      case 'portfolio':
        return <InvestorModule state={state} />;
      case 'entrepreneur':
        return <EntrepreneurModule state={state} />;
      case 'affiliate':
        return <AffiliateModule state={state} />;
      case 'banking':
        return <BankingModule state={state} />;
      case 'documents':
        return <DocumentModule state={state} />;
      case 'tax':
        return <TaxModule state={state} />;
      case 'profile':
        return <ProfileModule state={state} />;
      case 'support':
        return <SupportModule state={state} />;
      case 'admin':
        return <SalesAdminModule state={state} />;
      
      // Technology Behind Saved Items
      case 'saved':
        const savedCampaigns = state.campaigns.filter(c => state.savedCampaignIds.includes(c.id));
        return (
          <div className="glass-panel animate-fade-in-up" style={{ padding: '1.5rem', borderRadius: '16px', minHeight: '80vh' }}>
            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.85rem', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '850', color: '#ffffff', margin: 0 }}>Saved Placement Vault</h2>
              <p style={{ fontSize: '0.8rem', color: '#a3a3a3', marginTop: '0.2rem' }}>
                Bookmarked fundraising campaigns and advisor listings synced to your Reg D credential profile.
              </p>
            </div>

            {savedCampaigns.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 1rem', textAlign: 'center' }}>
                <span style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔖</span>
                <h3 style={{ fontSize: '1rem', color: '#ffffff', fontWeight: '700' }}>No Saved Placements</h3>
                <p style={{ fontSize: '0.8rem', color: '#525252', maxWidth: '300px', margin: '0.25rem 0 1rem 0' }}>
                  Browse active seed offerings in the Ecosystem Home feed to save them for future diligence.
                </p>
                <button className="btn-primary" onClick={() => state.setActiveModule('portfolio')} style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }}>
                  Explore Opportunities
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
                {savedCampaigns.map(camp => {
                  const progress = Math.min(100, Math.floor((camp.raised / camp.target) * 100));
                  return (
                    <div className="glass-panel glow-accent-border" key={camp.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.01)', borderRadius: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                          <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#ffffff', margin: 0 }}>{camp.companyName}</h3>
                          <span style={{ fontSize: '0.62rem', fontWeight: '700', padding: '0.1rem 0.35rem', borderRadius: '4px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#a3a3a3' }}>
                            {camp.category}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: '#a3a3a3', lineHeight: '1.35', minHeight: '2.5rem', marginBottom: '0.75rem', overflow: 'hidden' }}>
                          {camp.tagline}
                        </p>

                        <div style={{ marginBottom: '0.75rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#a3a3a3', marginBottom: '0.2rem' }}>
                            <span>Raised: <strong>${camp.raised.toLocaleString()}</strong></span>
                            <span>Target: <strong>${camp.target.toLocaleString()}</strong></span>
                          </div>
                          <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ width: `${progress}%`, height: '100%', background: '#00f2fe' }}></div>
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.4rem', borderRadius: '6px', marginBottom: '1rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '0.6rem', color: '#525252' }}>Valuation</span>
                            <span style={{ fontSize: '0.7rem', color: '#ffffff', fontWeight: '700' }}>${(camp.valuation / 1000000).toFixed(1)}M</span>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '0.6rem', color: '#525252' }}>Min Entry</span>
                            <span style={{ fontSize: '0.7rem', color: '#ffffff', fontWeight: '700' }}>${camp.minInvestment}</span>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          onClick={() => state.setActiveModule('portfolio')} 
                          className="btn-primary" 
                          style={{ flex: 1, padding: '0.4rem 0', fontSize: '0.7rem', display: 'flex', justifyContent: 'center' }}
                        >
                          View Offering
                        </button>
                        <button 
                          onClick={() => state.toggleSaveCampaign(camp.id)} 
                          className="btn-secondary" 
                          style={{ padding: '0.4rem 0.65rem', fontSize: '0.7rem', display: 'flex', justifyContent: 'center', borderColor: 'rgba(244,63,94,0.15)', color: '#f43f5e' }}
                          title="Remove Bookmark"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );

      // Technology Behind Events Calendar
      case 'events':
        return (
          <div className="glass-panel animate-fade-in-up" style={{ padding: '1.5rem', borderRadius: '16px', minHeight: '80vh' }}>
            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.85rem', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '850', color: '#ffffff', margin: 0 }}>Deal-Flow Briefings & Events</h2>
              <p style={{ fontSize: '0.8rem', color: '#a3a3a3', marginTop: '0.2rem' }}>
                Register for private deal-flow placement webinars, corporate cap table audits, and Reg D SEC compliance updates.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {state.events.map(evt => {
                return (
                  <div className="glass-panel glow-accent-border" key={evt.id} style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.01)', borderRadius: '12px', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '70px', padding: '0.5rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: '0.58rem', fontWeight: '800', color: '#00f2fe', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Webinar</span>
                      <span style={{ fontSize: '1.25rem', margin: '0.15rem 0' }}>📅</span>
                      <span style={{ fontSize: '0.58rem', color: '#a3a3a3' }}>Live</span>
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#ffffff', margin: 0 }}>{evt.title}</h3>
                        <span style={{ fontSize: '0.6rem', fontWeight: '700', padding: '0.1rem 0.35rem', borderRadius: '4px', background: evt.attending ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.04)', color: evt.attending ? '#10b981' : '#a3a3a3', border: evt.attending ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(255,255,255,0.05)' }}>
                          {evt.category}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.78rem', color: '#a3a3a3', lineHeight: '1.4', margin: '0.35rem 0 0.75rem 0' }}>
                        {evt.description}
                      </p>
                      
                      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '0.75rem', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.72rem', color: '#525252' }}>
                          <span>Time: <strong style={{ color: '#ffffff' }}>{evt.date}</strong></span>
                          <span>Registered Attendees: <strong style={{ color: '#00f2fe' }}>{evt.attendees} peers</strong></span>
                        </div>

                        <button 
                          onClick={() => state.toggleEventAttendance(evt.id)} 
                          className={evt.attending ? "btn-secondary" : "btn-primary"} 
                          style={{ padding: '0.35rem 1rem', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                        >
                          {evt.attending ? (
                            <>
                              <span>Going</span>
                              <span>✓</span>
                            </>
                          ) : (
                            <span>Register Seat</span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'search':
        // Multi-criteria filtering logic
        const renderCardRing = (m) => {
          const basic = m.basicProfile || {};
          const prof = m.professionalProfile || {};
          const inv = m.investorProfile || {};

          const hasId = m.status === 'verified' || (basic.address?.trim().length > 3 && m.ssn?.trim().length > 0);
          const hasJobVal = prof.experience && prof.experience.length > 0;
          const hasAcadVal = prof.education && prof.education.length > 0;
          const hasWealthVal = inv.accreditation_status || false;

          const colorId = hasId ? '#00f2fe' : 'rgba(255,255,255,0.08)';
          const colorJob = hasJobVal ? '#8f00ff' : 'rgba(255,255,255,0.08)';
          const colorAcad = hasAcadVal ? '#6366f1' : 'rgba(255,255,255,0.08)';
          const colorWealth = hasWealthVal ? '#10b981' : 'rgba(255,255,255,0.08)';

          return (
            <div style={{ position: 'relative', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="50" height="50" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', position: 'absolute', top: 0, left: 0 }}>
                <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="3" />
                <circle cx="50" cy="50" r="40" fill="none" stroke={colorId} strokeWidth="6" strokeDasharray="58 193.3" strokeDashoffset="0" strokeLinecap="round" />
                <circle cx="50" cy="50" r="40" fill="none" stroke={colorWealth} strokeWidth="6" strokeDasharray="58 193.3" strokeDashoffset="-62.8" strokeLinecap="round" />
                <circle cx="50" cy="50" r="40" fill="none" stroke={colorAcad} strokeWidth="6" strokeDasharray="58 193.3" strokeDashoffset="-125.6" strokeLinecap="round" />
                <circle cx="50" cy="50" r="40" fill="none" stroke={colorJob} strokeWidth="6" strokeDasharray="58 193.3" strokeDashoffset="-188.4" strokeLinecap="round" />
              </svg>
              {basic.profile_picture_url ? (
                <img 
                  src={basic.profile_picture_url} 
                  alt={m.first_name} 
                  style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover', zIndex: 1 }} 
                />
              ) : (
                <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#00f2fe', color: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: '800', zIndex: 1 }}>
                  {m.first_name.charAt(0)}
                </div>
              )}
            </div>
          );
        };

        const getFilteredResults = () => {
          if (searchTab === 'people') {
            return state.directory.filter(member => {
              const nameStr = `${member.first_name} ${member.last_name}`.toLowerCase();
              const bioStr = (member.basicProfile?.bio || '').toLowerCase();
              const headlineStr = (member.professionalProfile?.headline || '').toLowerCase();
              const skillsStr = (member.professionalProfile?.skills || []).join(' ').toLowerCase();
              const q = state.globalSearchQuery.toLowerCase();
              const matchesSearch = !q || nameStr.includes(q) || bioStr.includes(q) || headlineStr.includes(q) || skillsStr.includes(q);

              const loc = searchLocation.toLowerCase();
              const addrStr = (member.basicProfile?.address || '').toLowerCase();
              const natStr = (member.basicProfile?.nationality || '').toLowerCase();
              const matchesLoc = !loc || addrStr.includes(loc) || natStr.includes(loc);

              const ind = searchIndustry;
              const indPref = member.investorProfile?.preferred_industries || [];
              const indEnt = member.entrepreneurProfile?.industry || '';
              const indAff = member.affiliateProfile?.specialty || '';
              const matchesInd = ind === 'All' || 
                indEnt.toLowerCase().includes(ind.toLowerCase()) || 
                indAff.toLowerCase().includes(ind.toLowerCase()) || 
                indPref.some(p => p.toLowerCase().includes(ind.toLowerCase()));

              const basic = member.basicProfile || {};
              const prof = member.professionalProfile || {};
              const inv = member.investorProfile || {};
              const hasId = member.status === 'verified' || (basic.address?.trim().length > 3 && member.ssn?.trim().length > 0);
              const hasWealth = inv.accreditation_status || false;
              const hasAcad = prof.education && prof.education.length > 0;
              const hasJob = prof.experience && prof.experience.length > 0;

              if (vettedCreds.identity && !hasId) return false;
              if (vettedCreds.wealth && !hasWealth) return false;
              if (vettedCreds.academic && !hasAcad) return false;
              if (vettedCreds.job && !hasJob) return false;

              return matchesSearch && matchesLoc && matchesInd;
            });
          } else if (searchTab === 'investments') {
            return state.campaigns.filter(camp => {
              const companyNameLower = camp.companyName.toLowerCase();
              const taglineLower = camp.tagline.toLowerCase();
              const descLower = camp.description.toLowerCase();
              const q = state.globalSearchQuery.toLowerCase();
              const matchesSearch = !q || companyNameLower.includes(q) || taglineLower.includes(q) || descLower.includes(q);

              const founderObj = state.directory.find(m => `${m.first_name} ${m.last_name}` === camp.founder);
              const loc = searchLocation.toLowerCase();
              const addrStr = founderObj ? (founderObj.basicProfile?.address || '').toLowerCase() : '';
              const matchesLoc = !loc || addrStr.includes(loc);

              const ind = searchIndustry;
              const matchesInd = ind === 'All' || camp.category.toLowerCase().includes(ind.toLowerCase());

              if (founderObj) {
                const basic = founderObj.basicProfile || {};
                const prof = founderObj.professionalProfile || {};
                const inv = founderObj.investorProfile || {};
                const hasId = founderObj.status === 'verified' || (basic.address?.trim().length > 3 && founderObj.ssn?.trim().length > 0);
                const hasWealth = inv.accreditation_status || false;
                const hasAcad = prof.education && prof.education.length > 0;
                const hasJob = prof.experience && prof.experience.length > 0;

                if (vettedCreds.identity && !hasId) return false;
                if (vettedCreds.wealth && !hasWealth) return false;
                if (vettedCreds.academic && !hasAcad) return false;
                if (vettedCreds.job && !hasJob) return false;
              } else {
                if (vettedCreds.identity || vettedCreds.wealth || vettedCreds.academic || vettedCreds.job) return false;
              }

              return matchesSearch && matchesLoc && matchesInd;
            });
          } else {
            return state.directory.filter(member => {
              const isAffiliate = member.role_flags.includes('Affiliate') || member.affiliateProfile;
              if (!isAffiliate) return false;

              const nameStr = `${member.first_name} ${member.last_name}`.toLowerCase();
              const bioStr = (member.affiliateProfile?.bio || member.basicProfile?.bio || '').toLowerCase();
              const specialtyStr = (member.affiliateProfile?.specialty || '').toLowerCase();
              const q = state.globalSearchQuery.toLowerCase();
              const matchesSearch = !q || nameStr.includes(q) || bioStr.includes(q) || specialtyStr.includes(q);

              const loc = searchLocation.toLowerCase();
              const addrStr = (member.basicProfile?.address || '').toLowerCase();
              const matchesLoc = !loc || addrStr.includes(loc);

              const ind = searchIndustry;
              const specialtyLower = (member.affiliateProfile?.specialty || '').toLowerCase();
              const matchesInd = ind === 'All' || specialtyLower.includes(ind.toLowerCase());

              const basic = member.basicProfile || {};
              const prof = member.professionalProfile || {};
              const inv = member.investorProfile || {};
              const hasId = member.status === 'verified' || (basic.address?.trim().length > 3 && member.ssn?.trim().length > 0);
              const hasWealth = inv.accreditation_status || false;
              const hasAcad = prof.education && prof.education.length > 0;
              const hasJob = prof.experience && prof.experience.length > 0;

              if (vettedCreds.identity && !hasId) return false;
              if (vettedCreds.wealth && !hasWealth) return false;
              if (vettedCreds.academic && !hasAcad) return false;
              if (vettedCreds.job && !hasJob) return false;

              return matchesSearch && matchesLoc && matchesInd;
            });
          }
        };

        const results = getFilteredResults();

        return (
          <div className="glass-panel animate-fade-in-up" style={{ padding: '1.5rem', borderRadius: '16px', minHeight: '80vh' }}>
            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.85rem', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '850', color: '#ffffff', margin: 0 }}>Ecosystem Discovery Hub</h2>
              <p style={{ fontSize: '0.8rem', color: '#a3a3a3', marginTop: '0.2rem' }}>
                Globally query verified node credentials, compliant placements, and corporate legal affiliates in real-time.
              </p>
            </div>

            {/* Type Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              <button 
                onClick={() => setSearchTab('people')} 
                style={{
                  background: searchTab === 'people' ? 'rgba(255,255,255,0.06)' : 'transparent',
                  border: searchTab === 'people' ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
                  color: searchTab === 'people' ? '#ffffff' : '#a3a3a3',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: searchTab === 'people' ? '700' : '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  transition: 'all 0.2s'
                }}
              >
                <span>👥</span> People (Directory)
              </button>
              <button 
                onClick={() => setSearchTab('investments')} 
                style={{
                  background: searchTab === 'investments' ? 'rgba(255,255,255,0.06)' : 'transparent',
                  border: searchTab === 'investments' ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
                  color: searchTab === 'investments' ? '#ffffff' : '#a3a3a3',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: searchTab === 'investments' ? '700' : '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  transition: 'all 0.2s'
                }}
              >
                <span>🚀</span> Investments (Offerings)
              </button>
              <button 
                onClick={() => setSearchTab('advisors')} 
                style={{
                  background: searchTab === 'advisors' ? 'rgba(255,255,255,0.06)' : 'transparent',
                  border: searchTab === 'advisors' ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
                  color: searchTab === 'advisors' ? '#ffffff' : '#a3a3a3',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: searchTab === 'advisors' ? '700' : '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  transition: 'all 0.2s'
                }}
              >
                <span>💼</span> Advisors (Affiliates)
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '1.5rem' }}>
              {/* Left Column: Advanced Filters Sidebar */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '10px' }}>
                <h3 style={{ fontSize: '0.82rem', fontWeight: '800', color: '#ffffff', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem', margin: 0 }}>
                  Advanced Filters
                </h3>

                {/* Location Search Input */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.68rem', color: '#8a8a8a', fontWeight: '700' }}>LOCATION</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <span style={{ position: 'absolute', left: '0.5rem', fontSize: '0.75rem', color: '#525252' }}>📍</span>
                    <input 
                      type="text" 
                      placeholder="e.g. Charlotte, Boston..." 
                      value={searchLocation} 
                      onChange={(e) => setSearchLocation(e.target.value)} 
                      style={{
                        width: '100%',
                        background: 'rgba(0,0,0,0.3)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '6px',
                        padding: '0.4rem 0.5rem 0.4rem 1.6rem',
                        color: '#ffffff',
                        fontSize: '0.75rem',
                        outline: 'none',
                        transition: 'all 0.2s'
                      }}
                    />
                  </div>
                </div>

                {/* Industry Filter Dropdown */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.68rem', color: '#8a8a8a', fontWeight: '700' }}>INDUSTRY</label>
                  <select 
                    value={searchIndustry} 
                    onChange={(e) => setSearchIndustry(e.target.value)} 
                    style={{
                      width: '100%',
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '6px',
                      padding: '0.4rem 0.5rem',
                      color: '#ffffff',
                      fontSize: '0.75rem',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="All">All Sectors</option>
                    <option value="CleanTech">CleanTech</option>
                    <option value="MedTech">MedTech</option>
                    <option value="Fintech">Fintech</option>
                    <option value="AI/ML">AI / Deep Learning</option>
                    <option value="SaaS">SaaS</option>
                  </select>
                </div>

                {/* Vetted Credentials Checkboxes */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.68rem', color: '#8a8a8a', fontWeight: '700' }}>VETTED CREDENTIALS</label>
                  
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.72rem', color: '#a3a3a3', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={vettedCreds.identity} 
                      onChange={(e) => setVettedCreds({ ...vettedCreds, identity: e.target.checked })} 
                      style={{ cursor: 'pointer', accentColor: '#00f2fe' }}
                    />
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00f2fe' }} />
                      Identity Vetted
                    </span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.72rem', color: '#a3a3a3', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={vettedCreds.wealth} 
                      onChange={(e) => setVettedCreds({ ...vettedCreds, wealth: e.target.checked })} 
                      style={{ cursor: 'pointer', accentColor: '#10b981' }}
                    />
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                      Accredited Wealth
                    </span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.72rem', color: '#a3a3a3', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={vettedCreds.academic} 
                      onChange={(e) => setVettedCreds({ ...vettedCreds, academic: e.target.checked })} 
                      style={{ cursor: 'pointer', accentColor: '#6366f1' }}
                    />
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#6366f1' }} />
                      Academic Vetted
                    </span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.72rem', color: '#a3a3a3', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={vettedCreds.job} 
                      onChange={(e) => setVettedCreds({ ...vettedCreds, job: e.target.checked })} 
                      style={{ cursor: 'pointer', accentColor: '#8f00ff' }}
                    />
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#8f00ff' }} />
                      Job Vetted
                    </span>
                  </label>
                </div>

                {/* Clear Filter Button */}
                <button 
                  onClick={() => {
                    setSearchLocation('');
                    setSearchIndustry('All');
                    setVettedCreds({ identity: false, wealth: false, academic: false, job: false });
                    state.setGlobalSearchQuery('');
                  }}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.06)',
                    color: '#a3a3a3',
                    padding: '0.4rem',
                    borderRadius: '6px',
                    fontSize: '0.7rem',
                    cursor: 'pointer',
                    marginTop: '0.5rem',
                    transition: 'all 0.2s'
                  }}
                >
                  Reset All Filters
                </button>
              </div>

              {/* Right Column: Search Results Feed */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: '#a3a3a3', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '0.5rem' }}>
                  <span>Found <strong>{results.length}</strong> matching records</span>
                  {state.globalSearchQuery && <span>Query: "{state.globalSearchQuery}"</span>}
                </div>

                {results.length === 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 1rem', textAlign: 'center' }}>
                    <span style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔍</span>
                    <h3 style={{ fontSize: '0.95rem', color: '#ffffff', fontWeight: '700' }}>No Match in Sync</h3>
                    <p style={{ fontSize: '0.75rem', color: '#525252', maxWidth: '300px', margin: '0.25rem 0 1rem 0' }}>
                      No nodes or placements satisfied the current multi-criteria security query. Try expanding filters.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {results.map((item, idx) => {
                      if (searchTab === 'people' || searchTab === 'advisors') {
                        // People / Advisors Card
                        const roles = item.role_flags || [];
                        const headline = item.professionalProfile?.headline || '';
                        const bio = item.basicProfile?.bio || item.affiliateProfile?.bio || '';
                        const address = item.basicProfile?.address || '';
                        const locationStr = address.split(',').slice(-2).join(',').trim() || item.basicProfile?.nationality || 'Global Node';
                        const specialty = item.affiliateProfile?.specialty || '';

                        return (
                          <div 
                            className="glass-panel glow-accent-border animate-fade-in-up" 
                            key={item.customer_id || idx} 
                            style={{ 
                              padding: '1.25rem', 
                              background: 'rgba(255,255,255,0.01)', 
                              borderRadius: '12px', 
                              display: 'flex', 
                              gap: '1rem', 
                              alignItems: 'flex-start',
                              transition: 'transform 0.2s, box-shadow 0.2s'
                            }}
                          >
                            {/* 4-Sector Verification Ring */}
                            {renderCardRing(item)}

                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                                <div>
                                  <h3 style={{ fontSize: '0.95rem', fontWeight: '850', color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                    {item.first_name} {item.last_name}
                                    {item.status === 'verified' && <span style={{ color: '#00f2fe', fontSize: '0.8rem', cursor: 'help' }} title="KYC/SSN Background Checked">✓</span>}
                                  </h3>
                                  <p style={{ fontSize: '0.74rem', color: '#00f2fe', fontWeight: '600', margin: '0.15rem 0 0 0' }}>
                                    {headline}
                                  </p>
                                </div>
                                <div style={{ display: 'flex', gap: '0.3rem' }}>
                                  {roles.map((r, i) => (
                                    <span 
                                      key={i} 
                                      style={{
                                        fontSize: '0.58rem',
                                        fontWeight: '800',
                                        padding: '0.1rem 0.35rem',
                                        borderRadius: '4px',
                                        background: r === 'Investor' ? 'rgba(16, 185, 129, 0.08)' : r === 'Entrepreneur' ? 'rgba(143, 0, 255, 0.08)' : 'rgba(99, 102, 241, 0.08)',
                                        border: `1px solid ${r === 'Investor' ? 'rgba(16, 185, 129, 0.2)' : r === 'Entrepreneur' ? 'rgba(143, 0, 255, 0.2)' : 'rgba(99, 102, 241, 0.2)'}`,
                                        color: r === 'Investor' ? '#10b981' : r === 'Entrepreneur' ? '#c084fc' : '#818cf8'
                                      }}
                                    >
                                      {r}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              <p style={{ fontSize: '0.76rem', color: '#a3a3a3', lineHeight: '1.4', margin: '0.5rem 0' }}>
                                {bio}
                              </p>

                              {specialty && (
                                <div style={{ fontSize: '0.72rem', color: '#c084fc', marginBottom: '0.5rem' }}>
                                  <strong>Specialty Focus:</strong> {specialty}
                                </div>
                              )}

                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
                                <span style={{ fontSize: '0.68rem', color: '#525252', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                  📍 {locationStr}
                                </span>
                                
                                {searchTab === 'people' ? (
                                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                                    <button 
                                      onClick={() => {
                                        state.setProfileActiveSubTab('network-directory');
                                        state.setInspectedCustomer(item);
                                        state.setActiveModule('profile');
                                      }}
                                      className="btn-secondary" 
                                      style={{ padding: '0.35rem 0.65rem', fontSize: '0.7rem', whiteSpace: 'nowrap' }}
                                    >
                                      🔍 Inspect
                                    </button>
                                    {item.customer_id !== state.customer.customer_id && (
                                      <button 
                                        onClick={() => state.toggleConnectionNode(item.customer_id)}
                                        className={state.connections.includes(item.customer_id) ? "btn-secondary" : "btn-primary"}
                                        style={{ 
                                          padding: '0.35rem 0.65rem', 
                                          fontSize: '0.7rem',
                                          whiteSpace: 'nowrap',
                                          background: state.connections.includes(item.customer_id) ? 'rgba(16, 185, 129, 0.1)' : '',
                                          color: state.connections.includes(item.customer_id) ? '#10b981' : '',
                                          border: state.connections.includes(item.customer_id) ? '1px solid rgba(16, 185, 129, 0.3)' : ''
                                        }}
                                      >
                                        {state.connections.includes(item.customer_id) ? '🤝 Connected' : '➕ Connect'}
                                      </button>
                                    )}
                                  </div>
                                ) : (
                                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                                    <button 
                                      onClick={() => {
                                        state.setActiveModule('affiliate');
                                      }}
                                      className="btn-secondary" 
                                      style={{ padding: '0.35rem 0.65rem', fontSize: '0.7rem', whiteSpace: 'nowrap' }}
                                    >
                                      Consult Advisor
                                    </button>
                                    {item.customer_id !== state.customer.customer_id && (
                                      <button 
                                        onClick={() => state.toggleConnectionNode(item.customer_id)}
                                        className={state.connections.includes(item.customer_id) ? "btn-secondary" : "btn-primary"}
                                        style={{ 
                                          padding: '0.35rem 0.65rem', 
                                          fontSize: '0.7rem',
                                          whiteSpace: 'nowrap',
                                          background: state.connections.includes(item.customer_id) ? 'rgba(16, 185, 129, 0.1)' : '',
                                          color: state.connections.includes(item.customer_id) ? '#10b981' : '',
                                          border: state.connections.includes(item.customer_id) ? '1px solid rgba(16, 185, 129, 0.3)' : ''
                                        }}
                                      >
                                        {state.connections.includes(item.customer_id) ? '🤝 Connected' : '➕ Connect'}
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      } else {
                        // Investments Campaign Card
                        const progress = Math.min(100, Math.floor((item.raised / item.target) * 100));
                        return (
                          <div 
                            className="glass-panel glow-accent-border animate-fade-in-up" 
                            key={item.id} 
                            style={{ 
                              padding: '1.25rem', 
                              background: 'rgba(255,255,255,0.01)', 
                              borderRadius: '12px', 
                              display: 'flex', 
                              flexDirection: 'column', 
                              justifyContent: 'space-between',
                              gap: '1rem' 
                            }}
                          >
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: '850', color: '#ffffff', margin: 0 }}>{item.companyName}</h3>
                                <span style={{ fontSize: '0.62rem', fontWeight: '800', padding: '0.15rem 0.45rem', borderRadius: '4px', background: 'rgba(0,242,254,0.06)', border: '1px solid rgba(0,242,254,0.2)', color: '#00f2fe' }}>
                                  {item.category}
                                </span>
                              </div>
                              <p style={{ fontSize: '0.78rem', color: '#a3a3a3', lineHeight: '1.4', margin: '0.25rem 0 0.75rem 0' }}>
                                {item.tagline}
                              </p>

                              <div style={{ marginBottom: '0.75rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#a3a3a3', marginBottom: '0.2rem' }}>
                                  <span>Raised: <strong>${item.raised.toLocaleString()}</strong></span>
                                  <span>{progress}% of ${item.target.toLocaleString()}</span>
                                </div>
                                <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                                  <div style={{ width: `${progress}%`, height: '100%', background: '#00f2fe' }}></div>
                                </div>
                              </div>

                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '6px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  <span style={{ fontSize: '0.58rem', color: '#525252', fontWeight: '700' }}>Valuation</span>
                                  <span style={{ fontSize: '0.72rem', color: '#ffffff', fontWeight: '800' }}>${(item.valuation / 1000000).toFixed(1)}M</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  <span style={{ fontSize: '0.58rem', color: '#525252', fontWeight: '700' }}>Min Entry</span>
                                  <span style={{ fontSize: '0.72rem', color: '#ffffff', fontWeight: '800' }}>${item.minInvestment.toLocaleString()}</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  <span style={{ fontSize: '0.58rem', color: '#525252', fontWeight: '700' }}>Share Price</span>
                                  <span style={{ fontSize: '0.72rem', color: '#ffffff', fontWeight: '800' }}>${item.sharePrice.toFixed(2)}</span>
                                </div>
                              </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '0.75rem' }}>
                              <span style={{ fontSize: '0.68rem', color: '#525252' }}>
                                👤 Founder: <strong style={{ color: '#a3a3a3' }}>{item.founder}</strong>
                              </span>
                              <button 
                                onClick={() => {
                                  state.setTargetCampaignId(item.id);
                                  state.setActiveModule('portfolio');
                                }}
                                className="btn-primary" 
                                style={{ padding: '0.35rem 0.85rem', fontSize: '0.7rem' }}
                              >
                                Inspect Offering
                              </button>
                            </div>
                          </div>
                        );
                      }
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return <InvestorModule state={state} />;
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInputText.trim() || !activeChatRecipient) return;

    const recipientId = activeChatRecipient.customer_id;
    const userMsg = { sender: 'me', text: chatInputText.trim() };

    const currentThread = chatThreads[recipientId] || [
      { sender: 'them', text: `Hi! I am ${activeChatRecipient.first_name}. Thanks for connecting! Let me know if you have questions regarding our work.` }
    ];

    const nextThread = [...currentThread, userMsg];
    const nextThreads = { ...chatThreads, [recipientId]: nextThread };
    syncChats(nextThreads);
    setChatInputText('');

    setTimeout(() => {
      const container = document.getElementById('chat-bubbles-container');
      if (container) container.scrollTop = container.scrollHeight;
    }, 50);

    setTimeout(() => {
      let replyText = "Understood. Our team will review the ledger data shortly.";
      const query = chatInputText.trim().toLowerCase();

      if (recipientId === 'dir-cust-marcus') {
        if (query.includes('sec') || query.includes('spv') || query.includes('limit') || query.includes('crowd')) {
          replyText = "The SEC crowdfunding SPV limit under 2021 amendments permits co-issuing vehicles up to $5M in a 12-month window. We structure these cap tables cleanly with Vance CPAs to consolidate the crowd into one single node line-item.";
        } else if (query.includes('fee') || query.includes('charge') || query.includes('cost')) {
          replyText = "We charge a standard 2.5% platform placement fee on successfully funded rounds, alongside a flat $1,500 onboarding cap table compliance audit fee. This includes automated Form C preparations.";
        } else {
          replyText = "Excellent inquiry. Under securities auditing benchmarks, we audit cap tables to ensure clean Reg CF compliance check Sweeps. Let's arrange a deeper review of your cap sheet.";
        }
      } else if (recipientId === 'db-cust-evelyn') {
        if (query.includes('algae') || query.includes('carbon') || query.includes('bioreactor') || query.includes('photo')) {
          replyText = "Our photo-bioreactor sleeve engineered at EcoSphere utilizes genetically optimized algae strands that maximize light absorption. We achieve up to 400x carbon sequestration rates compared to land forestry. The biomass produced is dried and processed for bio-fertilizers.";
        } else if (query.includes('funding') || query.includes('valuation') || query.includes('equity')) {
          replyText = "We are currently raising our $250k seed placement round on a $6.25M pre-money valuation. We've raised $125k so far, and the minimum entry is $500. This equity allocations provides direct dilution options on our Form C ledger.";
        } else {
          replyText = "Our bioreactor scale-up operations are entering field testing in urban carbon corridors. Happy to sync the performance documents or discuss our micro-algae growth curves!";
        }
      } else if (recipientId === 'db-cust-jenkins') {
        if (query.includes('legal') || query.includes('placement') || query.includes('law') || query.includes('audit')) {
          replyText = "Securities placements under exempt Reg CF/D must carefully navigate disclosure limits. We compile the SEC subscription agreements, verify accredited investor checks, and handle the formal ledger integration compliance scans.";
        } else if (query.includes('tax') || query.includes('1099') || query.includes('irs')) {
          replyText = "We automatically compile 1099-DIV schedules for active equity distribution rounds. The IRS compliance ledgers are audited directly within our Node Vetting suite to simplify tax sweep reporting.";
        } else {
          replyText = "I oversee the formal ecosystem compliance checks at Peer Bridge. All subscription documents and securities disclosures are locked in our high-density vault. Let me know if you need our briefing schedules.";
        }
      } else {
        replyText = `Thank you for the message. I would be happy to discuss our credentials, active placements, or collaborate on deal-flow pipelines inside the Peer Bridge network!`;
      }

      const currentThreadUpdated = chatThreads[recipientId] || nextThread;
      const nextThreadWithReply = [...currentThreadUpdated, { sender: 'them', text: replyText }];
      const nextThreadsWithReply = { ...chatThreads, [recipientId]: nextThreadWithReply };
      
      setChatThreads(nextThreadsWithReply);
      if (typeof window !== 'undefined') {
        localStorage.setItem('pb_chats', JSON.stringify(nextThreadsWithReply));
      }

      setTimeout(() => {
        const container = document.getElementById('chat-bubbles-container');
        if (container) container.scrollTop = container.scrollHeight;
      }, 50);
    }, 1000);
  };

  const renderFloatingChatWidget = () => {
    const connectionMembers = state.directory.filter(member => 
      state.connections.includes(member.customer_id)
    );

    const filteredConnections = connectionMembers.filter(member => {
      if (!chatSearchQuery.trim()) return false;
      const fullName = `${member.first_name} ${member.last_name}`.toLowerCase();
      const headline = (member.professionalProfile?.headline || '').toLowerCase();
      const queryWords = chatSearchQuery.toLowerCase().split(/\s+/).filter(Boolean);
      return queryWords.every(word => fullName.includes(word) || headline.includes(word));
    });

    return (
      <div 
        className="floating-chat-responsive glass-panel" 
        style={{
          position: 'fixed',
          bottom: 0,
          right: '30px',
          width: '320px',
          height: chatExpanded ? '420px' : '44px',
          background: 'rgba(10, 10, 10, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderBottom: 'none',
          borderRadius: '12px 12px 0 0',
          boxShadow: '0 -10px 25px -5px rgba(0,0,0,0.5), 0 -5px 10px -5px rgba(0,0,0,0.4)',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          transition: 'height 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden'
        }}
      >
        <div 
          onClick={() => setChatExpanded(!chatExpanded)}
          style={{
            height: '44px',
            padding: '0 0.85rem',
            background: 'linear-gradient(90deg, #070a0e 0%, #171c26 100%)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
            userSelect: 'none',
            flexShrink: 0
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <span style={{ fontSize: '1rem' }}>💬</span>
            <strong style={{ fontSize: '0.78rem', color: '#ffffff' }}>
              {activeChatRecipient ? `Chat: ${activeChatRecipient.first_name}` : 'Peer Bridge DMs'}
            </strong>
            <span style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: '#10b981',
              boxShadow: '0 0 8px #10b981'
            }} />
          </div>
          <span style={{ color: '#8a8a8a', fontSize: '0.75rem', fontWeight: 'bold' }}>
            {chatExpanded ? '▼' : '▲'}
          </span>
        </div>

        {chatExpanded && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'rgba(0,0,0,0.2)' }}>
            {!activeChatRecipient ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '0.5rem', gap: '0.35rem' }}>
                <div style={{ padding: '0.25rem 0.25rem 0.5rem 0.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div style={{ fontSize: '0.64rem', color: '#8a8a8a', fontWeight: '800', textTransform: 'uppercase' }}>
                    Select Connection to Chat
                  </div>
                  <input
                    type="text"
                    placeholder="🔍 Search connection name..."
                    value={chatSearchQuery}
                    onChange={(e) => setChatSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '6px',
                      padding: '0.35rem 0.65rem',
                      color: '#ffffff',
                      fontSize: '0.75rem',
                      outline: 'none',
                      transition: 'border 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'rgba(0, 242, 254, 0.4)'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                  />
                </div>
                
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.25rem' }}>
                  {connectionMembers.length === 0 ? (
                    <div style={{ padding: '2rem 1rem', textShadow: 'none', textAlign: 'center', fontSize: '0.72rem', color: '#525252' }}>
                      No connections synced. Go to the Network Directory or Ecosystem Search to connect with nodes.
                    </div>
                  ) : !chatSearchQuery.trim() ? (
                    <div style={{ padding: '3rem 1rem', textShadow: 'none', textAlign: 'center', fontSize: '0.72rem', color: '#737373', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.25rem' }}>🔍</span>
                      <span>Type a connection's name to start a chat...</span>
                    </div>
                  ) : filteredConnections.length === 0 ? (
                    <div style={{ padding: '2rem 1rem', textShadow: 'none', textAlign: 'center', fontSize: '0.72rem', color: '#737373' }}>
                      No matching connections found.
                    </div>
                  ) : (
                    filteredConnections.map(member => {
                      const latestMsg = chatThreads[member.customer_id]?.slice(-1)[0];
                      return (
                        <div
                          key={member.customer_id}
                          onClick={() => {
                            setActiveChatRecipient(member);
                            setChatSearchQuery('');
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.65rem',
                            padding: '0.5rem',
                            borderRadius: '8px',
                            background: 'rgba(255,255,255,0.01)',
                            border: '1px solid rgba(255,255,255,0.03)',
                            cursor: 'pointer',
                            transition: 'background 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.01)'}
                        >
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', background: '#111', flexShrink: 0, position: 'relative' }}>
                            <img 
                              src={member.basicProfile?.profile_picture_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&q=80'} 
                              alt={member.first_name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <h4 style={{ fontSize: '0.76rem', color: '#ffffff', fontWeight: '800', margin: 0 }}>
                              {member.first_name} {member.last_name}
                            </h4>
                            <p style={{ fontSize: '0.64rem', color: '#8a8a8a', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                              {latestMsg ? latestMsg.text : member.professionalProfile?.headline || 'Peer Bridge Node'}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ) : (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.04)', padding: '0.35rem 0.5rem', flexShrink: 0 }}>
                  <button
                    onClick={() => setActiveChatRecipient(null)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#00f2fe',
                      fontSize: '0.68rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.2rem'
                    }}
                  >
                    ◀ Back to Chats
                  </button>
                </div>

                <div 
                  id="chat-bubbles-container"
                  style={{ flex: 1, overflowY: 'auto', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}
                >
                  {(chatThreads[activeChatRecipient.customer_id] || [
                    { sender: 'them', text: `Hi! I am ${activeChatRecipient.first_name}. Thanks for connecting! Let me know if you have questions regarding our work.` }
                  ]).map((msg, idx) => (
                    <div 
                      key={idx}
                      style={{
                        alignSelf: msg.sender === 'me' ? 'flex-end' : 'flex-start',
                        maxWidth: '80%',
                        background: msg.sender === 'me' ? '#00f2fe' : 'rgba(255,255,255,0.04)',
                        border: msg.sender === 'me' ? 'none' : '1px solid rgba(255,255,255,0.06)',
                        color: msg.sender === 'me' ? '#000000' : '#ffffff',
                        padding: '0.45rem 0.65rem',
                        borderRadius: msg.sender === 'me' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                        fontSize: '0.7rem',
                        lineHeight: '1.3'
                      }}
                    >
                      {msg.text}
                    </div>
                  ))}
                </div>

                <form 
                  onSubmit={handleSendMessage}
                  style={{ display: 'flex', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '0.5rem', gap: '0.4rem', background: 'rgba(10,10,10,0.8)', flexShrink: 0 }}
                >
                  <input
                    type="text"
                    placeholder="Type P2P message..."
                    value={chatInputText}
                    onChange={(e) => setChatInputText(e.target.value)}
                    style={{
                      flex: 1,
                      background: 'rgba(0,0,0,0.4)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '6px',
                      padding: '0.4rem 0.5rem',
                      color: '#ffffff',
                      fontSize: '0.72rem',
                      outline: 'none'
                    }}
                  />
                  <button
                    type="submit"
                    className="btn-primary"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.7rem', height: 'auto' }}
                  >
                    Send
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={styles.appContainer}>
      {/* Top Header (3-Column Layout) */}
      <header className="header-responsive" style={styles.header}>
        {/* Column 1: Logo & Adjacent Home Anchor */}
        <div style={styles.headerLeftGroup}>
          <div 
            style={{ ...styles.logoRow, cursor: 'pointer' }} 
            onClick={() => state.setActiveModule('portfolio')} 
            title="Return to Ecosystem Home"
          >
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h1 className="logo-text-responsive" style={styles.logoText}>PEER BRIDGE</h1>
              <span className="logo-slogan-responsive" style={styles.logoSlogan}>Fund Smarter, Build Together</span>
            </div>
          </div>

          {/* Quick Home Access adjacent to Logo */}
          <button 
            onClick={() => state.setActiveModule('portfolio')} 
            style={state.activeModule === 'portfolio' ? styles.homeBtnActive : styles.homeBtn}
            title="Go to Ecosystem Home Feed"
          >
            🏠 Home
          </button>

          {/* Sleek Global Search Bar next to Logo/Home */}
          <div className="search-bar-container-responsive" style={styles.searchBarContainer}>
            <span style={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Search people, offerings, advisors..."
              value={state.globalSearchQuery}
              onChange={(e) => {
                state.setGlobalSearchQuery(e.target.value);
                if (state.activeModule !== 'search') {
                  state.setActiveModule('search');
                }
              }}
              onFocus={() => {
                if (state.activeModule !== 'search') {
                  state.setActiveModule('search');
                }
              }}
              style={styles.searchInput}
            />
          </div>
        </div>

        {/* Column 2: Center Ecosystem Horizontal Navigation */}
        <nav className="header-nav-responsive" style={styles.headerNav}>
          <button
            onClick={() => state.setActiveModule('entrepreneur')}
            className="header-nav-btn-responsive"
            style={state.activeModule === 'entrepreneur' ? styles.headerNavBtnActive : styles.headerNavBtn}
          >
            <span>🚀</span>
            <span>Founder Hub</span>
            {state.activeModule === 'entrepreneur' && <div style={styles.activeIndicator} />}
          </button>

          <button
            onClick={() => state.setActiveModule('affiliate')}
            className="header-nav-btn-responsive"
            style={state.activeModule === 'affiliate' ? styles.headerNavBtnActive : styles.headerNavBtn}
          >
            <span>👥</span>
            <span>Advisory</span>
            {state.activeModule === 'affiliate' && <div style={styles.activeIndicator} />}
          </button>

          <button
            onClick={() => state.setActiveModule('banking')}
            className="header-nav-btn-responsive"
            style={state.activeModule === 'banking' ? styles.headerNavBtnActive : styles.headerNavBtn}
          >
            <span>🏛</span>
            <span>Wallet</span>
            {state.activeModule === 'banking' && <div style={styles.activeIndicator} />}
          </button>

          <button
            onClick={() => state.setActiveModule('documents')}
            className="header-nav-btn-responsive"
            style={state.activeModule === 'documents' ? styles.headerNavBtnActive : styles.headerNavBtn}
          >
            <span>🛡</span>
            <span>Vault</span>
            {state.activeModule === 'documents' && <div style={styles.activeIndicator} />}
          </button>

          <button
            onClick={() => state.setActiveModule('tax')}
            className="header-nav-btn-responsive"
            style={state.activeModule === 'tax' ? styles.headerNavBtnActive : styles.headerNavBtn}
          >
            <span>📄</span>
            <span>Taxes</span>
            {state.activeModule === 'tax' && <div style={styles.activeIndicator} />}
          </button>
        </nav>

        {/* Column 3: Header Controls (Right side) */}
        <div style={styles.headerRightActions}>
          {state.user.role === 'Sales Admin' && (
            <button 
              onClick={() => state.setActiveModule('admin')} 
              style={state.activeModule === 'admin' ? styles.adminBtnActive : styles.adminBtn}
              title="Sales Operations Admissions"
            >
              🔑 Admissions
            </button>
          )}

          <div style={{ position: 'relative', display: 'inline-block' }}>
            <button
              onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
              style={{
                background: showNotificationsDropdown ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
                color: '#ffffff',
                padding: '0.45rem 0.85rem',
                borderRadius: '6px',
                fontSize: '0.74rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'all 0.2s',
                height: '32px'
              }}
              title="Ecosystem Notifications center"
            >
              🔔
              {state.notifications.filter(n => !n.read_status).length > 0 && (
                <span style={{
                  background: '#f43f5e',
                  color: '#ffffff',
                  fontSize: '0.58rem',
                  fontWeight: '800',
                  borderRadius: '10px',
                  padding: '0.05rem 0.3rem',
                  marginLeft: '0.15rem'
                }}>
                  {state.notifications.filter(n => !n.read_status).length}
                </span>
              )}
            </button>
            {showNotificationsDropdown && (
              <div 
                className="glass-panel" 
                style={{
                  position: 'absolute',
                  top: '40px',
                  right: '0',
                  width: '320px',
                  maxHeight: '400px',
                  overflowY: 'auto',
                  background: 'rgba(10, 10, 10, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5), 0 10px 10px -5px rgba(0,0,0,0.4)',
                  padding: '0.75rem',
                  zIndex: 10000,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.76rem', fontWeight: '800', color: '#ffffff' }}>Ecosystem Alerts</span>
                  {state.notifications.length > 0 && (
                    <button
                      onClick={() => {
                        state.setNotifications([]);
                        if (typeof window !== 'undefined') {
                          localStorage.setItem('pb_notifications', JSON.stringify([]));
                        }
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#00f2fe',
                        fontSize: '0.66rem',
                        cursor: 'pointer',
                        fontWeight: '700'
                      }}
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {state.notifications.length === 0 ? (
                  <div style={{ padding: '2rem 1rem', textAlign: 'center', fontSize: '0.72rem', color: '#525252' }}>
                    No unread compliance or node alert logs in ledger.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {state.notifications.map((notif) => (
                      <div 
                        key={notif.notification_id} 
                        style={{
                          background: 'rgba(255,255,255,0.01)',
                          border: '1px solid rgba(255,255,255,0.03)',
                          borderRadius: '8px',
                          padding: '0.5rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.2rem',
                          position: 'relative'
                        }}
                      >
                        <button
                          onClick={() => {
                            const updated = state.notifications.filter(n => n.notification_id !== notif.notification_id);
                            state.setNotifications(updated);
                            if (typeof window !== 'undefined') {
                              localStorage.setItem('pb_notifications', JSON.stringify(updated));
                            }
                          }}
                          style={{
                            position: 'absolute',
                            top: '0.35rem',
                            right: '0.35rem',
                            background: 'transparent',
                            border: 'none',
                            color: '#525252',
                            fontSize: '0.66rem',
                            cursor: 'pointer',
                            padding: '0 0.2rem'
                          }}
                        >
                          ✕
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span style={{
                            width: '5px',
                            height: '5px',
                            borderRadius: '50%',
                            background: notif.type === 'investment' ? '#10b981' : notif.type === 'system' ? '#00f2fe' : '#8f00ff'
                          }} />
                          <span style={{ fontSize: '0.58rem', fontWeight: '800', textTransform: 'uppercase', color: '#8a8a8a' }}>
                            {notif.type}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.7rem', color: '#ffffff', margin: 0, paddingRight: '1rem', lineHeight: '1.3' }}>
                          {notif.message}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <button 
            onClick={() => state.setActiveModule('support')} 
            style={state.activeModule === 'support' ? styles.supportBtnActive : styles.supportBtn}
            title="Support Help Desk"
          >
            💬 Support
          </button>

          <button onClick={state.logout} className="btn-secondary" style={styles.logoutBtn}>
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Framework Layout */}
      <div className="main-layout-responsive" style={styles.mainLayout}>
        {/* Left Sidebar Menu (Sleek Modular Cards like LinkedIn) */}
        <aside className="left-sidebar-responsive" style={styles.sidebar}>
          
          {/* Card 1: User Profile Card */}
          <div className="glass-panel" style={{ 
            borderRadius: '12px', 
            overflow: 'hidden', 
            background: 'rgba(255, 255, 255, 0.02)', 
            border: '1px solid rgba(255, 255, 255, 0.05)',
            position: 'relative'
          }}>
            {/* Header Banner */}
            <div style={{ 
              height: '55px', 
              background: 'linear-gradient(135deg, #07090e 0%, #00f2fe 50%, #8f00ff 100%)', 
              opacity: 0.8,
              position: 'relative'
            }}>
              <div style={{ position: 'absolute', top: '10px', left: '10px', width: '6px', height: '6px', borderRadius: '50%', background: '#00f2fe', boxShadow: '0 0 8px #00f2fe' }}></div>
              <div style={{ position: 'absolute', top: '25px', right: '15px', width: '4px', height: '4px', borderRadius: '50%', background: '#8f00ff', boxShadow: '0 0 6px #8f00ff' }}></div>
            </div>

            {/* Floating Ring Avatar */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '-30px', position: 'relative', zIndex: 2 }}>
              <div onClick={() => state.setActiveModule('profile')} style={{ cursor: 'pointer', position: 'relative', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {renderSidebarProfileRing()}
              </div>
            </div>

            {/* Name, Headline, and Switcher */}
            <div style={{ padding: '1rem 0.85rem 0.85rem 0.85rem', textAlign: 'center' }}>
              <h3 
                onClick={() => state.setActiveModule('profile')}
                style={{ 
                  fontSize: '0.95rem', 
                  fontWeight: '850', 
                  color: '#ffffff', 
                  margin: 0, 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem'
                }}
              >
                {state.user.name}
                {state.user.isVerified && (
                  <span title="Verified SEC Placement Node" style={{ color: '#d4af37', fontSize: '0.8rem' }}>✓</span>
                )}
              </h3>
              
              <span style={{ 
                fontSize: '0.7rem', 
                color: 'rgba(255,255,255,0.4)', 
                display: 'block', 
                margin: '0.25rem 0 0.65rem 0',
                lineHeight: '1.25',
                minHeight: '2.5rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {state.professionalProfile?.headline || `${state.user.role} Node`}
              </span>

              {/* Active Role Selector (Perspective Switcher inside Card) */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.65rem' }}>
                <label style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.2rem' }}>
                  Perspective Node Selector
                </label>
                <select
                  value={state.user.role}
                  onChange={(e) => {
                    const selVal = e.target.value;
                    state.updateUserProfile({ role: selVal });
                    if (selVal === 'Investor') state.setActiveModule('portfolio');
                    else if (selVal === 'Entrepreneur') state.setActiveModule('entrepreneur');
                    else if (selVal === 'Affiliate') state.setActiveModule('affiliate');
                    else state.setActiveModule('portfolio');
                  }}
                  style={{
                    width: '100%',
                    padding: '0.35rem 0.45rem',
                    borderRadius: '6px',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#ffffff',
                    fontSize: '0.72rem',
                    fontWeight: '600',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="Investor">Accredited Investor Perspective</option>
                  <option value="Entrepreneur">Ecosystem Founder Perspective</option>
                  <option value="Affiliate">Vetted Advisor Perspective</option>
                  <option value="Sales Admin">Sales Operations (Admissions)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Card 2: Assets, Vetting & Connection Metrics Card (LinkedIn Style) */}
          <div className="glass-panel" style={{ 
            borderRadius: '12px', 
            overflow: 'hidden', 
            background: 'rgba(255, 255, 255, 0.02)', 
            border: '1px solid rgba(255, 255, 255, 0.05)',
            padding: '0.75rem 0.85rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.45rem'
          }}>
            {/* Wallet Assets */}
            <div 
              onClick={() => state.setActiveModule('banking')} 
              style={styles.sidebarRowItem}
              title="Click to view Wallet details"
            >
              <span style={styles.sidebarRowLabel}>Wallet Assets:</span>
              <strong style={{ fontSize: '0.78rem', color: '#00f2fe', fontWeight: '700' }}>
                ${state.walletBalance.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </strong>
            </div>

            {/* KYC Status */}
            <div 
              onClick={() => state.setActiveModule('documents')} 
              style={styles.sidebarRowItem}
              title="Click to view KYC documents"
            >
              <span style={styles.sidebarRowLabel}>KYC Status:</span>
              <strong style={{ 
                fontSize: '0.62rem', 
                fontWeight: '800',
                padding: '0.12rem 0.35rem',
                borderRadius: '4px',
                background: state.user.isVerified ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                color: state.user.isVerified ? '#10b981' : '#f43f5e',
                border: state.user.isVerified ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(244, 63, 94, 0.2)'
              }}>
                {state.user.isVerified ? 'Vetted' : 'Required'}
              </strong>
            </div>

            <div style={{ height: '1px', background: 'rgba(255,255,255,0.03)', margin: '0.2rem 0' }}></div>

            {/* Connections */}
            <div 
              onClick={() => {
                state.setActiveModule('profile');
                state.setProfileActiveSubTab('network-directory');
                state.setDirectoryRoleFilter('Connections');
                if (typeof window !== 'undefined') {
                  localStorage.setItem('pb_directory_filter', JSON.stringify('Connections'));
                }
              }} 
              style={styles.sidebarRowItem}
              title="Inspect network nodes in Directory"
            >
              <span style={styles.sidebarRowLabel}>Connections:</span>
              <strong style={{ fontSize: '0.78rem', color: '#00f2fe', fontWeight: '750' }}>
                {state.connections.length}
              </strong>
            </div>

            {/* Profile Viewers */}
            <div 
              onClick={() => setShowViewersModal(true)} 
              style={styles.sidebarRowItem}
              title="Check profile viewer logs"
            >
              <span style={styles.sidebarRowLabel}>Profile viewers:</span>
              <strong style={{ fontSize: '0.78rem', color: '#00f2fe', fontWeight: '750' }}>
                {state.profileViewers}
              </strong>
            </div>

            {/* Post Impressions */}
            <div 
              onClick={() => setShowImpressionsModal(true)} 
              style={styles.sidebarRowItem}
              title="Review placement impressions reach"
            >
              <span style={styles.sidebarRowLabel}>Post impressions:</span>
              <strong style={{ fontSize: '0.78rem', color: '#00f2fe', fontWeight: '750' }}>
                {state.postImpressions}
              </strong>
            </div>
          </div>

          {/* Card 3: Platform Resources Links (LinkedIn-Style) */}
          <div className="glass-panel" style={{ 
            borderRadius: '12px', 
            overflow: 'hidden', 
            background: 'rgba(255, 255, 255, 0.02)', 
            border: '1px solid rgba(255, 255, 255, 0.05)',
            padding: '0.65rem 0.85rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.45rem'
          }}>
            {/* Saved Items */}
            <div 
              onClick={() => state.setActiveModule('saved')} 
              style={styles.sidebarLinkItem}
              title="Open bookmarked deal-flow vault"
            >
              <span style={styles.sidebarLinkIcon}>🔖</span>
              <span style={styles.sidebarLinkLabel}>Saved items</span>
            </div>

            {/* Network Directory */}
            <div 
              onClick={() => {
                state.setActiveModule('profile');
                state.setProfileActiveSubTab('network-directory');
                state.setDirectoryRoleFilter('All');
                if (typeof window !== 'undefined') {
                  localStorage.setItem('pb_directory_filter', JSON.stringify('All'));
                }
              }} 
              style={styles.sidebarLinkItem}
              title="Browse and connect with ecosystem members"
            >
              <span style={styles.sidebarLinkIcon}>🌐</span>
              <span style={styles.sidebarLinkLabel}>Network Directory</span>
            </div>

            {/* Groups */}
            <div 
              onClick={() => alert("Simulating Vetted Crowdfunding Syndicate nodes. Full admissions group chat unlocks when SEC Reg D documents are completely approved.")} 
              style={styles.sidebarLinkItem}
              title="Deal-flow investment groups"
            >
              <span style={styles.sidebarLinkIcon}>👥</span>
              <span style={styles.sidebarLinkLabel}>Groups</span>
            </div>

            {/* Newsletters */}
            <div 
              onClick={() => alert("Subscribed! Weekly Reg CF limits, cap table ledgers, and venture placements newsletters will simulate directly in your email inbox.")} 
              style={styles.sidebarLinkItem}
              title="Placement weekly briefing newsletters"
            >
              <span style={styles.sidebarLinkIcon}>📰</span>
              <span style={styles.sidebarLinkLabel}>Newsletters</span>
            </div>

            {/* Events */}
            <div 
              onClick={() => state.setActiveModule('events')} 
              style={styles.sidebarLinkItem}
              title="Deal-flow briefings and briefings events schedule"
            >
              <span style={styles.sidebarLinkIcon}>📅</span>
              <span style={styles.sidebarLinkLabel}>Events</span>
            </div>
          </div>

          {/* Sleek Sidebar Footer (Reg D Compliance) */}
          <div style={styles.sidebarFooter}>
            <span>🛡 Reg D SEC Compliant Node</span>
            <span style={styles.nodeId}>PB-NODE-771822</span>
          </div>
        </aside>

        {/* Dynamic Center Work Area */}
        <main style={styles.workspace}>
          {renderActiveModule()}
        </main>

        {/* Right Sidebar (LinkedIn-Style Cockpit Panels) */}
        <aside className="right-sidebar-responsive" style={styles.rightSidebar}>
          {/* Panel 1: News Bulletin */}
          <div className="glass-panel animate-fade-in-up" style={styles.sidebarNewsCard}>
            <h3 style={styles.sidebarNewsTitle}>📰 Peer Bridge News</h3>
            <ul style={styles.newsList}>
              <li style={styles.newsItem}>
                <span style={styles.newsBullet}>•</span>
                <div style={styles.newsContent}>
                  <strong style={styles.newsHeading}>SEC Form C Adjustments</strong>
                  <span style={styles.newsText}>Exempt crowdfund limits set to expand to $5M annually.</span>
                </div>
              </li>
              <li style={styles.newsItem}>
                <span style={styles.newsBullet}>•</span>
                <div style={styles.newsContent}>
                  <strong style={styles.newsHeading}>Carbon Bio-Algae Boom</strong>
                  <span style={styles.newsText}>CleanTech placements surge +210% across alternative SPVs.</span>
                </div>
              </li>
              <li style={styles.newsItem}>
                <span style={styles.newsBullet}>•</span>
                <div style={styles.newsContent}>
                  <strong style={styles.newsHeading}>P2P Cap Table Auditing</strong>
                  <span style={styles.newsText}>Exempt ledger audit costs reduced 70% via smart automation.</span>
                </div>
              </li>
              <li style={styles.newsItem}>
                <span style={styles.newsBullet}>•</span>
                <div style={styles.newsContent}>
                  <strong style={styles.newsHeading}>IRS Reg D Tax Updates</strong>
                  <span style={styles.newsText}>Exempt dividend tax deferrals approved for primary syndicates.</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Panel 2: Interactive Ad Banner */}
          <div className="glass-panel animate-fade-in-up" style={styles.sidebarAdCard}>
            <div style={styles.adHeader}>
              <span style={styles.adLabel}>SPONSORED SPOTLIGHT</span>
              <span style={styles.adOptOut}>🎯</span>
            </div>
            <h4 style={styles.adTitle}>EcoSphere Technologies Series A</h4>
            <p style={styles.adText}>
              Pre-vetted closed-loop algae bioreactors targeting 400x carbon sequestration. SEC Form C compliant.
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
              <span style={styles.adMinEntry}>Min: $500</span>
              <button 
                onClick={() => {
                  state.setTargetCampaignId('camp-1');
                  state.setActiveModule('portfolio');
                }}
                className="btn-primary" 
                style={styles.adButton}
              >
                Review Allocation →
              </button>
            </div>
          </div>

          {/* Panel 3: Node Announcements */}
          <div className="glass-panel animate-fade-in-up" style={styles.sidebarAnnounceCard}>
            <h3 style={styles.sidebarAnnounceTitle}>📣 Node Announcements</h3>
            <div style={styles.announceList}>
              <div style={styles.announceItem}>
                <span style={styles.announceDot} />
                <div>
                  <strong style={styles.announceHeader}>Reg D Sync Node Completed</strong>
                  <span style={styles.announceText}>SEC Form D secure filings ledger nodes successfully propagated.</span>
                </div>
              </div>
              <div style={styles.announceItem}>
                <span style={styles.announceDot} />
                <div>
                  <strong style={styles.announceHeader}>Biometrics Vetting Sweep</strong>
                  <span style={styles.announceText}>Identity verification AML modules updated for international compliance.</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Render Modals on overlay */}
      {showViewersModal && renderViewersModal()}
      {showImpressionsModal && renderImpressionsModal()}
      {state.inspectedCustomer && renderInspectedCustomerModal()}

      {/* Render Floating Chat Widget */}
      {renderFloatingChatWidget()}
    </div>
  );
}

const styles = {
  appContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#000000',
    backgroundImage: 'radial-gradient(circle at 50% 50%, #0a0a0a 0%, #000000 100%)',
  },
  header: {
    height: '80px',
    background: 'rgba(13, 17, 27, 0.8)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 2rem',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  headerLeftGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  logoText: {
    fontSize: '1.4rem',
    fontWeight: '850',
    letterSpacing: '0.06em',
    color: '#ffffff',
    lineHeight: '1',
  },
  logoSlogan: {
    fontFamily: 'var(--font-script)',
    fontSize: '0.74rem',
    color: '#ffffff',
    lineHeight: '1',
    letterSpacing: '0.18em',
    marginTop: '0.25rem',
    opacity: 0.9,
  },
  homeBtn: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    color: '#a3a3a3',
    padding: '0.45rem 0.9rem',
    borderRadius: '8px',
    fontSize: '0.75rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
  },
  homeBtnActive: {
    background: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    color: '#ffffff',
    padding: '0.45rem 0.9rem',
    borderRadius: '8px',
    fontSize: '0.75rem',
    fontWeight: '750',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
    boxShadow: '0 0 12px rgba(255,255,255,0.05)',
  },
  headerNav: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    height: '100%',
  },
  headerNavBtn: {
    background: 'transparent',
    border: 'none',
    color: '#94a3b8',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.4rem 0.85rem',
    cursor: 'pointer',
    fontSize: '0.72rem',
    fontWeight: '600',
    gap: '0.25rem',
    height: '100%',
    position: 'relative',
    transition: 'all 0.2s ease',
  },
  headerNavBtnActive: {
    background: 'transparent',
    border: 'none',
    color: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.4rem 0.85rem',
    cursor: 'pointer',
    fontSize: '0.72rem',
    fontWeight: '750',
    gap: '0.25rem',
    height: '100%',
    position: 'relative',
    transition: 'all 0.2s ease',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '12%',
    right: '12%',
    height: '3px',
    background: '#00f2fe',
    borderRadius: '2px 2px 0 0',
    boxShadow: '0 -2px 10px rgba(0, 242, 254, 0.4)',
  },
  headerRightActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.85rem',
  },
  adminBtn: {
    background: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    color: '#94a3b8',
    padding: '0.4rem 0.75rem',
    borderRadius: '6px',
    fontSize: '0.72rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  adminBtnActive: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    color: '#00f2fe',
    padding: '0.4rem 0.75rem',
    borderRadius: '6px',
    fontSize: '0.72rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  supportBtn: {
    background: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    color: '#94a3b8',
    padding: '0.4rem 0.75rem',
    borderRadius: '6px',
    fontSize: '0.72rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  supportBtnActive: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    color: '#ffffff',
    padding: '0.4rem 0.75rem',
    borderRadius: '6px',
    fontSize: '0.72rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  logoutBtn: {
    padding: '0.4rem 0.8rem',
    fontSize: '0.75rem',
    borderRadius: '6px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainLayout: {
    flex: 1,
    display: 'grid',
    gridTemplateColumns: '260px 1fr 300px',
    maxWidth: '1600px',
    width: '100%',
    margin: '0 auto',
    padding: '1.5rem 2rem',
    gap: '2rem',
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    position: 'sticky',
    top: '100px',
    alignSelf: 'start',
  },
  sidebarRowItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    padding: '0.35rem 0.2rem',
    transition: 'all 0.15s ease',
    borderRadius: '4px',
    ':hover': {
      background: 'rgba(255,255,255,0.02)'
    }
  },
  sidebarRowLabel: {
    fontSize: '0.72rem',
    color: 'rgba(255,255,255,0.45)',
    fontWeight: '600',
  },
  sidebarLinkItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.55rem',
    cursor: 'pointer',
    padding: '0.35rem 0.2rem',
    borderRadius: '4px',
    transition: 'all 0.15s ease',
    ':hover': {
      background: 'rgba(255,255,255,0.03)'
    }
  },
  sidebarLinkIcon: {
    fontSize: '0.9rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '16px',
  },
  sidebarLinkLabel: {
    fontSize: '0.74rem',
    color: '#ffffff',
    fontWeight: '700',
  },
  sidebarFooter: {
    fontSize: '0.65rem',
    color: '#525252',
    textAlign: 'center',
    borderTop: '1px solid rgba(255,255,255,0.03)',
    paddingTop: '0.75rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.15rem',
  },
  nodeId: {
    fontFamily: 'monospace',
    fontSize: '0.6rem',
    color: '#404040',
  },
  workspace: {
    flex: 1,
    overflow: 'hidden',
  },
  
  // Modals Custom Style System
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.75)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    width: '100%',
    maxWidth: '450px',
    padding: '1.25rem',
    background: 'rgba(10, 10, 10, 0.95)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    paddingBottom: '0.75rem',
    marginBottom: '0.75rem',
  },
  closeModalBtn: {
    background: 'transparent',
    border: 'none',
    color: '#a3a3a3',
    fontSize: '1rem',
    cursor: 'pointer',
    padding: '0.2rem',
    transition: 'color 0.2s',
    ':hover': {
      color: '#ffffff'
    }
  },
  viewerItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    background: 'rgba(255,255,255,0.01)',
    border: '1px solid rgba(255,255,255,0.03)',
    borderRadius: '8px',
    padding: '0.5rem',
    transition: 'all 0.2s',
  },
  viewerAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  viewerName: {
    fontSize: '0.78rem',
    fontWeight: '800',
    color: '#ffffff',
    margin: 0,
  },
  viewerTitle: {
    fontSize: '0.64rem',
    color: '#a3a3a3',
    margin: '0.05rem 0',
  },
  viewerTime: {
    fontSize: '0.58rem',
    color: '#525252',
    display: 'block',
  },
  viewerBtn: {
    fontSize: '0.65rem',
    padding: '0.25rem 0.55rem',
    borderRadius: '4px',
  },
  analyticCard: {
    background: 'rgba(0,0,0,0.4)',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: '8px',
    padding: '0.65rem',
    display: 'flex',
    flexDirection: 'column',
  },
  analyticLabel: {
    fontSize: '0.65rem',
    color: '#525252',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  analyticVal: {
    fontSize: '1.25rem',
    color: '#00f2fe',
    fontWeight: '800',
    margin: '0.15rem 0',
  },
  analyticSub: {
    fontSize: '0.58rem',
    color: '#10b981',
  },
  // New Layout & Search styles
  searchBarContainer: {
    display: 'flex',
    alignItems: 'center',
    background: 'rgba(0, 0, 0, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '100px',
    padding: '0.35rem 0.75rem',
    gap: '0.4rem',
    width: '280px',
    transition: 'all 0.2s ease',
  },
  searchIcon: {
    fontSize: '0.8rem',
    color: '#a3a3a3',
  },
  searchInput: {
    background: 'transparent',
    border: 'none',
    color: '#ffffff',
    fontSize: '0.74rem',
    outline: 'none',
    width: '100%',
  },
  rightSidebar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    position: 'sticky',
    top: '100px',
    alignSelf: 'start',
    width: '300px',
  },
  sidebarNewsCard: {
    padding: '1rem',
    borderRadius: '12px',
    background: 'rgba(10, 10, 10, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  sidebarNewsTitle: {
    fontSize: '0.82rem',
    fontWeight: '800',
    color: '#ffffff',
    margin: '0 0 0.75rem 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    paddingBottom: '0.4rem',
  },
  newsList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  newsItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.4rem',
  },
  newsBullet: {
    color: '#00f2fe',
    fontSize: '0.8rem',
    lineHeight: '1.2',
  },
  newsContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.1rem',
  },
  newsHeading: {
    fontSize: '0.74rem',
    fontWeight: '800',
    color: '#ffffff',
  },
  newsText: {
    fontSize: '0.64rem',
    color: '#8a8a8a',
    lineHeight: '1.3',
  },
  sidebarAdCard: {
    padding: '1rem',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.04) 0%, rgba(143, 0, 255, 0.04) 100%)',
    border: '1px solid rgba(0, 242, 254, 0.15)',
    position: 'relative',
    overflow: 'hidden',
  },
  adHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  adLabel: {
    fontSize: '0.58rem',
    fontWeight: '900',
    color: '#00f2fe',
    letterSpacing: '0.08em',
  },
  adOptOut: {
    fontSize: '0.65rem',
    color: 'rgba(255,255,255,0.2)',
  },
  adTitle: {
    fontSize: '0.84rem',
    fontWeight: '850',
    color: '#ffffff',
    margin: '0 0 0.25rem 0',
  },
  adText: {
    fontSize: '0.68rem',
    color: '#a3a3a3',
    lineHeight: '1.4',
    margin: 0,
  },
  adMinEntry: {
    fontSize: '0.62rem',
    color: '#525252',
    fontWeight: '700',
  },
  adButton: {
    padding: '0.35rem 0.75rem',
    fontSize: '0.68rem',
    borderRadius: '6px',
    cursor: 'pointer',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    color: '#ffffff',
  },
  sidebarAnnounceCard: {
    padding: '1rem',
    borderRadius: '12px',
    background: 'rgba(10, 10, 10, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  sidebarAnnounceTitle: {
    fontSize: '0.82rem',
    fontWeight: '800',
    color: '#ffffff',
    margin: '0 0 0.75rem 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    paddingBottom: '0.4rem',
  },
  announceList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  announceItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.5rem',
  },
  announceDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#10b981',
    marginTop: '0.3rem',
    flexShrink: 0,
  },
  announceHeader: {
    fontSize: '0.74rem',
    fontWeight: '800',
    color: '#ffffff',
    display: 'block',
  },
  announceText: {
    fontSize: '0.64rem',
    color: '#8a8a8a',
    lineHeight: '1.3',
    display: 'block',
    marginTop: '0.1rem',
  },
  // Modal layout styles
  modalCard: {
    width: '720px',
    maxWidth: '90%',
    maxHeight: '85vh',
    padding: '2.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    overflowY: 'auto',
    background: 'rgba(10, 10, 10, 0.95)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
    position: 'relative',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalMemberName: {
    fontSize: '1.4rem',
    fontWeight: '800',
    color: '#ffffff',
  },
  modalMemberHeadline: {
    fontSize: '0.85rem',
    color: '#a3a3a3',
    marginTop: '0.15rem',
  },
  closeModalBtn: {
    background: 'transparent',
    border: 'none',
    color: '#a3a3a3',
    fontSize: '1rem',
    cursor: 'pointer',
    padding: '0.2rem',
    transition: 'color 0.2s',
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
    fontSize: '0.82rem',
    color: '#a3a3a3',
    lineHeight: '1.4',
  },
  demographicsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.75rem',
    fontSize: '0.8rem',
    color: '#a3a3a3',
  },
  modalJobList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  modalJobItem: {
    background: 'rgba(255,255,255,0.01)',
    border: '1px solid rgba(255,255,255,0.03)',
    borderRadius: '8px',
    padding: '0.75rem',
  },
  modalJobHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.8rem',
    color: '#ffffff',
  },
  modalJobCompany: {
    fontSize: '0.72rem',
    color: '#00f2fe',
    display: 'block',
    marginTop: '0.15rem',
  },
  modalJobDesc: {
    fontSize: '0.74rem',
    color: '#a3a3a3',
    lineHeight: '1.35',
    marginTop: '0.4rem',
  },
  modalEduItem: {
    fontSize: '0.8rem',
    color: '#a3a3a3',
  },
  modalEmptyText: {
    fontSize: '0.78rem',
    color: '#737373',
    fontStyle: 'italic',
  },
  skillsTagRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.4rem',
    marginTop: '0.2rem',
  },
  skillTag: {
    fontSize: '0.68rem',
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    color: '#a3a3a3',
  }
};
