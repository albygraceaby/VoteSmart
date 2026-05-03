const express = require('express');
const router = express.Router();
const storyData = require('../data/storyMode.json');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// GET /api/story-mode/progress
router.get('/progress', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const currentStage = user.storyProgress?.stage || 1;
    const stageData = storyData.find(s => s.stage === currentStage);

    if (!stageData) {
      return res.json({
        completed: true,
        stage: currentStage,
        totalStages: storyData.length,
        decisions: user.storyProgress?.decisions || []
      });
    }

    res.json({
      completed: false,
      stage: currentStage,
      totalStages: storyData.length,
      stageData,
      previousDecisions: user.storyProgress?.decisions || []
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/story-mode/advance
router.post('/advance', protect, async (req, res) => {
  try {
    const { stage, optionIndex } = req.body;
    const user = await User.findById(req.user._id);

    const stageData = storyData.find(s => s.stage === stage);
    if (!stageData) {
      return res.status(404).json({ message: 'Stage not found' });
    }

    const selectedOption = stageData.options[optionIndex];
    if (!selectedOption && stageData.options.length > 0) {
      return res.status(400).json({ message: 'Invalid option index' });
    }

    const decision = {
      stage,
      title: stageData.title,
      choice: selectedOption?.text || 'Completed',
      trait: selectedOption?.trait || null,
      bias: selectedOption?.bias || null,
      timestamp: new Date()
    };

    const nextStage = selectedOption?.next || stage + 1;
    const isComplete = nextStage > storyData.length;

    await User.findByIdAndUpdate(req.user._id, {
      $set: {
        'storyProgress.stage': isComplete ? stage : nextStage,
        'storyProgress.completed': isComplete
      },
      $push: {
        'storyProgress.decisions': decision,
        actions: { module: 'storyMode', action: 'advance', data: decision }
      }
    });

    const nextStageData = storyData.find(s => s.stage === nextStage);

    // Generate summary for final stage
    let summary = null;
    if (isComplete || !nextStageData || nextStageData.type === 'summary') {
      const allDecisions = [...(user.storyProgress?.decisions || []), decision];
      const traits = allDecisions.map(d => d.trait).filter(Boolean);
      const biases = allDecisions.map(d => d.bias).filter(b => b && b !== 'none');

      summary = {
        totalDecisions: allDecisions.length,
        traits,
        biases,
        profile: traits.length > 0
          ? `Based on your choices, you tend to be ${[...new Set(traits)].join(', ')}. `
          : 'Complete the story to see your voter profile.',
        biasWarning: biases.length > 0
          ? `Watch out for these cognitive biases: ${[...new Set(biases)].join(', ')}.`
          : 'Great job! You showed strong resistance to common voter biases.',
        grade: biases.length === 0 ? 'A' : biases.length <= 1 ? 'B' : biases.length <= 2 ? 'C' : 'D'
      };
    }

    res.json({
      decision,
      nextStage: isComplete ? null : nextStage,
      nextStageData: isComplete ? null : nextStageData,
      isComplete,
      summary
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/story-mode/reset
router.post('/reset', protect, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      $set: {
        'storyProgress.stage': 1,
        'storyProgress.decisions': [],
        'storyProgress.completed': false
      }
    });
    res.json({ message: 'Story progress reset', stage: 1 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
