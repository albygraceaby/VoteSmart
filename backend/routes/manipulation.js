const express = require('express');
const router = express.Router();
const manipulationData = require('../data/manipulation.json');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// GET /api/manipulation/scenario
router.get('/scenario', protect, async (req, res) => {
  try {
    const scenarioIndex = parseInt(req.query.index) || 0;
    const scenario = manipulationData[scenarioIndex % manipulationData.length];

    res.json({
      id: scenario.id,
      type: scenario.type,
      content: scenario.content,
      totalScenarios: manipulationData.length,
      currentIndex: scenarioIndex % manipulationData.length,
      options: ['emotional_appeal', 'false_claim', 'misuse_of_data']
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/manipulation/answer
router.post('/answer', protect, async (req, res) => {
  try {
    const { scenarioId, selectedManipulations } = req.body;

    const scenario = manipulationData.find(s => s.id === scenarioId);
    if (!scenario) {
      return res.status(404).json({ message: 'Scenario not found' });
    }

    const correctTypes = scenario.manipulations.map(m => m.type);
    const correctSet = new Set(correctTypes);
    const selectedSet = new Set(selectedManipulations || []);

    let correctCount = 0;
    let totalCorrect = correctTypes.length;

    selectedManipulations?.forEach(type => {
      if (correctSet.has(type)) correctCount++;
    });

    const falsePositives = selectedManipulations?.filter(t => !correctSet.has(t)).length || 0;
    const score = Math.max(0, Math.round(((correctCount / totalCorrect) * 100) - (falsePositives * 15)));

    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        actions: { module: 'manipulation', action: 'answer', data: { scenarioId, score } }
      },
      $inc: { 'scores.manipulation': score }
    });

    res.json({
      score,
      correctManipulations: scenario.manipulations,
      userSelections: selectedManipulations,
      correctCount,
      totalCorrect,
      feedback: score >= 80
        ? '🎯 Excellent! You have a sharp eye for manipulation tactics.'
        : score >= 50
        ? '👍 Good catch! You spotted some tactics but missed others. Review the explanations below.'
        : '📚 Keep learning! Identifying manipulation takes practice. Study the highlighted sections carefully.'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
