const R = require('ramda');
const { join } = require('path');
const expect = require('expect.js');
const system = require('../../../system');
const configSystem = require('../../../components/config');
const recipe = require('../../../fixtures/recipe_sample.json');
const stores = require('require-all')({
  dirname: join(__dirname, '..', '..', '..', 'components', 'store', 'types'),
  filter: (fileName) => fileName === 'index.js' ? undefined : fileName.replace('.js', '')
});

const test = (store) => {
  describe(`Testing store ${store}`, () => {
    let myStore;
    let sys;
    let myConfig;
    let myBroker;

    const mockFn = (system) =>
      system()
        .set('config', { start: (cb) => cb(null, myConfig) });

    before(done => {
      configSystem.start((err, { config }) => {
        if (err) return done(err);
        myConfig = R.merge(config, { store });
        sys = system(mockFn).start((err, { store, broker }) => {
          if (err) return done(err);
          myStore = store;
          myBroker = broker;
          done();
        });
      });
    });

    beforeEach(() =>
      myStore.flush()
        .then(() => myBroker.purge()));

    after(done => sys.stop(done));

    const shouldReceive = (expectedRK) =>
      myBroker.subscribe('recipes_api')
        .then(({ message, content, ackOrNack, cancel }) => {
          ackOrNack();
          if (message.fields.routingKey !== expectedRK) return shouldReceive(expectedRK);
          return cancel.then(() => Promise.resolve({ message, content }));
        });

    const shouldNotReceive = (expectedRK) =>
      myBroker.subscribe('recipes_api')
        .then(({ message, ackOrNack, cancel }) => {
          ackOrNack();
          if (message.fields.routingKey !== expectedRK) return setTimeout(() => cancel.then(Promise.resolve), 500);
          return shouldNotReceive(expectedRK);
        });


    const normalise = R.omit('_id');

    it('should throw an error when saving a recipe with no id', () =>
      myStore.saveRecipe(R.omit('id',recipe))
        .catch((err) => expect(err.message).to.equal('Could not save recipe with no id'))
    );

    it('should save a recipe when the recipe does not exist', () =>
      myStore.saveRecipe(recipe)
        .then(() => myStore.getRecipe(recipe.id))
        .then((saved) => expect(saved).to.eql(recipe))
        .then(() => shouldReceive('recipes_api.v1.notifications.recipe.saved'))
        .then(({ message, content }) => expect(normalise(content)).to.eql(normalise(recipe)))
    );

    it('should update a recipe when the recipe exists and the new version is greater than the saved one', () => {
      const greaterVersion = new Date().getTime();
      const update = R.merge(recipe, { version: greaterVersion });
      return myStore.saveRecipe(recipe)
        .then((saved) => myStore.saveRecipe(update))
        .then(() => shouldReceive('recipes_api.v1.notifications.recipe.updated'))
        .then(({ message, content }) => expect(normalise(content)).to.eql(normalise(update)))
        .then(() => myStore.getRecipe(recipe.id))
        .then((saved) => expect(saved.version).to.eql(greaterVersion))
    });

    it('should not update a recipe when the recipe exists and the new version is lower than the saved one', () => {
      const lowerVersion = 1;
      const update = R.merge(recipe, { version: lowerVersion });
      return myStore.saveRecipe(recipe)
        .then(() => myStore.saveRecipe(update))
        .then(() => myStore.getRecipe(recipe.id))
        .then((saved) => expect(saved.version).to.eql(recipe.version))
        .then(() => shouldNotReceive('recipes_api.v1.notifications.recipe.updated'));
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
        .then(() => shouldReceive('recipes_api.v1.notifications.recipe.deleted'))
        .then(({ message, content }) => expect(content.id).to.eql(recipe.id))
    );
  });
};

const runAll = R.pipe(
  R.keys,
  R.map(test)
);

runAll(stores);
