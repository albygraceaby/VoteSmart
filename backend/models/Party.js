const mongoose = require('mongoose');

const partySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  manifesto: [{ type: String, trim: true }],
  budget: {
    education: { type: Number, required: true, min: 0, max: 100 },
    healthcare: { type: Number, required: true, min: 0, max: 100 },
    defense: { type: Number, required: true, min: 0, max: 100 },
    infrastructure: { type: Number, required: true, min: 0, max: 100 },
    welfare: { type: Number, required: true, min: 0, max: 100 }
  },
  scores: {
    approval: { type: Number, default: 0 },
    economic: { type: Number, default: 0 },
    security: { type: Number, default: 0 }
  },
  summary: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Party', partySchema);
