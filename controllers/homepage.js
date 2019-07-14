module.exports = {
  getHomePage
};

function getHomePage(req, res, next) {
  res.send('Trello example application - REST API.\nThis is a home page.');
}
