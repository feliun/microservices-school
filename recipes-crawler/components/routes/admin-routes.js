module.exports = () => {

  const start = ({ manifest = {}, app }, cb) => {
    app.get('/__/manifest', (req, res) => res.json(manifest));
    app.post('/__/error', (req, res) => {
        setTimeout(() => process.emit('error', new Error('On Noes')));
    });
    app.post('/__/crash', (req, res) => {
        setTimeout(() => undefined.meh);
    });
    app.post('/__/reject', (req, res) => {
        setTimeout(() => Promise.reject(new Error('Oh Noes')));
    });
    cb();
  };

  return { start };
};
