const mongoose = require('mongoose');

const upgradeLogSchema = new mongoose.Schema({
  upgradeReq: { type: mongoose.Schema.Types.ObjectId, ref: 'UpgradeReq', required: [true, 'Upgrade log required'] },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: [true, 'Upgrade log required'] },
  createDate: { type: Date, default: Date.now },
  updateDate: { type: Date, default: null, required: false },
  accepted: { type: Boolean, default: false },
});
const UpgradeLog = mongoose.model('UpgradeLog', upgradeLogSchema);

module.exports = UpgradeLog;
