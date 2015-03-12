var https = require('https');
var _ = require('lodash');
var Q = require('q');

var helpers = {};

helpers.httpsGet = function (queryPath) {
  var deferred = Q.defer();

  https.get(queryPath, function (res) {
    var data = '';
    res.on('data', function(chunk) {
      data += chunk;
    });
    res.on('end', function(){
      deferred.resolve(data);
    })
  }).on('error', function(err) {
    deferred.reject(err);
  });

  return deferred.promise;
};

helpers.findCityProvinceAndCountry = function (lat, lng) {
  var deferred = Q.defer();
  var cityProvinceAndCountryData = {};

  var geocodingQueryPath = 'https://api.tiles.mapbox.com/v4/geocode/mapbox.places-v1/' 
  + lng + ',' + lat + '.json?access_token=pk.eyJ1Ijoid2FkZGxldXNlciIsImEiOiItQWlwaU5JIn0.mTIpotbZXv5KVgP4pkcYrA';

  helpers.httpsGet(geocodingQueryPath)
  .then(function (data) {
    var geocodeData = JSON.parse(data);
    _.each(geocodeData.features, function (feature) {
      if(feature.id.indexOf("city") > -1) {
        cityProvinceAndCountryData.city = feature.text;
      } else if(feature.id.indexOf("province") > -1) {
        cityProvinceAndCountryData.province = feature.text;
      } else if(feature.id.indexOf("country") > -1) {
        cityProvinceAndCountryData.country = feature.text;
      }
    })
    deferred.resolve(cityProvinceAndCountryData);
  })
  .catch(function (err) {
    deferred.reject(err);
  });
  return deferred.promise
}

helpers.addCityProvinceAndCountryInfoToParsedCheckins = function (parsedCheckins) {
  var deferred = Q.defer();
  var geocodeQueries = []
  _.each(parsedCheckins, function (parsedCheckin) {
    geocodeQueries.push(helpers.findCityProvinceAndCountry(parsedCheckin.lat, parsedCheckin.lng));
  });
  Q.all(geocodeQueries)
  .then(function (geocodeData) {
    _.each(parsedCheckins, function (parsedCheckin, index) {
        if(geocodeData[index].city) {
          parsedCheckin.city = geocodeData[index].city;
        }
        if(geocodeData[index].province) {
          parsedCheckin.province = geocodeData[index].province;
        }
        if(geocodeData[index].country) {
          parsedCheckin.country = geocodeData[index].country;
        }
    })
    deferred.resolve(parsedCheckins);
  })
  .catch(function (err) {
      deferred.reject(err);
  })

  return deferred.promise;
}

helpers.parseEditedNativeCheckin = function (editedCheckin) {
  var formattedCheckin = {
    'facebookID': editedCheckin.facebookID,
    'checkinID': editedCheckin.checkinID,
    'photoSmall': 'null',
    'photoLarge': 'null',
    'caption': 'null',
    'pointValue': 5,
    'rating': 0,
  };

  if (editedCheckin.footprintCaption) {
    formattedCheckin.caption = editedCheckin.footprintCaption;
    formattedCheckin.pointValue += 3;
  }

  if (editedCheckin.rating > 0) {
    formattedCheckin.rating = editedCheckin.rating;
    formattedCheckin.pointValue += 3;
  }

  if (editedCheckin.photo) {
    formattedCheckin.photoLarge = editedCheckin.photo;
    formattedCheckin.pointValue += 3;
  }
  return formattedCheckin;
};

module.exports = helpers;
