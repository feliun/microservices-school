const Boom = require('boom');
const bodyParser = require('body-parser');

module.exports = () => {

  const start = ({ app, store }, cb) => {

    app.use(bodyParser.json());

    app.get('/api/v1/recipes/:id', (req, res, next) => {
      store.getRecipe(req.params.id)
        .then((recipe) => recipe ? res.json(recipe) : next())
        .catch(next);
    });

    app.post('/api/v1/recipes', (req, res, next) => {
      // TODO apply Joi validation
      if(!req.body) return next(Boom.badRequest('Invalid or missing body'));
      if(!req.body.id) return next(Boom.badRequest('Invalid or missing id'));

      store.saveRecipe(req.body)
        .then(() => res.status(204).send())
        .catch(next);
    });

    app.delete('/api/v1/recipes/:id', (req, res, next) => {
      store.deleteRecipe(req.params.id)
        .then(() => res.status(204).send())
        .catch(next);
    });

    cb();
  };

  return { start };
};
