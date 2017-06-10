const System = require('systemic');
const { join } = require('path');

module.exports = () => new System({ name: 'recipes-api' }).bootstrap(join(__dirname, 'components'));
