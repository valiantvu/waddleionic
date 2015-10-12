var express = require('express');
var app = express();
var server=require('http').Server(app);
var MongoClient = require('mongodb').MongoClient;
var mongoURL = 'mongodb://' + process.env['WADDLE_MONGOLAB_USERNAME'] + ':' + process.env['WADDLE_MONGOLAB_PASSWORD'] + '@ds027719.mongolab.com:27719/heroku_pchnmstb';
var io = require('socket.io')(server);
var User = require('./api/neo4j/userModel.js');
var Place = require('./api/neo4j/placeModel.js');
var db;

require('./middleware.js')(app, express);

var port = process.env.PORT || 8000;

MongoClient.connect(mongoURL, function(err, database) {
  if(err) throw err;
  console.log(database);

  server.listen(port, function () {
    console.log('Listening on port ' + this.address().port);
  });
});


io.sockets.on('connection', function (socket) {
	console.log('socket connected!');

  socket.on('comment posted', function(commentData) {
  	var commenterName, receiverUserID, footprintPlaceName;
  	User.findLatestCommenterAndCommentOnCheckinByCheckinID(commentData.checkinID)
  	.then(function(commentData) {
  		commenterName = commentData.commenter.data.name;
  		footprintPlaceName = commentData.place.data.name;
  		console.log(commenterName + ' left a comment on your footprint at ' + footprintPlaceName);
      socket.emit('notification', commentData)
  	})
  })
});

// console.log('hello', module.exports.db);

module.exports.app = app;