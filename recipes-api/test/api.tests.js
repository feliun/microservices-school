const expect = require('expect.js');
const system = require('../system');
const supertest = require('supertest-as-promised');

describe('Recipes API', () => {
  let request;
  let sys;

  before(done => {
    sys = system().start((err, { app }) => {
      if (err) return done(err);
      request = supertest(Promise)(app);
      done();
    });
  });

  after(done => sys.stop(done));

  it('should return manifest', () =>
    request
      .get('/__/manifest')
      .expect(200)
      .then((response) => {
        expect(response.headers['content-type']).to.equal('application/json; charset=utf-8');
      })
  );
});
