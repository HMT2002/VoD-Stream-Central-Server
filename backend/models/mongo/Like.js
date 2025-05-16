const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
  thread: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Thread',
    default: null,
    required: [true, 'Like required thread'],
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, required: [true, 'Like required user'] },
  createDate: { type: Date, required: false, default: Date.now },
  updateDate: { type: Date, required: false, default: Date.now },
});
const Like = mongoose.model('Like', likeSchema);

module.exports = Like;
