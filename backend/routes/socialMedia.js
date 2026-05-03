const express = require('express');
const router = express.Router();
const socialMediaData = require('../data/socialMedia.json');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// GET /api/social-media/feed
router.get('/feed', (req, res) => {
  const shuffled = [...socialMediaData].sort(() => Math.random() - 0.5);
  const feed = shuffled.map(post => ({
    id: post.id,
    author: post.author,
    avatar: post.avatar,
    verified: post.verified,
    content: post.content,
    likes: post.likes,
    shares: post.shares,
    comments: post.comments,
    timestamp: post.timestamp
  }));
  res.json(feed);
});

// POST /api/social-media/action
router.post('/action', protect, async (req, res) => {
  try {
    const { postId, action } = req.body;

    if (!['trust', 'ignore', 'fact_check'].includes(action)) {
      return res.status(400).json({ message: 'Action must be trust, ignore, or fact_check' });
    }

    const post = socialMediaData.find(p => p.id === postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    let score = 0;
    let feedback = '';

    if (post.isGenuine) {
      if (action === 'trust') {
        score = 10;
        feedback = '✅ Correct! This is a genuine, verified post. Trusting credible sources is important.';
      } else if (action === 'fact_check') {
        score = 8;
        feedback = '👍 Good instinct to verify! This post IS genuine, but fact-checking everything is a great habit.';
      } else {
        score = 2;
        feedback = '⚠️ This was actually a genuine post from a credible source. Ignoring valid information can leave you uninformed.';
      }
    } else {
      if (action === 'fact_check') {
        score = 15;
        feedback = '🎯 Excellent! This IS misinformation. Fact-checking was the right call.';
      } else if (action === 'ignore') {
        score = 8;
        feedback = '👍 Good choice to not engage. This was misinformation. Even better would be to fact-check it.';
      } else {
        score = -5;
        feedback = '❌ Careful! This was misinformation. Trusting unverified content spreads false narratives.';
      }
    }

    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        actions: { module: 'socialMedia', action: action, data: { postId, score, isGenuine: post.isGenuine } }
      },
      $inc: { 'scores.socialMedia': score }
    });

    res.json({
      postId,
      action,
      isGenuine: post.isGenuine,
      score,
      feedback,
      explanation: post.explanation
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
