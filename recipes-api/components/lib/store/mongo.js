module.exports = ({ recipes }) => {

  const saveRecipe = (recipe) => recipes.insert(recipe);

  const updateRecipe = (update) => recipes.findOneAndUpdate({ id: update.id, version: { $lte: update.version } }, update, {});

  const deleteRecipe = (id) => recipes.remove({ id });

  const getRecipe = (id) => recipes.findOne({ id });

  const flush = (query = {}) => recipes.remove(query);

  return {
    saveRecipe,
    deleteRecipe,
    updateRecipe,
    getRecipe,
    flush
  };

};
