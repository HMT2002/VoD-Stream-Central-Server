const fs = require('fs');
const path = require('path');
const helperAPI = require('./helperAPI');
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
const Info = require('../models/mongo/Info');

exports.proxyVer1 = (req) => {
  var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
  console.log(fullUrl);
};

exports.ExecuteEveryWeek = async () => {};
