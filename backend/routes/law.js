const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const POLICIES = {
  'free_college': {
    name: 'Free College Education',
    baseCost: 80, // billions
    baseBenefit: 45, // % of population
    taxImpact: 12, // % increase
    description: 'Eliminate tuition fees for all public universities and colleges.',
    beneficiaries: 'Students aged 18-24, working adults seeking degrees, low-income families',
    tradeoffs: 'Higher taxes on middle and upper income brackets, potential quality concerns with increased enrollment, reduced funding for other programs'
  },
  'universal_healthcare': {
    name: 'Universal Healthcare',
    baseCost: 200,
    baseBenefit: 85,
    taxImpact: 18,
    description: 'Provide government-funded healthcare for all citizens regardless of income.',
    beneficiaries: 'All citizens, especially uninsured and underinsured populations, chronic illness patients',
    tradeoffs: 'Significant tax increases, potential wait times, reduced private sector healthcare innovation, transition disruption'
  },
  'tax_reduction': {
    name: 'Tax Reduction',
    baseCost: -60,
    baseBenefit: 30,
    taxImpact: -15,
    description: 'Reduce income tax rates across all brackets by 15%.',
    beneficiaries: 'All taxpayers, disproportionately benefits higher income brackets',
    tradeoffs: 'Reduced government revenue, potential cuts to social programs, may increase deficit, benefits skewed toward wealthy'
  }
};

// POST /api/law/simulate
router.post('/simulate', protect, async (req, res) => {
  try {
    const { policyId, budgetAllocation, taxRate } = req.body;

    if (!policyId || !POLICIES[policyId]) {
      return res.status(400).json({ message: 'Valid policy selection required', available: Object.keys(POLICIES) });
    }

    const policy = POLICIES[policyId];
    const budgetFactor = (budgetAllocation || 50) / 50;
    const taxFactor = (taxRate || 50) / 50;

    const governmentCost = Math.round(policy.baseCost * budgetFactor);
    const taxBurden = Math.round(policy.taxImpact * taxFactor * 10) / 10;
    const populationBenefit = Math.min(100, Math.round(policy.baseBenefit * budgetFactor * (taxFactor * 0.5 + 0.5)));

    const gdpImpact = policyId === 'tax_reduction'
      ? Math.round(taxFactor * 2.5 * 10) / 10
      : Math.round((budgetFactor * 1.5 - taxFactor * 0.8) * 10) / 10;

    const yearlyCosts = [];
    const yearlyBenefits = [];
    for (let year = 1; year <= 5; year++) {
      const costMultiplier = policyId === 'tax_reduction' ? 1 : (1 + year * 0.05);
      const benefitMultiplier = 1 + year * 0.15;
      yearlyCosts.push(Math.round(Math.abs(governmentCost) * costMultiplier));
      yearlyBenefits.push(Math.round(populationBenefit * benefitMultiplier * 0.8));
    }

    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        actions: { module: 'law', action: 'simulate', data: { policyId, budgetAllocation, taxRate } }
      }
    });

    res.json({
      policy: policy.name,
      description: policy.description,
      results: {
        governmentCost,
        taxBurden,
        populationBenefit,
        gdpImpact
      },
      chartData: {
        labels: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
        costs: yearlyCosts,
        benefits: yearlyBenefits
      },
      analysis: {
        beneficiaries: policy.beneficiaries,
        tradeoffs: policy.tradeoffs,
        costLabel: governmentCost >= 0 ? `$${governmentCost}B annual cost` : `$${Math.abs(governmentCost)}B revenue loss`,
        taxLabel: taxBurden >= 0 ? `+${taxBurden}% tax increase` : `${taxBurden}% tax decrease`,
        benefitLabel: `${populationBenefit}% population benefits directly`
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/law/policies
router.get('/policies', (req, res) => {
  const policies = Object.entries(POLICIES).map(([id, p]) => ({
    id,
    name: p.name,
    description: p.description
  }));
  res.json(policies);
});

module.exports = router;
