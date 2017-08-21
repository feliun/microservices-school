const R = require('ramda');
const stores = require('require-all')({
  dirname: __dirname,
  filter: (fileName) => fileName === 'index.js' ? undefined : fileName.replace('.js', '')
});

module.exports = () => {

  const start = ({ config, collections, logger, broker }, cb) => {
    const { strategy } = config;
    const pickedStore = stores[strategy] && stores[strategy](collections);
    if (!pickedStore) return cb(new Error(`No available store with name ${strategy}`));

    const publish = (obj, action) => broker.publish('conclusions', obj, `recipes_api.v1.notifications.recipe.${action}`);

    const makeItRecoverable = (err) => {
      const recoverableErr = R.merge(err, { recoverable: true });
      throw recoverableErr;
    };

    const saveRecipe = (recipe) => {
      if (!recipe.id) return Promise.reject(new Error('Could not save recipe with no id'));
      return pickedStore.getRecipe(recipe.id)
        .then((existing) => {
          if (existing) return updateRecipe(existing, recipe);
          logger.info(`Inserting new recipe with id ${recipe.id}`);
          return pickedStore.saveRecipe(recipe)
          .then(() => publish(recipe, 'saved'));
        })
        .catch(makeItRecoverable);
    };

    const updateRecipe = (current, update) => {
      if (!update.id) return Promise.reject(new Error('Could not update recipe with no id'));
      if (!update.version) return Promise.reject(new Error('Could not update recipe with no version'));
      if (update.version < current.version) return discard(current);
      logger.info(`Updating recipe with id ${update.id} and version ${update.version}`);
      return pickedStore.updateRecipe(update)
        .then(() => publish(update, 'updated'));
    };

    const deleteRecipe = (id) => {
      if (!id) return Promise.reject(new Error('Could not delete recipe with no id'));
      logger.info(`Deleting recipe with id ${id}`);
      return pickedStore.deleteRecipe(id)
      .then(() => publish({ id }, 'deleted'))
      .catch(makeItRecoverable);
    };

    const getRecipe = (id) => {
      if (!id) return Promise.reject(new Error('Could not get recipe with no id'));
      return pickedStore.getRecipe(id)
      .catch(makeItRecoverable);
    };

    const flush = () => {
      if (process.env.NODE_ENV !== 'test') throw new Error('Flushing the store is not allowed!');
      return pickedStore.flush();
    };

    const discard = (recipe) => {
      logger.warn(`Discarding recipe with id ${recipe.id} since its version is outdated`);
      return Promise.resolve(recipe);
    };

    const api = {
      saveRecipe,
      deleteRecipe,
      getRecipe,
      flush
    };

    cb(null, api);
  };

  return { start };

};
