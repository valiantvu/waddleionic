var Q = require('q');
var mongodb = require('./../../mongoConfig.js');
var uuid = require('node-uuid');
var Checkin = {};

Checkin.createCheckin = function(checkin) {
  var deferred = Q.defer();

  mongodb.collection('users').findAndModify({facebookID: checkin.facebookID}, {rating: 1}, {'$push':{checkins: {
    "checkinID" : checkin.checkinID,
    "factual_id" : checkin.factualVenueData.factual_id,
    "facebookID" : checkin.facebookID,
    "createdAt": checkin.createdAt,
    "updatedAt": checkin.createdAt,
    "caption" : checkin.footprintCaption,
    "rating" : checkin.rating,
    "photo" : checkin.photo,
    "photoWidth" : checkin.photoWidth,
    "photoHeight" : checkin.photoHeight,
    "source" : checkin.source,
    "pointValue" : checkin.pointValue,
    "likes" : [],
    "comments" : []
  }
}}, {upsert: true, new: true},
function (err, result) {
    if (err) {
      deferred.reject();
      throw err;
    }
    if (result) {
      // console.log(result);
      // console.log('Added checkin!');
      deferred.resolve(result);
    }
  });
  return deferred.promise;
};

Checkin.findCheckin = function(facebookID, checkinID) {
  var deferred = Q.defer();
  mongodb.collection('users').findOne({facebookID: facebookID, 'checkins.checkinID': checkinID}, {checkins:{$elemMatch: {checkinID: checkinID}}},
  function (err, result) {
    if (err) {
      deferred.reject();
      throw err;
    }
    if (result) {
      // console.log(result);
      deferred.resolve(result);
    }
  });
  return deferred.promise;
};

Checkin.deleteCheckin = function(facebookID, checkinID) {
  var deferred = Q.defer();
  mongodb.collection('users').update({facebookID: facebookID, 'checkins.checkinID': checkinID}, {checkins:{$elemMatch: {checkinID: checkinID}}},
  function (err, result) {
    if (err) {
      deferred.reject();
      throw err;
    }
    if (result) {
      console.log(result);
      deferred.resolve(result);
    }
  });
  return deferred.promise;
}

module.exports = Checkin;