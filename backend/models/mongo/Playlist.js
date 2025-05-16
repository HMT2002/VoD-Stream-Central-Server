const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
  videos: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Video',
    },
  ],
  infos: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Info',
    },
  ],
  playlistname: { type: String, required: [true, 'Yêu cầu cần có tên playlist'] },

  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, required: [true, 'Comment required user'] },
  createDate: { type: Date, required: false, default: Date.now },
  updateDate: { type: Date, required: false, default: Date.now },
});
const Playlist = mongoose.model('Playlist', playlistSchema);

module.exports = Playlist;
