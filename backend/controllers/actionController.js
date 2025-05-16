const fs = require('fs');
const path = require('path');
const users = JSON.parse(fs.readFileSync('./json-resources/users.json'));
const helperAPI = require('../modules/helperAPI');
// const firebaseAPI = require('../modules/firebaseAPI');
const redirectAPI = require('../modules/redirectAPI');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');
var FormData = require('form-data');

const User = require('../models/mongo/User');
const Log = require('../models/mongo/Log');
const Server = require('../models/mongo/Server');
const Video = require('../models/mongo/Video');

const fluentFfmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
fluentFfmpeg.setFfmpegPath(ffmpegPath);

const axios = require('axios');
const Playlist = require('../models/mongo/Playlist');
const VideoComment = require('../models/mongo/VideoComment');
const Info = require('../models/mongo/Info');
const InfoComment = require('../models/mongo/InfoComment');

exports.GetVideoByID = catchAsync(async (req, res, next) => {
  const videoID = req.params.videoID;
  if (!videoID) {
    res.status(200).json({
      status: 400,
      message: 'Request body missing videoID',
    });
    return;
  }
  const video = await Video.findById(videoID);

  req.video = video;
  next();
});

exports.GetInfoByID = catchAsync(async (req, res, next) => {
  const infoID = req.params.infoID;
  if (!infoID) {
    res.status(200).json({
      status: 400,
      message: 'Request body missing infoID',
    });
    return;
  }
  const info = await Info.findById(infoID);

  req.info = info;
  next();
});

exports.GetVideoByIDForPlaylist = catchAsync(async (req, res, next) => {
  console.log(req.body);
  const videoID = req.body.videoID;
  if (!videoID) {
    res.status(200).json({
      status: 400,
      message: 'Request body missing videoID',
    });
    return;
  }
  const video = await Video.findById(videoID);

  req.video = video;
  next();
});

exports.GetUserByID = catchAsync(async (req, res, next) => {
  const userID = req.params.userID;
  if (!userID) {
    res.status(200).json({
      status: 400,
      message: 'Request params missing userID',
    });
    return;
  }
  const video = await User.findById(userID);

  req.user = user;
  next();
});

exports.CommentVideo = catchAsync(async (req, res, next) => {
  const user = req.user;
  const video = req.video;
  const content = req.body.content;
  const comment = await VideoComment.create({ user, video, content });
  res.status(200).json({
    status: 200,
    message: 'Success comment to video',
    comment,
  });
});

exports.CommentInfo = catchAsync(async (req, res, next) => {
  const user = req.user;
  const info = req.info;
  const content = req.body.content;
  const comment = await InfoComment.create({ user, info, content });
  res.status(200).json({
    status: 200,
    message: 'Success comment to info',
    comment,
  });
});

exports.AddVideoToPlaylist = catchAsync(async (req, res, next) => {
  const user = req.user;
  if (!req.body.playlistID) {
    res.status(400).json({
      status: 400,
      message: 'PlaylistID is missing!',
    });
  }
  const playlist = await Playlist.findById(req.body.playlistID);
  const video = req.video;
  const info = req.info;
  if (!playlist.videos.includes(video._id)) {
    playlist.videos.push(video);
  }
  if (!playlist.infos.includes(info._id)) {
    playlist.infos.push(info);
  }

  await playlist.save();
  res.status(200).json({
    status: 200,
    message: 'Success add video to playlist',
  });
});

exports.RemoveVideoFromPlaylist = catchAsync(async (req, res, next) => {
  const user = req.user;
  if (!req.body.playlistID) {
    res.status(400).json({
      status: 400,
      message: 'PlaylistID is missing!',
    });
  }
  const playlist = await Playlist.findById(req.body.playlistID);
  const video = req.video;
  const info = await Info.findOne({ videos: video._id });

  if (playlist.videos.includes(video._id)) {
    const index = playlist.videos.indexOf(video._id);
    if (index > -1) {
      // only splice array when item is found
      playlist.videos.splice(index, 1); // 2nd parameter means remove one item only

      let flag = false;
      for (let count = 0; count < playlist.videos.length; count++) {
        if (info.videos.includes(playlist.videos[count]._id)) {
          flag = true;
        }
      }
      if (flag === false) {
        const indexInfo = playlist.infos.indexOf(info._id);
        if (indexInfo > -1) {
          // only splice array when item is found
          playlist.infos.splice(indexInfo, 1); // 2nd parameter means remove one item only
        }
      }
    }
  }

  await playlist.save();
  res.status(200).json({
    status: 200,
    message: 'Success remove video from playlist',
  });
});

exports.DeletePlaylist = catchAsync(async (req, res, next) => {
  if (!req.body.playlistID) {
    res.status(400).json({
      status: 400,
      message: 'PlaylistID is missing!',
    });
  }
  const playlist = await Playlist.findById(req.body.playlistID);

  await playlist.deleteOne();
  res.status(200).json({
    status: 200,
    message: 'Success delete playlist',
  });
});
exports.CreatePlaylist = catchAsync(async (req, res, next) => {
  const user = req.user;
  const playlistname = req.body.playlistname;
  const playlist = await Playlist.create({ user, playlistname });
  res.status(200).json({
    status: 200,
    message: 'Success create video playlist',
    playlist,
  });
});

exports.GetUserAllPlaylist = catchAsync(async (req, res, next) => {
  const user = req.user;
  const playlistes = await Playlist.find({ user: user._id }).populate('user').populate('videos').populate('infos');
  res.status(200).json({
    status: 200,
    message: 'Success get user playlist',
    data: playlistes,
  });
});

exports.GetAllVideoCommentWithVideoID = catchAsync(async (req, res, next) => {
  const video = req.video;
  const videoComments = await VideoComment.find({ video: video._id }).populate('user');
  res.status(200).json({
    status: 200,
    message: 'Success get video all comments',
    comments: videoComments,
  });
});

exports.GetAllVideoCommentWithInfoID = catchAsync(async (req, res, next) => {
  const info = req.info;
  const infoComments = await InfoComment.find({ info: info._id }).populate('user');
  res.status(200).json({
    status: 200,
    message: 'Success get info all comments',
    comments: infoComments,
  });
});

exports.GetAllVideoCommentWithUserID = catchAsync(async (req, res, next) => {
  const user = req.user;
  const videoComments = await VideoComment.find({ user: user._id });
  res.status(200).json({
    status: 200,
    message: 'Success get user all comments',
    comments: videoComments,
  });
});
