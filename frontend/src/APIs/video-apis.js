import axios from 'axios';
const getAllVideoForDashboard = async () => {
  var url = '/api/v1/video/dashboard';
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
const getAllFilmForDashboard = async () => {
  var url = '/api/v1/info/dashboard';
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
const videoAPIs = {
  getAllVideoForDashboard,
  getAllFilmForDashboard,
};
export default videoAPIs;
