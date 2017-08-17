const R = require('ramda');
const { join } = require('path');
const expect = require('expect.js');
const configSystem = require('../../components/config');
const idGenerators = require('require-all')({
  dirname: join(__dirname, '..', '..', 'components', 'generators', 'strategies'),
  filter: (fileName) => fileName === 'index.js' ? undefined : fileName.replace('.js', '')
});

const test = (generator, id) => {

  const NUM_IDS = 100;

  describe(`Recipes ID generator based on ${id} strategy`, () => {
    let initialConfig;

    before(done => {
      configSystem.start((err, { config }) => {
        if (err) return done(err);
        initialConfig = config;
        done();
      });
    });

    it(`should generate an id greater than 0 with strategy ${id}`, () =>
      generator(initialConfig.generator.options)
      .then((generateFn) => generateFn())
      .then((id) => expect(id).to.be.greaterThan(0))
    );

    const checkMultipleGeneration = (currentId, generateFn, times) => {
      if (times === 0) return Promise.resolve();
      return generateFn()
        .then((id) => {
          expect(id).to.be.equal(currentId + 1);
          return checkMultipleGeneration(currentId + 1, generateFn, times - 1);
        });
    };

    it(`should generate multiple consecutive ids with strategy ${id}`, () => {
      let generateFn;
      return generator(initialConfig.generator.options)
      .then((_generateFn) => {
        generateFn = _generateFn;
        return generateFn();
      })
      .then((id) => {
        expect(id).to.be.greaterThan(0);
        return checkMultipleGeneration(id, generateFn, NUM_IDS);
      });
    });
  });
};

const runAll = R.mapObjIndexed(test);
runAll(idGenerators);
