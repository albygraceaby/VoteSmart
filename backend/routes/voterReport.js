const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Party = require('../models/Party');
const Constituency = require('../models/Constituency');
const { protect } = require('../middleware/auth');

// GET /api/voter-report
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const parties = await Party.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(5);
    const constituencies = await Constituency.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(5);

    // Analyze voting style
    const actions = user.actions || [];
    const moduleActivity = {};
    actions.forEach(a => {
      moduleActivity[a.module] = (moduleActivity[a.module] || 0) + 1;
    });

    // Determine priorities from party budgets
    const priorities = {};
    parties.forEach(p => {
      Object.entries(p.budget.toObject ? p.budget.toObject() : p.budget).forEach(([key, val]) => {
        if (key !== '_id' && key !== '$init') {
          priorities[key] = (priorities[key] || 0) + val;
        }
      });
    });

    const topPriorities = Object.entries(priorities)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([key]) => key);

    // Calculate strengths
    const strengths = [];
    const warnings = [];

    if (user.scores.manipulation > 50) {
      strengths.push('Strong ability to identify manipulation tactics in political messaging');
    } else {
      warnings.push('Practice identifying manipulation in political ads and speeches');
    }

    if (user.scores.socialMedia > 30) {
      strengths.push('Good media literacy — you can distinguish reliable from unreliable sources');
    } else {
      warnings.push('Be more cautious with social media content — always fact-check before trusting');
    }

    if (user.scores.debate > 50) {
      strengths.push('Effective at constructing evidence-based arguments');
    } else {
      warnings.push('Work on supporting your positions with data and acknowledging counterarguments');
    }

    if (moduleActivity['constituency']) {
      strengths.push('Strategic thinker — you understand regional political dynamics');
    }

    if (moduleActivity['law']) {
      strengths.push('Policy-aware — you analyze the real-world impact of legislation');
    }

    if (topPriorities.includes('education') || topPriorities.includes('healthcare')) {
      strengths.push('People-oriented: You prioritize human development over security spending');
    }

    if (strengths.length === 0) {
      strengths.push('You\'re just getting started! Complete more modules to build your voter profile.');
    }

    if (warnings.length === 0) {
      warnings.push('Keep up the great work! Continue engaging with all modules to refine your skills.');
    }

    // Voting style
    let votingStyle = 'Undetermined';
    if (topPriorities[0] === 'education' || topPriorities[0] === 'healthcare') {
      votingStyle = 'Progressive — You prioritize social welfare and human development';
    } else if (topPriorities[0] === 'defense') {
      votingStyle = 'Security-focused — National defense is your top concern';
    } else if (topPriorities[0] === 'infrastructure') {
      votingStyle = 'Pragmatic — You focus on economic growth and development';
    } else if (topPriorities[0] === 'welfare') {
      votingStyle = 'Social Democrat — You champion programs for the vulnerable';
    } else if (parties.length === 0) {
      votingStyle = 'Not yet determined — Create a party to discover your style!';
    }

    // Radar chart data
    const radarData = {
      labels: ['Media Literacy', 'Critical Thinking', 'Policy Knowledge', 'Debate Skills', 'Strategic Thinking', 'Civic Engagement'],
      values: [
        Math.min(100, (user.scores.socialMedia || 0) * 2),
        Math.min(100, (user.scores.manipulation || 0)),
        Math.min(100, (moduleActivity['law'] || 0) * 25),
        Math.min(100, (user.scores.debate || 0)),
        Math.min(100, (moduleActivity['constituency'] || 0) * 30),
        Math.min(100, Object.keys(moduleActivity).length * 15)
      ]
    };

    res.json({
      username: user.username,
      memberSince: user.createdAt,
      totalActions: actions.length,
      modulesExplored: Object.keys(moduleActivity).length,
      votingStyle,
      topPriorities,
      strengths,
      warnings,
      scores: user.scores,
      radarData,
      recentParties: parties.map(p => ({ name: p.name, scores: p.scores, createdAt: p.createdAt })),
      storyProgress: user.storyProgress
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
