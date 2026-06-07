'use client';

import { useState } from 'react';

export default function AffiliateModule({ state }) {
  const { affiliates, qaFeed, postQuestion, answerQuestion, user, resources, submitResource } = state;
  const [subTab, setSubTab] = useState('qa'); // qa, directory, resources
  
  // Q&A input states
  const [questionText, setQuestionText] = useState('');
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [qaSuccess, setQaSuccess] = useState('');

  // Resource Creator Form States (Table #9)
  const [showResourceForm, setShowResourceForm] = useState(false);
  const [resTitle, setResTitle] = useState('');
  const [resCategory, setResCategory] = useState('legal');
  const [resUrl, setResUrl] = useState('');
  const [resourceSearch, setResourceSearch] = useState('');
  const [activeResCategory, setActiveResCategory] = useState('all');

  const handlePostQuestion = (e) => {
    e.preventDefault();
    if (!questionText.trim()) return;

    postQuestion(questionText);
    setQuestionText('');
    setQaSuccess('Your regulatory question has been posted to the advisory board!');
    setTimeout(() => setQaSuccess(''), 3000);
  };

  const handlePostReply = (e, qId) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    const res = answerQuestion(qId, replyText);
    if (res.success) {
      setReplyText('');
      setActiveReplyId(null);
      setQaSuccess('Vetted reply successfully attached to the advisory thread.');
      setTimeout(() => setQaSuccess(''), 3000);
    }
  };

  const handlePublishResource = (e) => {
    e.preventDefault();
    if (!resTitle.trim() || !resUrl.trim()) return;

    const res = submitResource(resTitle, resCategory, resUrl);
    if (res.success) {
      setResTitle('');
      setResUrl('');
      setShowResourceForm(false);
      setQaSuccess(`Regulatory resource "${res.resource.title}" successfully published!`);
      setTimeout(() => setQaSuccess(''), 4000);
    }
  };

  // Filter resources
  const filteredResources = resources.filter(res => {
    const matchesSearch = res.title.toLowerCase().includes(resourceSearch.toLowerCase()) || 
                          res.category.toLowerCase().includes(resourceSearch.toLowerCase());
    const matchesCategory = activeResCategory === 'all' || res.category === activeResCategory;
    return matchesSearch && matchesCategory;
  });

  const getDocIcon = (cat) => {
    switch (cat) {
      case 'legal':
        return '⚖';
      case 'tools':
        return '🔧';
      case 'guides':
        return '📘';
      default:
        return '📄';
    }
  };

  return (
    <div style={styles.container} className="animate-fade-in-up">
      {/* Subnavigation */}
      <div style={styles.navRow}>
        <div style={styles.tabButtons}>
          <button
            onClick={() => setSubTab('qa')}
            style={subTab === 'qa' ? styles.tabActive : styles.tabInactive}
          >
            💬 Advisory Q&A Feed
          </button>
          <button
            onClick={() => setSubTab('resources')}
            style={subTab === 'resources' ? styles.tabActive : styles.tabInactive}
          >
            📚 Library Guides
          </button>
          <button
            onClick={() => setSubTab('directory')}
            style={subTab === 'directory' ? styles.tabActive : styles.tabInactive}
          >
            👥 Vetted Compliance Consultants
          </button>
        </div>
      </div>

      {qaSuccess && (
        <div style={styles.successToast}>
          ✨ {qaSuccess}
        </div>
      )}

      {/* Tab Renderings */}
      {subTab === 'qa' && (
        <div style={styles.qaView}>
          <div style={styles.introHeader}>
            <h2 style={styles.title}>Compliance Advisory Q&A Board</h2>
            <p style={styles.sub}>Entrepreneurs post structuring and tax questions; vetted professional affiliates reply to establish client leads.</p>
          </div>

          <div style={styles.qaGrid}>
            {/* Left Column: Q&A Thread Lists */}
            <div style={styles.qaThreadsCol}>
              {/* Ask Question form */}
              <div className="glass-panel" style={styles.askCard}>
                <h3 style={styles.cardTitle}>❓ Post a Regulatory Question</h3>
                <form onSubmit={handlePostQuestion} style={styles.askForm}>
                  <textarea
                    placeholder="e.g. Can we accept investments from international (non-US) retail backers under Regulation Crowdfunding (Reg CF)?"
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    style={styles.textarea}
                    rows="3"
                    required
                  />
                  <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }}>
                    Publish Question
                  </button>
                </form>
              </div>

              {/* Feed threads */}
              <div style={styles.threadsList}>
                {qaFeed.map((q) => (
                  <div key={q.id} className="glass-panel" style={styles.threadCard}>
                    {/* Thread Header */}
                    <div style={styles.threadHeader}>
                      <div style={styles.threadAuthorAvatar}>
                        {q.author.charAt(0)}
                      </div>
                      <div>
                        <h4 style={styles.threadAuthorName}>{q.author}</h4>
                        <span style={styles.threadAuthorRole}>{q.authorRole} • Posted on {new Date(q.date).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <p style={styles.threadQuestion}>{q.question}</p>

                    {/* Answers Section */}
                    {q.answers.length > 0 && (
                      <div style={styles.answersSection}>
                        <span style={styles.answersCount}>{q.answers.length} Vetted Response(s)</span>
                        {q.answers.map((ans) => (
                          <div key={ans.id} style={styles.answerItem}>
                            <div style={styles.ansHeader}>
                              <img src={ans.avatar} alt={ans.author} style={styles.ansAvatar} />
                              <div>
                                <h5 style={styles.ansAuthor}>{ans.author}</h5>
                                <span className="badge badge-verified" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                                  Vetted Affiliate
                                </span>
                              </div>
                            </div>
                            <p style={styles.ansContent}>{ans.content}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Quick Reply Form for Vetted Affiliates */}
                    {user.role === 'Affiliate' && (
                      <div style={styles.replyTriggerRow}>
                        {activeReplyId !== q.id ? (
                          <button
                            onClick={() => {
                              setActiveReplyId(q.id);
                              setReplyText('');
                            }}
                            className="btn-secondary"
                            style={styles.replyBtn}
                          >
                            ✏ Reply as Vetted Advisor
                          </button>
                        ) : (
                          <form onSubmit={(e) => handlePostReply(e, q.id)} style={styles.replyForm}>
                            <textarea
                              placeholder="Provide your professional insight..."
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              style={styles.input}
                              rows="3"
                              required
                            />
                            <div style={styles.replyFormButtons}>
                              <button
                                type="button"
                                onClick={() => setActiveReplyId(null)}
                                className="btn-secondary"
                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="btn-primary"
                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                              >
                                Submit Advisory
                              </button>
                            </div>
                          </form>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Mini Consultant cards */}
            <div style={styles.infoCol}>
              <div className="glass-panel" style={styles.quickCard}>
                <h3 style={styles.quickCardTitle}>🔒 Why Vetted Advisory Q&A?</h3>
                <p style={styles.quickCardText}>
                  Peer Bridge connections are strictly curated. Early founders avoid expensive primary consulting fees by asking initial structural compliance questions in a shared space. 
                </p>
                <p style={styles.quickCardText}>
                  Consultants demonstrate domain authority by answering these threads, legally vetting clients for future business.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {subTab === 'resources' && (
        <div style={styles.resourcesView}>
          <div style={styles.introHeader}>
            <h2 style={styles.title}>Regulatory Content Library</h2>
            <p style={styles.sub}>Vetted legal documentation and tools shared by professional partners to establish capital compliance structures.</p>
          </div>

          <div style={styles.resourcesGrid}>
            {/* Left Main Pane: Filter and Search list */}
            <div style={styles.resourcesLeftCol}>
              <div style={styles.filterSearchRow}>
                <input
                  type="text"
                  placeholder="Search resources..."
                  value={resourceSearch}
                  onChange={(e) => setResourceSearch(e.target.value)}
                  style={styles.inputSearch}
                />
                
                <div style={styles.filterChipsRow}>
                  {['all', 'legal', 'tools', 'guides'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveResCategory(cat)}
                      style={{
                        ...styles.filterChip,
                        background: activeResCategory === cat ? 'var(--border-accent)' : 'transparent',
                        color: activeResCategory === cat ? '#ffffff' : 'var(--color-text-secondary)',
                        border: activeResCategory === cat ? '1px solid var(--border-accent)' : '1px solid var(--border-color)'
                      }}
                    >
                      {cat.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div style={styles.resourcesList}>
                {filteredResources.length === 0 ? (
                  <p style={styles.emptyText}>No guides found matching filters.</p>
                ) : (
                  filteredResources.map((res) => (
                    <div key={res.resource_id} className="glass-panel" style={styles.resCard}>
                      <div style={styles.resCardHeader}>
                        <span style={styles.resDocIcon}>{getDocIcon(res.category)}</span>
                        <div style={styles.resMeta}>
                          <span className="badge badge-verified" style={{ textTransform: 'capitalize', fontSize: '0.65rem' }}>
                            {res.category}
                          </span>
                          <h4 style={styles.resCardTitleText}>{res.title}</h4>
                          <span style={styles.resCreatedBy}>
                            Published by <strong>{res.created_by}</strong> •{' '}
                            {res.created_at ? new Date(res.created_at).toLocaleDateString() : 'Active'}
                          </span>
                        </div>
                      </div>
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-primary"
                        style={styles.resDocBtn}
                      >
                        Access Compliance Document 🔗
                      </a>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right Pane: Publisher Tool for Vetted Affiliates */}
            <div style={styles.resourcesRightCol}>
              <div className="glass-panel" style={styles.quickCard}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.cardTitle}>📢 Publish Regulatory Guide</h3>
                  {user.role === 'Affiliate' && (
                    <button
                      onClick={() => setShowResourceForm(!showResourceForm)}
                      className="btn-secondary"
                      style={styles.editBtn}
                    >
                      {showResourceForm ? 'Cancel' : 'Publish'}
                    </button>
                  )}
                </div>
                
                <p style={styles.quickCardText}>
                  Are you a vetted securities advisor? Publish Form C articles, SPV tools, or Reg D templates to establish client trust in the ecosystem.
                </p>

                {user.role !== 'Affiliate' ? (
                  <div style={styles.complianceBadgeLock}>
                    🔒 Requires Vetted Affiliate Node Credentials
                  </div>
                ) : (
                  showResourceForm && (
                    <form onSubmit={handlePublishResource} style={styles.resPublishForm}>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Guide/Resource Title</label>
                        <input
                          type="text"
                          placeholder="e.g. Reg D Rule 506(c) General Solicitation Manual"
                          value={resTitle}
                          onChange={(e) => setResTitle(e.target.value)}
                          style={styles.smallInput}
                          required
                        />
                      </div>

                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Target Category</label>
                        <select
                          value={resCategory}
                          onChange={(e) => setResCategory(e.target.value)}
                          style={styles.select}
                        >
                          <option value="legal">Legal/Regulatory Filing</option>
                          <option value="tools">Analytical spreadsheet / Tool</option>
                          <option value="guides">Bylaw guides & structuring</option>
                          <option value="education">Educational overview</option>
                        </select>
                      </div>

                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Resource Link / PDF S3 URL</label>
                        <input
                          type="text"
                          placeholder="https://..."
                          value={resUrl}
                          onChange={(e) => setResUrl(e.target.value)}
                          style={styles.smallInput}
                          required
                        />
                      </div>

                      <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                        Publish & Notify Ecosystem
                      </button>
                    </form>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {subTab === 'directory' && (
        <div style={styles.directoryView}>
          <div style={styles.introHeader}>
            <h2 style={styles.title}>Vetted Compliance & Legal Advisors</h2>
            <p style={styles.sub}>Link directly with accredited service providers. Schedule regulatory structuring and tax audit audits.</p>
          </div>

          <div style={styles.affiliateGrid}>
            {affiliates.map((aff) => (
              <div key={aff.id} className="glass-panel" style={styles.affCard}>
                <div style={styles.affCardHeader}>
                  <img src={aff.avatar} alt={aff.name} style={styles.affCardAvatar} />
                  <div>
                    <h3 style={styles.affName}>{aff.name}</h3>
                    <span style={styles.affTitle}>{aff.title}</span>
                    <p style={styles.affFirm}>{aff.firm}</p>
                  </div>
                </div>

                <div style={styles.affSpecialtySection}>
                  <span style={styles.specialtyBadge}>{aff.specialty}</span>
                </div>

                <p style={styles.affBio}>{aff.bio}</p>

                <div style={styles.affFooter}>
                  <div style={styles.ratingRow}>
                    <span style={styles.star}>★</span>
                    <strong>{aff.rating}</strong>
                    <span style={styles.reviews}>({aff.reviews} Vouched reviews)</span>
                  </div>
                  <button className="btn-primary" style={styles.contactBtn}>
                    Request Consultation
                  </button>
                </div>
              </div>
            ))}
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
    gap: '2.5rem',
  },
  navRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '1rem',
  },
  tabButtons: {
    display: 'flex',
    gap: '0.5rem',
  },
  tabActive: {
    background: 'var(--bg-primary)',
    color: 'var(--color-text-primary)',
    border: '1px solid var(--border-color)',
    padding: '0.6rem 1.25rem',
    borderRadius: '6px',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  tabInactive: {
    background: 'transparent',
    color: 'var(--color-text-secondary)',
    border: '1px solid transparent',
    padding: '0.6rem 1.25rem',
    borderRadius: '6px',
    fontWeight: '500',
    cursor: 'pointer',
    fontSize: '0.85rem',
    transition: 'all 0.2s ease',
    ':hover': {
      color: 'var(--color-text-primary)'
    }
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
  title: {
    fontSize: '1.75rem',
    fontWeight: '800',
  },
  sub: {
    fontSize: '0.9rem',
    color: 'var(--color-text-secondary)',
    marginTop: '0.25rem',
  },
  qaView: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  qaGrid: {
    display: 'grid',
    gridTemplateColumns: '1.5fr 1fr',
    gap: '2rem',
    flexWrap: 'wrap',
  },
  qaThreadsCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  askCard: {
    padding: '1.75rem',
  },
  cardTitle: {
    fontSize: '1.15rem',
    fontWeight: '700',
    marginBottom: '1rem',
  },
  askForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  textarea: {
    width: '100%',
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    padding: '0.75rem 1rem',
    color: 'var(--color-text-primary)',
    fontSize: '0.95rem',
    outline: 'none',
    resize: 'none',
    fontFamily: 'inherit',
  },
  threadsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  threadCard: {
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  threadHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  threadAuthorAvatar: {
    width: '42px',
    height: '42px',
    borderRadius: '8px',
    background: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.25rem',
    fontWeight: '800',
    color: '#000000',
  },
  threadAuthorName: {
    fontSize: '1rem',
    fontWeight: '700',
  },
  threadAuthorRole: {
    display: 'block',
    fontSize: '0.75rem',
    color: 'var(--color-text-muted)',
    marginTop: '0.1rem',
  },
  threadQuestion: {
    fontSize: '0.95rem',
    color: 'var(--color-text-secondary)',
    lineHeight: '1.5',
    background: 'var(--bg-primary)',
    padding: '1rem',
    borderRadius: '6px',
    borderLeft: '2.5px solid var(--border-accent)',
  },
  answersSection: {
    marginTop: '0.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '1.25rem',
  },
  answersCount: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: 'var(--color-text-primary)',
    textTransform: 'uppercase',
  },
  answerItem: {
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  ansHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  ansAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  ansAuthor: {
    fontSize: '0.85rem',
    fontWeight: '700',
  },
  ansContent: {
    fontSize: '0.88rem',
    color: 'var(--color-text-secondary)',
    lineHeight: '1.5',
  },
  replyTriggerRow: {
    marginTop: '0.5rem',
  },
  replyBtn: {
    padding: '0.5rem 1rem',
    fontSize: '0.8rem',
  },
  replyForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.85rem',
  },
  input: {
    width: '100%',
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    padding: '0.75rem 1rem',
    color: 'var(--color-text-primary)',
    fontSize: '0.9rem',
    outline: 'none',
    fontFamily: 'inherit',
    resize: 'none',
  },
  replyFormButtons: {
    display: 'flex',
    gap: '0.75rem',
    alignSelf: 'flex-end',
  },
  infoCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  quickCard: {
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    height: 'fit-content',
  },
  quickCardTitle: {
    fontSize: '1.1rem',
    fontWeight: '800',
  },
  quickCardText: {
    fontSize: '0.85rem',
    color: 'var(--color-text-secondary)',
    lineHeight: '1.5',
  },
  directoryView: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2.5rem',
  },
  affiliateGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '2rem',
  },
  affCard: {
    padding: '2.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  affCardHeader: {
    display: 'flex',
    gap: '1.25rem',
    alignItems: 'center',
  },
  affCardAvatar: {
    width: '64px',
    height: '64px',
    borderRadius: '8px',
    objectFit: 'cover',
    boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
    border: '1px solid var(--border-color)',
  },
  affName: {
    fontSize: '1.25rem',
    fontWeight: '700',
  },
  affTitle: {
    display: 'block',
    fontSize: '0.8rem',
    color: 'var(--color-text-primary)',
    marginTop: '0.15rem',
    fontWeight: '600',
  },
  affFirm: {
    fontSize: '0.8rem',
    color: 'var(--color-text-muted)',
    marginTop: '0.1rem',
  },
  affSpecialtySection: {
    display: 'flex',
  },
  specialtyBadge: {
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    color: 'var(--color-text-primary)',
    padding: '0.3rem 0.65rem',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: '600',
  },
  affBio: {
    fontSize: '0.88rem',
    color: 'var(--color-text-secondary)',
    lineHeight: '1.5',
    height: '66px',
    overflow: 'hidden',
  },
  affFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '1.25rem',
    marginTop: '0.5rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  ratingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    fontSize: '0.85rem',
  },
  star: {
    color: 'var(--color-text-primary)',
    fontSize: '1.1rem',
  },
  reviews: {
    color: 'var(--color-text-muted)',
    fontSize: '0.75rem',
  },
  contactBtn: {
    padding: '0.5rem 1rem',
    fontSize: '0.8rem',
  },
  resourcesView: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  resourcesGrid: {
    display: 'grid',
    gridTemplateColumns: '1.5fr 1fr',
    gap: '2rem',
    flexWrap: 'wrap',
  },
  resourcesLeftCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  resourcesRightCol: {
    display: 'flex',
    flexDirection: 'column',
  },
  filterSearchRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  inputSearch: {
    width: '100%',
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    padding: '0.75rem 1rem',
    color: 'var(--color-text-primary)',
    fontSize: '0.9rem',
    outline: 'none',
  },
  filterChipsRow: {
    display: 'flex',
    gap: '0.5rem',
  },
  filterChip: {
    padding: '0.35rem 0.75rem',
    fontSize: '0.75rem',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  resourcesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  resCard: {
    padding: '1.75rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1.5rem',
    flexWrap: 'wrap',
  },
  resCardHeader: {
    display: 'flex',
    gap: '1.25rem',
    alignItems: 'flex-start',
    flex: '1',
  },
  resDocIcon: {
    fontSize: '1.75rem',
    padding: '0.5rem',
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
  },
  resMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
  },
  resCardTitleText: {
    fontSize: '1.05rem',
    fontWeight: '700',
    color: 'var(--color-text-primary)',
  },
  resCreatedBy: {
    fontSize: '0.75rem',
    color: 'var(--color-text-muted)',
  },
  resDocBtn: {
    padding: '0.5rem 1rem',
    fontSize: '0.8rem',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: '0.5rem',
  },
  editBtn: {
    padding: '0.3rem 0.65rem',
    fontSize: '0.72rem',
  },
  complianceBadgeLock: {
    background: 'var(--bg-primary)',
    border: '1px dashed var(--border-color)',
    color: 'var(--color-text-muted)',
    padding: '1rem',
    borderRadius: '6px',
    fontSize: '0.78rem',
    fontWeight: '700',
    textAlign: 'center',
    marginTop: '0.5rem',
  },
  resPublishForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginTop: '0.5rem',
    width: '100%',
  },
  smallInput: {
    width: '100%',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    padding: '0.65rem 0.85rem',
    color: 'var(--color-text-primary)',
    fontSize: '0.85rem',
    outline: 'none',
  },
  select: {
    width: '100%',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    padding: '0.65rem 0.85rem',
    color: 'var(--color-text-primary)',
    fontSize: '0.85rem',
    outline: 'none',
    cursor: 'pointer',
  }
};
