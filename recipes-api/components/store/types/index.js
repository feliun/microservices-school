const R = require('ramda');
const request = require('superagent');
const stores = require('require-all')({
  dirname: __dirname,
  filter: (fileName) => fileName === 'index.js' ? undefined : fileName.replace('.js', '')
});

const TIMEOUT = 3000;

module.exports = () => {

  const start = ({ config, collections, logger, broker }, cb) => {
    const { strategy, idGenerator } = config;
    const pickedStore = stores[strategy] && stores[strategy](collections);
    if (!pickedStore) return cb(new Error(`No available store with name ${strategy}`));

    const publish = (obj, action) => broker.publish('conclusions', obj, `recipes_api.v1.notifications.recipe.${action}`);

    const makeItRecoverable = (err) => {
      logger.error(`There was an error on the recipes api store: ${err.message}`);
      const recoverableErr = R.merge(err, { recoverable: true });
      throw recoverableErr;
    };

    const insert = (recipe) => {
      logger.info(`Inserting new recipe with id ${recipe.id}`);
      return pickedStore.saveRecipe(recipe)
        .then(() => publish(recipe, 'saved'));
    };

    const getId = () => {
      const { host, path } = idGenerator;
      const idUrl = `${host}${path}`;
      return request
        .get(idUrl)
        .timeout(TIMEOUT)
        .catch((error) => {
          logger.error(`Error trying to reach ${idUrl}: ${error.message}`);
          throw error;
        })
        .then(({ body }) => ({ id: body.id }));
    };

    const saveRecipe = (recipe) => {
      if (recipe.id) {
        return pickedStore.getRecipe(recipe.id)
          .then((existing) => (existing ? updateRecipe(existing, recipe) : insert(recipe)))
          .catch(makeItRecoverable);
      }
      return getId()
        .then(({ id }) => {
          const newRecipe = R.merge(recipe, { id });
          return insert(newRecipe);
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
      const recipeId = parseInt(id, 10);
      return pickedStore.deleteRecipe(recipeId)
      .then(() => publish({ id: recipeId }, 'deleted'))
      .catch(makeItRecoverable);
    };

    const getRecipe = (id) => {
      if (!id) return Promise.reject(new Error('Could not get recipe with no id'));
      const recipeId = parseInt(id, 10);
      return pickedStore.getRecipe(recipeId)
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
