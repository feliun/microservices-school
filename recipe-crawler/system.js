const System = require('systemic');
const { join } = require('path');

module.exports = () => new System({ name: 'svc-example' }).bootstrap(join(__dirname, 'components'));
