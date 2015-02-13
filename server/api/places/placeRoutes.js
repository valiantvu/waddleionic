var placeController = require('./placeController.js');

module.exports = function (app) {
  app.post('/placedata', placeController.updatePlace);
  app.get('/search/:user/:query', placeController.searchWaddleDB);
  app.get('/assigncategories', placeController.assignIconToCategory);
};