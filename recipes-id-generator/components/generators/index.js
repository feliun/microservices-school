const System = require('systemic');
const generator = require('./strategies');

module.exports = new System({ name: 'generator' })
  .add('generator', generator()).dependsOn('config', 'logger');
