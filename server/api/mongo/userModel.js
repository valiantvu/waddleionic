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
  mongodb.collection('users').update({facebookID: user.facebookID}, { $set: {createdAt: new Date()} }, function(err, result) {
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
  var newProperty = {};
  newProperty[property] = value;
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
  mongodb.collection('users').update({facebookID: user.facebookID}, {$set: {friends: friends} }, function(err, result) {
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

User.buildFeed = function (user, friends) {
  // TODO
};

module.exports = User;