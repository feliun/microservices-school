const stores = require('require-all')({
  dirname: __dirname,
  filter: (fileName) => fileName === 'index.js' ? undefined : fileName.replace('.js', '')
});

module.exports = () => {

  const start = ({ config: store, collections, logger }, cb) => {
    const pickedStore = stores[store];
    if (!pickedStore) return cb(new Error(`No available store with name ${store}`));
    cb(null, pickedStore(collections, logger));
  };

  return { start };

};
