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
  return servers;
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
  const availableServersStorage = await getAvailableServersStorage(video);
  return availableServersStorage;
};

const getAvailableVideo = async (queryObj) => {
  const availVideoAndType = await Video.findOne(queryObj);
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

const getNetworkCondition = async (url, port) => {
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

const checkServersHealth = async () => {
  const availableServer = await getAllServers();
  if (availableServer.length === 0) {
    console.log('Not found any server');
    return null;
  }
  let testResults = [];
  for (let i = 0; i < availableServer.length; i++) {
    condition = await getNetworkCondition(availableServer[i].URL, availableServer[i].port);
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

const availableStorageOnServer = async (video) => {
  // const availableStorageOnServer = await availableStorageTest(videoname, type);
  const availableStorageOnServer = await availableStorage(video);
  if (availableStorageOnServer === null) {
    return [];
  }

  return availableStorageOnServer;
};

const replicateAgentBasedLoadBalancing = async (video) => {
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
  const redirectURL = await replicateDashVideoURL(video.videoname, video.type, toURL, toPort);
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

const replicateDashVideoURL = async (videoname, type, toURL, toPort) => {
  const video = await Video.findOne({ videoname, type });
  // const availableServer = await getAvailableServer(video);
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

const sendConcateRequest = async (fullUrl, chunkNames, orginalname) => {
  return await axios({
    method: 'post',
    url: fullUrl,
    data: {
      chunkNames: chunkNames,
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

const SendFileToOtherNodeAndConvertToHls = async (url, port, chunkNames, filename, destination, ext, orginalname) => {
  try {
    const filePath = './' + destination + filename;
    // console.log('sending file ' + filePath);
    // console.log(filePath);
    // console.log(fs.existsSync(filePath));
    const readStream = fs.createReadStream(filePath);
    var form = new FormData();
    form.append('multipartFileChunk', readStream);
    form.append('chunkNames', JSON.stringify(chunkNames));
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
              chunkNames,
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

const SendFileToOtherNodeAndConvertToDash = async (url, port, chunkNames, filename, destination, ext, orginalname) => {
  try {
    const filePath = './' + destination + filename;
    // console.log('sending file ' + filePath);
    const readStream = fs.createReadStream(filePath);
    var form = new FormData();
    form.append('multipartFileChunk', readStream);
    form.append('chunkNames', JSON.stringify(chunkNames));

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
              chunkNames,
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
  const video = await Video.create({ videoname, type, title, size });
  return video;
};

const createServer = async (URL, port) => {
  const server = await Server.create({ URL, port });
  return server;
};

const getServerWithURLAndPort = async (URL, port) => {
  console.log({ URL, port });
  const server = await Server.findOne({ URL, port });
  return server;
};

const getInfoWithID = async (id) => {
  console.log(id);
  const info = await Info.findOne({ _id: id });
  return info;
};

const addToServer = async (video, URL, port) => {
  const server = await getServerWithURLAndPort(URL, port);
  console.log(server);
  if (server.videos.includes(video._id)) {
    console.log('Video already on server');
    return server;
  }
  server.videos.push(video);
  await server.save();
  return server;
};

const addUpVideoReplicant = async (video) => {
  video.numberOfReplicant++;
  await video.save();
  return video;
};

const addToInfo = async (video, infoId) => {
  try {
    const info = await getInfoWithID(infoId);
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
  console.log(baseUrl);
  const { data } = await axios.get(baseUrl);
  return data;
};

const sumUp = (req) => {
  const file = req.file;
  const destination = file.destination;
  const ext = req.headers.ext;
  let chunkNames = req.body.chunkNames.split(',');
  let filename = req.headers.filename + '_' + req.headers.index;
  let orginalname = req.headers.filename + '.' + ext;
  let chunkname = req.headers.chunkname;
  let title = req.headers.title;
  let infoId = req.headers.infoid;
  let fileSize = req.headers.filesize;
  return { file, destination, ext, chunkNames, filename, orginalname, chunkname, title, infoId, fileSize };
};

const upload = async (index, url, port, chunkNames, ext, destination, orginalname, type) => {
  var chunkIndex = 0;
  async function uploadLoop() {
    //  create a loop function
    setTimeout(async function () {
      //  call a 3s setTimeout when the loop is called
      console.log('looping'); //  your code here
      // console.log({ index, url, port, chunkName: chunkNames[chunkIndex], ext, destination, orginalname });

      if (type === 'HLS') {
        await SendFileToOtherNodeAndConvertToHls(
          'http://' + url,
          port,
          chunkNames,
          chunkNames[chunkIndex],
          destination,
          ext,
          orginalname
        );
      } else if (type === 'DASH') {
        await SendFileToOtherNodeAndConvertToDash(
          'http://' + url,
          port,
          chunkNames,
          chunkNames[chunkIndex],
          destination,
          ext,
          orginalname
        );
      }

      chunkIndex++; //  increment the counter
      if (chunkIndex < chunkNames.length) {
        //  if the counter < countChunks, call the loop function
        uploadLoop(); //  ..  again which will trigger another
      } //  ..  setTimeout()
    }, 500);
  }
  await uploadLoop();
};

const multipartFileIsUploadedEnough = async (req) => {
  const file = req.file;
  const destination = file.destination;
  let chunkNames = req.body.chunkNames.split(',');
  let flag = true;
  for (let i = 0; i < chunkNames.length; i++) {
    if (!fs.existsSync(destination + chunkNames[i])) {
      flag = false;
    }
  }
  console.log('flag is ' + flag);
  return flag;
};

const checkIfFileExistsOnServer = async (filename, type) => {
  const aliveServers = await checkServersHealth();
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
  // let chunkNames = req.body.chunkNames.split(',');
  // let filename = req.headers.filename + '_' + req.headers.index;
  // let orginalname = req.headers.filename + '.' + ext;
  // let chunkname = req.headers.chunkname;
  // let title = req.headers.title;
  // let infoId = req.headers.infoId;
  // let flag = multipartFileIsUploadedEnough(req);

  let { file, destination, ext, chunkNames, filename, orginalname, chunkname, title, infoId } = sumUp(req);

  let flag = multipartFileIsUploadedEnough(req);

  const aliveServers = await checkIfFileExistsOnServer(filename, 'HLS');

  console.log(aliveServers);
  if (aliveServers.existed === true) {
    return { ...aliveServers };
  }
  // const aliveServers = await checkServersHealth();
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
    await upload(index, url, port, chunkNames, ext, destination, orginalname, 'HLS');
    // async function uploadLoop() {
    //   //  create a loop function
    //   setTimeout(async function () {
    //     //  call a 3s setTimeout when the loop is called
    //     console.log('looping'); //  your code here
    //     console.log({ index, url, port, chunkName: chunkNames[chunkIndex], ext, destination, orginalname });
    //     await SendFileToOtherNodeAndConvertToHls(
    //       'http://' + url,
    //       port,
    //       chunkNames,
    //       chunkNames[chunkIndex],
    //       destination,
    //       ext,
    //       orginalname
    //     );

    //     chunkIndex++; //  increment the counter
    //     if (chunkIndex < chunkNames.length) {
    //       //  if the counter < countChunks, call the loop function
    //       uploadLoop(); //  ..  again which will trigger another
    //     } //  ..  setTimeout()
    //   }, 500);
    // }
    // await uploadLoop();

    const newVideo = await createVideo(req.headers.filename, 'HLS', title);
    const addVideoToServer = await addToServer(newVideo, url, port);
    const addVideoToInfo = await addToInfo(newVideo, infoId);

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

const filterFirstFit = async (servers, filesize) => {
  console.log('filterFirstFit');
  console.log(servers);
  let filterServers = [];

  try {
    for (let i = 0; i < servers.length; i++) {
      console.log('filterFirstFit: Inspect server ' + i);
      const afterUploadSize = servers[i].occupy * 1 + filesize * 1;
      const leftStorage = servers[i].storage * 1 - afterUploadSize;
      if (leftStorage <= 0) {
        continue;
      }
      const url = servers[i].URL;
      const port = servers[i].port;
      const baseUrl = 'http://' + url + port + '/is-this-alive';
      const calculate = await calculateTimeStorage(baseUrl);
      const testSpeed = calculate.mbps * 1;
      const avgSpeed = servers[i].avarageSpeed * 1;
      let numberOfRequest = servers[i].numberOfRequest * 1;
      if (numberOfRequest <= 0) {
        numberOfRequest = 1;
      }
      const fitSpeed = (avgSpeed * numberOfRequest * 1 + testSpeed) / numberOfRequest + 1;
      console.log(fitSpeed);
      filterServers.push({ ...servers[i], fitSpeed });
    }

    const sort = sortFirstFitServer(filterServers);
    console.log(sort);
    return sort;
  } catch (error) {
    console.log(error);
  }
  return servers;
};

const filterBestFit = async (servers, filesize) => {
  console.log('storageStrategiesAPI.filterBestFit -> ');
  // console.log(servers);
  let filterServers = [];

  try {
    for (let i = 0; i < servers.length; i++) {
      console.log('filterBestFit: Inspect server ' + i);
      const afterUploadSize = servers[i].occupy * 1 + filesize * 1;
      const leftStorage = servers[i].storage * 1 - afterUploadSize;
      if (leftStorage <= 0) {
        continue;
      }

      filterServers.push({ ...servers[i], leftStorage });
    }

    const sort = sortBestFitServer(filterServers);
    console.log(sort);
    return sort;
  } catch (error) {
    console.log(error);
  }
  return servers;
};

const sortWeightAllocateServer = (results) => {
  if (results === null || results.length === 0) {
    return [];
  }
  try {
    return results
      .filter((server) => {
        return server.afterUploadOccupyPecentage;
      })
      .sort((a, b) => a.afterUploadOccupyPecentage - b.afterUploadOccupyPecentage);
  } catch (err) {
    console.log(err);
    return [];
  }
};
const sortFirstFitServer = (results) => {
  if (results === null || results.length === 0) {
    return [];
  }
  try {
    return results
      .filter((server) => {
        return server.fitSpeed;
      })
      .sort((a, b) => b.fitSpeed - a.fitSpeed);
  } catch (err) {
    console.log(err);
    return results;
  }
};
const sortBestFitServer = (results) => {
  console.log('storageStrategiesAPI.sortBestFitServer -> ');
  if (results === null || results.length === 0) {
    return [];
  }
  try {
    return results
      .filter((server) => {
        return server.leftStorage;
      })
      .sort((a, b) => b.leftStorage - a.leftStorage);
  } catch (err) {
    console.log(err);
    return [];
  }
};

const filterWeightAllocate = async (servers, filesize) => {
  console.log('filterWeightAllocate');

  let filterServers = [];

  try {
    for (let i = 0; i < servers.length; i++) {
      console.log('Inspect server ' + i);
      const afterUploadSize = servers[i].occupy * 1 + filesize * 1;
      const leftStorage = servers[i].storage * 1 - afterUploadSize;
      if (leftStorage <= 0) {
        continue;
      }
      const afterUploadOccupyPecentage = serverAfterUploadOccupyPecentage(servers[i], afterUploadSize);
      console.log(afterUploadOccupyPecentage);

      filterServers.push({ ...servers[i], afterUploadOccupyPecentage });
    }
    const sort = sortWeightAllocateServer(filterServers);
    return sort;
  } catch (error) {
    console.log(error);
    return servers;
  }
};

const serverAfterUploadOccupyPecentage = (server, afterUploadSize) => {
  return calculatePercentage(server.storage * 1, afterUploadSize);
};

const calculatePercentage = (storage, size) => {
  return (size / storage) * 100;
};

module.exports = {
  filterWeightAllocate,
  filterBestFit,
  filterFirstFit,
  calculatePercentage,
};
