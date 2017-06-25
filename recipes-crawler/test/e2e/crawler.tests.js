const nock = require('nock');
const R = require('ramda');
const expect = require('expect.js');
const system = require('../../system');
const recipe = require('../../fixtures/recipe.json');
const recipeSearch = require('../../fixtures/recipesSearch.json');

describe('Crawls a source url to get recipes and publishes them', () => {
  let sys;
  let myBroker;
  let myConfig;

  const startSystem = () => new Promise((resolve, reject) => {
    sys = system().start((err, { broker, config }) => {
      if (err) return reject(err);
      myBroker = broker;
      myConfig = config;
      resolve();
    });
  });

  const stopSystem = () => new Promise((resolve, reject) => {
    sys.stop((err) => {
      if (err) return reject(err);
      resolve();
    });
  });

  afterEach(() => {
    nock.cleanAll();
    if (sys) return stopSystem();
  });

  const nockSearch = ({ statusCode, response }) => 
    nock(myConfig.baseUrl)
    .get(`${myConfig.searchSuffix}?key=${myConfig.key}&page=${myConfig.page}`)
    .reply(statusCode, response);

  const nockRecipe = ({ statusCode, response, recipe_id }) => 
    nock(myConfig.baseUrl)
    .get(`${myConfig.recipeSuffix}?key=${myConfig.key}&rId=${recipe_id}`)
    .reply(statusCode, response);

  const shouldReceive = (expectedRK) =>
    myBroker.subscribe('recipes_crawler')
      .then(({ message, content, ackOrNack, cancel }) => {
        ackOrNack();
        if (message.fields.routingKey !== expectedRK) return shouldReceive(expectedRK);
        return cancel.then(() => Promise.resolve({ message, content }));
      });

  const shouldNotReceive = () => new Promise((resolve, reject) => {
    setTimeout(() => resolve(), 1000);
    return myBroker.subscribe('recipes_crawler')
      .then(({ message, ackOrNack, cancel }) => {
        ackOrNack();
        return reject('A message has been received and this is wrong!');
      });
  });

  it('fails when search endpoint is not available', () =>
    startSystem()
      .then(() => shouldNotReceive())
  );
});