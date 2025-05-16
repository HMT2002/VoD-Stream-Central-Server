const mongoose = require('mongoose');

const threadSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'Thread required'], unique: true },
  content: { type: String, required: [true, 'Thread required'] },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, required: [true, 'Thread required'] },
  createDate: { type: Date, default: Date.now },
  updateDate: { type: Date, default: null, required: false },

  tag: { type: String, required: [true, 'Thread required'] },
  video: {
    vidLink: { type: String, required: [true, 'Thread required'] },
    thumbLink: { type: String, default: 'https://i.imgur.com/13KYZfX.jpg' },
  },
  slug: { type: String, required: [false, 'Thread required'], unique: true },
  points: { type: Number, default: 0 * 1 },
});
const Thread = mongoose.model('Thread', threadSchema);

module.exports = Thread;
