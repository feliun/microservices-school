module.exports = () => {

  const recipes = {};

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

  const deleteRecipe = (recipe) => new Promise((resolve, reject) => {
    if (!recipe.id) return reject(new Error('Could not delete recipe with no id'));
    delete recipes[recipe.id];
    return resolve(recipe);
  });

  const getRecipe = (id) => new Promise((resolve, reject) => {
    if (!id) return reject(new Error('Could not get recipe with no id'));
    return resolve(recipes[id]);
  });

  return {
    saveRecipe,
    updateRecipe,
    deleteRecipe,
    getRecipe
  };

};
