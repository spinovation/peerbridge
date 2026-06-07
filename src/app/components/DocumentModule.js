'use client';

import { useState } from 'react';

export default function DocumentModule({ state }) {
  const { user, documentation, submitKycDocuments, completeKycNodeVetting } = state;
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState('');
  const [docTypeToVerify, setDocTypeToVerify] = useState('kyc');
  
  // KYC steps simulation
  const [kycProgress, setKycProgress] = useState(0); // 0: Idle, 1: Step1, 2: Step2, 3: Step3, 4: Done
  const [step1Status, setStep1Status] = useState('Pending');
  const [step2Status, setStep2Status] = useState('Pending');
  const [step3Status, setStep3Status] = useState('Pending');
  const [simSuccess, setSimSuccess] = useState('');
  const [activeKycDocId, setActiveKycDocId] = useState(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFileName(e.dataTransfer.files[0].name);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  const startKycVerification = () => {
    if (!fileName) return;

    // Create a pending KYC row in the documentation table (Table #7)
    const newKycDoc = submitKycDocuments(fileName, docTypeToVerify);
    setActiveKycDocId(newKycDoc.doc_id);

    setKycProgress(1);
    
    if (docTypeToVerify === 'kyc') {
      setStep1Status('Scanning ID Document...');
    } else if (docTypeToVerify === 'safe_agreement') {
      setStep1Status('Auditing SAFE Legal Covenants...');
    } else if (docTypeToVerify === 'promissory_note') {
      setStep1Status('Auditing Promissory Note Terms...');
    } else {
      setStep1Status('Auditing Bank Cash Balances...');
    }

    // Step 1 Finish
    setTimeout(() => {
      setStep1Status('Complete ✓');
      setKycProgress(2);
      
      if (docTypeToVerify === 'kyc') {
        setStep2Status('Evaluating Facial Biometrics...');
      } else if (docTypeToVerify === 'safe_agreement') {
        setStep2Status('Checking e-Signature & SHA-256 Keys...');
      } else if (docTypeToVerify === 'promissory_note') {
        setStep2Status('Checking Symmetrical Signatures...');
      } else {
        setStep2Status('Matching Plaid API Balance Feed...');
      }

      // Step 2 Finish
      setTimeout(() => {
        setStep2Status('Complete ✓');
        setKycProgress(3);
        
        if (docTypeToVerify === 'kyc') {
          setStep3Status('Checking Global AML Watchlists...');
        } else if (docTypeToVerify === 'safe_agreement') {
          setStep3Status('Running Cap Table Equity Registry Sync...');
        } else if (docTypeToVerify === 'promissory_note') {
          setStep3Status('Checking Escrow Wallet Settlements...');
        } else {
          setStep3Status('Sweeping Cash Clearing Covenants...');
        }

        // Step 3 Finish (AML/Integrity check)
        setTimeout(() => {
          setStep3Status('Complete ✓');
          setKycProgress(4);
          
          // Complete vetting in DB
          completeKycNodeVetting(newKycDoc.doc_id);
          
          if (docTypeToVerify === 'kyc') {
            setSimSuccess('Congratulations! Your passport scan and facial sweep passed all biometric screening. Accredited Node Status unlocked!');
          } else if (docTypeToVerify === 'safe_agreement') {
            setSimSuccess('Equity placement verified! Tamper-proof Y-Combinator SAFE agreement cleared & locked in the vault.');
          } else if (docTypeToVerify === 'promissory_note') {
            setSimSuccess('Debt option verified! SEC Reg D P2P Promissory Credit Note cleared & locked in the vault.');
          } else {
            setSimSuccess('Cash management statement verified! Liquid bank ledger account cleared & locked in the vault.');
          }
        }, 1500);

      }, 1500);

    }, 1500);
  };

  // Helper to get descriptive document type tags
  const getDocTypeTag = (type) => {
    switch (type) {
      case 'kyc':
        return 'KYC Scan';
      case 'tax_document':
        return 'Tax Form';
      case 'pitch_deck':
        return 'Pitch Deck';
      case 'business_plan':
        return 'Business Plan';
      case 'safe_agreement':
        return '🤝 SAFE Agreement';
      case 'stock_certificate':
        return '🏆 Stock Certificate';
      case 'promissory_note':
        return '📜 Promissory Note';
      default:
        return 'Compliance Doc';
    }
  };

  return (
    <div style={styles.container} className="animate-fade-in-up">
      <div style={styles.introHeader}>
        <h2 style={styles.title}>Document Vault & KYC Compliance</h2>
        <p style={styles.sub}>Vetted alternative investing requires verified node identities. Complete background screening directly on-chain.</p>
      </div>

      {simSuccess && (
        <div style={styles.successToast}>
          ✨ {simSuccess}
        </div>
      )}

      {/* Main Grid */}
      <div style={styles.grid}>
        {/* Verification Center */}
        <div className="glass-panel" style={styles.card}>
          <h3 style={styles.cardTitle}>⚡ Automated Document Integrity Pipeline</h3>
          <p style={styles.cardDesc}>
            Submit your compliance assets to execute dynamic audits, SHA-256 stamps, and clearing sweeps under Regulation CF/D.
          </p>

          {kycProgress === 0 ? (
            /* Upload State */
            <div style={styles.uploadSection}>
              {user.kycStatus === 'Verified' && (
                <div style={styles.verifiedNodeCard}>
                  <div style={styles.badgeRow}>
                    <span className="badge badge-verified">Status: Verified Member</span>
                  </div>
                  <p style={styles.verifiedText}>
                    Your primary identity node has been accredited. Select other assets below to run the cryptographic integrity pipeline.
                  </p>
                </div>
              )}

              <div style={styles.inputGroup}>
                <label style={styles.label}>Select Asset for Vetting & e-Sign Audit</label>
                <select
                  value={docTypeToVerify}
                  onChange={(e) => setDocTypeToVerify(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '0.75rem 1rem',
                    color: 'var(--color-text-primary)',
                    fontSize: '0.9rem',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {user.kycStatus !== 'Verified' && (
                    <option value="kyc">🆔 Identity Verification (Passport / ID Scan)</option>
                  )}
                  <option value="safe_agreement">📈 Venture SAFE Placements (Equity Option)</option>
                  <option value="promissory_note">🏛️ P2P Promissory Notes (Debt Option)</option>
                  <option value="tax_document">💵 Cash Management & Balance Ledgers</option>
                </select>
              </div>

              <div
                style={{
                  ...styles.dragArea,
                  borderColor: dragActive ? '#ffffff' : 'var(--border-color)',
                  background: dragActive ? 'var(--border-color)' : 'transparent'
                }}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
              >
                <div style={styles.uploadIcon}>
                  {docTypeToVerify === 'kyc' ? '🆔' 
                   : docTypeToVerify === 'safe_agreement' ? '🤝' 
                   : docTypeToVerify === 'promissory_note' ? '📜' 
                   : '💵'}
                </div>
                <h4 style={styles.uploadTitle}>
                  {docTypeToVerify === 'kyc' ? 'Drag and Drop passport / ID scan'
                   : docTypeToVerify === 'safe_agreement' ? 'Drag and Drop Venture SAFE draft'
                   : docTypeToVerify === 'promissory_note' ? 'Drag and Drop Promissory Note draft'
                   : 'Drag and Drop Bank Cash Statement'}
                </h4>
                <p style={styles.uploadSub}>Supports PDF, JPEG, or PNG up to 10MB</p>
                <input
                  type="file"
                  id="file-upload"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                <label htmlFor="file-upload" className="btn-secondary" style={styles.fileLabel}>
                  Browse Local Files
                </label>
              </div>

              {fileName && (
                <div style={styles.selectedFileRow}>
                  <span>File Selected: <strong>{fileName}</strong></span>
                  <button
                    onClick={startKycVerification}
                    className="btn-primary"
                    style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                  >
                    Run Audit Pipeline
                  </button>
                </div>
              )}
            </div>
          ) : kycProgress <= 3 ? (
            /* Active Simulation State */
            <div style={styles.progressContainer}>
              <div style={styles.stepItem}>
                <span style={styles.stepNum}>1</span>
                <div style={styles.stepMeta}>
                  <h4 style={styles.stepTitle}>
                    {docTypeToVerify === 'kyc' ? 'ID Document Integrity Audit' 
                     : docTypeToVerify === 'safe_agreement' ? 'SAFE Legal Covenant Audit' 
                     : docTypeToVerify === 'promissory_note' ? 'Promissory Note Terms Audit' 
                     : 'Bank Cash Balance Audit'}
                  </h4>
                  <span style={styles.stepStatusText}>{step1Status}</span>
                </div>
                {kycProgress === 1 && <div style={styles.spinner}></div>}
              </div>

              <div style={{ ...styles.stepItem, opacity: kycProgress >= 2 ? 1 : 0.5 }}>
                <span style={styles.stepNum}>2</span>
                <div style={styles.stepMeta}>
                  <h4 style={styles.stepTitle}>
                    {docTypeToVerify === 'kyc' ? 'Biometric Facial Liveness Match' 
                     : docTypeToVerify === 'safe_agreement' ? 'e-Signature & SHA-256 Keys Audit' 
                     : docTypeToVerify === 'promissory_note' ? 'Symmetrical e-Signatures Match' 
                     : 'Plaid API Real-time Balance Match'}
                  </h4>
                  <span style={styles.stepStatusText}>{step2Status}</span>
                </div>
                {kycProgress === 2 && <div style={styles.spinner}></div>}
              </div>

              <div style={{ ...styles.stepItem, opacity: kycProgress >= 3 ? 1 : 0.5 }}>
                <span style={styles.stepNum}>3</span>
                <div style={styles.stepMeta}>
                  <h4 style={styles.stepTitle}>
                    {docTypeToVerify === 'kyc' ? 'AML & OFAC Watchlist Sweep' 
                     : docTypeToVerify === 'safe_agreement' ? 'Cap Table Equity Registry Sync' 
                     : docTypeToVerify === 'promissory_note' ? 'Escrow Wallet Clearing & Deposit Sync' 
                     : 'Clearing House Settlement Limit Sweep'}
                  </h4>
                  <span style={styles.stepStatusText}>{step3Status}</span>
                </div>
                {kycProgress === 3 && <div style={styles.spinner}></div>}
              </div>
            </div>
          ) : (
            /* Finished/Vetted State */
            <div style={{ ...styles.verifiedNodeCard, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '2rem 1.5rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'rgba(16,185,129,0.1)',
                border: '1px solid #10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                color: '#10b981',
                margin: '0 auto',
                boxShadow: '0 0 10px rgba(16,185,129,0.2)'
              }}>
                ✓
              </div>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--color-text-primary)' }}>Audit Completed!</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '0.35rem', lineHeight: '1.4' }}>
                  {docTypeToVerify === 'kyc' && 'Biometric passport sweeps cleared. Accredited Node Status fully activated.'}
                  {docTypeToVerify === 'safe_agreement' && 'Y-Combinator SAFE placement verified intact. Cap table ledger successfully synced.'}
                  {docTypeToVerify === 'promissory_note' && 'P2P Commercial Note signature locks and wallet escrow clearances verified.'}
                  {docTypeToVerify === 'tax_document' && 'Bank statement ledger and Plaid API balance statements linked successfully.'}
                </p>
              </div>
              <button
                onClick={() => {
                  setKycProgress(0);
                  setFileName('');
                }}
                className="btn-secondary"
                style={{ alignSelf: 'center', padding: '0.45rem 1rem', fontSize: '0.8rem' }}
              >
                ← Return to Pipeline
              </button>
            </div>
          )}
        </div>

        {/* Document Vault List (Table #7) */}
        <div className="glass-panel" style={{ ...styles.card, flex: 0.8 }}>
          <h3 style={styles.cardTitle}>📂 Secure Document Vault</h3>
          <p style={styles.cardDesc}>Compliance files and assets compiled under SEC Reg CF placement directives.</p>

          <div style={{
            background: 'rgba(0, 242, 254, 0.03)',
            border: '1px dashed rgba(0, 242, 254, 0.2)',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '0.75rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--color-text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span>📜</span> SEC Form C Disclosure Template
              </h4>
              <p style={{ fontSize: '0.74rem', color: 'var(--color-text-secondary)', margin: '0.2rem 0 0 0', lineHeight: '1.3' }}>
                Review a sample of our SEC Form C filing disclosure outlining the Crowd SPV structure.
              </p>
            </div>
            <a 
              href="https://www.sec.gov/files/formc.pdf" 
              target="_blank" 
              rel="noreferrer" 
              className="btn-secondary" 
              style={{ fontSize: '0.7rem', padding: '0.35rem 0.75rem', whiteSpace: 'nowrap', textDecoration: 'none' }}
            >
              Open Sample Form C ↗
            </a>
          </div>

          <div style={styles.vaultList}>
            {documentation.length === 0 ? (
              <p style={styles.emptyText}>No documents uploaded in vault.</p>
            ) : (
              documentation.map((doc) => (
                <div 
                  key={doc.doc_id} 
                  style={{
                    ...styles.vaultItem,
                    border: doc.doc_type === 'stock_certificate' ? '1px solid rgba(212,175,55,0.3)' : doc.doc_type === 'promissory_note' ? '1px solid rgba(59,130,246,0.3)' : '1px solid var(--border-color)',
                    boxShadow: doc.doc_type === 'stock_certificate' ? '0 4px 20px rgba(212,175,55,0.08)' : doc.doc_type === 'promissory_note' ? '0 4px 20px rgba(59,130,246,0.08)' : 'none'
                  }}
                >
                  <span style={styles.docAvatar}>
                    {doc.doc_type === 'kyc' ? '🆔' 
                      : doc.doc_type === 'tax_document' ? '📄' 
                      : doc.doc_type === 'safe_agreement' ? '🤝' 
                      : doc.doc_type === 'stock_certificate' ? '🏆' 
                      : doc.doc_type === 'promissory_note' ? '📜'
                      : '📁'}
                  </span>
                  <div style={styles.docMeta}>
                    <h4 style={{
                      ...styles.docTitle,
                      color: doc.doc_type === 'stock_certificate' ? '#d4af37' : doc.doc_type === 'promissory_note' ? 'var(--border-accent)' : 'var(--color-text-primary)'
                    }}>
                      {doc.doc_type === 'tax_document' && doc.companyName 
                        ? `1099-DIV_${doc.companyName.replace(/\s+/g, '_')}_2026.pdf`
                        : doc.file_url ? doc.file_url.split('/').pop() : 'Compliance_Document.pdf'}
                    </h4>
                    <span style={styles.docSub}>
                      {getDocTypeTag(doc.doc_type)} • {doc.verified ? 'Verified ✓' : 'Processing ⏱'}
                      {(doc.doc_type === 'safe_agreement' || doc.doc_type === 'stock_certificate' || doc.doc_type === 'promissory_note') && (
                        <span style={{ color: '#10b981', marginLeft: '0.5rem', fontWeight: 'bold' }}>
                          • Expiring Access Link (Active for 15m)
                        </span>
                      )}
                    </span>
                  </div>
                  <span style={{
                    ...styles.docSize,
                    color: doc.doc_type === 'stock_certificate' ? '#d4af37' : doc.doc_type === 'promissory_note' ? '#60a5fa' : '#737373',
                    fontWeight: (doc.doc_type === 'stock_certificate' || doc.doc_type === 'promissory_note') ? 'bold' : 'normal'
                  }}>
                    {doc.doc_type === 'stock_certificate' ? 'GOLD FRAMED' 
                     : doc.doc_type === 'promissory_note' ? 'SEC REG D' 
                     : (doc.verified ? 'Verified' : 'Pending')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
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
    color: 'var(--color-text-secondary)',
    marginTop: '0.25rem',
  },
  successToast: {
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-accent)',
    color: 'var(--color-text-primary)',
    padding: '1rem',
    borderRadius: '6px',
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
    flex: '1.2',
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
  verifiedNodeCard: {
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '1.5rem',
    marginTop: '0.5rem',
  },
  badgeRow: {
    display: 'flex',
  },
  verifiedText: {
    fontSize: '0.9rem',
    color: 'var(--color-text-secondary)',
    lineHeight: '1.5',
    marginTop: '0.75rem',
  },
  uploadSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  dragArea: {
    border: '2px dashed var(--border-color)',
    borderRadius: '12px',
    padding: '3rem 2rem',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s ease',
  },
  uploadIcon: {
    fontSize: '2rem',
    marginBottom: '0.5rem',
  },
  uploadTitle: {
    fontSize: '1rem',
    fontWeight: '700',
    color: 'var(--color-text-primary)',
  },
  uploadSub: {
    fontSize: '0.8rem',
    color: 'var(--color-text-muted)',
  },
  fileLabel: {
    marginTop: '1rem',
    padding: '0.5rem 1rem',
    fontSize: '0.8rem',
    cursor: 'pointer',
  },
  selectedFileRow: {
    background: 'var(--bg-primary)',
    padding: '1rem',
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.85rem',
  },
  progressContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginTop: '0.5rem',
  },
  stepItem: {
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    padding: '1.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
    position: 'relative',
    transition: 'opacity 0.3s ease',
  },
  stepNum: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    color: 'var(--color-text-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.85rem',
    fontWeight: '700',
  },
  stepMeta: {
    flex: '1',
  },
  stepTitle: {
    fontSize: '0.9rem',
    fontWeight: '700',
    color: 'var(--color-text-primary)',
  },
  stepStatusText: {
    fontSize: '0.78rem',
    color: 'var(--color-text-muted)',
    display: 'block',
    marginTop: '0.2rem',
  },
  spinner: {
    width: '18px',
    height: '18px',
    border: '2px solid var(--border-color)',
    borderTopColor: '#ffffff',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  vaultList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginTop: '0.5rem',
    width: '100%',
  },
  vaultItem: {
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    width: '100%',
  },
  docAvatar: {
    fontSize: '1.5rem',
  },
  docMeta: {
    flex: 1,
  },
  docTitle: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: 'var(--color-text-primary)',
    wordBreak: 'break-all',
  },
  docSub: {
    fontSize: '0.75rem',
    color: 'var(--color-text-muted)',
    display: 'block',
    marginTop: '0.1rem',
  },
  docSize: {
    fontSize: '0.75rem',
    color: 'var(--color-text-muted)',
  },
  emptyText: {
    fontSize: '0.85rem',
    color: 'var(--color-text-muted)',
    fontStyle: 'italic',
  }
};
