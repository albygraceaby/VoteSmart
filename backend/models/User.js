const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  actions: [{
    module: String,
    action: String,
    data: mongoose.Schema.Types.Mixed,
    timestamp: { type: Date, default: Date.now }
  }],
  storyProgress: {
    stage: { type: Number, default: 0 },
    decisions: [mongoose.Schema.Types.Mixed],
    completed: { type: Boolean, default: false }
  },
  scores: {
    manipulation: { type: Number, default: 0 },
    socialMedia: { type: Number, default: 0 },
    debate: { type: Number, default: 0 },
    overallAwareness: { type: Number, default: 0 }
  },
  partyIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Party' }],
  constituencyIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Constituency' }]
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
