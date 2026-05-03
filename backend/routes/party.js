const express = require('express');
const router = express.Router();
const Party = require('../models/Party');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// POST /api/party — Create party and calculate scores
router.post('/', protect, async (req, res) => {
  try {
    const { name, manifesto, budget } = req.body;

    if (!name || !budget) {
      return res.status(400).json({ message: 'Party name and budget are required' });
    }

    const total = budget.education + budget.healthcare + budget.defense + budget.infrastructure + budget.welfare;
    if (Math.abs(total - 100) > 1) {
      return res.status(400).json({ message: 'Budget must total 100%' });
    }

    // Calculate scores
    const approvalScore = Math.min(100, Math.round(
      (budget.education * 1.3) +
      (budget.healthcare * 1.4) +
      (budget.welfare * 1.1) +
      (budget.infrastructure * 0.8) +
      (budget.defense * 0.4)
    ));

    const economicScore = Math.min(100, Math.round(
      (budget.infrastructure * 1.5) +
      (budget.education * 1.2) +
      (budget.healthcare * 0.8) +
      (budget.defense * 0.6) +
      (budget.welfare * 0.5)
    ));

    const securityScore = Math.min(100, Math.round(
      (budget.defense * 2.0) +
      (budget.infrastructure * 0.8) +
      (budget.welfare * 0.3) +
      (budget.education * 0.2) +
      (budget.healthcare * 0.2)
    ));

    // Generate summary
    const topPriority = Object.entries(budget).sort((a, b) => b[1] - a[1])[0];
    const summaries = {
      education: 'Your party prioritizes education, investing in the future workforce. This builds long-term economic growth and high public approval, though short-term economic impact may be slower.',
      healthcare: 'Your party leads with healthcare, ensuring citizen well-being. This drives the highest public approval ratings but requires sustained funding commitments.',
      defense: 'Your party emphasizes national security. While this ensures strong defense capabilities, it may draw criticism for underfunding social programs.',
      infrastructure: 'Your party focuses on infrastructure development. This creates jobs and boosts economic output, providing a balanced approach to governance.',
      welfare: 'Your party champions social welfare. This directly helps vulnerable populations and builds grassroots support, though critics may question fiscal sustainability.'
    };

    const party = await Party.create({
      userId: req.user._id,
      name,
      manifesto: manifesto || [],
      budget,
      scores: { approval: approvalScore, economic: economicScore, security: securityScore },
      summary: summaries[topPriority[0]]
    });

    // Track action
    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        actions: { module: 'party', action: 'create', data: { partyId: party._id, scores: party.scores } },
        partyIds: party._id
      }
    });

    res.status(201).json(party);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/party — Get user's party history
router.get('/', protect, async (req, res) => {
  try {
    const parties = await Party.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(parties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
