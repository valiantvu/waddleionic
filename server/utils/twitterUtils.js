var https = require('https');
var qs = require('querystring');

var Q = require('q');
var _ = require('lodash');

var uuid = require('node-uuid');

var helpers = require('./helpers.js');

var User = require('../api/users/userModel.js');

var utils = {};

utils.requestToken = function () {

	var queryPath = 'https://api.twitter.com/oauth/request_token';
	var body = {};
	var headers = {
		oauth_callback: "http://localhost:8000/#/tab/home"
	}

	helpers.httpsPost(queryPath, headers, body)
}

module.exports = utils;