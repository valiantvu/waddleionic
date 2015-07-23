var checkinController = require('./checkinController.js');

module.exports = function (app) {
  app.get('/venuesearchweb/:facebookID/:query/:near', checkinController.searchFoursquareVenuesWeb);
  app.get('/venuesearchmobile/:facebookID/:lat/:lng', checkinController.searchFoursquareVenuesMobile);
  app.get('/venue/:venueID/:facebookID', checkinController.getVenueInfo);
  app.post('/nativecheckin', checkinController.handleNativeCheckin);
  app.post('/nativecheckin/edit', checkinController.editNativeCheckin);
  app.get('/sign_s3/:facebookID/:photoUUID/:photoSize', checkinController.sign_s3);
  app.post('/realtimefsqdata', checkinController.realtimeFoursquareData);
  app.get('/realtimeinstagram', checkinController.instagramHubChallenge);
  app.post('/realtimeinstagram', checkinController.handleIGPost);
  app.get('/realtimefacebook', checkinController.facebookHubChallenge);
  app.post('/realtimefacebook', checkinController.handleFBPost);

  //Routes for user actions
  app.post('/bucketlist', checkinController.addToBucketList);
  app.post('/removebucket', checkinController.removeFromBucketList);
  app.post('/folder', checkinController.addToFolder);
  app.post('/removefromfolder', checkinController.removeFromFolder);
  app.post('/removefromfavorites', checkinController.removeFromFavorites);
  app.post('/comment', checkinController.addComment);
  app.post('/removecomment', checkinController.removeComment);
  app.post('/props', checkinController.giveProps);
  app.post('/delete', checkinController.deleteFootprint);
  app.post('/suggest', checkinController.suggestFootprint);
  app.get('/interactions/:checkinid', checkinController.getHypesAndComments);
};
