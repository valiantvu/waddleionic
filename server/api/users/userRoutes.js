var userController = require('./userController.js');

module.exports = function(app){
  app.post('/userdata', userController.userLogin);
  app.post('/userfoursquarecode', userController.addFoursquareData);
  app.post('/userinstagramcode', userController.addInstagramData);
  app.get('/bucketlist/:user/:page?', userController.getBucketList);
	app.get('/aggregatefeed/:user/:page?/:skip?', userController.getAggregatedListOfCheckins);
	app.post('/notifications', userController.updateNotificationReadStatus);
  app.get('/notifications/:user', userController.getUnreadNotifications);
  app.get('/readnotifications/:user/:limit', userController.getReadNotifications);
	app.get('/userinfo/:user', userController.getUserInfo);
  app.get('/searchfootprints/:user/:query', userController.searchUserFootprints);
	//the next line must be listed last because it catches all paths
	app.get('/:friend/:viewer/:page?/:skip?', userController.getUserData);
};