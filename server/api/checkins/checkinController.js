var Q = require('q');
var _ = require('lodash');
var aws = require('aws-sdk');
var uuid = require('node-uuid');

var Checkin = require('./checkinModel.js');
var User = require('../users/userModel.js');

var foursquareUtils = require('../../utils/foursquareUtils.js');
var instagramUtils = require('../../utils/instagramUtils.js');
var facebookUtils = require('../../utils/facebookUtils.js');
var categoryList = require('../../utils/categoryList.js');

var checkinController = {};

checkinController.handleNativeCheckin = function (req, res) {
  var user, categories, newFootprint;
  var nativeCheckin = req.body;
  var facebookID = req.body.facebookID;

  User.find({facebookID: facebookID})
  .then(function (userNode) {
    user = userNode;
    return foursquareUtils.parseNativeCheckin(nativeCheckin);
  })
  .then(function (parsedCheckin) {
    console.log('parsedCheckin: ' + JSON.stringify(parsedCheckin));
    return user.addCheckins([parsedCheckin]);
  })
  .then(function (footprint) {
    console.log(footprint);
    newFootprint = footprint
    if(nativeCheckin.folderName) {
      addNativeCheckinToFolder();
    }
    else {
      res.json(newFootprint);
      res.status(201).end();
    }
  })
  // .then(function (categoryData) {
  //   categories = categoryData[0].body.data[0];
  //   console.log('these are the categories: ', categories);
  //   user.assignExpertiseToCategory(categories);
  // })
  .catch(function (err) {
    console.log(err);
    res.status(500).end();
  });


  var addNativeCheckinToFolder = function() {
    Checkin.addToFolder(newFootprint.user.facebookID, newFootprint.checkin.checkinID, nativeCheckin.folderName)
    .then(function (data) {
      newFootprint.folders = {name: nativeCheckin.folderName};
      res.json(newFootprint);
      res.status(201).end();
    })
    .catch(function(err) {
      console.log(err);
      res.status(500).end();
    });
  };

};

checkinController.getVenueInfo = function (req, res) {
  var user;
  var venueID = req.params.venueID;
  var facebookID = req.params.facebookID;

  User.find({facebookID: facebookID})
  .then(function (userNode) {
    user = userNode;
    return foursquareUtils.getVenueInfo(venueID, user)
  })
  .then(function (venueInfo) {
    res.json(venueInfo);
    res.status(200).end()
  })
  .catch(function (err) {
    console.log(err);
    res.status(500).end();
  })
};

checkinController.editNativeCheckin = function (req, res) {
  var editedCheckin = req.body
  var facebookID = req.body.facebookID;
  var checkinID = req.body.checkinID;

  var parsedEditedCheckin = helpers.parseEditedNativeCheckin(req.body);

  Checkin.editNativeCheckin(parsedEditedCheckin)
  .then(function (data) {
    res.status(201).end();
  })
  .catch(function(err) {
    console.log(err);
    res.status(500).end();
  });
};

checkinController.searchFoursquareVenuesWeb = function (req, res) {
  var user, foursquareToken;
  var facebookID = req.params.facebookID;
  var near = req.params.near;
  var query = req.params.query;

  User.find({facebookID: facebookID})
  .then(function (userNode) {
    user = userNode;
    return foursquareUtils.searchFoursquareVenuesWeb(user, near, query);
  })
  .then(function (venues) {
    console.log(JSON.stringify(venues[0]));
    _.each(venues, function(venue) {
      if(venue.location.distance) {
        //convert meters to miles, rounded to the nearest .1 mi;
        miles = Math.round((venue.location.distance * 0.00062137119) * 10) / 10;
        venue.location.distance = miles;
      }
      if(venue.categories[0] && venue.categories[0].name && categoryList.dictionary[venue.categories[0].name]) {
        venue.iconUrlPrefix = categoryList.dictionary[venue.categories[0].name].prefix;
        venue.iconUrlSuffix = categoryList.dictionary[venue.categories[0].name].suffix;
      }
      else {
        venue.iconUrlPrefix = 'https://s3-us-west-2.amazonaws.com/waddle/Badges/uncatagorized-1/uncategorized-';
        venue.iconUrlSuffix = '-2.svg';
      }
    })
    res.json(venues);
  })
  .catch(function (err){
    console.log(err);
    res.status(500).end();
  });
}

checkinController.searchFoursquareVenuesMobile = function (req, res) {
  var user, foursquareToken, miles;
  var facebookID = req.params.facebookID;
  var latlng = req.params.lat + ',' + req.params.lng;

  User.find({facebookID: facebookID})
  .then(function (userNode) {
    user = userNode;
    return foursquareUtils.searchFoursquareVenuesMobile(user, latlng);
  })
  .then(function (venues) {
    _.each(venues, function(venue) {
      if(venue.location.distance) {
        //convert meters to miles, rounded to the nearest .1 mi;
        miles = Math.round((venue.location.distance * 0.00062137119) * 10) / 10;
        venue.location.distance = miles;
      }
      if(venue.categories[0] && venue.categories[0].name && categoryList.dictionary[venue.categories[0].name]) {
        venue.iconUrlPrefix = categoryList.dictionary[venue.categories[0].name].prefix;
        venue.iconUrlSuffix = categoryList.dictionary[venue.categories[0].name].suffix;
      }
      else {
        venue.iconUrlPrefix = 'https://s3-us-west-2.amazonaws.com/waddle/Badges/uncatagorized-1/uncategorized-';
        venue.iconUrlSuffix = '-2.svg';
      }
    })
    res.json(venues);
  })
  .catch(function (err){
    console.log(err);
    res.status(500).end();
  });
}

checkinController.instagramHubChallenge = function (req, res) {
  res.status(200).send(req.query['hub.challenge']);
};

checkinController.handleIGPost = function (req, res) {
  var updateArr = req.body;

  var posts = _.map(updateArr, function (update) {
    return instagramUtils.handleUpdateObject(update);
  })

  Q.all(posts)
  .then(function (postArr) {
    // write to db using batch query?
    console.log(JSON.stringify(postArr));

    var flatPostArr = _.flatten(postArr);

    var queries = _.map(flatPostArr, function (post) {
      return post.user.addCheckins([post.checkin]);
    });

    return Q.all(queries);
  })
  .then(function (data) {
    console.log(JSON.stringify(data));
  })
  .catch(function (e) {
    console.log(e);
  });

  res.status(200).end();
};

checkinController.facebookHubChallenge = function (req, res) {
  res.status(200).send(req.query['hub.challenge']);
};

checkinController.handleFBPost = function (req, res) {
  var updateArr = req.body.entry;
  console.log("dis be ma boday's entray: " + JSON.stringify(updateArr));

  var posts = _.map(updateArr, function(update) {
    return facebookUtils.handleUpdateObject(update);
  });

  Q.all(posts)
    .then(function (postArr) {
      // write to db using batch query?

      var flatPostArr = _.flatten(postArr);

      var queries = [];

      _.each(flatPostArr, function (userObj) {
        console.log('user obj', JSON.stringify(userObj));
        var myUser = userObj.user;
        var myCheckins = userObj.checkins;

        _.each(myCheckins, function (checkin) {
          queries.push(myUser.addCheckins([checkin]));
        });

      });

      return Q.all(queries);
    })
    .then(function (data) {
      console.log(JSON.stringify(data));
    })
    .catch(function (e) {
      console.log(e);
    });
  res.status(200).end();
}


checkinController.realtimeFoursquareData = function (req, res) {
  var checkin = JSON.parse(req.body.checkin);
  var userFoursquareID = checkin.user.id;
  var user;

  User.findByFoursquareID(userFoursquareID)
  .then(function (userNode) {
    user = userNode;
    console.log(checkin);
    return foursquareUtils.parseCheckin(checkin);
  })
  .then(function (parsedCheckin) {
    return helpers.addCityProvinceAndCountryInfoToParsedCheckins([parsedCheckin])
  })
  .then(function (parsedCheckinWithLocationInfo) {
    return user.addCheckins(parsedCheckinWithLocationInfo);
  })
  .then(function (data) {
    console.log(data);
  })
  .catch(function (err) {
    console.log(err);
  });

  res.status(200).end();
};

checkinController.addToBucketList = function (req, res){
  var checkinID = req.body.checkinID;
  var facebookID = req.body.facebookID;

  Checkin.addToBucketList(facebookID, checkinID)
    .then(function (data){
      res.json(data);
      res.status(201).end();
    })
    .catch(function (err) {
      console.log(err);
      res.status(500).end();
    });
};

checkinController.removeFromBucketList = function (req, res){
  var checkinID = req.body.checkinID;
  var facebookID = req.body.facebookID;

  Checkin.removeFromBucketList(facebookID, checkinID)
    .then(function (data){
      res.json(data);
      res.status(201).end();
    })
    .catch(function(err) {
      console.log(err);
      res.status(500).end();
    });
}

checkinController.addComment = function (req, res){
  var clickerID = req.body.clickerID;
  var checkinID = req.body.checkinID;
  var checkinDate = new Date();
  var checkinTime = checkinDate.getTime();
  if (req.body.text) {
    var text = req.body.text;
  } else {
    res.status(404).end()
  }

  Checkin.addComment(clickerID, checkinID, text, checkinTime)
    .then(function (data){
      return Checkin.getComments(checkinID);
    })
    .then(function (commentsArray) {
      console.log('added comment!', commentsArray);
      res.json(commentsArray);
      res.status(201).end();
    })
    .catch(function (err) {
      console.log(err);
      res.status(500).end();
    });
};

checkinController.removeComment = function (req, res){
  var checkinID = req.body.checkinID;
  var facebookID = req.body.facebookID;
  var commentID = req.body.commentID;
 
  Checkin.removeComment(facebookID, checkinID , commentID)
    .then(function (data){
      return Checkin.getComments(checkinID);
    })
    .then(function (commentsArray) {
      console.log('removed comment!', commentsArray);
      res.json(commentsArray);
      res.status(201).end();
    })
    .catch(function(err) {
      console.log(err);
      res.status(500).end();
    });
}

checkinController.addToFolder = function (req, res) {
  var checkinID = req.body.checkinID;
  var facebookID = req.body.facebookID;
  var folderName = req.body.folderName;

  Checkin.addToFolder(facebookID, checkinID, folderName)
    .then(function (data){
      return User.fetchFolderContents(facebookID, folderName, 0, 10)
    })
    .then(function (folderContents) {
      res.json(folderContents);
      res.status(201).end();
    })
    .catch(function(err) {
      console.log(err);
      res.status(500).end();
    })
};

checkinController.removeFromFolder = function (req, res) {
  var checkinID = req.body.checkinID;
  var facebookID = req.body.facebookID;
  var folderName = req.body.folderName;

  Checkin.removeFromFolder(facebookID, checkinID, folderName)
    .then(function (data) {
      return User.fetchFolderContents(facebookID, folderName)
    })
    .then(function (folderContents) {
      res.json(folderContents);
      res.status(201).end();
    })
    .catch(function(err) {
      console.log(err);
      res.status(500).end();
    })
};

checkinController.removeFromFavorites = function (req, res) {
  var checkinID = req.body.checkinID;
  var facebookID = req.body.facebookID;

  Checkin.removeFromFavorites(facebookID, checkinID)
  .then(function (data){
    res.json(data);
    res.status(201).end();
  })
  .catch(function(err) {
    console.log(err);
    res.status(500).end();
  });
}

checkinController.giveProps = function (req, res){
  var clickerID = req.body.clickerID;
  var checkinID = req.body.checkinID;

  Checkin.giveProps(clickerID, checkinID)
    .then(function (data){
      console.log(data)
      res.json(data);
      res.status(201).end();
    })
    .catch(function (err){
      console.log(err);
      res.status(500).end();
    });
};


checkinController.getHypesAndComments = function (req, res){
  var checkinID = req.params.checkinid;
  var parsedData = {}

  Checkin.getHypes(checkinID)
    .then(function (hypesArray){
      parsedData.hypes = hypesArray;
      return Checkin.getComments(checkinID);
    })
    .then(function (commentsArray){
      parsedData.comments = commentsArray;
      console.log(parsedData);
      res.json(parsedData);
      res.status(200).end();
    })
    .catch(function (err){
      console.log(err);
      res.status(500).end();
    });
};

checkinController.deleteFootprint = function (req, res) {
  var facebookID = req.body.facebookID;
  var checkinID = req.body.checkinID;

  Checkin.deleteFootprint(facebookID, checkinID)
    .then(function (data) {
      console.log(data)
      res.json({on_success: "footprint has been successfully deleted"})
      res.status(200).end();
    })
    .catch(function (err) {
      console.log(err);
      res.status(500).end();
    });
};

checkinController.suggestFootprint = function (req, res) {
  var params = req.body;

  Checkin.suggestFootprint(params.senderFacebookID, params.checkinID, params.receiverFacebookID, params.suggestionTime)
  .then(function (data) {
    console.log(data);
    res.json({on_success: "suggestion sent!"})
    res.status(200).end();
  })
  .catch(function (err) {
    console.log(err);
    res.status(500).end();
  });
};

checkinController.sign_s3 = function (req, res) {
  var facebookID = req.params.facebookID;
  var photoSize = req.params.photoSize;
  aws.config.update({accessKeyId: process.env.AWS_ACCESS_KEY, secretAccessKey: process.env.AWS_SECRET_KEY});
  var s3 = new aws.S3();
  // var aws_uuid = uuid.v4();
  var aws_uuid = req.params.photoUUID;
  var s3_params = {
      Bucket: process.env.S3_BUCKET,
      Key: 'user_photos/' + facebookID + '/' + aws_uuid + '/' + photoSize,
      Expires: 60,
      ContentType: req.query.s3_object_type,
      ACL: 'public-read'
  };
  s3.getSignedUrl('putObject', s3_params, function(err, data){
      if(err){
          console.log(err);
      }
      else{
          var return_data = {
              signed_request: data,
              url: 'https://' + s3_params.Bucket + '.s3.amazonaws.com/' + s3_params.Key
          };
          res.write(JSON.stringify(return_data));
          res.end();
      }
  });
}

  //executed once to convert waddle checkins;kept here for future reference
// checkin.convertTime = function (req, res) {

  // Checkin.convertNativeWaddleCheckinTime()
  // .then(function (data) {
  //   var convertedTime = [];
  //    _.each(data, function (datum) {
  //     if(datum['checkin.checkinID'] != '0771b0c0-9822-46a0-8553-6e174c37ff33') {
  //       var newObj = {'checkinID': datum['checkin.checkinID'], 'checkinTime': null};
  //       var newDate = new Date(datum['checkin.checkinTime']);
  //       newObj.checkinTime = newDate;
  //       convertedTime.push(newObj);
  //     }
  //   })
  //   console.log(convertedTime)
  //   return Checkin.updateCheckinTime(convertedTime);
  // })
  // .then(function (data) {
  //   console.log(data)
  // })
  // .catch(function (err) {
  //   console.log(err);
  // })
// }

module.exports = checkinController;
