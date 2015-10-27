var Q = require('q');
var _ = require('lodash');
var neo4jPlace = require('../neo4j/placeModel.js');
var mongoPlace = require('../mongo/placeModel.js');
var mongoUser = require('../mongo/userModel.js');
var mongoTag = require('../mongo/tagModel.js');
var factualUtils = require('../../utils/factualUtils.js');
var helpers = require('../../utils/helpers.js');


var placeController = {};

placeController.fetchTagsBasedOnSearchTerm = function (req, res) {
	var dropdownResults = [];
	var searchTerm = req.params.query;
	var geolocation = [req.params.lat, req.params.lng];
	//radius expects an int in meters for factual query to work, with a max of 25000 m
	var radius = req.params.radius;

	mongoTag.fetchTagsBasedOnSearchTerm(searchTerm)
	.then(function (tags) {
		dropdownResults = dropdownResults.concat(tags);
		return factualUtils.findVenuesByNameWithinGeolocationBounds(searchTerm, geolocation, radius);
	})
	.then(function (venues) {
		console.log(venues);
		dropdownResults = dropdownResults.concat(venues);
		// dropdownResults = venues.concat(dropdownResults);
		res.json(dropdownResults);
		res.status(200).end();
	})
	.catch(function (err) {
		console.log(err);
		res.status(500).end();
	});
};

placeController.updatePlace = function (req, res){
  var placeData = req.body;
  neo4jPlace.create(placeData)
  .then(function(node) {
    res.status(204).end();
  })
  .catch(function(err) {
    console.log(err);
    res.status(500).end();
  });
};

placeController.discoverPlaces = function (req, res) {
	var factualQuery;
	var searchParams = req.query;
	var user = req.params.user;
	//req.query should be an object 
	console.log(searchParams);
	console.log(user);


  //if searchParams includes list of rated places, then search factual API excluding the rated place; if searchParams
  //doesn't include list of rated places, get rated places and use the factual API to filter that list based on user input
	if(!searchParams.ratedPlaces) {
		mongoUser.getRatedPlaces(user)
		.then(function (ratedPlaces) {
			console.log('factualIDs: ', ratedPlaces.factualIDs);
			searchParams.ratedPlaces = ratedPlaces;
			//this property is used to alter the query so that it filters the list of rated places that is passed in via the searchParams
			if(ratedPlaces.length > 0) {
				searchParams.shouldFilterRatedPlaces = true;
			}
			factualQuery = helpers.buildFactualSearchQuery(searchParams);
			console.log('factualQuery', JSON.stringify(factualQuery));
			return factualUtils.executeSearch(factualQuery);
		})
		.then(function (factualPlaces) {
			return mongoPlace.addRatingsToSearchResults(factualPlaces, searchParams.ratedPlaces);
		})
		.then(function (results) {
			res.json(results);
			res.status(200).end();
		})
		.catch(function(err) {
			console.log(err);
			res.status(500).end();
		});
	} else {
		factualQuery = helpers.buildFactualSearchQuery(searchParams);
		factualUtils.executeSearch(factualQuery)
		.then(function (factualPlaces) {
			return mongoPlace.addRatingsToSearchResults(factualPlaces, searchParams.ratedPlaces);
		})
		.then(function (results) {
			res.json(results);
			res.status(200).end();
		})
		.catch(function(err) {
			console.log(err);
			res.status(500).end();
		});
	}
};

placeController.searchWaddleDB = function (req, res) {
	var facebookID = req.params.user;
	var searchQuery = req.params.query;
	neo4jPlace.findAllByCountryOrCityName(facebookID, searchQuery)
	.then(function (data) {
		// console.log(data);
		res.json(data);
		res.status(200).end();
	})
	.catch(function (err) {
		console.log(err);
		res.status(500).end();
	});
};

placeController.assignIconToCategory = function (req, res) {
	var categories = [];
	neo4jPlace.assignIconToCategories(categoryList)
	.then(function (data) {
		console.log('category icons assigned!');
		res.json(categories);
    res.status(200).end();
  })
  .catch(function(err) {
    console.log(err);
    res.status(500).end();
  });
};

placeController.findFriendsAlreadyBeen = function (req, res) {
	var facebookID = req.params.user;
	var foursquareID = req.params.place;

	neo4jPlace.findFriendsAlreadyBeen(facebookID, foursquareID)
	.then(function (data) {
		// console.log(data);
		res.json(data);
		res.status(200).end();
	})
	.catch(function (err) {
		console.log(err);
		res.status(500).end();
	});
};

// placeController.discoverPlaces = function (req, res) {
// 	// TODO
// 	// Search by category, venue name, locality, or nearby
// 	// Call userModel function to search through ratedPlaces and
// 	// retrieve a list of place IDs matching search terms
// 	// Then retrieve nearby places through factual api
// };

placeController.discoverPlacesByCategoryOrName = function (req, res) {
	var facebookID = req.params.user;
	var query = req.params.query;

	neo4jPlace.discoverByCategoryOrName(facebookID, query)
	.then(function (data) {
		// console.log(data);
		res.json(data);
	  res.status(200).end();
	})
	.catch(function (err) {
		console.log(err);
		res.status(500).end();
	});
};

placeController.discoverPlacesByLocation = function (req, res) {
	console.log('dis be ma wreck', req.params);
	console.log(req.body);
	var facebookID = req.params.user;
	var location = req.params.location;

	neo4jPlace.discoverByLocation(facebookID, location)
	.then(function (data) {
		// console.log(data);
		res.json(data);
	  res.status(200).end();
	})
	.catch(function (err) {
		console.log(err);
		res.status(500).end();
	});
};

placeController.discoverPlacesByCategoryOrNameAndLocation = function (req, res) {
	var facebookID = req.params.user;
	var location = req.params.location;
	var query = req.params.query;

	neo4jPlace.discoverByCategoryOrNameAndLocation(facebookID, location, query)
	.then(function (data) {
		// console.log(data);
		res.json(data);
	  res.status(200).end();
	})
	.catch(function (err) {
		console.log(err);
		res.status(500).end();
	});
};

module.exports = placeController;