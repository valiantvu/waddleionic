var express = require('express');
var app = express();
var server=require('http').Server(app);
var io = require('socket.io')(server);
var mongoURL = 'mongodb://' + process.env['WADDLE_MONGOLAB_USERNAME'] + ':' + process.env['WADDLE_MONGOLAB_PASSWORD'] + '@ds027719.mongolab.com:27719/heroku_pchnmstb';
var mongo = require('mongoskin')
var db = mongo.db(mongoURL, {native_parser:true});
var User = require('./api/neo4j/userModel.js');
var Place = require('./api/neo4j/placeModel.js');

require('./middleware.js')(app, express);


var port = process.env.PORT || 8000;

server.listen(port, function () {
	console.log('Listening on port ' + this.address().port);
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
console.log(db);
module.exports.db = db;
module.exports.app = app;