var mongodb = require('./../../mongoConfig.js');
var Q = require('q');
var _ = require('lodash');

var User = {};

User.createUser = function (user) {
  var deferred = Q.defer();
  mongodb.collection('users').update({facebookID: user.facebookID}, { $set: user }, {upsert:true}, function(err, result) {
    if (err) {
      deferred.reject();
      throw err;
    }
    if (result) {
      // console.log(result);
      // mongodb.collection('users').update({facebookID: user.facebookID}, {createdAt: new Date()}, function(err, result) {
        // user.createdAt = new Date();
      // });
      console.log('Added user!');
      var updatedUser = User.findUser({facebookID: user.facebookID});
      deferred.resolve({result: result, updatedUser: updatedUser});
    }
  });

  return deferred.promise;
};

User.setCreatedAt = function (user) {
  var deferred = Q.defer();
  mongodb.collection('users').update({facebookID: user.facebookID}, { $set: {createdAt: new Date().getTime()} }, function(err, result) {
    if (err) {
      deferred.reject();
      throw err;
    }
    if (result) {
      console.log('Added createdAt property!');
      deferred.resolve(result);
    }
  });

  return deferred.promise;
};

User.setProperty = function (user, property, value) {
  var deferred = Q.defer();
  var newProperty;
  if (value) {
    newProperty = {};
    newProperty[property] = value;
  } else {
    newProperty = property;
  }
  mongodb.collection('users').update({facebookID: user.facebookID}, { $set: newProperty }, function(err, result) {
    if (err) {
      deferred.reject();
      throw err;
    }
    if (result) {
      console.log('Updated property!');
      deferred.resolve(result);
    }
  });

  return deferred.promise;
};

// User.updateCheckinsCount = function (user) {
//   var deferred = Q.defer();

//   mongodb.collection('users').update({facebookID: user.facebookID}, { $set: {footprintsCount: 10} }, function(err, result) {
//     if (err) {
//       deferred.reject();
//       throw err;
//     }
//     if (result) {
//       console.log(result);
//       // mongodb.collection('users').update({facebookID: user.facebookID}, {createdAt: new Date()}, function(err, result) {
//         // user.createdAt = new Date();
//       // });
//       console.log('Update checkins count!');
//       deferred.resolve(result);
//     }
//   });

//   return deferred.promise;
// };

User.findUser = function (user) {
  var deferred = Q.defer();
  mongodb.collection('users').findOne({facebookID: user.facebookID}, function(err, result) {
    if (err) {
      deferred.reject();
      throw err;
    }
    if (result) {
      console.log('Found user!');
      // console.log(result);
      deferred.resolve(result);
    }
  });

  return deferred.promise;
};

User.addFriends = function (user, friends) {
  // console.log(friends);
  var deferred = Q.defer();
  mongodb.collection('users').update({facebookID: user.facebookID}, {$set: {friends: friends}}, function(err, result) {
    if (err) {
      deferred.reject();
      throw err;
    }
    if (result) {
      // console.log(result);
      console.log('Friends added!');
      deferred.resolve(result);
    }
  });

  return deferred.promise;
};

User.findFriends = function (facebookID) {
  var deferred = Q.defer();
  mongodb.collection('users').findOne({facebookID: facebookID}, {friends: 1}, function (err, result) {
    if(err) {
      deferred.reject();
      throw err;
    }
    if(result) {
      deferred.resolve(result);
    }
  });
  return deferred.promise;
};

User.buildFeed = function (userAndFriendsFacebookIDs, checkin) {
  var deferred = Q.defer();
  mongodb.collection('users').update({facebookID:{'$in':userAndFriendsFacebookIDs}}, {$push: {feed:
    {
      checkinID: checkin.checkinID,
      facebookID: checkin.facebookID,
      createdAt: checkin.createdAt
    }
  }}, {multi: true}, function(err, result) {
    if (err) {
      deferred.reject();
      throw err;
    }
    if (result) {
      deferred.resolve(result);
    }
  });
  return deferred.promise;
};

User.findFeedItem = function (facebookID, checkinID) {
  var deferred = Q.defer();
  mongodb.collection('users').findOne({facebookID: facebookID, 'feed.checkinID': checkinID}, {feed:{$elemMatch: {checkinID: checkinID}}},
  function(err, result) {
    if (err) {
      deferred.reject();
      throw err;
    }
    if (result) {
      deferred.resolve(result);
    }
  });
  return deferred.promise;
};


User.buildRatedPlaces = function (userAndFriendsFacebookIDs, checkin) {
  // console.log(checkin);
  var deferredRatedPlaceCreated = Q.defer();
  var deferredRatedPlaceUpdated = Q.defer();
  var factualID = checkin.factualVenueData.factual_id;
  var checkinAndRating = { checkinID: checkin.checkinID, rating: checkin.rating, facebookID: checkin.facebookID};
  var newRatedPlace = {
    factualID: factualID,
    avgRating: checkin.rating,
    apiSource: checkin.factualVenueData.apiSource,
    ratings: [ checkinAndRating ]
  };

  // console.log(newRatedPlace);
  // console.log(checkinAndRating);

  mongodb.collection('users').find({facebookID: {$in: userAndFriendsFacebookIDs}, 'ratedPlaces.factualID': factualID }, {facebookID: 1}).toArray(function (err, result) {
    if (err) {
      console.log(err);
      deferredRatedPlaceUpdated.reject();
      throw err;
    }
    if (result) {

      var usersWithRatedPlace = _.pluck(result, 'facebookID');
      var usersWithoutRatedPlace = _.difference(userAndFriendsFacebookIDs, usersWithRatedPlace);
      // console.log('Users with matching rated place:');
      // console.log(usersWithRatedPlace);
      // console.log('Users without matching rated place:');
      // console.log(usersWithoutRatedPlace);

      // Insert rating information into existing ratedPlace for users
      // with the ratedPlace already saved
      mongodb.collection('users').update(
        {facebookID: {$in: usersWithRatedPlace}, 'ratedPlaces.factualID': factualID },
        { $addToSet: {'ratedPlaces.$.ratings': checkinAndRating} },
        {multi: true},
        function(err, result) {
          if (err) {
            console.log(err);
            deferredRatedPlaceUpdated.reject();
            throw err;
          }
          if (result) {
            console.log('Added checkin and rating information for relevant rated place');
            // console.log(result);
            User.updateAvgRating(usersWithRatedPlace, factualID);
            deferredRatedPlaceUpdated.resolve(result);
          }
        }
      );

      // Insert new rated place with rating object for users
      // who do not have the ratedPlace already saved
      mongodb.collection('users').update(
        {facebookID: {$in: usersWithoutRatedPlace} },
        {$addToSet: {'ratedPlaces': newRatedPlace} },
        {multi: true},
        function(err, result) {
          if (err) {
            console.log(err);
            deferredRatedPlaceCreated.reject();
            throw err;
          }
          if (result) {
            console.log('Created new ratedPlace for user and friends');
            // console.log(result);
            // Add checkinAndRating to each user's ratings for the relevant ratedPlace
            deferredRatedPlaceCreated.resolve(result);
          }
        }
      );
      deferredRatedPlaceCreated.resolve(result);
      deferredRatedPlaceUpdated.resolve(result);
    }
  });
  
  return Q.all([deferredRatedPlaceCreated.promise, deferredRatedPlaceUpdated.promise]);
};


User.updateAvgRating = function (usersWithRatedPlace, factualID) {
  var deferred = Q.defer();
  mongodb.collection('users').aggregate(
    {$match: {facebookID: {'$in': usersWithRatedPlace}}},
    {$project: {_id:0, 'facebookID': '$facebookID', 'ratedPlaces':'$ratedPlaces'}},
    {$unwind: '$ratedPlaces'},
    {$match: {'ratedPlaces.factualID': factualID}},
    {$project: {_id:0, 'facebookID': '$facebookID', 'factualID': '$ratedPlaces.factualID', 'ratings':'$ratedPlaces.ratings'}},
    {$unwind: '$ratings'},
    {$project: {_id:0, 'facebookID': '$facebookID', 'factualID': '$factualID', 'rating':'$ratings.rating'}},
    {$group: {_id:{'facebookID': '$facebookID', 'factualID': '$factualID'}, 'avg': {'$avg': '$rating'}}},
    {$project: {_id:0, 'facebookID': '$_id.facebookID', 'factualID': '$_id.factualID', 'avgRating':'$avg'}},

    function(err, result) {
      if (err) {
        console.log(err);
        deferred.reject();
        throw err;
      }
      if (result) {
        console.log('Calculated average ratings');
        _.each(result, function(item) {
          // console.log(item);
          mongodb.collection('users').update(
            {'facebookID': item.facebookID, 'ratedPlaces.factualID': item.factualID },
            { $set: {'ratedPlaces.$.avgRating' : item.avgRating}},
            function (err, result) {
              if (err) {
                console.log(err);
                deferred.reject();
                throw err;
              }
              if (result) {
                // console.log(result);
                deferred.resolve(result);
              }
            });
        });
      }
    }
  );
};

// WIP
User.findRatedPlace = function (facebookID, checkinID) {
  var deferred = Q.defer();
  mongodb.collection('users').findOne({facebookID: facebookID, 'ratedPlaces.factualID': factualID},
  function(err, result) {
    if (err) {
      deferred.reject();
      throw err;
    }
    if (result) {
      deferred.resolve(result);
    }
  });
  return deferred.promise;
};

User.getFactualIDsOfRatedPlaces = function (facebookID) {
  var deferred = Q.defer();
  facebookID =  '10203426526517301';
  mongodb.collection('users').aggregate(
    {$match: {facebookID: facebookID}},
    {$unwind: '$ratedPlaces'},
    {$project: {_id:0, 'factualID': '$ratedPlaces.factualID'}},
    function(err, result) {
      if (err) {
        console.log(err);
        deferred.reject();
        throw err;
      }
      if (result) {
        var factualIDs = _.pluck(result, 'factualID');
        // console.log(factualIDs);
        deferred.resolve(factualIDs);
      }
    }
  );
  return deferred.promise;
};

module.exports = User;