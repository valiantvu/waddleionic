var neo4jPlace = require('../neo4j/placeModel.js');
var Q = require('q');
var _ = require('lodash');

var placeController = {};

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

placeController.searchWaddleDB = function (req, res) {
	var facebookID = req.params.user;
	var searchQuery = req.params.query;
	neo4jPlace.findAllByCountryOrCityName(facebookID, searchQuery)
	.then(function (data) {
		console.log(data);
		res.json(data);
		res.status(200).end();
	})
	.catch(function (err) {
		console.log(err);
		res.status(500).end();
	})
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
  })
};

placeController.findFriendsAlreadyBeen = function (req, res) {
	var facebookID = req.params.user;
	var foursquareID = req.params.place;

	neo4jPlace.findFriendsAlreadyBeen(facebookID, foursquareID)
	.then(function (data) {
		console.log(data);
		res.json(data);
		res.status(200).end();
	})
	.catch(function (err) {
		console.log(err);
		res.status(500).end();
	})
};

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
	})
};

placeController.discoverPlacesByLocation = function (req, res) {
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
	})
};

placeController.discoverPlacesByCategoryOrNameAndLocation = function (req, res) {
	var facebookID = req.params.user;
	var location = req.params.location;
	var query = req.params.query

	neo4jPlace.discoverByCategoryOrNameAndLocation(facebookID, location, query)
	.then(function (data) {
		// console.log(data);
		res.json(data);
	  res.status(200).end();
	})
	.catch(function (err) {
		console.log(err);
		res.status(500).end();
	})
}

module.exports = placeController;