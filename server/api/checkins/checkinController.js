var Q = require('q');
var _ = require('lodash');
var aws = require('aws-sdk');
var uuid = require('node-uuid');

var neo4jCheckin = require('../neo4j/checkinModel.js');
var neo4jUser = require('../neo4j/userModel.js');
var neo4jPlace = require('../neo4j/placeModel.js');
var mongoCheckin = require('../mongo/checkinModel.js');
var mongoPlace= require('../mongo/placeModel.js');
var mongoUser = require('../mongo/userModel.js');

var factualUtils = require('../../utils/factualUtils.js');
var foursquareUtils = require('../../utils/foursquareUtils.js');
var instagramUtils = require('../../utils/instagramUtils.js');
var facebookUtils = require('../../utils/facebookUtils.js');
var helpers = require('../../utils/helpers.js');
var categoryList = require('../../utils/categoryList.js');

var checkinController = {};


checkinController.handleNativeCheckin = function (req, res) {
  var user, place, foursquareID;
  var nativeCheckin = helpers.addMetaDataToNativeCheckin(req.body);
  var checkinID = nativeCheckin.checkinID;
  var factual_id = nativeCheckin.factualVenueData.factual_id;
  var facebookID = req.body.facebookID;
  var categories = _.flatten(nativeCheckin.factualVenueData.category_labels);
  console.log(categories);
  var apiSource = categories.indexOf('Restaurants') > 0 ? 'restaurants' : 'places';
  apiSource = categories.indexOf('Hotels') > 0 ? 'hotels' : apiSource;

  mongoCheckin.createCheckin(nativeCheckin)
  .then(function (checkin) {
    // console.log('this is my checkin', checkin.result);
    // var checkinSuccess = checkin.result.nModified === 1 ? true : false;
    // console.log('new checkin: ', checkin);
    var checkinSuccess = true;
    if(checkinSuccess) {
      return factualUtils.getRestaurantInfo(factual_id);
    }
  })
  .then(function (restaurantInfo) {
    if(restaurantInfo.length) {
      nativeCheckin.factualVenueData = restaurantInfo[0];
    }
    nativeCheckin.factualVenueData.apiSource = apiSource;
    console.log('apiSource: ', nativeCheckin.factualVenueData.apiSource);
    return mongoPlace.createOrUpdatePlace(nativeCheckin.factualVenueData);
  })
  .then(function (place) {
    addCheckinToFeedsAndRatedPlaces();
    // var placeUpdateSuccess = place.result.nModified === 1 ? true : false;
    // if(placeUpdateSuccess) {
      // console.log('placeSuccess', placeUpdateSuccess)
      return mongoPlace.findPlace(factual_id);
    // }
  })
  .then(function (placeDocument) {
    if(!placeDocument.foursquareID || !placeDocument.foursquareCategories) {
      return factualUtils.getFoursquareIDFromFactualID(factual_id);
    } else {
      res.status(201).end();
    }
  })
  .then(function (foursquareVenueID) {
    // console.log('foursquareID', foursquareVenueID);
    foursquareID = foursquareVenueID;
    return mongoPlace.setPropertyOnPlaceDocument(factual_id, 'foursquareID', foursquareID);
  })
  .then(function (place) {
    // console.log(place);
    return foursquareUtils.getVenueInfo(foursquareID);
  })
  .then(function (foursquareVenueInfo) {
    // console.log(foursquareVenueInfo);
    return mongoPlace.setPropertyOnPlaceDocument(factual_id, 'foursquareCategories', foursquareVenueInfo.venue.categories);
  })
  .then(function (place) {
    // var placeUpdateSuccess = place.result.nModified === 1 ? true : false;
    // if(placeUpdateSuccess) {
    res.json({checkinID: checkinID});
    res.status(200).end();
    // }
  })
  .catch(function (err) {
    console.log(err);
    res.status(500).end();
  });

  var addCheckinToFeedsAndRatedPlaces = function() {
    console.log('adding checkin to user and friends feeds');
    mongoUser.findFriends(facebookID)
    .then(function (friends) {
      // console.log('these are also my friends', friends);
      //push user's own facebookID into friends array so that user's own feed is also updated
      friends.friends.push(facebookID);
      // console.log('me and my frands: ', friends.friends);
      mongoUser.buildFeed(friends.friends, nativeCheckin)
      .catch(function(err) {
        console.log(err);
      });
      mongoUser.buildRatedPlaces(friends.friends, nativeCheckin)
      .catch(function(err) {
        console.log(err);
      });
    });
  };



  // parsedCheckinForNeo4j = helpers.parseNativeCheckinForNeo4j(nativeCheckin);
  // console.log('parsedCheckin: ' + JSON.stringify(parsedCheckinForNeo4j));
  // neo4jUser.find({facebookID: facebookID})
  // .then(function (userNode) {
  //   user = userNode;
  //   return user.addCheckins([parsedCheckinForNeo4j]);
  // })
  // .then(function (footprint) {
  //   console.log(footprint);
  //   newFootprint = footprint
  //   if(nativeCheckin.folderName) {
  //     addNativeCheckinToFolder();
  //   }
  //   else {
  //     res.json(newFootprint);
  //     if(!footprint.place.foursquareID) {
  //       // console.log('hi');
  //       getFoursquareIDFromFactualID(newFootprint.place.factualID, user);
  //     }
  //     // getFactualRestaurantInfo(newFootprint.place.factualID);
  //     res.status(201).end();
  //   }
  // })
  // // .then(function (categoryData) {
  // //   categories = categoryData[0].body.data[0];
  // //   console.log('these are the categories: ', categories);
  // //   user.assignExpertiseToCategory(categories);
  // // })
  // .catch(function (err) {
  //   console.log(err);
  //   res.status(500).end();
  // });

  // var addNativeCheckinToFolder = function() {
  //   var newFootprintWithFolder;
  //   neo4jCheckin.addToFolder(newFootprint.user.facebookID, newFootprint.checkin.checkinID, nativeCheckin.folderName)
  //   .then(function (data) {
  //     newFootprint.folders = {name: nativeCheckin.folderName};
  //     newFootprintWithFolder = newFootprint;
  //     if(!newFootprint.place.foursquareID) {
  //       helpers.getFoursquareIDFromFactualID();
  //     } else {
  //       res.json(newFootprint);
  //       res.status(201).end();
  //     }
  //   })
  //   .catch(function(err) {
  //     console.log(err);
  //     res.status(500).end();
  //   });
  // };
};

checkinController.getFoursquareVenueInfo = function (req, res) {
  var user;
  var venueID = req.params.venueID;
  var facebookID = req.params.facebookID;

  neo4jUser.find({facebookID: facebookID})
  .then(function (userNode) {
    user = userNode;
    // return factualUtils.getFoursquareID(venueID);
    return foursquareUtils.getVenueInfo(venueID, user)
  })
  .then(function (venueInfo) {
    res.json(venueInfo);
    res.status(200).end()
  })
  .catch(function (err) {
    console.log(err);
    res.status(500).end();
  })
};

checkinController.getFactualVenueInfo = function (req, res) {
  var venueData;
  var venueID = req.params.venueID;

  factualUtils.getVenueInfo(venueID)
  .then(function (venueInfo) {
    venueData = venueInfo;
    return factualUtils.getMenu(venueID);
  })
  .then(function (menuData) {
    console.log('menu', menuData);
    if(menuData[0].url) {
      venueData[0].menu = menuData[0].url;
    };
    res.json(venueData[0]);
    res.status(200).end()
  })
  .catch(function (err) {
    console.log(err);
    res.status(500).end();
  })
};

var getFoursquareIDFromFactualID = function (factualID, user) {

  neo4jPlace.find(factualID)
  .then(function (placeNode) {
    place = placeNode;
    return factualUtils.getFoursquareIDFromFactualID(factualID)
  })
  .then(function (foursquareID) {
    place.setProperty('foursquareID', foursquareID);
    console.log('foursquareID', foursquareID);
    return foursquareUtils.getVenueInfo(foursquareID, user);
  })
  .then(function (foursquareVenueInfo) {
    console.log(JSON.stringify(foursquareVenueInfo.venue.categories));
    // getFactualRestaurantInfo(factualID);
  });
};

var getFactualRestaurantInfo = function (factualID) {
  var restaurantData, place;
  factualUtils.getRestaurantInfo(factualID)
  .then(function (restaurantInfo) {
    // console.log(restaurantInfo);
    if(!restaurantInfo.length) {
      console.log('returning')
      return;
    }
    restaurantData = restaurantInfo[0];
    return neo4jPlace.find(factualID);
  })
  .then(function (placeNode) {
    console.log('found place node');
    console.log('price', restaurantData['price']);
    place = placeNode;
    place.setProperty('price', restaurantData.price);
    return;
  })
}


checkinController.editNativeCheckin = function (req, res) {
  var editedCheckin = req.body;
  var facebookID = req.body.facebookID;
  var checkinID = req.body.checkinID;

  var parsedEditedCheckin = helpers.parseEditedNativeCheckin(req.body);

  neo4jCheckin.editNativeCheckin(parsedEditedCheckin)
  .then(function (data) {
    res.json(data);
    res.status(201).end();
  })
  .catch(function(err) {
    console.log(err);
    res.status(500).end();
  });
};

checkinController.searchFoursquareVenuesWeb = function (req, res) {
  var user, foursquareToken;
  var facebookID = req.params.facebookID;
  var near = req.params.near;
  var query = req.params.query;

  neo4jUser.find({facebookID: facebookID})
  .then(function (userNode) {
    user = userNode;
    return foursquareUtils.searchFoursquareVenuesWeb(user, near, query);
  })
  .then(function (venues) {
    console.log(JSON.stringify(venues[0]));
    _.each(venues, function(venue) {
      if(venue.location.distance) {
        //convert meters to miles, rounded to the nearest .1 mi;
        miles = Math.round((venue.location.distance * 0.00062137119) * 10) / 10;
        venue.location.distance = miles;
      }
      if(venue.categories[0] && venue.categories[0].name && categoryList.dictionary[venue.categories[0].name]) {
        venue.iconUrlPrefix = categoryList.dictionary[venue.categories[0].name].prefix;
        venue.iconUrlSuffix = categoryList.dictionary[venue.categories[0].name].suffix;
      }
      else {
        venue.iconUrlPrefix = 'https://s3-us-west-2.amazonaws.com/waddle/Badges/uncatagorized-1/uncategorized-';
        venue.iconUrlSuffix = '-2.svg';
      }
    })
    res.json(venues);
  })
  .catch(function (err){
    console.log(err);
    res.status(500).end();
  });
};


//this function is altered to page through the factual API results (as opposed to just serving the first 20 results)
//currently broken
checkinController.searchFactualVenuesByQueryAndNear = function (req, res) {
  console.log("hello", req.params);
  var near = req.params.near;
  var query = req.params.query;
  var offset = 50;
  var previousResults = 1;
  var page = 0;
  var venues = [];
  var venue;

  while(previousResults > 0) {
    console.log('previousResults', previousResults);
    offset *= page;
  factualUtils.searchVenuesByQueryAndNear(near, query, offset)
  .then(function (factualVenues) {
    previousResults = factualVenues.length;
    page++;
    // console.log(JSON.stringify(factualVenues[0]));
    _.each(factualVenues, function(factualVenue) {
      venue = {};
      venue.factualVenueData = factualVenue;
      venue.addendum = {};
      if(factualVenue.category_labels) {
        // console.log(JSON.stringify(factualVenue.category_labels));
        // factualVenue.iconUrlPrefix = categoryList.dictionary[factualVenue.categories[0].name].prefix;
        // factualVenue.iconUrlSuffix = categoryList.dictionary[factualVenue.categories[0].name].suffix;
        venue.addendum.iconUrlPrefix = 'https://s3-us-west-2.amazonaws.com/waddle/Badges/uncatagorized-1/uncategorized-';
        venue.addendum.iconUrlSuffix =  '-2.svg';
      }
      else {
        venue.addendum.iconUrlPrefix = 'https://s3-us-west-2.amazonaws.com/waddle/Badges/uncatagorized-1/uncategorized-';
        venue.addendum.iconUrlSuffix = '-2.svg';
      }
      venues.push(venue);
    })
    res.json(venues);
  })
  .catch(function (err){
    console.log(err);
    res.status(500).end();
  });

  }
}

checkinController.searchFactualVenuesByGeolocation = function (req, res) {
  var miles, venue
  var latlng = [req.params.lat, req.params.lng];
  var venues = [];

  factualUtils.searchVenuesByGeolocation(latlng)
  .then(function(factualVenues) {
    _.each(factualVenues, function(factualVenue) {
      venue = {};
      venue.factualVenueData = factualVenue;
      venue.addendum = {};
      if(factualVenue['$distance']) {
        //convert meters to miles, rounded to the nearest .1 mi;
        miles = Math.round((factualVenue['$distance'] * 0.00062137119) * 10) / 10;
        // factualVenue['$distance'] = miles;
        venue.addendum.location = {};
        venue.addendum.location.distance = miles;
      }
      if(factualVenue.category_labels) {
        // console.log(JSON.stringify(factualVenue.category_labels));
        // factualVenue.iconUrlPrefix = categoryList.dictionary[factualVenue.categories[0].name].prefix;
        // factualVenue.iconUrlSuffix = categoryList.dictionary[factualVenue.categories[0].name].suffix;
        venue.addendum.iconUrlPrefix = 'https://s3-us-west-2.amazonaws.com/waddle/Badges/uncatagorized-1/uncategorized-';
        venue.addendum.iconUrlSuffix = '-2.svg';
      }
      else {
        venue.addendum.iconUrlPrefix = 'https://s3-us-west-2.amazonaws.com/waddle/Badges/uncatagorized-1/uncategorized-';
        venue.addendum.iconUrlSuffix = '-2.svg';
      }
      venues.push(venue);
    });
    res.json(venues);
  })
  .catch(function (err){
    console.log(err);
    res.status(500).end();
  });
}

checkinController.searchFoursquareVenuesMobile = function (req, res) {
  var user, foursquareToken, miles;
  var facebookID = req.params.facebookID;
  var latlng = req.params.lat + ',' + req.params.lng;

  neo4jUser.find({facebookID: facebookID})
  .then(function (userNode) {
    user = userNode;
    return foursquareUtils.searchFoursquareVenuesMobile(user, latlng);
  })
  .then(function (venues) {
    _.each(venues, function(venue) {
      if(venue.location.distance) {
        //convert meters to miles, rounded to the nearest .1 mi;
        miles = Math.round((venue.location.distance * 0.00062137119) * 10) / 10;
        venue.location.distance = miles;
      }
      if(venue.categories[0] && venue.categories[0].name && categoryList.dictionary[venue.categories[0].name]) {
        venue.addendum.iconUrlPrefix = categoryList.dictionary[venue.categories[0].name].prefix;
        venue.addendum.iconUrlSuffix = categoryList.dictionary[venue.categories[0].name].suffix;
      }
      else {
        venue.addendum.iconUrlPrefix = 'https://s3-us-west-2.amazonaws.com/waddle/Badges/uncatagorized-1/uncategorized-';
        venue.addendum.iconUrlSuffix = '-2.svg';
      }
    })
    res.json(venues);
  })
  .catch(function (err){
    console.log(err);
    res.status(500).end();
  });
};

checkinController.searchFactualVenuesBySearchQueryAndGeolocation = function (req, res) {
  var miles, venue;
  var latlng = [req.params.lat, req.params.lng];
  var query = req.params.query;
  var venues = [];

  factualUtils.searchVenuesBySearchQueryAndGeolocation(latlng, query)
  .then(function (factualVenues) {
    _.each(factualVenues, function(factualVenue) {
      venue = {};
      venue.factualVenueData = factualVenue;
      venue.addendum = {};
      if(factualVenue['$distance']) {
        //convert meters to miles, rounded to the nearest .1 mi;
        miles = Math.round((factualVenue['$distance'] * 0.00062137119) * 10) / 10;
        // factualVenue['$distance'] = miles;
        venue.location = {};
        venue.location.distance = miles;
      }
      if(factualVenue.category_labels) {
        // console.log(JSON.stringify(factualVenue.category_labels));
        // factualVenue.iconUrlPrefix = categoryList.dictionary[factualVenue.categories[0].name].prefix;
        // factualVenue.iconUrlSuffix = categoryList.dictionary[factualVenue.categories[0].name].suffix;
        venue.addendum.iconUrlPrefix = 'https://s3-us-west-2.amazonaws.com/waddle/Badges/uncatagorized-1/uncategorized-';
        venue.addendum.iconUrlSuffix = '-2.svg';
      }
      else {
        venue.addendum.iconUrlPrefix = 'https://s3-us-west-2.amazonaws.com/waddle/Badges/uncatagorized-1/uncategorized-';
        venue.addendum.iconUrlSuffix = '-2.svg';
      }
    })
    res.json(venues);
  })
  .catch(function (err){
    console.log(err);
    res.status(500).end();
  });
};

checkinController.searchFoursquareVenuesBySearchQueryAndGeolocation = function (req, res) {
  var user, foursquareToken, miles;
  var facebookID = req.params.facebookID;
  var latlng = req.params.lat + ',' + req.params.lng;
  var query = req.params.query;

  neo4jUser.find({facebookID: facebookID})
  .then(function (userNode) {
    user = userNode;
    return foursquareUtils.searchFoursquareVenuesBySearchQueryAndGeolocation(user, latlng, query)
  })
  .then(function (venues) {
    _.each(venues, function(venue) {
      if(venue.location.distance) {
        //convert meters to miles, rounded to the nearest .1 mi;
        miles = Math.round((venue.location.distance * 0.00062137119) * 10) / 10;
        venue.location.distance = miles;
      }
      if(venue.categories[0] && venue.categories[0].name && categoryList.dictionary[venue.categories[0].name]) {
        venue.iconUrlPrefix = categoryList.dictionary[venue.categories[0].name].prefix;
        venue.iconUrlSuffix = categoryList.dictionary[venue.categories[0].name].suffix;
      }
      else {
        venue.iconUrlPrefix = 'https://s3-us-west-2.amazonaws.com/waddle/Badges/uncatagorized-1/uncategorized-';
        venue.iconUrlSuffix = '-2.svg';
      }
    })
    res.json(venues);
  })
  .catch(function (err){
    console.log(err);
    res.status(500).end();
  });
};

checkinController.instagramHubChallenge = function (req, res) {
  res.status(200).send(req.query['hub.challenge']);
};

checkinController.handleIGPost = function (req, res) {
  var updateArr = req.body;

  var posts = _.map(updateArr, function (update) {
    return instagramUtils.handleUpdateObject(update);
  })

  Q.all(posts)
  .then(function (postArr) {
    // write to db using batch query?
    console.log(JSON.stringify(postArr));

    var flatPostArr = _.flatten(postArr);

    var queries = _.map(flatPostArr, function (post) {
      return post.user.addCheckins([post.checkin]);
    });

    return Q.all(queries);
  })
  .then(function (data) {
    console.log(JSON.stringify(data));
  })
  .catch(function (e) {
    console.log(e);
  });

  res.status(200).end();
};

checkinController.facebookHubChallenge = function (req, res) {
  res.status(200).send(req.query['hub.challenge']);
};

checkinController.handleFBPost = function (req, res) {
  var updateArr = req.body.entry;
  // console.log("dis be ma boday's entray: " + JSON.stringify(updateArr));

  var posts = _.map(updateArr, function(update) {
    return facebookUtils.handleUpdateObject(update);
  });

  Q.all(posts)
    .then(function (postArr) {
      // write to db using batch query?

      var flatPostArr = _.flatten(postArr);

      var queries = [];

      _.each(flatPostArr, function (userObj) {
        console.log('user obj', JSON.stringify(userObj));
        var myUser = userObj.user;
        var myCheckins = userObj.checkins;

        _.each(myCheckins, function (checkin) {
          queries.push(myUser.addCheckins([checkin]));
        });

      });

      return Q.all(queries);
    })
    .then(function (data) {
      console.log(JSON.stringify(data));
    })
    .catch(function (e) {
      console.log(e);
    });
  res.status(200).end();
};


checkinController.realtimeFoursquareData = function (req, res) {
  var checkin = JSON.parse(req.body.checkin);
  var userFoursquareID = checkin.user.id;
  var user;

  neo4jUser.findByFoursquareID(userFoursquareID)
  .then(function (userNode) {
    user = userNode;
    console.log(checkin);
    return foursquareUtils.parseCheckin(checkin);
  })
  .then(function (parsedCheckin) {
    return helpers.addCityProvinceAndCountryInfoToParsedCheckins([parsedCheckin])
  })
  .then(function (parsedCheckinWithLocationInfo) {
    return user.addCheckins(parsedCheckinWithLocationInfo);
  })
  .then(function (data) {
    console.log(data);
  })
  .catch(function (err) {
    console.log(err);
  });

  res.status(200).end();
};

checkinController.requestTokenFromTwitter = function (req, res) {

};

checkinController.addToBucketList = function (req, res){
  var checkinID = req.body.checkinID;
  var facebookID = req.body.facebookID;

  neo4jCheckin.addToBucketList(facebookID, checkinID)
    .then(function (data){
      res.json(data);
      res.status(201).end();
    })
    .catch(function (err) {
      console.log(err);
      res.status(500).end();
    });
};

checkinController.removeFromBucketList = function (req, res){
  var checkinID = req.body.checkinID;
  var facebookID = req.body.facebookID;

  neo4jCheckin.removeFromBucketList(facebookID, checkinID)
    .then(function (data){
      res.json(data);
      res.status(201).end();
    })
    .catch(function(err) {
      console.log(err);
      res.status(500).end();
    });
};

checkinController.addComment = function (req, res){
  var clickerID = req.body.clickerID;
  var checkinID = req.body.checkinID;
  var checkinDate = new Date();
  var checkinTime = checkinDate.getTime();
  if (req.body.text) {
    var text = req.body.text;
  } else {
    res.status(404).end()
  }

  neo4jCheckin.addComment(clickerID, checkinID, text, checkinTime)
    .then(function (data){
      return Checkin.getComments(checkinID);
    })
    .then(function (commentsArray) {
      console.log('added comment!', commentsArray);
      res.json(commentsArray);
      res.status(201).end();
    })
    .catch(function (err) {
      console.log(err);
      res.status(500).end();
    });
};

checkinController.editComment = function (req, res) {
  var checkinID = req.body.checkinID;
  var facebookID = req.body.facebookID;
  var commentID = req.body.commentID;
  var commentText = req.body.commentText;

  neo4jCheckin.editComment(facebookID, checkinID, commentID, commentText)
  .then (function (data) {
    console.log(data);
    res.json(data);
    res.status(201).end();
    
  })
  .catch(function (err) {
    console.log(err);
    res.status(500).end();
  });
};

checkinController.removeComment = function (req, res) {
  var checkinID = req.body.checkinID;
  var facebookID = req.body.facebookID;
  var commentID = req.body.commentID;
 
  neo4jCheckin.removeComment(facebookID, checkinID , commentID)
    .then(function (data){
      return Checkin.getComments(checkinID);
    })
    .then(function (commentsArray) {
      console.log('removed comment!', commentsArray);
      res.json(commentsArray);
      res.status(201).end();
    })
    .catch(function(err) {
      console.log(err);
      res.status(500).end();
    });
};

checkinController.addToFolder = function (req, res) {
  var checkinID = req.body.checkinID;
  var facebookID = req.body.facebookID;
  var folderName = req.body.folderName;

  neo4jCheckin.addToFolder(facebookID, checkinID, folderName)
    .then(function (data){
      return neo4jUser.fetchFolderContents(facebookID, folderName, 0, 10)
    })
    .then(function (folderContents) {
      res.json(folderContents);
      res.status(201).end();
    })
    .catch(function(err) {
      console.log(err);
      res.status(500).end();
    })
};

checkinController.removeFromFolder = function (req, res) {
  var checkinID = req.body.checkinID;
  var facebookID = req.body.facebookID;
  var folderName = req.body.folderName;

  neo4jCheckin.removeFromFolder(facebookID, checkinID, folderName)
    .then(function (data) {
      return neo4jUser.fetchFolderContents(facebookID, folderName)
    })
    .then(function (folderContents) {
      res.json(folderContents);
      res.status(201).end();
    })
    .catch(function(err) {
      console.log(err);
      res.status(500).end();
    })
};

checkinController.removeFromFavorites = function (req, res) {
  var checkinID = req.body.checkinID;
  var facebookID = req.body.facebookID;

  neo4jCheckin.removeFromFavorites(facebookID, checkinID)
  .then(function (data){
    res.json(data);
    res.status(201).end();
  })
  .catch(function(err) {
    console.log(err);
    res.status(500).end();
  });
};

checkinController.giveProps = function (req, res){
  var clickerID = req.body.clickerID;
  var checkinID = req.body.checkinID;

  neo4jCheckin.giveProps(clickerID, checkinID)
    .then(function (data){
      console.log(data)
      res.json(data);
      res.status(201).end();
    })
    .catch(function (err){
      console.log(err);
      res.status(500).end();
    });
};


checkinController.getHypesAndComments = function (req, res){
  var checkinID = req.params.checkinid;
  var parsedData = {}

  neo4jCheckin.getHypes(checkinID)
    .then(function (hypesArray){
      parsedData.hypes = hypesArray;
      return Checkin.getComments(checkinID);
    })
    .then(function (commentsArray){
      parsedData.comments = commentsArray;
      console.log(parsedData);
      res.json(parsedData);
      res.status(200).end();
    })
    .catch(function (err){
      console.log(err);
      res.status(500).end();
    });
};

checkinController.deleteFootprint = function (req, res) {
  var facebookID = req.body.facebookID;
  var checkinID = req.body.checkinID;

  mongoCheckin.deleteCheckin(facebookID, checkinID)
  .then(function (data) {
    console.log(data);
    res.json({on_success: "footprint has been successfully deleted"})
    res.status(200).end();
  })
  .catch(function (err) {
    console.log(err);
    res.status(500).end();
  });

  // neo4jCheckin.deleteFootprint(facebookID, checkinID)
  //   .then(function (data) {
  //     console.log(data)
  //     res.json({on_success: "footprint has been successfully deleted"})
  //     res.status(200).end();
  //   })
  //   .catch(function (err) {
  //     console.log(err);
  //     res.status(500).end();
  //   });
};

checkinController.suggestFootprint = function (req, res) {
  var params = req.body;

  neo4jCheckin.suggestFootprint(params.senderFacebookID, params.checkinID, params.receiverFacebookID, params.suggestionTime)
  .then(function (data) {
    console.log(data);
    res.json({on_success: "suggestion sent!"})
    res.status(200).end();
  })
  .catch(function (err) {
    console.log(err);
    res.status(500).end();
  });
};

checkinController.sign_s3 = function (req, res) {
  var facebookID = req.params.facebookID;
  var photoSize = req.params.photoSize;
  aws.config.update({accessKeyId: process.env.AWS_ACCESS_KEY, secretAccessKey: process.env.AWS_SECRET_KEY});
  var s3 = new aws.S3();
  // var aws_uuid = uuid.v4();
  var aws_uuid = req.params.photoUUID;
  var s3_params = {
      Bucket: process.env.S3_BUCKET,
      Key: 'user_photos/' + facebookID + '/' + aws_uuid + '/' + photoSize,
      Expires: 60,
      ContentType: req.query.s3_object_type,
      ACL: 'public-read'
  };
  s3.getSignedUrl('putObject', s3_params, function(err, data){
      if(err){
          console.log(err);
      }
      else{
          var return_data = {
              signed_request: data,
              url: 'https://' + s3_params.Bucket + '.s3.amazonaws.com/' + s3_params.Key
          };
          res.write(JSON.stringify(return_data));
          res.end();
      }
  });
};

  //executed once to convert waddle checkins;kept here for future reference
// checkin.convertTime = function (req, res) {

  // Checkin.convertNativeWaddleCheckinTime()
  // .then(function (data) {
  //   var convertedTime = [];
  //    _.each(data, function (datum) {
  //     if(datum['checkin.checkinID'] != '0771b0c0-9822-46a0-8553-6e174c37ff33') {
  //       var newObj = {'checkinID': datum['checkin.checkinID'], 'checkinTime': null};
  //       var newDate = new Date(datum['checkin.checkinTime']);
  //       newObj.checkinTime = newDate;
  //       convertedTime.push(newObj);
  //     }
  //   })
  //   console.log(convertedTime)
  //   return Checkin.updateCheckinTime(convertedTime);
  // })
  // .then(function (data) {
  //   console.log(data)
  // })
  // .catch(function (err) {
  //   console.log(err);
  // })
// }

module.exports = checkinController;
