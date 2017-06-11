const R = require('ramda');
const expect = require('expect.js');
const statusCodes = require('http-status-codes');
const supertest = require('supertest-as-promised');
const system = require('../../system');
const inMemoryStore = require('../../components/lib/store/in-memory');
const recipe = require('../../fixtures/recipe_sample.json');

describe('In-memory Recipes API', () => {
  let request;
  let sys;
  let myStore;

  const normalise = R.omit('_id');

  const mockFn = (system) =>
    system()
      .set('store', inMemoryStore());

  before(done => {
    sys = system(mockFn).start((err, { app, store }) => {
      if (err) return done(err);
      request = supertest(Promise)(app);
      myStore = store;
      done();
    });
  });

  beforeEach(() =>
    myStore.flush()
  );

  after(done => sys.stop(done));

  const post = (recipe) =>
    request
      .post('/api/v1/recipes')
      .send(recipe)
      .expect(statusCodes.NO_CONTENT)

  const get = (id, expectation) =>
    request
      .get(`/api/v1/recipes/${recipe.id}`)
      .expect(expectation || statusCodes.OK)

  const erase = (id) =>
    request
      .delete(`/api/v1/recipes/${recipe.id}`)
      .expect(statusCodes.NO_CONTENT)

  it('should POST a recipe', () => post(recipe));

  it('should GET a recipe', () =>
    post(recipe)
      .then(() =>
        get(recipe.id)
          .then((response) => {
            expect(response.headers['content-type']).to.equal('application/json; charset=utf-8');
            expect(normalise(response.body)).to.eql(normalise(recipe));
          })
      )
  );

  it('should DELETE a recipe', () =>
    post(recipe)
      .then(() =>
        erase(recipe.id)
          .then(() => get(recipe.id, statusCodes.NOT_FOUND))
      )
  );

});
