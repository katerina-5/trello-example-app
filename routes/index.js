const homepage = require('./homepage');

module.exports = function (app) {
  app.use('/', homepage);
};
