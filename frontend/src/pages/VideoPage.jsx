import React, { useContext, useEffect, useState, useRef, useCallback, useMemo } from 'react';

import { useParams, useNavigate } from 'react-router-dom';
import SubtitlesOctopus from '../components/subtitles/subtitles-octopus.js';
import videojs from 'video.js';
import toWebVTT from 'srt-webvtt';
import Card from '../components/UI elements/Card.js';
import Hls from 'hls.js';
import axios from 'axios';
import logo from '../assets/img/ben10.jpg';

import {
  uploadVideo,
  createThread,
  uploadLargeVideo,
  POSTLargeVideoMultipartUploadAction,
  uploadLargeVideoPartByPartAndConcatenate,
} from '../APIs/thread-apis.js';
import Button from '../components/UI elements/Button.js';

import Utils from '../Utils.js';

import dashjs from 'dashjs';
import ControlBar from '../components/dashControlBar/ControlBar.js';
import '../components/dashControlBar/controlbar.css';
import '../components/dashControlBar/icomoon.ttf';
import '../styles/VideoPage.css';
import MovieItem from '../components/movieItem/MovieItem.jsx';
import SwiperEspisode from '../components/swiper-espisode/swiper-espisode.jsx';

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

const fetchDashUrl = async (filename) => {
  var url = '/redirect/dash/' + filename + '/' + filename;
  const { data } = await axios({
    method: 'get',
    url: url,
    headers: { myaxiosfetch: '123' },
  });
  console.log(data);
  return data.subserverurl;
};

const VideoPage = () => {
  const authContext = useContext(AuthContext);
  const params = useParams();
  const { filename: filmId } = useParams();

  const filmInfoID = params.filename;
  // const [source, setSource] = useState('/videos/MY Heart Rate.mp4');
  // const [dashUrlDash, setDashUrlDash] = useState('');
  // const [dashUrlHls, setDashUrlHls] = useState('');
  const [dashUrl, setDashUrl] = useState('');
  const [currentFileName, setCurrentFileName] = useState('');

  const [episodeIndex, setEpisodeIndex] = useState('0');
  const [playbackPosition, setPlaybackPosition] = useState(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayingHls, setIsPlayingHls] = useState(false);
  const [filmInfo, setFilmInfo] = useState({ videos: [] });

  // DOM and library references
  const videoElementRef = useRef(null);
  const dashPlayerRef = useRef(null);
  const subtitlesRef = useRef(null);

  const handleServerSwitch = async (e) => {
    console.log('handleServerSwitch.Event received: ' + e.type);
    // Store current playback time before switching
    if (videoElementRef.current) {
      // console.log('videoElementRef.current.currentTime: ' + videoElementRef.current.currentTime);
      setPlaybackPosition(videoElementRef.current.currentTime);
      // videoElementRef.current.currentTime = playbackPosition;
    }
    setIsPlaying(false);
    try {
      if (!currentFileName) return;

      const newDashUrl = await fetchDashUrl(currentFileName);
      setDashUrl(newDashUrl);
      setIsPlaying(true);
      console.log(`Saving current playback position: ${playbackPosition}`);
    } catch (error) {
      console.log('handleServerSwitch.error:');
      console.log(error);
      // Silent error handling
    }
  };
  const getVideoStatus = (status) => {
    if (status === 'Ended') {
      return <p>Completed</p>;
    } else return <p>{status}</p>;
  };
  const handleEpisodeChange = useCallback(async (episodeData) => {
    if (!episodeData?.videoname) return;
    setIsPlaying(false);
    setPlaybackPosition(0); // Reset position when changing episodes
    try {
      const filename = episodeData.videoname;
      setCurrentFileName(filename);
      const newDashUrl = await fetchDashUrl(filename);
      setDashUrl(newDashUrl);
      setIsPlaying(true);
    } catch (error) {
      // Silent error handling
    }
  }, []);
  const handleTestButtonPress = async () => {
    console.log('handleTestButtonPress: ' + playbackPosition);
    videoElementRef.current.currentTime = playbackPosition;
  };
  const cleanupMediaResources = useCallback(() => {
    if (dashPlayerRef.current) {
      dashPlayerRef.current.destroy();
      dashPlayerRef.current = null;
    }

    if (subtitlesRef.current) {
      subtitlesRef.current.dispose();
      subtitlesRef.current = null;
    }
  }, []);
  /**
   * Initializes the DASH player and subtitles
   */
  const initializePlayer = useCallback(async () => {
    if (!dashUrl || !videoElementRef.current) return;

    try {
      // Clean up previous instances
      cleanupMediaResources();

      // Create new player instance
      const player = dashjs.MediaPlayer().create();
      console.log('initializePlayer.videoElementRef.current.currentTime: ' + videoElementRef.current.currentTime);
      console.log('initializePlayer.playbackPosition: ' + playbackPosition);

      player.initialize(videoElementRef.current, dashUrl, true, playbackPosition);
      player.attachView(videoElementRef.current);
      dashPlayerRef.current = player;

      player.updateSettings({ debug: { logLevel: dashjs.Debug.LOG_LEVEL_NONE } });
      player.on(dashjs.MediaPlayer.events.ERROR, handleServerSwitch);
      console.log(player);

      videoElementRef.current.volume = 0.5;
      // Restore playback position if needed
      // if (playbackPosition > 0) {
      //   const targetPosition = playbackPosition;
      //   console.log('targetPosition: ' + targetPosition);
      //   // player.on(dashjs.MediaPlayer.events.CAN_PLAY, () => {
      //   //  videoElementRef.current.currentTime = targetPosition;
      //   //   setPlaybackPosition(0); // Reset stored position after seeking
      //   // });
      //   // videoElementRef.current.currentTime = targetPosition;
      //   // setPlaybackPosition(targetPosition);
      //   //player.seek(targetPosition);
      // }

      // Setup subtitles if available
      await initializeSubtitles(dashUrl);
    } catch (error) {
      console.log('initializePlayer.error');

      console.log(error);
      cleanupMediaResources();
    }
  }, [dashUrl, playbackPosition, handleServerSwitch, cleanupMediaResources]);
  /**
   * Initialize subtitles for the video
   */
  const initializeSubtitles = async (url) => {
    try {
      const subtitleUrl = url.replace('init.mpd', 'sub.ass');
      const response = await fetch(subtitleUrl, { method: 'GET' });

      if (response.status === 500) return;

      const options = {
        video: videoElementRef.current,
        subUrl: subtitleUrl,
        fonts: ['/Arial.ttf', '/TimesNewRoman.ttf'],
        workerUrl: process.env.PUBLIC_URL + '/subtitles-octopus-worker.js',
        legacyWorkerUrl: process.env.PUBLIC_URL + '/subtitles-octopus-worker.js',
      };

      subtitlesRef.current = new SubtitlesOctopus(options);
    } catch (error) {
      // Silent error handling
    }
  };

  //#region old setup
  // useEffect(() => {
  //   const LoadVideo = async () => {
  //     try {
  //       const fetchInfo = await fetchFilmInfoById(filmInfoID);
  //       console.log(fetchInfo);
  //       const index = 0;
  //       const filename = fetchInfo.videos[index].videoname;
  //       setCurrentFileName(() => {
  //         return filename;
  //       });
  //       var urlDash = dashUrl !== '' ? dashUrl : await fetchDashUrl(filename);
  //       console.log('Here is urlDash:' + urlDash + ' Here is filename: ' + filename);
  //       setDashUrl(() => {
  //         return urlDash;
  //       });
  //       setFilmInfo(() => {
  //         return fetchInfo;
  //       });
  //       var videoDashWindowCurrent = videoElementRef.current;

  //       if (dashUrl !== '') {
  //         var playerDashWindow = dashjs.MediaPlayer().create();
  //         dashPlayerRef.current = playerDashWindow;
  //         // videoDashWindowCurrent = videoElementRef.current;
  //         playerDashWindow.initialize(videoDashWindowCurrent, dashUrl, true);
  //         playerDashWindow.attachView(videoDashWindowCurrent);
  //         playerDashWindow.updateSettings({ debug: { logLevel: dashjs.Debug.LOG_LEVEL_NONE } });
  //         playerDashWindow.on(dashjs.MediaPlayer.events.ERROR, handleServerSwitch);

  //         // const controlbar = new ControlBar(playerDashWindow);
  //         // // Player is instance of Dash.js MediaPlayer;
  //         // controlbar.initialize();
  //       }
  //       // If we have a saved position (from server switch), seek to that position once video is loaded
  //       if (playbackPosition > 0 || videoElementRef.current !== undefined) {
  //         const seekToTime = playbackPosition;

  //         // Add event listener for when the video can seek
  //         playerDashWindow.on(dashjs.MediaPlayer.events.CAN_PLAY, () => {
  //           console.log(`Resuming playback at position: ${seekToTime}`);
  //           // videoDashWindowCurrent.playbackPosition = seekToTime;
  //           // Reset the saved time after seeking
  //           // setPlaybackPosition(0);
  //         });
  //       }
  //       var urlSubtitle = urlDash.replace('init.mpd', 'sub.ass');
  //       const subASSResponse = await fetch(urlSubtitle, {
  //         method: 'GET',
  //       });
  //       // const subSRTResponse = await fetch('/videos/' + videoname + '.srt', {
  //       //   method: 'GET',
  //       // });
  //       // if (subSRTResponse.status != 500) {
  //       //   //oke, cho đến hiện tại chỉ có libass là hỗ trợ hiển thị sub ass thôi, còn srt chả thấy thư viện hay gói nào hỗ trợ hết.
  //       //   //nếu người dùng bất đắc dĩ đăng file sub srt thì theo quy trình sau:
  //       //   //server nhận SRT , dùng ffmpeg để tổng hợp từ file sub srt và video ra thành hls kèm sub
  //       //   console.log(subSRTResponse);
  //       //   // const srtSub = await subSRTResponse.text();
  //       //   // console.log(srtSub);
  //       //   const vtt = await subSRTResponse.blob();
  //       //   console.log(vtt);
  //       //   const WebVTT_sutitle = await toWebVTT(vtt); // this function accepts a parameer of SRT subtitle blob/file object
  //       //   // cái trên là lấy 1
  //       //   console.log(WebVTT_sutitle);

  //       //   // const localURL = await URL.createObjectURL(vtt);
  //       //   // VideoJS_player.addRemoteTextTrack({ src: WebVTT_sutitle, kind: 'subtitles', label: 'Vietnamese' }, false);
  //       //   // ayda, ngộ là ngộ hiểu rồi nha, be stream file srt về response cho fe, fe chuyển stream nhận đc thành 1 obj blob
  //       //   // Dùng obj blob đó cùng phương thức toWebVTT thành blob nguồn(src) cho _player videojs blob:http://localhost:3000/xxxxx-xxx-xxxxxxx-xxxxxxx
  //       // }

  //       // nếu để ASS ở dưới thì ưu tiên ASS hơn, sẽ tìm cách xét độ ưu tiên sau
  //       if (subASSResponse.status != 500) {
  //         var options = {
  //           video: videoDashWindowCurrent, // HTML5 video element
  //           subUrl: urlSubtitle, // Link to subtitles
  //           // fonts: ['/test/font-1.ttf', '/test/font-2.ttf'], // Links to fonts (not required, default font already included in build)
  //           fonts: ['/Arial.ttf', '/TimesNewRoman.ttf'],
  //           workerUrl: process.env.PUBLIC_URL + '/subtitles-octopus-worker.js', // Link to WebAssembly-based file "libassjs-worker.js"
  //           legacyWorkerUrl: process.env.PUBLIC_URL + '/subtitles-octopus-worker.js', // Link to non-WebAssembly worker
  //         };
  //         const SubtitlesOctopus_subtitle = new SubtitlesOctopus(options);
  //         console.log(SubtitlesOctopus_subtitle);
  //       }
  //     } catch (error) {
  //       console.log(error);
  //       if (playerDashWindow.current !== undefined) {
  //         if (playerDashWindow.current) {
  //           playerDashWindow.current.destroy();
  //           playerDashWindow.current = null;
  //         }
  //       }
  //     }
  //   };

  //   LoadVideo();
  // }, [dashUrl]);
  // useEffect(() => {
  //   getAllComment();
  // });
  //#endregion

  useEffect(() => {
    const loadInitialFilm = async () => {
      if (!filmId) return;

      try {
        const fetchedInfo = await fetchFilmInfoById(filmId);

        if (fetchedInfo?.videos?.length > 0) {
          const firstEpisode = fetchedInfo.videos[0];
          setCurrentFileName(firstEpisode.videoname);
          const initialDashUrl = await fetchDashUrl(firstEpisode.videoname);
          setDashUrl(initialDashUrl);
          setFilmInfo(fetchedInfo);
        }
      } catch (error) {
        // Silent error handling
      }
    };

    loadInitialFilm();
  }, [filmId]);

  // Initialize or update player when URL changes
  useEffect(() => {
    initializePlayer();
  }, [initializePlayer]);

  // Cleanup on component unmount
  useEffect(() => {
    return cleanupMediaResources;
  }, [cleanupMediaResources]);

  // Current episode information derived from state
  const currentEpisode = useMemo(() => {
    if (!filmInfo?.videos?.length) return { number: '?', name: 'Loading...' };

    const episode = filmInfo.videos.find((v) => v.videoname === currentFileName);
    return episode || { number: '?', name: 'Unknown Episode' };
  }, [filmInfo.videos, currentFileName]);

  return (
    <React.Fragment>
      <div className="flex flex-col">
        <div className="w-full h-3/5 p-5" id="video-demo">
          {/* <video ref={videoHLS} className="video-js"></video> */}
          <Button
            className="p-2 bg-#6025ce-400 text-[#EEEEEE] rounded-md hover:cursor-pointer"
            onClick={() => {
              console.log('ff');
              handleTestButtonPress();
            }}
          >
            test button
          </Button>
          {/* ReactPlayer lấy video từ ytb để test UI */}
          <div id="video-section" className="mt-10 flex flex-col items-center">
            {/* <ReactPlayer url="https://www.youtube.com/watch?v=5wiykPlwWIo" width="80%" height="500px" /> */}

            {/* <ReactPlayer
              className="w-full bg-gray-900 h-3/5"
              ref={videoElementRefHls}
              url={dashUrlHls}
              width="80%"
              height="500px"
              autoPlay
              controls
              config={{
                forceHLS: true,
              }}
            /> */}
            <div class="videoContainer" id="videoContainer">
              <video
                id="videoElementRef"
                ref={videoElementRef}
                controls
                autoPlay
                crossorigin="anonymous"
                playing={isPlaying}
              />
              <div id="videoController" class="video-controller unselectable">
                <div id="playPauseBtn" class="btn-play-pause" title="Play/Pause">
                  <span id="iconPlayPause" class="icon-play"></span>
                </div>
                <span id="videoTime" class="time-display">
                  00:00:00
                </span>
                <div id="fullscreenBtn" class="btn-fullscreen control-icon-layout" title="Fullscreen">
                  <span class="icon-fullscreen-enter"></span>
                </div>
                <div id="bitrateListBtn" class="control-icon-layout" title="Bitrate List">
                  <span class="icon-bitrate"></span>
                </div>

                <input type="range" id="volumebar" class="volumebar" value="1" min="0" max="1" step=".01" />
                <div id="muteBtn" class="btn-mute control-icon-layout" title="Mute">
                  <span id="iconMute" class="icon-mute-off"></span>
                </div>

                <div id="trackSwitchBtn" class="control-icon-layout" title="A/V Tracks">
                  <span class="icon-tracks"></span>
                </div>
                <div id="captionBtn" class="btn-caption control-icon-layout" title="Closed Caption">
                  <span class="icon-caption"></span>
                </div>
                <span id="videoDuration" class="duration-display">
                  00:00:00
                </span>
                <div class="seekContainer">
                  <div id="seekbar" class="seekbar seekbar-complete">
                    <div id="seekbar-buffer" class="seekbar seekbar-buffer"></div>
                    <div id="seekbar-play" class="seekbar seekbar-play"></div>
                  </div>
                </div>
              </div>
            </div>
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
              {filmInfo.filmInfo !== undefined ? (
                filmInfo.filmInfo.seasons.map((season) => {
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

            <SwiperEspisode episodes={filmInfo.videos} onclick={handleEpisodeChange} />
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
        {filmInfo.filmInfo !== undefined ? (
          <div className="flex flex-col p-6 bg-[#010101] text-normal">
            <div className="w-full mx-auto md:flex md:gap-5">
              <div className="w-full">
                <img
                  className="mx-auto max-w-xs"
                  src={'https://image.tmdb.org/t/p/w600_and_h900_bestv2/' + filmInfo.filmInfo.backdrop_path}
                  alt="video-banner-image"
                />
              </div>
              <div>
                <h2 className="text-center font-bold text-2xl md:text-left text-active">{filmInfo.filmInfo.name}</h2>
                <div className="flex justify-around my-7 md:justify-start md:gap-10">
                  <p className="px-2 rounded-md border-black border-2 border-solid">HD</p>
                  <p>{filmInfo.filmType}</p>
                  <div>{getVideoStatus(filmInfo.filmInfo.status)}</div>
                </div>
                <div>
                  <h5 className="font-semibold my-4 text-active">Overview:</h5>
                  <p>{filmInfo.filmInfo.overview}</p>
                </div>
                <div className="mt-4 md:flex md:gap-10">
                  <div>
                    <p>
                      <span className="font-semibold text-active">Released:</span> {filmInfo.filmInfo.first_air_date}
                    </p>
                    <p>
                      <span className="font-semibold text-active">Genre:</span> {}
                      {filmInfo.filmInfo.genres.map((genre) => {
                        let genreString = '';
                        if (filmInfo.filmInfo.genres[filmInfo.filmInfo.genres.length - 1].name === genre.name) {
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
                      <span className="font-semibold text-active">Duration:</span>{' '}
                      {filmInfo.filmInfo.episode_run_time[0]} mins
                    </p>
                    <p>
                      <span className="font-semibold text-active inline">Country:</span>{' '}
                      {filmInfo.filmInfo.production_countries.map((country) => {
                        let countryString = '';
                        if (
                          filmInfo.filmInfo.production_countries[filmInfo.filmInfo.production_countries.length - 1]
                            .name === country.name
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
                      {filmInfo.filmInfo.production_companies.map((company) => {
                        let companyString = '';
                        if (
                          filmInfo.filmInfo.production_companies[filmInfo.filmInfo.production_companies.length - 1]
                            .name === company.name
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

export default VideoPage;
