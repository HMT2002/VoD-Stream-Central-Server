const fs = require('fs');
const path = require('path');
const moment = require('moment');

const Info = require('../models/mongo/Info');


const helperAPI = require('../modules/helperAPI');
const imgurAPI = require('../modules/imgurAPI');

const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const axios = require('axios');
const Video = require('../models/mongo/Video');

exports.GetAll = async () => {
  try {
    console.log('infoAPI.GetAll -> ');
    const allInfo = await Info.find({}, null, { lean: 'toObject' }).populate('videos');
    // for (let i = 0; i < allInfo.length; i++) {
    //   const info = allInfo[i];
    //   let filmInfo;
    //   if (info.filmType === 'TV') {
    //     filmInfo = await getTV(info.filmID);
    //   } else {
    //     filmInfo = await getMovie(info.filmID);
    //   }
    //   info.filmInfo = filmInfo;
    // }
    return allInfo;
  } catch (err) {
    console.log(err);
    return { message: 'There is error', isError: true, err };
  }
};

exports.GetTV = async (id) => {
  return await getTV(id);
};

const getTV = async (id) => {
  try {
    const baseUrl = 'https://api.themoviedb.org/3/tv/' + id + '?language=en-US';
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization:
          'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2ZjI3NmIxYTFmMjY4YmMzMTRhZDYwNTUwNTZkMmI3OCIsInN1YiI6IjY1M2Y1MmM3NTkwN2RlMDBhYzAyNWUxMCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.PotdEPOO-3gllIB-zv01LrmAUSSlr7g_6mwiEngvMmE',
      },
    };
    const { data: tv } = await axios.get(baseUrl, options);
    return tv;
  } catch (err) {
    return { message: 'There is error', isError: true, err };
  }
};

exports.QueryTV = async (query) => {
  try {
    const baseUrl =
      'https://api.themoviedb.org/3/search/tv?query=' + query + '&include_adult=false&language=en-US&page=1';
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization:
          'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2ZjI3NmIxYTFmMjY4YmMzMTRhZDYwNTUwNTZkMmI3OCIsInN1YiI6IjY1M2Y1MmM3NTkwN2RlMDBhYzAyNWUxMCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.PotdEPOO-3gllIB-zv01LrmAUSSlr7g_6mwiEngvMmE',
      },
    };
    const { data: tv } = await axios.get(baseUrl, options);
    return tv;
  } catch (err) {
    return { message: 'There is error', isError: true, err };
  }
};

exports.GetMovie = async (id) => {
  return await getMovie(id);
};

exports.AllGetMovieOnDatabase = async () => {
  return await AllGetMovieOnDatabase();
};
const AllGetMovieOnDatabase = async () => {
  try {
    return movie;
  } catch (err) {
    return { message: 'There is error', isError: true, err };
  }
};

const getMovie = async (id) => {
  try {
    const baseUrl = 'https://api.themoviedb.org/3/movie/' + id + '?language=en-US';
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization:
          'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2ZjI3NmIxYTFmMjY4YmMzMTRhZDYwNTUwNTZkMmI3OCIsInN1YiI6IjY1M2Y1MmM3NTkwN2RlMDBhYzAyNWUxMCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.PotdEPOO-3gllIB-zv01LrmAUSSlr7g_6mwiEngvMmE',
      },
    };
    const { data: movie } = await axios.get(baseUrl, options);

    return movie;
  } catch (err) {
    return { message: 'There is error', isError: true, err };
  }
};

exports.GetFilm = async (id) => {
  console.log('infoAPI.GetFilm -> ');
  return await getFilm(id);
};

const getFilm = async (id) => {
  console.log('infoAPI.getFilm -> ');
  try {
    // const info = await Info.findOne({_id:id}, null, { lean: 'toObject' }).populate('videos');
    const info = await Info.findOne({ _id: id }).populate('videos');

    // let filmInfo;
    // if (info.filmType === 'TV') {
    //   filmInfo = await getTV(info.filmID);
    // } else {
    //   filmInfo = await getMovie(info.filmID);
    // }
    // info.filmInfo = filmInfo;

    return info;
  } catch (err) {
    console.log(err);
    return { message: 'There is error', isError: true, err };
  }
};

exports.AddEpisodes = async (req) => {
  return await addEpisodes(req);
};

const addEpisodes = async (req) => {
  try {
    const info = req.info;
    console.log(req.body.videos);
    for (let i = 0; i < req.body.videos.length; i++) {
      if (
        info.videos.some((video) => {
          return video._id.toString() === req.body.videos[i];
        })
      ) {
        console.log('repeated!');
        continue;
      }
      const video = await Video.findById(req.body.videos[i]);
      info.videos.push(video);
    }
    await info.save();

    return { message: 'Success added!', info: req.info };
  } catch (err) {
    console.log(err);
    return { message: 'There is error', isError: true, err };
  }
};

exports.QueryMovie = async (query) => {
  try {
    const baseUrl =
      'https://api.themoviedb.org/3/search/movie?query=' + query + '&include_adult=false&language=en-US&page=1';
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization:
          'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2ZjI3NmIxYTFmMjY4YmMzMTRhZDYwNTUwNTZkMmI3OCIsInN1YiI6IjY1M2Y1MmM3NTkwN2RlMDBhYzAyNWUxMCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.PotdEPOO-3gllIB-zv01LrmAUSSlr7g_6mwiEngvMmE',
      },
    };
    const { data: movie } = await axios.get(baseUrl, options);
    return movie;
  } catch (err) {
    return { message: 'There is error', isError: true, err };
  }
};
