import React, { useContext, useEffect, useState, useRef, useCallback } from 'react';

import { useParams, useNavigate } from 'react-router-dom';
import SubtitlesOctopus from '../components/subtitles/subtitles-octopus';
import videojs from 'video.js';
import toWebVTT from 'srt-webvtt';
import Card from '../components/UI elements/Card';
import Hls from 'hls.js';
import axios from 'axios';
import logo from '../assets/img/ben10.jpg';

import {
  uploadVideo,
  createThread,
  uploadLargeVideo,
  POSTLargeVideoMultipartUploadAction,
  uploadLargeVideoPartByPartAndConcatenate,
} from '../APIs/thread-apis';
import Button from '../components/UI elements/Button';

import Utils from '../Utils';
import ReactPlayer from 'react-player';

import dashjs from 'dashjs';
import ControlBar from '../components/dashControlBar/ControlBar';
import '../components/dashControlBar/controlbar.css';
import '../components/dashControlBar/icomoon.ttf';
import '../styles/VideoDemo.css';
import MovieItem from '../components/movieItem/MovieItem.jsx';
import SwiperEspisode from '../components/swiper-espisode/swiper-espisode';

import { fetchFilmInfoById } from '../APIs/thread-apis.js';
import { Select } from '@mui/material';
import CommentInput from '../components/comments/CommentInput.js';
import AuthContext from '../contexts/auth-context.js';
import { fetchCommentsByVideoId } from '../APIs/comments-apis.js';

const getHlsUrl = async (filename) => {
  console.log(filename);
  var url = '/redirect/hls/' + filename;

  const { data } = await axios({
    method: 'get',
    url: url,
    headers: { myaxiosfetch: '123' },
  });
  console.log(data);
  var subserverurl = data.subserverurl;
  return subserverurl;
};

const getDashUrl = async (filename) => {
  var url = '/redirect/dash/' + filename + '/' + filename;

  const { data } = await axios({
    method: 'get',
    url: url,
    headers: { myaxiosfetch: '123' },
  });
  console.log(data);
  var subserverurl = data.subserverurl;
  return subserverurl;
};

const VideoDemo = () => {
  const authContext = useContext(AuthContext);
  const params = useParams();
  const infoID = params.filename;
  // const [source, setSource] = useState('/videos/MY Heart Rate.mp4');
  // const [reactPlayerURLDash, setReactPlayerURLDash] = useState('');
  // const [reactPlayerURLHls, setReactPlayerURLHls] = useState('');
  const [reactPlayerURL, setReactPlayerURL] = useState('');
  const [played, setPlayed] = useState(0);

  const [isPlayingDash, setIsPlaying] = useState(false);
  const [isPlayingHls, setIsPlayingHls] = useState(false);
  const [info, setInfo] = useState({ filmInfo: undefined, videos: [] });

  const playerDashWindow = useRef(null);

  const videoReactPlayerHls = useRef();
  const videoReactPlayer = useRef();

  useEffect(() => {
    const LoadVideo = async () => {
      try {
        // const config = {
        //   startPosition: 0, // can be any number you want
        // };
        // const urlHls = '/redirect/hls/' + filename;
        // const hls = new Hls(config);
        // hls.loadSource(urlHls);
        // hls.attachMedia(videoHLS.current);
        // hls.subtitleDisplay = true;
        // var obj_play_HLS = {
        //   fill: true,
        //   fluid: true,
        //   autoplay: true,
        //   controls: true,
        //   loop: true,
        // };
        // const _playerHLS = videojs(videoHLS.current, obj_play_HLS, function onPlayerReady() {
        //   videojs.log('Your player is ready!');
        //   const defaultVolume = 0.4;
        //   this.volume(defaultVolume);
        //   this.on('ended', function () {
        //     videojs.log('Awww...over so soon?!');
        //   });
        // });

        // const videoDashWindowCurrent = videoDashWindow.current;

        // if (videoDashWindowCurrent) {
        //   var urlDash = '/redirect/dash/' + filename + '/' + filename;

        //   const { data } = await axios({
        //     method: 'get',
        //     url: urlDash,
        //     headers: { myaxiosfetch: '123' },
        //   });
        //   console.log(data);
        //   //djtme đùa tao vcl
        //   var urlDash = data.subserverurl || 'http://172.30.50.78:9100/videos/l8NSKXODash/init.mpd';

        //   var playerDashWindow = dashjs.MediaPlayer().create();
        //   playerDashWindow.initialize(videoDashWindowCurrent, urlDash, true);
        //   playerDashWindow.attachView(videoDashWindowCurrent);
        //   console.log(playerDashWindow);

        //   playerDashWindow.updateSettings({ debug: { logLevel: dashjs.Debug.LOG_LEVEL_NONE } });
        //   console.log(playerDashWindow);

        //   const controlbar = new ControlBar(playerDashWindow);
        //   // Player is instance of Dash.js MediaPlayer;
        //   controlbar.initialize();
        // }
        const fetchInfo = await fetchFilmInfoById(infoID);
        if (fetchInfo === null) {
          return;
        }
        setInfo(() => {
          return fetchInfo;
        });
        console.log(fetchInfo);
        const index = 0;

        const filename = fetchInfo.videos[index].videoname;
        var urlDash = await getDashUrl(filename);
        console.log(urlDash);
        var testurl =
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZWNyZXQiOiIxMjM0NTY3ODkwIiwidXJsIjoidmlkZW9zL3FCc0xtMDZEYXNoL2luaXQubXBkIn0.tDCB0CNqUVPZH5U5JgGzggvoy5UF417YWABpAYPKIq8';
        urlDash = testurl;
        setReactPlayerURL(() => {
          return urlDash;
        });
      } catch (error) {
        console.log(error);
        if (playerDashWindow.current) {
          playerDashWindow.current.destroy();
          playerDashWindow.current = null;
        }
      }
    };

    LoadVideo();
  }, []);

  function checkTypeVideo() {
    switch (1) {
      case 'dash':
        return;
    }
  }

  const getAllComment = useCallback(async () => {
    // try {
    //   const response = await fetchCommentsByVideoId(params.filename);
    //   if (response.status === 200) {
    //     console.log(response.data);
    //   }
    // } catch (error) {
    //   console.log(error);
    // }
  }, []);

  useEffect(() => {
    getAllComment();
  });

  function getVideoStatus(status) {
    if (status === 'Ended') {
      return <p>Completed</p>;
    } else return <p>{status}</p>;
  }

  const config = {
    forceDASH: true,
    forceHLS: true,
  };
  return (
    <React.Fragment>
      <div className="flex flex-col">
        <div className="w-full h-3/5 p-5" id="video-demo">
          {/* <video ref={videoHLS} className="video-js"></video> */}

          {/* ReactPlayer lấy video từ ytb để test UI */}
          <div id="video-section" className="mt-10 flex flex-col items-center">
            {/* <ReactPlayer url="https://www.youtube.com/watch?v=5wiykPlwWIo" width="80%" height="500px" /> */}

            {/* <ReactPlayer
              className="w-full bg-gray-900 h-3/5"
              ref={videoReactPlayerHls}
              url={reactPlayerURLHls}
              width="80%"
              height="500px"
              autoPlay
              controls
              config={{
                forceHLS: true,
              }}
            /> */}
            <ReactPlayer
              className="w-full bg-gray-900 h-3/5"
              ref={videoReactPlayer}
              url={reactPlayerURL}
              width="80%"
              height="500px"
              autoPlay
              controls
              playing={isPlayingDash}
              onProgress={(progress) => {}}
              onSeek={() => console.log('Seeking!')}
              onBuffer={() => console.log('onBuffer')}
              onBufferEnd={() => console.log('onBufferEnd')}
              onError={async (event, data, instance, global) => {
                console.log({ event, data, instance, global });
                if (event.error) {
                  console.log('There are Error in videoReactPlayer');
                  console.log(event.error);
                  console.log('videoReactPlayer ref');
                  console.log(videoReactPlayer);
                  setIsPlaying(() => {
                    return false;
                  }); /// dòng này thì chạy đc
                  const index = 0;
                  if (info.videos.length < 1) {
                    return;
                  }
                  const filename = info.videos[index].videoname;
                  var urlDash = await getDashUrl(filename);
                  setReactPlayerURL(() => {
                    return urlDash;
                  });
                  const duration = videoReactPlayer.current.getDuration();
                  console.log(duration);
                  // videoReactPlayer.current.seekTo(300postma); /// cái dòng này không seekTo cái khúc đang coi dở
                  setIsPlaying(() => {
                    return true; /// dòng này thì chạy đc
                  });
                }
              }}
              config={config}
            />
          </div>
          <div id="change-server-section" className="flex mt-5 w-full">
            <div className="text-[#AAAAAA] bg-[#171717] p-10 w-2/5 ">
              <p>
                You're watching <span className="text-red-400">Episode 6</span>
              </p>
              <p>If current servers doesn't work, please try other servers beside</p>
            </div>
            <div className="text-[#777777] w-full px-3 py-2 flex gap-5 items-start bg-[#010101]">
              <div className="p-2 bg-[#171717] rounded-md hover:text-[#171717] hover:bg-[#777777] transition-all duration-300 delay-100 hover:cursor-pointer">
                Main Server
              </div>
              <div className="p-2 bg-red-400 text-[#EEEEEE] rounded-md hover:cursor-pointer">Sub Server</div>
            </div>
          </div>
          <div>
            <select id="episode-section" className="mt-10 p-2 text-[#EEEEEE] bg-red-400 rounded-md">
              {info.filmInfo !== undefined ? (
                info.filmInfo.seasons.map((season) => {
                  return (
                    <option
                      value={season.name}
                      className="text-active p-3 border-2 max-w-max rounded-md hover:cursor-pointer"
                    >
                      {season.name}
                    </option>
                  );
                })
              ) : (
                <div></div>
              )}
            </select>

            <SwiperEspisode
              episodes={info.videos}
              onclick={async (video) => {
                console.log(video);
                setIsPlaying(() => {
                  return false;
                }); /// dòng này thì chạy đc
                const filename = video.videoname;
                var urlDash = await getDashUrl(filename);
                var urlDash = await getDashUrl(filename);
                setReactPlayerURL(() => {
                  return urlDash;
                });

                setIsPlaying(() => {
                  return true; /// dòng này thì chạy đc
                });
              }}
            />
          </div>

          {/* <div className="dash-video-player">
          <div className="videoContainer" id="videoContainer">
            <video ref={videoDashWindow} autoPlay loop></video>
            <div id="videoController" className="video-controller unselectable">
              <div id="playPauseBtn" className="btn-play-pause" title="Play/Pause">
                <span id="iconPlayPause" className="icon-play"></span>
              </div>
              <span id="videoTime" className="time-display">
                00:00:00
              </span>
              <div id="fullscreenBtn" className="btn-fullscreen control-icon-layout" title="Fullscreen">
                <span className="icon-fullscreen-enter"></span>
              </div>
              <div id="bitrateListBtn" className="control-icon-layout" title="Bitrate List">
                <span className="icon-bitrate"></span>
              </div>
              <input type="range" id="volumebar" className="volumebar" min="0" max="1" step=".01" />
              <div id="muteBtn" className="btn-mute control-icon-layout" title="Mute">
                <span id="iconMute" className="icon-mute-off"></span>
              </div>
              <div id="trackSwitchBtn" className="control-icon-layout" title="A/V Tracks">
                <span className="icon-tracks"></span>
              </div>
              <div id="captionBtn" className="btn-caption control-icon-layout" title="Closed Caption">
                <span className="icon-caption"></span>
              </div>
              <span id="videoDuration" className="duration-display">
                00:00:00
              </span>
              <div className="seekContainer">
                <div id="seekbar" className="seekbar seekbar-complete">
                  <div id="seekbar-buffer" className="seekbar seekbar-buffer"></div>
                  <div id="seekbar-play" className="seekbar seekbar-play"></div>
                </div>
              </div>
              <div id="thumbnail-container" className="thumbnail-container">
                <div id="thumbnail-elem" className="thumbnail-elem"></div>
                <div id="thumbnail-time-label" className="thumbnail-time-label"></div>
              </div>
            </div>
          </div>
        </div> */}
        </div>
        {info.filmInfo !== undefined ? (
          <div className="flex flex-col p-6 bg-[#010101] text-normal">
            <div className="w-full mx-auto md:flex md:gap-5">
              <div className="w-full">
                <img
                  className="mx-auto max-w-xs"
                  src={'https://image.tmdb.org/t/p/w600_and_h900_bestv2/' + info.filmInfo.backdrop_path}
                  alt="video-banner-image"
                />
              </div>
              <div>
                <h2 className="text-center font-bold text-2xl md:text-left text-active">{info.filmInfo.name}</h2>
                <div className="flex justify-around my-7 md:justify-start md:gap-10">
                  <p className="px-2 rounded-md border-black border-2 border-solid">HD</p>
                  <p>{info.filmType}</p>
                  <div>{getVideoStatus(info.filmInfo.status)}</div>
                </div>
                <div>
                  <h5 className="font-semibold my-4 text-active">Overview:</h5>
                  <p>{info.filmInfo.overview}</p>
                </div>
                <div className="mt-4 md:flex md:gap-10">
                  <div>
                    <p>
                      <span className="font-semibold text-active">Released:</span> {info.filmInfo.first_air_date}
                    </p>
                    <p>
                      <span className="font-semibold text-active">Genre:</span> {}
                      {info.filmInfo.genres.map((genre) => {
                        let genreString = '';
                        if (info.filmInfo.genres[info.filmInfo.genres.length - 1].name === genre.name) {
                          genreString += genre.name;
                        } else {
                          genreString += genre.name + ', ';
                        }
                        return <p className="inline-block">{genreString}</p>;
                      })}
                    </p>
                    <p>
                      <span className="font-semibold text-active">Casts:</span>
                    </p>
                  </div>
                  <div>
                    <p>
                      <span className="font-semibold text-active">Duration:</span> {info.filmInfo.episode_run_time[0]}{' '}
                      mins
                    </p>
                    <p>
                      <span className="font-semibold text-active inline">Country:</span>{' '}
                      {info.filmInfo.production_countries.map((country) => {
                        let countryString = '';
                        if (
                          info.filmInfo.production_countries[info.filmInfo.production_countries.length - 1].name ===
                          country.name
                        ) {
                          countryString += country.name;
                        } else {
                          countryString += country.name + ', ';
                        }
                        return <p className="inline-block">{countryString}</p>;
                      })}
                    </p>
                    <p>
                      <span className="font-semibold text-active">Production:</span>{' '}
                      {info.filmInfo.production_companies.map((company) => {
                        let companyString = '';
                        if (
                          info.filmInfo.production_companies[info.filmInfo.production_companies.length - 1].name ===
                          company.name
                        ) {
                          companyString += company.name;
                        } else {
                          companyString += company.name + ', ';
                        }
                        return <p className="inline-block">{companyString}</p>;
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div></div>
        )}

        <div className="mb-5 p-5">
          <h1 className="font-semibold my-4">Related Movies</h1>
          <div className="flex justify-around mx-auto flex-wrap gap-5">
            {/* <MovieItem />
            <MovieItem />
            <MovieItem />
            <MovieItem />
            <MovieItem />
            <MovieItem /> */}
          </div>
          <CommentInput context={authContext} />
        </div>
      </div>
    </React.Fragment>
  );
};

export default VideoDemo;
