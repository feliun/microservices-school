const R = require('ramda');
const expect = require('expect.js');
const createStore = require('../../../components/lib/store/in-memory');
const recipe = require('../../../fixtures/recipe_sample.json');

describe('In memory store', () => {

  let store;

  beforeEach(() => {
    store = createStore();
  });

  it('should save a recipe', () =>
    store.saveRecipe(recipe)
      .then(() => store.getRecipe(recipe.id))
      .then((saved) => expect(saved).to.eql(recipe))
  );

  it('should throw an error when saving a recipe with no id', () =>
    store.saveRecipe(R.omit('id',recipe))
      .catch((err) => expect(err.message).to.equal('Could not save recipe with no id'))
  );

  it('should update a recipe', () => {
    const update = R.merge(recipe, { title: "some made up title" });
    return store.saveRecipe(recipe)
      .then(() => store.updateRecipe(update))
      .then((updated) => expect(updated).to.eql(update))
  });

  it('should throw an error when updating a recipe with no id', () =>
    store.updateRecipe(R.omit('id',recipe))
      .catch((err) => expect(err.message).to.equal('Could not update recipe with no id'))
  );

  it('should delete a recipe', () =>
    store.saveRecipe(recipe)
      .then(() => store.deleteRecipe(recipe))
      .then(() => store.getRecipe(recipe.id))
      .then((saved) => expect(saved).to.eql(undefined))
  );

  it('should throw an error when deleting a recipe with no id', () =>
    store.deleteRecipe(R.omit('id',recipe))
      .catch((err) => expect(err.message).to.equal('Could not delete recipe with no id'))
  );
});
