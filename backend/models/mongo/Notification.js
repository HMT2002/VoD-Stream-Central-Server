const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  thread: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Thread',
    required: [true, 'Notification required thread'],
  },
  message: { type: String, required: [true, 'Notification required message'] },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: [true, 'Notification required ssender user'] },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Notification required receiver user'],
  },

  createDate: { type: Date, required: false, default: Date.now },
  updateDate: { type: Date, required: false, default: Date.now },

  checked: { type: Boolean, default: false },
  notitype: { type: String, required: [true, 'Notification required type of notification'] },
});
const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
