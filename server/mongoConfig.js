var mongoURL = 'mongodb://' + process.env['WADDLE_MONGOLAB_USERNAME'] + ':' + process.env['WADDLE_MONGOLAB_PASSWORD'] + '@ds027719.mongolab.com:27719/heroku_pchnmstb';
var mongo = require('mongoskin');
var db = mongo.db(mongoURL, {native_parser:true});
module.exports = db;
