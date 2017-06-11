module.exports = () => {

  const collections = {
    recipes: null
  };

  const start = ({ mongo }, cb) => {
    collections.recipes = mongo.collection('recipes');
    collections.recipes.createIndex({ id: 1 }, { unique: true, sparse: true });
    return cb(null, collections);
  };

  return { start };
};
