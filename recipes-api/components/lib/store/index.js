const stores = require('require-all')({
  dirname: __dirname,
  filter: (fileName) => fileName === 'index.js' ? undefined : fileName.replace('.js', '')
});

module.exports = () => {

  const start = ({ config: store, collections, logger }, cb) => {
    const pickedStore = stores[store] && stores[store](collections);
    if (!pickedStore) return cb(new Error(`No available store with name ${store}`));

    const saveRecipe = (recipe) => {
      if (!recipe.id) return Promise.reject(new Error('Could not save recipe with no id'));
      return pickedStore.getRecipe(recipe.id)
        .then((existing) => {
          if (existing) return updateRecipe(existing, recipe);
          logger.info(`Inserting new recipe with id ${recipe.id}`);
          return pickedStore.saveRecipe(recipe);
        });
    };

    const updateRecipe = (current, update) => {
      if (!update.id) return Promise.reject(new Error('Could not update recipe with no id'));
      if (!update.version) return Promise.reject(new Error('Could not update recipe with no version'));
      if (update.version < current.version) return discard(current);
      logger.info(`Updating recipe with id ${update.id} and version ${update.version}`);
      return pickedStore.updateRecipe(update);
    };

    const deleteRecipe = (id) => {
      if (!id) return Promise.reject(new Error('Could not delete recipe with no id'));
      logger.info(`Deleting recipe with id ${id}`);
      return pickedStore.deleteRecipe(id);
    };

    const getRecipe = (id) => {
      if (!id) return Promise.reject(new Error('Could not get recipe with no id'));
      return pickedStore.getRecipe(id);
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
