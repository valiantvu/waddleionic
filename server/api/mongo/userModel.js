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
      console.log(result);
      // mongodb.collection('users').update({facebookID: user.facebookID}, {createdAt: new Date()}, function(err, result) {
        // user.createdAt = new Date();
      // });
      console.log('Added user!');
      deferred.resolve(result);
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
      console.log(result);
      console.log('Added createdAt property!');
      deferred.resolve(result);
    }
  });

  return deferred.promise;
};

User.setProperty = function (property, value) {
  var deferred = Q.defer();
  mongodb.collection('users').update({facebookID: user.facebookID}, { $set: {property: value} }, function(err, result) {
    if (err) {
      deferred.reject();
      throw err;
    }
    if (result) {
      console.log(result);
      console.log('Updated property!');
      deferred.resolve(result);
    }
  });

  return deferred.promise;
};

User.updateCheckinsCount = function (user) {
  var deferred = Q.defer();

  // mongodb.collection('users').find({facebookID: user.facebookID}, function(err, result) {
  //   if (err) {
  //     deferred.reject();
  //     throw err;
  //   }
  //   if (result) {
  //     console.log('found user!');
  //     console.log(result);
  //   }
  // });

  mongodb.collection('users').update({facebookID: user.facebookID}, { $set: {footprintsCount: 10} }, function(err, result) {
    if (err) {
      deferred.reject();
      throw err;
    }
    if (result) {
      console.log(result);
      // mongodb.collection('users').update({facebookID: user.facebookID}, {createdAt: new Date()}, function(err, result) {
        // user.createdAt = new Date();
      // });
      console.log('Update checkins count!');
      deferred.resolve(result);
    }
  });

  return deferred.promise;
};

User.findUser = function (user) {
  var deferred = Q.defer();
  mongodb.collection('users').findOne({facebookID: user.facebookID}, function(err, result) {
    if (err) {
      deferred.reject();
      throw err;
    }
    if (result) {
      // console.log(result);
      console.log('Found user!');
      deferred.resolve(result);
    }
  });

  return deferred.promise;
};

User.addFriends = function (friends) {
  var deferred = Q.defer();
  mongodb.collection('users').update({facebookID: user.facebookID}, {$set: {friends: friends} }, function(err, result) {
    if (err) {
      deferred.reject();
      throw err;
    }
    if (result) {
      console.log(result);
      console.log('Friends added!');
      deferred.resolve(result);
    }
  });

  return deferred.promise;
};



module.exports = User;