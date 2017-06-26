module.exports = () => {

  const start = ({ broker, logger, store }, cb) => {
    logger.info('Initialising subscriptions!')
    return cb();
  };

  return { start };
};
