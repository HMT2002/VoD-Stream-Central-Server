import './videoHls.css';
import React, { useContext, useEffect, useState, useRef, Component } from 'react';
import Hls from 'hls.js';
import { TimelineChart } from '../chart/timeline-chart.ts';
import SubtitlesOctopus from '../subtitles/subtitles-octopus';
import videojs from 'video.js';
import toWebVTT from 'srt-webvtt'; // This is a default export, so you don't have to worry about the import name

function customLogger(logContent) {
  const color = 'color: white; background-color: black;';

  //console.log(`%c${logContent}`, `${color} font-size: 13px; text-align: center; padding: 12px 100px; display:block`);
}
const customeBoxMessage = (prevState, className, content) => {
  return (
    <React.Fragment>
      {prevState}
      <br />
      <div className={className}>{content}</div>
      <br />
    </React.Fragment>
  );
};

const decodeString = (encodeURI) => {
  return decodeURIComponent(encodeURI);
};
const MAX_FRAME_RATE = 30;

const getSecond = (hms) => {
  var a = hms.split(':'); // split it at the colons

  // minutes are worth 60 seconds. Hours are worth 60 minutes.

  var seconds = a[0] * 60 * 60 * 1 + a[1] * 60 * 1 + a[2] * 1;

  return seconds;
};

function srt2webvtt(data) {
  // remove dos newlines
  var srt = data.replace(/\r+/g, '');
  // trim white space start and end
  srt = srt.replace(/^\s+|\s+$/g, '');
  // get cues
  var cuelist = srt.split('\n\n');
  var result = '';
  if (cuelist.length > 0) {
    result += 'WEBVTT\n\n';
    for (var i = 0; i < cuelist.length; i = i + 1) {
      result += convertSrtCue(cuelist[i]);
    }
  }
  return result;
}
function convertSrtCue(caption) {
  // remove all html tags for security reasons
  //srt = srt.replace(/<[a-zA-Z\/][^>]*>/g, '');
  var cue = '';
  var s = caption.split(/\n/);
  // concatenate muilt-line string separated in array into one
  while (s.length > 3) {
    for (var i = 3; i < s.length; i++) {
      s[2] += '\n' + s[i];
    }
    s.splice(3, s.length - 3);
  }
  var line = 0;
  // detect identifier
  if (!s[0].match(/\d+:\d+:\d+/) && s[1].match(/\d+:\d+:\d+/)) {
    cue += s[0].match(/\w+/) + '\n';
    line += 1;
  }
  // get time strings
  if (s[line].match(/\d+:\d+:\d+/)) {
    // convert time string
    var m = s[1].match(/(\d+):(\d+):(\d+)(?:,(\d+))?\s*--?>\s*(\d+):(\d+):(\d+)(?:,(\d+))?/);
    if (m) {
      cue += m[1] + ':' + m[2] + ':' + m[3] + '.' + m[4] + ' --> ' + m[5] + ':' + m[6] + ':' + m[7] + '.' + m[8] + '\n';
      line += 1;
    } else {
      // Unrecognized timestring
      return '';
    }
  } else {
    // file format error or comment lines
    return '';
  }
  // get cue text
  if (s[line]) {
    cue += s[line] + '\n\n';
  }
  return cue;
}
function srt2vtt(srt) {
  var vtt = '';
  srt = srt.replace(/\r+/g, '');
  var list = srt.split('\n');
  for (var i = 0; i < list.length; i++) {
    var m = list[i].match(/(\d+):(\d+):(\d+)(?:,(\d+))?\s*--?>\s*(\d+):(\d+):(\d+)(?:,(\d+))?/);
    if (m) {
      vtt += m[1] + ':' + m[2] + ':' + m[3] + '.' + m[4] + ' --> ' + m[5] + ':' + m[6] + ':' + m[7] + '.' + m[8] + '\n';
    } else {
      vtt += list[i] + '\n';
    }
  }
  vtt = 'WEBVTT\n\n\n' + vtt;
  vtt = vtt.replace(/^\s+|\s+$/g, '');
  return vtt;
}

async function playSubtitle(player, timespanMatchs, contentMatchs) {
  return new Promise((resolve) => {
    let subIndex = 0;
    let updateSub = false;

    const id = setInterval(render, 1000 / MAX_FRAME_RATE);
    function render() {
      const start = timespanMatchs[subIndex].split(',')[0];
      const end = timespanMatchs[subIndex].split(',')[1];
      //console.log(start)
      const startPos = getSecond(start);
      const endPos = getSecond(end);
      console.log(player.current.currentTime);
      if (player.current.currentTime >= startPos) {
      }
      if (player.current.currentTime >= endPos) {
        console.log('end sub, go next');
        subIndex++;
      }

      if (subIndex >= timespanMatchs.length) {
        console.log('out of sub');
        console.log(subIndex);
        console.log(contentMatchs[subIndex - 1]);
        subIndex = 0;
        clearInterval(id);
        resolve();
      }
    }
  });
}

const VideoHls = (props) => {
  const player = useRef();
  const canvas = useRef();
  const threadVideoRef = useRef();
  const [logger, setLogger] = useState('');
  const [eventInfo, setEventInfo] = useState({});
  const [eventLog, setEventLog] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [showSubtitleAss, setShowSubtitleAss] = useState(true);
  const [showSubtitleSrt, setShowSubtitleSrt] = useState(false);
  const [chart, setChart] = useState();
  const eventInfoHandler = (eventName, info) => {
    // console.log('eventName');
    // console.log(eventName);
    // console.log('info');
    // console.log(info);
    try {
      setLogger((prevState) => {
        return customeBoxMessage(prevState, 'logger-message-' + eventName, <>{eventName}</>);
      });
    } catch (error) {
      setLogger((prevState) => {
        return customeBoxMessage(
          prevState,
          'logger-message-' + eventName,
          <>
            {eventName}
            <br />
            Error:{error}
          </>
        );
      });
    }
    const ename = eventName || 'first event';

    setEventInfo((prevState) => {
      prevState[ename] = eventName;
      return { ...prevState };
    });
    setEventLog((prevState) => {
      return prevState + '\n ' + eventName + '\t' + typeof info;
    });

    return;
  };
  const BrowseVideoHandler = () => {
    threadVideoRef.current.click();
  };
  const VideoChangeHandler = async (event) => {
    if (event.target.files.length > 0) {
      const localURL = await URL.createObjectURL(event.target.files[0]);
      console.log(event.target.files[0]);
      console.log(localURL);
    }
  };
  const loadVideo = async (player) => {
    var url = '';
    const encodeUri = encodeURI('/api/v1/video/video-proc/convert-stream/' + props.videoname);
    const response = await fetch(encodeUri, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Authorization: storedToken,
      },
    });
    // console.log(response);
    if (response.status !== 500) {
      const data = await response.json();
      if (!data.status === 'found and converted') {
        setEventLog('not found video on backend!');
      } else {
        url = data.path;
        console.log(data.path);
      }
    }

    const video = player.current;
    const config = {
      startPosition: 0, // can be any number you want
    };
    const hls = new Hls(config);
    if (props.videoname === 'stein') {
      url = 'http://192.168.140.104/tmp/hls/stein.m3u8';
    }
    // else if(props.videoname==='cc'){
    //   url='http://192.168.140.104/cc.m3u8';
    // }
    else if (props.videoname === 'test-front-hls') {
      url = 'http://localhost:3000/videos/hls/無意識.m3u8';
    } else if (props.videoname === '哀の隙間 - feat.初音ミク-nginx') {
      // có khả năng nhận về file sub định dạng vtt vì bên server nginx có hỗ trợ host file toàn tập, node thì không thấy.
      // url = 'http://192.168.140.104/tmp/convert/哀の隙間 - feat.初音ミク.m3u8';
      url = 'http://192.168.140.104/tmp/prep/convert/master.m3u8';
    } else if (props.videoname === 'Nee Nee Nee-nginx') {
      // có khả năng nhận về file sub định dạng vtt vì bên server nginx có hỗ trợ host file toàn tập, node thì không thấy.
      // url = 'http://192.168.140.104/tmp/convert/哀の隙間 - feat.初音ミク.m3u8';
      url = 'http://192.168.140.104/tmp/prep/convert/_Nee Nee Nee.m3u8';
    } else if (props.videoname === 'ハルジオン-Red5-mp4') {
      // có khả năng nhận về file sub định dạng vtt vì bên server nginx có hỗ trợ host file toàn tập, node thì không thấy.
      // url = 'http://192.168.140.104/tmp/convert/哀の隙間 - feat.初音ミク.m3u8';
      url = 'http://localhost:5080/oflaDemo/ハルジオン.mp4';
    } else if (props.videoname === 'ハルジオン-Red5-m3u8') {
      // có khả năng nhận về file sub định dạng vtt vì bên server nginx có hỗ trợ host file toàn tập, node thì không thấy.
      // url = 'http://192.168.140.104/tmp/convert/哀の隙間 - feat.初音ミク.m3u8';
      url = 'http://localhost:5080/oflaDemo/convert/ハルジオン.m3u8';
    }
    console.log(url);

    let obj_play = {
      fill: true,
      fluid: true,
      autoplay: true,
      controls: true,
      preload: 'auto',
      loop: true,
      //vì đã có HLS lo rồi
      // sources: [
      //   {
      //     src: url,
      //     type: 'application/x-mpegURL',
      //     // withCredentials: true,

      //     // type:'video/flv',
      //   },
      // ],
      // liveui: true,
      // techorder : ["flash","html5"],
    };

    const VideoJS_player = videojs(video, obj_play, function onPlayerReady() {
      videojs.log('Your player is ready!');

      // In this context, `this` is the player that was created by Video.js.
      //this.play();

      // How about an event listener?

      this.on('ended', function () {
        videojs.log('Awww...over so soon?!');
      });
    });
    console.log('videojs _player');
    console.log(VideoJS_player);

    hls.loadSource(url);
    hls.attachMedia(video);
    hls.subtitleDisplay = true;

    const loadSubtitle = async (player, VideoJS_player) => {
      try {
        const video = player.current;
        const subASSResponse = await fetch('/videos/' + props.videoname + '.ass', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // Authorization: storedToken,
          },
        });
        const subSRTResponse = await fetch('/videos/' + props.videoname + '.srt', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // Authorization: storedToken,
          },
        });

        if (subSRTResponse.status != 500) {
          //oke, cho đến hiện tại chỉ có libass là hỗ trợ hiển thị sub ass thôi, còn srt chả thấy thư viện hay gói nào hỗ trợ hết.
          //nếu người dùng bất đắc dĩ đăng file sub srt thì theo quy trình sau:
          //server nhận SRT , dùng ffmpeg để tổng hợp từ file sub srt và video ra thành hls kèm sub
          console.log(subSRTResponse);
          // const srtSub = await subSRTResponse.text();
          // console.log(srtSub);
          const vtt = await subSRTResponse.blob();
          console.log(vtt);
          const WebVTT_sutitle = await toWebVTT(vtt); // this function accepts a parameer of SRT subtitle blob/file object
          // cái trên là lấy 1
          console.log(WebVTT_sutitle);

          // const localURL = await URL.createObjectURL(vtt);
          VideoJS_player.addRemoteTextTrack({ src: WebVTT_sutitle, kind: 'subtitles', label: 'Vietnamese' }, false);
          // ayda, ngộ là ngộ hiểu rồi nha, be stream file srt về response cho fe, fe chuyển stream nhận đc thành 1 obj blob
          // Dùng obj blob đó cùng phương thức toWebVTT thành blob nguồn(src) cho _player videojs blob:http://localhost:3000/xxxxx-xxx-xxxxxxx-xxxxxxx
        }

        // nếu để ASS ở dưới thì ưu tiên ASS hơn, sẽ tìm cách xét độ ưu tiên sau
        if (subASSResponse.status != 500) {
          var options = {
            video: video, // HTML5 video element
            subUrl: '/videos/' + props.videoname + '.ass', // Link to subtitles
            // fonts: ['/test/font-1.ttf', '/test/font-2.ttf'], // Links to fonts (not required, default font already included in build)
            fonts: ['/Arial.ttf', '/TimesNewRoman.ttf'],
            workerUrl: process.env.PUBLIC_URL + '/subtitles-octopus-worker.js', // Link to WebAssembly-based file "libassjs-worker.js"
            legacyWorkerUrl: process.env.PUBLIC_URL + '/subtitles-octopus-worker.js', // Link to non-WebAssembly worker
          };
          const SubtitlesOctopus_subtitle = new SubtitlesOctopus(options);
          console.log(SubtitlesOctopus_subtitle);
        }
      } catch (error) {
        console.log(error);
      }
    };

    loadSubtitle(player, VideoJS_player);

    //#region chart handler
    const updateLevelOrTrack = (eventName, data) => {
      eventInfoHandler(eventName, data);
      chart.updateLevelOrTrack(data.details);
    };
    const updateChart = (eventName, data) => {
      eventInfoHandler(eventName, data);
      chart.update();
    };

    const updateFragment = (eventName, data) => {
      eventInfoHandler(eventName, data);
      if (data.frag.stats) {
        // Convert 0.x stats to partial v1 stats
        const { retry, loaded, total, trequest, tfirst, tload } = data.frag.stats;
        if (trequest && tload) {
          data.frag.stats = {
            loaded,
            retry,
            total,
            loading: {
              start: trequest,
              first: tfirst,
              end: tload,
            },
          };
        }
      }
      chart.updateFragment(data);
    };

    hls.on(Hls.Events.ERROR, (eventName, info) => {
      eventInfoHandler(eventName, info);
    });
    hls.on(
      Hls.Events.MANIFEST_LOADING,
      (eventName, info) => {
        eventInfoHandler(eventName, info);
        chart.reset();
      },
      chart
    );
    hls.on(
      Hls.Events.MANIFEST_PARSED,
      (eventName, info) => {
        eventInfoHandler(eventName, info);
        chart.removeType('level');
        chart.removeType('audioTrack');
        chart.removeType('subtitleTrack');
        chart.updateLevels(info.levels);
        try {
          video.play();
        } catch (error) {
          //console.log(error);
        }
      },
      chart
    );
    hls.on(
      Hls.Events.BUFFER_CREATED,
      (eventName, info) => {
        eventInfoHandler(eventName, info);
        chart.updateSourceBuffers(info.tracks, hls.media);
      },
      chart
    );
    hls.on(
      Hls.Events.BUFFER_RESET,
      (eventName, info) => {
        eventInfoHandler(eventName, info);
        chart.removeSourceBuffers();
      },
      chart
    );
    hls.on(Hls.Events.LEVELS_UPDATED, (eventName, info) => {
      eventInfoHandler(eventName, info);
      chart.removeType('level');
      chart.updateLevels(info.levels);
    });
    hls.on(
      Hls.Events.LEVEL_SWITCHED,
      (eventName, info) => {
        eventInfoHandler(eventName, info);
        chart.removeType('level');
        chart.updateLevels(hls.levels, info.level);
      },
      chart
    );
    hls.on(
      Hls.Events.LEVEL_LOADING,
      (eventName, info) => {
        eventInfoHandler(eventName, info);
        // TODO: mutate level datasets
        // Update loadLevel
        chart.removeType('level');
        chart.updateLevels(hls.levels);
      },
      chart
    );
    hls.on(
      Hls.Events.LEVEL_UPDATED,
      (eventName, info) => {
        eventInfoHandler(eventName, info);
        chart.updateLevelOrTrack(info.details);
      },
      chart
    );
    hls.on(
      Hls.Events.AUDIO_TRACKS_UPDATED,
      (eventName, info) => {
        eventInfoHandler(eventName, info);
        chart.removeType('audioTrack');
        chart.updateAudioTracks(info.audioTracks);
      },
      chart
    );
    hls.on(
      Hls.Events.SUBTITLE_TRACKS_UPDATED,
      (eventName, info) => {
        eventInfoHandler(eventName, info);
        chart.removeType('subtitleTrack');
        chart.updateSubtitleTracks(info.subtitleTracks);
      },
      chart
    );
    hls.on(
      Hls.Events.AUDIO_TRACK_SWITCHED,
      (eventName, info) => {
        eventInfoHandler(eventName, info);
        // TODO: mutate level datasets
        chart.removeType('audioTrack');
        chart.updateAudioTracks(hls.audioTracks);
      },
      chart
    );
    hls.on(
      Hls.Events.SUBTITLE_TRACK_SWITCH,
      (eventName, info) => {
        eventInfoHandler(eventName, info);
        // TODO: mutate level datasets
        chart.removeType('subtitleTrack');
        chart.updateSubtitleTracks(hls.subtitleTracks);
      },
      chart
    );
    hls.on(Hls.Events.AUDIO_TRACK_LOADED, updateLevelOrTrack, chart);
    hls.on(Hls.Events.SUBTITLE_TRACK_LOADED, updateLevelOrTrack, chart);
    hls.on(Hls.Events.LEVEL_PTS_UPDATED, updateLevelOrTrack, chart);
    hls.on(Hls.Events.FRAG_LOADED, updateFragment, chart);
    hls.on(Hls.Events.FRAG_PARSED, updateFragment, chart);
    hls.on(Hls.Events.FRAG_CHANGED, updateFragment, chart);
    hls.on(Hls.Events.BUFFER_APPENDING, updateChart, chart);
    hls.on(Hls.Events.BUFFER_APPENDED, updateChart, chart);
    hls.on(Hls.Events.BUFFER_FLUSHED, updateChart, chart);
    //#endregion
  };

  const loadChart = async () => {
    let resizeAsyncCallbackId = -1;

    const requestAnimationFrame = window.self.requestAnimationFrame || window.self.setTimeout;
    const cancelAnimationFrame = window.self.cancelAnimationFrame || window.self.clearTimeout;
    const resizeHandlers = [];

    const resize = () => {
      cancelAnimationFrame(resizeAsyncCallbackId);
      resizeAsyncCallbackId = requestAnimationFrame(() => {
        resizeHandlers.forEach((handler) => {
          handler();
        });
      });
    };

    const setupTimelineChart = () => {
      console.log(canvas);
      const chart = new TimelineChart(canvas.current, {
        responsive: false,
      });
      console.log('chart now is: ');
      console.log(chart);
      resizeHandlers.push(() => {
        chart.resize();
      });
      chart.resize();
      return chart;
    };

    setChart((prevState) => {
      // const timechart = setupTimelineChart();
      // // console.log(timechart)
      // return timechart;
    });
  };

  const onChangeShowSubtitleAss = async () => {};
  const onChangeShowSubtitleSrt = async () => {};
  useEffect(() => {
    try {
      let VideoJS_player;
      let SubtitlesOctopus_subtitle;
      let WebVTT_sutitle;

      loadVideo(player, VideoJS_player, SubtitlesOctopus_subtitle, WebVTT_sutitle);
    } catch (ex) {
      console.log(ex);
    }
  }, []);

  return (
    <React.Fragment>
      <script type="text/javascript" src="jquery.js"></script>
      <script type="text/javascript" src="jquery.srt.js"></script>
      <div className="main-div">
        <div className="hls-main-video">
          <video className="video-js" ref={player}></video>
          <input ref={threadVideoRef} type="file" onChange={VideoChangeHandler} />
          <input
            id="checkboxShowSubtitleAss"
            type="checkbox"
            checked={showSubtitleAss}
            onChange={onChangeShowSubtitleAss}
          />
          <label htmlFor="checkboxShowSubtitleAss"> Show ASS Subtitles</label>
          <br></br>
          <input
            id="checkboxShowSubtitleSrt"
            type="checkbox"
            checked={showSubtitleSrt}
            onChange={onChangeShowSubtitleSrt}
          />
          <label htmlFor="checkboxShowSubtitleSrt"> Show SRT Subtitles</label>
          <br></br>
        </div>
        <canvas className="canvas-main-video" ref={canvas} />

        <div className="event-status">
          <pre className="pre-current-status">{eventLog}</pre>
          <div className="logger-box">
            <div>{logger}</div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};
export default VideoHls;
