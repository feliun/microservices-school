const fs = require('fs');

const removeFile = (filePath) => new Promise((resolve, reject) => {
  fs.unlink(filePath, (err) => (err ? reject(err) : resolve()));
});

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const retry = (delay, fn, ...args) => new Promise((resolve) => {
  setTimeout(() => fn(args).then(resolve), delay);
});

module.exports = {
    removeFile,
    wait,
    retry
};