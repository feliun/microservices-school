const R = require('ramda');
const debug = require('debug')('recipes-crawler');
const request = require('superagent');

module.exports = () => {

  const start = ({ config, logger, broker }, cb) => {

    const API_KEY = config.key || process.env.F2F_KEY;

    // TODO extract these functions to a controller to encapsulate APIs accesses

    const getPage = (baseUrl, page) => {
      const url = `${baseUrl}?key=${API_KEY}&page=${page}`;
      logger.info(`Getting recipes batch from url ${url}`);
      return request.get(url);
    };

    const getRecipe = R.curry((baseUrl, recipeId) => {
      const url = `${baseUrl}?key=${API_KEY}&rId=${recipeId}`;
      debug(`Rquesting recipe with url: ${url}`);
      return request.get(url);
    });

    const findByRecipeId = (recipeId) => {
      const { host, path, query } = config.recipesApi;
      const url = `${host}${path}?${query.key}=${query.value}`.replace(':id', recipeId);
      debug(`Trying to find recipe with url: ${url}`);
      return request.get(url)
        .then(({ body }) => body)
        .catch((err) => {
          if (err.status !== 404) logger.error(`Error when finding recipe on url ${url}: ${err.message}`);
          throw err;
        });
    };

    const generateId = () => {
      const { host, path, query } = config.idGenerator;
      const url = `${host}${path}`;
      debug(`Generating a new id from url: ${url}`);
      return request.get(url)
        .then(({ body }) => body)
        .catch((err) => {
          logger.error(`Error when generating a new id from url ${url}: ${err.message}`);
          throw err;
        });
    };

    const extractIds = R.pipe(
      R.prop('recipes'),
      R.pluck('recipe_id')
    );

    const extractRecipes = R.pipe(
      R.pluck('text'),
      R.map(JSON.parse),
      R.pluck('recipe')
    );

    const publish = (recipe) => broker.publish('conclusions', recipe, 'recipes_crawler.v1.notifications.recipe.crawled');

    const translate = ({ publisher, ingredients, source_url, recipe_id, image_url, social_rank, title, id }) => ({
      publisher,
      ingredients,
      source_url,
      image_url,
      social_rank,
      title,
      id,
      version: new Date().getTime(),
      source_id: recipe_id,
      source: 'F2F'
    });

    const adapt = (recipe) =>
      findByRecipeId(recipe.recipe_id)
      .then(translate)
      .catch((err) => {
        if (err.status !== 404) throw err;
        // non found - we generate a new id
        return generateId()
          .then(({ id }) => translate(R.merge(recipe, { id })));
      });

    const crawl = () => {
      logger.info('Crawling in search of new recipes...');
      const random = Math.floor(Math.random() * 100);
      const url = `${config.baseUrl}${config.searchSuffix}`;
      return getPage(url, config.page || random)
        .catch((err) => {
          logger.error(`Error accessing url ${url}: ${err.message} ${err.stack}`);
          throw err;
        })
        .then(({ text }) => {
          const ids = extractIds(JSON.parse(text));
          logger.info(`Getting details for ${ids.length} recipes`);
          const recipeRequests = R.map(getRecipe(`${config.baseUrl}${config.recipeSuffix}`), ids);
          return Promise.all(recipeRequests);
        })
        .then((recipeResponse) => extractRecipes(recipeResponse))
        .then((recipes) => Promise.all(R.map(adapt, recipes)))
        .then((recipeList) => Promise.all(R.map(publish, recipeList))
        .then(() => logger.info('New recipes ingested correctly'))
        .catch((err) => logger.error(`Error when pulling new recipes: ${err.message} ${err.stack}`)))
    };
    setInterval(crawl, config.frequency);
    if (config.autostart) crawl();
    cb();
  };

  return { start };

};
