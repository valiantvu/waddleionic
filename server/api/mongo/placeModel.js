var Q = require('q');
var mongodb = require('./../../mongoConfig.js');
var _ = require('lodash');
var User = require('./userModel');
var Place = {};

Place.createOrUpdatePlace = function(placeData) {
  // console.log('hey im here!!!', placeData);
  var deferred = Q.defer();
  //{rating: 1} is to supply sort argument...refactor at some point 
  mongodb.collection('places').findAndModify({factual_id: placeData.factual_id}, {rating: 1}, placeData, {upsert: true, new: true}, function(err, result) {
    if (err) {
      deferred.reject();
      throw err;
    }
    if (result) {
      // console.log(result);
      console.log('Added place!');
      deferred.resolve(result);
    }
  });
  return deferred.promise;
};

Place.findPlace = function(factual_id) {
  var deferred = Q.defer();
  mongodb.collection('places').findOne({factual_id: factual_id}, function(err, result) {
    if (err) {
      deferred.reject();
      throw err;
    }
    if (result) {
      // console.log(result);
      console.log('Found place!');
      deferred.resolve(result);
    }
  });

  return deferred.promise;
};

Place.setPropertyOnPlaceDocument = function(factual_id, key, value) {
  var query = {
    '$set': {}
  };
  query.$set[key] = value;
  var deferred = Q.defer();
  mongodb.collection('places').update({factual_id: factual_id}, query, function(err, result) {
    if (err) {
      deferred.reject();
      throw err;
    }
    if (result) {
      console.log('property set!');
      deferred.resolve(result);
    }
  });
};

Place.addRatingsToSearchResults = function (factualPlaces, ratedPlaces) {
  // Getting rater's info after retrieving factual results is more efficient
  // than beforehand (in getRatedPlaces) as you may not need to 
  // iterate through all rated places, but only rated places matching the
  // search params. 

  // Store ratings, avgRating, and facebook ids for each place (with factual ID as the key)
  // Retrieve names for all facebook ids in search results
  // Store names in ratingInfoByFactualID
  // Use ratingInfoByFactualID when rendering search results (lookup on factual ID)
  var deferred = Q.defer();
  var allFacebookIDs = [];
  var ratingInfoByFactualID = {};
  var raters = {};

  // Iterate through factual results
  // Organize of users who have rated each place
  _.each(factualPlaces, function(place) {
    var ratings = ratedPlaces[place.factual_id].ratings;
    var facebookIDs;

    if (ratings.length === 1) {
      facebookIDs = [ratings[0].facebookID];
      
    } else if (ratings.length > 1) {
      facebookIDs = [ratings[0].facebookID, ratings[1].facebookID];
    }

    ratingInfoByFactualID[place.factual_id] = {
      facebookIDs: facebookIDs,
      ratings: ratings,
      avgRating: ratedPlaces[place.factual_id].avgRating
    };
    allFacebookIDs = allFacebookIDs.concat(facebookIDs);
  });
  
  allFacebookIDs = _.uniq(allFacebookIDs);

  User.getNames(allFacebookIDs)
    .then(function(users) {
      _.each(users, function (user) {
        raters[user.facebookID] = user.name;
      });

      deferred.resolve({ factualPlaces: factualPlaces, raters: raters, ratingInfoByFactualID: ratingInfoByFactualID});
    })
    .catch(function(err) {
      console.log(err);
    });
  return deferred.promise;
};

module.exports = Place;