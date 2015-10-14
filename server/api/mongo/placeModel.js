var Q = require('q');
var mongodb = require('./../../mongoConfig.js');
var Place = {};

Place.createOrUpdatePlace = function(placeData) {
  console.log('hey im here!!!', placeData);
  var deferred = Q.defer();
  mongodb.collection('places').update({factualID: placeData.factualID}, {
    "factualID" : placeData.factualID,
    "name" : placeData.name,
    "factualRating" : placeData.factualRating,
    "address" : placeData.address,
    "cityProvince" : placeData.cityProvince,
    "neighborhoods" : placeData.neighborhoods,
    "country" : placeData.country,
    "postCode" : placeData.postCode,
    "telephone" : placeData.telephone,
    "website" : placeData.website,
    "latitude" : placeData.latitude,
    "longitude" : placeData.longitude,
    "hours": placeData.hours,
    "categoryLabels": placeData.category_labels,
    "restaurantAttributes": {}
}, {upsert:true}, function(err, result) {
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

module.exports = Place;