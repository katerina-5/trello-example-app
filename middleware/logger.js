module.exports = function (req, res, next) {
  console.log('New connection!');
  next();
};
