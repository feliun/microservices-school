module.exports = () => {

  let recipes = {};

  const saveRecipe = (recipe) => new Promise((resolve, reject) => {
    if (!recipe.id) return reject(new Error('Could not save recipe with no id'));
    const current = recipes[recipe.id];
    if (current) return updateRecipe(current, recipe).then((update) => resolve(update));
    recipes[recipe.id] = recipe;
    return resolve(recipe);
  });

  const updateRecipe = (current, update) => new Promise((resolve, reject) => {
    if (!update.id) return reject(new Error('Could not update recipe with no id'));
    if (!update.version) return reject(new Error('Could not update recipe with no version'));
    if (update.version < current.version) return resolve(current);
    recipes[update.id] = update;
    return resolve(update);
  });

  const deleteRecipe = (id) => new Promise((resolve, reject) => {
    if (!id) return reject(new Error('Could not delete recipe with no id'));
    delete recipes[id];
    return resolve(id);
  });

  const getRecipe = (id) => new Promise((resolve, reject) => {
    if (!id) return reject(new Error('Could not get recipe with no id'));
    return resolve(recipes[id]);
  });

  const flush = () => new Promise((resolve) => {
    recipes = {};
    return resolve();
  });

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
