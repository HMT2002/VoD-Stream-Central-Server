const mongoose = require('mongoose');

const infoCommentSchema = new mongoose.Schema({
  info: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Info',
    required: [true, 'Comment required info'],
  },
  content: { type: String, required: [true, 'Comment required content'] },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, required: [true, 'Comment required user'] },
  createDate: { type: Date, required: false, default: Date.now },
  updateDate: { type: Date, required: false, default: Date.now },
  points: { type: Number, default: 0 },
});
const InfoComment = mongoose.model('InfoComment', infoCommentSchema);

module.exports = InfoComment;
