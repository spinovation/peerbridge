'use client';

import { useState } from 'react';

export default function TaxModule({ state }) {
  const { portfolio, documentation, user } = state;
  const [taxYear] = useState('2026');
  const [show1099Preview, setShow1099Preview] = useState(false);
  const [selectedTaxDoc, setSelectedTaxDoc] = useState(null);

  // Read tax document rows directly from documentation table (Table #7)
  const dividendDocs = documentation.filter(doc => doc.doc_type === 'tax_document' || doc.doc_type === 'tax');
  
  // Calculate simulated P2P Debt note interest distributions for 1099-INT
  const debtPortfolio = portfolio.filter(item => item.investment_type === 'debt');
  
  // Compile simulated 1099-INT documents dynamically based on active P2P debt notes
  const generated1099IntDocs = debtPortfolio.map(item => {
    // Interest earned is principal * rate %
    const rate = item.interest_rate || 7.5;
    const interestEarned = item.amount_invested * (rate / 100);
    return {
      doc_id: `tax-int-${item.portfolio_id}`,
      doc_type: 'tax_1099_int',
      companyName: item.companyName || 'Tonin Logistics',
      interest: interestEarned,
      uploaded_at: item.date_invested || new Date().toISOString(),
      principal: item.amount_invested
    };
  });

  // Combine both dividend documents and generated P2P debt interest documents
  const allTaxDocuments = [
    ...dividendDocs.map(d => ({ ...d, doc_type: 'tax_1099_div', dividends: d.dividends || 120 })),
    ...generated1099IntDocs
  ];

  // Calculate statistics based on actual portfolio table data
  const totalPlacedCapital = portfolio.reduce((acc, curr) => acc + curr.amount_invested, 0);
  const totalDividends = allTaxDocuments
    .filter(d => d.doc_type === 'tax_1099_div')
    .reduce((acc, curr) => acc + (curr.dividends || 0), 0);
  const totalP2PInterest = allTaxDocuments
    .filter(d => d.doc_type === 'tax_1099_int')
    .reduce((acc, curr) => acc + (curr.interest || 0), 0);

  const handleOpen1099 = (doc) => {
    setSelectedTaxDoc(doc);
    setShow1099Preview(true);
  };

  return (
    <div style={styles.container} className="animate-fade-in-up">
      <div style={styles.introHeader}>
        <h2 style={styles.title}>🏛️ Tax Reporting & Compliance Center</h2>
        <p style={styles.sub}>Access annual 1099 forms, dividend ledgers, and satisfy IRS Reg D/Reg CF reporting criteria.</p>
      </div>

      <div style={styles.grid}>
        {/* Tax stats and document list */}
        <div style={styles.leftCol}>
          {/* Summary Cards */}
          <div style={styles.statsRow}>
            <div className="glass-panel" style={styles.statCard}>
              <span style={styles.statLabel}>Placed Capital Balance</span>
              <span style={styles.statVal}>${totalPlacedCapital.toLocaleString()}</span>
            </div>
            <div className="glass-panel" style={styles.statCard}>
              <span style={styles.statLabel}>Ordinary Dividends (1099-DIV)</span>
              <span style={{ ...styles.statVal, color: '#00f2fe' }}>
                ${totalDividends.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="glass-panel" style={styles.statCard}>
              <span style={styles.statLabel}>P2P Note Interest (1099-INT)</span>
              <span style={{ ...styles.statVal, color: '#a78bfa' }}>
                ${totalP2PInterest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Compiled Tax Documents from DB Table #7 */}
          <div className="glass-panel" style={styles.card}>
            <h3 style={styles.cardTitle}>📄 Compiled IRS Tax Documents (Table #7)</h3>
            <p style={styles.cardDesc}>Download verified tax forms compiled from your Peer Bridge equity placements and P2P note repayments.</p>

            <div style={styles.docList}>
              {allTaxDocuments.length === 0 ? (
                <div style={styles.emptyBoxText}>
                  <p>No tax documents compiled yet. Invest in debt notes or equity campaigns to automatically generate IRS Form 1099s.</p>
                </div>
              ) : (
                allTaxDocuments.map((doc) => (
                  <div key={doc.doc_id} style={styles.docItem}>
                    <div style={styles.docMeta}>
                      <span style={{
                        fontSize: '1.5rem',
                        color: doc.doc_type === 'tax_1099_int' ? '#a78bfa' : '#00f2fe'
                      }}>
                        {doc.doc_type === 'tax_1099_int' ? '🏛️' : '📁'}
                      </span>
                      <div>
                        <h4 style={styles.docName}>
                          {doc.doc_type === 'tax_1099_int' ? 'Form 1099-INT' : 'Form 1099-DIV'} – {doc.companyName || 'Dividend Distribution'}
                        </h4>
                        <span style={styles.docDate}>
                          {doc.doc_type === 'tax_1099_int' ? 'P2P Commercial Interest' : 'Equity SAFE Dividends'} • Compiled for {taxYear} Tax Season
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleOpen1099(doc)}
                      className="btn-primary"
                      style={{
                        ...styles.downloadBtn,
                        background: doc.doc_type === 'tax_1099_int' ? '#8b5cf6' : '#00f2fe',
                        color: '#000000',
                        fontWeight: '800'
                      }}
                    >
                      View IRS Form
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Info Column */}
        <div className="glass-panel" style={styles.rightColPanel}>
          <h3 style={styles.cardTitle}>🔒 Regulation Compliance</h3>
          <p style={styles.rightText}>
            Under IRS regulations, dividends from crowdfunding SPVs are reported using **Form 1099-DIV**, while direct peer-to-peer interest distributions are tracked via **Form 1099-INT**.
          </p>
          <p style={styles.rightText}>
            Peer Bridge automatically coordinates with vetted CPAs in our **Advisory Network** to compile and authorize these forms annually.
          </p>
          <div style={styles.complianceBadge}>
            🛡 IRS Reg D & CF Compliant Node
          </div>
        </div>
      </div>

      {/* High-Fidelity IRS Form Interactive Preview (DIV or INT) */}
      {show1099Preview && selectedTaxDoc && (
        <div style={styles.backdrop}>
          <div className="glass-panel glow-accent-border animate-fade-in-up" style={styles.form1099Card}>
            <div style={styles.formHeader}>
              <div style={styles.formHeaderLeft}>
                <h3 style={styles.formTitle}>
                  {selectedTaxDoc.doc_type === 'tax_1099_int' ? 'Form 1099-INT' : 'Form 1099-DIV'}
                </h3>
                <span style={styles.formSub}>OMB No. 1545-0110 • Department of the Treasury - Internal Revenue Service</span>
              </div>
              <span style={styles.formYear}>2026</span>
              <button
                onClick={() => setShow1099Preview(false)}
                className="btn-secondary"
                style={styles.closeBtn}
              >
                Close Preview
              </button>
            </div>

            <h4 style={styles.formSectionTitle}>
              {selectedTaxDoc.doc_type === 'tax_1099_int' ? 'Interest Income Report' : 'Dividends and Distributions'}
            </h4>

            {/* IRS Grid */}
            {selectedTaxDoc.doc_type === 'tax_1099_int' ? (
              /* IRS Form 1099-INT Grid */
              <div style={styles.irsGrid}>
                <div style={{ ...styles.irsBox, gridColumn: 'span 2' }}>
                  <span style={styles.boxLabel}>PAYER’S name, street address, city or town, state or province, country, and ZIP</span>
                  <strong style={styles.boxVal}>
                    Peer Bridge P2P SPV LLC<br/>
                    100 Financial Plaza<br/>
                    San Francisco, CA 94104
                  </strong>
                </div>

                <div style={styles.irsBox}>
                  <span style={styles.boxLabel}>1 Interest income ($)</span>
                  <strong style={{ ...styles.boxVal, color: '#a78bfa' }}>${(selectedTaxDoc.interest || 0).toFixed(2)}</strong>
                </div>

                <div style={styles.irsBox}>
                  <span style={styles.boxLabel}>PAYER’S Federal TIN</span>
                  <strong style={styles.boxVal}>XX-XXX7718</strong>
                </div>

                <div style={styles.irsBox}>
                  <span style={styles.boxLabel}>RECIPIENT’S TIN</span>
                  <strong style={styles.boxVal}>XXX-XX-4819</strong>
                </div>

                <div style={styles.irsBox}>
                  <span style={styles.boxLabel}>2 Early withdrawal penalty ($)</span>
                  <strong style={styles.boxVal}>$0.00</strong>
                </div>

                <div style={{ ...styles.irsBox, gridColumn: 'span 2' }}>
                  <span style={styles.boxLabel}>RECIPIENT’S name</span>
                  <strong style={styles.boxVal}>{user.name}</strong>
                </div>

                <div style={styles.irsBox}>
                  <span style={styles.boxLabel}>3 Interest on U.S. Savings Bonds ($)</span>
                  <strong style={styles.boxVal}>$0.00</strong>
                </div>

                <div style={{ ...styles.irsBox, gridColumn: 'span 2' }}>
                  <span style={styles.boxLabel}>RECIPIENT’S street address (inc. apt. no.)</span>
                  <strong style={styles.boxVal}>{user.email}</strong>
                </div>

                <div style={styles.irsBox}>
                  <span style={styles.boxLabel}>4 Federal income tax withheld ($)</span>
                  <strong style={styles.boxVal}>$0.00</strong>
                </div>
              </div>
            ) : (
              /* IRS Form 1099-DIV Grid */
              <div style={styles.irsGrid}>
                <div style={{ ...styles.irsBox, gridColumn: 'span 2' }}>
                  <span style={styles.boxLabel}>PAYER’S name, street address, city or town, state or province, country, and ZIP</span>
                  <strong style={styles.boxVal}>
                    Peer Bridge P2P SPV LLC<br/>
                    100 Financial Plaza<br/>
                    San Francisco, CA 94104
                  </strong>
                </div>

                <div style={styles.irsBox}>
                  <span style={styles.boxLabel}>1a Ordinary dividends ($)</span>
                  <strong style={{ ...styles.boxVal, color: '#00f2fe' }}>${(selectedTaxDoc.dividends || 0).toFixed(2)}</strong>
                </div>

                <div style={styles.irsBox}>
                  <span style={styles.boxLabel}>1b Qualified dividends ($)</span>
                  <strong style={styles.boxVal}>${((selectedTaxDoc.dividends || 0) * 0.8).toFixed(2)}</strong>
                </div>

                <div style={{ ...styles.irsBox, gridColumn: 'span 2' }}>
                  <span style={styles.boxLabel}>RECIPIENT’S name</span>
                  <strong style={styles.boxVal}>{user.name}</strong>
                </div>

                <div style={styles.irsBox}>
                  <span style={styles.boxLabel}>2a Total capital gain distr. ($)</span>
                  <strong style={styles.boxVal}>$0.00</strong>
                </div>

                <div style={styles.irsBox}>
                  <span style={styles.boxLabel}>3 Nondividend distributions ($)</span>
                  <strong style={styles.boxVal}>$0.00</strong>
                </div>

                <div style={{ ...styles.irsBox, gridColumn: 'span 2' }}>
                  <span style={styles.boxLabel}>RECIPIENT’S street address (inc. apt. no.)</span>
                  <strong style={styles.boxVal}>{user.email}</strong>
                </div>

                <div style={styles.irsBox}>
                  <span style={styles.boxLabel}>4 Federal income tax withheld ($)</span>
                  <strong style={styles.boxVal}>$0.00</strong>
                </div>
              </div>
            )}

            <div style={styles.disclaimer}>
              ⚠️ This represents a verified compliance simulation card. Real IRS Form filings must be processed by certified tax affiliates.
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
  grid: {
    display: 'grid',
    gridTemplateColumns: '1.5fr 1fr',
    gap: '2rem',
    flexWrap: 'wrap',
  },
  leftCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1.25rem',
  },
  statCard: {
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  statLabel: {
    fontSize: '0.68rem',
    color: '#737373',
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  statVal: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#ffffff',
  },
  card: {
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
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
  docList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginTop: '0.5rem',
  },
  docItem: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.04)',
    borderRadius: '8px',
    padding: '1.25rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
  },
  docMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  docName: {
    fontSize: '0.9rem',
    fontWeight: '700',
    color: '#ffffff',
  },
  docDate: {
    display: 'block',
    fontSize: '0.75rem',
    color: '#737373',
    marginTop: '0.15rem',
  },
  downloadBtn: {
    padding: '0.5rem 1rem',
    fontSize: '0.8rem',
  },
  rightColPanel: {
    padding: '2.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    height: 'fit-content',
  },
  rightText: {
    fontSize: '0.9rem',
    color: '#a3a3a3',
    lineHeight: '1.6',
  },
  complianceBadge: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#ffffff',
    padding: '0.75rem',
    borderRadius: '6px',
    fontSize: '0.8rem',
    fontWeight: '700',
    textAlign: 'center',
    marginTop: '1rem',
  },
  backdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.8)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '2rem',
  },
  form1099Card: {
    width: '100%',
    maxWidth: '720px',
    background: '#000000',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    padding: '3rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
    boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
  },
  formHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '2px solid #ffffff',
    paddingBottom: '1rem',
  },
  formHeaderLeft: {
    display: 'flex',
    flexDirection: 'column',
  },
  formTitle: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#ffffff',
  },
  formSub: {
    fontSize: '0.75rem',
    color: '#737373',
  },
  formYear: {
    fontSize: '2rem',
    fontWeight: '900',
    color: '#ffffff',
  },
  closeBtn: {
    padding: '0.5rem 1rem',
    fontSize: '0.8rem',
  },
  formSectionTitle: {
    fontSize: '1rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    color: '#ffffff',
    letterSpacing: '0.05em',
  },
  irsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1px',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
  },
  irsBox: {
    background: '#000000',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  boxLabel: {
    fontSize: '0.65rem',
    color: '#737373',
    textTransform: 'uppercase',
    lineHeight: '1.2',
  },
  boxVal: {
    fontSize: '0.9rem',
    color: '#ffffff',
    fontFamily: 'monospace',
  },
  disclaimer: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    padding: '0.75rem 1rem',
    fontSize: '0.78rem',
    color: '#a3a3a3',
    lineHeight: '1.4',
    textAlign: 'center',
  },
  emptyBoxText: {
    padding: '2rem',
    textAlign: 'center',
    color: '#525252',
    fontSize: '0.85rem',
    fontStyle: 'italic',
  }
};
