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

Tag.createTextIndexOnNameField = function() {
  var deferred = Q.defer();
  mongodb.collection('tags').createIndex({"name": text}, function (err, result) {
    if (err) {
      deferred.reject();
      throw err;
    }
    if (result) {
      console.log('created index!');
      deferred.resolve({success: true});
    }
  });
  return deferred.promise;
};

Tag.fetchTagsBasedOnSearchTerm = function (searchTerm) {
  var regex;
  var deferred = Q.defer();
  if(searchTerm.length >= 3) {
    regex = new RegExp(searchTerm);
  } else {
    var regexStringBeginsWith = '^' + searchTerm;
    regex = new RegExp(regexStringBeginsWith);
  }
  console.log(regex);

  mongodb.collection('tags').find({'name':{'$regex': regex, '$options': 'i'}}, {name: 1}, {limit: 3}).toArray(function (err, result) {
  // mongodb.collection('tags').find({'$text':{'$search': searchTerm}}, {name: 1}, {limit: 3}).toArray(function (err, result) {

    if (err) {
      deferred.reject();
      console.log(err);
      throw err;
    }
    if (result) {
      console.log(result);
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