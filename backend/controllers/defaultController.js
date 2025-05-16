const Info = require('../models/mongo/Info');
const Thread = require('../models/mongo/Thread');
const Video = require('../models/mongo/Video');
const catchAsync = require('./../utils/catchAsync');
const cronjobAPI = require('./../modules/cronjobAPI');
const redirectAPI = require('../modules/redirectAPI');

exports.Default = catchAsync(async (req, res, next) => {
  const threads = await Thread.find({});
  console.log(threads);
  res.status(200).json({
    status: 'success',
    requestTime: req.requestTime,
    data: {
      threads: threads,
    },
  });
});

exports.TestAllAlive = catchAsync(async (req, res, next) => {
  const aliveServers = await cronjobAPI.GetAllAliveServer();
  res.status(200).json({
    status: 'success',
    requestTime: req.requestTime,
    data: {
      aliveServers,
    },
  });
});

exports.Fu = catchAsync(async (req, res, next) => {
  // await Video.deleteMany({videoname:'0u6jYys'})
  res.status(200).json({
    status: 'success',
    requestTime: req.requestTime,
  });
});

exports.ResetServerTest = catchAsync(async (req, res, next) => {
  const videos = await cronjobAPI.GetAllAliveServerFromAllVideoThatNeededToReduce();
  for (let i = 0; i < videos.length; i++) {
    console.log(videos[i]);
    const needRemove = videos[i].needRemove;
    console.log('@@@@@@@@@@@@@@@@@@@@@@');
    for (let n = 0; n < needRemove.quantity; n++) {
      const video = await Video.findOne({ videoname: videos[i].video.videoname });
      const server = await redirectAPI.getServerWithURLAndPort(needRemove.server[n].URL, needRemove.server[n].port);
      const result = await redirectAPI.RemoveVideoFolder(video, server);
      videos.push(result);
    }
  }
  res.status(200).json({
    status: 'success',
    requestTime: req.requestTime,
    data: {
      ...videos,
    },
  });
});
