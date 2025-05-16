import axios from 'axios';
const proxy = process.env.NEXT_PUBLIC_PROXY_CLOUD;

export const POSTTranferAction = async (server, video) => {
  if (!server || !video) {
    return { status: 'fail' };
  }
  console.log({ server, video, proxy });
  const url = proxy + '/redirect/replicate/send-folder';
  const { data } = await axios.post(
    url,
    { filename: video.videoname + 'Dash', url: server.URL, port: server.port },
    {
      validateStatus: () => true,
    }
  );
  console.log(data);
  return data;
};

export const POSTDeleteAction = async (server, video) => {
  if (!server || !video) {
    return { status: 'fail' };
  }
  console.log;
  console.log({ server, video, proxy });
  const url = proxy + '/redirect/delete-folder';
  const { data } = await axios.post(
    url,
    { filename: video.videoname + 'Dash', url: server.URL, port: server.port, videoname: video.name },
    {
      validateStatus: () => true,
    }
  );
  console.log(data);
  return data;
};

export const POSTFilmIntoInfo = async ({ filmID, videos }) => {
  console.log({ filmID, videos });
  // if (!filmID || !videos) {
  //   return { status: 'fail' };
  // }
  console.log({ server: filmID, videos: videos, proxy });
  const url = proxy + '/api/v1/info/film/' + filmID;
  console.log(url);
  const { data } = await axios.post(
    url,
    { videos: videos },
    {
      validateStatus: () => true,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  console.log(data);
  console.log('post Data: ' + videos + ', ' + filmID);
  return data;
};

export const fetchAllInfo = async () => {
  const storedToken = localStorage.getItem('token');
  const response =
    (await fetchproxy) +
    ('/api/v1/info',
    {
      method: 'GET',
      headers: {
        // 'Content-Type': 'application/json',
        Authorization: storedToken,
      },
    });
  if (!response.status || response.status === 'error') {
    throw new Error('Something went wrong!');
  }
  const data = await response.json();
  console.log(data);
  return data;
};

export const fetchFilmInfoById = async (infoID) => {
  var url = proxy + '/api/v1/info/film/' + infoID;
  const { data } = await axios({
    method: 'get',
    url: url,
    headers: { myaxiosfetch: '123' },
  });
  console.log(data);
  var info = data.data;
  return info;
};

export const uploadLargeVideoPartByPartAndConvertToDashVer2 = async (
  formData,
  index,
  chunkName,
  arrayChunkName,
  filename,
  ext,
  title,
  infoID,
  fullUploadURL
) => {
  if (!formData) {
    return { status: 'fail' };
  }
  const { data } = await axios.post(fullUploadURL, formData, {
    validateStatus: () => true,
    headers: {
      type: 'blob',
      index: index,
      chunkname: chunkName,
      filename: filename,
      arrayChunkName,
      ext,
      title,
      infoID,
      // preferurl: '192.168.1.99',
      // preferport: ':9100',
    },
  });
  return data;
};

const transferAPIs = {
  POSTTranferAction,
  POSTDeleteAction,
  uploadLargeVideoPartByPartAndConvertToDashVer2,
};

export default transferAPIs;
