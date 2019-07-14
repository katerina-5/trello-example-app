const homepage = require('./homepage');
const columns = require('./columns');

module.exports = function (app) {
  app.use('/', homepage);
  app.use('/columns', columns);
};
