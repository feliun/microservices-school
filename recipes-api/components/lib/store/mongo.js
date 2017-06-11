module.exports = ({ recipes }, logger) => {

  const discard = (recipe) => {
    logger.warn(`Discarding recipe with id ${recipe.id} since its version is outdated`);
    return Promise.resolve(recipe);
  };

  const saveRecipe = (recipe) => {
    if (!recipe.id) return Promise.reject(new Error('Could not save recipe with no id'));
    return recipes.findOne({ id: recipe.id })
      .then((existing) => {
        if (existing) return updateRecipe(existing, recipe);
        logger.info(`Inserting new recipe with id ${recipe.id}`);
        return recipes.insert(recipe);
      });
  };

  const updateRecipe = (current, update) => {
    if (!update.id) return Promise.reject(new Error('Could not update recipe with no id'));
    if (!update.version) return Promise.reject(new Error('Could not update recipe with no version'));
    if (update.version < current.version) return discard(current);
    logger.info(`Updating recipe with id ${update.id} and version ${update.version}`);
    return recipes.findOneAndUpdate({ id: update.id, version: { $lte: update.version } }, update, {});
  };

  const deleteRecipe = (id) => {
    if (!id) return Promise.reject(new Error('Could not delete recipe with no id'));
    logger.info(`Deleting recipe with id ${id}`);
    return recipes.remove({ id });
  };

  const getRecipe = (id) => {
    if (!id) return Promise.reject(new Error('Could not get recipe with no id'));
    return recipes.find({ id }).toArray().then(([ saved ]) => saved);
  };

  const flush = (query = {}) => recipes.remove(query);

  return {
    saveRecipe,
    deleteRecipe,
    getRecipe,
    flush: () => {
      if (process.env.NODE_ENV !== 'test') throw new Error('Flushing the in-memory db is not allowed!');
      return flush();
    }
  };

};
