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
var _ = require('lodash');

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
      neo4jUser.createUniqueUser(neo4jFixtures.testUser).then(function (userNode){
        // console.log(userNode);
        user = userNode.node._data.data;
        userNode.addFriends([neo4jFixtures.testUser2, neo4jFixtures.testUser3]).then(function (friends) {
          userNode.addCheckins(neo4jFixtures.testUserFootprints)
          .then(function (categoryNames) {

            _.each(friends, function(friend, index) {
              // console.log(friend.body);
              neo4jUser.find({facebookID: friend.body.data[0][0].data.facebookID})
                .then(function (friendNode) {
                  friendNode.addCheckins(neo4jFixtures.testFriendFootprints[index])
                    .then(function (results) {
                      // console.log(results);
                    });
                });
            });
            done();
          });
        });
      });

      // TODO
      // Create user in Mongo
    });

    it('should return the information of the specified user', function (done) {
      this.timeout(10000);
      request(app)
      .get('/api/users/userinfo/' + user.facebookID)
      .expect(200)
      .end(function(err, res) {
        if (err) throw err;
        // console.log(res.body);
        expect(res.body.name).to.equal("Testy McTest");
        expect(res.body.facebookID).to.equal("000000000");
        done();
      });
    });
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

describe('Waddle user routes POST requests', function () {
  var testUser = mongoFixtures.users[0];
  // console.log(testUser);
  // var user;
  // before(function(done){
  // });
  it('should add new user on login', function (done) {
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
        console.log('Found test user!');
        console.log(user);
        expect(user.facebookID).to.equal("1376881809284443");
        expect(user.firstName).to.equal("Dorothy");
        expect(user.lastName).to.equal("Bowersstein");
        expect(user.email).to.equal("jqhpyje_bowersstein_1420934246@tfbnw.net");
        expect(user.fbProfilePicture).to.equal("https://fbcdn-profile-a.akamaihd.net/hprofile-ak-xfa1/v/t1.0-1/p200x200/10906299_1377861495853141_9133878358668117315_n.jpg?oh=3e33c1713500cccb7508c75b480a9cb1&oe=56CEC3AD&__gda__=1451839969_fa2fb0666166848bd4da7898faf1a6bd");
        expect(user.coverPhoto).to.equal("https://s-media-cache-ak0.pinimg.com/736x/c2/06/66/c20666fb99564cbe6c64c0ad83f79cd5.jpg");
        expect(user.friends.length).to.equal(2);
        // [ { name: 'Sharon Amhiafjfdbig Laverdetescu',
        //   id: '1376275232679666' },
        // { name: 'Mike Amijcbgfhhdb Adeagboberg',
        //   id: '1378946095749803' } ]
        done();
      });
    });
  });
});