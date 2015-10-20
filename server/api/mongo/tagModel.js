var Q = require('q');
var mongodb = require('./../../mongoConfig.js');
var uuid = require('node-uuid');
var Tag = {};

Tag.saveListOfTags = function(tagList) {
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

Tag.fetchTagsBasedOnSearchTerm = function (searchTerm) {
  var deferred = Q.defer();
  mongodb.collection('tags').find({'$text':{'$search': searchTerm}}).toArray(function (err, result) {
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