const System = require('systemic');
const optional = require('optional');
const { join } = require('path');
const manifest = optional(join(process.cwd(), 'manifest.json')) || {};
const pkg = require(join(process.cwd(), 'package.json'));
const store = require('./store');

module.exports = new System({ name: 'lib' })
  .add('manifest', manifest)
  .add('pkg', pkg)
  .add('store', store())
  .dependsOn('config', 'collections', 'logger', 'broker');
