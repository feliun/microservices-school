let currentId = 1;

const generate = () =>
  Promise.resolve(currentId)
    .then(() => currentId++);

module.exports = () => Promise.resolve(generate);
