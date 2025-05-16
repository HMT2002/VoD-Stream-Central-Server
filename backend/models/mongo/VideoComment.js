const mongoose = require('mongoose');

const videoCommentSchema = new mongoose.Schema({
  video: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video',
    required: [true, 'Comment required video'],
  },
  content: { type: String, required: [true, 'Comment required content'] },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, required: [true, 'Comment required user'] },
  createDate: { type: Date, required: false, default: Date.now },
  updateDate: { type: Date, required: false, default: Date.now },

  points: { type: Number, default: 0 },
});
const VideoComment = mongoose.model('VideoComment', videoCommentSchema);

module.exports = VideoComment;
