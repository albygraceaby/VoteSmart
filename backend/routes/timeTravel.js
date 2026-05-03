const express = require('express');
const router = express.Router();
const timeTravelData = require('../data/timeTravel.json');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// GET /api/time-travel/scenario
router.get('/scenario', (req, res) => {
  const scenarioIndex = parseInt(req.query.index) || 0;
  const scenario = timeTravelData[scenarioIndex % timeTravelData.length];

  res.json({
    id: scenario.id,
    year: scenario.year,
    title: scenario.title,
    description: scenario.description,
    candidates: scenario.candidates,
    totalScenarios: timeTravelData.length,
    currentIndex: scenarioIndex % timeTravelData.length
  });
});

// POST /api/time-travel/vote
router.post('/vote', protect, async (req, res) => {
  try {
    const { scenarioId, candidateId } = req.body;

    const scenario = timeTravelData.find(s => s.id === scenarioId);
    if (!scenario) {
      return res.status(404).json({ message: 'Scenario not found' });
    }

    const userChoice = scenario.candidates.find(c => c.id === candidateId);
    const actualWinner = scenario.candidates.find(c => c.id === scenario.actualWinner);
    const votedForWinner = candidateId === scenario.actualWinner;

    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        actions: { module: 'timeTravel', action: 'vote', data: { scenarioId, candidateId, votedForWinner } }
      }
    });

    res.json({
      userChoice: {
        name: userChoice.name,
        party: userChoice.party,
        platform: userChoice.platform
      },
      actualWinner: {
        name: actualWinner.name,
        party: actualWinner.party,
        platform: actualWinner.platform
      },
      votedForWinner,
      year: scenario.year,
      consequences: scenario.consequences,
      lesson: scenario.lesson
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
