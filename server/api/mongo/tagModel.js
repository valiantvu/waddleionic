var Q = require('q');
var mongodb = require('./../../mongoConfig.js');
var uuid = require('node-uuid');
var Tag = {};

Tag.saveListOfTags = function(tagList) {
  console.log('ma tags!!');
  var deferred = Q.defer();
  mongodb.collection('tags').insert(tagList, function (err, result) {
    if (err) {
      deferred.reject();
      throw err;
    }
    if (result) {
      console.log('deleted all tags');
      deferred.resolve({success: true});
    }
  });
  return deferred.promise;
};

Tag.deleteAllTagsinCollection = function() {
  var deferred = Q.defer();
  mongodb.collection('tags').remove({}, function(err, result) {
    if (err) {
      deferred.reject();
      throw err;
    }
    if (result) {
      console.log('deleted all tags');
      deferred.resolve({success: true});
    }
  });
  return deferred.promise;
};

module.exports = Tag;