let currentId = 0;

const generate = () =>
  Promise.resolve(currentId)
    .then(() => currentId++);

module.exports = { generate };
