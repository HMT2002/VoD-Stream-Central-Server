import axios from 'axios';

const processVideoUploadToDashV2 = async (
  formData,
  index,
  chunkNames,
  chunkName,
  ext,
  title,
  infoId,
  fullUploadUrl
) => {
  console.log(formData, index, chunkNames, chunkName, ext, title, infoId, fullUploadUrl);
  if (!formData) {
    return { status: 'fail' };
  }

  const { data } = await axios.post(fullUploadUrl, formData, {
    validateStatus: () => true,
    headers: {
      type: 'blob',
      index: index,
      chunkname: chunkNames[index * 1],
      chunkNames,
      ext,
      title,
      infoId,
    },
  });
  return data;
};

const chunkToFormData = (chunk, chunkIndex, chunkNames, chunkName, ext, statusId) => {
  const formData = axios.toFormData({
    multipartFileChunk: chunk,
    multipartFileChunkIndex: chunkIndex,
    chunkNames,
    chunkname: chunkName + '.' + ext,
    statusId,
  });
  return formData;
};

const uploadDashVideoChunkV2 = async (
  chunk,
  chunkIndex,
  chunkNames,
  chunkName,
  ext,
  title,
  infoId,
  fullUploadUrl,
  statusId
) => {
  try {
    console.log(chunk, chunkIndex, chunkNames, chunkName, ext, title, infoId, fullUploadUrl, statusId);
    const formData = chunkToFormData(chunk, chunkIndex, chunkNames, chunkName, ext, statusId);
    console.log(chunkNames);
    const responseDash = await processVideoUploadToDashV2(
      formData,
      chunkIndex,
      chunkNames,
      chunkName,
      ext,
      title,
      infoId,
      fullUploadUrl
    );
    console.log(responseDash);
  } catch (error) {
    console.log(error);
  }
};
const uploadUtils = {
  uploadDashVideoChunkV2,
};

export default uploadUtils;
