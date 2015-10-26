var https = require('https');
var _ = require('lodash');
var Q = require('q');
var request = require('request');
var qs = require('querystring');
var uuid = require('node-uuid');
var mongoTag = require('../../server/api/mongo/tagModel.js');
var tagList = require('../../server/utils/discoverTags.js').list;

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
    });
  }).on('error', function(err) {
    deferred.reject(err);
  });

  return deferred.promise;
};

helpers.buildFactualSearchQuery = function (searchParams) {
  var query = {};
  query.apiSource = searchParams.apiSource;
  query.body = {};
  query.body.filters = {};
  //whether or not to search via places in user's network, or via factual
  if(searchParams.shouldFilterRatedPlaces) {
    query.body.filters.factual_id = {"$in": searchParams.ratedPlaces};
  } else if (searchParams.ratedPlaces.length > 0) {
    query.body.filters.factual_id = {"$nin": searchParams.ratedPlaces};
  }

  if(searchParams.lat && searchParams.lng && searchParams.rad) {
    query.body.geo = {
      "$circle":{
        "$center": [searchParams.lat, searchParams.lng],
        "$meters": searchParams.rad
      }
    };
  }
  if(searchParams.neighborhood && searchParams.city && searchParams.state) {
    if(Array.isArray(searchParams.neighborhood) && searchParams.neighborhood.length > 1) {
      query.body.filters.neighborhoods = {"$includes_any": searchParams.neighborhoods};
    } else {
      query.body.filters.neighborhoods = {"$includes": searchParams.neighborhoods[0]};
    }
    query.body.filters.locality = searchParams.city;
    query.body.filters.region = searchParams.state;
  }
  else if(searchParams.city && searchParams.state) {
    query.body.filters.locality = searchParams.city;
    query.body.filters.region = searchParams.state;
  }

  if(query.apiSource === 'places') {
    console.log('categories');
    if(Array.isArray(searchParams.categories) && searchParams.categories.length > 1) {
      query.body.filters.category_labels= {"$includes_any": searchParams.categories};  
    } else {
      query.body.filters.category_labels= {"$includes": searchParams.categories}; 
    }
  }
  else if(query.apiSource === 'restaurants') {
    console.log('cuinese');

    if(Array.isArray(searchParams.categories) && searchParams.categories.length > 1) {
      query.body.filters.cuisine= {"$includes_any": searchParams.categories};  
    } else {
      query.body.filters.cuisine= {"$includes": searchParams.categories}; 
    }
  }

  if(searchParams.apiSource === 'restaurants' && searchParams.price) {
    if(Array.isArray(searchParams.price) && searchParams.price.length > 1) {
      query.body.filters.cuisine= {"$includes_any": searchParams.categories}; 
    } else {
      query.body.filters.cuisine= {"$includes": searchParams.price}; 
    }
  }

  if(searchParams.apiSource === 'restaurants' && searchParams.attr) {
    searchParams.attr = query.body.filters[searchParams.attr] = true;
  }

  if(searchParams.sort === 'rating') {
    query.body.sort = "placerank:desc";
  } else if (searchParams.sort === 'distance') {
    query.body.sort = "$distance";
  }
  return query;
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
    });
    deferred.resolve(cityProvinceAndCountryData);
  })
  .catch(function (err) {
    deferred.reject(err);
  });
  return deferred.promise;
};

helpers.addCityProvinceAndCountryInfoToParsedCheckins = function (parsedCheckins) {
  var deferred = Q.defer();
  var geocodeQueries = [];
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
    });
    deferred.resolve(parsedCheckins);
  })
  .catch(function (err) {
      deferred.reject(err);
  });

  return deferred.promise;
};

helpers.addMetaDataToNativeCheckin = function (nativeCheckin) {
  nativeCheckin.checkinID = uuid.v4();
  nativeCheckin.source = 'waddle';
  nativeCheckin.pointValue = 8;
  nativeCheckin.createdAt = new Date().getTime();
  if (nativeCheckin.footprintCaption) {
    nativeCheckin.pointValue += 3;
  }
  //TODO: figure out how to generate different size images from AWS url
  if (nativeCheckin.photo) {
    nativeCheckin.pointValue += 3;
  }
  return nativeCheckin;
};

helpers.parseNativeCheckinForNeo4j = function (venue) {
  // var deferred = Q.defer();

  // var formattedCheckin = {
  //     'checkinID': uuid.v4(),
  //     'checkinTime': new Date(),
  //     'factualID': venue.factualVenueData.factual_id,
  //     'photo': 'null',
  //     'photoWidth': 'null',
  //     'photoHeight': 'null',
  //     'foursquareID': 'null',
  //     'likes': 'null',
  //     'photoSmall': 'null',
  //     'photoLarge': 'null',
  //     'caption': 'null',
  //     'pointValue': 5,
  //     'source': 'waddle',
  //     'rating': 0
  //     'name':
  //     'latitude':
  //     'longitude':
  //     'postalcode':
  //     'address':
  //     'locality':
  //     'region':
  //     'email': 

  //   },
  //   place: venue.factualVenueData
  // };

  if (venue.footprintCaption) {
    formattedCheckin.caption = venue.footprintCaption;
    formattedCheckin.pointValue += 3;
  }

  if (venue.rating > 0) {
    formattedCheckin.rating = venue.rating;
    formattedCheckin.pointValue += 3;
  }

  //TODO: figure out how to generate different size images from AWS url
  if (venue.photo) {
    formattedCheckin.checkin.photo = venue.photo;
    formattedCheckin.pointValue += 3;
  }

  return formattedCheckin;

  //find location data--not needed now that factual API is being used
  // helpers.findCityProvinceAndCountry(formattedCheckin.lat, formattedCheckin.lng)
  // .then(function (geocodeData) {
  //   console.log(geocodeData);
  //     if(geocodeData.city) {
  //       formattedCheckin.city = geocodeData.city;
  //     }
  //     if(geocodeData.province) {
  //       formattedCheckin.province = geocodeData.province;
  //     }
  //     if(geocodeData.country) {
  //       formattedCheckin.country = geocodeData.country;
  //     }
  //   deferred.resolve(formattedCheckin);
  // })
  // return deferred.promise;
};

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

//this function can be run any time we want to update the tags collection in mongo
helpers.updateTagsCollection = function() {
  var deferred = Q.defer();
  mongoTag.deleteAllTagsinCollection()
  .then(function (success) {
    console.log(success);
    return mongoTag.saveListOfTags(tagList);
  })
  .then(function (success) {
    console.log(success);
    return mongoTag.createTextIndexOnNameField();
  })
  .catch(function (err) {
    deferred.reject();
    throw err;
  });
  return deferred.promise;
};

module.exports = helpers;
