const express = require('express');
const router = express.Router();
const Constituency = require('../models/Constituency');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const REGIONS = [
  {
    name: 'Urban Metro',
    type: 'urban',
    totalSeats: 45,
    keyIssues: ['Public Transport', 'Air Quality', 'Housing Costs', 'Tech Jobs'],
    weights: { urban: 0.8, rural: 0.1, industrial: 0.1 },
    baseSupport: 40
  },
  {
    name: 'Rural Heartland',
    type: 'rural',
    totalSeats: 55,
    keyIssues: ['Farm Subsidies', 'Water Access', 'Rural Roads', 'School Access'],
    weights: { urban: 0.1, rural: 0.8, industrial: 0.1 },
    baseSupport: 35
  },
  {
    name: 'Industrial Belt',
    type: 'industrial',
    totalSeats: 40,
    keyIssues: ['Factory Jobs', 'Worker Safety', 'Pollution Control', 'Wages'],
    weights: { urban: 0.2, rural: 0.1, industrial: 0.7 },
    baseSupport: 30
  },
  {
    name: 'Suburban Ring',
    type: 'urban',
    totalSeats: 35,
    keyIssues: ['Schools', 'Property Tax', 'Commute Times', 'Safety'],
    weights: { urban: 0.6, rural: 0.3, industrial: 0.1 },
    baseSupport: 42
  },
  {
    name: 'Coastal Trade Zone',
    type: 'industrial',
    totalSeats: 30,
    keyIssues: ['Port Jobs', 'Trade Policy', 'Fishing Rights', 'Tourism'],
    weights: { urban: 0.3, rural: 0.2, industrial: 0.5 },
    baseSupport: 38
  },
  {
    name: 'Agricultural Plains',
    type: 'rural',
    totalSeats: 45,
    keyIssues: ['Crop Prices', 'Irrigation', 'Land Rights', 'Market Access'],
    weights: { urban: 0.05, rural: 0.85, industrial: 0.1 },
    baseSupport: 33
  }
];

// POST /api/constituency — Simulate constituency results
router.post('/simulate', protect, async (req, res) => {
  try {
    const { allocations } = req.body;

    if (!allocations || allocations.urban == null || allocations.rural == null || allocations.industrial == null) {
      return res.status(400).json({ message: 'Allocations for urban, rural, and industrial are required' });
    }

    const total = allocations.urban + allocations.rural + allocations.industrial;
    if (Math.abs(total - 100) > 1) {
      return res.status(400).json({ message: 'Allocations must total 100' });
    }

    const regionResults = REGIONS.map(region => {
      const matchScore =
        (allocations.urban / 100) * region.weights.urban +
        (allocations.rural / 100) * region.weights.rural +
        (allocations.industrial / 100) * region.weights.industrial;

      const winProbability = Math.min(95, Math.max(5, Math.round(
        region.baseSupport + (matchScore * 60) + (Math.random() * 10 - 5)
      )));

      const seatsWon = Math.round((winProbability / 100) * region.totalSeats);

      return {
        region: region.name,
        type: region.type,
        keyIssues: region.keyIssues,
        winProbability,
        seatsWon,
        totalSeats: region.totalSeats
      };
    });

    const totalSeats = regionResults.reduce((sum, r) => sum + r.seatsWon, 0);
    const totalPossible = regionResults.reduce((sum, r) => sum + r.totalSeats, 0);

    const constituency = await Constituency.create({
      userId: req.user._id,
      allocations,
      results: { regionResults, totalSeats, totalRegions: REGIONS.length }
    });

    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        actions: { module: 'constituency', action: 'simulate', data: { totalSeats, totalPossible } },
        constituencyIds: constituency._id
      }
    });

    res.status(201).json({
      allocations,
      regionResults,
      totalSeats,
      totalPossible,
      majority: Math.ceil(totalPossible / 2),
      wonMajority: totalSeats >= Math.ceil(totalPossible / 2)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/constituency/regions — Get available regions
router.get('/regions', (req, res) => {
  res.json(REGIONS.map(r => ({
    name: r.name,
    type: r.type,
    totalSeats: r.totalSeats,
    keyIssues: r.keyIssues
  })));
});

module.exports = router;
