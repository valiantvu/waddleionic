var mongodb = require('./../../mongoConfig.js');
var Q = require('q');

var User = {};

User.createUser = function(user) {
  var deferred = Q.defer();
  user.createdAt = new Date();
  mongodb.collection('users').update({facebookID: user.facebookID}, user, {upsert:true}, function(err, result) {
  // mongodb.collection('users').insert(user, function(err, result) {
    if (err) {
      deferred.reject();
      throw err;
    }
    if (result) {
      console.log('Added user!');
      deferred.resolve(result);
    }
  });

  return deferred.promise;
};



module.exports = User;