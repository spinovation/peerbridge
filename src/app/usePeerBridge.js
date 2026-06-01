'use client';

import { useState, useEffect } from 'react';
import { db, isFirebaseConfigured } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// Initial Mock Datasets representing Database Tables

const INITIAL_CUSTOMERS = {
  customer_id: 'db-cust-7718',
  email: 'sarah@skynet-rebel.io',
  first_name: 'Sarah',
  last_name: 'Connor',
  phone: '+1 (555) 901-8821',
  role_flags: ['Investor'], // Multi-role flag list: Investor, Entrepreneur, Affiliate, Sales Admin
  status: 'active', // active, inactive, suspended, verified
  isOnboarded: true,
  ssn: '',
  created_at: '2026-01-15T08:30:00Z',
  updated_at: '2026-05-29T08:00:00Z'
};

const INITIAL_BASIC_PROFILE = {
  customer_id: 'db-cust-7718',
  dob: '1995-11-10',
  gender: 'Female',
  nationality: 'United States',
  address: '100 Cyberdyne Way, Los Angeles, CA 90001',
  profile_picture_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&q=80',
  bio: 'Active angel investor focusing on climate technology and deep med-tech initiatives. Ex-Director at CleanFlow Venture Fund.'
};

const INITIAL_PROFESSIONAL_PROFILE = {
  customer_id: 'db-cust-7718',
  headline: 'Venture Capital Director & CleanTech Advisor',
  summary: 'Over 12 years of startup sourcing, direct seed placements, and carbon footprint reduction planning under SEC Regulation guidelines.',
  experience: [
    {
      title: 'Venture Placement Director',
      company: 'CleanFlow Capital Partners',
      start_date: '2021-03',
      end_date: null,
      current: true,
      description: 'Led diligence for carbon capture and bio-algae scaleups. Closed $12M in seed allocations.'
    },
    {
      title: 'Senior Business Analyst',
      company: 'Apex Solutions',
      start_date: '2016-08',
      end_date: '2021-02',
      current: false,
      description: 'Consulted early stage founders on cap table structures, business stage forecasting, and investor match mapping.'
    },
    {
      title: 'Fintech Compliance Officer',
      company: 'StartEngine Ventures',
      start_date: '2013-05',
      end_date: '2016-07',
      current: false,
      description: 'Supervised compliance check sweeps for exempt Regulation Crowdfunding (Reg CF) crowdfunding portals.'
    },
    {
      title: 'Cap Table Dilution Analyst',
      company: 'EquityNet LLC',
      start_date: '2010-09',
      end_date: '2013-04',
      current: false,
      description: 'Assisted tech seed founders in constructing clean cap table dilution schedules, convertible notes, and balance sheets.'
    }
  ],
  education: [
    {
      degree: 'Master of Business Administration (MBA)',
      institution: 'Stanford Graduate School of Business',
      year: 2015,
      field: 'Fintech & Sustainable Development'
    }
  ],
  skills: ['Strategic Fundraising', 'Reg CF Compliance', 'Cap Table Valuation', 'Biometrics Diligence'],
  certifications: ['Chartered Financial Analyst (CFA)', 'Certified P2P Securities Auditor'],
  linkedin_url: 'https://peerbridge.ai/directory/sarah-connor'
};

const INITIAL_ENTREPRENEUR_PROFILE = {
  customer_id: 'db-cust-7718',
  company_name: 'EcoSphere Solutions',
  business_stage: 'revenue', // idea, prototype, revenue, scaling, startup
  industry: 'CleanTech',
  funding_goal: 250000.00,
  valuation: 6250000.00,
  pitch_deck_url: 'https://peerbridge-vault.s3.amazonaws.com/EcoSphere_Pitch_Deck.pdf',
  company_summary: 'EcoSphere is developing closed-loop bioreactors that capture carbon dioxide up to 400x faster than traditional trees. Our photo-bioreactor sleeve transforms CO2 exhaust into organic biomass agricultural fertilizer.',
  team: [
    {
      name: 'Sarah Connor',
      role: 'CEO & Co-Founder',
      linkedin: 'https://peerbridge.ai/directory/sarah-connor',
      bio: 'Ex-CleanFlow Venture director with 12+ years in CleanTech scaling.'
    },
    {
      name: 'Dr. Evelyn Chen',
      role: 'Chief Algae Geneticist',
      linkedin: 'https://peerbridge.ai/directory/evelyn-chen',
      bio: 'Stanford PhD in bio-engineered micro-algae cells.'
    }
  ]
};

const INITIAL_INVESTOR_PROFILE = {
  customer_id: 'db-cust-7718',
  investor_type: 'angel', // angel, vc, institutional, group
  investment_range: {
    min: 1000,
    max: 50000,
    currency: 'USD'
  },
  preferred_industries: ['CleanTech', 'MedTech', 'Fintech', 'AI/ML'],
  risk_appetite: 'medium', // low, medium, high
  portfolio_size: 750000.00,
  accreditation_status: true
};

const INITIAL_AFFILIATE_PROFILE = {
  customer_id: 'db-cust-7718',
  entity_type: 'individual', // individual, company
  specialty: 'Securities Law & Crowdfunding Compliance',
  firm: 'Sarah Connor Legal Services',
  rating: 5.0,
  reviews: 0,
  bio: 'Vetted securities consultant and early-stage capital advisor.'
};

const INITIAL_SETTINGS = {
  customer_id: 'db-cust-7718',
  notification_preferences: {
    email: true,
    sms: false,
    in_app: true,
    investment_alerts: true,
    document_updates: true
  },
  language: 'English',
  timezone: 'UTC-5 (EST)',
  privacy_level: 'restricted', // public, private, restricted
  theme: 'dark'
};

const DEFAULT_CAMPAIGNS = [
  {
    id: 'camp-1',
    companyName: 'EcoSphere Technologies',
    tagline: 'Revolutionizing carbon capture with bio-engineered micro-algae.',
    description: 'EcoSphere is developing closed-loop bioreactors that capture carbon dioxide up to 400x faster than traditional trees. Our patented photo-bioreactor design allows cities and industrial sites to offset their emissions locally and profitably.',
    problem: 'Traditional carbon offsetting is highly inefficient, relies on long-term forestry projects, and suffers from a lack of verifiable and immediate carbon capture metrics.',
    solution: 'We deliver self-contained, automated algae bioreactors that plug directly into HVAC exhaust systems, instantly transforming CO2 into high-grade organic biomass for agricultural fertilizers.',
    founder: 'Alex Rivera',
    target: 250000,
    raised: 125000,
    valuation: 6250000,
    sharePrice: 5.00,
    minInvestment: 500,
    investorsCount: 42,
    equityOffered: 4,
    status: 'Active',
    category: 'CleanTech',
    capTable: [
      { name: 'Alex Rivera (Founder)', percentage: 65, shares: 812500, type: 'Founder' },
      { name: 'Venture Capital Partners', percentage: 20, shares: 250000, type: 'Institutional' },
      { name: 'Seed Investors', percentage: 13, shares: 162500, type: 'Investor' },
      { name: 'PeerBridge Crowd', percentage: 2, shares: 25000, type: 'Crowd' }
    ]
  },
  {
    id: 'camp-2',
    companyName: 'Aether Neuro',
    tagline: 'Next-generation brain-computer interfaces for restorative motor therapy.',
    description: 'Aether Neuro builds non-invasive, high-density EMG/EEG arm sleeves powered by local edge AI, enabling stroke survivors and amputees to control robotic prostheses and digital interfaces with sub-millisecond precision.',
    problem: 'Surgical neural implants are high-risk, expensive, and inaccessible to 99% of patients, while current physical therapy sleeves are inaccurate and lack intuitive feedback loops.',
    solution: 'A fully non-invasive neural sleeve paired with a game-like rehab application that uses deep learning to decode intent and guide neuro-muscular regeneration.',
    founder: 'Dr. Evelyn Chen',
    target: 500000,
    raised: 375000,
    valuation: 12500000,
    sharePrice: 10.00,
    minInvestment: 1000,
    investorsCount: 88,
    equityOffered: 4,
    status: 'Active',
    category: 'MedTech',
    capTable: [
      { name: 'Dr. Evelyn Chen (Founder)', percentage: 55, shares: 687500, type: 'Founder' },
      { name: 'BioTech Innovators Fund', percentage: 25, shares: 312500, type: 'Institutional' },
      { name: 'Angel Network', percentage: 17, shares: 212500, type: 'Investor' },
      { name: 'PeerBridge Crowd', percentage: 3, shares: 37500, type: 'Crowd' }
    ]
  }
];

const DEFAULT_AFFILIATES = [
  {
    id: 'aff-1',
    name: 'Sarah Jenkins, Esq.',
    title: 'Senior Partner',
    firm: 'Jenkins & Partners LLP',
    specialty: 'Securities Law & Crowdfunding Compliance',
    bio: 'Over 15 years representing startups in Regulation Crowdfunding (Reg CF), Reg A+, and Regulation D Offerings. Vetted SEC filings advisor.',
    rating: 4.9,
    reviews: 38,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=faces&q=80'
  },
  {
    id: 'aff-2',
    name: 'Marcus Vance, CPA',
    title: 'Founder & Principal',
    firm: 'Vance Advisory Group',
    specialty: 'Fintech Accounting & Startup Tax Compliance',
    bio: 'Specialist in early-stage cap table valuations, tax deferrals, 1099 compilation, and high-growth tax structuring for retail P2P platforms.',
    rating: 4.8,
    reviews: 29,
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=faces&q=80'
  }
];

const DEFAULT_QA = [
  {
    id: 'qa-1',
    author: 'Alex Rivera',
    authorRole: 'Entrepreneur',
    question: 'What is the most cost-effective way to structure a Crowd SPV under standard Reg CF rules so that we do not end up with 500+ direct lines on our primary cap table?',
    date: '2026-05-28T14:22:00Z',
    answers: [
      {
        id: 'ans-1',
        author: 'Sarah Jenkins, Esq.',
        authorRole: 'Affiliate',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&h=80&fit=crop&crop=faces&q=80',
        content: 'Under SEC rules, launching a Crowd SPV (Special Purpose Vehicle) is highly recommended. The SPV operates as a single investor of record on your primary cap table, which aggregates all retail investors. You write one line on your master cap table. Keep in mind, the SPV must be a co-issuer with the operating company and must file a joint Form C. We can draft these SPV structures for you.',
        date: '2026-05-28T16:45:00Z'
      }
    ]
  }
];

const DEFAULT_INVITES = [
  { code: 'PEER-BRIDGE-2026', createdBy: 'System', usedCount: 1, maxUses: 999, logs: ['System Initialized'] },
  { code: 'INV-DEMO-7721', createdBy: 'Admin', usedCount: 0, maxUses: 1, logs: [] }
];

const INITIAL_NOTIFICATIONS = [
  {
    notification_id: 'notif-init-1',
    customer_id: 'db-cust-7718',
    message: 'Compliance: Offering round Form C successfully registered with the SEC.',
    type: 'investment',
    read_status: false,
    created_at: '2026-05-30T18:50:00Z'
  },
  {
    notification_id: 'notif-init-2',
    customer_id: 'db-cust-7718',
    message: 'Vetting: Ecosystem biometrics verification complete. 2-Factor Auth enabled.',
    type: 'system',
    read_status: false,
    created_at: '2026-05-30T08:30:00Z'
  },
  {
    notification_id: 'notif-init-3',
    customer_id: 'db-cust-7718',
    message: 'Security: Connection node invitation request accepted by Marcus Vance.',
    type: 'connection',
    read_status: false,
    created_at: '2026-05-29T14:20:00Z'
  }
];

const INITIAL_DOCUMENTATION = [
  { doc_id: 'doc-w9', customer_id: 'db-cust-7718', doc_type: 'tax_document', file_url: 'https://pb-vault.s3.amazonaws.com/IRS_Form_W9.pdf', uploaded_at: '2026-05-20T10:00:00Z', verified: true },
  { doc_id: 'doc-sub', customer_id: 'db-cust-7718', doc_type: 'business_plan', file_url: 'https://pb-vault.s3.amazonaws.com/PB_Sub_Agreement.pdf', uploaded_at: '2026-05-21T11:45:00Z', verified: true }
];

const INITIAL_RESOURCES = [
  { resource_id: 'res-1', title: 'SEC Regulation Crowdfunding (Reg CF) - Complete Form C Guidelines', category: 'legal', url: 'https://www.sec.gov/education/smallbusiness/exemptofferings/regcf', created_by: 'Sarah Connor', created_at: '2026-05-10T09:00:00Z' },
  { resource_id: 'res-2', title: 'Startup Cap Table Spreadsheet Template & Dilution Calculator', category: 'tools', url: 'https://pb-vault.s3.amazonaws.com/PeerBridge_CapTable_Template.xlsx', created_by: 'Sarah Connor', created_at: '2026-05-12T10:30:00Z' },
  { resource_id: 'res-3', title: 'Understanding Crowd SPVs under SEC modern 2021 amendments', category: 'guides', url: 'https://www.sec.gov/rules/final/2020/33-10884.pdf', created_by: 'Sarah Connor', created_at: '2026-05-15T11:00:00Z' }
];

const INITIAL_DIRECTORY = [
  {
    customer_id: 'dir-cust-marcus',
    email: 'marcus@vancegroup.ai',
    first_name: 'Marcus',
    last_name: 'Vance',
    phone: '+1 (555) 902-8812',
    role_flags: ['Investor', 'Entrepreneur', 'Affiliate'],
    status: 'verified',
    isOnboarded: true,
    ssn: 'XXX-XX-3042',
    basicProfile: {
      dob: '1980-12-02',
      nationality: 'United States',
      address: '10 Capital Way, Charlotte, NC 28202',
      profile_picture_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&q=80',
      bio: 'Principal Fintech CPA & Venture General Partner. Sourcing, auditing, and seeding high-growth alternative capital tools.'
    },
    professionalProfile: {
      headline: 'Principal Partner at Vance Advisory & Carbon Seed Capital',
      summary: 'Over 18 years structured auditing for venture syndicates and co-issuing exempt Crowd SPV compliance mechanisms.',
      experience: [
        { title: 'Principal Founder', company: 'Vance Advisory Group', start_date: '2018-09', end_date: null, current: true, description: 'Managing cap table valuations, tax deferrals, and regulatory filings for retail crowdfunding portals.' },
        { title: 'Tax & Audit Partner', company: 'Ernst & Young LLP', start_date: '2008-05', end_date: '2018-08', current: false, description: 'Directed fintech regulatory diligence audits. Guided 30+ domestic placements.' }
      ],
      education: [
        { degree: 'Master of Business Administration (MBA) in Finance', institution: 'Wharton School of the University of Pennsylvania', year: 2007 }
      ],
      skills: ['Venture Cap Tables', 'Joint Form C SPVs', 'SEC Compliance Vetting', 'P2P Accounting'],
      certifications: ['Certified Public Accountant (CPA)', 'Admitted to SEC Auditor Registry']
    },
    entrepreneurProfile: {
      company_name: 'Vance Advisory Group',
      business_stage: 'revenue',
      industry: 'Fintech',
      funding_goal: 300000.00,
      valuation: 8000000.00,
      pitch_deck_url: 'https://pb-vault.s3.amazonaws.com/VanceGroup_Deck.pdf',
      company_summary: 'Vance Advisory Group offers turn-key compliance software and structured SPV management for modern retail funding portals, shrinking SEC audit costs by 70% using automation.',
      team: [
        { name: 'Marcus Vance', role: 'CEO & Founder', linkedin: '', bio: 'Ex-EY Audit Partner.' }
      ]
    },
    investorProfile: {
      investor_type: 'vc',
      investment_range: { min: 10000, max: 100000, currency: 'USD' },
      preferred_industries: ['Fintech', 'SaaS'],
      risk_appetite: 'medium',
      accreditation_status: true
    },
    affiliateProfile: {
      entity_type: 'company',
      specialty: 'Fintech Accounting & Startup Valuation',
      firm: 'Vance Advisory Group',
      rating: 4.9,
      reviews: 42,
      bio: 'Helping startup founders calculate dilution tables, prepare clean Balance Sheets for SEC review, and automate annual tax reporting.'
    }
  },
  {
    customer_id: 'dir-cust-elena',
    email: 'elena@rostova.ai',
    first_name: 'Elena',
    last_name: 'Rostova',
    phone: '+1 (555) 773-1088',
    role_flags: ['Investor', 'Entrepreneur'],
    status: 'active',
    isOnboarded: true,
    ssn: '', // Email vetted only - NO SSN!
    basicProfile: {
      dob: '1995-03-14',
      nationality: 'Russian Federation',
      address: '', // Email vetted only - NO Address!
      profile_picture_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&q=80',
      bio: 'Active angel investor and entrepreneur backing generative AI startups. Sourcing seed allocations.'
    },
    professionalProfile: {
      headline: 'Founder of NeuroWeb AI & Generative Investor',
      summary: 'Exploring early venture models for multi-agent LLM systems and distributed intelligence computing.',
      experience: [], // Email vetted only
      education: []  // Email vetted only
    },
    entrepreneurProfile: {
      company_name: 'NeuroWeb AI',
      business_stage: 'prototype',
      industry: 'SaaS',
      funding_goal: 500000.00,
      valuation: 5000000.00,
      pitch_deck_url: '',
      company_summary: 'NeuroWeb AI is engineering self-assembling software agents that code and deploy entire web applications from plain English prompts in under 60 seconds.',
      team: [
        { name: 'Elena Rostova', role: 'CEO & Founder', linkedin: '', bio: 'LLM researcher.' }
      ]
    },
    investorProfile: {
      investor_type: 'angel',
      investment_range: { min: 1000, max: 25000, currency: 'USD' },
      preferred_industries: ['AI/ML', 'SaaS'],
      risk_appetite: 'high',
      accreditation_status: false // Email vetted only - unaccredited
    }
  },
  {
    customer_id: 'dir-cust-devon',
    email: 'devon@auroratech.io',
    first_name: 'Devon',
    last_name: 'Lane',
    phone: '+1 (555) 203-4889',
    role_flags: ['Investor', 'Entrepreneur'],
    status: 'verified',
    isOnboarded: true,
    ssn: 'XXX-XX-5561',
    basicProfile: {
      dob: '1987-07-19',
      nationality: 'United States',
      address: '90 Aurora Bay, Seattle, WA 98101',
      profile_picture_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&q=80',
      bio: 'Self-taught hardware hacker, drop-out, and deep tech founder. Diluting my cap table for clean energy hardware scaling.'
    },
    professionalProfile: {
      headline: 'Founder & CEO of Aurora Energy Systems',
      summary: '12+ years building specialized solid-state electrolyte battery components and residential micro-grid hubs.',
      experience: [
        { title: 'Chief Hardware Architect & Founder', company: 'Aurora Energy Systems', start_date: '2019-01', end_date: null, current: true, description: 'Developing lithium-metal solid state batteries. Secured $1.5M in Series Seed from accredited syndicates.' }
      ],
      education: [], // Drop-out!
      skills: ['Solid-state Batteries', 'Micro-grids', 'Hardware Prototyping', 'Equity Allocations'],
      certifications: ['Certified Battery Safety Specialist']
    },
    entrepreneurProfile: {
      company_name: 'Aurora Energy Systems',
      business_stage: 'revenue',
      industry: 'CleanTech',
      funding_goal: 750000.00,
      valuation: 15000000.00,
      pitch_deck_url: 'https://pb-vault.s3.amazonaws.com/Aurora_Deck.pdf',
      company_summary: 'Aurora Energy is constructing high-density solid-state batteries that deliver 3x the range of conventional EVs with a non-flammable silicon-anode substrate.',
      team: [
        { name: 'Devon Lane', role: 'CEO', linkedin: '', bio: 'Self-taught solid-state developer.' }
      ]
    },
    investorProfile: {
      investor_type: 'angel',
      investment_range: { min: 5000, max: 50000, currency: 'USD' },
      preferred_industries: ['CleanTech', 'DeepTech'],
      risk_appetite: 'high',
      accreditation_status: true
    }
  },
  {
    customer_id: 'dir-cust-clara',
    email: 'clara@hsin-law.com',
    first_name: 'Clara',
    last_name: 'Hsin',
    phone: '+1 (555) 441-2099',
    role_flags: ['Affiliate'],
    status: 'verified',
    isOnboarded: true,
    ssn: 'XXX-XX-4091',
    basicProfile: {
      dob: '1984-05-18',
      nationality: 'United States',
      address: '500 Securities Plaza, Boston, MA 02110',
      profile_picture_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&q=80',
      bio: 'Senior Securities Partner advising early stage placements, Crowd SPVs, and exempt SEC registration audits.'
    },
    professionalProfile: {
      headline: 'Securities Attorney & Compliance Affiliate',
      summary: '14+ years corporate practice counsel. Vetting investor listings and joint co-issuer Form C SPVs.',
      experience: [
        { title: 'Managing Securities Partner', company: 'Hsin & Associates LLP', start_date: '2012-01', end_date: null, current: true, description: 'Completed 60+ Reg CF audits. Structured corporate bylaws, Crowd SPVs, and exempt private rounds.' }
      ],
      education: [
        { degree: 'J.D. in Corporate & Securities Law', institution: 'Columbia Law School', year: 2008 }
      ],
      skills: ['SEC Exemptions', 'Form C Audit', 'Crowd SPV Design', 'Private Placement Vetting'],
      certifications: ['Admitted to MA State Bar', 'Admitted to Supreme Court of the United States']
    },
    investorProfile: null,
    entrepreneurProfile: null,
    affiliateProfile: {
      entity_type: 'company',
      specialty: 'Securities Law & Crowdfunding Compliance',
      firm: 'Hsin & Associates LLP',
      rating: 4.9,
      reviews: 38,
      bio: 'Full service corporate counsel representing early founders and crowdfunding portals. Specialized in filing joint co-issuer Form C SPVs.'
    }
  },
  {
    customer_id: 'dir-cust-kofi',
    email: 'kofi@helium-energy.com',
    first_name: 'Kofi',
    last_name: 'Anan',
    phone: '+1 (555) 901-0988',
    role_flags: ['Entrepreneur'],
    status: 'verified',
    isOnboarded: true,
    ssn: 'XXX-XX-1982',
    basicProfile: {
      dob: '2002-10-09',
      nationality: 'Ghana',
      address: '15 MIT Innovation Plaza, Cambridge, MA 02139',
      profile_picture_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&q=80',
      bio: 'MIT clean energy graduate and startup founder launching residential fusion hydrogen fuel cells.'
    },
    professionalProfile: {
      headline: 'Founder & CEO of Helium Energy Systems',
      summary: 'Fresh graduate dedicated to designing residential metal-hydride hydrogen fuel cartridges.',
      experience: [], // Fresh graduate - no jobs!
      education: [
        { degree: 'B.S. in Nuclear Engineering', institution: 'MIT', year: 2025 }
      ],
      skills: ['Hydrogen Storage', 'Metal-hydrides', 'Clean Energy Generation'],
      certifications: []
    },
    entrepreneurProfile: {
      company_name: 'Helium Energy',
      business_stage: 'idea',
      industry: 'CleanTech',
      funding_goal: 150000.00,
      valuation: 2000000.00,
      pitch_deck_url: '',
      company_summary: 'Helium Energy manufactures cartridge-based hydrogen storage containers that safely power home appliances for weeks with zero risk of combustion.',
      team: [
        { name: 'Kofi Anan', role: 'CEO & Founder', linkedin: '', bio: 'Nuclear Engineer.' }
      ]
    },
    investorProfile: null,
    affiliateProfile: null
  },
  {
    customer_id: 'db-cust-evelyn',
    email: 'evelyn@aetherneuro.com',
    first_name: 'Evelyn',
    last_name: 'Chen',
    phone: '+1 (555) 903-8822',
    role_flags: ['Entrepreneur'],
    status: 'verified',
    isOnboarded: true,
    ssn: 'XXX-XX-8822',
    basicProfile: {
      dob: '1991-04-12',
      nationality: 'United States',
      address: '250 Algae Way, San Jose, CA 95112',
      profile_picture_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&q=80',
      bio: 'Stanford PhD in bio-engineered micro-algae cells. Engineering next-gen carbon offset and med-tech bioreactors.'
    },
    professionalProfile: {
      headline: 'Chief Algae Geneticist & CEO at Aether Neuro',
      summary: 'Stanford PhD. Dedicated to building bio-engineered photo-bioreactor sleeve engines and non-invasive brain-computer interfaces.',
      experience: [
        { title: 'Chief Scientist', company: 'Aether Neuro', start_date: '2021-03', end_date: null, current: true, description: 'Led neural decoding algorithm design and solid state telemetry.' }
      ],
      education: [
        { degree: 'PhD in Bio-Engineering', institution: 'Stanford University', year: 2018 }
      ],
      skills: ['Neural Telemetry', 'Algae Carbon Capture', 'Reg CF Fundraising'],
      certifications: []
    },
    entrepreneurProfile: {
      company_name: 'Aether Neuro',
      business_stage: 'prototype',
      industry: 'MedTech',
      funding_goal: 500000.00,
      valuation: 12500000.00,
      pitch_deck_url: 'https://pb-vault.s3.amazonaws.com/Aether_Neuro_Deck.pdf',
      company_summary: 'Aether Neuro builds non-invasive brain-computer interfaces powered by local edge AI sleeves, enabling stroke survivors to control robotic prostheses with sub-millisecond precision.',
      team: [{ name: 'Dr. Evelyn Chen', role: 'Founder', linkedin: '', bio: 'Stanford PhD.' }]
    }
  },
  {
    customer_id: 'db-cust-jenkins',
    email: 'sarah@jenkinslegal.com',
    first_name: 'Sarah',
    last_name: 'Jenkins',
    phone: '+1 (555) 904-8833',
    role_flags: ['Affiliate'],
    status: 'verified',
    isOnboarded: true,
    ssn: 'XXX-XX-8833',
    basicProfile: {
      dob: '1979-06-25',
      nationality: 'United States',
      address: '150 Corporate Law Center, New York, NY 10005',
      profile_picture_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&q=80',
      bio: 'Vetted corporate counsel and alternative investment legal advisor.'
    },
    professionalProfile: {
      headline: 'Securities Law & Crowdfunding Compliance Partner',
      summary: 'Representing startups and crowdfunding platforms in corporate placements, Reg CF/A+/D offerings, and joint co-issuer Form C SPVs.',
      experience: [
        { title: 'Senior Partner', company: 'Jenkins & Partners LLP', start_date: '2010-05', end_date: null, current: true, description: 'Advised on 100+ private placement filings and retail crowd structures.' }
      ],
      education: [
        { degree: 'J.D. in Securities Law', institution: 'Harvard Law School', year: 2004 }
      ],
      skills: ['Securities Placement', 'Form C SPVs', 'SEC Diligence'],
      certifications: ['Admitted to NY State Bar']
    },
    affiliateProfile: {
      entity_type: 'company',
      specialty: 'Securities Law & Crowdfunding Compliance',
      firm: 'Jenkins & Partners LLP',
      rating: 4.9,
      reviews: 38,
      bio: 'Full service corporate counsel representing early founders and crowdfunding portals. Specialized in filing joint co-issuer Form C SPVs.'
    }
  }
];

export function usePeerBridge() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('landing');
  const [activeModule, setActiveModule] = useState('portfolio');
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [inspectedCustomer, setInspectedCustomer] = useState(null);
  const [targetCampaignId, setTargetCampaignId] = useState(null);
  
  // Database Tables Grayscale State
  const [customer, setCustomer] = useState(INITIAL_CUSTOMERS);
  const [basicProfile, setBasicProfile] = useState(INITIAL_BASIC_PROFILE);
  const [professionalProfile, setProfessionalProfile] = useState(INITIAL_PROFESSIONAL_PROFILE);
  const [entrepreneurProfile, setEntrepreneurProfile] = useState(INITIAL_ENTREPRENEUR_PROFILE);
  const [investorProfile, setInvestorProfile] = useState(INITIAL_INVESTOR_PROFILE);
  const [affiliateProfile, setAffiliateProfile] = useState(INITIAL_AFFILIATE_PROFILE);
  const [directory, setDirectory] = useState(INITIAL_DIRECTORY);
  const [settings, setSettings] = useState(INITIAL_SETTINGS);
  
  const [campaigns, setCampaigns] = useState(DEFAULT_CAMPAIGNS);
  const [affiliates] = useState(DEFAULT_AFFILIATES);
  const [qaFeed, setQaFeed] = useState(DEFAULT_QA);
  const [invites, setInvites] = useState(DEFAULT_INVITES);
  
  // Plaid Banking simulator
  const [walletBalance, setWalletBalance] = useState(0);
  const [connectedBank, setConnectedBank] = useState(null);
  const [transactions, setTransactions] = useState([]);
  
  // portfolio table
  const [portfolio, setPortfolio] = useState([]);
  
  // documentation table
  const [documentation, setDocumentation] = useState(INITIAL_DOCUMENTATION);
  
  // notifications table
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  
  // help_tickets table
  const [helpTickets, setHelpTickets] = useState([]);

  // resources table
  const [resources, setResources] = useState(INITIAL_RESOURCES);

  // LinkedIn profile integrations
  const [profileActiveSubTab, setProfileActiveSubTab] = useState('my-profile');
  const [directoryRoleFilter, setDirectoryRoleFilter] = useState('All');
  const [savedCampaignIds, setSavedCampaignIds] = useState(['camp-1']); // EcoSphere bookmarked by default
  const [connections, setConnections] = useState(['db-cust-evelyn', 'db-cust-jenkins']); // initially 2 connections
  const [profileViewers, setProfileViewers] = useState(61);
  const [postImpressions, setPostImpressions] = useState(320);
  const [events, setEvents] = useState([
    {
      id: 'evt-1',
      title: 'Reg D Series A Private Placement Pitch - EcoSphere Solutions',
      date: 'Tomorrow, 2:00 PM EST',
      description: 'Join CEO Sarah Connor and Chief Algae Geneticist Dr. Evelyn Chen as they detail the close-loop photo-bioreactor sleeve private placement round. Q&A to follow SEC compliance overview.',
      category: 'Deal-Flow Pitch',
      attending: false,
      attendees: 42,
    },
    {
      id: 'evt-2',
      title: 'Fintech P2P Cap Table Security Law Auditing Q&A',
      date: 'June 5, 2:00 PM EST',
      description: 'A professional legal seminar hosted by Sarah Jenkins, Esq. reviewing Regulation Crowdfunding cap table limits, ledger audit compliance, and IRS taxation checkpoints.',
      category: 'Legal Audit',
      attending: true,
      attendees: 18,
    },
    {
      id: 'evt-3',
      title: 'Ecosystem Advisory Forum: Biometrics & Vetting Milestones',
      date: 'June 12, 1:00 PM EST',
      description: 'An open forum for Advisory Forum members to discuss Reg D compliance, 4-sector verification ring structures, and investor accreditation sweeps.',
      category: 'Community Forum',
      attending: false,
      attendees: 29,
    }
  ]);

  const toggleSaveCampaign = (campId) => {
    if (savedCampaignIds.includes(campId)) {
      setSavedCampaignIds(savedCampaignIds.filter(id => id !== campId));
      addNotification('Bookmark', `Removed campaign from Saved Items.`);
    } else {
      setSavedCampaignIds([...savedCampaignIds, campId]);
      addNotification('Bookmark', `Added campaign to Saved Items.`);
    }
  };

  const toggleEventAttendance = (eventId) => {
    setEvents(events.map(evt => {
      if (evt.id === eventId) {
        const nextAttending = !evt.attending;
        return {
          ...evt,
          attending: nextAttending,
          attendees: nextAttending ? evt.attendees + 1 : evt.attendees - 1
        };
      }
      return evt;
    }));
    addNotification('Event', `Updated attendance for briefing session.`);
  };

  const toggleConnectionNode = (memberId) => {
    let nextConnections;
    if (connections.includes(memberId)) {
      nextConnections = connections.filter(id => id !== memberId);
      sync('pb_connections', nextConnections, setConnections);
      addNotification('Connection', `Removed connection node.`);
    } else {
      nextConnections = [...connections, memberId];
      sync('pb_connections', nextConnections, setConnections);
      addNotification('Connection', `Added connection node successfully.`);
    }
  };

  const writeToFirestore = async (key, val) => {
    if (!isFirebaseConfigured || !db) return;
    try {
      // Global shared directory sync
      if (key === 'pb_directory') {
        const docRef = doc(db, 'global_data', 'directory');
        await setDoc(docRef, { members: val });
        return;
      }

      if (!customer || !customer.customer_id) return;

      const collectionMap = {
        'pb_cust': 'customers',
        'pb_basic': 'basic_profiles',
        'pb_prof': 'professional_profiles',
        'pb_ent': 'entrepreneur_profiles',
        'pb_inv_prof': 'investor_profiles',
        'pb_aff_prof': 'affiliate_profiles',
        'pb_settings': 'settings',
        'pb_balance': 'balances',
        'pb_bank': 'banks',
        'pb_connections': 'connections',
        'pb_notifications': 'notifications',
        'pb_chats': 'chats',
        'pb_transactions': 'transactions',
        'pb_portfolio': 'portfolios',
        'pb_docs': 'documents'
      };

      const collectionName = collectionMap[key];
      if (collectionName) {
        const docRef = doc(db, collectionName, customer.customer_id);
        const dataToSave = typeof val === 'object' && val !== null ? val : { value: val };
        await setDoc(docRef, dataToSave);
      }
    } catch (err) {
      console.error(`Firestore save failed for ${key}:`, err);
    }
  };

  const loadUserDataFromFirestore = async (userId) => {
    if (!isFirebaseConfigured || !db || !userId) return false;
    try {
      const collectionMap = {
        'pb_cust': 'customers',
        'pb_basic': 'basic_profiles',
        'pb_prof': 'professional_profiles',
        'pb_ent': 'entrepreneur_profiles',
        'pb_inv_prof': 'investor_profiles',
        'pb_aff_prof': 'affiliate_profiles',
        'pb_settings': 'settings',
        'pb_balance': 'balances',
        'pb_bank': 'banks',
        'pb_connections': 'connections',
        'pb_notifications': 'notifications',
        'pb_transactions': 'transactions',
        'pb_portfolio': 'portfolios',
        'pb_docs': 'documents'
      };

      const settersMap = {
        'pb_cust': (data) => data && setCustomer(data),
        'pb_basic': (data) => data && setBasicProfile(data),
        'pb_prof': (data) => data && setProfessionalProfile(data),
        'pb_ent': (data) => data && setEntrepreneurProfile(data),
        'pb_inv_prof': (data) => data && setInvestorProfile(data),
        'pb_aff_prof': (data) => data && setAffiliateProfile(data),
        'pb_settings': (data) => data && setSettings(data),
        'pb_balance': (data) => data && setWalletBalance(data.value !== undefined ? data.value : data),
        'pb_bank': (data) => data && setConnectedBank(data),
        'pb_connections': (data) => {
          if (!data) return;
          const val = Array.isArray(data) ? data : (data.value && Array.isArray(data.value) ? data.value : Object.values(data));
          setConnections(Array.isArray(val) ? val : []);
        },
        'pb_notifications': (data) => {
          if (!data) return;
          const val = Array.isArray(data) ? data : (data.value && Array.isArray(data.value) ? data.value : Object.values(data));
          setNotifications(Array.isArray(val) ? val : []);
        },
        'pb_transactions': (data) => {
          if (!data) return;
          const val = Array.isArray(data) ? data : (data.value && Array.isArray(data.value) ? data.value : Object.values(data));
          setTransactions(Array.isArray(val) ? val : []);
        },
        'pb_portfolio': (data) => {
          if (!data) return;
          const val = Array.isArray(data) ? data : (data.value && Array.isArray(data.value) ? data.value : Object.values(data));
          setPortfolio(Array.isArray(val) ? val : []);
        },
        'pb_docs': (data) => {
          if (!data) return;
          const val = Array.isArray(data) ? data : (data.value && Array.isArray(data.value) ? data.value : Object.values(data));
          setDocumentation(Array.isArray(val) ? val : []);
        }
      };

      for (const [key, collectionName] of Object.entries(collectionMap)) {
        const docRef = doc(db, collectionName, userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const setter = settersMap[key];
          if (setter) {
            setter(data);
            if (typeof window !== 'undefined') {
              localStorage.setItem(key, JSON.stringify(data));
            }
          }
        }
      }
      return true;
    } catch (err) {
      console.error("Failed to load user data from Firestore:", err);
      return false;
    }
  };

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const safeParse = (key, fallback) => {
        try {
          const str = localStorage.getItem(key);
          if (!str) return fallback;
          const parsed = JSON.parse(str);
          return parsed !== null && parsed !== undefined ? parsed : fallback;
        } catch {
          return fallback;
        }
      };

      const authVal = safeParse('pb_auth', false);
      const custVal = safeParse('pb_cust', INITIAL_CUSTOMERS);
      const basicVal = safeParse('pb_basic', INITIAL_BASIC_PROFILE);
      const profVal = safeParse('pb_prof', INITIAL_PROFESSIONAL_PROFILE);
      const entVal = safeParse('pb_ent', INITIAL_ENTREPRENEUR_PROFILE);
      const invVal = safeParse('pb_inv_prof', INITIAL_INVESTOR_PROFILE);
      const affVal = safeParse('pb_aff_prof', INITIAL_AFFILIATE_PROFILE);
      const dirVal = safeParse('pb_directory', INITIAL_DIRECTORY);
      const settingsVal = safeParse('pb_settings', INITIAL_SETTINGS);
      const campaignsVal = safeParse('pb_campaigns', DEFAULT_CAMPAIGNS);
      const invitesVal = safeParse('pb_invites', DEFAULT_INVITES);
      const balanceVal = safeParse('pb_balance', 150000);
      const bankVal = safeParse('pb_bank', { institution_id: 'ins_1', name: 'Chase Bank', mask: '8821' });
      const transactionsVal = safeParse('pb_transactions', []);
      const portfolioVal = safeParse('pb_portfolio', []);
      const docsVal = safeParse('pb_docs', INITIAL_DOCUMENTATION);
      const ticketsVal = safeParse('pb_tickets', []);
      const notificationsVal = safeParse('pb_notifications', INITIAL_NOTIFICATIONS);
      const qaVal = safeParse('pb_qa', DEFAULT_QA);
      const resourcesVal = safeParse('pb_resources', INITIAL_RESOURCES);
      const connectionsVal = safeParse('pb_connections', ['db-cust-evelyn', 'db-cust-jenkins']);
      const dirFilterVal = safeParse('pb_directory_filter', 'All');

      setIsAuthenticated(authVal);
      setCustomer(custVal);
      setBasicProfile(basicVal);
      setProfessionalProfile(profVal);
      setEntrepreneurProfile(entVal);
      setInvestorProfile(invVal);
      setAffiliateProfile(affVal);
      setDirectory(dirVal);
      setSettings(settingsVal);
      setCampaigns(campaignsVal);
      setInvites(invitesVal);
      setWalletBalance(balanceVal);
      setConnectedBank(bankVal);
      setTransactions(transactionsVal);
      setPortfolio(portfolioVal);
      setDocumentation(docsVal);
      setHelpTickets(ticketsVal);
      setNotifications(notificationsVal);
      setQaFeed(qaVal);
      setResources(resourcesVal);
      setConnections(connectionsVal);
      setDirectoryRoleFilter(dirFilterVal);

      // Trigger asynchronous live Firestore data recovery to fetch most up-to-date cloud records!
      if (storedCust) {
        const parsed = JSON.parse(storedCust);
        if (parsed && parsed.customer_id && isFirebaseConfigured) {
          loadUserDataFromFirestore(parsed.customer_id);
        }
      }

      // Fetch shared global directory from Firestore (if configured)
      const fetchGlobalDirectory = async () => {
        if (isFirebaseConfigured) {
          try {
            const dirRef = doc(db, 'global_data', 'directory');
            const dirSnap = await getDoc(dirRef);
            if (dirSnap.exists()) {
              const dirData = dirSnap.data();
              if (dirData && Array.isArray(dirData.members)) {
                setDirectory(dirData.members);
                localStorage.setItem('pb_directory', JSON.stringify(dirData.members));
              }
            }
          } catch (err) {
            console.error("Failed to fetch global directory from Firestore:", err);
          }
        }
      };
      fetchGlobalDirectory();
    }
  }, []);

  // Sync utilities
  const sync = (key, val, setter) => {
    setter(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(val));
    }
    writeToFirestore(key, val);
  };

  const loginWithInvite = (code, name, email, selectedRole) => {
    const existing = invites.find(inv => inv.code.toUpperCase() === code.toUpperCase());
    if (!existing) return { success: false, error: 'Invalid invitation code. This platform is invite-only.' };
    
    // Update invite code logs
    const updatedInvites = invites.map(inv => {
      if (inv.code.toUpperCase() === code.toUpperCase()) {
        return {
          ...inv,
          usedCount: inv.usedCount + 1,
          logs: [...inv.logs, `${name} (${selectedRole}) registered on ${new Date().toLocaleDateString()}`]
        };
      }
      return inv;
    });
    sync('pb_invites', updatedInvites, setInvites);

    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0] || 'User';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Create aligned mock database profiles
    const newCustomer = {
      customer_id: `cust-${Math.floor(1000 + Math.random() * 9000)}`,
      email,
      first_name: firstName,
      last_name: lastName,
      phone: '',
      role_flags: [selectedRole],
      status: 'active',
      isOnboarded: false,
      ssn: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const newBasicProfile = {
      customer_id: newCustomer.customer_id,
      dob: '1990-01-01',
      gender: '',
      nationality: 'United States',
      address: '',
      profile_picture_url: '',
      bio: selectedRole === 'Investor' 
        ? 'Accredited member focusing on modern growth markets.'
        : selectedRole === 'Entrepreneur'
        ? 'Innovative founder scaling products for global impact.'
        : selectedRole === 'Affiliate'
        ? 'Vetted professional advisor supporting the Peer Bridge ecosystem.'
        : 'Sales operations specialist managing the Peer Bridge invite ledger.'
    };

    const newProfessionalProfile = {
      customer_id: newCustomer.customer_id,
      headline: `${selectedRole} at PeerBridge Ecosystem`,
      summary: 'Vetted platform node.',
      experience: [],
      education: [],
      skills: selectedRole === 'Investor' ? ['Portfolio Management', 'Venture Placements'] : ['Startup Scaling', 'Business Analysis'],
      certifications: [],
      linkedin_url: ''
    };

    const newEntrepreneurProfile = {
      customer_id: newCustomer.customer_id,
      company_name: '',
      business_stage: 'startup',
      industry: '',
      funding_goal: 0.00,
      valuation: 0.00,
      pitch_deck_url: '',
      company_summary: '',
      team: [{ name, role: 'Founder', linkedin: '', bio: '' }]
    };

    const newInvestorProfile = {
      customer_id: newCustomer.customer_id,
      investor_type: 'angel',
      investment_range: { min: 1000, max: 25000, currency: 'USD' },
      preferred_industries: [],
      risk_appetite: 'medium',
      portfolio_size: 0.00,
      accreditation_status: false
    };

    const newAffiliateProfile = {
      customer_id: newCustomer.customer_id,
      entity_type: 'individual',
      specialty: '',
      firm: '',
      rating: 5.0,
      reviews: 0,
      bio: ''
    };

    const newSettings = {
      customer_id: newCustomer.customer_id,
      notification_preferences: {
        email: true,
        sms: false,
        in_app: true,
        investment_alerts: true,
        document_updates: true
      },
      language: 'English',
      timezone: 'EST',
      privacy_level: 'restricted',
      theme: 'dark'
    };

    sync('pb_cust', newCustomer, setCustomer);
    sync('pb_basic', newBasicProfile, setBasicProfile);
    sync('pb_prof', newProfessionalProfile, setProfessionalProfile);
    sync('pb_ent', newEntrepreneurProfile, setEntrepreneurProfile);
    sync('pb_inv_prof', newInvestorProfile, setInvestorProfile);
    sync('pb_aff_prof', newAffiliateProfile, setAffiliateProfile);
    sync('pb_settings', newSettings, setSettings);
    
    // Construct aligned directory member item for multi-user visibility
    const newDirItem = {
      customer_id: newCustomer.customer_id,
      email: newCustomer.email,
      first_name: newCustomer.first_name,
      last_name: newCustomer.last_name,
      phone: newCustomer.phone,
      role_flags: newCustomer.role_flags,
      status: newCustomer.status,
      isOnboarded: newCustomer.isOnboarded,
      ssn: newCustomer.ssn,
      basicProfile: newBasicProfile,
      professionalProfile: newProfessionalProfile,
      entrepreneurProfile: selectedRole === 'Entrepreneur' ? newEntrepreneurProfile : null,
      investorProfile: selectedRole === 'Investor' ? newInvestorProfile : null,
      affiliateProfile: selectedRole === 'Affiliate' ? newAffiliateProfile : null
    };
    
    const updatedDir = [...directory, newDirItem];
    sync('pb_directory', updatedDir, setDirectory);
    
    sync('pb_auth', true, setIsAuthenticated);
    
    // Clear dynamic sub-tables
    sync('pb_balance', 0, setWalletBalance);
    sync('pb_bank', null, setConnectedBank);
    sync('pb_transactions', [], setTransactions);
    sync('pb_portfolio', [], setPortfolio);
    sync('pb_docs', INITIAL_DOCUMENTATION, setDocumentation);
    sync('pb_tickets', [], setHelpTickets);
    sync('pb_notifications', [], setNotifications);
    sync('pb_resources', INITIAL_RESOURCES, setResources);

    addNotification('System', 'Welcome to Peer Bridge! Please complete your document KYC checks to unlock investments.');

    return { success: true };
  };

  const loginAsDemo = () => {
    // Standard initial states for Sarah Connor
    sync('pb_cust', INITIAL_CUSTOMERS, setCustomer);
    sync('pb_basic', INITIAL_BASIC_PROFILE, setBasicProfile);
    sync('pb_prof', INITIAL_PROFESSIONAL_PROFILE, setProfessionalProfile);
    sync('pb_ent', INITIAL_ENTREPRENEUR_PROFILE, setEntrepreneurProfile);
    sync('pb_inv_prof', INITIAL_INVESTOR_PROFILE, setInvestorProfile);
    sync('pb_aff_prof', INITIAL_AFFILIATE_PROFILE, setAffiliateProfile);
    sync('pb_settings', INITIAL_SETTINGS, setSettings);
    
    // Sync directory
    if (!isFirebaseConfigured) {
      sync('pb_directory', INITIAL_DIRECTORY, setDirectory);
    } else {
      // If Firebase is configured, preserve the live directory fetched from Firestore.
      // But make sure Sarah Connor herself is in the directory so other users can see her!
      const exists = directory.find(m => m.customer_id === INITIAL_CUSTOMERS.customer_id);
      if (!exists) {
        const sarahDirItem = {
          customer_id: INITIAL_CUSTOMERS.customer_id,
          email: INITIAL_CUSTOMERS.email,
          first_name: INITIAL_CUSTOMERS.first_name,
          last_name: INITIAL_CUSTOMERS.last_name,
          phone: INITIAL_CUSTOMERS.phone,
          role_flags: INITIAL_CUSTOMERS.role_flags,
          status: INITIAL_CUSTOMERS.status,
          isOnboarded: INITIAL_CUSTOMERS.isOnboarded,
          ssn: INITIAL_CUSTOMERS.ssn,
          basicProfile: INITIAL_BASIC_PROFILE,
          professionalProfile: INITIAL_PROFESSIONAL_PROFILE,
          entrepreneurProfile: INITIAL_ENTREPRENEUR_PROFILE,
          investorProfile: INITIAL_INVESTOR_PROFILE,
          affiliateProfile: INITIAL_AFFILIATE_PROFILE
        };
        const updatedDir = [sarahDirItem, ...directory];
        sync('pb_directory', updatedDir, setDirectory);
      }
    }
    
    // Reset auxiliary states
    sync('pb_balance', 150000, setWalletBalance); // default balance for demo
    sync('pb_bank', { institution_id: 'ins_1', name: 'Chase Bank', mask: '8821' }, setConnectedBank);
    sync('pb_transactions', [], setTransactions);
    sync('pb_portfolio', [], setPortfolio);
    sync('pb_docs', INITIAL_DOCUMENTATION, setDocumentation);
    sync('pb_tickets', [], setHelpTickets);
    sync('pb_notifications', [], setNotifications);
    sync('pb_resources', INITIAL_RESOURCES, setResources);

    sync('pb_auth', true, setIsAuthenticated);
    setActiveTab('dashboard');
    return { success: true };
  };

  const loginWithCredentials = (email, password) => {
    if (!email || !password) {
      return { success: false, error: 'Please enter both email and password.' };
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if it is Sarah Connor's default profile
    if (cleanEmail === INITIAL_CUSTOMERS.email.toLowerCase()) {
      if (password !== 'password123') {
        return { success: false, error: 'Incorrect password for Sarah Connor. Hint: password123' };
      }
      sync('pb_cust', INITIAL_CUSTOMERS, setCustomer);
      sync('pb_basic', INITIAL_BASIC_PROFILE, setBasicProfile);
      sync('pb_prof', INITIAL_PROFESSIONAL_PROFILE, setProfessionalProfile);
      sync('pb_ent', INITIAL_ENTREPRENEUR_PROFILE, setEntrepreneurProfile);
      sync('pb_inv_prof', INITIAL_INVESTOR_PROFILE, setInvestorProfile);
      sync('pb_aff_prof', INITIAL_AFFILIATE_PROFILE, setAffiliateProfile);
      sync('pb_settings', INITIAL_SETTINGS, setSettings);
      
      // Ensure Sarah Connor is in the directory
      if (isFirebaseConfigured) {
        const exists = directory.find(m => m.customer_id === INITIAL_CUSTOMERS.customer_id);
        if (!exists) {
          const sarahDirItem = {
            customer_id: INITIAL_CUSTOMERS.customer_id,
            email: INITIAL_CUSTOMERS.email,
            first_name: INITIAL_CUSTOMERS.first_name,
            last_name: INITIAL_CUSTOMERS.last_name,
            phone: INITIAL_CUSTOMERS.phone,
            role_flags: INITIAL_CUSTOMERS.role_flags,
            status: INITIAL_CUSTOMERS.status,
            isOnboarded: INITIAL_CUSTOMERS.isOnboarded,
            ssn: INITIAL_CUSTOMERS.ssn,
            basicProfile: INITIAL_BASIC_PROFILE,
            professionalProfile: INITIAL_PROFESSIONAL_PROFILE,
            entrepreneurProfile: INITIAL_ENTREPRENEUR_PROFILE,
            investorProfile: INITIAL_INVESTOR_PROFILE,
            affiliateProfile: INITIAL_AFFILIATE_PROFILE
          };
          const updatedDir = [sarahDirItem, ...directory];
          sync('pb_directory', updatedDir, setDirectory);
        } else {
          sync('pb_directory', directory, setDirectory);
        }
      } else {
        sync('pb_directory', directory, setDirectory);
      }
      
      sync('pb_balance', 150000, setWalletBalance);
      sync('pb_bank', { institution_id: 'ins_1', name: 'Chase Bank', mask: '8821' }, setConnectedBank);
      sync('pb_auth', true, setIsAuthenticated);
      setActiveTab('dashboard');
      return { success: true };
    }

    // Check other mock members in directory
    const member = directory.find(m => m.email.toLowerCase() === cleanEmail);
    if (!member) {
      return { success: false, error: 'Member not found in invitation registry. Register first!' };
    }

    if (password !== 'password123') {
      return { success: false, error: 'Incorrect credentials. Hint: use password123' };
    }

    const coreCustomer = {
      customer_id: member.customer_id,
      email: member.email,
      first_name: member.first_name,
      last_name: member.last_name,
      phone: member.phone || '',
      role_flags: member.role_flags || [],
      status: member.status || 'active',
      isOnboarded: member.isOnboarded !== undefined ? member.isOnboarded : true,
      ssn: member.ssn || '',
      created_at: member.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Sync state tables
    sync('pb_cust', coreCustomer, setCustomer);
    sync('pb_basic', member.basicProfile || {}, setBasicProfile);
    sync('pb_prof', member.professionalProfile || {}, setProfessionalProfile);
    sync('pb_ent', member.entrepreneurProfile || {}, setEntrepreneurProfile);
    sync('pb_inv_prof', member.investorProfile || {}, setInvestorProfile);
    sync('pb_aff_prof', member.affiliateProfile || {}, setAffiliateProfile);
    
    // Set realistic balances/banks based on roles
    const balance = member.role_flags.includes('Investor') ? 250000 : 15000;
    sync('pb_balance', balance, setWalletBalance);
    sync('pb_bank', member.role_flags.includes('Investor') ? { institution_id: 'ins_1', name: 'Chase Bank', mask: '8821' } : null, setConnectedBank);

    sync('pb_auth', true, setIsAuthenticated);
    setActiveTab('dashboard');
    return { success: true };
  };

  const logout = () => {
    setIsAuthenticated(false);
    setActiveTab('landing');
    setActiveModule('portfolio'); // Reset active module memory back to home screen
    if (typeof window !== 'undefined') {
      localStorage.removeItem('pb_auth');
    }
  };

  // Helper to update the active user's details inside the shared directory
  const updateDirectoryItem = (updatedCust, updatedBasic, updatedProf, updatedEnt, updatedInv, updatedAff) => {
    if (!customer) return;
    const updatedDir = directory.map(member => {
      if (member.customer_id === customer.customer_id) {
        return {
          ...member,
          first_name: updatedCust?.first_name || member.first_name,
          last_name: updatedCust?.last_name || member.last_name,
          email: updatedCust?.email || member.email,
          phone: updatedCust?.phone || member.phone,
          status: updatedCust?.status || member.status,
          ssn: updatedCust?.ssn || member.ssn,
          basicProfile: { ...member.basicProfile, ...updatedBasic },
          professionalProfile: { ...member.professionalProfile, ...updatedProf },
          entrepreneurProfile: { ...member.entrepreneurProfile, ...updatedEnt },
          investorProfile: { ...member.investorProfile, ...updatedInv },
          affiliateProfile: { ...member.affiliateProfile, ...updatedAff }
        };
      }
      return member;
    });
    sync('pb_directory', updatedDir, setDirectory);
  };

  // Profile Mutation
  const updateProfiles = (updatedCust, updatedBasic, updatedProf) => {
    if (updatedCust) sync('pb_cust', { ...customer, ...updatedCust }, setCustomer);
    if (updatedBasic) sync('pb_basic', { ...basicProfile, ...updatedBasic }, setBasicProfile);
    if (updatedProf) sync('pb_prof', { ...professionalProfile, ...updatedProf }, setProfessionalProfile);
    updateDirectoryItem(updatedCust, updatedBasic, updatedProf);
  };

  const updateEntrepreneurProfile = (updatedEnt) => {
    sync('pb_ent', { ...entrepreneurProfile, ...updatedEnt }, setEntrepreneurProfile);
    updateDirectoryItem(null, null, null, updatedEnt);
  };

  const updateInvestorProfile = (updatedInv) => {
    sync('pb_inv_prof', { ...investorProfile, ...updatedInv }, setInvestorProfile);
    updateDirectoryItem(null, null, null, null, updatedInv);
  };

  const updateAffiliateProfile = (updatedAff) => {
    sync('pb_aff_prof', { ...affiliateProfile, ...updatedAff }, setAffiliateProfile);
    updateDirectoryItem(null, null, null, null, null, updatedAff);
  };

  const updateSettings = (updatedSets) => {
    sync('pb_settings', { ...settings, ...updatedSets }, setSettings);
  };

  // Banking Plaid simulator
  const linkBankAccount = (bankName, accountNumber) => {
    const bank = { bankName, accountNumber };
    sync('pb_bank', bank, setConnectedBank);
    addTransaction('Bank Link', 0, `Linked ${bankName} account ${accountNumber}`);
    addNotification('Banking', `Successfully connected bank account: ${bankName} (${accountNumber})`);
  };

  const addTransaction = (type, amount, description) => {
    const newTx = {
      id: `TX-${Math.floor(100000 + Math.random() * 900000)}`,
      type,
      amount,
      description,
      date: new Date().toISOString(),
      status: 'Completed'
    };
    sync('pb_transactions', [newTx, ...transactions], setTransactions);
  };

  const addNotification = (type, message) => {
    const newNot = {
      notification_id: `notif-${Math.floor(1000 + Math.random() * 9000)}`,
      customer_id: customer.customer_id,
      message,
      type: type.toLowerCase(), // system, investment, document, alert
      read_status: false,
      created_at: new Date().toISOString()
    };
    sync('pb_notifications', [newNot, ...notifications], setNotifications);
  };

  const depositFunds = (amount) => {
    if (!connectedBank) return { success: false, error: 'No bank connected.' };
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) return { success: false, error: 'Invalid deposit amount.' };

    const newBalance = walletBalance + num;
    sync('pb_balance', newBalance, setWalletBalance);
    addTransaction('Deposit', num, `Deposited from ${connectedBank.bankName}`);
    addNotification('Banking', `Wallet credited with $${num.toLocaleString()} from linked bank.`);
    return { success: true };
  };

  const withdrawFunds = (amount) => {
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) return { success: false, error: 'Invalid withdrawal amount.' };
    if (num > walletBalance) return { success: false, error: 'Insufficient funds.' };

    const newBalance = walletBalance - num;
    sync('pb_balance', newBalance, setWalletBalance);
    addTransaction('Withdrawal', num, `Withdrew to connected bank`);
    addNotification('Banking', `Processed withdrawal of $${num.toLocaleString()} to connected bank account.`);
    return { success: true };
  };

  // Invest in crowdfunding round (writes to portfolio table)
  const investInCampaign = (campaignId, amount) => {
    if (customer.status !== 'verified') {
      return { success: false, error: 'KYC Document verification is required to participate in private placements.' };
    }
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) return { success: false, error: 'Invalid investment amount.' };

    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) return { success: false, error: 'Offering campaign not found.' };
    if (num < campaign.minInvestment) return { success: false, error: `Minimum entry threshold is $${campaign.minInvestment}.` };
    if (num > walletBalance) return { success: false, error: 'Insufficient wallet balance.' };

    // Deduct Wallet
    const newBalance = walletBalance - num;
    sync('pb_balance', newBalance, setWalletBalance);

    // Update Campaign Slices
    const addedShares = Math.floor(num / campaign.sharePrice);
    const updatedCampaigns = campaigns.map(c => {
      if (c.id === campaignId) {
        let exists = false;
        const newCapTable = c.capTable.map(item => {
          if (item.type === 'Crowd') {
            exists = true;
            return {
              ...item,
              shares: item.shares + addedShares,
              percentage: parseFloat((((item.shares + addedShares) / (c.valuation / c.sharePrice)) * 100).toFixed(2))
            };
          }
          return item;
        });

        if (!exists) {
          newCapTable.push({
            name: 'PeerBridge Crowd',
            type: 'Crowd',
            shares: addedShares,
            percentage: parseFloat(((addedShares / (c.valuation / c.sharePrice)) * 100).toFixed(2))
          });
        }

        // Adjust founder
        const adjustedCapTable = newCapTable.map(item => {
          if (item.type === 'Founder') {
            return {
              ...item,
              percentage: parseFloat((item.percentage - (addedShares / (c.valuation / c.sharePrice)) * 100).toFixed(2))
            };
          }
          return item;
        });

        return {
          ...c,
          raised: c.raised + num,
          investorsCount: c.investorsCount + 1,
          capTable: adjustedCapTable
        };
      }
      return c;
    });
    sync('pb_campaigns', updatedCampaigns, setCampaigns);

    // Add portfolio table record (matching Schema table #6)
    const existingHolding = portfolio.find(p => p.investment_id === campaignId);
    let updatedPortfolio;
    if (existingHolding) {
      updatedPortfolio = portfolio.map(p => {
        if (p.investment_id === campaignId) {
          return {
            ...p,
            amount_invested: p.amount_invested + num,
            current_value: p.current_value + num
          };
        }
        return p;
      });
    } else {
      updatedPortfolio = [
        ...portfolio,
        {
          portfolio_id: `port-${Math.floor(1000 + Math.random() * 9000)}`,
          customer_id: customer.customer_id,
          investment_id: campaignId,
          companyName: campaign.companyName, // Helper fields for fast GUI rendering
          category: campaign.category,
          sharePrice: campaign.sharePrice,
          shares: addedShares,
          investment_type: 'equity', // equity, loan, receivables
          amount_invested: num,
          date_invested: new Date().toISOString(),
          current_value: num,
          status: 'active' // active, closed, pending
        }
      ];
    }
    sync('pb_portfolio', updatedPortfolio, setPortfolio);

    // Update investor profile size
    const newSize = investorProfile.portfolio_size + num;
    updateInvestorProfile({ portfolio_size: newSize });

    // Financial transaction ledger write
    addTransaction('Investment', num, `Acquired Equity - ${campaign.companyName}`);
    addNotification('Investment', `Successfully processed equity placement in ${campaign.companyName} for $${num.toLocaleString()}.`);

    // Dynamic tax document compilation
    addMockTaxDocument(campaign.companyName, num);

    return { success: true };
  };

  // Tax document compiler (adds files to documentation table)
  const addMockTaxDocument = (companyName, investedAmt) => {
    const ordinaryDividends = investedAmt * 0.065;
    const newDoc = {
      doc_id: `doc-tax-${Math.floor(1000 + Math.random() * 9000)}`,
      customer_id: customer.customer_id,
      doc_type: 'tax_document',
      file_url: `https://pb-vault.s3.amazonaws.com/1099-DIV_${companyName.replace(/\s+/g, '_')}_2026.pdf`,
      uploaded_at: new Date().toISOString(),
      verified: true,
      companyName, // helper info for 1099 form rendering
      investedAmt,
      dividends: ordinaryDividends
    };
    sync('pb_docs', [newDoc, ...documentation], setDocumentation);
  };

  // Launch a round (creates entrepreneur campaign)
  const createCampaign = (companyName, tagline, description, problem, solution, target, valuation, sharePrice, minInvestment, category) => {
    const targetVal = parseFloat(target);
    const valuationVal = parseFloat(valuation);
    const priceVal = parseFloat(sharePrice);

    // Update local entrepreneur profile
    updateEntrepreneurProfile({
      company_name: companyName,
      business_stage: 'revenue',
      industry: category,
      funding_goal: targetVal,
      valuation: valuationVal,
      company_summary: description
    });

    const newCamp = {
      id: `camp-${Math.floor(1000 + Math.random() * 9000)}`,
      companyName,
      tagline,
      description,
      problem,
      solution,
      founder: `${customer.first_name} ${customer.last_name}`,
      target: targetVal,
      raised: 0,
      valuation: valuationVal,
      sharePrice: priceVal,
      minInvestment: parseFloat(minInvestment),
      investorsCount: 0,
      equityOffered: parseFloat(((targetVal / valuationVal) * 100).toFixed(2)),
      status: 'Active',
      category,
      capTable: [
        { name: `${customer.first_name} ${customer.last_name} (Founder)`, percentage: 90, shares: Math.floor((valuationVal / priceVal) * 0.9), type: 'Founder' },
        { name: 'Insider Options', percentage: 10, shares: Math.floor((valuationVal / priceVal) * 0.1), type: 'Insider' }
      ]
    };

    sync('pb_campaigns', [newCamp, ...campaigns], setCampaigns);
    addTransaction('Campaign Launch', 0, `Launched fundraising offering - ${companyName}`);
    addNotification('Investment', `Offering round Form C registered with SEC for ${companyName}.`);

    // Write pitch deck to documentation table
    const newPitchDoc = {
      doc_id: `doc-pitch-${Math.floor(1000 + Math.random() * 9000)}`,
      customer_id: customer.customer_id,
      doc_type: 'pitch_deck',
      file_url: `https://pb-vault.s3.amazonaws.com/${companyName.replace(/\s+/g, '_')}_PitchDeck.pdf`,
      uploaded_at: new Date().toISOString(),
      verified: true
    };
    sync('pb_docs', [newPitchDoc, ...documentation], setDocumentation);

    return { success: true, campaign: newCamp };
  };

  // KYC submission (adds records to documentation table)
  const submitKycDocuments = (fileName) => {
    const newKycDoc = {
      doc_id: `doc-kyc-${Math.floor(1000 + Math.random() * 9000)}`,
      customer_id: customer.customer_id,
      doc_type: 'kyc',
      file_url: `https://pb-vault.s3.amazonaws.com/KYC_${fileName.replace(/\s+/g, '_')}`,
      uploaded_at: new Date().toISOString(),
      verified: false
    };
    
    const updatedDocs = [newKycDoc, ...documentation];
    sync('pb_docs', updatedDocs, setDocumentation);
    addNotification('Document', 'Identity passport scan uploaded. Running 3-step biometric sweeps.');
    return newKycDoc;
  };

  // Verify KYC (changes customers table verification badge)
  const completeKycNodeVetting = (kycDocId) => {
    // Mark document as verified
    const updatedDocs = documentation.map(doc => {
      if (doc.doc_id === kycDocId) return { ...doc, verified: true };
      return doc;
    });
    sync('pb_docs', updatedDocs, setDocumentation);

    // Update customers table flags
    sync('pb_cust', { ...customer, status: 'verified' }, setCustomer);
    
    // Update investor profile accreditation status
    updateInvestorProfile({ accreditation_status: true });
    
    addNotification('Document', 'Ecosystem identity verification check successfully complete. Accredited node status unlocked!');
  };

  // Affiliate Questions
  const postQuestion = (questionText) => {
    const newQ = {
      id: `qa-${Math.floor(1000 + Math.random() * 9000)}`,
      author: `${customer.first_name} ${customer.last_name}`,
      authorRole: customer.role_flags[0] || 'Member',
      question: questionText,
      date: new Date().toISOString(),
      answers: []
    };
    sync('pb_qa', [newQ, ...qaFeed], setCampaigns);
    return { success: true };
  };

  const answerQuestion = (questionId, answerText) => {
    const affiliateDetail = affiliates.find(aff => aff.name === `${customer.first_name} ${customer.last_name}`) || {
      name: `${customer.first_name} ${customer.last_name}`,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&q=80',
    };

    const updated = qaFeed.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          answers: [
            ...q.answers,
            {
              id: `ans-${Math.floor(1000 + Math.random() * 9000)}`,
              author: `${customer.first_name} ${customer.last_name}`,
              authorRole: 'Affiliate',
              avatar: affiliateDetail.avatar,
              content: answerText,
              date: new Date().toISOString()
            }
          ]
        };
      }
      return q;
    });
    sync('pb_qa', updated, setQaFeed);
    return { success: true };
  };

  // Sales Admin operations
  const generateInviteCode = (codeText) => {
    const formatted = codeText.trim().toUpperCase().replace(/\s+/g, '-');
    if (!formatted) return { success: false, error: 'Invite code cannot be empty.' };
    const exists = invites.find(inv => inv.code.toUpperCase() === formatted);
    if (exists) return { success: false, error: 'Invite code already exists.' };

    const newCode = {
      code: formatted,
      createdBy: `${customer.first_name} ${customer.last_name}`,
      usedCount: 0,
      maxUses: 1,
      logs: [`Created by ${customer.first_name} on ${new Date().toLocaleDateString()}`]
    };
    sync('pb_invites', [newCode, ...invites], setInvites);
    return { success: true };
  };

  const sendBulkInvitations = (emailsString, codeToAssign) => {
    const emails = emailsString
      .split(',')
      .map(e => e.trim())
      .filter(e => e.includes('@') && e.length > 3);
    
    if (emails.length === 0) return { success: false, error: 'No valid email addresses provided.' };

    const selectedCode = invites.find(inv => inv.code === codeToAssign);
    if (!selectedCode) return { success: false, error: 'Selected invite code does not exist.' };

    const updatedInvites = invites.map(inv => {
      if (inv.code === codeToAssign) {
        return {
          ...inv,
          logs: [...inv.logs, `Bulk invitation emailed to: [${emails.join(', ')}] on ${new Date().toLocaleDateString()}`]
        };
      }
      return inv;
    });
    sync('pb_invites', updatedInvites, setInvites);
    return { success: true, count: emails.length };
  };

  // Help tickets database write (Table #11 in Schema)
  const submitHelpTicket = (category, message) => {
    const newTicket = {
      ticket_id: `tkt-${Math.floor(100000 + Math.random() * 900000)}`,
      customer_id: customer.customer_id,
      category, // technical, billing, account, general
      message,
      status: 'open', // open, in_progress, resolved, closed
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const updated = [newTicket, ...helpTickets];
    sync('pb_tickets', updated, setHelpTickets);
    addNotification('System', `Support ticket ${newTicket.ticket_id} opened. Vetted admin queue will respond shortly.`);
    return { success: true, ticket: newTicket };
  };

  // Submit resource to Content Library (Table #9 write)
  const submitResource = (title, category, url) => {
    const newRes = {
      resource_id: `res-${Math.floor(1000 + Math.random() * 9000)}`,
      title,
      category, // education, guides, tools, support, legal
      url,
      created_by: `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Sarah Connor',
      created_at: new Date().toISOString()
    };
    const updated = [newRes, ...resources];
    sync('pb_resources', updated, setResources);
    addNotification('System', `New advisory guide published: "${title}" added to Content Library.`);
    return { success: true, resource: newRes };
  };

  // Derived state for compatibility with components referencing `user`
  const user = {
    name: `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || customer.email || 'Sarah Connor',
    email: customer.email,
    role: customer.role_flags && customer.role_flags[0] ? customer.role_flags[0] : 'Investor',
    isVerified: customer.status === 'verified',
    kycStatus: customer.status === 'verified' ? 'Verified' : 'Pending'
  };

  const updateUserProfile = (updates) => {
    if (updates.role) {
      const otherRoles = (customer.role_flags || []).filter(r => r !== updates.role);
      sync('pb_cust', { ...customer, role_flags: [updates.role, ...otherRoles] }, setCustomer);
    }
    if (updates.name) {
      const nameParts = updates.name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      sync('pb_cust', { ...customer, first_name: firstName, last_name: lastName }, setCustomer);
    }
  };

  return {
    isAuthenticated,
    activeTab,
    activeModule,
    setActiveTab,
    setActiveModule,
    globalSearchQuery,
    setGlobalSearchQuery,
    inspectedCustomer,
    setInspectedCustomer,
    targetCampaignId,
    setTargetCampaignId,
    
    // Derived & compatibility state
    user,
    updateUserProfile,
    
    // Database aligned state tables
    customer,
    basicProfile,
    professionalProfile,
    entrepreneurProfile,
    investorProfile,
    affiliateProfile,
    settings,
    portfolio,
    documentation,
    notifications,
    helpTickets,
    resources,
    
    // Auxiliary lists
    campaigns,
    affiliates,
    qaFeed,
    invites,
    walletBalance,
    connectedBank,
    transactions,
    directory,
    
    // LinkedIn profile integrations
    profileActiveSubTab,
    setProfileActiveSubTab,
    directoryRoleFilter,
    setDirectoryRoleFilter,
    savedCampaignIds,
    setSavedCampaignIds,
    connections,
    setConnections,
    profileViewers,
    setProfileViewers,
    postImpressions,
    setPostImpressions,
    events,
    setEvents,
    toggleSaveCampaign,
    toggleEventAttendance,
    toggleConnectionNode,
    
    // Database writing actions
    loginWithInvite,
    loginWithCredentials,
    loginAsDemo,
    logout,
    updateProfiles,
    updateEntrepreneurProfile,
    updateInvestorProfile,
    updateAffiliateProfile,
    updateSettings,
    linkBankAccount,
    depositFunds,
    withdrawFunds,
    investInCampaign,
    createCampaign,
    submitKycDocuments,
    completeKycNodeVetting,
    postQuestion,
    answerQuestion,
    generateInviteCode,
    sendBulkInvitations,
    submitHelpTicket,
    submitResource,
    setCustomer,
    setDirectory
  };
}
