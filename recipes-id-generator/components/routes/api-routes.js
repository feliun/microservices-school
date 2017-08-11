const bodyParser = require('body-parser');

module.exports = () => {

  const start = ({ app, generator }, cb) => {

    const { generate } = generator;

    app.use(bodyParser.json());

    app.get('/api/v1/id', (req, res, next) => {
      generate()
        .then((id) => res.json({ id }))
        .catch(next);
    });

    cb();
  };

  return { start };
};
