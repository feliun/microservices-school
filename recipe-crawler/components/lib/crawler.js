const R = require('ramda');
const request = require('superagent');

module.exports = () => {

  const start = ({ config, logger, broker }, cb) => {

    const API_KEY = config.key || process.env.F2F_KEY;

    const getPage = (baseUrl, page) => {
      const url = `${baseUrl}?key=${API_KEY}&page=${page}`;
      logger.info(`Getting recipes batch from url ${url}`);
      return request.get(url);
    };

    const getRecipe = R.curry((baseUrl, recipeId) => {
      const url = `${baseUrl}?key=${API_KEY}&rId=${recipeId}`;
      return request.get(url);
    });

    const extractIds = R.pipe(
      R.prop('recipes'),
      R.pluck('recipe_id')
    );

    const extractRecipes = R.pipe(
      R.pluck('text'),
      R.map(recipe => JSON.parse(recipe)),
      R.pluck('recipe')
    );

    const publish = (recipe) => broker.publish('conclusions', recipe, 'recipes_crawler.v1.notifications.recipe.crawled');

    const adapt = ({ publisher, ingredients, source_url, recipe_id, image_url, social_rank, title }) => ({
      publisher,
      ingredients,
      source_url,
      image_url,
      social_rank,
      title,
      source_id: recipe_id,
      source: 'F2F'
    });

    const crawl = () => {
      logger.info('Crawling in search of new recipes...');
      const random = Math.floor(Math.random() * 100);
      return getPage(config.searchUrl, random)
        .then(({ text }) => {
          const ids = extractIds(JSON.parse(text)).splice(0,3);
          logger.info(`Getting details for ${ids.length} recipes`);
          const recipeRequests = R.map(getRecipe(config.recipeUrl), ids);
          return Promise.all(recipeRequests);
        })
        .then((recipeResponse) => extractRecipes(recipeResponse))
        .then(R.map(adapt))
        .then((recipeList) => Promise.all(R.map(publish, recipeList)))
        .then(() => logger.info('New recipes ingested correctly'))
        .catch((err) => logger.error(`Error when pulling new recipes: ${err.message} ${err.stack}`))
    };
    setInterval(crawl, config.frequency);
    if (config.autostart) crawl();
    cb();
  };

  return { start };

};
