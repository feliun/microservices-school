const merge = require('lodash.merge');
const R = require('ramda');

module.exports = ({ prepper, transport } = {}) => {

  const prepperFn = prepper || require('prepper');
  const handlers = prepperFn.handlers;

  const start = ({ config, transports, pkg = { name: 'unknown' } }, cb) => {
    const transportFn = transport || R.path([config.transport], transports);
    config = merge({ include: [], exclude: [] }, config);

    const logger = new prepperFn.Logger({ handlers: [
      new handlers.Merge({ package: pkg }),
      new handlers.Merge({ service: { env: process.env.SERVICE_ENV } }),
      new handlers.Process(),
      new handlers.System(),
      new handlers.Timestamp(),
      new handlers.Flatten(),
      new handlers.KeyFilter({ include: config.include, exclude: config.exclude }),
      new handlers.Unflatten()
    ]}).on('message', event => {
      if (transportFn) transportFn(event);
    });

    cb(null, logger);
  };

  return { start };
};
