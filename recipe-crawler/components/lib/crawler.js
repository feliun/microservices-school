module.exports = () => {

  const start = ({ config, logger, broker }, cb) => {
    setInterval(() => {
      logger.info('I am pulling recipes into our system...');
    }, config.frequency);
    cb();
  };

  return { start };

};
