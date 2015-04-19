var Place = require('./placeModel.js');
var Q = require('q');
var _ = require('lodash');

var placeController = {};

var categoryList = [
	{name: "Burger Joint",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/burger-1/Burger-',
	 suffix: '-1.png'
	},
	{name: "BBQ Joint",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/burger-1/Burger-',
	 suffix: '-1.png'
	},
	{name: "National Park",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/tree-1/Tree-',
	 suffix: '-1.png'
	},
	{name: "Nature Preserve",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/tree-1/Tree-',
	 suffix: '-1.png'
	},
	{name: "Other Great Outdoors",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/tree-1/Tree-',
	 suffix: '-1.png'
	},
	{name: "Park",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/tree-1/Tree-',
	 suffix: '-1.png'
	},
	{name: "Trail",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/tree-1/Tree-',
	 suffix: '-1.png'
	},
	{name: "Tree",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/tree-1/Tree-',
	 suffix: '-1.png'
	},
	{name: "Japanese Restaurant",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/ramen-1/ramen-',
	 suffix: '-1.png'
	},
	{name: "Ramen / Noodle House",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/ramen-1/ramen-',
	 suffix: '-1.png'
	},
	{name: "Soup Place",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/ramen-1/ramen-',
	 suffix: '-1.png'
	},
	{name: "Vietnamese Restaurant",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/ramen-1/ramen-',
	 suffix: '-1.png'
	},
	{name: "Bar",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/beer-1/beer-',
	 suffix: '-1.png'
	},
		{name: "Beach Bar",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/beer-1/beer-',
	 suffix: '-1.png'
	},
	{name: "Brewery",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/beer-1/beer-',
	 suffix: '-1.png'
	},
	{name: "Pub",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/beer-1/beer-',
	 suffix: '-1.png'
	},
	{name: "Sports Bar",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/beer-1/beer-',
	 suffix: '-1.png'
	},
	{name: "Beer Garden",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/beer-1/beer-',
	 suffix: '-1.png'
	},
	{name: "Champagne Bar",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/cocktail-1/cocktail-',
	 suffix: '-1.png'
	},
	{name: "Cocktail Bar",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/cocktail-1/cocktail-',
	 suffix: '-1.png'
	},
	{name: "Gay Bar",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/cocktail-1/cocktail-',
	 suffix: '-1.png'
	},
	{name: "Hotel Bar",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/cocktail-1/cocktail-',
	 suffix: '-1.png'
	},
	{name: "Lounge",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/cocktail-1/cocktail-',
	 suffix: '-1.png'
	},
	{name: "Speakeasy",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/cocktail-1/cocktail-',
	 suffix: '-1.png'
	},
	{name: "Nightclub",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/cocktail-1/cocktail-',
	 suffix: '-1.png'
	},
	{name: "Other Nightlife",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/cocktail-1/cocktail-',
	 suffix: '-1.png'
	},
	{name: "Whisky Bar",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/cocktail-1/cocktail-',
	 suffix: '-1.png'
	},
	{name: "Wine Bar",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/cocktail-1/cocktail-',
	 suffix: '-1.png'
	},
	{name: "Sake Bar",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/cocktail-1/cocktail-',
	 suffix: '-1.png'
	},
	{name: "Karaoke Bar",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/cocktail-1/cocktail-',
	 suffix: '-1.png'
	},
		{name: "Karaoke Bar",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/cocktail-1/cocktail-',
	 suffix: '-1.png'
	},
	{name: "Café",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/coffee-1/coffee-',
	 suffix: '-1.png'
	},
	{name: "Coffee Shop",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/coffee-1/coffee-',
	 suffix: '-1.png'
	},
	{name: "Tea Room",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/coffee-1/coffee-',
	 suffix: '-1.png'
	},
	{name: "Food Truck",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/foodtruck-1/foodtruck-',
	 suffix: '-1.png'
	},
	{name: "Bagel Shop",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/bagel-1/bagel-',
	 suffix: '-1.png'
	},
	{name: "Bakery",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/bagel-1/bagel-',
	 suffix: '-1.png'
	},
	{name: "Art Gallery",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/painting-1/painting-',
	 suffix: '-1.png'
	},
	{name: "Art Museum",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/painting-1/painting-',
	 suffix: '-1.png'
	},
	{name: "Public Art",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/painting-1/painting-',
	 suffix: '-1.png'
	}
];

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