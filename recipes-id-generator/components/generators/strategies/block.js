const R = require('ramda');
const { BlockArray } = require('block-sequence');
const init = require('block-sequence-mongo');

module.exports = (options, logger) => new Promise((resolve, reject) => {

  let idGenerator;

  const name = options.block.sequence.name;

  const generate = () => new Promise((resolve, reject) => {
    idGenerator.next((err, id) => {
      if (err) return reject(err);
      resolve(id);
    });
  });

  // TODO move to config
  const url = 'mongodb://127.0.0.1/recipes';
  const mongoOptions = {};

  init({ url, options: mongoOptions }, (err, driver) => {
    if (err) return reject(err);
    driver.ensure({ name }, (err, sequence) => {
      if (err) return reject(err);
      const driverOpts = { block: { sequence, driver }};
      const blockConfig = R.merge(options, driverOpts);
      idGenerator = new BlockArray(blockConfig);
      resolve(generate);
    });
  });

});
