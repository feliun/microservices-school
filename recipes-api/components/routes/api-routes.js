const bodyParser = require('body-parser');

module.exports = () => {

  const start = ({ app }, cb) => {

    app.use(bodyParser.json());

    app.get('/api/v1/recipes', (req, res) => res.json([{  }]));

    cb();
  };

  return { start };
};
