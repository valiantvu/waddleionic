var _ = require('lodash');

var foursquareUtils = require('../../utils/foursquareUtils.js');
var facebookUtils = require('../../utils/facebookUtils.js');
var instagramUtils = require('../../utils/instagramUtils.js');
var helpers = require('../../utils/helpers.js');

var User = require('./userModel.js');
var Place = require('../places/placeModel.js');
var Checkin = require('../checkins/checkinModel.js');

var userController = {};

userController.userLogin = function (req, res) {

  var userData = req.body;
  var user;
  var FBAccessToken;
  var userFBTaggedPostsData = [];
  var userFBPhotoData = [];
  var userFBStatusesData = [];
  var userFBFriendsData;
  var combinedFBCheckins;
  var alreadyExists = false;

  // Start creation of new user or update and retrieval of existing user
  User.createUniqueUser(userData)
  .then(function (userNode) { 
    //note: this has the user node
    //console.dir(userNode.node._data.data)
    user = userNode;
    return facebookUtils.exchangeFBAccessToken(userData.fbToken);
  })
  // Store acces token on scope, Get profile pictures from Facebook
  .then(function (fbReqData) {
    FBAccessToken = fbReqData.access_token
    return facebookUtils.getFBProfilePicture(userData.facebookID);
  })
  .then(function (fbPicData) {
    var properties = {
      'fbToken': FBAccessToken,
    };
    // Asks if facebook profile picture is a default silhouette
    if(fbPicData.data.is_silhouette === false) {
      properties['fbProfilePicture'] = fbPicData.data.url;
    }
    return user.setProperties(properties);
  })
  .then(function (userNode) { 
    user = userNode;
    return user.countAllCheckins(userData.facebookID);
  })
  //Path forks here for existing vs new users
  .then(function (checkinsCount) {
    // console.log('fb checkins: ', checkinsAlreadyStored.length);
    // For existing users
    if (user.getProperty('footprintsCount') >= 0) {
      user.setProperty('footprintsCount', checkinsCount);
      user.findAllFriends(0, 100)
      .then(function (friendsList){

        userFBFriendsData = friendsList;
        return user.getAggregatedFootprintList(user.node._data.data.facebookID, 0, 5)
      })
      .then(function (aggregatedFootprints) {
        var allData = {
          user: user.node._data.data,
          friends: userFBFriendsData,
          aggregatedFootprints: aggregatedFootprints
        };
        res.json(allData);
        res.status(200).end();
      })
    } else {
      // For new users, start chain of facebook requests.
      console.log('initiate get and parse fbdata');
      getAndParseFBData();
    }
  })
  .catch(function(err) {
    console.log(err);
    res.status(500).end();
  });

  // Start getting data for checkins and photos
  var getAndParseFBData = function () {

    facebookUtils.getFBFriends(user)
    .then(function (fbRawUserData) {
      // Friends data
      return user.addFriends(fbRawUserData.data);
    })
    .then(function (friends) {
      // Parse Friends data
      var allFriends = _.map(friends, function(friend){
        return friend.body.data[0][0].data;
      })
      userFBFriendsData = allFriends;

      // return facebookUtils.getFBFeedItemsWithLocation(user);

      //get tagged places
      return facebookUtils.getFBTaggedPosts(user);
    })
    // .then(function (fbRawFeedItemsWithLocation) {
    //   console.log("RAW data RAWRRRRR: " + JSON.stringify(fbRawFeedItemsWithLocation));
    //   return facebookUtils.parseFBData(user, fbRawFeedItemsWithLocation);
    // })
    // .then(function (fbParsedFeedItems) {
    //   console.log("PARSED DATA: " + JSON.stringify(fbParsedFeedItems));
    //   return user.addCheckins(fbParsedFeedItems);
    // })
    .then(function (fbRawTaggedPostsData) {
      // parse Checkin data
      return facebookUtils.parseFBData(user, fbRawTaggedPostsData);
    })
    .then(function (fbParsedTaggedPostsData) {
      userFBTaggedPostsData = fbParsedTaggedPostsData;
      // get Picture data
      return facebookUtils.getFBPhotos(user);
    })
    .then(function (fbRawPhotoList) {
      // parse Photo data
      console.log("# of photos: ", fbRawPhotoList.length)
      return facebookUtils.parseFBData(user, fbRawPhotoList); 
    })
    .then(function (fbParsedPhotoData) {
      // merge tagged places and photos
      userFBPhotoData = fbParsedPhotoData;
      combinedFBCheckins = userFBTaggedPostsData.concat(userFBPhotoData);
      //get statuses posted by user
      return facebookUtils.getFBStatuses(user);
      // return user.addCheckins(combinedFBCheckins);
    })
    .then(function (fbRawStatusList) {
      return facebookUtils.parseFBData(user, fbRawStatusList);
    })
    .then(function (fbParsedStatusesData) {
      userFBStatusesData = fbParsedStatusesData;
      combinedFBCheckins = combinedFBCheckins.concat(userFBStatusesData);
      console.log("combinedCheckins: " + combinedFBCheckins);
      return helpers.addCityProvinceAndCountryInfoToParsedCheckins(combinedFBCheckins);
    })
    .then(function (combinedFBCheckinsWithLocation) {
      return user.addCheckins(combinedFBCheckinsWithLocation);
    })
    .then(function (data) {
      return user.countAllCheckins(userData.facebookID);
    })
    .then(function (checkinsCount) {
      user.setProperty('footprintsCount', checkinsCount);
      return user.getAggregatedFootprintList(user.node._data.data.facebookID, 0, 5);
    })
    .then(function (aggregatedFootprints) {
      var allData = {
        user: user.node._data.data,
        friends: userFBFriendsData,
        aggregatedFootprints: aggregatedFootprints
      };
      console.log('allData', allData)
      res.json(allData);
      res.status(200).end();
    })
    .catch(function(err) {
      console.log(err);
      res.status(500).end();
    });
  }
};

userController.addFoursquareData = function (req, res) {

  var userData = req.body;
  console.log('thsi is ma body', req.body)
  var user;

  console.log('add 4s data');

  //if client is ios app, then fousquareCode that is returned is actually the access token
  if(userData.build_type === 'ios') {
    console.log('inside ios client')
    addFoursquareDataFromIOSClient(userData);
  }

  else {

    User.find(userData)
    .then(function (userNode) { 
      user = userNode;
      return foursquareUtils.exchangeFoursquareUserCodeForToken(userData.foursquareCode, userData.redirect_uri);
    })
    .then(function (foursquareAccessToken) {
      console.log('foursquareAccessToken: ', foursquareAccessToken);
      return user.setProperty('fsqToken', foursquareAccessToken.access_token);
    })
    .then(function (userNode) {
      user = userNode;
      return foursquareUtils.getUserFoursquareIDFromToken(user);
    })
    .then(function (userFoursquareData) {
      console.log('foursquare response data')
      return user.setProperty('foursquareID', userFoursquareData.response.user.id);
    })
    .then(function (userNode) {
      user = userNode;
      return foursquareUtils.tabThroughFoursquareCheckinHistory(user);
    })
    .then(function (foursquareHistoryBucket) {
      var allFoursquareCheckins = foursquareUtils.convertFoursquareHistoryToSingleArrayOfCheckins(foursquareHistoryBucket);
      console.log('allFOursquareChekcins', JSON.stringify(allFoursquareCheckins));
      return foursquareUtils.parseFoursquareCheckins(allFoursquareCheckins);
    })
    .then(function (allParsedFoursquareCheckins) {
      return helpers.addCityProvinceAndCountryInfoToParsedCheckins(allParsedFoursquareCheckins);
    })
    .then(function (allParsedFoursquareCheckinsWithLocationInfo) {
      console.log('allParsedFoursquareCheckins: ', JSON.stringify(allParsedFoursquareCheckinsWithLocationInfo));
      return user.addCheckins(allParsedFoursquareCheckinsWithLocationInfo);
    })
    .then(function (data) {
      console.log('4s: ', data);
      res.status(204).end();
    })
    .catch(function(err) {
      console.log(err);
      res.status(500).end();
    })
  }
};

 var addFoursquareDataFromIOSClient = function (userData) {
  User.find(userData)
  .then(function (userNode) { 
    user = userNode;
    return user.setProperty('fsqToken', userData.foursquareCode);
  })
  .then(function (userNode) {
    user = userNode;
    return foursquareUtils.getUserFoursquareIDFromToken(user);
  })
  .then(function (userFoursquareData) {
    console.log('foursquare response data')
    return user.setProperty('foursquareID', userFoursquareData.response.user.id);
  })
  .then(function (userNode) {
    user = userNode;
    return foursquareUtils.tabThroughFoursquareCheckinHistory(user);
  })
  .then(function (foursquareHistoryBucket) {
    var allFoursquareCheckins = foursquareUtils.convertFoursquareHistoryToSingleArrayOfCheckins(foursquareHistoryBucket);
    console.log('allFOursquareChekcins', JSON.stringify(allFoursquareCheckins));
    return foursquareUtils.parseFoursquareCheckins(allFoursquareCheckins);
  })
  .then(function (allParsedFoursquareCheckins) {
    return helpers.addCityProvinceAndCountryInfoToParsedCheckins(allParsedFoursquareCheckins);
  })
  .then(function (allParsedFoursquareCheckinsWithLocationInfo) {
    console.log('allParsedFoursquareCheckins: ', JSON.stringify(allParsedFoursquareCheckinsWithLocationInfo));
    return user.addCheckins(allParsedFoursquareCheckinsWithLocationInfo);
  })
  .then(function (data) {
    console.log('4s: ', data);
    res.status(204).end();
  })
  .catch(function(err) {
    console.log(err);
    res.status(500).end();
  })
}

userController.addInstagramData = function (req, res) {

  var userData = req.body;
  var user;
  var igUserData;

  User.find(userData)
  .then(function (userNode) { 
    user = userNode;
    return instagramUtils.exchangeIGUserCodeForToken(userData.instagramCode, userData.build_type);
  })
  .then(function (igData) {
    igUserData = igData;
    return user.setProperty('igToken', igUserData.access_token);
  })
  .then(function (userNode) { 
    user = userNode;
    return user.setProperty('instagramID', igUserData.user.id);
  })
  .then(function (userNode) {
    user = userNode
    return instagramUtils.tabThroughInstagramPosts(user);
  })
  .then(function (rawInstagramPosts) {
    // console.log('rawInstagramPosts', JSON.stringify(rawInstagramPosts));
    return instagramUtils.parseIGData(rawInstagramPosts, user)
  })
  .then(function (parsedInstagramCheckins) {
      return helpers.addCityProvinceAndCountryInfoToParsedCheckins(parsedInstagramCheckins);
  })
  .then(function (parsedInstagramCheckinsWithLocationInfo) {
    return user.addCheckins(parsedInstagramCheckinsWithLocationInfo);
  })
  .then(function (data) {
    // console.log('ig: ', data);
    res.status(204).end();
  })
  .catch(function(err) {
    console.log(err);
    res.status(500).end();
  })

};

//uses facebook ID to grab friend data when user navigates to friend page
userController.getUserData = function (req, res){
  var page, skipAmount;
  var userData = {
    facebookID: req.params.friend
  };
  var userInfo = {};
  var viewer = req.params.viewer;
  
  if(req.params.page) {
    page = parseInt(req.params.page);
  }
  else {
    page = 0;
  }

  if(req.params.skip) {
    skipAmount = parseInt(req.params.skip);
  }
  else {
    skipAmount = 0;
  }

  User.find(userData)
  .then(function (friend) {
    userInfo.user = friend.node._data.data;
    return friend.findAllCheckins(viewer, page, skipAmount);
  })
  .then(function (checkins) {
    // console.log("checkins: ", checkins.length)
    userInfo.footprints = checkins;
    res.json(userInfo);
    res.status(200).end();
  })
  .catch(function (err) {
    console.log(err);
    res.status(500).end();
  });
};

userController.getAggregatedListOfCheckins = function (req, res){
  // var users = req.params.userlist;
  var user;
  var params = {};
  // var friendCheckins;
  params.facebookID = req.params.user;
  
  if(req.params.page) {
    params.page = parseInt(req.params.page);
  }
  else {
    params.page = 0;
  }

  if(req.params.skip) {
    params.skipAmount = parseInt(req.params.skip);
  }
  else {
    params.skipAmount = 0;
  }

  User.find(params)
  .then(function (userNode) {
    user = userNode;
    return user.getAggregatedFootprintList(params.facebookID, params.page, params.skipAmount);
  })
  .then(function (aggregatedFootprints) {
    res.json(aggregatedFootprints);
    res.status(200).end();
  })
  .catch(function (err) {
    console.log(err);
    res.status(500).end();
  });
};

userController.updateNotificationReadStatus = function (req, res) {
  var user;
  User.find(req.body)
  .then(function (userNode) {
    user = userNode;
    return user.updateNotificationReadStatus();
  })
  .then(function (notifications) {
    res.json(notifications);
    res.status(201).end();
  })
  .catch(function (err) {
    console.log(err);
    res.status(500).end();
  })
}

userController.getUnreadNotifications = function (req, res) {
  var user;
  var params = {}
  params.facebookID = req.params.user;

  User.find(params)
  .then(function (userNode) {
    user = userNode;
    return user.getUnreadNotifications();
  })
  .then(function (notifications) {
    res.json(notifications);
    res.status(200).end();
  })
  .catch(function (err) {
    console.log(err);
    res.status(500).end();
  })
}

userController.getReadNotifications = function (req, res) {
  var user;
  var params = {}
  var limit = req.params.limit;
  params.facebookID = req.params.user;

  User.find(params)
  .then(function (userNode) {
    user = userNode;
    return user.getReadNotifications(limit);
  })
  .then(function (notifications) {
    res.json(notifications);
    res.status(200).end();
  })
  .catch(function (err) {
    console.log(err);
    res.status(500).end();
  })
  
}

userController.getUserInfo = function (req, res) {
  console.log('in the controller')
  var params = {};
  params.facebookID = req.params.user;
  console.log('dis be ma params' + JSON.stringify(req.params))

  User.find(params)
   .then(function (userInfo) {
    console.log('userInfo' + JSON.stringify(userInfo.node._data.data));
    res.json(userInfo.node._data.data);
    res.status(200).end();
  })
  .catch(function (err) {
    console.log(err);
    res.status(500).end();
  });
};

// Takes a facebookID and returns a footprint object with
// checkin and place keys, containing checkin and place data
userController.getBucketList = function (req, res){
  var params = {};
  params.facebookID = req.params.user;

  if(req.params.page) {
    params.page = parseInt(req.params.page);
  }
  else {
    params.page = 0;
  }

  if(req.params.skip) {
    params.skipAmount = parseInt(req.params.skip);
  }
  else {
    params.skipAmount = 0;
  }

  User.getBucketList(params.facebookID, params.page, params.skipAmount)

  .then(function (footprints) {
    res.json(footprints);
    res.status(200).end();
  })
  .catch(function (err) {
    console.log(err);
    res.status(500).end();
  });
};

userController.addFolder = function (req, res) {
  var user, folderName, folderDescription;
  user = req.body.facebookID;
  folderName = req.body.folderName,
  folderDescription = req.body.folderDescription;
  console.log(req.body)

  User.addFolder(user, folderName, folderDescription)
  .then(function (folder) {
    console.log(folder);
    res.json(folder);
    res.status(200).end();
  })
  .catch(function (err){
    console.log(err);
    res.status(500).end();
  });
}

userController.fetchFolders = function (req, res) {
  var params = {};

  params.facebookID = req.params.user;

  if(req.params.page) {
    params.page = parseInt(req.params.page);
  }
  else {
    params.page = 0;
  }

  if(req.params.skip) {
    params.skipAmount = parseInt(req.params.skip);
  }
  else {
    params.skipAmount = 0;
  }

  User.fetchFolders(params.facebookID, params.page, params.skipAmount)
  .then(function (folders) {
    console.log(folders)
    res.json(folders);
    res.status(200).end();
  })
  .catch(function(err) {
    console.log(err)
    res.status(500).end();
  });
}

userController.searchFoldersByName = function (req, res) {
  var params = {};

  params.facebookID = req.params.user;
  params.query = req.params.query;

  if(req.params.page) {
    params.page = parseInt(req.params.page);
  }
  else {
    params.page = 0;
  }

  if(req.params.skip) {
    params.skipAmount = parseInt(req.params.skip);
  }
  else {
    params.skipAmount = 0;
  }

  User.searchFoldersByName(params.facebookID, params.query, params.page, params.skipAmount)
  .then(function (folders) {
    console.log(folders)
    res.json(folders);
    res.status(200).end();
  })
  .catch(function(err) {
    console.log(err)
    res.status(500).end();
  });
}

userController.fetchFolderContents = function (req, res) {
  var params = {};

  params.facebookID = req.params.user;
  params.folderName = req.params.folder;

  if(req.params.page) {
    params.page = parseInt(req.params.page);
  }
  else {
    params.page = 0;
  }

  if(req.params.skip) {
    params.skipAmount = parseInt(req.params.skip);
  }
  else {
    params.skipAmount = 0;
  }

  User.fetchFolderContents(params.facebookID, params.folderName, params.page, params.skipAmount)
  .then(function (folderContents) {
    console.log(folderContents)
    res.json(folderContents);
    res.status(200).end();
  })
  .catch(function(err) {
    console.log(err)
    res.status(500).end();
  });
}

userController.searchFolderContents = function (req, res) {
  var params = {};

  params.facebookID = req.params.user;
  params.folderName = req.params.folder;
  params.query = req.params.query;

  if(req.params.page) {
    params.page = parseInt(req.params.page);
  }
  else {
    params.page = 0;
  }

  if(req.params.skip) {
    params.skipAmount = parseInt(req.params.skip);
  }
  else {
    params.skipAmount = 0;
  }

  User.searchFolderContents(params.facebookID, params.folderName, params.query, params.page, params.skipAmount)
  .then(function (folderContents) {
    console.log(folderContents)
    res.json(folderContents);
    res.status(200).end();
  })
  .catch(function(err) {
    console.log(err)
    res.status(500).end();
  });
}

userController.searchUserFootprints = function (req, res) {
  var params = {};
  var facebookID = req.params.user;
  var query = req.params.query;

  query = query.trim();

  if(req.params.page) {
    params.page = parseInt(req.params.page);
  }
  else {
    params.page = 0;
  }

  if(req.params.skip) {
    params.skipAmount = parseInt(req.params.skip);
  }
  else {
    params.skipAmount = 0;
  }
  User.findFootprintsByPlaceName(facebookID, query, params.page, params.skipAmount)
  .then(function (footprints) {
    res.json(footprints);
    res.status(200).end();
  })
  .catch(function(err) {
    console.log(err);
    res.status(500).end();
  })
}

userController.searchUserFeed = function (req, res) {
  var params = {};
  var facebookID = req.params.user;
  var query = req.params.query;

  query = query.trim();

  if(req.params.page) {
    params.page = parseInt(req.params.page);
  }
  else {
    params.page = 0;
  }

  if(req.params.skip) {
    params.skipAmount = parseInt(req.params.skip);
  }
  else {
    params.skipAmount = 0;
  }
  User.findFeedItemsByPlaceName(facebookID, query, params.page, params.skipAmount)
  .then(function (footprints) {
    res.json(footprints);
    res.status(200).end();
  })
  .catch(function(err) {
    console.log(err);
    res.status(500).end();
  })
}

userController.getFriendsList = function (req, res) {
  var user, page, skipAmount;
  console.log(req.params);
  var params = {};
  params.facebookID = req.params.user;

   if(req.params.page) {
    page = parseInt(req.params.page);
  }
  else {
    page = 0;
  }

  if(req.params.skip) {
    skipAmount = parseInt(req.params.skip);
  }
  else {
    skipAmount = 0;
  }

  User.find(params)
  .then(function(userNode) {
    user = userNode
    return user.findAllFriends(page, skipAmount);
  })
  .then(function (friends) {
    res.json(friends);
    res.status(200).end();
  })
  .catch(function (err) {
    console.log(err);
    res.status(500).end();
  });
}

module.exports = userController;
