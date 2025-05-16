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

exports.CheckFileBeforeReceive = catchAsync(async (req, res, next) => {
  console.log('check file before receive');
  const videoPath = 'videos/' + req.body.filename;
  if (fs.existsSync(videoPath)) {
    res.status(200).json({
      message: 'File already existed on this server',
      path: videoPath,
      url,
      port,
    });
    return;
  }
  next();
});

exports.UploadNewFileSubtitle = catchAsync(async (req, res, next) => {
  let destination = req.file.destination;

  res.status(200).json({
    status: 200,
    message: 'Subtitle uplaoded',
    destination,
  });
});
