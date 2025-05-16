const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const logSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Yêu cầu cần có tên log'] },
  description: { type: Object },
  speed: { type: Number, default: 0 * 1 },
  createdDate: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now },
});

const Log = mongoose.model('Log', logSchema);

module.exports = Log;
