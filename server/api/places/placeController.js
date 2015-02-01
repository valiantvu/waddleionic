var Place = require('./placeModel.js');
var _ = require('lodash');

var placeController = {};

var categoryList = [
	{name: "Burger Joint",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/burger-1/Burger',
	 suffix: '-1.png'
	},
	{name: "BBQ Joint",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/burger-1/Burger',
	 suffix: '-1.png'
	},
	{name: "National Park",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/tree-1/Tree90x90',
	 suffix: '-1.png'
	},
	{name: "Nature Preserve",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/tree-1/Tree90x90',
	 suffix: '-1.png'
	},
	{name: "Other Great Outdoors",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/tree-1/Tree90x90',
	 suffix: '-1.png'
	},
	{name: "Park",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/tree-1/Tree90x90',
	 suffix: '-1.png'
	},
	{name: "Trail",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/tree-1/Tree90x90',
	 suffix: '-1.png'
	},
	{name: "Tree",
	 prefix: 'https://s3-us-west-2.amazonaws.com/waddle/Badges/tree-1/Tree90x90',
	 suffix: '-1.png'
	}
]

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
}

placeController.assignIconToCategories = function () {
	Place.assignIconToCategories(categoryList)
	.then(function (data) {
		console.log('category icons assigned!');
    res.status(204).end();
  })
  .catch(function(err) {
    console.log(err);
    res.status(500).end();
  })
}

module.exports = placeController;