const R = require('ramda');
const { join } = require('path');
const expect = require('expect.js');
const nock = require('nock');
const statusCodes = require('http-status-codes');
const supertest = require('supertest-as-promised');
const configSystem = require('../../components/config');
const system = require('../../system');
const recipe = require('../../fixtures/recipe_sample.json');
const stores = require('require-all')({
  dirname: join(__dirname, '..', '..', 'components', 'store', 'types'),
  filter: (fileName) => fileName === 'index.js' ? undefined : fileName.replace('.js', '')
});

const test = (strategy) => {

  describe(`Recipes API based on ${strategy} store`, () => {
    let request;
    let sys;
    let myStore;
    let myConfig;

    const normalise = R.omit(['_id', 'id']);

    const mockFn = (system) =>
      system()
        .set('config', { start: (cb) => cb(null, myConfig) });

    before(done => {
      configSystem.start((err, { config }) => {
        if (err) return done(err);
        myConfig = R.merge(config, { store: { strategy, idGenerator: config.store.idGenerator } });
        sys = system(mockFn).start((err, { app, store }) => {
          if (err) return done(err);
          request = supertest(Promise)(app);
          myStore = store;
          done();
        });
      });
    });

    beforeEach(() => myStore.flush());
    after(done => sys.stop(done));

    const nockIdGenerator = (id, expectedStatusCode = statusCodes.OK) => {
      const { host, path } = myConfig.store.idGenerator;
      nock(host)
      .get(path)
      .reply(expectedStatusCode, { id });
    };

    const post = (recipe, id = 1) => {
      nockIdGenerator(id);
      return request
        .post('/api/v1/recipes')
        .send(recipe)
        .expect(statusCodes.NO_CONTENT);
    };

    const get = (id, expectation, query = {}) => {
      return request
        .get(`/api/v1/recipes/${id}`)
        .query(query)
        .expect(expectation || statusCodes.OK)
    }

    const erase = (id) =>
      request
        .delete(`/api/v1/recipes/${id}`)
        .expect(statusCodes.NO_CONTENT)

    it('should POST a recipe', () => post(recipe));

    it('should GET a recipe', () => {
      const EXPECTED_ID = 2;
      return post(recipe, EXPECTED_ID)
        .then(() =>
          get(EXPECTED_ID)
            .then((response) => {
              expect(response.headers['content-type']).to.equal('application/json; charset=utf-8');
              expect(normalise(response.body)).to.eql(normalise(recipe));
            })
        )
    });

    it('should GET a recipe by source id', () => {
      const EXPECTED_ID = 2;
      return post(recipe, EXPECTED_ID)
        .then(() =>
          get(recipe.source_id, statusCodes.OK, { key: 'source_id' })
            .then((response) => {
              expect(response.headers['content-type']).to.equal('application/json; charset=utf-8');
              expect(normalise(response.body)).to.eql(normalise(recipe));
            })
        )
    });

    it('should DELETE a recipe', () => {
      const EXPECTED_ID = 2;
      return post(recipe, EXPECTED_ID)
        .then(() =>
          erase(EXPECTED_ID)
            .then(() => get(EXPECTED_ID, statusCodes.NOT_FOUND))
        );
    });
  });
};

const runAll = R.pipe(
  R.keys,
  R.map(test)
);

runAll(stores);
