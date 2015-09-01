var https = require('https');
var _ = require('lodash');
var Q = require('q');
var request = require('request');
var qs = require('querystring');

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

helpers.httpsPost = function (queryPath, headers, body) {
  console.log(queryPath);
  var deferred = Q.defer();

  request.post({
    uri: queryPath,
    headers: headers,
    body: qs.stringify(body)
  }, function (err, res, body) {
       console.log('my posting bodayy', body);
       console.log('my lil res', res);
       console.log(err);
       // console.log(res.statusCode);
       deferred.resolve(body);
  })

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
    'photo': 'null',
    'photoHeight': 'null',
    'photoWidth': 'null',
    'caption': 'null',
    'pointValue': 8,
    'rating': editedCheckin.rating,
  };

  if (editedCheckin.footprintCaption) {
    formattedCheckin.caption = editedCheckin.footprintCaption;
    formattedCheckin.pointValue += 3;
  }

  if (editedCheckin.photo) {
    formattedCheckin.photoLarge = editedCheckin.photo + '/full';
    formattedCheckin.photoSmall = editedCheckin.photo + '/thumb';
    formattedCheckin.photo = editedCheckin.photo;
    formattedCheckin.photoHeight = editedCheckin.photoHeight;
    formattedCheckin.photoWidth = editedCheckin.photoWidth;
    formattedCheckin.pointValue += 3;
  }
  return formattedCheckin;
};

module.exports = helpers;
