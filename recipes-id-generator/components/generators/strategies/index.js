const strategies = require('require-all')({
  dirname: __dirname,
  filter: (fileName) => fileName === 'index.js' ? undefined : fileName.replace('.js', '')
});

module.exports = () => {
  const start = ({ config }, cb) => {
    const { strategy, options } = config;
    const { generate } = strategies[strategy](options);
    cb(null, { generate });
  };

  return { start };

};
