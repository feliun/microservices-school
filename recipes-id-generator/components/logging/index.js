const System = require('systemic');
const prepper = require('./prepper');
const console = require('./console');
const bunyan = require('./bunyan');
const sumo = require('./sumo');
const prepperMiddleware = require('./prepper-middleware');

module.exports = new System({ name: 'logging' })
  .add('transports.console', console())
  .add('transports.sumo', sumo())
  .add('transports.bunyan', bunyan()).dependsOn('pkg')
  .add('transports').dependsOn(
    { component: 'transports.console', destination: 'console' },
    { component: 'transports.sumo', destination: 'sumo' },
    { component: 'transports.bunyan', destination: 'bunyan' })
  .add('logger', prepper()).dependsOn('config', 'pkg', 'transports')
  .add('middleware.prepper', prepperMiddleware()).dependsOn('app')
