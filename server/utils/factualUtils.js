var Q = require('q');

var Factual = require('factual-api');
var factual = new Factual(process.env.WADDLE_FACTUAL_OAUTH_KEY, process.env.WADDLE_FACTUAL_OAUTH_SECRET);

var utils = {};

utils.getVenueInfo = function (factualID) {
  var deferred = Q.defer();
  factual.get('/t/places', {filters:{factual_id:{"$eq":factualID}}}, function (err, res) {
    if(err) {
			console.log(err);
			deferred.reject(err);
		} else {
			console.log(res.data);
			deferred.resolve(res.data);
		}
  });
  return deferred.promise;
};

utils.getRestaurantInfo = function (factualID) {
	var deferred = Q.defer();

	factual.get('/t/restaurants', {filters:{factual_id:{"$eq":factualID}}}, function (err, res) {
		if(err) {
			console.log(err);
			deferred.reject(err);
		} else {
			console.log(res.data);
			deferred.resolve(res.data);
		}
	});

	return deferred.promise;
};

utils.getMenu = function (factualID) {
	var deferred = Q.defer();

	  factual.get('/t/crosswalk?filters={"namespace":"allmenus", "factual_id":"' + factualID  + '"}', function (err, res) {
    if(err) {
			console.log(err);
			deferred.reject(err);
		} else {
			console.log(res.data);
			deferred.resolve(res.data);
		}
  });

	return deferred.promise;
};

utils.searchVenuesByGeolocation = function (latlng) {
	var deferred = Q.defer();
	console.log(latlng);

	factual.get('/t/places-us', {filters:{"category_ids":{"$includes_any":[308, 107]}}, geo:{"$circle":{"$center": latlng, "$meters": 25000}}, sort:{"distance": 100, "placerank": 10}}, function (err, res) {
		if(err) {
			console.log(err);
			deferred.reject(err);
		} else {
			console.log(res.data);
			deferred.resolve(res.data);
		}
	});
	return deferred.promise;
};

utils.searchVenuesByFactualIDsAndGeolocation = function (latlng, factualIDs) {
	var deferred = Q.defer();
	factual.get('/t/places-us', {filters:{"factual_id":{"$in":factualIDs}, "category_ids":{"$includes_any":[308, 107]}}, geo:{"$circle":{"$center": latlng, "$meters": 500}}, sort:"$relevance"}, function (err, res) {
		if(err) {
			console.log(err);
			deferred.reject(err);
		} else {
			// console.log(res.data);
			deferred.resolve(res.data);
		}
	});
	return deferred.promise;
};

utils.searchVenuesBySearchQueryAndGeolocation = function (latlng, query) {
	var deferred = Q.defer();
	factual.get('/t/places-us', {filters:{"name":{"$search": query}, "category_ids":{"$includes_any":[308, 107]}}, geo:{"$circle":{"$center": latlng, "$meters": 25000}}, sort:"$relevance"}, function (err, res) {
		if(err) {
			console.log(err);
			deferred.reject(err);
		} else {
			console.log(res.data);
			deferred.resolve(res.data);
		}
	});
	return deferred.promise;
};

utils.searchVenuesByQueryAndNear = function (near, query, offset) {
	var deferred = Q.defer();
	factual.get('/t/places-us', {filters:{"name":{"$search": query}, "$or": [{"locality": {"$search": near}}, {"region": {"$search": near}}], "category_ids":{"$includes_any":[308, 107]}}, sort:"$relevance", limit: 50, offset: offset}, function (err, res) {
		if(err) {
			console.log(err);
			deferred.reject(err);
		} else {
			console.log(res.data);
			deferred.resolve(res.data);
		}
	});
	return deferred.promise;
};

utils.getFactualIDFromFoursquareID = function (foursquareID) {
	console.log(foursquareID);
	var deferred = Q.defer();

	factual.get('/t/crosswalk?filters={"namespace":"foursquare", "namespace_id":"' + foursquareID  + '"}', function (err, res) {
		if(err) {
			console.log(err);
			deferred.reject(err);
		} else {
			
		console.log(res.data);
  	deferred.resolve(res.data);
		}
  });

  return deferred.promise;
};

utils.findVenuesByNameWithinGeolocationBounds = function(query, geoCoordinates) {
	var deferred = Q.defer();
	factual.get('/t/places-us', {filters:{"name":{'$search': query}}, limit:50, geo:{"$circle":{"$center": geoCoordinates,"$meters": 5000}}, select: 'name, address'}, function (err, res) {
		if(err) {
			console.log(err);
			deferred.reject(err);
		} else {
			deferred.resolve(res.data);
		}
	});
	return deferred.promise;
	//the following query return places matching the name of category label in addition to name--may be used in future
	//filters:{"$or":[{"name":{'$search': query}}, {"category_labels":{"$includes":{"$bw":query}}}]}
};

utils.findRestaurantsByCategoryAndLocationTerm = function () {

};

utils.getFoursquareIDFromFactualID = function (factualID) {
	console.log(factualID);
	var deferred = Q.defer();

	factual.get('/t/crosswalk?filters={"factual_id":"' + factualID + '", "namespace": "foursquare"}', function (err, res) {
		if(err) {
			console.log(err);
			deferred.reject(err);
		} else {
			console.log(res.data);
			if(res.data.length) {
				for(i = 0; i < res.data.length; i++) {
					if(res.data[i].namespace_id) {
						//resolve with first defined namespace_id
						deferred.resolve(res.data[i].namespace_id);
						break;
					}
				}
			}
			//return empty array if !res.data.length or if namespace_id not provided
	  	deferred.resolve([]);
		}
  });

  return deferred.promise;
};

module.exports = utils;