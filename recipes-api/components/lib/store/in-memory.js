module.exports = () => {

  let recipes = {};

  const saveRecipe = (recipe) => new Promise((resolve, reject) => {
    if (!recipe.id) return reject(new Error('Could not save recipe with no id'));
    recipes[recipe.id] = recipe;
    return resolve(recipe);
  });

  const updateRecipe = (recipe) => new Promise((resolve, reject) => {
    if (!recipe.id) return reject(new Error('Could not update recipe with no id'));
    recipes[recipe.id] = recipe;
    return resolve(recipe);
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
    updateRecipe,
    deleteRecipe,
    getRecipe,
    flush: () => {
      if (process.env.NODE_ENV !== 'test') throw new Error('Flushing the in-memory db is not allowed!');
      return flush();
    }
  };

};
