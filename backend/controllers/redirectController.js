const fs = require('fs');
const path = require('path');
const users = JSON.parse(fs.readFileSync('./json-resources/users.json'));
const helperAPI = require('../modules/helperAPI');
// const firebaseAPI = require('../modules/firebaseAPI');
const redirectAPI = require('../modules/redirectAPI');
const storageStrategiesAPI = require('../modules/storageStrategiesAPI');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');
var FormData = require('form-data');

const User = require('./../models/mongo/User');
const Log = require('./../models/mongo/Log');
const Server = require('./../models/mongo/Server');
const Video = require('./../models/mongo/Video');

const fluentFfmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
fluentFfmpeg.setFfmpegPath(ffmpegPath);

const axios = require('axios');
const VideoStatus = require('../models/mongo/VideoStatus');
const { CONSTANTS } = require('../constants/constants');

exports.GetAvailableServerHls = catchAsync(async (req, res, next) => {
  console.log('check hls server');
  console.log(req.query);
  const videoname = req.query.videoname;
  const indexServer = req.query.index || 0;

  const video = await redirectAPI.getAvailableVideoWithCondition({ videoname, type: 'HLS' });

  const server = await redirectAPI.availableVideoOnServer(video);

  const url = server[indexServer].URL;
  const port = server[indexServer].port;
  const baseUrl = 'http://' + url + port + '/api/default/check/hls/' + videoname;
  const { data } = await axios.get(baseUrl);
  res.status(200).json({
    ...data,
  });

  // res.redirect('http://' + url + port + '/api/default/check/hls/' + videoname);
});

exports.GetAvailableServerDash = catchAsync(async (req, res, next) => {
  console.log('check dash server');
  console.log(req.query);
  const videoname = req.query.videoname;
  const indexServer = req.query.index || 0;
  // if (!indexServer || !videoname) {
  //   res.status(200).json({
  //     message: 'Index server or videoname missing',
  //   });
  //   return;
  // }
  // const video = await getAvailableDash(videoname);
  // console.log(video);
  // if (!video) {
  //   res.status(200).json({
  //     message: 'Video not found on database, check name',
  //   });
  //   return;
  // }
  // const availableServer = await getAvailableServer();
  // const numberOfServers = availableServer.length;
  // if (numberOfServers <= indexServer) {
  //   res.status(200).json({
  //     message: 'Server index exceed current available servers',
  //   });
  //   return;
  // }
  const video = await redirectAPI.getAvailableVideoWithCondition({ videoname: videoname, type: 'DASH' });

  const server = await redirectAPI.availableVideoOnServer(video);

  const url = server[indexServer].URL;
  const port = server[indexServer].port;
  const baseUrl = 'http://' + url + port + '/api/default/check/dash/' + videoname;

  const { data } = await axios.get(baseUrl);

  res.status(200).json({
    ...data,
  });

  // res.redirect('http://' + url + port + '/api/default/check/dash/' + videoname);
});

exports.ServerRecall = catchAsync(async (req, res, next) => {
  console.log('recall server');
  console.log(req.query);
  const referer = req.headers.referer;
  console.log(referer);

  const urlAndPort = req.query.url.split(':');
  const url = urlAndPort[0];
  const port = urlAndPort[1];
  const videoname = req.query.videoname;
  res.status(200).json({
    recall: 'recall here',
    path: 'path here',
    url,
    port,
    videoname,
  });
});

exports.CheckSpeedHLS = catchAsync(async (req, res, next) => {
  console.log('check speed');
  const videoname = req.params.filename;
  const testResults = await redirectAPI.testSpeedResults(videoname, 'HLS');

  res.status(400).json({
    message: 'found video',
    downloadSpeeds: testResults,
  });
});

exports.CheckSpeedDASH = catchAsync(async (req, res, next) => {
  console.log('check speed');
  const videoname = req.params.filename;
  const testResults = await redirectAPI.testSpeedResults(videoname, 'DASH');
  res.status(400).json({
    message: 'found video',
    downloadSpeeds: testResults,
  });
});

exports.AllVideoOnServer = catchAsync(async (req, res, next) => {
  console.log('AvailableServerForVideoHls');
  const servers = await Server.find({}).populate('videos');
  if (servers.length === 0) {
    res.status(200).json({
      message: 'Not found any servers',
    });
    return;
  }
  res.status(200).json({
    servers,
  });
});

exports.RedirectHls = catchAsync(async (req, res, next) => {
  console.log('redirect');
  const videoname = req.params.filename;
  const video = await redirectAPI.getAvailableVideoWithCondition({ videoname: videoname, type: 'HLS' });
  const server = await redirectAPI.availableVideoOnServer(video);
  if (server.length === 0) {
    res.status(200).json({
      message: 'Not found Server with Video, check name or server connections',
    });
    return;
  }

  const videoNumberOfRequest = video.numberOfRequest;
  video.numberOfRequest += 0.5;
  await video.save();

  if (videoNumberOfRequest === 50 || videoNumberOfRequest === 100) {
    console.log('Request Reached! ' + videoNumberOfRequest);
    const replicateResult = await redirectAPI.replicateAgentBasedLoadBalancing(video);
    console.log(replicateResult);
  }

  const index = 0;
  const url = server[index].URL || 'localhost';
  const port = server[index].port || '';
  const oriURL = 'http://' + url + port + '/videos/' + videoname + 'Hls/' + videoname + '.m3u8';
  if (req.headers.myaxiosfetch) {
    res.status(200).json({
      subserverurl: oriURL,
    });
    res.end();
    return;
  }
  res.redirect(oriURL);
  res.end();
});

exports.RedirectLive = catchAsync(async (req, res, next) => {
  console.log('redirect live');
  const videoname = req.params.filename;
  // console.log(video);
  // const server = await redirectAPI.availableLiveOnServer(videoname);
  // if (server.length === 0) {
  //   res.status(200).json({
  //     message: 'Not found Live server, check name or server connections',
  //   });
  //   return;
  // }

  const index = 0;
  // const url = server[index].URL || 'localhost';
  // const port = server[index].port || ':1936';
  const url = 'localhost';
  const port = ':1936';
  const oriURL = 'rtmp://' + url + port + '/live/' + videoname;
  if (req.headers.myaxiosfetch) {
    res.status(200).json({
      subserverurl: oriURL,
    });
    res.end();
    return;
  }
  console.log(oriURL);

  res.redirect(oriURL);
  // res.end();
});

exports.AvailableServerForVideoHls = catchAsync(async (req, res, next) => {
  console.log('AvailableServerForVideoHls');
  const videoname = req.params.filename;
  console.log(videoname);
  const video = await redirectAPI.getAvailableVideoWithCondition({ videoname: videoname, type: 'HLS' });

  const servers = await redirectAPI.availableVideoOnServer(video);
  if (servers.length === 0) {
    res.status(200).json({
      message: 'Not found Server with Video, check name or server connections',
    });
    return;
  }
  res.status(200).json({
    servers,
  });
});

exports.AvailableServerForVideoDash = catchAsync(async (req, res, next) => {
  console.log('AvailableServerForVideoDash');
  const videoname = req.params.filename;
  console.log(videoname);
  const video = await redirectAPI.getAvailableVideoWithCondition({ videoname: videoname, type: 'DASH' });

  console.log('video');
  console.log(video);
  const servers = await redirectAPI.availableVideoOnServer(video);
  if (servers.length === 0) {
    res.status(200).json({
      message: 'Not found Server with Video, check name or server connections',
    });
    return;
  }
  res.status(200).json({
    servers,
  });
});

exports.RedirectDash = catchAsync(async (req, res, next) => {
  console.log('redirectController.RedirectDash -> ');
  const videoname = req.params.filename;
  const video = await redirectAPI.getAvailableVideoWithCondition({ videoname: videoname, type: 'DASH' });
  const servers = await redirectAPI.availableVideoOnServer(video);
  if (servers.length === 0) {
    res.status(200).json({
      message: 'Not found Server with Video, check name or servers connections',
    });
    return;
  }

  const videoNumberOfRequest = video.numberOfRequest;
  video.numberOfRequest += 1;
  await video.save();
  let isAgentBasedReplicateEnabled = false;
  if (
    // videoNumberOfRequest === 50 ||
    // videoNumberOfRequest === 100 ||
    // videoNumberOfRequest === 150 ||
    // videoNumberOfRequest === 200 ||
    isAgentBasedReplicateEnabled
  ) {
    console.log('Request Reached! ' + videoNumberOfRequest);
    const replicateResult = await redirectAPI.replicateAgentBasedLoadBalancing(video);
    console.log(replicateResult);
  }

  const index = 0;
  const url = servers[index].URL || 'localhost';
  const port = servers[index].port || '';
  const server = await redirectAPI.getServerWithURLAndPort(url, port);
  server.numberOfRequest += 1;
  console.log('servers ' + index + ' is: ');
  console.log(servers[index]);
  const updatedSpeed =
    (server.avarageSpeed * server.numberOfRequest * 1 + servers[index].mbps * 1) / (server.numberOfRequest * 1 + 1);
  server.avarageSpeed = updatedSpeed;
  await server.save();
  console.log({ updatedSpeed, servernumberofrequest: server.numberOfRequest });

  const oriURL = 'http://' + url + port + '/videos/' + videoname + 'Dash/init.mpd';
  //If there is myaxiosfetch on headers, it web client's redirect request, if not, it media player's request
  if (req.headers.myaxiosfetch) {
    console.log('req.headers.myaxiosfetch existed');
    console.log(oriURL);
    res.status(200).json({
      subserverurl: oriURL,
    });
    res.end();
    return;
  }
  console.log(oriURL);
  res.redirect(oriURL);
  res.end();
});

exports.M4SHandler = catchAsync(async (req, res, next) => {
  console.log('m4s handler');
  // console.log(req);
  const filebasename = req.params.filenamebase;
  const video = await redirectAPI.getAvailableVideoWithCondition({ videoname: filebasename, type: 'DASH' });

  const server = await redirectAPI.availableVideoOnServer(video);
  if (server.length === 0) {
    res.status(200).json({
      message: 'Not found Server with Video, check name or server connections',
    });
    return;
  }
  const index = 0;
  const url = server[index].URL || 'localhost';
  const port = server[index].port || '';
  req.url = req.url.replace('/dash/', '/videos/');
  req.url = req.url.replace(filebasename, filebasename + 'Dash');
  const oriURL = 'http://' + url + port + req.url;
  console.log(oriURL);

  res.redirect(oriURL);
  res.end();
});

exports.RedirectReplicateRequest = catchAsync(async (req, res, next) => {
  console.log('redirect post replicate');
  console.log(req.body);
  const filename = req.body.filename || 'mkvmedium';
  const videoname = filename.split('Hls')[0].split('Dash')[0];
  console.log(videoname);
  const video = await Video.findOne({ videoname });
  const availableServer = await redirectAPI.getAvailableServer(video);
  const index = 0;
  const url = availableServer[index].URL || 'localhost';
  const port = availableServer[index].port || '';
  console.log({ url, port });
  res.redirect(308, 'http://' + url + port + CONSTANTS.SUB_SERVER_REPLICATE_API + '/send');
  res.end();
});

exports.RedirectDeleteRequest = catchAsync(async (req, res, next) => {
  console.log('redirect post delete');
  console.log(req.body);
  const url = req.body.url || 'localhost';
  const port = req.body.port || '';
  const video = await Video.findOne({ videoname: req.body.videoname });
  if (video.numberOfReplicant <= 1) {
    console.log('Cant not delete video with lower thanh 1 replicate');
    res.status(400).json({
      message: 'Cant not delete video with lower thanh 1 replicate',
    });
    return;
  }
  const server = await redirectAPI.getServerWithURLAndPort(url, port);
  const result = await redirectAPI.RemoveVideoFolder(video, server);
  console.log(result);
  res.redirect(308, 'http://' + url + port + '/api/v1/delete');
  res.end();
});

exports.RedirectReplicateFolderRequest = catchAsync(async (req, res, next) => {
  console.log('redirect post replicate folder');
  console.log(req.body);
  const filename = req.body.filename || 'mkvmediumHls';
  const toURL = req.body.url;
  const toPort = req.body.port || '';
  const videoname = filename.split('Hls')[0].split('Dash')[0];
  const type = filename.split(videoname)[1] === 'Hls' ? 'HLS' : 'DASH';
  // const videoname=filename.split('Hls')[0].split('Dash')[0];
  // console.log(videoname)
  // const video=await Video.findOne({videoname});
  // const availableServer = await getAvailableServer(video);
  // const index = 0;
  // console.log(availableServer)
  // const url =availableServer[index].URL||'localhost';
  // const port =availableServer[index].port||'';
  // // nên nhớ 2 port này khác nhau
  // await addToServer(video,toURL,toPort);
  // res.redirect(308, 'http://' + url + port + CONSTANTS.SUB_SERVER_REPLICATE_API+ '/send-folder');

  const redirectURL = await redirectAPI.replicateDashVideoURL(videoname, type, toURL, toPort);
  console.log(redirectURL);
  if (!redirectURL) {
    res.status(200).json({
      message: 'Not found any available server to replicate',
    });
    return;
  }

  // res.redirect(308, redirectURL);
  // res.end();

  try {
    console.log({ redirectURL, reqbody: req.body });
    const { data } = await axios({
      method: 'post',
      url: redirectURL,
      data: req.body,
      headers: req.headers,
      validateStatus: () => true,
    });
  } catch (error) {
    console.log(error);
  }

  res.status(200).json({
    message: 'Command sent!',
    redirectURL,
  });
});

exports.RedirectDeleteFolderRequest = catchAsync(async (req, res, next) => {
  console.log('RedirectDeleteFolderRequest');
  console.log(req.body);
  const url = req.body.url || 'localhost';
  const port = req.body.port || '';
  const server = await Server.findOne({ URL: url, port: port });
  if (!server) {
    res.status(200).json({
      message: 'Cant find server on that database',
    });
    return;
  }
  const filename = req.body.filename;
  const videoname = filename.split('Hls')[0].split('Dash')[0];
  const video = await Video.findOne({ videoname, type: 'DASH' });
  if (!video) {
    res.status(200).json({
      message: 'Cant find video on database',
    });
    return;
  }

  if (!server.videos.includes(video._id)) {
    res.status(200).json({
      message: 'Cant find video on that server',
    });
    return;
  }
  const reduced_index = video.numberOfReplicant - 1;
  if (reduced_index === 0) {
    res.status(200).json({
      message: 'Cant delete the last copy, if you insist, delete manually!',
      failed: true,
    });
    return;
  }

  // res.redirect(308, 'http://' + url + port + '/api/v1/delete/folder');
  // res.end();

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

    const status = await VideoStatus.findOne({ video: video._id, server: server._id });
    await status.deleteOne();

    res.status(200).json({
      message: 'Deleted video on server!',
      hint: data.message,
    });
    return;
  } catch (error) {
    console.log(error);
    res.status(200).json({
      message: 'Somethings happended!',
      error,
    });
    return;
  }
});

exports.UploadNewFileLargeMultilpartHls = catchAsync(async (req, res, next) => {
  // const result= await redirectAPI.UploadNewFileLargeMultilpartHls(req);
  // res.status(201).json(result);

  console.log('Dealing with request UploadNewFileLargeMultilpartHls');
  console.log(req.headers);
  let { file, destination, ext, chunkNames, filename, orginalname, chunkname, title, infoId } = redirectAPI.sumUp(req);

  // const file = req.file;
  // const destination = file.destination;
  // const ext = req.headers.ext;
  // let chunkNames = req.body.chunkNames.split(',');
  // let filename = req.headers.filename + '_' + req.headers.index;
  // let orginalname = req.headers.filename + '.' + ext;
  // let chunkname = req.headers.chunkname;
  // let title=req.headers.title;
  // let infoId=req.headers.infoId;

  let flag = true;
  chunkNames.forEach((chunkName) => {
    if (!fs.existsSync(destination + chunkName)) {
      flag = false;
    }
  });
  const aliveServers = await redirectAPI.checkIfFileExistsOnServer(filename, 'HLS');
  console.log(aliveServers);
  if (aliveServers.existed === true) {
    res.status(200).json({
      message: 'Folder already existed on sub server',
      servers: filteredServer,
    });
    return;
  }
  const index = 0;
  const url = aliveServers[index].URL || 'localhost';
  const port = aliveServers[index].port || '';
  // const baseUrl = 'http://' + url + port + CONSTANTS.SUB_SERVER_CHECK_API + '/folder/' + filename + 'Hls';
  // const check = await redirectAPI.checkFolderOnServer(baseUrl);
  // if (check.existed === true) {
  //   res.status(200).json({
  //     message: 'Folder already existed on sub server',
  //     check,
  //   });
  //   return;
  // }

  if (flag) {
    console.log('file is completed');
    // var chunkIndex = 0;
    // async function uploadLoop() {
    //   //  create a loop function
    //   setTimeout(async function () {
    //     //  call a 3s setTimeout when the loop is called
    //     console.log('looping'); //  your code here
    //     await redirectAPI.SendFileToOtherNodeAndConvertToHls(
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

    await redirectAPI.upload(index, url, port, chunkNames, ext, destination, orginalname, 'HLS');

    const newVideo = await redirectAPI.createVideo(req.headers.filename, 'HLS', title);
    const addVideoToServer = await redirectAPI.addToServer(newVideo, url, port);
    const addVideoToInfo = await redirectAPI.addToInfo(newVideo, infoId);

    res.status(201).json({
      message: 'success full upload',
      filename,
      destination,
      full: true,
      addVideoToServer,
      addVideoToInfo,
    });
  } else {
    console.log('file is not completed');

    res.status(201).json({
      message: 'success upload chunk',
      chunkname,
      destination,
      full: false,
    });
  }

  // res.redirect('http://' + url + port + '/api/v1/video/upload-video-large-multipart');
});

exports.UploadNewFileLargeMultilpartDash = catchAsync(async (req, res, next) => {
  console.log('Dealing with request UploadNewFileLargeMultilpartDash');
  console.log(req.headers);

  let { file, destination, ext, chunkNames, filename, orginalname, chunkname, title, infoId } = redirectAPI.sumUp(req);
  let flag = true;
  chunkNames.forEach((chunkName) => {
    if (!fs.existsSync(destination + chunkName)) {
      flag = false;
    }
  });
  const aliveServers = await redirectAPI.checkIfFileExistsOnServer(filename, 'DASH');
  console.log(aliveServers);
  if (aliveServers.existed === true) {
    res.status(200).json({
      message: 'Folder already existed on sub server',
      servers: filteredServer,
    });
    return;
  }
  const index = 0;
  const url = aliveServers[index].URL || 'localhost';
  const port = aliveServers[index].port || '';
  if (flag) {
    console.log('file is completed');

    await redirectAPI.upload(index, url, port, chunkNames, ext, destination, orginalname, 'DASH');
    const newVideo = await redirectAPI.createVideo(req.headers.filename, 'DASH', title);
    const addVideoToServer = await redirectAPI.addToServer(newVideo, url, port);
    const addVideoToInfo = await redirectAPI.addToInfo(newVideo, infoId);

    res.status(201).json({
      message: 'success full upload',
      filename,
      destination,
      full: true,
      addVideoToServer,
      addVideoToInfo,
    });
  } else {
    console.log('file is not completed');

    res.status(201).json({
      message: 'success upload chunk',
      chunkname,
      destination,
      full: false,
    });
  }

  // res.redirect('http://' + url + port + '/api/v1/video/upload-video-large-multipart');
});

exports.RequestUploadURLHls = catchAsync(async (req, res, next) => {
  console.log('Dealing with request RequestUploadURLHls');
  let { file, destination, ext, chunkNames, filename, orginalname, chunkname, title, infoId } = req.body;
  let flag = true;
  const aliveServers = await redirectAPI.checkIfFileExistsOnServer(filename, 'HLS');
  console.log(aliveServers);
  if (aliveServers.existed === true || aliveServers.noalive === true) {
    res.status(200).json({
      servers: filteredServer,

      failed: true,
    });
    return;
  }
  const index = 0;
  const url = aliveServers[index].URL || 'localhost';
  const port = aliveServers[index].port || '';
  res.status(200).json({
    status: 200,
    message: 'found servers for upload',
    servers: filteredServer,
  });
});

exports.PreferUploadURL = catchAsync(async (req, res, next) => {
  console.log('Dealing with request PreferUploadURL');
  let { filename, title, infoId, filesize, preferurl } = req.headers;
  if (!preferurl) {
    next();
    return;
  }
  const actual_size = (300000000 * 1.25) / 1000000;

  let preferport = req.headers.preferport || '';
  const video = await redirectAPI.getAvailableVideoWithCondition({ videoname: filename, type: 'DASH' });
  if (video !== null) {
    res.status(200).json({
      message: 'There is the same video with filename and type, pick another',
      failed: true,
    });
    return;
  }
  const baseUrl = 'http://' + preferurl + preferport + CONSTANTS.SUB_SERVER_CHECK_API + '/folder/' + filename + 'Dash';
  const check = await redirectAPI.checkFolderOnServer(baseUrl);
  if (check.existed === true) {
    res.status(200).json({
      message: 'Folder already existed on sub server',
      existed: true,
    });
    return;
  }
  if (check.code === 'ECONNREFUSED') {
    res.status(200).json({
      message: 'Error with connection, maybe the prefer server is down or not existed, check url and port',
      error: true,
    });
    return;
  }
  const newVideo = await redirectAPI.createVideo(filename, 'DASH', title, actual_size);
  const d_server = await redirectAPI.getServerWithCondition({ URL: preferurl, port: preferport });
  const videoStatus = await redirectAPI.createVideoStatus(newVideo, d_server, 'uploading');
  const addVideoToServer = await redirectAPI.addToServer(newVideo, d_server);
  const addVideoToInfo = await redirectAPI.addToInfo(newVideo, infoId);

  res.status(200).json({
    status: 200,
    message: 'You have prefered server!',
    servers: [{ URL: preferurl, PORT: preferport, uploadURL: 'http://' + preferurl + preferport + '/api/v1/upload/' }],
    videoStatus: videoStatus,
  });
});
exports.RequestUploadURLDash = catchAsync(async (req, res, next) => {
  console.log('Dealing with request RequestUploadURLDash');
  let { file, destination, ext, chunkNames, filename, orginalname, chunkname, title, infoId, filesize } = req.headers;
  const actual_size = (300000000 * 1.25) / 1000000;

  console.log(req.headers);
  let flag = true;
  const video = await redirectAPI.getAvailableVideoWithCondition({ videoname: filename, type: 'DASH' });
  if (video !== null) {
    res.status(200).json({
      message: 'There is the same video with filename and type, pick another',
      failed: true,
    });
    return;
  }
  const aliveServers = await redirectAPI.checkIfFileExistsOnServer(filename, 'DASH');
  if (aliveServers.existed === true || aliveServers.noalive === true) {
    res.status(400).json({
      status: 400,
      servers: filteredServer,

      failed: true,
      message: 'Server already existed video or there is no server alive for upload!',
    });
    return;
  }
  const filteredServer = await storageStrategiesAPI.filterBestFit(aliveServers, actual_size);
  const index = 0;
  const url = filteredServer[index].URL || 'localhost';
  const port = filteredServer[index].port || '';

  const newVideo = await redirectAPI.createVideo(filename, 'DASH', title, actual_size);
  const d_server = await redirectAPI.getServerWithCondition({ URL: url, port: port });
  const addVideoToServer = await redirectAPI.addToServer(newVideo, d_server);
  const videoStatus = await redirectAPI.createVideoStatus(newVideo, d_server, 'uploading');
  const addVideoToInfo = await redirectAPI.addToInfo(newVideo, infoId);

  // res.status(400).json({
  //   status: 400,
  //   message: 'no, still updated! found servers for upload',
  //   aliveServers,
  // });
  // return;
  res.status(200).json({
    status: 200,
    message: 'found servers for upload',
    servers: filteredServer,
    videoStatus: videoStatus,
  });
});

exports.getUploadURLDashWeightAllocate = catchAsync(async (req, res, next) => {
  console.log('Dealing with request getUploadURLDashWeightAllocate');
  let { file, destination, ext, chunkNames, filename, orginalname, chunkname, title, infoId, filesize } = req.headers;
  console.log(req.headers);
  const actual_size = (300000000 * 1.25) / 1000000;
  let flag = true;

  const video = await redirectAPI.getAvailableVideoWithCondition({ videoname: filename, type: 'DASH' });
  if (video !== null) {
    res.status(200).json({
      message: 'There is the same video with filename and type, pick another',
      failed: true,
    });
    return;
  }

  const aliveServers = await redirectAPI.checkIfFileExistsOnServer(filename, 'DASH');
  if (aliveServers.existed === true || aliveServers.noalive === true) {
    res.status(400).json({
      status: 400,
      servers: filteredServer,

      failed: true,
      message: 'Server already existed video or there is no server alive for upload!',
    });
    return;
  }

  const filteredServer = await storageStrategiesAPI.filterWeightAllocate(aliveServers, actual_size);

  const index = 0;
  const url = filteredServer[index].URL || 'localhost';
  const port = filteredServer[index].port || '';

  const newVideo = await redirectAPI.createVideo(filename, 'DASH', title, actual_size);
  const d_server = await redirectAPI.getServerWithCondition({ URL: url, port: port });
  const addVideoToServer = await redirectAPI.addToServer(newVideo, d_server);
  const videoStatus = await redirectAPI.createVideoStatus(newVideo, d_server, 'uploading');
  const addVideoToInfo = await redirectAPI.addToInfo(newVideo, infoId);

  res.status(200).json({
    status: 200,
    message: 'found servers for upload',
    servers: filteredServer,
    videoStatus: videoStatus,
  });
});

exports.getUploadURLDashBestFit = catchAsync(async (req, res, next) => {
  // console.log('Dealing with request getUploadURLDashWeightAllocate');
  console.log('redirectController -> redirectController.getUploadURLDashBestFit -> ');
  let { file, destination, ext, chunkNames, filename, orginalname, chunkname, title, infoId, filesize } = req.headers;
  console.log(req.headers);
  const actual_size = (300000000 * 1.25) / 1000000;

  let flag = true;

  const video = await redirectAPI.getAvailableVideoWithCondition({ videoname: filename, type: 'DASH' });
  if (video !== null) {
    res.status(200).json({
      message: 'There is the same video with filename and type, pick another',
      failed: true,
    });
    return;
  }

  const aliveServers = await redirectAPI.checkIfFileExistsOnServer(filename, 'DASH');
  if (aliveServers.existed === true || aliveServers.noalive === true) {
    res.status(400).json({
      status: 400,
      servers: filteredServer,

      failed: true,
      message: 'Server already existed video or there is no server alive for upload!',
    });
    return;
  }

  const filteredServer = await storageStrategiesAPI.filterBestFit(aliveServers, actual_size);

  const index = 0;
  const url = filteredServer[index].URL || 'localhost';
  const port = filteredServer[index].port || '';

  const newVideo = await redirectAPI.createVideo(filename, 'DASH', title, actual_size);
  const d_server = await redirectAPI.getServerWithCondition({ URL: url, port: port });
  const videoStatus = await redirectAPI.createVideoStatus(newVideo, d_server, 'uploading');
  const addVideoToServer = await redirectAPI.addToServer(newVideo, d_server);
  const addVideoToInfo = await redirectAPI.addToInfo(newVideo, infoId);

  res.status(200).json({
    status: 200,
    message: 'found servers for upload',
    servers: filteredServer,
    videoStatus: videoStatus,
  });
});

exports.getUploadURLDashFirstFit = catchAsync(async (req, res, next) => {
  console.log('Dealing with request getUploadURLDashWeightAllocate');
  let { file, destination, ext, chunkNames, filename, orginalname, chunkname, title, infoId, filesize } = req.headers;
  console.log(req.headers);
  const actual_size = (300000000 * 1.25) / 1000000;

  let flag = true;

  const video = await redirectAPI.getAvailableVideoWithCondition({ videoname: filename, type: 'DASH' });
  if (video !== null) {
    res.status(200).json({
      message: 'There is the same video with filename and type, pick another',
      failed: true,
    });
    return;
  }

  const aliveServers = await redirectAPI.checkIfFileExistsOnServer(filename, 'DASH');
  if (aliveServers.existed === true || aliveServers.noalive === true) {
    res.status(400).json({
      status: 400,
      servers: filteredServer,

      failed: true,
      message: 'Server already existed video or there is no server alive for upload!',
    });
    return;
  }

  const filteredServer = await storageStrategiesAPI.filterFirstFit(aliveServers, actual_size);

  const index = 0;
  const url = filteredServer[index].URL || 'localhost';
  const port = filteredServer[index].port || '';

  const newVideo = await redirectAPI.createVideo(filename, 'DASH', title, actual_size);
  const d_server = await redirectAPI.getServerWithCondition({ URL: url, port: port });
  const addVideoToServer = await redirectAPI.addToServer(newVideo, d_server);
  const videoStatus = await redirectAPI.createVideoStatus(newVideo, d_server, 'uploading');
  const addVideoToInfo = await redirectAPI.addToInfo(newVideo, infoId);

  res.status(200).json({
    status: 200,
    message: 'found servers for upload',
    servers: filteredServer,
    videoStatus: videoStatus,
  });
});

exports.GetAvailableStorageForVideo = catchAsync(async (req, res, next) => {
  console.log('Dealing with request GetAvailableStorageForVideo');
  const videoname = req.body.videoname || 'GSpR1T8';
  const type = req.body.type || 'HLS';
  const video = await redirectAPI.getAvailableVideoWithCondition({ videoname: videoname, type: type });
  const server = await redirectAPI.availableStorageOnServer(video);
  if (server.length === 0) {
    console.log('There is no more available storage, the video and type is everywhere! ' + videoname + ' ' + type);
  }
  const index = 0;
  const url = server[index].URL || 'http://localhost';
  const port = server[index].port || '';
  res.status(200).json({
    message: 'All avaiable servers',
    server,
    videoname,
    type,
  });
});

exports.AllVideos = catchAsync(async (req, res, next) => {
  console.log('Dealing with AllVideos');
  const videos = await Video.find({});
  res.status(200).json({
    message: 'All videos',
    data: { videos },
  });
});

exports.SendFolderFileToOtherNode = catchAsync(async (req, res, next) => {
  console.log('replicate folder controller');
  const filename = req.body.filename || 'World Domination How-ToHls';
  const videoPath = 'videos/' + filename + '/';
  const url = req.body.url || 'http://localhost';
  const port = req.body.port || ':9200';

  const baseUrl = url + port + CONSTANTS.SUB_SERVER_CHECK_API + '/folder/' + filename;
  console.log(baseUrl);
  const { data: check } = await axios.get(baseUrl);
  console.log(check);
  if (check.existed === true) {
    res.status(200).json({
      message: 'Folder already existed on sub server',
      check,
    });
    return;
  }
  if (!fs.existsSync(videoPath)) {
    res.status(200).json({
      message: 'File not found',
      path: videoPath,
    });
    return;
  }
  console.log('File found!: ' + videoPath);
  const dir = 'videos/' + filename;
  console.log(dir);
  const fileList = fs.readdirSync(dir);
  console.log(fileList);
  for (let i = 0; i < fileList.length; i++) {
    const filePath = videoPath + '/' + fileList[i];
    console.log(filePath);
    console.log(fs.existsSync(filePath));
    const readStream = fs.createReadStream(filePath);
    var form = new FormData();
    form.append('myFolderFile', readStream);
    const { data } = await axios({
      method: 'post',
      url: url + port + CONSTANTS.SUB_SERVER_REPLICATE_API + '/receive-folder',
      data: form,
      headers: { ...form.getHeaders(), filename: fileList[i], folder: filename },
    });
    console.log(data);
  }
  res.status(200).json({
    message: 'Folder sent!',
    videoPath,
  });
  return;
});

exports.UploadNewFileLargeMultilpartConcatenate = catchAsync(async (req, res, next) => {
  const availableServer = await redirectAPI.getAvailableServer();
  if (availableServer.length === 0) {
    res.status(200).json({
      message: 'Not found any server',
    });
    return;
  }
  const index = 0;
  const url = 'localhost';
  const port = '';
});

exports.UploadNewFileLargeConvertToHls = catchAsync(async (req, res, next) => {
  const file = req.file;
  const filePath = file.path;
  const destination = file.destination;
  const filenameWithoutExt = file.filename.split('.')[0];
  const outputFolder = destination + filenameWithoutExt + 'Hls';
  const outputResult = outputFolder + '/' + filenameWithoutExt + '.m3u8';
  fs.access(outputFolder, (error) => {
    // To check if the given directory
    // already exists or not
    if (error) {
      // If current directory does not exist
      // then create it
      fs.mkdir(outputFolder, (error) => {
        if (error) {
          console.log(error);
        } else {
          console.log('New Directory created successfully !!');
        }
      });
    } else {
      console.log('Given Directory already exists !!');
    }
  });
  console.log(file);
  console.log('Do ffmpeg shit');

  await new ffmpeg()
    .addInput(filePath)
    .outputOptions([
      // '-map 0:v',
      // '-map 0:v',
      // '-map 0:a',
      // '-map 0:a',
      // '-s:v:0 426x240',
      // '-c:v:0 libx264',
      // '-b:v:0 400k',
      // '-c:a:0 aac',
      // '-b:a:0 64k',
      // '-s:v:1 640x360',
      // '-c:v:1 libx264',
      // '-b:v:1 700k',
      // '-c:a:1 aac',
      // '-b:a:1 96k',
      // //'-var_stream_map', '"v:0,a:0 v:1,a:1"',
      // '-master_pl_name '+filenameWithoutExt+'_master.m3u8',
      // '-f hls',
      // '-max_muxing_queue_size 1024',
      // '-hls_time 4',
      // '-hls_playlist_type vod',
      // '-hls_list_size 0',
      // // '-hls_segment_filename ./videos/output/v%v/segment%03d.ts',

      '-c:v copy',
      '-c:a copy',
      //'-var_stream_map', '"v:0,a:0 v:1,a:1"',
      '-level 3.0',
      '-start_number 0',
      '-master_pl_name ' + filenameWithoutExt + '_master.m3u8',
      '-f hls',
      '-hls_list_size 0',
      '-hls_time 10',
      '-hls_playlist_type vod',
      // '-hls_segment_filename ./videos/output/v%v/segment%03d.ts',
    ])
    .output(outputResult)
    .on('start', function (commandLine) {
      console.log('Spawned Ffmpeg with command: ' + commandLine);
    })
    .on('error', function (err, stdout, stderr) {
      console.error('An error occurred: ' + err.message, err, stderr);
    })
    .on('progress', function (progress) {
      console.log('Processing: ' + progress.percent + '% done');
      console.log(progress);
      /*percent = progress.percent;
      res.write('<h1>' + percent + '</h1>');*/
    })
    .on('end', function (err, stdout, stderr) {
      console.log('Finished processing!' /*, err, stdout, stderr*/);
      fs.unlinkSync(filePath, function (err) {
        if (err) throw err;
        console.log(filePath + ' deleted!');
      });
    })
    .run();
});
