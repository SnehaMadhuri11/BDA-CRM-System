const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  title: String,
  company: String,
  email: String,
  phone: String,
  source: String,
  stage: String,
  priority: String,
  value: Number,
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Lead', leadSchema);