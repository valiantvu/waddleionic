var https = require('https');
var qs = require('querystring');

var Q = require('q');
var _ = require('lodash');

var uuid = require('node-uuid');

var helpers = require('./helpers.js');

var User = require('../api/users/userModel.js');

var utils = {};

//FOURSQUARE HELPER METHODS

utils.exchangeFoursquareUserCodeForToken = function (fsqCode, redirect_uri) {
  var deferred = Q.defer();

  var query = {
    client_id: process.env.WADDLE_FOURSQUARE_CLIENT_ID,
    client_secret: process.env.WADDLE_FOURSQUARE_CLIENT_SECRET,
    grant_type: 'authorization_code'
  };



  var queryPath = 'https://foursquare.com/oauth2/access_token?' + qs.stringify(query);
  var appendedQueryPath = queryPath + '&redirect_uri=' + redirect_uri + '&code=' + fsqCode;

  console.log('foursquare token query:  ', queryPath);
  console.log('appendedQueryPath:  ', appendedQueryPath);

  helpers.httpsGet(appendedQueryPath)
    .then(function (data) {
      deferred.resolve(JSON.parse(data));
    })
    .catch(function (e) {
      deferred.reject(e);
    });
  
  return deferred.promise; 
};

utils.getUserFoursquareIDFromToken = function (user) {

  var deferred = Q.defer();

  var fsqAccessToken = user.getProperty('fsqToken');
  var query = {
    v: '20140806',
    oauth_token: fsqAccessToken
  }
  var queryPath = 'https://api.foursquare.com/v2/users/self?' + qs.stringify(query);

  helpers.httpsGet(queryPath)
    .then(function (data) {
      deferred.resolve(JSON.parse(data));
    })
    .catch(function (e) {
      deferred.reject(e);
    });

  return deferred.promise;
};


utils.tabThroughFoursquareCheckinHistory = function (user) {
  var deferred = Q.defer();

  var fsqAccessToken = user.getProperty('fsqToken');

  var offset = 0;

  utils.getFoursquareCheckinHistory(fsqAccessToken, offset)
  .then(function(checkinHistory) {

    var checkinCount = checkinHistory.response.checkins.count;
    var historyBucketContainer = [Q(checkinHistory)];
    offset += 250;

    while(offset < checkinCount) {
      historyBucketContainer.push(utils.getFoursquareCheckinHistory(fsqAccessToken, offset));
      offset += 250;  
    }

    console.log("hist bucket container", historyBucketContainer.length)

    deferred.resolve(Q.all(historyBucketContainer));
  });

  return deferred.promise;
};

utils.getVenueInfo = function (venueID, user) {
  var deferred = Q.defer();

  var query = {
    v: '20150409'
  };

  var oauthToken = user.getProperty('fsqToken');

  if (oauthToken) {
    query.oauth_token = oauthToken;
  } else {
    query.client_id = process.env.WADDLE_FOURSQUARE_CLIENT_ID;
    query.client_secret = process.env.WADDLE_FOURSQUARE_CLIENT_SECRET;
  }

  var queryPath = 'https://api.foursquare.com/v2/venues/' + venueID + '?&' + qs.stringify(query);
  console.log(queryPath);

  helpers.httpsGet(queryPath)
  .then(function (data) {
    var venue = JSON.parse(data).response;
    deferred.resolve(venue);
  })
  .catch(function (e) {
    deferred.reject(e);
  });

  return deferred.promise;
}

utils.getFoursquareCheckinHistory = function (userAccessToken, offset) {
  var deferred = Q.defer();

  var query = {
    v: '20141122',
    limit: '250',
    offset: offset.toString(),
    oauth_token: userAccessToken
  };

  var queryPath = 'https://api.foursquare.com/v2/users/self/checkins?' + qs.stringify(query);

  helpers.httpsGet(queryPath)
    .then(function (data) {
      deferred.resolve(JSON.parse(data));
    })
    .catch(function (e) {
      deferred.reject(e);
    });

  return deferred.promise;
};

utils.convertFoursquareHistoryToSingleArrayOfCheckins = function (foursquareCheckinHistoryBucketContainer) {
  var allCheckins =  _.map(foursquareCheckinHistoryBucketContainer, function(checkinBucket) {
    return checkinBucket.response.checkins.items;
  });
  
  return _.flatten(allCheckins, true);
};

utils.parseFoursquareCheckins = function(foursquareCheckinArray) {
  return _.map(foursquareCheckinArray, function(checkin) {
    return utils.parseCheckin(checkin);
  });
};

utils.parseNativeCheckin = function (venue) {
  var deferred = Q.defer();

  var formattedCheckin = {
    'checkinID': uuid.v4(),
    'name': venue.name,
    'lat': venue.lat,
    'lng': venue.lng,
    'checkinTime': new Date(),
    'foursquareID': venue.id,
    'likes': 'null',
    'photoSmall': 'null',
    'photoLarge': 'null',
    'photo': 'null',
    'caption': 'null',
    'address': 'null',
    'city': 'null',
    'province': 'null',
    'country': 'null',
    'postalCode': 'null',
    'category': 'null',
    'pointValue': 5,
    'rating': 0,
    'source': 'waddle'
  };

  if (venue.categories) {
    formattedCheckin.category = venue.categories;
  }

  if (venue.address) {
    formattedCheckin.address = venue.address;
  }

  if (venue.postalCode) {
    formattedCheckin.postalCode = venue.postalCode;
  }

  if (venue.footprintCaption) {
    formattedCheckin.caption = venue.footprintCaption;
    formattedCheckin.pointValue += 3;
  }

  if (venue.rating > 0) {
    formattedCheckin.rating = venue.rating;
    formattedCheckin.pointValue += 3;
  }

  //TODO: figure out how to generate different size images from AWS url

  if (venue.photo) {
    formattedCheckin.photoLarge = venue.photo + '/full';
    formattedCheckin.photoSmall = venue.photo + '/thumb';
    formattedCheckin.photo = venue.photo;
    formattedCheckin.pointValue += 3;
  }


  helpers.findCityProvinceAndCountry(formattedCheckin.lat, formattedCheckin.lng)
  .then(function (geocodeData) {
    console.log(geocodeData);
      if(geocodeData.city) {
        formattedCheckin.city = geocodeData.city;
      }
      if(geocodeData.province) {
        formattedCheckin.province = geocodeData.province;
      }
      if(geocodeData.country) {
        formattedCheckin.country = geocodeData.country;
      }
    deferred.resolve(formattedCheckin);
  })
  return deferred.promise;
}

utils.parseCheckin = function (checkin) {
  // var deferred = Q.defer();

  var formattedCheckin = {
    'checkinID': checkin.id,
    'name': checkin.venue.name,
    'lat': checkin.venue.location.lat,
    'lng': checkin.venue.location.lng,
    'foursquareID': checkin.venue.id,
    'checkinTime': new Date(checkin.createdAt*1000),
    'likes': 'null',
    'photoSmall': 'null',
    'photoLarge': 'null',
    'photo': 'null',
    'caption': 'null',
    'address': 'null',
    'city': 'null',
    'province': 'null',
    'country': checkin.venue.location.country,
    'postalCode': 'null',
    'category': 'null',
    'pointValue': 3,
    'source': 'foursquare'
  };

  if (checkin.venue.categories[0]) {
    formattedCheckin.category = checkin.venue.categories[0].name;
  }

  if (checkin.venue.location.address) {
    formattedCheckin.address = checkin.venue.location.address;
  }

  if (checkin.venue.location.postalCode) {
    formattedCheckin.postalCode = checkin.venue.location.postalCode;
  }

  if (checkin.photos && checkin.photos.count > 0) {
    formattedCheckin.photoSmall = checkin.photos.items[0].prefix + 'cap300' + checkin.photos.items[0].suffix;
    formattedCheckin.photoLarge = checkin.photos.items[0].prefix + 'original' + checkin.photos.items[0].suffix;
    formattedCheckin.pointValue += 3;
  }
  if (checkin.shout) {
    formattedCheckin.caption = checkin.shout;
    formattedCheckin.pointValue += 3;
  }

  // helpers.findCityProvinceAndCountry(formattedCheckin.lat, formattedCheckin.lng)
  // .then(function (geocodeData) {
  //     if(geocodeData.city) {
  //       formattedCheckin.city = geocodeData.city;
  //     }
  //     if(geocodeData.province) {
  //       formattedCheckin.province = geocodeData.province;
  //     }
  //     if(geocodeData.country) {
  //       formattedCheckin.country = geocodeData.country;
  //     }
    // deferred.resolve(formattedCheckin);
    return formattedCheckin;
  // })
  // return deferred.promise;
};

utils.searchFoursquareVenuesWeb = function (user, near, query) {
  var deferred = Q.defer();

  var query = {
    v: '20150512',
    near: near,
    query: query,
    intent: 'checkin'
  };

  var oauthToken = user.getProperty('fsqToken');

  if (oauthToken) {
    query.oauth_token = oauthToken;
  } else {
    query.client_id = process.env.WADDLE_FOURSQUARE_CLIENT_ID;
    query.client_secret = process.env.WADDLE_FOURSQUARE_CLIENT_SECRET;
  }

  var queryPath = 'https://api.foursquare.com/v2/venues/search?' + qs.stringify(query);
  console.log(queryPath);

  helpers.httpsGet(queryPath)
  .then(function (data) {
    var venues = JSON.parse(data).response.venues;
    deferred.resolve(venues);
  })
  .catch(function (e) {
    deferred.reject(e);
  });

  return deferred.promise;
}

utils.searchFoursquareVenuesMobile = function (user, latlng) {
  var deferred = Q.defer();

  var query = {
    v: '20150512',
    ll: latlng,
    intent: 'checkin'
  };

  var oauthToken = user.getProperty('fsqToken');

  if (oauthToken) {
    query.oauth_token = oauthToken;
  } else {
    query.client_id = process.env.WADDLE_FOURSQUARE_CLIENT_ID;
    query.client_secret = process.env.WADDLE_FOURSQUARE_CLIENT_SECRET;
  }

  var queryPath = 'https://api.foursquare.com/v2/venues/search?' + qs.stringify(query);

  helpers.httpsGet(queryPath)
  .then(function (data) {
    var venues = JSON.parse(data).response.venues;
    deferred.resolve(venues);
  })
  .catch(function (e) {
    deferred.reject(e);
  });

  return deferred.promise;
}

utils.searchFoursquareVenuesBySearchQueryAndGeolocation = function (user, latlng, query) {
  var deferred = Q.defer();

  var query = {
    v: '20150801',
    ll: latlng,
    query: query,
    intent: 'checkin'
  };

  var oauthToken = user.getProperty('fsqToken');

  if (oauthToken) {
    query.oauth_token = oauthToken;
  } else {
    query.client_id = process.env.WADDLE_FOURSQUARE_CLIENT_ID;
    query.client_secret = process.env.WADDLE_FOURSQUARE_CLIENT_SECRET;
  }

  var queryPath = 'https://api.foursquare.com/v2/venues/search?' + qs.stringify(query);

  helpers.httpsGet(queryPath)
  .then(function (data) {
    var venues = JSON.parse(data).response.venues;
    deferred.resolve(venues);
  })
  .catch(function (e) {
    deferred.reject(e);
  });
  return deferred.promise;
}

utils.generateFoursquarePlaceIDAndCategory = function (user, name, latlng) {
  var deferred = Q.defer();

  var query = {
    v: '20140806',
    limit: '1',
    ll: latlng,
    query: name
  };

  var oauthToken = user.getProperty('fsqToken');

  if (oauthToken) {
    query.oauth_token = oauthToken;
  } else {
    query.client_id = process.env.WADDLE_FOURSQUARE_CLIENT_ID;
    query.client_secret = process.env.WADDLE_FOURSQUARE_CLIENT_SECRET;
  }

  var queryPath = 'https://api.foursquare.com/v2/venues/search?' + qs.stringify(query);

  helpers.httpsGet(queryPath)
    .then(function (data) {
      var venue = JSON.parse(data).response.venues[0];
      if (venue) {
        if(venue.categories[0]) {
          deferred.resolve({foursquareID: venue.id, category: venue.categories[0].name});
        }
        else {
          deferred.resolve({foursquareID: venue.id});
        }
      } else {
        deferred.resolve({foursquareID: name});
      }
    })
    .catch(function (e) {
      deferred.reject(e);
    });


  return deferred.promise;
};

module.exports = utils;
