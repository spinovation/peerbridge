'use client';

import { useState, useEffect } from 'react';

// Database of startups and borrowers for the AI Broker agents to evaluate
const candidateDatabase = {
  kristi: {
    name: 'Kristi Tonin (Tonin Logistics)',
    grade: 'P3 Near-Prime • BRS: 86/100',
    industry: 'Logistics',
    principal: 5000,
    rate: 13.5,
    tenor: 12,
    netYield: 12.0,
    spread: 1.5,
    hash: '0x8dfa9e2239f110c9b0e77d2427a123f8b89e83120194bc028a3f81e8c9d09c2a',
    steps: [
      {
        sender: 'FounderAgent (Entrepreneur Agent)',
        message: 'Initial request: Sourcing $5,000 principal debt note for cold-storage shipping fleet expansion. Proposed terms: 10.0% APR gross borrowing rate, 12 months tenor.',
        color: '#a78bfa'
      },
      {
        sender: 'CapitalAgent (Investor Agent)',
        message: 'Analyzing candidate credit profile... Borrower customer ID dir-cust-kristi mapped. PRI Score: 742 (Grade P3 Near-Prime, PD 12m: 3.2%). Revolving utilization at 68%. Counter offer: 16.0% APR gross to price risk appropriately.',
        color: '#00f2fe'
      },
      {
        sender: 'FounderAgent (Entrepreneur Agent)',
        message: 'Reviewing counter... Cash runway forecast maps 12 months with active burn rate of -$12,000/mo. Layer 2 Behavioral BRS is strong (86/100, zero overdraft events). Proposing split compromise rate: 13.5% APR gross borrower rate.',
        color: '#a78bfa'
      },
      {
        sender: 'CapitalAgent (Investor Agent)',
        message: 'Audit approved. BRS cash regularity at 96% and on-time payback ratio at 99% offsets thin bureau files. Proposal accepted: $5,000 principal at 13.5% gross borrower rate (12.0% net investor yield, 1.5% platform servicing spread) for 12 months. Compiling SEC Reg D contract promissory note...',
        color: '#00f2fe'
      },
      {
        sender: 'RiskOps Ledger Vetting',
        message: 'SEC Promissory Note successfully compiled. Signed Electronically by autonomous broker agents. SHA-256 Hash committed: 0x8dfa9e2239f110c9b0e77d2427a123f8b89e83120194bc028a3f81e8c9d09c2a. Symmetrical copies deployed to Lender and Borrower vaults.',
        color: '#10b981'
      }
    ]
  },
  elena: {
    name: 'Elena Rostova (NeuroWeb AI)',
    grade: 'P1 Super-Prime • BRS: 94/100',
    industry: 'Generative AI',
    principal: 20000,
    rate: 7.8,
    tenor: 12,
    netYield: 6.5,
    spread: 1.3,
    hash: '0x7ae12b553e1a0b3f8e75c8d2a1b9bc917d23a410b953ea28bf030a218fcf58aa',
    steps: [
      {
        sender: 'FounderAgent (Entrepreneur Agent)',
        message: 'Initial request: Sourcing $20,000 principal debt note for GPU cloud compute scaling. Proposed terms: 6.0% APR gross borrowing rate, 12 months tenor.',
        color: '#a78bfa'
      },
      {
        sender: 'CapitalAgent (Investor Agent)',
        message: 'Analyzing candidate profile... Borrower customer ID dir-cust-elena mapped. PRI Score: 820 (Grade P1 Super-Prime, PD 12m: 0.4%). Thin credit file but extremely high gross cash surplus. Counter offer: 9.0% APR gross to match balanced portfolio targets.',
        color: '#00f2fe'
      },
      {
        sender: 'FounderAgent (Entrepreneur Agent)',
        message: 'Reviewing counter... BRS score is 94/100. Net take-home cash flow of $6,300/mo and zero credit card utilization. Proposing a prime rate: 7.8% APR gross borrower rate.',
        color: '#a78bfa'
      },
      {
        sender: 'CapitalAgent (Investor Agent)',
        message: 'Audit approved. Exceptional 68% true net savings rate overrides thin FICO. Proposal accepted: $20,000 principal at 7.8% gross borrower rate (6.5% net investor yield, 1.3% servicing spread) for 12 months. Compiling SEC Reg D contract promissory note...',
        color: '#00f2fe'
      },
      {
        sender: 'RiskOps Ledger Vetting',
        message: 'SEC Promissory Note successfully compiled. Signed Electronically by autonomous broker agents. SHA-256 Hash committed: 0x7ae12b553e1a0b3f8e75c8d2a1b9bc917d23a410b953ea28bf030a218fcf58aa. Symmetrical copies deployed to Lender and Borrower vaults.',
        color: '#10b981'
      }
    ]
  },
  kofi: {
    name: 'Kofi Anan (Helium Energy)',
    grade: 'P4 Near-Subprime • BRS: 68/100',
    industry: 'CleanTech (Idea)',
    principal: 8000,
    rate: 16.5,
    tenor: 12,
    netYield: 14.5,
    spread: 2.0,
    hash: '0x3bf92c448de02188fa9e5b8d9c223a410a8b943d2c88f01b97de2c016e789fcc',
    steps: [
      {
        sender: 'FounderAgent (Entrepreneur Agent)',
        message: 'Initial request: Sourcing $8,000 principal debt note for hydrogen storage container prototype. Proposed terms: 11.0% APR gross borrowing rate, 12 months tenor.',
        color: '#a78bfa'
      },
      {
        sender: 'CapitalAgent (Investor Agent)',
        message: 'Analyzing candidate profile... Borrower customer ID dir-cust-kofi mapped. PRI Score: 618 (Grade P4 Near-Subprime, PD 12m: 8.5%). Idea stage venture with thin files. Counter offer: 19.5% APR gross to price early-stage venture default risk.',
        color: '#00f2fe'
      },
      {
        sender: 'FounderAgent (Entrepreneur Agent)',
        message: 'Reviewing counter... Fresh graduate with low income but zero active debt obligations. Proposing a middle rate: 16.5% APR gross borrower rate.',
        color: '#a78bfa'
      },
      {
        sender: 'CapitalAgent (Investor Agent)',
        message: 'Audit check. Low debt load offsets thin operating history. Proposal accepted: $8,000 principal at 16.5% gross borrower rate (14.5% net investor yield, 2.0% platform servicing spread) for 12 months. Compiling SEC Reg D contract promissory note...',
        color: '#00f2fe'
      },
      {
        sender: 'RiskOps Ledger Vetting',
        message: 'SEC Promissory Note successfully compiled. Signed Electronically by autonomous broker agents. SHA-256 Hash committed: 0x3bf92c448de02188fa9e5b8d9c223a410a8b943d2c88f01b97de2c016e789fcc. Symmetrical copies deployed to Lender and Borrower vaults.',
        color: '#10b981'
      }
    ]
  },
  devon: {
    name: 'Devon Lane (Aurora Energy Systems)',
    grade: 'P5 Deep Subprime • BRS: 52/100',
    industry: 'CleanTech Hardware',
    principal: 15000,
    rate: 0,
    tenor: 12,
    netYield: 0,
    spread: 0,
    hash: 'DECLINED',
    steps: [
      {
        sender: 'FounderAgent (Entrepreneur Agent)',
        message: 'Initial request: Sourcing $15,000 principal debt note for residential battery components. Proposed terms: 12.0% APR gross borrowing rate, 12 months tenor.',
        color: '#a78bfa'
      },
      {
        sender: 'CapitalAgent (Investor Agent)',
        message: 'Analyzing candidate profile... Borrower customer ID dir-cust-devon mapped. PRI Score: 520 (Grade P5 Deep Subprime, PD 12m: 14.8%). High FICO debt history coupled with severe lifestyle spend burn. Checking discretionary transaction velocity...',
        color: '#00f2fe'
      },
      {
        sender: 'FounderAgent (Entrepreneur Agent)',
        message: 'Reviewing metrics... Earning $500,000 gross. However, discretionary luxury card velocity is $11,500/mo. Savings rate is only 6.9%. Requesting rate compromise: 18.0% APR gross borrower rate to offset default risks.',
        color: '#a78bfa'
      },
      {
        sender: 'CapitalAgent (Investor Agent)',
        message: 'Audit check: True net savings rate is too low ($1,500/mo surplus on $500k income) and credit cards are maxed out. Underwriting threshold not met. Proposal DECLINED: High risk of payment default. Session closed.',
        color: '#ef4444'
      },
      {
        sender: 'RiskOps Ledger Vetting',
        message: 'Negotiation Session Terminated. Status: Declined due to excessive discretionary cash burn (DDI 93%). No Promissory Note generated.',
        color: '#ef4444'
      }
    ]
  }
};

export default function AIAgentHub({ state }) {
  const { user } = state;
  const [activeTab, setActiveTab] = useState('agents_console'); // agents_console, simulator

  // Selected startup candidate in simulator
  const [selectedCandidate, setSelectedCandidate] = useState('kristi');
  
  // Search filter query state for simulator options
  const [searchTerm, setSearchTerm] = useState('');

  // Dynamic filter lookup keys mapping candidate properties
  const filteredKeys = Object.keys(candidateDatabase).filter((key) => {
    const cand = candidateDatabase[key];
    return cand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           cand.grade.toLowerCase().includes(searchTerm.toLowerCase()) ||
           cand.industry.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Adjust selected candidate index automatically if filter deletes it from scope
  useEffect(() => {
    if (filteredKeys.length > 0 && !filteredKeys.includes(selectedCandidate)) {
      setSelectedCandidate(filteredKeys[0]);
    }
  }, [searchTerm]);

  // Agent activation states
  const [agents, setAgents] = useState({
    capitalAgent: { name: 'CapitalAgent (Investor)', status: 'idle', active: true, preference: 'Balanced Yield' },
    founderAgent: { name: 'FounderAgent (Entrepreneur)', status: 'idle', active: true, preference: 'Auto Bill Pay' },
    auditAgent: { name: 'AuditAgent (Affiliate)', status: 'idle', active: false, preference: 'SEC Form C Audits' }
  });

  // Simulator states
  const [simActive, setSimActive] = useState(false);
  const [simStep, setSimStep] = useState(0);
  const [simLogs, setSimLogs] = useState([]);
  const [agreedTerms, setAgreedTerms] = useState(null);

  const toggleAgent = (key) => {
    setAgents({
      ...agents,
      [key]: { ...agents[key], active: !agents[key].active }
    });
  };

  const updatePreference = (key, val) => {
    setAgents({
      ...agents,
      [key]: { ...agents[key], preference: val }
    });
  };

  // Negotiation Simulator Steps mapped dynamically based on selected candidate
  const simulationSteps = candidateDatabase[selectedCandidate].steps;

  // Simulates step-by-step negotiation
  useEffect(() => {
    let timer;
    if (simActive && simStep < simulationSteps.length) {
      timer = setTimeout(() => {
        setSimLogs(prev => [...prev, simulationSteps[simStep]]);
        setSimStep(prev => prev + 1);
      }, 2500); // Conversational timing delay
    } else if (simStep === simulationSteps.length) {
      setSimActive(false);
      const cand = candidateDatabase[selectedCandidate];
      if (cand.hash !== 'DECLINED') {
        setAgreedTerms({
          principal: cand.principal,
          rate: cand.rate,
          tenor: cand.tenor,
          netYield: cand.netYield,
          spread: cand.spread,
          hash: cand.hash
        });
        state.addNotification('Lending', `Autonomous AI Negotiation complete: $${cand.principal.toLocaleString()} note signed at ${cand.rate}% APR.`);
      } else {
        setAgreedTerms({
          principal: cand.principal,
          rate: 'DECLINED',
          tenor: 12,
          netYield: 0,
          spread: 0,
          hash: 'DECLINED - Underwriting criteria not met'
        });
        state.addNotification('Lending', `Autonomous AI Negotiation complete: Application for ${cand.name} was DECLINED.`);
      }
    }
    return () => clearTimeout(timer);
  }, [simActive, simStep]);

  const handleStartSimulation = () => {
    setSimLogs([]);
    setSimStep(0);
    setAgreedTerms(null);
    setSimActive(true);
  };

  return (
    <div style={styles.container} className="animate-fade-in-up">
      {/* Header Row */}
      <div style={styles.headerTitleRow}>
        <div>
          <h2 style={styles.mainTitle}>🤖 Phase 3: Autonomous AI Agent Brokerage Hub</h2>
          <p style={styles.subTitle}>
            Boot and supervise autonomous agents acting on behalf of lenders, entrepreneurs, and compliance affiliates. Run negotiations using credit telemetry.
          </p>
        </div>
      </div>

      {/* Tab selectors */}
      <div style={styles.segmentedTabWrapper}>
        <div style={styles.tabContainer}>
          <button 
            onClick={() => setActiveTab('agents_console')}
            style={{ 
              ...styles.tabBtn, 
              color: activeTab === 'agents_console' ? '#ffffff' : '#737373',
              background: activeTab === 'agents_console' ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
              borderBottom: activeTab === 'agents_console' ? '2px solid #00f2fe' : 'none'
            }}
          >
            ⚙️ AI Agents Control Deck
          </button>
          <button 
            onClick={() => setActiveTab('simulator')}
            style={{ 
              ...styles.tabBtn, 
              color: activeTab === 'simulator' ? '#ffffff' : '#737373',
              background: activeTab === 'simulator' ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
              borderBottom: activeTab === 'simulator' ? '2px solid #a78bfa' : 'none'
            }}
          >
            📊 Conversational Negotiation Simulator
          </button>
        </div>
      </div>

      {/* Tab 1: AI Agent Operations Control Deck */}
      {activeTab === 'agents_console' && (
        <div style={styles.agentsGrid}>
          {/* 1. CapitalAgent */}
          <div className="glass-panel" style={{ ...styles.agentCard, borderLeft: '4px solid #00f2fe' }}>
            <div style={styles.agentCardHeader}>
              <div>
                <h3 style={styles.agentTitle}>{agents.capitalAgent.name}</h3>
                <span style={styles.agentSub}>Lender & Investor Broker</span>
              </div>
              <button 
                onClick={() => toggleAgent('capitalAgent')}
                style={{
                  ...styles.statusBtn,
                  background: agents.capitalAgent.active ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  color: agents.capitalAgent.active ? '#10b981' : '#ef4444',
                  borderColor: agents.capitalAgent.active ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'
                }}
              >
                {agents.capitalAgent.active ? '● Active' : '○ Standby'}
              </button>
            </div>
            
            <p style={styles.agentDesc}>
              Scrutinizes start-up campaigns prospectuses, reviews financial EBITDA models, audits candidate BRS credit scores, and places automated syndicate allocations.
            </p>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Target Yield Strategy</label>
              <select 
                value={agents.capitalAgent.preference} 
                onChange={(e) => updatePreference('capitalAgent', e.target.value)}
                style={styles.select}
                disabled={!agents.capitalAgent.active}
              >
                <option value="Conservative">Conservative Yield (Grade P1-P2)</option>
                <option value="Balanced Yield">Balanced Strategy (Grade P2-P3)</option>
                <option value="Yield Max">Yield Max Strategy (Grade P4-P5)</option>
              </select>
            </div>
          </div>

          {/* 2. FounderAgent */}
          <div className="glass-panel" style={{ ...styles.agentCard, borderLeft: '4px solid #a78bfa' }}>
            <div style={styles.agentCardHeader}>
              <div>
                <h3 style={styles.agentTitle}>{agents.founderAgent.name}</h3>
                <span style={styles.agentSub}>Entrepreneur & Corporate Broker</span>
              </div>
              <button 
                onClick={() => toggleAgent('founderAgent')}
                style={{
                  ...styles.statusBtn,
                  background: agents.founderAgent.active ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  color: agents.founderAgent.active ? '#10b981' : '#ef4444',
                  borderColor: agents.founderAgent.active ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'
                }}
              >
                {agents.founderAgent.active ? '● Active' : '○ Standby'}
              </button>
            </div>
            
            <p style={styles.agentDesc}>
              Underwrites debt terms based on active BRS cash ratios, compiles Regulation CF Form C filing spreadsheets, and delegates bookkeeping tasks.
            </p>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Automated Operations Mode</label>
              <select 
                value={agents.founderAgent.preference} 
                onChange={(e) => updatePreference('founderAgent', e.target.value)}
                style={styles.select}
                disabled={!agents.founderAgent.active}
              >
                <option value="Auto Bill Pay">Auto Bill Pay & Cash Forecasts</option>
                <option value="Compliance Audit">SEC Form C Prep Sweeps</option>
                <option value="Auto Fundraising">Round Launch & Bid Swaps</option>
              </select>
            </div>
          </div>

          {/* 3. AuditAgent */}
          <div className="glass-panel" style={{ ...styles.agentCard, borderLeft: '4px solid #737373', opacity: agents.auditAgent.active ? 1 : 0.65 }}>
            <div style={styles.agentCardHeader}>
              <div>
                <h3 style={styles.agentTitle}>{agents.auditAgent.name}</h3>
                <span style={styles.agentSub}>Affiliate & Vetting Compliance Broker</span>
              </div>
              <button 
                onClick={() => toggleAgent('auditAgent')}
                style={{
                  ...styles.statusBtn,
                  background: agents.auditAgent.active ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  color: agents.auditAgent.active ? '#10b981' : '#ef4444',
                  borderColor: agents.auditAgent.active ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'
                }}
              >
                {agents.auditAgent.active ? '● Active' : '○ Standby'}
              </button>
            </div>
            
            <p style={styles.agentDesc}>
              Scrapes task boards for posted compliance chores, reviews biometrics waitlist credentials, and audits financial statements to claim escrow splits.
            </p>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Vetting Focus Scope</label>
              <select 
                value={agents.auditAgent.preference} 
                onChange={(e) => updatePreference('auditAgent', e.target.value)}
                style={styles.select}
                disabled={!agents.auditAgent.active}
              >
                <option value="SEC Form C Audits">SEC Form C Audits</option>
                <option value="KYC Watchlists">KYC Watchlists & PEP clearance</option>
                <option value="SAFE Agreements">SAFE / Note contract checks</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Autonomous Loan Negotiation Simulator */}
      {activeTab === 'simulator' && (
        <div style={styles.simulatorWrapper} className="animate-fade-in-up">
          <div style={styles.simulatorLeft}>
            <div className="glass-panel" style={styles.simulatorCard}>
              <h3 style={styles.cardTitle}>🏛️ Autonomous P2P Note Negotiation Console</h3>
              <p style={styles.cardDesc}>
                Trigger a mock negotiation loop where `FounderAgent` and `CapitalAgent` autonomously negotiate loan yields based on BRS credit indexing.
              </p>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Search & Select Startup Campaign</label>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="🔍 Filter startups (e.g. Elena, BRS: 94, Logistics...)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      flex: 1,
                      background: 'rgba(10, 10, 10, 0.95)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '8px',
                      padding: '0.65rem 0.85rem',
                      color: '#ffffff',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                    disabled={simActive}
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '8px',
                        color: '#a3a3a3',
                        padding: '0 0.85rem',
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                      }}
                      disabled={simActive}
                    >
                      Clear
                    </button>
                  )}
                </div>
                <select
                  value={selectedCandidate}
                  onChange={(e) => {
                    setSelectedCandidate(e.target.value);
                    setSimLogs([]);
                    setSimStep(0);
                    setAgreedTerms(null);
                    setSimActive(false);
                  }}
                  style={styles.select}
                  disabled={simActive}
                >
                  {filteredKeys.map(key => (
                    <option key={key} value={key}>
                      {candidateDatabase[key].name} ({candidateDatabase[key].industry}, BRS: {candidateDatabase[key].grade.split(' • ')[1]})
                    </option>
                  ))}
                  {filteredKeys.length === 0 && (
                    <option disabled>No campaigns match your search query</option>
                  )}
                </select>
              </div>

              <div style={styles.setupInfoBox}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <span style={styles.specLabel}>Selected Borrower Profile</span>
                  <strong style={{ color: '#ffffff', fontSize: '0.85rem' }}>{candidateDatabase[selectedCandidate].name}</strong>
                  <span style={{ color: selectedCandidate === 'devon' ? '#f43f5e' : '#d4af37', fontSize: '0.7rem', fontWeight: '700' }}>
                    Index Grade: {candidateDatabase[selectedCandidate].grade}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <span style={styles.specLabel}>Lender Underwriter Profile</span>
                  <strong style={{ color: '#ffffff', fontSize: '0.85rem' }}>Mohit Mehra (Mehra Ventures)</strong>
                  <span style={{ color: '#00f2fe', fontSize: '0.7rem', fontWeight: '700' }}>Index Strategy: Balanced Yield Matcher</span>
                </div>
              </div>

              <button 
                onClick={handleStartSimulation} 
                disabled={simActive}
                className="btn-primary" 
                style={{
                  ...styles.startBtn,
                  background: simActive ? '#525252' : '#8b5cf6',
                  color: '#ffffff',
                  fontWeight: '800',
                  alignSelf: 'flex-start',
                  marginTop: '0.5rem'
                }}
              >
                {simActive ? 'Negotiation in Progress...' : 'Initialize Autonomous Negotiation Session'}
              </button>
            </div>

            {/* Agreed Terms display once completed */}
            {agreedTerms && (
              <div className="glass-panel glow-accent-border animate-fade-in-up" style={styles.termsCard}>
                {agreedTerms.rate === 'DECLINED' ? (
                  <span style={{ fontSize: '0.68rem', fontWeight: '850', color: '#ef4444', textTransform: 'uppercase', background: 'rgba(239,68,68,0.08)', padding: '0.15rem 0.5rem', borderRadius: '4px', border: '1px solid rgba(239,68,68,0.25)' }}>
                    ✗ Underwriting Request Declined
                  </span>
                ) : (
                  <span style={{ fontSize: '0.68rem', fontWeight: '850', color: '#10b981', textTransform: 'uppercase', background: 'rgba(16,185,129,0.08)', padding: '0.15rem 0.5rem', borderRadius: '4px', border: '1px solid rgba(16,185,129,0.25)' }}>
                    ✓ SEC Reg D Note Executed Successfully
                  </span>
                )}
                
                <div style={styles.termsGrid}>
                  <div style={styles.termsBox}>
                    <span style={styles.specLabel}>Principal Note</span>
                    <strong style={{ fontSize: '1.1rem', color: '#ffffff' }}>${agreedTerms.principal.toLocaleString()}</strong>
                  </div>
                  <div style={styles.termsBox}>
                    <span style={styles.specLabel}>Gross Borrow Rate</span>
                    <strong style={{ fontSize: '1.1rem', color: agreedTerms.rate === 'DECLINED' ? '#ef4444' : '#a78bfa' }}>
                      {agreedTerms.rate === 'DECLINED' ? 'DECLINED' : `${agreedTerms.rate}% APR`}
                    </strong>
                  </div>
                  <div style={styles.termsBox}>
                    <span style={styles.specLabel}>Maturity Tenor</span>
                    <strong style={{ fontSize: '1.1rem', color: '#ffffff' }}>{agreedTerms.tenor} Months</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.03)' }}>
                  <span style={styles.specLabel}>Session Result Hash</span>
                  <code style={{ fontSize: '0.74rem', color: agreedTerms.rate === 'DECLINED' ? '#ef4444' : '#00f2fe', fontFamily: 'monospace', overflowX: 'auto', whiteSpace: 'nowrap' }}>
                    {agreedTerms.hash}
                  </code>
                </div>
              </div>
            )}
          </div>

          {/* Conversational logs display (Right side) */}
          <div className="glass-panel" style={styles.simulatorRight}>
            <h3 style={styles.cardTitle}>💬 Autonomous Conversational Audit Logs</h3>
            <p style={styles.cardDesc}>Step-by-step dialogue log of autonomous agent brokerage interactions.</p>

            <div style={styles.dialogLogsBox}>
              {simLogs.length === 0 ? (
                <div style={styles.emptyLogBox}>
                  <span>Click 'Initialize' to witness autonomous note negotiations in conversational sandbox logs.</span>
                </div>
              ) : (
                simLogs.map((log, index) => (
                  <div key={index} className="animate-fade-in-up" style={{
                    ...styles.logItem,
                    borderLeftColor: log.color,
                    background: `rgba(255,255,255,0.01)`
                  }}>
                    <span style={{
                      fontSize: '0.62rem',
                      fontWeight: '850',
                      textTransform: 'uppercase',
                      color: log.color,
                      display: 'block'
                    }}>
                      {log.sender}
                    </span>
                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.78rem', color: '#ffffff', lineHeight: '1.45' }}>
                      {log.message}
                    </p>
                  </div>
                ))
              )}
              {simActive && (
                <div style={styles.typingIndicator} className="animate-pulse">
                  <span>🤖 Agent computing next counter offer...</span>
                </div>
              )}
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
    gap: '1.75rem',
  },
  headerTitleRow: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    paddingBottom: '1rem',
  },
  mainTitle: {
    fontSize: '1.45rem',
    fontWeight: '850',
    color: '#ffffff',
    margin: 0,
  },
  subTitle: {
    fontSize: '0.8rem',
    color: '#a3a3a3',
    marginTop: '0.2rem',
  },
  segmentedTabWrapper: {
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    marginTop: '-0.5rem',
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
    outline: 'none',
  },

  // Agents control deck
  agentsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.5rem',
  },
  agentCard: {
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  agentCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    paddingBottom: '0.85rem',
  },
  agentTitle: {
    fontSize: '1.05rem',
    fontWeight: '800',
    color: '#ffffff',
    margin: 0,
  },
  agentSub: {
    fontSize: '0.7rem',
    color: '#737373',
  },
  statusBtn: {
    padding: '0.2rem 0.5rem',
    fontSize: '0.64rem',
    borderRadius: '4px',
    border: '1px solid',
    fontWeight: '800',
    cursor: 'pointer',
  },
  agentDesc: {
    fontSize: '0.82rem',
    color: '#a3a3a3',
    lineHeight: '1.45',
    margin: 0,
    minHeight: '80px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
  },
  label: {
    fontSize: '0.68rem',
    fontWeight: '700',
    color: '#737373',
    textTransform: 'uppercase',
  },
  select: {
    width: '100%',
    background: 'rgba(10, 10, 10, 0.95)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '8px',
    padding: '0.65rem 0.85rem',
    color: '#ffffff',
    fontSize: '0.85rem',
    outline: 'none',
    cursor: 'pointer',
  },

  // Simulator tab
  simulatorWrapper: {
    display: 'grid',
    gridTemplateColumns: '1.1fr 1fr',
    gap: '1.5rem',
  },
  simulatorLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  simulatorCard: {
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  cardTitle: {
    fontSize: '1.05rem',
    fontWeight: '800',
    color: '#ffffff',
    margin: 0,
  },
  cardDesc: {
    fontSize: '0.76rem',
    color: '#a3a3a3',
    lineHeight: '1.35',
  },
  setupInfoBox: {
    background: 'rgba(0,0,0,0.2)',
    border: '1px solid rgba(255,255,255,0.03)',
    borderRadius: '6px',
    padding: '1.25rem',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  specLabel: {
    fontSize: '0.62rem',
    color: '#737373',
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  startBtn: {
    padding: '0.65rem 1.25rem',
    fontSize: '0.82rem',
  },
  termsCard: {
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  termsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '0.5rem',
  },
  termsBox: {
    background: 'rgba(255,255,255,0.01)',
    border: '1px solid rgba(255,255,255,0.04)',
    borderRadius: '4px',
    padding: '0.65rem',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem',
  },

  // Simulator Right (logs)
  simulatorRight: {
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  dialogLogsBox: {
    flex: 1,
    minHeight: '340px',
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.04)',
    borderRadius: '8px',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.85rem',
    maxHeight: '460px',
    overflowY: 'auto',
  },
  emptyLogBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#525252',
    fontStyle: 'italic',
    fontSize: '0.8rem',
    textAlign: 'center',
    padding: '2rem',
  },
  logItem: {
    padding: '0.75rem',
    borderLeftWidth: '3px',
    borderLeftStyle: 'solid',
    borderRadius: '0 6px 6px 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.15rem',
  },
  typingIndicator: {
    fontSize: '0.74rem',
    color: '#a78bfa',
    fontStyle: 'italic',
    paddingLeft: '0.5rem',
  }
};
