const R = require('ramda');
const expect = require('expect.js');
const createStore = require('../../../components/lib/store/in-memory');
const recipe = require('../../../fixtures/recipe_sample.json');

describe('In memory store', () => {

  let store;

  beforeEach(() => {
    store = createStore();
  });

  it('should throw an error when saving a recipe with no id', () =>
    store.saveRecipe(R.omit('id',recipe))
      .catch((err) => expect(err.message).to.equal('Could not save recipe with no id'))
  );

  it('should save a recipe when the recipe does not exist', () =>
    store.saveRecipe(recipe)
      .then(() => store.getRecipe(recipe.id))
      .then((saved) => expect(saved).to.eql(recipe))
  );

  it('should update a recipe when the recipe exists and the new version is greater than the saved one', () => {
    const greaterVersion = new Date().getTime();
    const update = R.merge(recipe, { version: greaterVersion });
    return store.saveRecipe(recipe)
      .then((saved) => store.saveRecipe(update))
      .then((update) => store.getRecipe(recipe.id))
      .then((saved) => expect(saved.version).to.eql(greaterVersion))
  });

  it('should not update a recipe when the recipe exists and the new version is lower than the saved one', () => {
    const lowerVersion = 1;
    const update = R.merge(recipe, { version: lowerVersion });
    return store.saveRecipe(recipe)
      .then((saved) => store.saveRecipe(update))
      .then((update) => store.getRecipe(recipe.id))
      .then((saved) => expect(saved.version).to.eql(recipe.version))
  });

  it('should throw an error when deleting a recipe with no id', () =>
    store.deleteRecipe(null)
      .catch((err) => expect(err.message).to.equal('Could not delete recipe with no id'))
  );

  it('should delete a recipe', () =>
    store.saveRecipe(recipe)
      .then(() => store.deleteRecipe(recipe.id))
      .then(() => store.getRecipe(recipe.id))
      .then((saved) => expect(saved).to.eql(undefined))
  );
});
