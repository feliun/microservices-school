const R = require('ramda');
const expect = require('expect.js');
const system = require('../../../system');
const configSystem = require('../../../components/config');
const recipe = require('../../../fixtures/recipe_sample.json');

describe('In memory store', () => {

  let myStore;
  let sys;
  let myConfig;

  const mockFn = (system) =>
    system()
      .set('config', { start: (cb) => cb(null, myConfig) });

  before(done => {
    configSystem.start((err, { config }) => {
      if (err) return done(err);
      myConfig = R.merge(config, { store: 'in-memory' });
      sys = system(mockFn).start((err, { store }) => {
        if (err) return done(err);
        myStore = store;
        done();
      });
    });
  });

  beforeEach(() => myStore.flush());
  after(done => sys.stop(done));

  it('should throw an error when saving a recipe with no id', () =>
    myStore.saveRecipe(R.omit('id',recipe))
      .catch((err) => expect(err.message).to.equal('Could not save recipe with no id'))
  );

  it('should save a recipe when the recipe does not exist', () =>
    myStore.saveRecipe(recipe)
      .then(() => myStore.getRecipe(recipe.id))
      .then((saved) => expect(saved).to.eql(recipe))
  );

  it('should update a recipe when the recipe exists and the new version is greater than the saved one', () => {
    const greaterVersion = new Date().getTime();
    const update = R.merge(recipe, { version: greaterVersion });
    return myStore.saveRecipe(recipe)
      .then((saved) => myStore.saveRecipe(update))
      .then((update) => myStore.getRecipe(recipe.id))
      .then((saved) => expect(saved.version).to.eql(greaterVersion))
  });

  it('should not update a recipe when the recipe exists and the new version is lower than the saved one', () => {
    const lowerVersion = 1;
    const update = R.merge(recipe, { version: lowerVersion });
    return myStore.saveRecipe(recipe)
      .then(() => myStore.saveRecipe(update))
      .then(() => myStore.getRecipe(recipe.id))
      .then((saved) => expect(saved.version).to.eql(recipe.version))
  });

  it('should throw an error when deleting a recipe with no id', () =>
    myStore.deleteRecipe(null)
      .catch((err) => expect(err.message).to.equal('Could not delete recipe with no id'))
  );

  it('should delete a recipe', () =>
    myStore.saveRecipe(recipe)
      .then(() => myStore.deleteRecipe(recipe.id))
      .then(() => myStore.getRecipe(recipe.id))
      .then((saved) => expect(saved).to.eql(null))
  );
});
