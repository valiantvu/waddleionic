var Place = require('./placeModel.js');
var Q = require('q');
var _ = require('lodash');

var placeController = {};

placeController.updatePlace = function (req, res){

  var placeData = req.body;
  Place.create(placeData)
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
	Place.findAllByCountryOrCityName(facebookID, searchQuery)
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
	Place.assignIconToCategories(categoryList)
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

	Place.findFriendsAlreadyBeen(facebookID, foursquareID)
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

module.exports = placeController;