module.exports = (content) => {
  let output = content
    .replace(/{%<IMAGE>%}/g, '<img alt="me" width="100" height="100" src="')
    .replace(/{%<IMAGE-END>%}/g, '">');

  return output;
};
