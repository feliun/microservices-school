const R = require('ramda');
const system = require('../system');

module.exports = (mockFn = R.identity) => mockFn(system());

