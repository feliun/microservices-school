const System = require('systemic');
const store = require('./types');

module.exports = new System({ name: 'store' })
  .add('store', store())
  .dependsOn('config', 'collections', 'logger', 'broker');
