const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  votingActive: { type: Boolean, default: true },
  resultsPublished: { type: Boolean, default: false }
});

module.exports = mongoose.model('Settings', settingsSchema);
