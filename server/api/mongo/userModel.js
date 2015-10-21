var mongodb = require('./../../mongoConfig.js');
var Q = require('q');

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
  console.log(checkin);
  console.log('building rated places for user and friends');
  // console.log(userAndFriendsFacebookIDs);
  checkin.apiSource = 'restaurants';
  var deferred = Q.defer();
  // var checkinAndRating = {};
  // var checkinAndRating = { checkinID: checkinID, rating: checkin.rating, facebookID: checkin.facebookID};
  var factualID = 1;
  var userAndFriendsFacebookIDs = ['10203426526517301', '10202833487341857'];
  var checkinAndRating = { checkinID: '777', rating: 3, facebookID: 1 };

  mongodb.collection('users').update(
    {facebookID: {$in: userAndFriendsFacebookIDs}, 'ratedPlaces.factualID': factualID },
    {$addToSet: {'ratedPlaces.$.ratings': checkinAndRating} },
    {multi: true},
    function(err, result) {
      console.log('Update ratedPlaces resolved.');
      if (err !== null) {
        console.log('Error updating ratedPlaces!');
        console.log(err);
        deferred.reject();
        throw err;
      }
      if (result) {
        console.log('Updated ratedPlaces for user and friends');
        console.log(result);
        deferred.resolve(result);
      }
    }
  );
  
  // mongodb.collection('users').update(
  //   {'facebookID': {'$in': [ '10203426526517301', '10202833487341857' ]}, 'ratedPlaces.factualID': 1 },
  //   {'$addToSet': {'ratedPlaces.$.ratings': checkinAndRating} },
  //   {'multi': true},
  //   function(err, result) {
  //     console.log('Update ratedPlaces resolved.');
  //     if (err !== null) {
  //       console.log('Error updating ratedPlaces!');
  //       console.log(err);
  //       deferred.reject();
  //       throw err;
  //     }
  //     if (result) {
  //       console.log('Updated ratedPlaces for user and friends');
  //       console.log(result);
  //       deferred.resolve(result);
  //     }
  //   }
  // );
  return deferred.promise;
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

module.exports = User;