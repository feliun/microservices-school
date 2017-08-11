const strategies = require('require-all')({
  dirname: __dirname,
  filter: (fileName) => fileName === 'index.js' ? undefined : fileName.replace('.js', '')
});

module.exports = () => {
  const start = ({ config, logger }, cb) => {
    const { strategy, options } = config;
    const init = strategies[strategy];
    if (!init) return cb(`No generator strategy for ${strategy}`);
    init(options, logger)
      .then((generate) => cb(null, { generate }))
      .catch(cb);
  };

  return { start };

};
