const mongoose = require('mongoose');

const upgradeReqSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    required: [true, 'Upgrade request required'],
  },

  message: { type: String, required: [true, 'Upgrade request required'] },
  createDate: { type: Date, default: Date.now },
  updateDate: { type: Date, default: Date.now },
  accepted: { type: Boolean, default: false },
});
const UpgradeReq = mongoose.model('UpgradeReq', upgradeReqSchema);

module.exports = UpgradeReq;
