const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  highScore: { type: Number, default: 0 },
  lastPlayed: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
