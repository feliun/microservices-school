const nock = require('nock');
const R = require('ramda');
const expect = require('expect.js');
const configSystem = require('../../components/config');
const system = require('../../system');
const recipesSearch = require('../../fixtures/recipesSearch.json');

describe('Crawls a source url to get recipes and publishes them', () => {
  let sys;
  let myBroker;
  let myConfig;

  before((done) => {
    nock.cleanAll();
    configSystem.start((err, { config }) => {
      if (err) return done(err);
      myConfig = config.crawler;
      done();
    });
  });

  afterEach(() => {
    nock.cleanAll();
    if (sys) return stopSystem();
  });

  const startSystem = () => new Promise((resolve, reject) => {
    sys = system().start((err, { broker }) => {
      if (err) return reject(err);
      myBroker = broker;
      resolve();
    });
  });

  const stopSystem = () => new Promise((resolve, reject) => {
    sys.stop((err) => {
      if (err) return reject(err);
      resolve();
    });
  });

  const random = () => Math.floor(Math.random() * 100000);

  const createSearchResponse = (recipes) => JSON.stringify(recipes || recipesSearch);

  const nockExternalApiSearch = (statusCode, searchResponse) =>
    nock(myConfig.baseUrl)
      .get(`${myConfig.searchSuffix}`)
      .query({
          key: `${myConfig.key}`,
          page: `${myConfig.page}`
      })
      .reply(statusCode, searchResponse);

  const nockRecipesApi = R.curry((statusCode, findResponse) => {
    const { host, path, query } = myConfig.recipesApi;
    nock(host)
      .get(path.replace(':id', findResponse.recipe_id))
      .query({
          key: query.value
      })
      .reply(statusCode, findResponse);
  });

  const nockIdGenerator = (statusCode, expectedId) => {
    const { host, path } = myConfig.idGenerator;
    nock(host)
      .get(path)
      .reply(statusCode, { id: expectedId });
  };

  const nockExternalApiGet = R.curry((statusCode, recipe_id) => {
    const getRecipe = R.pipe(
      R.find(R.propEq('recipe_id', recipe_id)),
      R.merge({ ingredients: [] })
    );
    const recipe = getRecipe(recipesSearch.recipes);
    return nock(myConfig.baseUrl)
      .get(`${myConfig.recipeSuffix}`)
      .query({
          key: `${myConfig.key}`,
          rId: recipe_id
      })
      .reply(statusCode, JSON.stringify({ recipe }))
  });

  const shouldReceive = (expectedRK, times, received = []) => {
    return myBroker.subscribe('recipes_crawler')
      .then(({ message, content, ackOrNack, cancel }) => {
        ackOrNack();
        if (message.fields.routingKey === expectedRK) received.push(content);
        if (times === received.length) return cancel.then(() => Promise.resolve(received));
        return shouldReceive(expectedRK, times, received);
      });
  };

  const shouldNotReceive = () => new Promise((resolve, reject) => {
    setTimeout(() => resolve(), 1000);
    return myBroker.subscribe('recipes_crawler')
      .then(({ message, ackOrNack, cancel }) => {
        ackOrNack();
        return reject('A message has been received and this is wrong!');
      });
  });

  const wait = (ms) => new Promise((resolve, reject) => setTimeout(resolve, ms));

  const PAUSE = 500;

  const checkFields = (recipe) => {
    ['publisher','ingredients','source_url','image_url',
     'social_rank','title','source_id','source'].forEach((field) => expect(recipe[field]).to.be.ok());
     expect(recipe.source).to.equal('F2F');
     expect(recipe.id).to.be.a('number');
     expect(recipe.version).to.be.greaterThan(0);
  };

  it('fails when search endpoint is not available', () => startSystem().then(() => shouldNotReceive()));

  it('fails when recipes endpoint is not available', () => {
    nockExternalApiSearch(200, createSearchResponse());
    return startSystem().then(() => shouldNotReceive());
  });

  it('publishes a recipe with the recorded id whenever the recipes API returns that it already exists', () => {
    const myRecipe = R.head(recipesSearch.recipes);
    const sampleMsg = {
      count: 1,
      recipes: [ myRecipe ]
    };
    const existentId = myRecipe.recipe_id;
    nockExternalApiSearch(200, createSearchResponse(sampleMsg));
    nockExternalApiGet(200, existentId);
    nockRecipesApi(200, R.merge(myRecipe, { id: existentId }));
    return startSystem()
      .then(() => wait(PAUSE))
      .then(() => shouldReceive('recipes_crawler.v1.notifications.recipe.crawled', sampleMsg.recipes.length))
      .then(([ received ]) => {
        expect(myRecipe.id).to.equal(undefined);
        expect(received.id).to.equal(myRecipe.recipe_id);
      });
  });

  it('publishes a recipe with a new generated id whenever the API cannot find it', () => {
    const myRecipe = R.head(recipesSearch.recipes);
    const sampleMsg = {
      count: 1,
      recipes: [ myRecipe ]
    };
    const existentId = myRecipe.recipe_id;
    nockExternalApiSearch(200, createSearchResponse(sampleMsg));
    nockExternalApiGet(200, existentId);
    nockRecipesApi(404, R.merge(myRecipe, { id: existentId }));
    const newId = 1234567890;
    nockIdGenerator(200, newId);
    return startSystem()
      .then(() => wait(PAUSE))
      .then(() => shouldReceive('recipes_crawler.v1.notifications.recipe.crawled', sampleMsg.recipes.length))
      .then(([ received ]) => {
        expect(received.id).to.equal(newId);
      });
  });

  it('publishes as many recipes as the search page returned when everything goes OK', () => {
    nockExternalApiSearch(200, createSearchResponse());
    R.map(nockExternalApiGet(200), R.pluck('recipe_id', recipesSearch.recipes));
    R.map(nockRecipesApi(200), recipesSearch.recipes);
    return startSystem()
      .then(() => wait(PAUSE))
      .then(() => shouldReceive('recipes_crawler.v1.notifications.recipe.crawled', recipesSearch.recipes.length))
      .then((received) => expect(received.length).to.equal(recipesSearch.recipes.length));
  });

  it('publishes recipes applying a transformation on all of them', () => {
    nockExternalApiSearch(200, createSearchResponse());
    R.map(nockExternalApiGet(200), R.pluck('recipe_id', recipesSearch.recipes));
    const recipesWithIds = R.map(R.merge({ id: random(), ingredients: [] }), recipesSearch.recipes);
    R.map(nockRecipesApi(200), recipesWithIds);
    return startSystem()
      .then(() => wait(PAUSE))
      .then(() => shouldReceive('recipes_crawler.v1.notifications.recipe.crawled', recipesSearch.recipes.length))
      .then((received) => {
        expect(received.length).to.equal(recipesSearch.recipes.length);
        R.map(checkFields, received);
      });
  });
});
