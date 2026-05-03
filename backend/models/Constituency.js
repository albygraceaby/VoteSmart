const mongoose = require('mongoose');

const constituencySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  allocations: {
    urban: { type: Number, required: true, min: 0, max: 100 },
    rural: { type: Number, required: true, min: 0, max: 100 },
    industrial: { type: Number, required: true, min: 0, max: 100 }
  },
  results: {
    regionResults: [{
      region: String,
      winProbability: Number,
      seatsWon: Number,
      totalSeats: Number,
      keyIssue: String
    }],
    totalSeats: { type: Number, default: 0 },
    totalRegions: { type: Number, default: 3 }
  }
}, { timestamps: true });

module.exports = mongoose.model('Constituency', constituencySchema);
