const fs = require('fs');
const path = require('path');
const users = JSON.parse(fs.readFileSync('./json-resources/users.json'));
const helperAPI = require('../modules/helperAPI');
const redirectAPI = require('../modules/redirectAPI');
const storageStrategiesAPI = require('../modules/storageStrategiesAPI');

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
const VideoStatus = require('../models/mongo/VideoStatus');

exports.StopStreaming = catchAsync(async (req, res, next) => {
  console.log('Dealing with request StopStreaming');
  const token = req.params.token;
  const servers = await Server.find({});
  if (servers.length === 0) {
    res.status(200).json({
      message: 'Not found any servers',
    });
    return;
  }

  for (let serverIndex = 0; serverIndex < servers.length; serverIndex++) {
    const url = servers[serverIndex].URL;
    const port = servers[serverIndex].port;
    axios({
      method: 'get',
      url: 'http://' + url + port + '/api/v1/streaming/stop-streaming/' + token,
      validateStatus: () => true,
    }).catch(function (error) {
      console.log('Fuck error handling, just need to send request doesnt needded to be succeed');
    });
  }
  res.status(200).json({
    status: 200,
    message: 'send stop streaming to servers',
  });
});

exports.AddStreaming = catchAsync(async (req, res, next) => {
  console.log('Dealing with request AddStreaming');
  const token = req.params.token;
  const servers = await Server.find({});
  if (servers.length === 0) {
    res.status(200).json({
      message: 'Not found any servers',
    });
    return;
  }

  for (let serverIndex = 0; serverIndex < servers.length; serverIndex++) {
    const url = servers[serverIndex].URL;
    const port = servers[serverIndex].port;
    axios({
      method: 'get',
      url: 'http://' + url + port + '/api/v1/streaming/add-streaming/' + token,
      validateStatus: () => true,
    }).catch(function (error) {
      console.log('Fuck error handling, just need to send request doesnt needded to be succeed');
    });
  }
  res.status(200).json({
    status: 200,
    message: 'send continue streaming to servers',
  });
});
