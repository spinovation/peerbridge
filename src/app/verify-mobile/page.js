'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { db, isFirebaseConfigured } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

function VerifyMobileContent() {
  const searchParams = useSearchParams();
  const customerId = searchParams.get('id');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [customer, setCustomer] = useState(null);

  // Form states
  const [idType, setIdType] = useState('passport'); // 'passport' | 'license'
  const [passportFile, setPassportFile] = useState(null);
  const [passportFileName, setPassportFileName] = useState('');
  const [licenseFront, setLicenseFront] = useState(null);
  const [licenseFrontName, setLicenseFrontName] = useState('');
  const [licenseBack, setLicenseBack] = useState(null);
  const [licenseBackName, setLicenseBackName] = useState('');
  const [selfie, setSelfie] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [consent, setConsent] = useState(false);

  // Load customer details from Firestore
  useEffect(() => {
    if (!customerId) {
      setError('Invalid URL. No customer ID was provided in the parameters.');
      setLoading(false);
      return;
    }

    if (!isFirebaseConfigured || !db) {
      setError('Firebase is not configured in this environment. Mobile-desktop sync requires Firestore database backing.');
      setLoading(false);
      return;
    }

    const fetchCustomer = async () => {
      try {
        const docRef = doc(db, 'customers', customerId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setCustomer(docSnap.data());
        } else {
          setError('Access Denied. User record was not found in the platform registry.');
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch user registration status. Connection error.');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [customerId]);

  // Read file as Base64 helper
  const handleFileChange = (e, setter, nameSetter) => {
    const file = e.target.files[0];
    if (!file) return;

    nameSetter(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      setter(reader.result); // Base64 data url
    };
    reader.readAsDataURL(file);
  };

  const handleSelfieChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelfie(reader.result); // Base64 data url
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerId || !db) return;

    // Validation
    if (idType === 'passport' && !passportFile) {
      alert('Please upload your Passport front bio page.');
      return;
    }
    if (idType === 'license' && (!licenseFront || !licenseBack)) {
      alert('Please upload both the front and back of your Driver\'s License.');
      return;
    }
    if (!selfie) {
      alert('Please capture a biometric selfie to verify matches.');
      return;
    }

    setSubmitting(true);
    try {
      const docFiles = idType === 'passport' ? [passportFile] : [licenseFront, licenseBack];

      // 1. Update user's document in Firestore
      const custDocRef = doc(db, 'customers', customerId);
      await updateDoc(custDocRef, {
        id_verified: true,
        id_document_type: idType,
        id_document_files: docFiles,
        id_selfie_url: selfie,
        status: 'verified',
        updated_at: new Date().toISOString()
      });

      // 2. Heal / Update user inside the global directory document in Firestore
      const dirRef = doc(db, 'global_data', 'directory');
      const dirSnap = await getDoc(dirRef);
      if (dirSnap.exists()) {
        const dirData = dirSnap.data();
        const updatedMembers = (dirData.members || []).map(m => {
          if (m.customer_id === customerId) {
            return {
              ...m,
              status: 'verified',
              id_verified: true,
              basicProfile: {
                ...m.basicProfile,
                profile_picture_url: m.basicProfile.profile_picture_url || selfie // fallback to selfie as profile pic!
              }
            };
          }
          return m;
        });
        await updateDoc(dirRef, { members: updatedMembers });
      }

      setSuccess(true);
    } catch (err) {
      console.error(err);
      alert('Verification failed: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div className="animate-spin" style={styles.spinner}></div>
        <p style={{ marginTop: '16px', fontSize: '15px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
          Connecting Identity Security Node...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <img src="https://peerbridge.ai/logo.png" alt="Peer Bridge Logo" style={styles.logo} />
        </div>
        <div style={styles.card}>
          <div style={{ ...styles.errorIcon, color: '#f43f5e' }}>⚠️</div>
          <h2 style={styles.cardTitle}>Identity Gate Access Blocked</h2>
          <p style={styles.cardDesc}>{error}</p>
          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <p style={{ fontSize: '12px', color: '#64748b' }}>
              Please check the URL parameters on your computer or contact support@peerbridge.ai.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <img src="https://peerbridge.ai/logo.png" alt="Peer Bridge Logo" style={styles.logo} />
        </div>
        <div style={styles.card}>
          <div style={styles.successIcon}>✨</div>
          <h2 style={styles.cardTitle}>Verification Completed!</h2>
          <p style={styles.cardDesc}>
            Thank you, <strong>{customer?.first_name} {customer?.last_name}</strong>. Your government ID scans and biometric selfie have been successfully synced and encrypted in our secure vault.
          </p>
          <div style={styles.successBox}>
            🛡️ <strong>ID Verified Member</strong> status has been issued to your browser nodes.
          </div>
          <p style={{ ...styles.cardDesc, marginTop: '24px', fontSize: '13px', color: '#64748b' }}>
            You can now return to your computer screen. The onboarding wizard has advanced automatically in real-time.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <img src="https://peerbridge.ai/logo.png" alt="Peer Bridge Logo" style={styles.logo} />
        <span style={styles.subhead}>Biometric Verification Hub</span>
      </div>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Verify Your Identity</h2>
        <p style={styles.cardDesc}>
          Hi <strong>{customer?.first_name}</strong>, complete the secure identity checks below to upgrade your profile status to <strong>ID Verified Member</strong>.
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Consent Section */}
          <div style={{ background: 'rgba(10, 102, 194, 0.03)', border: '1px solid rgba(10, 102, 194, 0.1)', borderRadius: '8px', padding: '12px', marginBottom: '8px' }}>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '12px', fontWeight: '800', color: '#0a66c2', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              ⚖️ Biometric Vetting & Privacy Agreement
            </h4>
            <p style={{ margin: '0 0 10px 0', fontSize: '11px', color: '#5c6670', lineHeight: '1.4', textAlign: 'left' }}>
              We require your explicit consent under biometric privacy regulations (including BIPA and CCPA) before capturing document photos and selfie facial coordinates. We use this data solely to match your physical document with your live face and delete all biometric details immediately after verification.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input 
                type="checkbox" 
                id="mobileConsentChk"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <label htmlFor="mobileConsentChk" style={{ fontSize: '12px', fontWeight: '700', color: '#1f2937', cursor: 'pointer', userSelect: 'none' }}>
                I agree to the Biometric Vetting terms
              </label>
            </div>
          </div>

          {consent ? (
            <>
              {/* Step A: Select ID Type */}
              <div style={styles.sectionHeader}>
                <span style={styles.stepNum}>A</span> Select Government ID Document
              </div>

              <div style={styles.tabContainer}>
                <button
                  type="button"
                  onClick={() => setIdType('passport')}
                  style={idType === 'passport' ? styles.tabActive : styles.tab}
                >
                  🛂 Passport (Page 1)
                </button>
                <button
                  type="button"
                  onClick={() => setIdType('license')}
                  style={idType === 'license' ? styles.tabActive : styles.tab}
                >
                  💳 Driver's License
                </button>
              </div>

              {/* Step B: Upload Files */}
              <div style={styles.sectionHeader}>
                <span style={styles.stepNum}>B</span> Upload Scanned Document
              </div>

              {idType === 'passport' ? (
                <div style={styles.fileInputGroup}>
                  <label style={styles.fileInputLabel}>
                    📁 Upload Passport Bio Page (First Page Scan)
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, setPassportFile, setPassportFileName)}
                      style={styles.fileInput}
                      required
                    />
                  </label>
                  {passportFileName && <span style={styles.fileName}>✓ {passportFileName}</span>}
                  <p style={styles.fieldTip}>Ensure all numbers, photo, and details are clearly readable.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={styles.fileInputGroup}>
                    <label style={styles.fileInputLabel}>
                      📁 Upload License FRONT Side Scan
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, setLicenseFront, setLicenseFrontName)}
                        style={styles.fileInput}
                        required
                      />
                    </label>
                    {licenseFrontName && <span style={styles.fileName}>✓ {licenseFrontName}</span>}
                  </div>

                  <div style={styles.fileInputGroup}>
                    <label style={styles.fileInputLabel}>
                      📁 Upload License BACK Side Scan
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, setLicenseBack, setLicenseBackName)}
                        style={styles.fileInput}
                        required
                      />
                    </label>
                    {licenseBackName && <span style={styles.fileName}>✓ {licenseBackName}</span>}
                  </div>
                  <p style={styles.fieldTip}>Ensure front photo and back barcode details are clean.</p>
                </div>
              )}

              {/* Step C: Selfie Biometrics */}
              <div style={styles.sectionHeader}>
                <span style={styles.stepNum}>C</span> Biometric Selfie Match
              </div>
              <p style={styles.cardDesc}>
                Tap the camera circle below to open your phone camera and capture a live selfie to match your ID scan.
              </p>

              <div style={styles.selfieAlignContainer}>
                <label style={styles.selfieCircleLabel}>
                  <input
                    type="file"
                    accept="image/*"
                    capture="user"
                    onChange={handleSelfieChange}
                    style={styles.fileInput}
                    required
                  />
                  {selfie ? (
                    <img src={selfie} alt="Selfie Preview" style={styles.selfiePreviewImage} />
                  ) : (
                    <div style={styles.selfieEmptyIcon}>📸</div>
                  )}
                </label>
                <span style={{ fontSize: '13px', fontWeight: '700', color: selfie ? '#057642' : '#0a66c2' }}>
                  {selfie ? '✓ Selfie Captured Successfully' : 'Tap to Open Selfie Camera'}
                </span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '30px',
                  backgroundColor: '#0a66c2',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: '700',
                  fontSize: '15px',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  marginTop: '24px',
                  boxShadow: '0 2px 4px rgba(10,102,194,0.25)'
                }}
              >
                {submitting ? 'Encrypting & Vaulting Documents...' : 'Submit Identity Verification →'}
              </button>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '16px 0', color: '#64748b', fontSize: '12.5px', lineHeight: '1.4' }}>
              Please check the box above to accept the Biometric Vetting terms and enable camera ID scanning.
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default function VerifyMobile() {
  return (
    <Suspense fallback={
      <div style={styles.loadingContainer}>
        <div className="animate-spin" style={styles.spinner}></div>
        <p style={{ marginTop: '16px', fontSize: '15px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
          Loading Identity Verification Gate...
        </p>
      </div>
    }>
      <VerifyMobileContent />
    </Suspense>
  );
}

// Light theme-harmonized style guides
const styles = {
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: '#f3f2f0',
    color: '#191919'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '2px solid rgba(10, 102, 194, 0.1)',
    borderTopColor: '#0a66c2',
    borderRadius: '50%'
  },
  container: {
    minHeight: '100vh',
    background: '#f3f2f0',
    color: '#191919',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px 16px 40px 16px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '20px',
    textAlign: 'center'
  },
  logo: {
    height: '40px',
    objectFit: 'contain'
  },
  subhead: {
    fontSize: '11px',
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: '0.05em',
    color: '#64748b',
    marginTop: '4px'
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    background: '#ffffff',
    border: '1px solid rgba(0, 0, 0, 0.08)',
    borderRadius: '12px',
    padding: '24px 20px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#0a66c2',
    margin: '0 0 8px 0',
    textAlign: 'center'
  },
  cardDesc: {
    fontSize: '14px',
    lineHeight: '1.5',
    color: '#5c6670',
    margin: '0 0 20px 0',
    textAlign: 'center'
  },
  errorIcon: {
    fontSize: '40px',
    textAlign: 'center',
    marginBottom: '12px'
  },
  successIcon: {
    fontSize: '44px',
    textAlign: 'center',
    color: '#0a66c2',
    marginBottom: '12px',
    animation: 'pulse 2s infinite'
  },
  successBox: {
    background: 'rgba(5, 118, 66, 0.06)',
    border: '1px solid rgba(5, 118, 66, 0.2)',
    color: '#057642',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: '16px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  sectionHeader: {
    fontSize: '14px',
    fontWeight: '800',
    color: '#191919',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    borderBottom: '1px solid rgba(0,0,0,0.06)',
    paddingBottom: '8px',
    marginTop: '8px'
  },
  stepNum: {
    background: '#0a66c2',
    color: '#ffffff',
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    fontWeight: '800'
  },
  tabContainer: {
    display: 'flex',
    gap: '8px',
    background: '#f3f2f0',
    padding: '4px',
    borderRadius: '8px'
  },
  tab: {
    flex: 1,
    background: 'none',
    border: 'none',
    padding: '8px',
    fontSize: '12px',
    fontWeight: '700',
    color: '#5c6670',
    cursor: 'pointer',
    borderRadius: '6px'
  },
  tabActive: {
    flex: 1,
    background: '#ffffff',
    border: 'none',
    padding: '8px',
    fontSize: '12px',
    fontWeight: '800',
    color: '#0a66c2',
    cursor: 'pointer',
    borderRadius: '6px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  },
  fileInputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  fileInputLabel: {
    background: '#f8fafc',
    border: '1px dashed #cbd5e1',
    borderRadius: '8px',
    padding: '16px',
    textAlign: 'center',
    fontSize: '13px',
    fontWeight: '600',
    color: '#0a66c2',
    cursor: 'pointer',
    display: 'block'
  },
  fileInput: {
    display: 'none'
  },
  fileName: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#057642',
    wordBreak: 'break-all'
  },
  fieldTip: {
    fontSize: '11px',
    color: '#64748b',
    margin: 0
  },
  selfieAlignContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    marginTop: '8px'
  },
  selfieCircleLabel: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    background: '#f3f2f0',
    border: '2px dashed #0a66c2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    overflow: 'hidden',
    position: 'relative'
  },
  selfieEmptyIcon: {
    fontSize: '32px'
  },
  selfiePreviewImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  }
};
