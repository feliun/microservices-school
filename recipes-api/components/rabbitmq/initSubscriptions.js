module.exports = () => {
  const start = ({ broker, logger, store }, cb) => {
    logger.info('Initialising subscriptions');

    const recipeHandler = (message, content, ackOrNack) =>
      store.saveRecipe(content)
        .then(() => {
          ackOrNack();
          logger.info(`Just saved correctly recipe with id ${content.id}`);
        })
        .catch((error) => {
          logger.error(`There was an error digesting a recipe: ${error.message}, ${error.stack}`);
          const recoveryStrategy = error.recoverable ? broker.config.recovery.deferred_retry : broker.config.recovery.dead_letter;
          ackOrNack(error, recoveryStrategy);
        });

    broker.subscribe('recipes_api', (err, subscription) => {
      if (err) return cb(err);
      subscription
      .on('error', (err) => logger.error(`Error receiving message: ${err.message}`))
      .on('message', recipeHandler);
      cb();
    });
  };

  return { start };
};
