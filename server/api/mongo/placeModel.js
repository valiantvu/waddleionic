var Q = require('q');
var mongodb = require('./../../mongoConfig.js');
var Place = {};

Place.createOrUpdatePlace = function(placeData) {
  console.log('hey im here!!!', placeData);
  var deferred = Q.defer();
  mongodb.collection('places').update({factual_id: placeData.factual_id}, placeData, {upsert:true}, function(err, result) {
    if (err) {
      deferred.reject();
      throw err;
    }
    if (result) {
      console.log(result);
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
  query['$set'][key] = value;
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

module.exports = Place;