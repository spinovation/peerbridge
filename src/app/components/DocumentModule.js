'use client';

import { useState } from 'react';

export default function DocumentModule({ state }) {
  const { user, documentation, submitKycDocuments, completeKycNodeVetting } = state;
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState('');
  
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
    const newKycDoc = submitKycDocuments(fileName);
    setActiveKycDocId(newKycDoc.doc_id);

    setKycProgress(1);
    setStep1Status('Scanning Document...');

    // Step 1 Finish
    setTimeout(() => {
      setStep1Status('Complete ✓');
      setKycProgress(2);
      setStep2Status('Evaluating Biometrics...');

      // Step 2 Finish
      setTimeout(() => {
        setStep2Status('Complete ✓');
        setKycProgress(3);
        setStep3Status('Checking Global Watchlists...');

        // Step 3 Finish (AML check)
        setTimeout(() => {
          setStep3Status('Complete ✓');
          setKycProgress(4);
          
          // Complete vetting in DB: mark document as verified and customer as verified!
          completeKycNodeVetting(newKycDoc.doc_id);
          
          setSimSuccess('Congratulations! Your passport and facial sweep have passed regulatory screening. Accredited Node Status unlocked!');
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
          <h3 style={styles.cardTitle}>🛡 KYC / AML Identity Vetting</h3>
          <p style={styles.cardDesc}>
            Submit your government-issued ID to execute biometric match indexing and international anti-money laundering (AML) sweeps.
          </p>

          {user.kycStatus === 'Verified' ? (
            <div style={styles.verifiedNodeCard}>
              <div style={styles.badgeRow}>
                <span className="badge badge-verified">Status: Verified Member</span>
              </div>
              <p style={styles.verifiedText}>
                Your identity node has passed active screening. Diligence restrictions are unlocked. You can participate in all crowdfunding offerings.
              </p>
            </div>
          ) : kycProgress === 0 ? (
            /* Upload State */
            <div style={styles.uploadSection}>
              <div
                style={{
                  ...styles.dragArea,
                  borderColor: dragActive ? '#ffffff' : 'rgba(255,255,255,0.1)',
                  background: dragActive ? 'rgba(255,255,255,0.02)' : 'transparent'
                }}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
              >
                <div style={styles.uploadIcon}>📁</div>
                <h4 style={styles.uploadTitle}>Drag and Drop Passport / ID Scan</h4>
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
                    Submit for Verification
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Active Simulation State */
            <div style={styles.progressContainer}>
              <div style={styles.stepItem}>
                <span style={styles.stepNum}>1</span>
                <div style={styles.stepMeta}>
                  <h4 style={styles.stepTitle}>ID Document Integrity Audit</h4>
                  <span style={styles.stepStatusText}>{step1Status}</span>
                </div>
                {kycProgress === 1 && <div style={styles.spinner}></div>}
              </div>

              <div style={{ ...styles.stepItem, opacity: kycProgress >= 2 ? 1 : 0.5 }}>
                <span style={styles.stepNum}>2</span>
                <div style={styles.stepMeta}>
                  <h4 style={styles.stepTitle}>Biometric Facial Liveness Match</h4>
                  <span style={styles.stepStatusText}>{step2Status}</span>
                </div>
                {kycProgress === 2 && <div style={styles.spinner}></div>}
              </div>

              <div style={{ ...styles.stepItem, opacity: kycProgress >= 3 ? 1 : 0.5 }}>
                <span style={styles.stepNum}>3</span>
                <div style={styles.stepMeta}>
                  <h4 style={styles.stepTitle}>AML & Office of Foreign Assets Control (OFAC) Sweep</h4>
                  <span style={styles.stepStatusText}>{step3Status}</span>
                </div>
                {kycProgress === 3 && <div style={styles.spinner}></div>}
              </div>
            </div>
          )}
        </div>

        {/* Document Vault List (Table #7) */}
        <div className="glass-panel" style={{ ...styles.card, flex: 0.8 }}>
          <h3 style={styles.cardTitle}>📂 Secure Document Vault (Table #7)</h3>
          <p style={styles.cardDesc}>Compliance files and assets compiled under SEC Reg CF placement directives.</p>

          <div style={styles.vaultList}>
            {documentation.length === 0 ? (
              <p style={styles.emptyText}>No documents uploaded in vault.</p>
            ) : (
              documentation.map((doc) => (
                <div key={doc.doc_id} style={styles.vaultItem}>
                  <span style={styles.docAvatar}>
                    {doc.doc_type === 'kyc' ? '🆔' : doc.doc_type === 'tax_document' ? '📄' : '📁'}
                  </span>
                  <div style={styles.docMeta}>
                    <h4 style={styles.docTitle}>
                      {doc.doc_type === 'tax_document' && doc.companyName 
                        ? `1099-DIV_${doc.companyName.replace(/\s+/g, '_')}_2026.pdf`
                        : doc.file_url ? doc.file_url.split('/').pop() : 'Compliance_Document.pdf'}
                    </h4>
                    <span style={styles.docSub}>
                      {getDocTypeTag(doc.doc_type)} • {doc.verified ? 'Verified ✓' : 'Processing ⏱'}
                    </span>
                  </div>
                  <span style={styles.docSize}>
                    {doc.verified ? 'Verified' : 'Pending'}
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
    color: '#a3a3a3',
    marginTop: '0.25rem',
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
    color: '#a3a3a3',
    lineHeight: '1.4',
  },
  verifiedNodeCard: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '1.5rem',
    marginTop: '0.5rem',
  },
  badgeRow: {
    display: 'flex',
  },
  verifiedText: {
    fontSize: '0.9rem',
    color: '#a3a3a3',
    lineHeight: '1.5',
    marginTop: '0.75rem',
  },
  uploadSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  dragArea: {
    border: '2px dashed rgba(255,255,255,0.1)',
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
    color: '#ffffff',
  },
  uploadSub: {
    fontSize: '0.8rem',
    color: '#737373',
  },
  fileLabel: {
    marginTop: '1rem',
    padding: '0.5rem 1rem',
    fontSize: '0.8rem',
    cursor: 'pointer',
  },
  selectedFileRow: {
    background: 'rgba(255,255,255,0.02)',
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
    background: 'rgba(255,255,255,0.01)',
    border: '1px solid rgba(255,255,255,0.04)',
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
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: '#ffffff',
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
    color: '#ffffff',
  },
  stepStatusText: {
    fontSize: '0.78rem',
    color: '#737373',
    display: 'block',
    marginTop: '0.2rem',
  },
  spinner: {
    width: '18px',
    height: '18px',
    border: '2px solid rgba(255, 255, 255, 0.1)',
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
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.04)',
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
    color: '#ffffff',
    wordBreak: 'break-all',
  },
  docSub: {
    fontSize: '0.75rem',
    color: '#737373',
    display: 'block',
    marginTop: '0.1rem',
  },
  docSize: {
    fontSize: '0.75rem',
    color: '#737373',
  },
  emptyText: {
    fontSize: '0.85rem',
    color: '#525252',
    fontStyle: 'italic',
  }
};
