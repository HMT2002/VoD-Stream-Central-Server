const fs = require('fs');
const path = require('path');
const helperAPI = require('./helperAPI');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');
var FormData = require('form-data');

const User = require('./../models/mongo/User');
const Log = require('./../models/mongo/Log');
const Server = require('./../models/mongo/Server');
const Video = require('./../models/mongo/Video');
const VideoStatus = require('./../models/mongo/VideoStatus');

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

const getAvailableServer = async (video) => {
  const servers = await Server.find({ videos: video });
  // console.log('getAvailableServer result: ');
  // console.log(servers);
  return servers;
};

const getAvailableVideo = async (videoname, type) => {
  const availVideo = await Video.findOne({ videoname: videoname, type: type });
  return availVideo;
};

const getAvailableServersStorage = async (video) => {
  console.log('redirectAPI.getAvailableServersStorage -> ');
  const servers = await Server.find({ videos: { $nin: [video._id] } });
  return servers;
};

const getAllServers = async () => {
  console.log('redirectAPI.getAllServers -> ');
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
  console.log('redirectAPI.availableStorage -> ');
  // const video = await getAvailableVideoAndType(videoname, type);
  const availableServersStorage = await getAvailableServersStorage(video);
  return availableServersStorage;
};

const getAvailableVideoAndType = async (videoname, type) => {
  console.log('redirectAPI.getAvailableVideoAndType -> ');
  const availVideoAndType = await Video.findOne({ videoname: videoname, type: type });
  return availVideoAndType;
};

const calculateTime = async (baseUrl) => {
  try {
    const fileSizeInBytes = 200000; // ~ 0,2 mb
    const startTime = new Date().getTime();
    const { data } = await axios.get(baseUrl, {
      timeout: 1000, // Set a timeout of 1 seconds, 0,3 giây thì chậm quá, không kịp phản hồi thì abort connect rồi
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
    const startTime = new Date().getTime();
    const { data } = await axios.get(baseUrl, {
      timeout: 500, // Set a timeout of 0,5 seconds
    });
    // console.log(data);
    const endTime = new Date().getTime();
    const duration = (endTime - startTime) / 1000;
    return { ...data, duration };
  } catch (err) {
    // const endTime = new Date().getTime();
    // const duration = (endTime - startTime) / 1000;
    return { ...err };
  }
};

const checkConditionAndFilter = async (baseUrl) => {
  console.log('redirectAPI.checkConditionAndFilter -> ');
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
  console.log('redirectAPI.getMyNetworkAliveCondition -> ');
  const baseUrl = 'http://' + url + port + '/is-this-alive';
  return checkConditionAndFilter(baseUrl);
};

const checkTestErrorCode = (result) => {
  if (result.code && result.code === 'ECONNREFUSED') {
    console.log({ url: result.config.url, message: 'ECONNREFUSED' });
    return null;
  } else if (result.code && result.code === 'ECONNABORTED') {
    console.log({ url: result.config.url, message: 'ECONNABORTED' });
    return null;
  } else {
    return result;
  }
};

const testSpeedLiveResults = async (videoname) => {
  if (!videoname) {
    console.log('video name is empty');
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
  console.log('redirectAPI.testSpeedResults -> ');
  if (!video) {
    console.log('Video not found on database, check name');
    return [];
  }
  const availableServer = await getAvailableServer(video);
  if (availableServer.length === 0) {
    console.log('Not found any server');
    return [];
  }
  console.log('availableServer');
  console.log(availableServer);
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
  // console.log('testSpeedResults restult: ');
  // console.log(testResults);

  return testResults;
};

const testServerIsFckingAlive = async () => {
  console.log('redirectAPI.testServerIsFckingAlive -> ');
  const availableServer = await getAllServers();
  if (availableServer.length === 0) {
    console.log('Not found any server');
    return null;
  }
  let testResults = [];
  for (let i = 0; i < availableServer.length; i++) {
    condition = await getMyNetworkAliveCondition(availableServer[i].URL, availableServer[i].port);
    if (condition !== null) {
      testResults.push({
        ...condition,
        URL: availableServer[i].URL,
        port: availableServer[i].port,
        numberOfRequest: availableServer[i].numberOfRequest,
        avarageSpeed: availableServer[i].avarageSpeed,
        occupy: availableServer[i].occupy,
        occupyPercentage: availableServer[i].occupyPercentage,
        storage: availableServer[i].storage,
        videos: availableServer[i].videos,
      });
    }
  }
  return testResults;
};

const sortAvailableVideoOnServer = (results) => {
  console.log('redirectAPI.sortAvailableVideoOnServer -> ');
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
  console.log('redirectAPI.availableVideoOnServer -> ');
  const testResults = await testSpeedResults(video);
  const availableVideoOnServer = sortAvailableVideoOnServer(testResults);
  if (availableVideoOnServer === null) {
    return [];
  }
  return availableVideoOnServer;
};

const availableStorageOnServer = async (video) => {
  console.log('redirectAPI.availableStorageOnServer -> ');
  // const availableStorageOnServer = await availableStorageTest(videoname, type);
  const availableStorageOnServer = await availableStorage(video);
  if (availableStorageOnServer === null) {
    return [];
  }

  return availableStorageOnServer;
};

const ReplicateWhenEnoughRequest = async (video) => {
  console.log('redirectAPI.ReplicateWhenEnoughRequest -> ');
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

const countVideoAccessing = async (videoname, url, port, type) => {
  console.log('Accessing video ' + videoname + ' on ' + url + port + ' with type ' + type);
};

const ReplicateVideoFolder = async (videoname, type, toURL, toPort) => {
  const checkDestinationServer = await getServerWithURLAndPort(toURL, toPort);
  if (checkDestinationServer === null) {
    return null;
  }
  const video = await Video.findOne({ videoname, type });
  if (video.status !== 'ready') {
    return null;
  }
  // const availableServer = await getAvailableServer(video);
  const server = await availableVideoOnServer(video);
  if (server.length === 0) {
    return null;
  }
  const index = 0;
  const url = server[index].URL;
  const port = server[index].port;
  // nên nhớ 2 port này khác nhau

  const d_server = await getServerWithURLAndPort(toURL, toPort);
  console.log('d_server ' + d_server);
  await addToServer(video, d_server);
  await addUpVideoReplicant(video);
  await createVideoStatus(video, d_server, 'ready');

  return 'http://' + url + port + CONSTANTS.SUB_SERVER_REPLICATE_API + '/send-folder';
};

const RemoveVideoFolder = async (video, d_server) => {
  try {
    const url = d_server.url;
    const port = d_server.port;
    await removeFromServer(video, d_server);
    await reduceVideoReplicant(video);
    await deleteVideoStatus(video, d_server);
    return 'http://' + url + port + CONSTANTS.SUB_SERVER_REPLICATE_API + '/delete-folder';
  } catch (error) {
    return error;
  }
};

const sendConcateRequest = async (fullUrl, arrayChunkName, orginalname) => {
  return await axios({
    method: 'post',
    url: fullUrl,
    data: {
      arraychunkname: arrayChunkName,
      filename: orginalname,
    },
  })
    .then(function (response) {
      console.log(response.data);
    })
    .catch(function (error) {
      console.log(error);
    });
};

const SendFileToOtherNodeAndConvertToHls = async (
  url,
  port,
  arrayChunkName,
  filename,
  destination,
  ext,
  orginalname
) => {
  try {
    const filePath = './' + destination + filename;
    const readStream = fs.createReadStream(filePath);
    var form = new FormData();
    form.append('myMultilPartFileChunk', readStream);
    form.append('arraychunkname', JSON.stringify(arrayChunkName));
    console.log('begin send to other node');

    await axios({
      method: 'post',
      url: url + port + CONSTANTS.SUB_SERVER_REPLICATE_API + '/receive',
      data: form,
      headers: { ...form.getHeaders(), chunkname: filename, ext },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    })
      .then(function (response) {
        const data = response.data;
        // console.log(data);
        if (data.message == CONSTANTS.ENOUGH_FOR_CONCATE_MESSAGE) {
          setTimeout(async () => {
            await sendConcateRequest(
              url + port + CONSTANTS.SUB_SERVER_REPLICATE_API + '/concate-hls',
              arrayChunkName,
              orginalname
            );
          }, 5000);
        }
      })
      .catch(function (error) {
        // console.log(error);
      });

    // console.log('begin delete');
    fs.unlinkSync(filePath);
    // console.log('complete delete ' + filePath);
  } catch (err) {
    console.timeLog(err);
  }
};

const SendFileToOtherNodeAndConvertToDash = async (
  url,
  port,
  arrayChunkName,
  filename,
  destination,
  ext,
  orginalname
) => {
  try {
    const filePath = './' + destination + filename;
    // console.log('sending file ' + filePath);
    const readStream = fs.createReadStream(filePath);
    var form = new FormData();
    form.append('myMultilPartFileChunk', readStream);
    form.append('arraychunkname', JSON.stringify(arrayChunkName));

    // console.log('begin send to other node');
    // console.log('qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq');
    // console.log({ url, port });

    await axios({
      method: 'post',
      url: url + port + CONSTANTS.SUB_SERVER_REPLICATE_API + '/receive',
      data: form,
      headers: { ...form.getHeaders(), chunkname: filename, ext },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    })
      .then(function (response) {
        // console.log(response.data);
        const data = response.data;
        if (data.message == CONSTANTS.ENOUGH_FOR_CONCATE_MESSAGE) {
          setTimeout(async () => {
            await sendConcateRequest(
              url + port + CONSTANTS.SUB_SERVER_REPLICATE_API + '/concate-dash',
              arrayChunkName,
              orginalname
            );
          }, 5000);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
    // console.log('begin delete');
    fs.unlinkSync(filePath);
    // console.log('complete delete ' + filePath);
  } catch (err) {
    // console.timeLog(err);
  }
};

const createVideo = async (videoname, type, title, size) => {
  console.log('redirectAPI.createVideo -> ');
  const video = await Video.create({ videoname, type, title, size });
  return video;
};

const createServer = async (URL, port) => {
  const server = await Server.create({ URL, port });
  return server;
};

const getServerWithURLAndPort = async (URL, port) => {
  console.log('redirectAPI.getServerWithURLAndPort -> ');
  // console.log({ URL, port });
  const server = await Server.findOne({ URL, port });
  // console.log(server);

  return server;
};

const getInfoWithID = async (id) => {
  console.log('redirectController.getInfoWithID -> ');
  console.log(id);
  const info = await Info.findOne({ _id: id });
  return info;
};

const serverAfterUploadOccupyPecentage = (server, afterUploadSize) => {
  return calculatePercentage(server.storage * 1, afterUploadSize);
};
const calculatePercentage = (storage, size) => {
  return (size / storage) * 100;
};

const addToServer = async (video, server) => {
  console.log('redirectController.addToServer -> ');
  if (server === null) {
    console.log('Check URL and port, invalid!');
    return null;
  }
  if (server.videos.includes(video._id)) {
    console.log('Video already on server');
    return server;
  }
  server.videos.push(video);
  server.occupy += video.size * 1;
  const occu = server.occupy;
  server.occupyPercentage = (occu / server.storage) * 100;
  await server.save();
  return server;
};

const removeFromServer = async (video, server) => {
  if (server === null) {
    console.log('Check URL and port, invalid!');
    return null;
  }
  if (!server.videos.includes(video._id)) {
    console.log('Video is not on server');
    return server;
  }

  const index = server.videos.indexOf(video._id);
  if (index > -1) {
    // only splice array when item is found
    server.videos.splice(index, 1); // 2nd parameter means remove one item only
  }
  server.occupy -= video.size * 1;
  const occu = server.occupy;
  server.occupyPercentage = (occu / server.storage) * 100;
  await server.save();
  return server;
};

const createVideoStatus = async (video, server, status) => {
  console.log('redirectController.createVideoStatus -> ');
  if (server === null) {
    console.log('Check URL and port, invalid!');
    return null;
  }
  if (video === null) {
    console.log('Check video, doesnt existed!');
    return null;
  }

  if (status === null) {
    console.log('Need status, default will be ready');
    return null;
  }
  const videoStatus = await VideoStatus.create({ video, server, status });
  return videoStatus;
};

const deleteVideoStatus = async (video, server) => {
  if (server === null) {
    console.log('Check URL and port, invalid!');
    return null;
  }
  if (video === null) {
    console.log('Check video, doesnt existed!');
    return null;
  }
  const videoStatus = await VideoStatus.findOne({ video: video._id, server: server._id });
  await videoStatus.deleteOne();
  return null;
};

const addUpVideoReplicant = async (video) => {
  video.numberOfReplicant++;
  await video.save();
  return video;
};

const reduceVideoReplicant = async (video) => {
  video.numberOfReplicant--;
  await video.save();
  return video;
};

const addToInfo = async (video, infoID) => {
  console.log('redirectController.addToInfo -> ');
  if (infoID === null) {
    return null;
  }
  try {
    const info = await getInfoWithID(infoID);
    console.log(info);
    if (info.videos.includes(video._id)) {
      console.log('Video already in info');
      return info;
    }
    info.videos.push(video);
    await info.save();
    return info;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const checkFolderOnServer = async (baseUrl) => {
  try {
    console.log('redirectAPI.checkFolderOnServer -> ');
    console.log(baseUrl);
    const { data } = await axios.get(baseUrl, { validateStatus: () => true });
    return data;
  } catch (error) {
    console.log(error);
    return error;
  }
};

const sumUp = (req) => {
  const file = req.file;
  const destination = file.destination;
  const ext = req.headers.ext;
  let arrayChunkName = req.body.arraychunkname.split(',');
  let filename = req.headers.filename + '_' + req.headers.index;
  let orginalname = req.headers.filename + '.' + ext;
  let chunkname = req.headers.chunkname;
  let title = req.headers.title;
  let infoID = req.headers.infoid;
  let fileSize = req.headers.filesize;
  return { file, destination, ext, arrayChunkName, filename, orginalname, chunkname, title, infoID, fileSize };
};

const upload = async (index, url, port, arrayChunkName, ext, destination, orginalname, type) => {
  var chunkIndex = 0;
  async function uploadLoop() {
    //  create a loop function
    setTimeout(async function () {
      //  call a 3s setTimeout when the loop is called
      console.log('looping'); //  your code here
      // console.log({ index, url, port, chunkName: arrayChunkName[chunkIndex], ext, destination, orginalname });

      if (type === 'HLS') {
        await SendFileToOtherNodeAndConvertToHls(
          'http://' + url,
          port,
          arrayChunkName,
          arrayChunkName[chunkIndex],
          destination,
          ext,
          orginalname
        );
      } else if (type === 'DASH') {
        await SendFileToOtherNodeAndConvertToDash(
          'http://' + url,
          port,
          arrayChunkName,
          arrayChunkName[chunkIndex],
          destination,
          ext,
          orginalname
        );
      }

      chunkIndex++; //  increment the counter
      if (chunkIndex < arrayChunkName.length) {
        //  if the counter < totalChunks, call the loop function
        uploadLoop(); //  ..  again which will trigger another
      } //  ..  setTimeout()
    }, 500);
  }
  await uploadLoop();
};

const multipartFileIsUploadedEnough = async (req) => {
  const file = req.file;
  const destination = file.destination;
  let arrayChunkName = req.body.arraychunkname.split(',');
  let flag = true;
  for (let i = 0; i < arrayChunkName.length; i++) {
    if (!fs.existsSync(destination + arrayChunkName[i])) {
      flag = false;
    }
  }
  console.log('flag is ' + flag);
  return flag;
};

const checkFileISExistedOnServerYet = async (filename, type) => {
  console.log('redirectAPI.checkFileISExistedOnServerYet -> ');
  const aliveServers = await testServerIsFckingAlive();
  if (aliveServers.length === 0) {
    return {
      message: 'No alive server found',
      noalive: true,
    };
  }
  const index = 0;
  const url = aliveServers[index].URL || 'localhost';
  const port = aliveServers[index].port || '';
  let baseUrl;
  if (type === 'HLS') {
    baseUrl = 'http://' + url + port + CONSTANTS.SUB_SERVER_CHECK_API + '/folder/' + filename + 'Hls';
  } else if (type === 'DASH') {
    baseUrl = 'http://' + url + port + CONSTANTS.SUB_SERVER_CHECK_API + '/folder/' + filename + 'Dash';
  }
  const check = await checkFolderOnServer(baseUrl);
  if (check.existed === true) {
    return {
      message: 'Folder already existed on sub server',
      existed: true,
    };
  }
  return aliveServers;
};

const UploadNewFileLargeMultilpartHls = async (req) => {
  console.log('Dealing with request UploadNewFileLargeMultilpartHls');
  console.log(req.headers);
  // const file = req.file;
  // const destination = file.destination;
  // const ext = req.headers.ext;
  // let arrayChunkName = req.body.arraychunkname.split(',');
  // let filename = req.headers.filename + '_' + req.headers.index;
  // let orginalname = req.headers.filename + '.' + ext;
  // let chunkname = req.headers.chunkname;
  // let title = req.headers.title;
  // let infoID = req.headers.infoID;
  // let flag = multipartFileIsUploadedEnough(req);

  let { file, destination, ext, arrayChunkName, filename, orginalname, chunkname, title, infoID } = sumUp(req);

  let flag = multipartFileIsUploadedEnough(req);

  const aliveServers = await checkFileISExistedOnServerYet(filename, 'HLS');

  console.log(aliveServers);
  if (aliveServers.existed === true) {
    return { ...aliveServers };
  }
  // const aliveServers = await testServerIsFckingAlive();
  // console.log(aliveServers);
  // const index = 0;
  // const url = aliveServers[index].URL || 'localhost';
  // const port = aliveServers[index].port || '';
  // const baseUrl = 'http://' + url + port + CONSTANTS.SUB_SERVER_CHECK_API + '/folder/' + filename + 'Hls';
  // const check = await checkFolderOnServer(baseUrl);
  // if (check.existed === true) {
  //   return {
  //     message: 'Folder already existed on sub server',
  //     check,
  //   };
  // }
  const index = 0;
  const url = aliveServers[index].URL || 'localhost';
  const port = aliveServers[index].port || '';
  if (flag === true) {
    console.log('file is completed');
    await upload(index, url, port, arrayChunkName, ext, destination, orginalname, 'HLS');
    // async function uploadLoop() {
    //   //  create a loop function
    //   setTimeout(async function () {
    //     //  call a 3s setTimeout when the loop is called
    //     console.log('looping'); //  your code here
    //     console.log({ index, url, port, chunkName: arrayChunkName[chunkIndex], ext, destination, orginalname });
    //     await SendFileToOtherNodeAndConvertToHls(
    //       'http://' + url,
    //       port,
    //       arrayChunkName,
    //       arrayChunkName[chunkIndex],
    //       destination,
    //       ext,
    //       orginalname
    //     );

    //     chunkIndex++; //  increment the counter
    //     if (chunkIndex < arrayChunkName.length) {
    //       //  if the counter < totalChunks, call the loop function
    //       uploadLoop(); //  ..  again which will trigger another
    //     } //  ..  setTimeout()
    //   }, 500);
    // }
    // await uploadLoop();

    const newVideo = await createVideo(req.headers.filename, 'HLS', title);
    const d_server = await getServerWithURLAndPort(url, port);
    const addVideoToServer = await addToServer(newVideo, d_server);
    const addVideoToInfo = await addToInfo(newVideo, infoID);

    return {
      message: 'success full upload',
      filename,
      destination,
      full: true,
      addVideoToServer,
      addVideoToInfo,
    };
  } else {
    console.log('file is not completed');
    return {
      message: 'success upload chunk',
      chunkname,
      destination,
      full: false,
    };
  }
};

const UploadNewFileLargeMultilpartDash = async (req, res, next) => {
  console.log('Dealing with request UploadNewFileLargeMultilpartDash');
  console.log(req.headers);

  const { file, destination, ext, arrayChunkName, filename, orginalname, chunkname, title, infoID } = sumUp(req);

  let flag = multipartFileIsUploadedEnough(req);
  const aliveServers = await checkFileISExistedOnServerYet(filename, 'DASH');
  if (aliveServers.check) {
    return { ...aliveServers };
  }
  const index = 0;
  const url = aliveServers[index].URL || 'localhost';
  const port = aliveServers[index].port || '';
  if (flag) {
    console.log('file is completed');
    await upload(index, url, port, arrayChunkName, ext, destination, orginalname, 'DASH');

    const newVideo = await createVideo(req.headers.filename, 'DASH', title);
    const d_server = await getServerWithURLAndPort(url, port);
    const addVideoToServer = await addToServer(newVideo, d_server);
    const addVideoToInfo = await addToInfo(newVideo, infoID);

    return {
      message: 'success full upload',
      filename,
      destination,
      full: true,
      addVideoToServer,
      addVideoToInfo,
    };
  } else {
    console.log('file is not completed');
    return {
      message: 'success upload chunk',
      chunkname,
      destination,
      full: false,
    };
  }
};

module.exports = {
  checkFolderOnServer,
  addToServer,
  createVideo,
  SendFileToOtherNodeAndConvertToDash,
  SendFileToOtherNodeAndConvertToHls,
  ReplicateVideoFolder,
  ReplicateWhenEnoughRequest,
  availableStorageOnServer,
  availableVideoOnServer,
  testServerIsFckingAlive,
  testSpeedResults,
  getAvailableVideoAndType,
  getAvailableVideo,
  getAvailableServer,
  getAvailableVideoID,
  addToInfo,
  UploadNewFileLargeMultilpartHls,
  UploadNewFileLargeMultilpartDash,
  sumUp,
  upload,
  checkFileISExistedOnServerYet,
  availableLiveOnServer,
  addUpVideoReplicant,
  getServerWithURLAndPort,
  createVideoStatus,
  reduceVideoReplicant,
  removeFromServer,
  RemoveVideoFolder,
  deleteVideoStatus,
};
