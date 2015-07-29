var https = require('https');
var qs = require('querystring');

var Q = require('q');
var _ = require('lodash');

var helpers = require('./helpers.js');
var foursquareUtils = require('./foursquareUtils');

var User = require('../api/users/userModel.js');

var utils = {};

//FACEBOOK HELPER METHODS

utils.exchangeFBAccessToken = function (fbToken) {
  var deferred = Q.defer();

  var query = {
    grant_type: 'fb_exchange_token',
    client_id: process.env.WADDLE_FACEBOOK_APP_ID,
    client_secret: process.env.WADDLE_FACEBOOK_APP_SECRET,
    fb_exchange_token: fbToken
  };

  var queryPath = 'https://graph.facebook.com/oauth/access_token?' + qs.stringify(query);

  helpers.httpsGet(queryPath)
  .then(function (data) {
    deferred.resolve(qs.parse(data));
  })
  .catch(function (e) {
    deferred.reject(e);
  });
  return deferred.promise;
};

utils.getFBProfilePicture = function (userID) {
  var deferred = Q.defer();

  var queryPath = 'https://graph.facebook.com/' + userID + '/picture?redirect=false&type=large';

  helpers.httpsGet(queryPath)
    .then(function (data) {
      deferred.resolve(JSON.parse(data));
    })
    .catch(function (e) {
      deferred.reject(e);
    });

  return deferred.promise;
}

utils.getFBFriends = function (user) {
  var deferred = Q.defer();

  var fbID = user.getProperty('facebookID');
  var fbToken = user.getProperty('fbToken');
  
  var query = {
    access_token: fbToken
  };

  var queryPath = 'https://graph.facebook.com/'+fbID+'/friends?' + qs.stringify(query);

  helpers.httpsGet(queryPath)
    .then(function (data) {
      deferred.resolve(JSON.parse(data));
    })
    .catch(function (e) {
      deferred.reject(e);
    });

  return deferred.promise;
};

utils.publishToFeed = function (user, linkObject) {
  var deferred = Q.defer();

  var fbID = user.getProperty('facebookID');
  var fbToken = user.getProperty('fbToken');

  var body = {
    access_token: fbToken,
    link: linkObject.link,
    picture: linkObject.picture,
    name: linkObject.name,
    caption: linkObject.caption
  };

  var queryPath = 'https://graph.facebook.com/' + fbID + '/feed?';

  helpers.httpsPost(queryPath, body)
  .then(function (data) {
    console.log(data);
    deferred.resolve(JSON.parse(data));
  })
  .catch(function (err) {
    deferred.reject(err);
  });
};

utils.getFBTaggedPosts = function (user) {
  var deferred = Q.defer();

  var fbID = user.getProperty('facebookID');
  var fbToken = user.getProperty('fbToken');

  var query = {
    access_token: fbToken
  };

  var queryPath = 'https://graph.facebook.com/'+fbID+'/tagged?' + qs.stringify(query);

  var taggedPostsContainer = [];

  deferred.resolve(utils.makeFBPaginatedRequest(queryPath, taggedPostsContainer));

  return deferred.promise;
};

utils.makeFBPaginatedRequest = function (queryPath, container) {
  var deferred = Q.defer();

  helpers.httpsGet(queryPath)
    .then(function (data) {
      var dataObj = JSON.parse(data);

      container.push(dataObj.data)
      console.log("makeFBPaginatedRequest container: " + JSON.stringify(container));

      if (!dataObj.paging) {
        console.log('no paging for this parameter');
        deferred.resolve(_.flatten(container, true));
      } else if (!dataObj.paging.next) {
        console.log('no more results!');
        deferred.resolve(_.flatten(container, true));
      } else {
        deferred.resolve(utils.makeFBPaginatedRequest(dataObj.paging.next, container));
      }
    })
    .catch(function (e) {
      deferred.reject(e);
    });

  return deferred.promise;
}

utils.getFBPhotos = function (user) {
  var deferred = Q.defer();

  var fbID = user.getProperty('facebookID');
  var fbToken = user.getProperty('fbToken');

  var query = {
    access_token: fbToken
  };

  var queryPath = 'https://graph.facebook.com/'+fbID+'/photos?' + qs.stringify(query);

  var photoContainer = [];

  deferred.resolve(utils.makeFBPaginatedRequest(queryPath, photoContainer));

  return deferred.promise;
};

utils.getFBStatuses = function (user) {
  var deferred = Q.defer();

  var fbID = user.getProperty('facebookID');
  var fbToken = user.getProperty('fbToken');

  var query = {
    access_token: fbToken
  };

  var queryPath = 'https://graph.facebook.com/'+fbID+'/statuses?' + qs.stringify(query);

  var statusContainer = [];

  deferred.resolve(utils.makeFBPaginatedRequest(queryPath, statusContainer));

  return deferred.promise;
};

utils.getFBFeedItemsWithLocation = function(user) {
  var deferred = Q.defer();

  var fbID = user.getProperty('facebookID');
  var fbToken = user.getProperty('fbToken');

  var query = {
    access_token: fbToken,
    'with': 'location'
  }

  var queryPath = 'https://graph.facebook.com/'+fbID+'/feed?' + qs.stringify(query);

  console.log(queryPath);

  var feedItemContainer = [];

  deferred.resolve(utils.makeFBPaginatedRequest(queryPath, feedItemContainer));

  return deferred.promise;
}

utils.handleUpdateObject = function (update) {
  console.log("update: " + JSON.stringify(update));
  var deferred = Q.defer();

  var fbUserID = {facebookID: update.uid};
  var fbPostCreatedTime = update.time - 1;
  var user;

  User.find(fbUserID)
    .then(function (userNode) {
      user = userNode;
      return utils.makeRequestForFeedItem(user, fbPostCreatedTime);
    })
    .then(function (fbResponse) {
      var feedItems = fbResponse.data;
      return utils.parseFBData(user, feedItems);
    })
    .then(function (parsedCheckins) {
      return helpers.addCityCountryAndProvinceInfoToParsedCheckins(parsedCheckins);
    })
    .then(function (parsedCheckinsWithLocation) {
      deferred.resolve({
        user: user,
        checkins: parsedCheckinsWithLocation
      });
    })
    .catch(function (e) {
      deferred.reject(e);
    });

  return deferred.promise;
};

utils.makeRequestForFeedItem = function (user, postCreatedTime) {
  var deferred = Q.defer();

  var fbID = user.getProperty('facebookID');
  var fbToken = user.getProperty('fbToken');

  var query = {
    access_token: fbToken,
    since: postCreatedTime,
    'with': 'location'
  };

  var queryPath = 'https://graph.facebook.com/'+fbID+'/feed?' + qs.stringify(query);

  helpers.httpsGet(queryPath)
    .then(function (data) {
      console.log("feed data: ", data);
      deferred.resolve(JSON.parse(data));
    })
    .catch(function (e) {
      deferred.reject(e);
    });

  return deferred.promise;
};

utils.parseFBData = function (user, data) {
  var deferred = Q.defer();

  var parsedData = [];
  var foursquareVenueQueries = [];

  _.each(data, function (datum) {
    if (datum !== undefined && datum.place) {
      var place = {
        'checkinID': datum.id,
        'name': datum.place.name,
        'lat': datum.place.location.latitude,
        'lng': datum.place.location.longitude,
        'checkinTime': new Date(datum.created_time),
        'likes': 'null',
        'photoSmall': 'null',
        'photoLarge': 'null',
        'caption': 'null',
        'foursquareID': 'null',
        'city': 'null',
        'province': 'null',
        'country': 'null',
        'category': 'null',
        'pointValue': 3,
        'source': 'facebook'
      }

      if (datum.likes) {
        place.likes = datum.likes.data.length;
      }

       if (datum.updated_time) {
        place.checkinTime = new Date(datum.updated_time);
      }

      if(datum.name) {
        place.caption = datum.name;
        place.pointValue += 3;
      }

      if (datum.picture) {
        place.photoSmall = datum.picture;
        place.pointValue += 3;
      }

      if (datum.source) {
        place.photoLarge = datum.source;
        if(place.photoSmall === 'null') {
          place.pointValue += 3;
        }
      }

      var latlng = place.lat.toString() + ',' + place.lng.toString();
      
      parsedData.push(place);
      console.log(user, place.name, latlng);
      foursquareVenueQueries.push(foursquareUtils.generateFoursquarePlaceIDAndCategory(user, place.name, latlng));
    }
  });

  Q.all(foursquareVenueQueries)
    .then(function (foursquareVenueIDs) {
      _.each(parsedData, function (datum, index) {
        datum.foursquareID = foursquareVenueIDs[index]["foursquareID"]
        if(foursquareVenueIDs[index]["category"]) {
          datum.category = foursquareVenueIDs[index]["category"];
        }
      });
      console.log("parsedData: ", parsedData)
      deferred.resolve(parsedData);
    })
    .catch(function (err) {
      deferred.reject(err);
    });

  return deferred.promise;
};

module.exports = utils;
