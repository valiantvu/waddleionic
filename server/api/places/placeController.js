var Place = require('./placeModel.js');

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
}

module.exports = placeController;