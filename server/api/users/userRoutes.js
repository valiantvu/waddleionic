var userController = require('./userController.js');

module.exports = function(app){

  // User data
  app.post('/userdata', userController.userLogin);
  app.post('/userfoursquarecode', userController.addFoursquareData);
  app.post('/userinstagramcode', userController.addInstagramData);
	app.get('/userinfo/:user', userController.getUserInfo);

  // Bucketlist
  app.get('/bucketlist/:user/:page?/:skip?', userController.getBucketList);

  // Folders
  app.post('/folders/add', userController.addFolder);
  app.post('/folders/delete', userController.deleteFolderAndContents);
  app.get('/folders/search/:user/:query/:page?/:skip?', userController.searchFoldersByName);
  app.get('/folders/:user/:page?/:skip?', userController.fetchFolders);
  app.get('/folder/:user/:folder/:page?/:skip?', userController.fetchFolderContents);
  app.get('/folder/search/:user/:folder/:query/:page?/:skip?', userController.searchFolderContents);

  // Feed
  app.get('/aggregatefeed/:user/:page?/:skip?/:data?', userController.getAggregatedListOfCheckins);

  // Notifications
  app.post('/notifications/update', userController.updateNotificationReadStatus);
  app.get('/notifications/unread/:user/:page?/:skip?', userController.getUnreadNotifications);
  app.get('/notifications/read/:user/:page?/:skip?', userController.getReadNotifications);


  // Search feed or user's checkins
  app.get('/searchfootprints/:user/:query/:page?/:skip?', userController.searchUserFootprints);
  app.get('/searchfeed/:user/:query/:page?/:skip?', userController.searchUserFeed);

  // Friends
  app.get('/friendslist/:user/:page?/:skip?', userController.getFriendsList);
  app.get('/friendslist/search/:user/:query/:page?/:skip?', userController.searchFriendsList);

  // Facebook
  app.post('/publish/facebook', userController.publishFacebookPost);
	//the next line must be listed last because it catches all paths
	app.get('/:friend/:viewer/:page?/:skip?', userController.getUserData);
};