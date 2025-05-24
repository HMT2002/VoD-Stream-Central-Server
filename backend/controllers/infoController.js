const fs = require('fs');
const path = require('path');
const moment = require('moment');

const Thread = require('../models/mongo/Thread');
const User = require('../models/mongo/User');
const Comment = require('../models/mongo/Comment');
const Like = require('../models/mongo/Like');
const Notification = require('../models/mongo/Notification');
const Info = require('../models/mongo/Info');

const redirectAPI = require('../modules/redirectAPI');
const infoAPI = require('../modules/infoAPI');

const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const axios = require('axios');

exports.GetAll = catchAsync(async (req, res, next) => {
  console.log('infoController.GetAll -> ');

  const tv = await infoAPI.GetAll();
  res.status(200).json({
    status: 200,
    data: tv,
  });
});

exports.GetTV = catchAsync(async (req, res, next) => {
  const tv = await infoAPI.GetTV(req.params.id);

  res.status(200).json({
    status: 200,
    data: tv,
  });
});

exports.QueryTV = catchAsync(async (req, res, next) => {
  const tv = await infoAPI.QueryTV(req.params.query);

  res.status(200).json({
    status: 200,
    data: tv,
  });
});

exports.GetMovie = catchAsync(async (req, res, next) => {
  const movie = await infoAPI.GetMovie(req.params.id);

  res.status(200).json({
    status: 200,
    data: movie,
  });
});

exports.AllGetMovieOnDatabase = catchAsync(async (req, res, next) => {
  const movie = await infoAPI.AllGetMovieOnDatabase(req.params.id);

  res.status(200).json({
    status: 200,
    data: movie,
  });
});

exports.GetInfoByID = catchAsync(async (req, res, next) => {
  console.log('infoController.GetInfoByID -> ');
  const info = await infoAPI.GetFilm(req.params.id);
  req.info = info;
  next();
});

exports.GetFilm = catchAsync(async (req, res, next) => {
  const info = req.info;

  res.status(200).json({
    status: 200,
    data: info,
  });
});

exports.AddEpisodes = catchAsync(async (req, res, next) => {
  console.log(req.body);
  const result = await infoAPI.AddEpisodes(req);

  res.status(200).json({
    status: 200,
    data: result,
  });
});

exports.QueryMovie = catchAsync(async (req, res, next) => {
  const movie = await infoAPI.QueryMovie(req.params.query);

  res.status(200).json({
    status: 200,
    data: movie,
  });
});

exports.CreateInfo = catchAsync(async (req, res, next) => {
  const filmID = req.body.filmID;
  req.body.videos.forEach(async (id) => {
    const video = await redirectAPI.getAvailableVideoID(id);
    id = video;
  });

  const testInfo = await Info.findOne({ filmID });
  if (testInfo) {
    next(new AppError('This info already belong to other film.', 409));
    return;
  }
  const filmType = req.body.filmType;
  if (filmType === 'TV') {
    req.body.filmInfo = await infoAPI.GetTV(filmID);
  } else {
    req.body.filmInfo = await infoAPI.GetMovie(filmID);
  }

  const user = req.user;
  req.body.user = user;

  try {
    const newInfo = await Info.create({ ...req.body });
    res.status(200).json({
      status: 200,
      newInfo,
    });
  } catch (err) {
    console.log(err);
    next(new AppError('Something wrong.', 400));
  }
});

exports.CreateInfoMovie = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 200,
    data: tv,
  });
});

exports.CreateInfoTV = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 200,
    data: tv,
  });
});
exports.getAllFilmsForDashboard = catchAsync(async (req, res, next) => {
  console.log('Dealing with getAllFilmsForDashboard');
  let films = [];
  const filmsDB = await Info.find({});
  for (let i = 0; i < filmsDB.length; i++) {
    console.log(filmsDB[i]);
    let film = {};
    film._id = filmsDB[i]._id;
    film.filmInfo = filmsDB[i].filmInfo;
    films.push(film);
  }
  res.status(200).json({
    message: 'All films',
    data: { films: films },
  });
});
