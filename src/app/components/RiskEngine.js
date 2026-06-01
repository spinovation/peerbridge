'use client';

/**
 * Proprietary Risk Index (PRI) Underwriting Engine
 * Evaluates candidates based on Layer 0 (Identity), Layer 1 (Bureau),
 * Layer 2 (Behavioral), and Layer 3 (Public Records).
 */

export const RISK_GRADES = {
  P1: { code: 'P1', name: 'Super Prime', pd: '0.2% - 0.8%', baseApr: '4.5% - 8.0%', maxAmount: 50000, maxTenor: 60 },
  P2: { code: 'P2', name: 'Prime', pd: '0.9% - 2.0%', baseApr: '8.5% - 13.0%', maxAmount: 25000, maxTenor: 48 },
  P3: { code: 'P3', name: 'Near-Prime', pd: '2.1% - 5.5%', baseApr: '14.0% - 18.0%', maxAmount: 12500, maxTenor: 36 },
  P4: { code: 'P4', name: 'Subprime', pd: '5.6% - 12.0%', baseApr: '19.0% - 28.0%', maxAmount: 5000, maxTenor: 24 },
  P5: { code: 'P5', name: 'Deep Subprime', pd: '12.1% - 35.0%', baseApr: '29.0% - 36.0%', maxAmount: 1500, maxTenor: 12 }
};

/**
 * Computes complete PRI parameters based on inputs.
 * If no custom details are passed, returns standard matched underwriting structures.
 * 
 * @param {Object} inputs
 * @returns {Object} PRI Score details
 */
export function calculatePRI(inputs = {}) {
  // Extract inputs or seed default parameters for mock borrowers
  const bcs = inputs.bcsScore || 680; // Bureau Credit Score (300 - 850)
  const incomeRegularity = inputs.incomeRegularity ?? 0.95; // 0.0 - 1.0 (regularity)
  const overdraftFrequency = inputs.overdraftFrequency ?? 0; // count of overdrafts last 12m
  const utilization = inputs.utilization ?? 0.45; // revolving utilization ratio (0.0 - 1.0)
  const onTimePaymentRatio = inputs.onTimePaymentRatio ?? 0.98; // repayment ratio last 12m
  const kycStatus = inputs.kycStatus || 'Pass';
  const syntheticRisk = inputs.syntheticRisk || 'Low';
  const publicRecordFlag = inputs.publicRecordFlag ?? false;
  const historicBankruptcy = inputs.historicBankruptcy ?? false;
  const bankruptcyDischargeYears = inputs.bankruptcyDischargeYears ?? 4;

  // Payroll sync (ADP/Paychex) and Plaid transaction filters
  const adpConnected = inputs.adpConnected || false;
  const plaidConnected = inputs.plaidConnected || false;
  
  // Payroll ledger telemetry
  const grossIncome = inputs.grossIncome || 0;
  const netPaycheck = inputs.netPaycheck || 0;
  const taxSavings = inputs.taxSavings || 0;
  const withholdings = inputs.withholdings || 0;
  
  // Plaid transaction analytics
  const mandatorySpend = inputs.mandatorySpend || 0;
  const discretionarySpend = inputs.discretionarySpend || 0;
  const creditCardMaxedOut = inputs.creditCardMaxedOut || false;

  // 1. Calculate Layer 2: Behavioral Risk Score (BRS) - scale of 100
  let brs = 90;
  let savingsRate = 0;
  let monthlySavings = 0;

  if (adpConnected && plaidConnected) {
    // True Net Cash-flow calculation
    monthlySavings = netPaycheck - mandatorySpend - discretionarySpend;
    savingsRate = netPaycheck > 0 ? monthlySavings / netPaycheck : 0;
    
    // Set base score
    brs = 85;

    // A. Savings Rate Modifier
    if (savingsRate >= 0.40) {
      brs += 15; // Exceptional cash accumulation (+15)
    } else if (savingsRate >= 0.25) {
      brs += 8;
    } else if (savingsRate < 0.10) {
      brs -= 35; // Extreme cash deficit / lifestyle burn (-35)
    } else if (savingsRate < 0.20) {
      brs -= 15;
    }

    // B. Lifestyle Burn (Discretionary vs Net Take-home)
    const discretionaryRatio = discretionarySpend / netPaycheck;
    if (discretionaryRatio > 0.50) {
      brs -= 20; // Extreme online luxury / discretionary spend velocity
    } else if (discretionaryRatio < 0.15) {
      brs += 10;
    }

    // C. Credit Card Max-Out Alerts
    if (creditCardMaxedOut) {
      brs -= 25; // High credit line exhaustion probability
    } else {
      brs += 5;
    }

    // D. Overdraft events
    brs -= overdraftFrequency * 12;
    brs = Math.max(10, Math.min(100, Math.round(brs)));
  } else {
    // Standard credit-bureau-backed calculation
    brs += (incomeRegularity - 0.9) * 50; 
    brs -= overdraftFrequency * 8; 
    brs -= (utilization - 0.3) * 30; 
    brs += (onTimePaymentRatio - 0.95) * 100; 
    brs = Math.max(10, Math.min(100, Math.round(brs)));
  }

  // 2. Composite PRI Score (scaled 300 to 850)
  let baseComposite;
  if (adpConnected && plaidConnected) {
    // Dynamic Bureau-Bypass: Discount credit bureau BCS weight to 10%, rely 90% on net cash flow!
    baseComposite = (bcs * 0.10) + (brs * 8.5 * 0.90);
  } else {
    // Standard: 45% Bureau, 55% Behavioral
    baseComposite = (bcs * 0.45) + (brs * 8.5 * 0.55);
  }

  // Fraud / Identity Deductions
  if (kycStatus !== 'Pass') baseComposite -= 150;
  if (syntheticRisk === 'High') baseComposite -= 200;
  if (syntheticRisk === 'Medium') baseComposite -= 80;

  // Public Record Penalties
  if (publicRecordFlag) baseComposite -= 90;
  if (historicBankruptcy) {
    const penalty = Math.max(10, 80 - (bankruptcyDischargeYears * 15));
    baseComposite -= penalty;
  }

  const priScore = Math.max(300, Math.min(850, Math.round(baseComposite)));

  // 3. Map to Grade & PD (Probability of Default)
  let grade = RISK_GRADES.P3;
  let pdVal = 3.2;

  if (priScore >= 790) {
    grade = RISK_GRADES.P1;
    pdVal = 0.2 + ((850 - priScore) / 60) * 0.6;
  } else if (priScore >= 730) {
    grade = RISK_GRADES.P2;
    pdVal = 0.9 + ((789 - priScore) / 59) * 1.1;
  } else if (priScore >= 660) {
    grade = RISK_GRADES.P3;
    pdVal = 2.1 + ((729 - priScore) / 69) * 3.4;
  } else if (priScore >= 570) {
    grade = RISK_GRADES.P4;
    pdVal = 5.6 + ((659 - priScore) / 89) * 6.4;
  } else {
    grade = RISK_GRADES.P5;
    pdVal = 12.1 + ((569 - priScore) / 269) * 22.9;
  }

  // Underwriting terms recommendations
  const maxAmount = grade.maxAmount;
  const maxTenor = grade.maxTenor;
  const aprRange = grade.baseApr.split(' - ').map(r => parseFloat(r));

  // 4. State flags & explainability key drivers
  const flags = [];
  if (kycStatus === 'Pass') flags.push('IDENTITY_KYC_VERIFIED');
  if (overdraftFrequency === 0) flags.push('BEHAVIORAL_STABLE_CASH');
  if (adpConnected) flags.push('PAYROLL_API_INTEGRATED');
  if (plaidConnected) flags.push('PLAID_CASHFLOW_AUDITED');
  if (utilization < 0.35) flags.push('INCOME_VERIFIED');
  else flags.push('BEHAVIORAL_DATA_PRESENT');
  if (publicRecordFlag) flags.push('PUBLIC_RECORD_FLAGGED');
  if (historicBankruptcy) flags.push('MANUAL_REVIEW_SUGGESTED');

  const keyDrivers = [];
  
  if (adpConnected && plaidConnected) {
    keyDrivers.push({
      type: 'strong_positive',
      text: `Payroll Synced: verified gross annualized earning of $${grossIncome.toLocaleString()}`
    });

    if (savingsRate >= 0.35) {
      keyDrivers.push({
        type: 'strong_positive',
        text: `Exceptional Modern Cash-flow: verified monthly net savings rate of ${Math.round(savingsRate * 100)}% ($${Math.round(monthlySavings).toLocaleString()}/mo)`
      });
    } else if (savingsRate < 0.10) {
      keyDrivers.push({
        type: 'risk',
        text: `Extreme Cash Burn: monthly net savings rate is only ${Math.round(savingsRate * 100)}% ($${Math.round(monthlySavings).toLocaleString()}/mo) due to high discretionary drag`
      });
    } else {
      keyDrivers.push({
        type: 'positive',
        text: `Stable cash-flow with net savings rate of ${Math.round(savingsRate * 100)}%`
      });
    }

    if (creditCardMaxedOut) {
      keyDrivers.push({
        type: 'risk',
        text: 'Consumer Credit Alert: revolving credit cards are maxed out with heavy online luxury spending velocity'
      });
    } else {
      keyDrivers.push({
        type: 'strong_positive',
        text: 'Responsible Credit Utilization: Plaid confirms zero credit card max-out events'
      });
    }

    const taxRatio = withholdings / (grossIncome / 12);
    if (taxRatio > 0.35) {
      keyDrivers.push({
        type: 'mitigating',
        text: `High tax withholding rate (${Math.round(taxRatio * 100)}% CA/Fed) consumes substantial net take-home liquidity`
      });
    } else if (taxRatio < 0.15 && grossIncome > 100000) {
      keyDrivers.push({
        type: 'strong_positive',
        text: `Tax Optimized: Effective withholding rate optimized at ${Math.round(taxRatio * 100)}%, maximizing liquid cash-flow buffers`
      });
    }
  } else {
    if (incomeRegularity >= 0.95) {
      keyDrivers.push({ type: 'strong_positive', text: 'Stable monthly income regularity over 18 months' });
    } else {
      keyDrivers.push({ type: 'positive', text: 'Active income streams established' });
    }

    if (overdraftFrequency === 0) {
      keyDrivers.push({ type: 'positive', text: 'Zero overdraft events in banking transaction audit' });
    } else {
      keyDrivers.push({ type: 'risk', text: `Frequent overdraft occurrences (${overdraftFrequency} last 12m)` });
    }

    if (utilization > 0.6) {
      keyDrivers.push({ type: 'risk', text: `High revolving credit utilization at ${Math.round(utilization * 100)}%` });
    } else if (utilization < 0.3) {
      keyDrivers.push({ type: 'strong_positive', text: `Optimized revolving utilization at ${Math.round(utilization * 100)}%` });
    }

    if (historicBankruptcy) {
      keyDrivers.push({
        type: 'risk',
        text: `Historical Chapter 7 bankruptcy filing - discharged ${bankruptcyDischargeYears} years ago`
      });
      keyDrivers.push({
        type: 'mitigating',
        text: 'Consistent positive balance reserves post-discharge with zero current delinquencies'
      });
    } else if (onTimePaymentRatio > 0.97) {
      keyDrivers.push({ type: 'strong_positive', text: 'Flawless 100% on-time payment ratio across active tradelines' });
    }
  }

  // 5. Structure detailed Layers Breakdown
  const layersBreakdown = {
    layer0: {
      kyc: kycStatus,
      sanctions: inputs.sanctionsPEP || 'Clear',
      deviceRisk: inputs.deviceRisk || 'Normal',
      syntheticRisk: syntheticRisk,
      flags: ['PEP_SCREEN_PASS', 'IP_VALIDATED']
    },
    layer1: {
      bcsScore: bcs,
      tradelines: inputs.tradelines || 12,
      utilization: `${Math.round(utilization * 100)}%`,
      delinquencies: inputs.delinquencies || 0,
      inquiries: inputs.inquiries || 2,
      bureauBand: bcs >= 750 ? 'Excellent' : bcs >= 680 ? 'Good' : bcs >= 600 ? 'Fair' : 'Poor'
    },
    layer2: {
      brsScore: brs,
      salaryRegularity: `${Math.round(incomeRegularity * 100)}%`,
      overdraftFrequency: overdraftFrequency,
      monthEndBalance: inputs.monthEndBalance || 4850,
      onTimePaymentRatio: `${Math.round(onTimePaymentRatio * 100)}%`,
      note: adpConnected 
        ? 'Payroll & Transaction feeds connected. Underwriting bypassing traditional credit bureaus.' 
        : 'Behavioral cash flow score suggests robust repayment capability bypassing thin bureau files.',
      adpConnected,
      plaidConnected,
      grossIncome,
      netPaycheck,
      taxSavings,
      withholdings,
      mandatorySpend,
      discretionarySpend,
      creditCardMaxedOut,
      savingsRate: adpConnected ? `${Math.round(savingsRate * 100)}%` : null,
      monthlySavings: adpConnected ? monthlySavings : null
    },
    layer3: {
      code: publicRecordFlag ? 'PR2' : historicBankruptcy ? 'PR1' : 'None',
      ruleApplied: publicRecordFlag 
        ? 'Active public tax lien or judgement - High hazard limit reduction.' 
        : historicBankruptcy 
        ? `Dismissed >${bankruptcyDischargeYears * 12}m ago, BRS ≥ 80 -> minimized PD escalation.` 
        : 'Clear public watchlists.',
      details: publicRecordFlag ? 'Tax Lien $2,400 filed 2024' : historicBankruptcy ? 'Bankruptcy Chapter 7 dismissed' : 'No records found'
    }
  };

  return {
    priScore,
    grade: grade.code,
    gradeName: grade.name,
    pd: `${pdVal.toFixed(1)}%`,
    decision: inputs.decisionOverride || (priScore >= 660 ? 'APPROVE' : priScore >= 570 ? 'APPROVE_ADJUSTED' : 'DECLINE'),
    recommendedTerms: {
      maxAmount,
      maxTenor,
      aprRange: `${aprRange[0]}% - ${aprRange[1]}%`,
      minApr: aprRange[0],
      maxApr: aprRange[1]
    },
    flags,
    keyDrivers,
    layersBreakdown
  };
}

/**
 * Pre-seeded mock borrower configurations mapping to specific members.
 */
export const MOCK_BORROWERS_PRI = {
  // Kristi Tonin - Founder borrower (Near Prime P3)
  'kristi@toninlogistics.com': calculatePRI({
    bcsScore: 610,
    incomeRegularity: 0.96,
    overdraftFrequency: 0,
    utilization: 0.68,
    onTimePaymentRatio: 0.99,
    historicBankruptcy: true,
    bankruptcyDischargeYears: 4,
    decisionOverride: 'APPROVE_ADJUSTED',
    sanctionsPEP: 'Clear',
    deviceRisk: 'Normal',
    syntheticRisk: 'Low',
    tradelines: 8,
    delinquencies: 0,
    inquiries: 3,
    monthEndBalance: 3200
  }),
  // Marcus Aurelius - High Prime (P1)
  'marcus@aureliusfinance.com': calculatePRI({
    bcsScore: 810,
    incomeRegularity: 1.0,
    overdraftFrequency: 0,
    utilization: 0.12,
    onTimePaymentRatio: 1.0,
    sanctionsPEP: 'Clear',
    deviceRisk: 'Normal',
    syntheticRisk: 'Low',
    tradelines: 22,
    delinquencies: 0,
    inquiries: 0,
    monthEndBalance: 24500
  }),
  // Sarah Connor - Prime Founder/Investor (P2)
  'sarah@skynet-rebel.io': calculatePRI({
    bcsScore: 745,
    incomeRegularity: 0.98,
    overdraftFrequency: 0,
    utilization: 0.28,
    onTimePaymentRatio: 0.98,
    sanctionsPEP: 'Clear',
    deviceRisk: 'Normal',
    syntheticRisk: 'Low',
    tradelines: 14,
    delinquencies: 0,
    inquiries: 1,
    monthEndBalance: 12500
  }),
  // Devon Vance - Earning $500k but over-leveraged high lifestyle burn (Declined / P5 Subprime)
  'devon@auroratech.io': calculatePRI({
    bcsScore: 610, // Credit-thin / Fair FICO
    incomeRegularity: 0.98,
    overdraftFrequency: 0,
    utilization: 0.85,
    onTimePaymentRatio: 0.95,
    adpConnected: true,
    plaidConnected: true,
    grossIncome: 500000,
    netPaycheck: 21500, // High take-home, but severely eaten
    taxSavings: 2000,
    withholdings: 18000, // California peak bracket tax
    mandatorySpend: 8500, // Massive mortgage, car notes, and minimum debt payments
    discretionarySpend: 11500, // Heavy online luxury retail, high restaurants and flights velocity
    creditCardMaxedOut: true, // Maxed out credit cards!
    decisionOverride: 'DECLINE',
    sanctionsPEP: 'Clear',
    deviceRisk: 'Normal',
    syntheticRisk: 'Low',
    tradelines: 6,
    delinquencies: 1,
    inquiries: 4,
    monthEndBalance: 1200
  }),
  // Elena Rostova - Earning $160k but optimized and hyper-responsible (Approved / P2 Prime)
  'elena@rostova.ai': calculatePRI({
    bcsScore: 620, // Credit-thin / Fair FICO
    incomeRegularity: 0.99,
    overdraftFrequency: 0,
    utilization: 0.15,
    onTimePaymentRatio: 1.0,
    adpConnected: true,
    plaidConnected: true,
    grossIncome: 160000,
    netPaycheck: 9200, // Highly tax optimized
    taxSavings: 1500,
    withholdings: 2600,
    mandatorySpend: 1800, // Modest living, minimal overheads
    discretionarySpend: 1100, // Disciplined spend
    creditCardMaxedOut: false,
    decisionOverride: 'APPROVE',
    sanctionsPEP: 'Clear',
    deviceRisk: 'Normal',
    syntheticRisk: 'Low',
    tradelines: 4,
    delinquencies: 0,
    inquiries: 1,
    monthEndBalance: 28500
  })
};
