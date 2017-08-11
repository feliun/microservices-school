const System = require('systemic');
const { join } = require('path');

module.exports = () => new System({ name: 'recipes-ip-generator' }).bootstrap(join(__dirname, 'components'));
