var placeController = require('./placeController.js');

module.exports = function (app) {
  app.post('/placedata', placeController.updatePlace);
  app.get('/search/:user/:query', placeController.searchWaddleDB);
  app.get('/assigncategories/:user', placeController.assignIconToCategory);
  app.get('/beenhere/:place/:user', placeController.findFriendsAlreadyBeen);
  app.get('/discover/search/:user', placeController.discoverPlaces);
  app.get('/discover/category/:query/:user/:price?', placeController.discoverPlacesByCategoryOrName);
  app.get('/discover/location/:location/:user', placeController.discoverPlacesByLocation);
  app.get('/discover/location-category/:location/:query/:user', placeController.discoverPlacesByCategoryOrNameAndLocation);
  app.get('/tags/:query/:lat/:lng/:radius', placeController.fetchTagsBasedOnSearchTerm);
};
