const strategies = require('require-all')({
  dirname: __dirname,
  filter: (fileName) => fileName === 'index.js' ? undefined : fileName.replace('.js', '')
});

module.exports = () => {
  const start = ({ config }, cb) => {
    const { generate } = strategies[config];
    cb(null, { generate });
  };

  return { start };

};
