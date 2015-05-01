var userController = require('./userController.js');

module.exports = function(app){
  app.post('/userdata', userController.userLogin);
  app.post('/userfoursquarecode', userController.addFoursquareData);
  app.post('/userinstagramcode', userController.addInstagramData);
  app.get('/bucketlist/:user/:page?/:skip?', userController.getBucketList);
  app.post('/folders/add', userController.addFolder);
  app.post('/folders/delete', userController.deleteFolderAndContents);
  app.get('/folders/search/:user/:query/:page?/:skip?', userController.searchFoldersByName);
  app.get('/folders/:user/:page?/:skip?', userController.fetchFolders);
  app.get('/folder/:user/:folder/:page?/:skip?', userController.fetchFolderContents);
  app.get('/folder/search/:user/:folder/:query/:page?/:skip?', userController.searchFolderContents);
  app.get('/aggregatefeed/:user/:page?/:skip?', userController.getAggregatedListOfCheckins);
	app.post('/notifications/update', userController.updateNotificationReadStatus);
  app.get('/notifications/unread/:user', userController.getUnreadNotifications);
  app.get('/notifications/read/:user/:limit', userController.getReadNotifications);
	app.get('/userinfo/:user', userController.getUserInfo);
  app.get('/searchfootprints/:user/:query/:page?/:skip?', userController.searchUserFootprints);
  app.get('/searchfeed/:user/:query/:page?/:skip?', userController.searchUserFeed);
  app.get('/friendslist/:user/:page?/:skip?', userController.getFriendsList);
  app.get('/friendslist/search/:user/:query/:page?/:skip?', userController.searchFriendsList);
	//the next line must be listed last because it catches all paths
	app.get('/:friend/:viewer/:page?/:skip?', userController.getUserData);
};