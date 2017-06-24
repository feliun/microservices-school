module.exports = () => {

  const start = ({ config, logger, broker }, cb) => {
    setInterval(() => {
      logger.info('I am pulling recipes into our system...');
    }, 1000);
    cb();
  };

  return { start };

};
