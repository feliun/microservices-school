const nock = require('nock');
const R = require('ramda');
const expect = require('expect.js');
const system = require('../../system');
const recipesSearch = require('../../fixtures/recipesSearch.json');

describe('Crawls a source url to get recipes and publishes them', () => {
  let sys;
  let myBroker;
  let myConfig;

  const startSystem = () => new Promise((resolve, reject) => {
    sys = system().start((err, { broker, config }) => {
      if (err) return reject(err);
      myBroker = broker;
      myConfig = config.crawler;
      resolve();
    });
  });

  const stopSystem = () => new Promise((resolve, reject) => {
    sys.stop((err) => {
      if (err) return reject(err);
      resolve();
    });
  });

  before(() => nock.cleanAll());

  afterEach(() => {
    nock.cleanAll();
    if (sys) return stopSystem();
  });

  const createSearchResponse = () => JSON.stringify(recipesSearch);

  const createSearchNock = (statusCode, searchResponse) =>
    nock(myConfig.baseUrl)
      .get(`${myConfig.searchSuffix}`)
      .query({
          key: `${myConfig.key}`,
          page: `${myConfig.page}`
      })
      .reply(statusCode, searchResponse);

  const createRecipeNock = R.curry((statusCode, recipe_id) => {
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

  const checkFields = (recipe) => {
    ['publisher','ingredients','source_url','image_url',
     'social_rank','title','source_id','source'].forEach((field) => expect(recipe[field]).to.be.ok());
     expect(recipe.source).to.equal('F2F');
  };

  const wait = (ms) => new Promise((resolve, reject) => setTimeout(resolve, ms));

  const SETUP_TIME = 2000;

  it('fails when search endpoint is not available', () => startSystem().then(() => shouldNotReceive()));

  it('fails when recipes endpoint is not available', () =>
    startSystem()
      .then(() => createSearchNock(200, createSearchResponse()))
      .then(() => shouldNotReceive())
  );

  it('publishes as many recipes as the search page returned when everything goes OK', () =>
    startSystem()
      .then(() => {
        createSearchNock(200, createSearchResponse())
        R.map(createRecipeNock(200), R.pluck('recipe_id', recipesSearch.recipes));
        return wait(SETUP_TIME)
        .then(() => shouldReceive('recipes_crawler.v1.notifications.recipe.crawled', recipesSearch.recipes.length))
        .then((received) => expect(received.length).to.equal(recipesSearch.recipes.length));
      })
  );

  it('publishes recipes applying a transformation on all of them', () =>
    startSystem()
      .then(() => {
        createSearchNock(200, createSearchResponse())
        R.map(createRecipeNock(200), R.pluck('recipe_id', recipesSearch.recipes));
        return wait(SETUP_TIME)
        .then(() => shouldReceive('recipes_crawler.v1.notifications.recipe.crawled', recipesSearch.recipes.length))
        .then(R.map(checkFields));
      })
  );
});
