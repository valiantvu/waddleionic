var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://' + process.env['WADDLE_MONGOLAB_USERNAME'] + ':' + process.env['WADDLE_MONGOLAB_PASSWORD'] + '@ds027719.mongolab.com:27719/heroku_pchnmstb';

var User = {};

var insertDocument = function(db, callback) {
	console.log('this be my document');
   db.collection('checkins').insertOne( {
      "address" : {
         "street" : "2 Avenue",
         "zipcode" : "10075",
         "building" : "1480",
         "coord" : [ -73.9557413, 40.7720266 ],
      },
      "borough" : "Manhattan",
      "cuisine" : "Italian",
      "grades" : [
         {
            "date" : new Date("2014-10-01T00:00:00Z"),
            "grade" : "A",
            "score" : 11
         },
         {
            "date" : new Date("2014-01-16T00:00:00Z"),
            "grade" : "B",
            "score" : 17
         }
      ],
      "name" : "Vella",
      "restaurant_id" : "41704620"
   }, function(err, result) {
    assert.equal(err, null);
    console.log("Inserted a document into the restaurants collection.");
    callback(result);
  });
};

User.insertDocument = function () {
	console.log('inserting document');
	console.log(url);
	MongoClient.connect(url, function(err, db) {
	  assert.equal(null, err);
	  insertDocument(db, function() {
	      db.close();
	  });
	});
};

module.exports = User;