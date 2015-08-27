// var https = require('https');
// var qs = require('querystring');

var Q = require('q');
// var _ = require('lodash');

// var helpers = require('./helpers.js');
// var foursquareUtils = require('./foursquareUtils');

var Factual = require('factual-api');
var factual = new Factual(process.env.WADDLE_FACTUAL_OAUTH_KEY, process.env.WADDLE_FACTUAL_OAUTH_SECRET);

// var User = require('../api/users/userModel.js');

var utils = {};

utils.getVenueInfo = function (venueID, user) {
  var deferred = Q.defer();

  factual.get('/t/places-us', {filters:{category_ids:{"$includes":347}}}, function (error, res) {
    console.log(res.data);
  });

  return deferred.promise;
};

utils.searchVenuesByGeolocation = function (latlng) {
	var deferred = Q.defer();
	console.log(latlng);

	factual.get('/t/places-us', {filters:{"category_ids":{"$includes_any":[308, 107]}}, geo:{"$circle":{"$center": latlng, "$meters": 25000}}, sort:{"distance": 100, "placerank": 10}}, function (err, res) {
		if(err) {
			console.log(err);
		} else {
			console.log(res.data);
			deferred.resolve(res.data);
		}
	});
	return deferred.promise;
}

utils.searchVenuesBySearchQueryAndGeolocation = function (latlng, query) {
	var deferred = Q.defer();
	factual.get('/t/places-us', {filters:{"name":{"$search": query}, "category_ids":{"$includes_any":[308, 107]}}, geo:{"$circle":{"$center": latlng, "$meters": 25000}}, sort:"$relevance"}, function (err, res) {
		if(err) {
			console.log(err);
		} else {
			console.log(res.data);
			deferred.resolve(res.data);
		}
	});
	return deferred.promise;
}

utils.searchVenuesByQueryAndNear = function (near, query) {
	var deferred = Q.defer();
	factual.get('/t/places-us', {filters:{"name":{"$search": query}, "$or": [{"locality": {"$search": near}}, {"region": {"$search": near}}], "category_ids":{"$includes_any":[308, 107]}}, sort:"$relevance"}, function (err, res) {
		if(err) {
			console.log(err);
		} else {
			console.log('ehud');
			console.log(res.data);
			deferred.resolve(res.data);
		}
	});
	return deferred.promise;
}

utils.getFactualIDFromFoursquareID = function (foursquareID) {
	console.log(foursquareID);
	var deferred = Q.defer();

	factual.get('/t/crosswalk?filters={"namespace":"foursquare", "namespace_id":"' + foursquareID  + '"}', function (error, res) {
		if(error) {
			console.log(error);
		} else {
			
		console.log(res.data);
  	deferred.resolve(res.data);
		}
  });

  return deferred.promise;
};

utils.getFoursquareIDFromFactualID = function (factualID) {
	console.log(factualID);
	var deferred = Q.defer();

	factual.get('/t/crosswalk?filters={"factual_id":"' + factualID + '", "namespace": "foursquare"}', function (error, res) {
		if(error) {
			console.log(error);
		} else {
			console.log(res.data);
  	  deferred.resolve(res.data[0].namespace_id);
		}
  });

  return deferred.promise;
};

module.exports = utils;