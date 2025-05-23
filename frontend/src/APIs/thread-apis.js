import axios from 'axios';

export const fetchThreadBySlug = async (slug) => {
  if (!slug) {
    return { status: 'fail' };
  }
  // const storedToken = localStorage.getItem('token');
  const response = await fetch('/api/v1/threads/' + slug, {
    method: 'GET',
    headers: {
      // 'Content-Type': 'application/json',
      // Authorization: token,
    },
  });
  if (!response.status || response.status === 'error') {
    throw new Error('Something went wrong!');
  }
  const data = await response.json();
  //   console.log(data);
  return data;
};

export const fetchAllInfo = async () => {
  const storedToken = localStorage.getItem('token');
  const response = await fetch('/api/v1/info', {
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

export const fetchFilmInfoById = async (infoId) => {
  var url = '/api/v1/info/film/' + infoId;
  const { data } = await axios({
    method: 'get',
    url: url,
    headers: { myaxiosfetch: '123' },
  });
  // var info = data.data;
  // console.log(data);
  var info = data.data;
  return info;
};

export const fetchAllThreadsByUser = async (account, token) => {
  const response = await fetch('/api/v1/threads/content-creator/' + account, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
    },
  });

  if (!response.status || response.status === 'error') {
    throw new Error('Something went wrong!');
  }

  const data = await response.json();
  return data;
};

export const createThread = async (thread, token) => {
  if (!thread) {
    return { status: 'fail' };
  }

  const response = await fetch('/api/v1/threads', {
    method: 'POST',
    body: JSON.stringify(thread),
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
    },
  });
  const data = await response.json();
  // console.log(data);
  return data;
};

export const uploadVideo = async (formData) => {
  if (!formData) {
    return { status: 'fail' };
  }
  const response = await fetch('/api/v1/threads/upload-video', {
    method: 'POST',
    body: formData,
  });
};

export const uploadLargeVideo = async (formData) => {
  if (!formData) {
    return { status: 'fail' };
  }
  const response = await fetch('/api/test/upload-video', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  // console.log(data);

  return data;
};

export const uploadLargeVideoPartByPartAndConvertToHls = async (
  formData,
  index,
  chunkName,
  chunkNames,
  filename,
  ext,
  title,
  infoId
) => {
  if (!formData) {
    return { status: 'fail' };
  }

  const response = await fetch('/api/v1/video/upload-video-large-multipart-hls', {
    method: 'POST',
    body: formData,
    headers: {
      type: 'blob',
      index: index,
      chunkname: chunkName,
      filename: filename,
      chunkNames,
      ext,
      title,
      infoId: infoId,
    },
  });
  const data = await response.json();
  // console.log(data);
  return data;
};

export const uploadLargeVideoPartByPartAndConvertToDash = async (
  formData,
  index,
  chunkName,
  chunkNames,
  filename,
  ext,
  title,
  infoId
) => {
  if (!formData) {
    return { status: 'fail' };
  }
  const response = await fetch('/api/v1/video/upload-video-large-multipart-dash', {
    method: 'POST',
    body: formData,
    headers: {
      type: 'blob',
      index: index,
      chunkname: chunkName,
      filename: filename,
      chunkNames,
      ext,
      title,
      infoId,
    },
  });
  const data = await response.json();
  // console.log(data);
  return data;
};

export const processVideoUploadToDashV2 = async (
  formData,
  index,
  chunkName,
  chunkNames,
  filename,
  ext,
  title,
  infoId,
  fullUploadUrl
) => {
  if (!formData) {
    return { status: 'fail' };
  }
  const { data } = await axios.post(fullUploadUrl, formData, {
    validateStatus: () => true,
    headers: {
      type: 'blob',
      index: index,
      chunkname: chunkName,
      filename: filename,
      chunkNames,
      ext,
      title,
      infoId,
    },
  });
  return data;
};

export const uploadLargeVideoPartByPartAndConcatenate = async (chunkNames, filename, destination, ext) => {
  const response = await fetch('/api/test/upload-video-large-multipart-concatenate', {
    method: 'POST',
    body: JSON.stringify({
      chunkNames: chunkNames,
    }),
    headers: {
      'Content-Type': 'application/json',
      filename,
      destination,
      ext,
    },
  });
  const data = await response.json();
  // console.log(data);
  return data;
};

export const uploadLargeVideoPartByPart_OPTIONS = async (formData, index, chunkName, chunkNames, filename, ext) => {
  if (!formData) {
    return { status: 'fail' };
  }
  const response = await fetch('/redirect/upload-video-large-multipart', {
    method: 'OPTIONS',
    body: formData,
    headers: {
      type: 'blob',
      index: index,
      chunkname: chunkName,
      filename: filename,
      chunkNames,
      ext,
    },
  });
  const data = await response.json();
  // console.log(data);
  return data;
};

export const uploadLargeVideoPartByPartAndConcatenate_OPTIONS = async (chunkNames, filename, destination, ext) => {
  const response = await fetch('/redirect/upload-video-large-multipart-concatenate', {
    method: 'OPTIONS',
    body: JSON.stringify({
      chunkNames: chunkNames,
    }),
    headers: {
      'Content-Type': 'application/json',
      filename,
      destination,
      ext,
    },
  });
  const data = await response.json();
  // console.log(data);
  return data;
};

// export const uploadLargeVideoPartByPartAndConcatenateTest = async (chunkNames, filename, destination,ext) => {
//   const response = await fetch('/api/test/upload-video-large-multipart-concatenate', {
//     method: 'POST',
//     body:JSON.stringify( {
//       chunkNames:chunkNames,
//     }),
//     headers: {
//       'Content-Type': 'application/json',
//       filename,
//       destination,
//       ext,
//     },
//   });
//   const data = await response.json();
//   // console.log(data);
//   return data;
// };

export const deleteThread = async (token, payload) => {
  try {
    const response = await fetch('/api/v1/threads/' + payload.thread.slug, {
      method: 'DELETE',
      body: JSON.stringify(payload),
      headers: {
        Authorization: token,
      },
    });

    const data = await response.json();

    return data;
  } catch (error) {
    console.log(error);
  }
};

export const updateThread = async (token, oldSlug, payload) => {
  try {
    const response = await fetch('/api/v1/threads/' + oldSlug, {
      method: 'PATCH',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const fetchThreadsByTitle = async (title) => {
  try {
    const response = await fetch('/api/v1/threads/search/' + title, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.status || response.status === 'error') {
      throw new Error('Something went wrong!');
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.log(error);
  }
};

export const fetchThreadsByTag = async (tag) => {
  try {
    const response = await fetch('/api/v1/threads/tag/' + tag, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.status || response.status === 'error') {
      throw new Error('Something went wrong!');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const fetchThreadsByUserId = async (id) => {
  try {
    const response = await fetch('/api/v1/threads/user/' + id, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.status || response.status === 'error') {
      throw new Error('Something went wrong!');
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.log(error);
  }
};

const threadAPIs = {
  fetchThreadBySlug,
  fetchAllInfo,
  fetchAllThreadsByUser,
  fetchThreadsByUserId,
  fetchThreadsByTitle,
  fetchThreadsByTag,
  createThread,
  uploadVideo,
  deleteThread,
  updateThread,
  uploadLargeVideo,
  uploadLargeVideoPartByPartAndConvertToHls,
  uploadLargeVideoPartByPartAndConvertToDash,

  uploadLargeVideoPartByPartAndConcatenate,
  uploadLargeVideoPartByPart_OPTIONS,
  uploadLargeVideoPartByPartAndConcatenate_OPTIONS,
  processVideoUploadToDashV2,
};

export default threadAPIs;
