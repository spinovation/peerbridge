'use client';

import { useState } from 'react';
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

      default:
        return <InvestorModule state={state} />;
    }
  };

  return (
    <div style={styles.appContainer}>
      {/* Top Header (3-Column Layout) */}
      <header style={styles.header}>
        {/* Column 1: Logo & Adjacent Home Anchor */}
        <div style={styles.headerLeftGroup}>
          <div 
            style={{ ...styles.logoRow, cursor: 'pointer' }} 
            onClick={() => state.setActiveModule('portfolio')} 
            title="Return to Ecosystem Home"
          >
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h1 style={styles.logoText}>PEER BRIDGE</h1>
              <span style={styles.logoSlogan}>Fund Smarter, Build Together</span>
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
        </div>

        {/* Column 2: Center Ecosystem Horizontal Navigation */}
        <nav style={styles.headerNav}>
          <button
            onClick={() => state.setActiveModule('entrepreneur')}
            style={state.activeModule === 'entrepreneur' ? styles.headerNavBtnActive : styles.headerNavBtn}
          >
            <span>🚀</span>
            <span>Founder Hub</span>
            {state.activeModule === 'entrepreneur' && <div style={styles.activeIndicator} />}
          </button>

          <button
            onClick={() => state.setActiveModule('affiliate')}
            style={state.activeModule === 'affiliate' ? styles.headerNavBtnActive : styles.headerNavBtn}
          >
            <span>👥</span>
            <span>Advisory</span>
            {state.activeModule === 'affiliate' && <div style={styles.activeIndicator} />}
          </button>

          <button
            onClick={() => state.setActiveModule('banking')}
            style={state.activeModule === 'banking' ? styles.headerNavBtnActive : styles.headerNavBtn}
          >
            <span>🏛</span>
            <span>Wallet</span>
            {state.activeModule === 'banking' && <div style={styles.activeIndicator} />}
          </button>

          <button
            onClick={() => state.setActiveModule('documents')}
            style={state.activeModule === 'documents' ? styles.headerNavBtnActive : styles.headerNavBtn}
          >
            <span>🛡</span>
            <span>Vault</span>
            {state.activeModule === 'documents' && <div style={styles.activeIndicator} />}
          </button>

          <button
            onClick={() => state.setActiveModule('tax')}
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
      <div style={styles.mainLayout}>
        {/* Left Sidebar Menu (Sleek Modular Cards like LinkedIn) */}
        <aside style={styles.sidebar}>
          
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
      </div>

      {/* Render Modals on overlay */}
      {showViewersModal && renderViewersModal()}
      {showImpressionsModal && renderImpressionsModal()}
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
    gridTemplateColumns: '260px 1fr',
    maxWidth: '1500px',
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
  }
};
