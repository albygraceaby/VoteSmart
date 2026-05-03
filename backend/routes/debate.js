const express = require('express');
const router = express.Router();
const debates = require('../data/debates.json');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// GET /api/debate/topics
router.get('/topics', (req, res) => {
  res.json(debates.map(d => ({ topic: d.topic })));
});

// POST /api/debate/start
router.post('/start', protect, async (req, res) => {
  try {
    const { topic, stance } = req.body;

    if (!topic || !stance) {
      return res.status(400).json({ message: 'Topic and stance are required' });
    }

    const debate = debates.find(d => d.topic.toLowerCase() === topic.toLowerCase());
    if (!debate) {
      return res.status(404).json({ message: 'Topic not found', available: debates.map(d => d.topic) });
    }

    const stanceKey = stance.toLowerCase() === 'support' ? 'oppose' : 'support';
    const opponentData = debate.stances[stanceKey];

    const opponentArgument = opponentData.arguments[Math.floor(Math.random() * opponentData.arguments.length)];

    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        actions: { module: 'debate', action: 'start', data: { topic, stance } }
      }
    });

    res.json({
      topic: debate.topic,
      userStance: stance,
      opponentStance: stanceKey,
      opponentArgument,
      round: 1
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/debate/respond
router.post('/respond', protect, async (req, res) => {
  try {
    const { topic, stance, round, userArgument } = req.body;

    const debate = debates.find(d => d.topic.toLowerCase() === topic.toLowerCase());
    if (!debate) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    const stanceKey = stance.toLowerCase() === 'support' ? 'oppose' : 'support';
    const opponentData = debate.stances[stanceKey];

    const argIndex = Math.min(round, opponentData.arguments.length - 1);
    const opponentArgument = opponentData.arguments[argIndex];

    const counterpointIndex = Math.min(round - 1, opponentData.counterpoints.length - 1);
    const counterpoint = opponentData.counterpoints[counterpointIndex];

    const isLastRound = round >= 3;

    let debateScore = 0;
    if (userArgument && userArgument.length > 50) debateScore += 30;
    if (userArgument && userArgument.length > 100) debateScore += 20;
    if (userArgument && /data|study|research|evidence|percent|statistics/i.test(userArgument)) debateScore += 25;
    if (userArgument && /however|although|while|consider|perspective/i.test(userArgument)) debateScore += 25;

    if (isLastRound) {
      await User.findByIdAndUpdate(req.user._id, {
        $set: { 'scores.debate': Math.max(debateScore, (await User.findById(req.user._id)).scores?.debate || 0) }
      });
    }

    res.json({
      topic: debate.topic,
      round: round + 1,
      opponentArgument,
      counterpoint,
      isLastRound,
      ...(isLastRound && {
        debateScore,
        feedback: debateScore >= 70
          ? 'Excellent debate performance! You used evidence and nuanced arguments effectively.'
          : debateScore >= 40
          ? 'Good effort! Try incorporating more data and acknowledging opposing viewpoints.'
          : 'Keep practicing! Strong debates rely on evidence, not just opinions. Try citing studies or statistics.'
      })
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
