const { ImgurClient } = require('imgur');

const clientImgur = new ImgurClient({
  clientId: '979c4b467df9e38' || process.env.CLIENT_SECRE,
  clientSecret: 'f842fd77455295d443b6957081c585e59d0fd3aa' || process.env.REFRESH_TOKEN,
});
clientImgur.on('uploadProgress', (progress) => console.log(progress));

module.exports = async ({ image, type }) => {
  const response = await clientImgur.upload({ image: image, type: type });
  console.log(response.link);

  return response.data;
};
