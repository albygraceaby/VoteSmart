const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// POST /api/seat-prediction/predict
router.post('/predict', protect, async (req, res) => {
  try {
    const { regionResults, partyName } = req.body;

    if (!regionResults || !Array.isArray(regionResults)) {
      return res.status(400).json({ message: 'Region results array is required' });
    }

    const totalSeats = regionResults.reduce((sum, r) => sum + (r.totalSeats || 0), 0);
    const partySeats = regionResults.reduce((sum, r) => sum + (r.seatsWon || 0), 0);
    const oppositionSeats = totalSeats - partySeats;

    const majority = Math.ceil(totalSeats / 2);
    const hasMajority = partySeats >= majority;

    // Create parliament distribution
    const parties = [
      { name: partyName || 'Your Party', seats: partySeats, color: '#6366f1' },
      { name: 'Opposition Alliance', seats: Math.round(oppositionSeats * 0.55), color: '#ef4444' },
      { name: 'Regional Front', seats: Math.round(oppositionSeats * 0.25), color: '#f59e0b' },
      { name: 'Independent', seats: Math.round(oppositionSeats * 0.12), color: '#8b5cf6' },
      { name: 'Others', seats: oppositionSeats - Math.round(oppositionSeats * 0.55) - Math.round(oppositionSeats * 0.25) - Math.round(oppositionSeats * 0.12), color: '#6b7280' }
    ].filter(p => p.seats > 0);

    const governmentType = hasMajority
      ? 'Majority Government'
      : partySeats >= majority * 0.8
      ? 'Coalition Government (likely)'
      : partySeats >= majority * 0.5
      ? 'Minority Government (unstable)'
      : 'Opposition';

    res.json({
      totalSeats,
      majority,
      hasMajority,
      governmentType,
      parties,
      summary: hasMajority
        ? `Congratulations! ${partyName || 'Your party'} wins ${partySeats} of ${totalSeats} seats — a clear majority of ${partySeats - majority + 1} seats above the ${majority} needed.`
        : `${partyName || 'Your party'} wins ${partySeats} of ${totalSeats} seats. ${majority} needed for majority. You may need coalition partners.`
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
