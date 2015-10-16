var chai = require('chai');
var expect = chai.expect;
var request = require('supertest');
var app = require('../../server/server.js').app;
// var server = require('../../server/server.js');
var neo4j = require('neo4j');
var neo4jFixtures = require('../neo4j.test.fixtures.js');
var mongoFixtures = require('../mongo.test.fixtures.js');
var neo4jUser = require('../../server/api/neo4j/userModel.js');
var mongoUser = require('../../server/api/mongo/userModel.js');
var mongoCheckin = require('../../server/api/mongo/checkinModel.js');
var mongoPlace = require('../../server/api/mongo/placeModel.js');
var factualUtils = require('../../server/utils/factualUtils.js');

var _ = require('lodash');
var qs = require('querystring');
var helpers = require('./../../server/utils/helpers.js');
var factualUtils = require('./../../server/utils/factualUtils.js');

// var neo4jurl = WADDLE_GRAPHENEDB_URL || 'http://localhost:7474'
// var db = new neo4j.GraphDatabase(neo4jurl);


// describe('Get request', function() {
//   it('should return something', function (done) {
//     request(app)
//       .get('/')
//       .expect(200, done);
//   })
// });

// describe('Answer Challenges', function() {

//   it('Sends a 200 status to make Facebook happy', function (done) {
//     request(app)
//     .post('/api/checkins/realtimefacebook')
//     .send(neo4jFixtures.IGdata)
//     .expect(200)
//     .end(function(err, res){
//       if (err) throw err;
//       done();
//     })
//   });

//   it('Sends a 200 status to make Instagram happy', function (done) {
//     request(app)
//     .post('/api/checkins/realtimeinstagram')
//     .send(neo4jFixtures.IGdata)
//     .expect(200)
//     .end(function(err, res){
//       if (err) throw err;
//       done();
//     })
//   });
// });

describe('Waddle user routes GET requests', function () {
    var user;
    before(function(done){
      this.timeout(10000);
      // Create user in Neo4j
      // neo4jUser.createUniqueUser(neo4jFixtures.testUser).then(function (userNode){
      //   // console.log(userNode);
      //   user = userNode.node._data.data;
      //   userNode.addFriends([neo4jFixtures.testUser2, neo4jFixtures.testUser3]).then(function (friends) {
      //     userNode.addCheckins(neo4jFixtures.testUserFootprints)
      //     .then(function (categoryNames) {

      //       _.each(friends, function(friend, index) {
      //         // console.log(friend.body);
      //         neo4jUser.find({facebookID: friend.body.data[0][0].data.facebookID})
      //           .then(function (friendNode) {
      //             friendNode.addCheckins(neo4jFixtures.testFriendFootprints[index])
      //               .then(function (results) {
      //                 // console.log(results);
      //               });
      //           });
      //       });
      //       done();
      //     });
      //   });
      // });
      done();
      // TODO
      // Create user in Mongo
    });

    // it('should return the information of the specified user', function (done) {
    //   this.timeout(10000);
    //   request(app)
    //   .get('/api/users/userinfo/' + user.facebookID)
    //   .expect(200)
    //   .end(function(err, res) {
    //     if (err) throw err;
    //     // console.log(res.body);
    //     expect(res.body.name).to.equal("Testy McTest");
    //     expect(res.body.facebookID).to.equal("000000000");
    //     done();
    //   });
    // });
    // it('should return the first 5 footprints aggregate feed of the specified user', function(done) {
    //   request(app)
    //   .get('/aggregatefeed/000000000/0/5')
    //   .expect(200)
    //   .end(function(err, res) {
    //     if (err) throw err;
    //     console.log(res.body);
    //     expect(res.body)
    //   })

    // })
});

describe('User login', function () {
  var testUserFBData;
  var testUser = mongoFixtures.users[0];
  var query = {
    client_id: process.env.WADDLE_FACEBOOK_APP_ID,
    client_secret: process.env.WADDLE_FACEBOOK_APP_SECRET,
    grant_type: 'client_credentials'
  };

  var queryPath = 'https://graph.facebook.com/oauth/access_token?' + qs.stringify(query);
 

  // Retrieve short term access token for test users
  before(function (done){
    helpers.httpsGet(queryPath)
    .then(function (res) {
      helpers.httpsGet('https://graph.facebook.com/898529293496515/accounts/test-users?'+String(res))
      .then(function (res) {
        var testUsers = JSON.parse(res).data;
        var n = testUsers.length - 1;

        // Get fb data for Dorothy Bowersstein
        while(testUserFBData === undefined) {
          var id = testUsers[n].id;
          if (id === '1376881809284443') {
            testUserFBData = testUsers[n];
          }
          n--;
        }
        done();
      });
    });
  });

  it('should add new user on login', function (done) {

    testUser.fbToken = testUserFBData.access_token;
    this.timeout(7000);
    request(app)
    .post('/api/users/userdata/')
    .send(testUser)
    .expect(200)
    .end(function(err, res) {
      if (err) throw err;
      expect(res.body.result.n).to.equal(1);
      mongoUser.findUser({facebookID: testUser.facebookID})
      .then(function(user) {
        // console.log('Found test user!');
        // console.log(user);
        expect(user.facebookID).to.equal("1376881809284443");
        expect(user.firstName).to.equal("Dorothy");
        expect(user.lastName).to.equal("Bowersstein");
        expect(user.email).to.equal("jqhpyje_bowersstein_1420934246@tfbnw.net");
        expect(user.fbProfilePicture).to.equal("https://fbcdn-profile-a.akamaihd.net/hprofile-ak-xfa1/v/t1.0-1/p200x200/10906299_1377861495853141_9133878358668117315_n.jpg?oh=3e33c1713500cccb7508c75b480a9cb1&oe=56CEC3AD&__gda__=1451839969_fa2fb0666166848bd4da7898faf1a6bd");
        expect(user.coverPhoto).to.equal("https://s-media-cache-ak0.pinimg.com/736x/c2/06/66/c20666fb99564cbe6c64c0ad83f79cd5.jpg");
        expect(user.friends.length).to.equal(2);
        done();
      });
    });
  });
});

describe('User footprint post', function () {
  var testFootprint = mongoFixtures.footprints[0];

  before(function (done) {

      done();
  });

  it('should add a document to checkins array when user posts a footprint', function (done) {
    this.timeout(10000);
    request(app)
    .post('/api/checkins/nativecheckin')
    .send(testFootprint)
    .expect(200)
    .end(function(err, res) {
      if (err) throw err;
      mongoCheckin.findCheckin(testFootprint.facebookID, res.body.checkinID)
      .then(function (checkin) {
        expect(checkin.checkins[0]).to.have.property('checkinID', res.body.checkinID);
        expect(checkin.checkins[0]).to.have.property('rating', 3);
        done();
      });
    });
  });

   it('should add a document to user and friends feed array when user posts footprint', function (done) {
    request(app)
    .post('/api/checkins/nativecheckin')
    .send(testFootprint)
    .expect(200)
    .end(function(err, res) {
      if (err) throw err;
      mongoUser.findFeedItem(testFootprint.facebookID, res.body.checkinID)
      .then(function (feedItem) {
        console.log('FEED MEEEE', feedItem);
        expect(feedItem.feed[0]).to.have.property('checkinID', res.body.checkinID);
        expect(feedItem.feed[0]).to.have.property('facebookID', testFootprint.facebookID);
        done();
      });
    });
  });

  it('should add or modify a document in places collection when user posts a footprint', function (done) {
    this.timeout(10000);
    request(app)
    .post('/api/checkins/nativecheckin')
    .send(testFootprint)
    .expect(200)
    .end(function(err, res) {
      if (err) throw err;
      mongoPlace.findPlace(testFootprint.factualVenueData.factual_id)
      .then(function (place) {
        expect(place.factual_id).to.equal("7a739b40-1add-012f-a1ad-003048c87378");
        expect(place.name).to.equal("Sweet Orchid");
        done();
      });
    });
  });
});

describe('Factual geospatial search requests', function () {
  var factualIDs = ['2cd905c4-04ec-497b-b2a0-72c0d9bbe6b1', '20e72644-ab86-4185-af14-9f085df69429'];
  var loc = [37.783601, -122.408643];
  it('should search for nearby factual places matching a list of factual ids', function (done) {
    this.timeout(7000);
    factualUtils.searchVenuesByFactualIDsAndGeolocation(loc, factualIDs)
    .then(function (res) {
      console.log(res);
      var place = res[0];
      expect(place.address).to.equal('25 Mason St');
      // expect(place.category_ids[0]).to.equal(347);
      // expect(place.country).to.equal('us');
      // expect(place.email).to.equal('info@farmerbrownsf.com');
      // expect(place.factual_id).to.equal('20e72644-ab86-4185-af14-9f085df69429');
      // expect(place.hours).to.contain.keys('monday'); // contain.alls.key not working
      expect(place.hours_display).to.equal('Mon-Thu 5:00 PM-10:00 PM; Fri 5:00 PM-11:59 PM; Sat 9:00 AM-2:30 PM, 5:00 PM-11:59 PM; Sun 9:00 AM-2:30 PM, 5:00 PM-10:00 PM');
      expect(place.latitude).to.equal(37.783641);
      expect(place.locality).to.equal('San Francisco');
      expect(place.longitude).to.equal(-122.409233);
      expect(place.name).to.equal('Farmerbrown');
      // expect(place.neighborhood).to.include('Union Square');
      // expect(place.neighborhood).to.include('Tenderloin');
      // expect(place.neighborhood).to.include('Civic Center');
      // expect(place.postcode).to.equal('94102');
      // expect(place.region).to.equal('CA');
      // expect(place.tel).to.equal('\(415\) 409-3276');
      // expect(place.website).to.equal('http://www.farmerbrownsf.com');
      expect(place.$distance).to.equal(52.04011);
      done();
    });
  });
});

