var Q = require('q');
var mongodb = require('./../../mongoConfig.js');
var uuid = require('node-uuid');
var Checkin = {};

Checkin.createCheckin = function(checkin) {
  var deferred = Q.defer();

  mongodb.collection('users').update({facebookID: checkin.facebookID}, {'$push':{checkins: {
    "checkinID" : uuid.v4(),
    "factual_id" : checkin.factualVenueData.factual_id,
    "facebookID" : checkin.facebookID,
    "createdAt": checkin.createdAt,
    "updatedAt": checkin.createdAt,
    "caption" : checkin.footprintCaption,
    "rating" : checkin.rating,
    "photo" : checkin.photo,
    "photoWidth" : checkin.photoWidth,
    "photoHeight" : checkin.photoHeight,
    "source" : checkin.source,
    "pointValue" : checkin.pointValue,
    "likes" : [],
    "comments" : []
  }
}}, function(err, result) {
    if (err) {
      deferred.reject();
      throw err;
    }
    if (result) {
      // console.log(result);
      // console.log('Added checkin!');
      deferred.resolve(result);
    }
  });
  return deferred.promise;
};

var insertCheckinDocument = function(parsedCheckin, db, callback) {
  var deferred = Q.defer();
  console.log('this be my document', parsedCheckin);
  db.collection('checkins').insertOne( {
	  "checkinID" : parsedCheckin.checkinID,
	  "caption" : parsedCheckin.caption,
	  "rating" : parsedCheckin.rating,
	  "photo" : parsedCheckin.photo,
	  "photoWidth" : parsedCheckin.photoWidth,
	  "photoHeight" : parsedCheckin.photoHeight,
	  "photoLarge" : parsedCheckin.photoLarge,
	  "photoSmall" : parsedCheckin.photoSmall,
	  "facebookID" : parsedCheckin.facebookID,
	  "factualID" : parsedCheckin.factualID,
	  "source" : parsedCheckin.source,
	  "pointValue" : parsedCheckin.pointValue
   }, function(err, result) {
    // assert.equal(err, null);
    console.log("Inserted a document into the checkins collection.");
    deferred.resolve(result);
    // callback(result);
  });
  return deferred.promise;
};

var insertPlaceDocument = function(parsedCheckin, db, callback) {
	console.log('inside place doc insertion');
  db.collection('places').update(
  {
    factualID: parsedCheckin.factualID
  },
  {
    hours_display: 'Open Daily 11:00 AM-10:00 PM',
    latitude: 37.575943,
    locality: 'Fremont',
    longitude: -122.044189,
    name: 'BLOOB!!',
    neighborhood: [ 'Ardenwood' ],
    open_24hrs: false,
    postcode: '94555',
    price: 1,
    rating: 3,
    region: 'CA',
    reservations: true,
    tel: '(510) 739-0088',
    website: 'http://www.fremontkungfukitchen.com/'
  },
  {
    'upsert': true
  }, function(err, result) {
    // assert.equal(err, null);
    console.log("Inserted a document into the places collection.");
    callback(result);
  });
};

Checkin.insertDocument = function (parsedCheckin) {
	console.log(mongodb);
	console.log('inserting document');
	// console.log(url);
	// MongoClient.connect(url, function(err, db) {
	//   assert.equal(null, err);
  console.log(mongodb);
  insertCheckinDocument(parsedCheckin, mongodb)
  .then(function() {
    insertPlaceDocument(parsedCheckin, mongodb, function() {
      // db.close();
    });
  });
	// });
};

module.exports = Checkin;