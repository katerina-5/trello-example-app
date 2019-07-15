const homepage = require('./homepage');
const columns = require('./columns');
const tasks = require('./tasks');

module.exports = function (app) {
  app.use('/', homepage);
  app.use('/columns', columns);
  app.use('/tasks', tasks);
};
