const fs = require('fs');
const path = require('path');
const helperAPI = require('./helperAPI');
const redirectAPI = require('./redirectAPI');

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
const { CONSTANTS } = require('../constants/constants');

const getAvailableVideoID = async (id) => {
  const availVideo = await Video.findOne({ _id: id });
  return availVideo;
};

const getAllServer = async () => {
  const servers = await Server.find({});
  return servers;
};

const getAvailableServerForVideo = async (video) => {
  const servers = await Server.find({ videos: video });
  return servers;
};

const getAvailableVideo = async (videoname, type) => {
  const availVideo = await Video.findOne({ videoname: videoname, type: type });
  return availVideo;
};

const getAvailableServersStorage = async (video) => {
  const servers = await Server.find({ videos: { $nin: [video._id] } });
  return servers;
};

const getAllServers = async () => {
  const servers = await Server.find();
  return servers;
};

const availableStorageTest = async (videoname, type) => {
  const allServer = await getAllServers();

  let testResults = [];
  for (let i = 0; i < allServer.length; i++) {
    let speedDownload;
    if (type === 'HLS') {
      speedDownload = checkTestErrorCode(
        await getMyNetworkStorageSpeed(allServer[i].URL, allServer[i].port, videoname + 'Hls')
      );
    } else if (type === 'DASH') {
      speedDownload = checkTestErrorCode(
        await getMyNetworkStorageSpeed(allServer[i].URL, allServer[i].port, videoname + 'Dash')
      );
    }
    testResults.push({ ...speedDownload, URL: allServer[i].URL, port: allServer[i].port });
  }
  return testResults;
};

const availableStorage = async (video) => {
  // const video = await getAvailableVideoAndType(videoname, type);
  const availableServersStorage = await getAvailableServersStorage(video);
  return availableServersStorage;
};

const getAvailableVideoAndType = async (videoname, type) => {
  const availVideoAndType = await Video.findOne({ videoname: videoname, type: type });
  return availVideoAndType;
};

const calculateTime = async (baseUrl) => {
  try {
    const fileSizeInBytes = 200000; // ~ 0,2 mb
    const startTime = new Date().getTime();
    const { data } = await axios.get(baseUrl, {
      timeout: 300, // Set a timeout of 0,3 seconds
    });
    // console.log(data);
    const endTime = new Date().getTime();
    const duration = (endTime - startTime) / 1000;
    const bitsLoaded = fileSizeInBytes * 8;
    const bps = (bitsLoaded / duration).toFixed(2);
    const kbps = (bps / 1000).toFixed(2);
    const mbps = (kbps / 1000).toFixed(2);
    return { duration, bps, kbps, mbps };
  } catch (err) {
    // const endTime = new Date().getTime();
    // const duration = (endTime - startTime) / 1000;
    return { ...err };
  }
};

const calculateTimeStorage = async (baseUrl) => {
  try {
    const fileSizeInBytes = 200000; // ~ 0,2 mb
    const startTime = new Date().getTime();
    const { data } = await axios.get(baseUrl, {
      timeout: 500, // Set a timeout of 0,5 seconds
    });
    // console.log(data);
    const endTime = new Date().getTime();
    const duration = (endTime - startTime) / 1000;

    const bitsLoaded = fileSizeInBytes * 8;
    const bps = (bitsLoaded / duration).toFixed(2);
    const kbps = (bps / 1000).toFixed(2);
    const mbps = (kbps / 1000).toFixed(2);

    return { ...data, duration, mbps };
  } catch (err) {
    // const endTime = new Date().getTime();
    // const duration = (endTime - startTime) / 1000;
    return { ...err };
  }
};

const checkConditionAndFilter = async (baseUrl) => {
  try {
    const { data } = await axios.get(baseUrl, {
      timeout: 500, // Set a timeout of 0,5 seconds
    });
    console.log(data);
    return data;
  } catch (err) {
    // console.log( { ...err })
    return null;
  }
};

const getMyNetworkDownloadSpeedHls = async (url, port, videoname) => {
  // return new Promise((resolve, reject) => {
  //   var options = {
  //     host: url,
  //     port: Number(port.replace(':', '')),
  //     path: '/videos/convert/' + videoname + '.m3u8',
  //     method: 'GET',
  //   };

  //   var req = http.request(options, function (res) {
  //     res.on('data', function (chunk) {
  //       console.log('suceed');
  //       resolve(chunk);
  //     });
  //   });

  //   req.on('error', function (error) {
  //     console.log(error.code);
  //     resolve(error.code);
  //   });
  // });
  const baseUrl = 'http://' + url + port + '/videos/' + videoname + 'Hls/' + videoname + '.m3u8';
  return calculateTime(baseUrl);
};

const getMyNetworkLiveSpeed = async (url, port) => {
  const baseUrl = 'rtmp://' + url + port + '/live/';
  return calculateTime(baseUrl);
};

const getMyNetworkDownloadSpeedDash = async (url, port, videoname) => {
  const baseUrl = 'http://' + url + port + '/videos/' + videoname + 'Dash/init.mpd';
  return calculateTime(baseUrl);
};

const getMyNetworkStorageSpeed = async (url, port, videofolder) => {
  const baseUrl = 'http://' + url + port + CONSTANTS.SUB_SERVER_CHECK_API + '/folder/' + videofolder;
  return calculateTimeStorage(baseUrl);
};

const getMyNetworkAliveCondition = async (url, port) => {
  const baseUrl = 'http://' + url + port + '/is-this-alive';
  return checkConditionAndFilter(baseUrl);
};

const checkTestErrorCode = (result) => {
  if (result.code && result.code === 'ECONNREFUSED') {
    console.log({ url: result.config.url, message: 'ECONNREFUSED' });
    return null;
  } else {
    return result;
  }
};

const testSpeedLiveResults = async (videoname) => {
  if (!videoname) {
    console.log('videoname is empty');
    return [];
  }
  const availableServer = await getAllServer();
  if (availableServer.length === 0) {
    console.log('Not found any server');
    return [];
  }
  let testResults = [];
  for (let i = 0; i < availableServer.length; i++) {
    let speedDownload;
    speedDownload = checkTestErrorCode(await getMyNetworkLiveSpeed(availableServer[i].URL, availableServer[i].port));
    if (speedDownload !== null) {
      testResults.push({ ...speedDownload, URL: availableServer[i].URL, port: availableServer[i].port });
    }
  }

  return testResults;
};

const testSpeedResults = async (video) => {
  if (!video) {
    console.log('Video not found on database, check name');
    return [];
  }
  const availableServer = await getAvailableServer(video);
  if (availableServer.length === 0) {
    console.log('Not found any server');
    return [];
  }
  let testResults = [];
  for (let i = 0; i < availableServer.length; i++) {
    let speedDownload;
    if (video.type === 'HLS') {
      speedDownload = checkTestErrorCode(
        await getMyNetworkDownloadSpeedHls(availableServer[i].URL, availableServer[i].port, video.videoname)
      );
    } else if (video.type === 'DASH') {
      speedDownload = checkTestErrorCode(
        await getMyNetworkDownloadSpeedDash(availableServer[i].URL, availableServer[i].port, video.videoname)
      );
    }
    if (speedDownload !== null) {
      testResults.push({ ...speedDownload, URL: availableServer[i].URL, port: availableServer[i].port });
    }
  }

  return testResults;
};

const testServerIsFckingAlive = async () => {
  const availableServer = await getAllServers();
  if (availableServer.length === 0) {
    console.log('Not found any server');
    return null;
  }
  let testResults = [];
  for (let i = 0; i < availableServer.length; i++) {
    condition = await getMyNetworkAliveCondition(availableServer[i].URL, availableServer[i].port);
    if (condition !== null) {
      testResults.push({ ...condition, URL: availableServer[i].URL, port: availableServer[i].port });
    }
  }
  return testResults;
};

const sortAvailableVideoOnServer = (results) => {
  if (results === null || results.length === 0) {
    return null;
  }
  try {
    return results
      .filter((downloadSpeed) => {
        return downloadSpeed.duration;
      })
      .sort((a, b) => a.duration - b.duration);
  } catch (err) {
    console.log(err);
    return null;
  }
};

const availableLiveOnServer = async (videoname) => {
  const testResults = await testSpeedLiveResults(videoname);
  const availableVideoOnServer = sortAvailableVideoOnServer(testResults);
  // console.log(availableVideoOnServer);
  if (availableVideoOnServer === null) {
    return [];
  }
  console.log(testResults);
  return availableVideoOnServer;
};

const availableVideoOnServer = async (video) => {
  const testResults = await testSpeedResults(video);
  const availableVideoOnServer = sortAvailableVideoOnServer(testResults);
  // console.log(availableVideoOnServer);
  if (availableVideoOnServer === null) {
    return [];
  }
  return availableVideoOnServer;
};

const ReplicateWhenEnoughRequest = async (video) => {
  const availableStorage = await availableStorageOnServer(video);
  console.log(availableStorage);
  if (availableStorage.length === 0) {
    const message = 'There is no more available server, the video is on every server!';
    console.log(message);
    return message;
  }
  console.log(availableStorage);
  const index = 0;
  const toURL = availableStorage[index].URL;
  const toPort = availableStorage[index].port;
  const redirectURL = await ReplicateVideoFolder(video.videoname, video.type, toURL, toPort);
  const folderType = video.type === 'HLS' ? 'Hls' : 'Dash';
  await axios({
    method: 'post',
    url: redirectURL,
    data: { filename: video.videoname + folderType, url: toURL, port: toPort },
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  });

  return redirectURL;
};

const ReplicateVideoFolder = async (videoname, type, toURL, toPort) => {
  const video = await Video.findOne({ videoname, type });
  const server = await availableVideoOnServer(video);
  console.log(server);
  console.log({ videoname, type });
  if (server.length === 0) {
    return null;
  }
  const index = 0;
  const url = server[index].URL;
  const port = server[index].port;
  // nên nhớ 2 port này khác nhau
  await addToServer(video, toURL, toPort);
  await addUpVideoReplicant(video);

  return 'http://' + url + port + CONSTANTS.SUB_SERVER_REPLICATE_API + '/send-folder';
};

exports.DeleteFolderWithVideoIDRequest = async (url, port, videoID) => {
  console.log('DeleteFolderWithVideoIDRequest');
  const server = await Server.findOne({ URL: url, port: port });
  if (!server) {
    return {
      message: 'Not found server, check URL and port',
      failed: true,
    };
  }
  const video = await Video.findOne({ _id: videoID });
  if (!video) {
    return {
      message: 'Not found video, check videoID',
      failed: true,
    };
  }
  if (!server.videos.includes(video._id)) {
    return {
      message: 'Cant find video on that server',
      failed: true,
    };
  }
  const reduced_index = video.numberOfReplicant - 1;
  if (reduced_index === 0) {
    return {
      message: 'Cant delete the last copy, if you insist, delete manually!',
      failed: true,
    };
  }
  const redirectURL = 'http://' + url + port + '/api/v1/delete/folder';
  try {
    const { data } = await axios({
      method: 'post',
      url: redirectURL,
      data: req.body,
      headers: req.headers,
      validateStatus: () => true,
    });
    console.log(data);
    const index = server.videos.indexOf(video._id);
    server.videos.splice(index, 1);
    video.numberOfReplicant -= 1;
    await video.save();
    await server.save();
    return {
      message: 'Deleted video on server!',
      hint: data.message,
    };
  } catch (error) {
    console.log(error);
    return {
      message: 'Somethings happended!',
      failed: true,
      error,
    };
  }
};

const getAllAliveServer = async () => {
  const allAliveServer = await testServerIsFckingAlive();
  console.log(allAliveServer);
  return allAliveServer;
};

exports.GetAllAliveServer = async () => {
  return getAllAliveServer();
};

exports.DeleteSelectedVideoFromServer = async (video, server) => {};

exports.GetAllAliveServerFromAllVideo = async () => {
  const videos = await Video.find({}).select(
    '_id videoname type size numberOfRequest numberOfReplicant avarageSpeed title'
  );
  let servers = [];
  for (let i = 0; i < videos.length; i++) {
    const video = videos[i];
    const videoServers = await Server.find({ videos: video }).select(
      '_id URL port avarageSpeed numberOfRequest occupy occupyPercentage storage'
    );
    var sum = { video, videoServers };
    if (sum.video.numberOfRequest < 50 && sum.video.numberOfReplicant >= 2) {
      console.log(
        'Video viewed is too low, need reduced ' +
          sum.video.videoname +
          ' ' +
          sum.video.title +
          ' ' +
          sum.video.numberOfRequest +
          ' ' +
          sum.video.numberOfReplicant
      );
      console.log('\nThese are the server of this video: ' + videoServers);
      sum.needRemove = { quantity: 1, server: videoServers };
    }
    if (sum.video.numberOfRequest < 100 && sum.video.numberOfRequest >= 50 && sum.video.numberOfReplicant >= 3) {
      console.log(
        'Video viewed is too low, need reduced ' +
          sum.video.videoname +
          ' ' +
          sum.video.title +
          ' ' +
          sum.video.numberOfRequest +
          ' ' +
          sum.video.numberOfReplicant
      );
      console.log('\nThese are the server of this video: ' + videoServers);
      sum.needRemove = { quantity: 1, server: videoServers };
    }
    if (sum.video.numberOfRequest < 150 && sum.video.numberOfRequest >= 100 && sum.video.numberOfReplicant >= 4) {
      console.log(
        'Video viewed is too low, need reduced ' +
          sum.video.videoname +
          ' ' +
          sum.video.title +
          ' ' +
          sum.video.numberOfRequest +
          ' ' +
          sum.video.numberOfReplicant
      );
      console.log('\nThese are the server of this video: ' + videoServers);
      sum.needRemove = { quantity: 1, server: videoServers };
    }
    servers.push(sum);
  }
  return servers;
};

exports.GetAllAliveServerFromAllVideoThatNeededToReduce = async () => {
  const videos = await Video.find({}).select(
    '_id videoname type size numberOfRequest numberOfReplicant avarageSpeed title'
  );
  let servers = [];
  for (let i = 0; i < videos.length; i++) {
    const video = videos[i];
    const videoServers = await Server.find({ videos: video }).select(
      '_id URL port avarageSpeed numberOfRequest occupy occupyPercentage storage'
    );
    var sum = { video, videoServers };
    if (sum.video.numberOfRequest < 50 && sum.video.numberOfReplicant >= 2) {
      console.log(
        'Video viewed is too low, need reduced ' +
          sum.video.videoname +
          ' ' +
          sum.video.title +
          ' ' +
          sum.video.numberOfRequest +
          ' ' +
          sum.video.numberOfReplicant
      );
      console.log('\nThese are the server of this video: ' + videoServers);
      sum.needRemove = { quantity: 1, server: videoServers };
    }
    if (sum.video.numberOfRequest < 100 && sum.video.numberOfRequest >= 50 && sum.video.numberOfReplicant >= 3) {
      console.log(
        'Video viewed is too low, need reduced ' +
          sum.video.videoname +
          ' ' +
          sum.video.title +
          ' ' +
          sum.video.numberOfRequest +
          ' ' +
          sum.video.numberOfReplicant
      );
      console.log('\nThese are the server of this video: ' + videoServers);
      sum.needRemove = { quantity: 1, server: videoServers };
    }
    if (sum.video.numberOfRequest < 150 && sum.video.numberOfRequest >= 100 && sum.video.numberOfReplicant >= 4) {
      console.log(
        'Video viewed is too low, need reduced ' +
          sum.video.videoname +
          ' ' +
          sum.video.title +
          ' ' +
          sum.video.numberOfRequest +
          ' ' +
          sum.video.numberOfReplicant
      );
      console.log('\nThese are the server of this video: ' + videoServers);
      sum.needRemove = { quantity: 1, server: videoServers };
    }
    if (sum.needRemove !== undefined) {
      servers.push(sum);
    }
  }
  return servers;
};

exports.ResetVideoEveryWeek = async () => {
  const videos = await cronjobAPI.GetAllAliveServerFromAllVideoThatNeededToReduce();
  for (let i = 0; i < videos.length; i++) {
    console.log(videos[i]);
    const needRemove = videos[i].needRemove;
    for (let n = 0; n < needRemove.quantity; n++) {
      const video = await Video.findOne({ videoname: videos[i].video.videoname });
      const server = await redirectAPI.getServerWithURLAndPort(needRemove.server[n].URL, needRemove.server[n].port);
      const result = await redirectAPI.RemoveVideoFolder(video, server);
      videos.push(result);
    }
  }
};

exports.ExecuteEveryWeek = async () => {};
