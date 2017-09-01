const R = require('ramda');

module.exports = () => {

  let recipes = {};

  const saveRecipe = (recipe) => new Promise((resolve, reject) => {
    recipes[recipe.id] = recipe;
    return resolve(recipe);
  });

  const updateRecipe = (update) => new Promise((resolve, reject) => {
    recipes[update.id] = update;
    return resolve(update);
  });

  const deleteRecipe = (id) => new Promise((resolve, reject) => {
    delete recipes[id];
    return resolve(id);
  });

  const getRecipe = (id) => Promise.resolve(recipes[id]);

  const getRecipeBySourceId = (sourceId) => {
    const found = R.find(({ source_id }) => source_id === sourceId, R.values(recipes))
    return Promise.resolve(found);
  };

  const flush = () => new Promise((resolve) => {
    recipes = {};
    return resolve();
  });

  return {
    saveRecipe,
    deleteRecipe,
    updateRecipe,
    getRecipe,
    getRecipeBySourceId,
    flush
  };

};
