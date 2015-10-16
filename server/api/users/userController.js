var _ = require('lodash');
var Q = require('q');

var foursquareUtils = require('../../utils/foursquareUtils.js');
var facebookUtils = require('../../utils/facebookUtils.js');
var instagramUtils = require('../../utils/instagramUtils.js');
var helpers = require('../../utils/helpers.js');

var neo4jUser = require('../neo4j/userModel.js');
var mongoUser = require('../mongo/userModel.js');
var Place = require('../neo4j/placeModel.js');
var Checkin = require('../neo4j/checkinModel.js');

var userController = {};

userController.userLogin = function (req, res) {

  var userData = req.body;
  var FBAccessToken;
  var userFBTaggedPostsData = [];
  var userFBPhotoData = [];
  var userFBStatusesData = [];
  var userFBFriendsData;
  var combinedFBCheckins;
  console.log(userData);

  facebookUtils.exchangeFBAccessToken(userData.fbToken)
  // Store access token on scope, Get profile pictures from Facebook
  .then(function (fbReqData) {
    // console.log(fbReqData);
    if (fbReqData.access_token) {
      FBAccessToken = fbReqData.access_token;
      return facebookUtils.getFBProfilePicture(userData.facebookID);
    } else {
      res.status(500).send('FB Access Token not found :/');
    }
  })
  .then(function (fbPicData) {
    var properties = {
      'fbToken': FBAccessToken,
    };
    // Asks if facebook profile picture is a default silhouette
    if(fbPicData.data.is_silhouette === false) {
      properties['fbProfilePicture'] = fbPicData.data.url;
    } else {
      properties['fbProfilePicture'] = 'https://s3-us-west-2.amazonaws.com/waddle/logo+assets/WaddlePenguinLogo181.png';
    }
    // lodash's .extend has been renamed to .assign
    _.assign(userData, properties);

    // Start creation of new user or update and retrieval of existing user
    mongoUser.createUser(userData)
    .then(function (dbData) {
      // console.log(dbData.result);
      var alreadyExists = dbData.result.nModified === 1 ? true : false;
      mongoUser.findUser(userData);
      if (alreadyExists) {
        // Update number of footprints
        // TODO: Decrement count on delete, remove this count
        // mongoUser.updateCheckinsCount(userData);
        res.json({user: userData, alreadyExists: alreadyExists});
        res.status(200).end();
      } else {
        var properties = {
          footprintsCount: 0,
          friends: [],
          checkins: [],
          ratedPlaces: [],
          notifications: [],
          folders: [],
          feed: [],
        };

        mongoUser.setProperty(userData, properties);
        mongoUser.setCreatedAt(userData);
        
        facebookUtils.getFBFriends(userData.facebookID, FBAccessToken)
        .then(function (fbRawUserData) {
          mongoUser.addFriends(userData, fbRawUserData.data);
          res.json({user: userData, alreadyExists: alreadyExists, result: dbData.result});
          res.status(200).end();
        });
      }
    })
    .catch(function(err) {
      console.log(err);
      res.status(500).send(err);
    });

    //note: this has the user node
    //console.dir(userNode.node._data.data)
    neo4jUser.createUniqueUser(userData)
    .then(function (userNode) {
      console.log('neo4j user node created/found!');
      var alreadyExists = userNode.getProperty('footprintsCount') >= 0;

      if (alreadyExists) {
        // Update number of footprints
        // TODO: Decrement count on delete, remove this count
        userNode.setProperty('footprintsCount', userNode.countAllCheckins(userData.facebookID));
      } else {
        userNode.setProperty('footprintsCount', 0);

        facebookUtils.getFBFriends(userData.facebookID, FBAccessToken)
        .then(function (friends) {
          userNode.addFriends(fbRawUserData.data);
          // res.status(200).end();
        });
      }
    })
    .catch(function(err) {
      console.log(err);
      res.status(500).send(err);
    });
  })
  .catch(function(err) {
    console.log(err);
    res.status(500).send(err);
  });
};

userController.addFoursquareData = function (req, res) {

  var userData = req.body;
  var user;

  //if client is ios app, then fousquareCode that is returned is actually the access token
  if(userData.build_type === 'ios') {
    console.log('inside ios client');
    addFoursquareDataFromIOSClient(userData);
  }

  else {

    neo4jUser.find(userData)
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
      console.log('foursquare response data');
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
    });
  }
};

var addFoursquareDataFromIOSClient = function (userData) {
  neo4jUser.find(userData)
  .then(function (userNode) {
    user = userNode;
    return user.setProperty('fsqToken', userData.foursquareCode);
  })
  .then(function (userNode) {
    user = userNode;
    return foursquareUtils.getUserFoursquareIDFromToken(user);
  })
  .then(function (userFoursquareData) {
    console.log('foursquare response data');
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
  });
};

userController.addInstagramData = function (req, res) {

  var userData = req.body;
  var user;
  var igUserData;

  neo4jUser.find(userData)
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
    user = userNode;
    return instagramUtils.tabThroughInstagramPosts(user);
  })
  .then(function (rawInstagramPosts) {
    // console.log('rawInstagramPosts', JSON.stringify(rawInstagramPosts));
    return instagramUtils.parseIGData(rawInstagramPosts, user);
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
  });

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

  neo4jUser.find(userData)
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

  neo4jUser.find(params)
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
  neo4jUser.find(req.body)
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
  });
};

userController.getUnreadNotifications = function (req, res) {
  var user;
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

  neo4jUser.find(params)
  .then(function (userNode) {
    user = userNode;
    return user.getUnreadNotifications(params.page, params.skipAmount);
  })
  .then(function (notifications) {
    res.json(_.flatten(notifications));
    res.status(200).end();
  })
  .catch(function (err) {
    console.log(err);
    res.status(500).end();
  });
};

userController.getReadNotifications = function (req, res) {
  var user;
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
  
  neo4jUser.find(params)
  .then(function (userNode) {
    user = userNode;
    return user.getReadNotifications(params.page, params.skipAmount);
  })
  .then(function (notifications) {
    res.json(notifications);
    res.status(200).end();
  })
  .catch(function (err) {
    console.log(err);
    res.status(500).end();
  });
  
};

userController.getUserInfo = function (req, res) {
  var params = {};
  params.facebookID = req.params.user;

  // mongoUser.findUser(userData)
  // .then(function (user) {
  //   res.json(user);
  //   res.status(200).end();
  // })
  // .catch(function (err) {
  //   console.log(err);
  //   res.status(500).end();
  // });

  neo4jUser.find(params)
   .then(function (userInfo) {
    // console.log('userInfo' + JSON.stringify(userInfo.node._data.data));
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

  neo4jUser.getBucketList(params.facebookID, params.page, params.skipAmount)
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
  var user, folderName;
  user = req.body.facebookID;
  folderName = req.body.folderName,
  console.log(req.body);

  neo4jUser.addFolder(user, folderName)
  .then(function (folder) {
    console.log(folder);
    res.json(folder);
    res.status(200).end();
  })
  .catch(function (err){
    console.log(err);
    res.status(500).end();
  });
};

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

  neo4jUser.fetchFolders(params.facebookID, params.page, params.skipAmount)
  .then(function (folders) {
    console.log(folders)
    res.json(folders);
    res.status(200).end();
  })
  .catch(function(err) {
    console.log(err)
    res.status(500).end();
  });
};

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

  neo4jUser.searchFoldersByName(params.facebookID, params.query, params.page, params.skipAmount)
  .then(function (folders) {
    console.log(folders)
    res.json(folders);
    res.status(200).end();
  })
  .catch(function(err) {
    console.log(err)
    res.status(500).end();
  });
};

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
  if(params.folderName === "Suggested By Friends") {
    console.log("DESE BITCHES HV BEEN SUGGESTED BY MA FRENDZ!!");
    neo4jUser.fetchSuggestedByFriendsContents(params.facebookID, params.page, params.skipAmount)
    .then(function (SBFcontents) {
      console.log(SBFcontents);
      res.json(SBFcontents);
      res.status(200).end();
    })
    .catch(function (err) {
      console.log(err);
      res.status(500).end();
    });
  } else {
    neo4jUser.fetchFolderContents(params.facebookID, params.folderName, params.page, params.skipAmount)
    .then(function (folderContents) {
      res.json(folderContents);
      res.status(200).end();
    })
    .catch(function (err) {
      console.log(err);
      res.status(500).end();
    });
  }
};

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

  neo4jUser.searchFolderContents(params.facebookID, params.folderName, params.query, params.page, params.skipAmount)
  .then(function (folderContents) {
    console.log(folderContents);
    res.json(folderContents);
    res.status(200).end();
  })
  .catch(function(err) {
    console.log(err);
    res.status(500).end();
  });
};

userController.deleteFolderAndContents = function (req, res) {
  console.log('Deleting: ', req.body.folderName);
  var facebookID = req.body.facebookID;
  var folderName = req.body.folderName;

  neo4jUser.deleteFolderAndContents(facebookID, folderName)
  .then(function (data) {
    res.json({success: "Folder and contents succesfully deleted"});
    res.status(201).end();
  })
  .catch(function (data) {
    console.log(err);
    res.status(500).end();
  });

};

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
  neo4jUser.findFootprintsByPlaceName(facebookID, query, params.page, params.skipAmount)
  .then(function (footprints) {
    res.json(footprints);
    res.status(200).end();
  })
  .catch(function(err) {
    console.log(err);
    res.status(500).end();
  });
};

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
  neo4jUser.findFeedItemsByPlaceName(facebookID, query, params.page, params.skipAmount)
  .then(function (footprints) {
    res.json(footprints);
    res.status(200).end();
  })
  .catch(function(err) {
    console.log(err);
    res.status(500).end();
  });
};

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

  neo4jUser.find(params)
  .then(function(userNode) {
    user = userNode;
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
};

userController.searchFriendsList = function (req, res) {
  var params = {};
  params.user = req.params.user;
  params.query = req.params.query;
  params.page = parseInt(req.params.page);
  params.skip = parseInt(req.params.skip);

  neo4jUser.searchFriends(params.user, params.query, params.page, params.skip)
  .then(function (friends) {
    res.json(friends);
    res.status(200).end();
  })
  .catch(function (err) {
    console.log(err);
    res.status(500).end();
  });
};

userController.publishFacebookPost = function (req, res) {
  var user;
  var linkObject = req.body.link;
  var facebookID = req.body.facebookID;

  neo4jUser.find({facebookID: facebookID})
  .then(function (userNode) {
    user = userNode;
    return facebookUtils.publishToFeed(user, linkObject);
  })
  .then( function (data) {
    console.log(data);
    res.status(204).end();
  })
  .catch(function (err) {
    console.log(err);
    res.status(500).end();
  });
};

module.exports = userController;
