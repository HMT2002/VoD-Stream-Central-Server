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
const VideoStatus = require('../models/mongo/VideoStatus');

const fluentFfmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
fluentFfmpeg.setFfmpegPath(ffmpegPath);

const axios = require('axios');
const Info = require('../models/mongo/Info');

exports.Dummy = async () => {
  try {
  } catch (error) {
    console.log(error);
  }
};

exports.CalculateAvarageSpeedServer = async (server) => {
  try {
  } catch (error) {
    console.log(error);
  }
};
