var qs = require('querystring');
var request = require('request');

var Q = require('q');
var _ = require('lodash');

var neo4j = require('neo4j');
var neo4jUrl = process.env['WADDLE_GRAPHENEDB_URL'] || 'http://localhost:7474';
var db = new neo4j.GraphDatabase(neo4jUrl);

var Checkin = require('../checkins/checkinModel.js');
var Place = require('../places/placeModel.js');

// var skipAmount = 500;

// Class to instantiate different users which will inherit prototype functions
var User = function (node){
	this.node = node;
};

User.prototype.id = function(){
	return this.node.id;
};

// Set a single property on a user and automatically save
User.prototype.setProperty = function(property, value) {
  this.node.data[property] = value;
  return this.save();
};

// Set a batch of properties on a user and automatically save
User.prototype.setProperties = function(properties) {
  for (var key in properties){
    if (properties.hasOwnProperty(key)){
      this.node.data[key] = properties[key]
    }
  }
  return this.save();
};

// Find a specific property on an instantiated user
User.prototype.getProperty = function(property) {
  return this.node.data[property];
};

// S
User.prototype.save = function (){
  var deferred = Q.defer();

  this.node.save(function (err, node){
    if (err) { deferred.reject(err); }
    else {
      deferred.resolve(new User(node));
    }
  });

  return deferred.promise;
};

//Primary function to instantiate new users based on facebookID and name
User.createUniqueUser = function (data) {
  var deferred = Q.defer();
  if (!data.facebookID || !data.name){
    deferred.reject(new Error('Requires facebookID and name parameters'))
  }

  var query = [
    'MERGE (user:User {facebookID: {facebookID}})',
    'SET user.name = {name}',
    'RETURN user',
  ].join('\n');

  var params = data;

  db.query(query, params, function (err, results) {
    if (err) { deferred.reject(err); }
    else {
      // console.log(results[0])
      deferred.resolve(new User(results[0]['user']));
    }
  });

  return deferred.promise;
};

// Add friends to a user
// Requires a list of friends that are mapped over and placed into batch request body
User.prototype.addFriends = function(friendsList){
  var deferred = Q.defer();

  var facebookID = this.getProperty('facebookID');

  var query = [
    'MATCH (user:User {facebookID: {facebookID}})',
    'MERGE (friend:User {facebookID: {friendFacebookID}, name: {friendName}})',
    'MERGE (user)-[:hasFriend]->(friend)',
    'MERGE (friend)-[:hasFriend]->(user)',
    'RETURN friend',
  ].join('\n');

  // Map over the friends and return a list of objects
  // ?includeStats=true will give back data added to the db
  var batchRequest = _.map(friendsList, function (friend, index) {
    var singleRequest = {
      'method': "POST",
      'to': "/cypher?includeStats=true",
      'body': {
        'query': query,
        'params': {
          friendName: friend.name,
          friendFacebookID: friend.id,
          facebookID: facebookID
        }
      },
      'id': index
    };

    return singleRequest;
  });

  // Batch requests with request library
  var options = {
    'url': neo4jUrl + '/db/data/batch',
    'method': 'POST',
    'json': true,
    'body': JSON.stringify(batchRequest)
  };

  request.post(options, function(err, response, body) {
    if (err) { deferred.reject(err) }
    else {
      // console.log(body[0].body.data[0][0]);
      // console.log(response);
      deferred.resolve(body);
    }
  });

  return deferred.promise;
};


// Add checkins to a user
// Requires a list of checkins that are mapped over and placed into batch request body
User.prototype.addCheckins = function(combinedCheckins){
  var deferred = Q.defer();
  //need to check for params!
  var facebookID = this.getProperty('facebookID');

/*var query = [
    'MERGE (user:User {facebookID: {facebookID}})',
    'MERGE (user)-[:hasCheckin]->' +
    '(checkin:Checkin {checkinTime: {checkinTime},' +
    'likes: {likes}, photos: {photos}, caption: {caption},' +
    'foursquareID: {foursquareID}})',
    'MERGE (checkin)-[:hasPlace]->' +
    '(place:Place {name: {name}, lat: {lat}, lng: {lng}, country: {country}, category: {category}})',
    'RETURN user, checkin, place',
  ].join('\n');*/

  var query = [
    'MATCH (user:User {facebookID: {facebookID}})',
    'MERGE (checkin:Checkin {checkinID: {checkinID}})',
    'ON CREATE SET checkin = {checkinID: {checkinID}, likes: {likes}, photoSmall: {photoSmall}, photoLarge: {photoLarge}, caption: {caption}, checkinTime: {checkinTime}, pointValue: {pointValue}, rating: {rating}, source: {source}}',
    'ON MATCH SET checkin.checkinTime = {checkinTime}, checkin.likes = {likes}, checkin.photoSmall = {photoSmall}, checkin.photoLarge = {photoLarge}, checkin.caption = {caption}, checkin.rating = {rating}, checkin.source = {source}',
    'MERGE (place:Place {foursquareID: {foursquareID}})',
    'ON CREATE SET place = {name: {name}, foursquareID: {foursquareID}, lat: {lat}, lng: {lng}, country: {country}, province:{province}, city:{city}, category: {category}}',
    'ON MATCH SET place.name = {name}, place.lat = {lat}, place.lng = {lng}, place.country = {country}, place.province = {province}, place.city = {city}, place.category = {category}',
    'MERGE (country:Country {name: {country}})',
    'MERGE (province:Province {name: {province}, country: {country}})',
    'MERGE (city:City {name: {city}, province:{province}, country:{country}})',
    'MERGE (category:Category {name:{category}})',
    'MERGE (user)-[:hasCheckin]->(checkin)',
    'MERGE (checkin)-[:hasPlace]->(place)',
    'MERGE (place)-[:hasCity]->(city)',
    'MERGE (place)-[:hasCategory]->(category)',
    'MERGE (city)-[:hasCountry]->(country)',
    'MERGE (province)-[:hasCountry]->(country)',
    'MERGE (city)-[:hasProvince]->(province)',
    'RETURN user, checkin, place, category',
  ].join('\n');

  // Map over the friends and return a list of objects
  // 'to' can be modified with ?includeStats=true to give back data added to the db
  var batchRequest = _.map(combinedCheckins, function (checkin, index) {

    var singleRequest = {
      'method': "POST",
      'to': "/cypher",
      'body': {
        'query': query,
        'params': checkin
      },
      'id': index
    };

    singleRequest.body.params.facebookID = facebookID;
    return singleRequest;
  });

  var options = {
    'url': neo4jUrl + '/db/data/batch',
    'method': 'POST',
    'json': true,
    'body': JSON.stringify(batchRequest)
  };

  request.post(options, function(err, response, body) {
    if (err) { deferred.reject(err) }
    else {
      deferred.resolve({
        user: body[0].body.data[0][0].data,
        checkin: body[0].body.data[0][1].data,
        place: body[0].body.data[0][2].data,
        category: body[0].body.data[0][3].data
      });
    }
  });
  return deferred.promise;
};

// Find all of a user's friends
// Uses this.getProperty to grab instantiated user's facebookID as query parameter
User.prototype.findAllFriends = function (page, skipAmount) {
  var deferred = Q.defer();

  var query = [
    'MATCH (user:User {facebookID: {facebookID}})-[:hasFriend]->(friend:User)',
    'RETURN friend',
    'ORDER BY friend.name',
    'SKIP { skipNum }',
    'LIMIT { skipAmount }'
  ].join('\n');

  var params = {
    facebookID: this.getProperty('facebookID'),
    skipNum: page ? page * skipAmount : 0,
    skipAmount: skipAmount
  };

  db.query(query, params, function (err, results) {
    if (err) { deferred.reject(err); }
    else {
      var parsedResults = _.map(results, function (friend) {
        return friend.friend._data.data
      })

      deferred.resolve(parsedResults);
    }
  });

  return deferred.promise;
};


User.searchFriends = function (user, friendNameQuery, page, skipAmount) {
  var deferred = Q.defer();

  var query = [
    'MATCH (user:User {facebookID: {facebookID}})-[:hasFriend]->(friend:User)',
    'WHERE friend.name =~ {friendName}',
    'RETURN friend',
    'ORDER BY friend.name',
    'SKIP { skipNum }',
    'LIMIT { skipAmount }'
  ].join('\n');

  var params = {
    facebookID: user,
    friendName: '(?i).*' + friendNameQuery + '.*',
    skipNum: page ? page * skipAmount : 0,
    skipAmount: skipAmount
  };

  db.query(query, params, function (err, results) {
    if (err) { deferred.reject(err); }
    else {
      var parsedResults = _.map(results, function (friend) {
        return friend.friend._data.data
      });
      deferred.resolve(parsedResults);
    }
  });

  return deferred.promise;
}

// Basic query to find all user's checkins
// Uses this.getProperty to grab instantiated user's facebookID as query parameter
User.prototype.findAllCheckins = function (viewer, page, skipAmount) {
  var deferred = Q.defer();

  var page, skipAmount;
  if(arguments[1]) {
    page = arguments[1];
  }
  else {
    page = 0;
  }
   if(arguments[2]) {
    skipAmount = arguments[2];
  }
  else {
    skipAmount = 0;
  }

  var query = [
    'MATCH (user:User {facebookID: {facebookID}})-[:hasCheckin]->(checkin:Checkin)-[:hasPlace]->(place:Place)',
    'OPTIONAL MATCH (place)-[:hasCategory]-(category:Category)',
    'OPTIONAL MATCH (checkin)<-[:gotComment]-(comment:Comment)<-[:madeComment]-(commenter:User)',
    'OPTIONAL MATCH (checkin)<-[connection:containsCheckin]-(folderHype:Folder)<-[:hasFolder]-(hyper:User)',
    'OPTIONAL MATCH (checkin)<-[:containsCheckin]-(folder:Folder)<-[:hasFolder]-(viewer:User {facebookID: {viewerID}})',
    'RETURN user, checkin, place, collect(comment) AS comments, collect(commenter) AS commenters, collect(DISTINCT hyper) AS hypers, collect(DISTINCT folder) AS folders, category',
    'ORDER BY checkin.checkinTime DESC',
    'SKIP { skipNum }',
    'LIMIT { skipAmount }'
  ].join('\n');

  if(skipAmount > 0) {
    query.concat('\n', 'LIMIT { skipAmount }');
  }

  var params = {
    facebookID: this.getProperty('facebookID'),
    viewerID: viewer
  };
  params['skipAmount'] = skipAmount;
  params['skipNum'] = page ? page * skipAmount : 0;



  db.query(query, params, function (err, results) {
    if (err) { deferred.reject(err); }
    else {
      var parsedResults = _.map(results, function (item) {
        
        var singleResult = {
          "user": item.user.data,
          "checkin": item.checkin.data,
          "place": item.place.data
        };

        if(item.category) {
          singleResult.category = item.category.data;
        }

        if(item['comments'].length && item['commenters'].length) {
          var commentsArray = [];
          for(var i = 0; i < item['comments'].length; i++) {
            var commentData = {
              comment: item['comments'][i].data,
              commenter: item['commenters'][i].data
            }
            // console.log(commentData);
            //removed DISTINCT modifier on collect(comment)--this is an temporary solution to remove duplicate comments
            if(!commentsArray.length) {
              commentsArray.push(commentData);
            } else if(commentsArray[commentsArray.length - 1].comment.commentID !== commentData.comment.commentID) {
              commentsArray.push(commentData);
            }
          }
          var sortedComments = _.sortBy(commentsArray, function(commentObj) {
            return commentObj.comment.time;
          });
          singleResult.comments = sortedComments;
        }


        if(item['hypers'].length) {
          var hypesArray = [];
          for(var i = 0; i < item['hypers'].length; i++) {

            hypesArray.push({hypeGiver: item['hypers'][i].data});
          }
          singleResult.hypes = hypesArray;
        }

        if(item['folders'].length) {
          var foldersArray = [];
           for(var i = 0; i < item['folders'].length; i++) {
            foldersArray.push(item['folders'][i].data);
          }
          singleResult.folders = foldersArray;
        }

        return singleResult
      });
      deferred.resolve(parsedResults);
    }
  });

  return deferred.promise;
};

User.prototype.countAllCheckins = function (facebookID) {
  var deferred = Q.defer();

  var query = [
    'MATCH (user:User {facebookID: {facebookID}})-[:hasCheckin]->(checkin:Checkin)',
    'RETURN count(checkin)'
  ].join('\n');

  var params = {
    facebookID: this.getProperty('facebookID')
  }

  db.query(query, params, function (err, results) {
    if (err) { deferred.reject(err); }
    else {
      deferred.resolve(results[0]['count(checkin)']);
    }
  });

  return deferred.promise;
}

User.prototype.getAggregatedFootprintList = function (viewer, page, skipAmount) {
  console.log('getAggregatedFootprintList', skipAmount);
  var deferred = Q.defer();

  var query = [
    'MATCH (user:User {facebookID: {facebookID}})-[:hasFriend*0..1]->(friend:User)-[:hasCheckin]->(checkin:Checkin)-[:hasPlace]->(place:Place)',
    'OPTIONAL MATCH (place)-[:hasCategory]-(category:Category)',
    'OPTIONAL MATCH (checkin)<-[:gotComment]-(comment:Comment)<-[:madeComment]-(commenter:User)',
    'OPTIONAL MATCH (checkin)<-[:containsCheckin]-(folderHype:Folder)<-[:hasFolder]-(hyper:User)',
    'OPTIONAL MATCH (checkin)<-[:containsCheckin]-(folder:Folder)<-[:hasFolder]-(user)',
    'RETURN user, friend, checkin, place, category, collect(comment) AS comments, collect(commenter) AS commenters, collect(DISTINCT hyper) AS hypers, collect(DISTINCT folder) AS folders',
    'ORDER BY checkin.checkinTime DESC',
    'SKIP { skipNum }',
    'LIMIT { skipAmount }'
  ].join('\n');

  // if(skipAmount > 0) {
  //   query.concat('\n', 'LIMIT { skipAmount }');
  // }

  var params = {
    facebookID: this.getProperty('facebookID'),
    skipNum: page ? page * skipAmount : 0,
    skipAmount: skipAmount
  };

  db.query(query, params, function (err, results) {
    if (err) { deferred.reject(err); }
    else {
      var parsedResults = _.map(results, function (item) {
        console.log('comments', item['comments']);
        console.log('commenters', item['commenters']);
        var singleResult = {
          "user": item.user.data,
          "checkin": item.checkin.data,
          "place": item.place.data,
        };

        if(item.category) {
          singleResult.category = item.category.data;
        }

        if(item['comments'].length && item['commenters'].length) {
          var commentsArray = [];
          for(var i = 0; i < item['comments'].length; i++) {
            var commentData = {
              comment: item['comments'][i].data,
              commenter: item['commenters'][i].data
            }
            // console.log(commentData);
            //removed DISTINCT modifier on collect(comment)--this is an temporary solution to remove duplicate comments
            if(!commentsArray.length) {
              commentsArray.push(commentData);
            } else if(commentsArray[commentsArray.length - 1].comment.commentID !== commentData.comment.commentID) {
              commentsArray.push(commentData);
            }
          }
          var sortedComments = _.sortBy(commentsArray, function(commentObj) {
            return commentObj.comment.time;
          });
          singleResult.comments = sortedComments;
        }


        if(item['hypers'].length) {
          var hypesArray = [];
          for(var i = 0; i < item['hypers'].length; i++) {
            hypesArray.push({hypeGiver: item['hypers'][i].data});
          }
          singleResult.hypes = hypesArray;
        }

        if(item['folders'].length) {
          var foldersArray = [];
           for(var i = 0; i < item['folders'].length; i++) {
            foldersArray.push(item['folders'][i].data);
          }
          singleResult.folders = foldersArray;
        }

        if(item.friend) {
          singleResult["user"] = item.friend.data;
        }

        return singleResult;
      });

      deferred.resolve(parsedResults);
    }
  });

  return deferred.promise;
}

User.findFootprintsByPlaceName = function (facebookID, placeName, page, skipAmount) {
  var deferred = Q.defer();

  var query = [
    'MATCH (user:User{facebookID:{facebookID}})-[:hasCheckin]->(checkin:Checkin)-[:hasPlace]->(place:Place)',
    'WHERE place.name =~ {placeName} OR place.city =~ {placeName} OR place.country =~ {placeName}',
    'OPTIONAL MATCH (place)-[:hasCategory]->(category:Category)',
    'OPTIONAL MATCH (checkin)<-[:gotComment]-(comment:Comment)<-[:madeComment]-(commenter:User)',
    'OPTIONAL MATCH (checkin)<-[:hasBucket]-(hyper:User)',
    'RETURN user, checkin, place, category, collect(DISTINCT comment) AS comments, collect(commenter) AS commenters, collect(DISTINCT hyper) AS hypers',
    'ORDER BY checkin.checkinTime DESC',
    'SKIP { skipNum }',
    'LIMIT { skipAmount }'
  ].join('\n');

  //params.placeName includes regexp to search nodes containing placeName string. (?i) makes query case insensitive
  var params = {
    facebookID: facebookID,
    placeName: '(?i).*' + placeName + '.*',
    skipNum: page ? page * skipAmount : 0,
    skipAmount: skipAmount
  };

  console.log('dis b ma params:', params);

  db.query(query, params, function (err, results) {
    if (err) {
      deferred.reject(err);
    }
    else {
      var parsedResults = _.map(results, function (item) {
        
        var singleResult = {
          "place": item.place.data,
          "checkin": item.checkin.data,
          "user": item.user.data
        }

        if(item.category) {
          singleResult.category = item.category.data;
        }

        if(item['comments'].length && item['commenters'].length) {
          var commentsArray = [];
          for(var i = 0; i < item['comments'].length; i++) {
            var commentData = {
              comment: item['comments'][i].data,
              commenter: item['commenters'][i].data
            }
            commentsArray.push(commentData);
          }

          singleResult.comments = commentsArray;
          console.log('singleResult: ', singleResult.comments);

        }

        if(item['hypers'].length) {
          var hypesArray = [];
          for(var i = 0; i < item['hypers'].length; i++) {
            hypesArray.push(item['hypers'][i].data);
          }
          singleResult.hypes = hypesArray;
        }

        if (item.liker){
          singleResult.checkin.liked = true;
        }
        if (item.bucketer){
          singleResult.checkin.bucketed = true;
        }
        return singleResult
      });
      deferred.resolve(parsedResults);

    }
  })
  return deferred.promise;
}

User.prototype.assignExpertiseToCategory = function (categoryList) {
  var deferred = Q.defer();
  var facebookID = this.getProperty('facebookID');

  var query = [
    'MATCH (user:User{facebookID:{facebookID}})-[:hasCheckin]->(checkin:Checkin)-[:hasPlace]->(place:Place)-[:hasCategory]->(category:Category{name:{categoryName}})', 
    'WITH sum(checkin.pointValue) AS points',
    'MATCH (user:User{facebookID:{facebookID}})', 
    'MATCH (category:Category{name:{categoryName}})', 
    'MERGE (user)-[expertise:hasExpertise]->(category)', 
    'ON CREATE SET expertise.pointValue = points', 
    'ON MATCH SET expertise.pointValue = points',
    'RETURN user, category, expertise.pointValue'
  ].join('\n');

  var batchRequest = _.map(categoryList, function (categoryName, index) {

    var singleRequest = {
      'method': "POST",
      'to': "/cypher",
      'body': {
        'query': query,
        'params': {
          categoryName: categoryName,
          facebookID: facebookID
        }
      },
      'id': index
    };

    // singleRequest.body.params.facebookID = facebookID;
    // singleRequest.body.params.categoryName = categoryName;
    console.log(singleRequest.body.params);
    return singleRequest;
  });

  var options = {
    'url': neo4jUrl + '/db/data/batch',
    'method': 'POST',
    'json': true,
    'body': JSON.stringify(batchRequest)
  };

  request.post(options, function(err, response, body) {
    if (err) { deferred.reject(err) }
    else {
      deferred.resolve(body);
    }
  });
  return deferred.promise;
}

User.findFeedItemsByPlaceName = function (facebookID, placeName, page, skipAmount) {
  var deferred = Q.defer();

  var query = [
    'MATCH (user:User {facebookID: {facebookID}})-[:hasFriend*0..1]->(friend:User)-[:hasCheckin]->(checkin:Checkin)-[:hasPlace]->(place:Place)',
    'WHERE place.name =~ {placeName} OR place.city =~ {placeName} OR place.country =~ {placeName}',
    'OPTIONAL MATCH (place)-[:hasCategory]->(category:Category)',
    'OPTIONAL MATCH (checkin)<-[:gotComment]-(comment:Comment)<-[:madeComment]-(commenter:User)',
    'OPTIONAL MATCH (checkin)<-[:hasBucket]-(hyper:User)',
    'RETURN friend, checkin, place, category, collect(comment) AS comments, collect(commenter) AS commenters, collect(hyper) AS hypers',
    'ORDER BY checkin.checkinTime DESC',
    'SKIP { skipNum }',
    'LIMIT { skipAmount }'
  ].join('\n');

  //params.placeName includes regexp to search nodes containing placeName string. (?i) makes query case insensitive
  var params = {
    facebookID: facebookID,
    placeName: '(?i).*' + placeName + '.*',
    skipNum: page ? page * skipAmount : 0,
    skipAmount: skipAmount
  };

  console.log('dis b ma params:', params);

  db.query(query, params, function (err, results) {
    if (err) {
      deferred.reject(err);
    }
    else {
      var parsedResults = _.map(results, function (item) {
        
        var singleResult = {
          "place": item.place.data,
          "checkin": item.checkin.data,
          "user": item.friend.data
        }

        if(item.category) {
          singleResult.category = item.category.data;
        }

        if(item['comments'].length && item['commenters'].length) {
          var commentsArray = [];
          for(var i = 0; i < item['comments'].length; i++) {
            var commentData = {
              comment: item['comments'][i].data,
              commenter: item['commenters'][i].data
            }
            commentsArray.push(commentData);
          }

          singleResult.comments = commentsArray;
          console.log('singleResult: ', singleResult.comments);

        }

        if(item['hypers'].length) {
          var hypesArray = [];
          for(var i = 0; i < item['hypers'].length; i++) {
            hypesArray.push(item['hypers'][i].data);
          }
          singleResult.hypes = hypesArray;
        }

        if (item.liker){
          singleResult.checkin.liked = true;
        }
        if (item.bucketer){
          singleResult.checkin.bucketed = true;
        }
        return singleResult
      });
      deferred.resolve(parsedResults);

    }
  })
  return deferred.promise;
}

User.prototype.updateNotificationReadStatus = function () {
  var deferred = Q.defer();

  var query = [
    'MATCH (user:User {facebookID: {facebookID}})-[:hasCheckin]->(checkin:Checkin)-[unread:hasUnreadNotification]->(n)',
    'WHERE n:Comment OR n:Folder OR n:Suggestion',
    'MERGE (checkin)-[read:hasReadNotification]->(n)',
    'ON CREATE SET read.createdAt = unread.createdAt',
    'DELETE unread',
    'RETURN user, n, read'
  ].join('\n');

  var params = {
    facebookID: this.getProperty('facebookID')
  };

 db.query(query, params, function (err, results) {
    if (err) { deferred.reject(err); }
    else {
      deferred.resolve(results);
      console.log('query executed!')
    }
  });

  return deferred.promise;
}

User.prototype.getUnreadNotifications = function (page, skipAmount) {
  var deferred = Q.defer();

  var query = [
    'MATCH (user:User {facebookID: {facebookID}})-[:hasCheckin*0..1]->(checkin:Checkin)-[unread:hasUnreadNotification]->(n)',
    'WHERE n:Comment OR n:Folder OR n:Suggestion',
    'MATCH (notificationGiver:User)-[m:madeComment|hasFolder|gaveSuggestion]-(n)',
    'OPTIONAL MATCH (n)-[:beenSuggested*0..1]->(checkin)-[:hasPlace]->(place:Place)-[:hasCategory]->(category:Category)',
    'OPTIONAL MATCH (n)-[receivedSuggestion:receivedSuggestion]->(suggestionReceiver:User)',
    'WHERE receivedSuggestion.suggestionID = n.suggestionID',
    'RETURN user, n, checkin, place, category, notificationGiver, unread.createdAt, suggestionReceiver',
    'ORDER BY unread.createdAt DESC',
    'SKIP { skipNum }',
    'LIMIT { skipAmount }'
  ].join('\n');

  var params = {
    facebookID: this.getProperty('facebookID'),
    skipNum: page ? page * skipAmount : 0,
    skipAmount: skipAmount
  };

    db.query(query, params, function (err, results) {
    if (err) { deferred.reject(err); }
    else {
      var parsedResults = _.map(results, function (item) {
        var singleResult = {user: item.user.data};

        if(item.notificationGiver) {
          singleResult.notificationGiver = item.notificationGiver.data;
        }
        if(item.n) {
          singleResult.notificationTrigger = item.n.data;
          singleResult.notificationTrigger.createdAt = item['unread.createdAt'];
          //change display message on client depending on whether notificationTrigger is a comment or save to folder
          if(singleResult.notificationTrigger.name) {
            singleResult.notificationTrigger.message1 = "saved your footprint at"
            singleResult.notificationTrigger.message2 = "to their folder " + '"' + singleResult.notificationTrigger.name + '"';
          }
          if(singleResult.notificationTrigger.text) {
            singleResult.notificationTrigger.message1 = "commented on"
            singleResult.notificationTrigger.message2 = '"' + singleResult.notificationTrigger.text + '"';
          }
          if(singleResult.notificationTrigger.suggestionTime && item.suggestionReceiver.data) {
            singleResult.notificationTrigger.message1 = "suggested your footprint at"
            console.log('ma suggestion bitchhh', item.suggestionReceiver);
            singleResult.notificationTrigger.message2 = "to their friend, " + item.suggestionReceiver.data.name + ".";
          }
        }
        if(item.checkin) {
          singleResult.checkin = item.checkin.data;
        }
        if(item.place) {
          singleResult.place = item.place.data;
        }
        if (item.category) {
          singleResult.category = item.category.data;
        }

        return singleResult;
      });
      deferred.resolve(parsedResults);
    }
  });
  return deferred.promise;
}

User.prototype.getReadNotifications = function (page, skipAmount) {
  var deferred = Q.defer();

  var query = [
    'MATCH (user:User {facebookID: {facebookID}})-[:hasCheckin*0..1]->(checkin:Checkin)-[read:hasReadNotification]->(n)',
    'WHERE n:Comment OR n:Folder OR n:Suggestion',
    'MATCH (notificationGiver:User)-[m:madeComment|hasFolder|gaveSuggestion]-(n)',
    'OPTIONAL MATCH (checkin)-[:hasPlace]->(place:Place)-[:hasCategory]->(category:Category)',
    'OPTIONAL MATCH (n)-[:beenSuggested]->(checkin)-[:hasPlace]->(place:Place)-[:hasCategory]->(category:Category)',
    'OPTIONAL MATCH (n)-[receivedSuggestion:receivedSuggestion]->(suggestionReceiver:User)',
    'WHERE receivedSuggestion.suggestionID = n.suggestionID',
    'RETURN user, n, checkin, place, category, notificationGiver, read.createdAt, suggestionReceiver',
    'ORDER BY read.createdAt DESC',
    'SKIP { skipNum }',
    'LIMIT { skipAmount }'
  ].join('\n');

  var params = {
    facebookID: this.getProperty('facebookID'),
    skipNum: page ? page * skipAmount : 0,
    skipAmount: skipAmount
  };

    db.query(query, params, function (err, results) {
    if (err) { deferred.reject(err); }
    else {
      var parsedResults = _.map(results, function (item) {
        var singleResult = {user: item.user.data};

        if(item.notificationGiver) {
          singleResult.notificationGiver = item.notificationGiver.data;
        }
        if(item.n) {
          singleResult.notificationTrigger = item.n.data;
          singleResult.notificationTrigger.createdAt = item['read.createdAt'];
          //change display message on client depending on whether notificationTrigger is a comment or save to folder
          if(singleResult.notificationTrigger.name) {
            singleResult.notificationTrigger.message1 = "saved your footprint at"
            singleResult.notificationTrigger.message2 = "to their folder " + '"' + singleResult.notificationTrigger.name + '"';
          }
          if(singleResult.notificationTrigger.text) {
            singleResult.notificationTrigger.message1 = "commented on"
            singleResult.notificationTrigger.message2 = '"' + singleResult.notificationTrigger.text + '"';
          }
          if(singleResult.notificationTrigger.suggestionTime && item.suggestionReceiver.data) {
            singleResult.notificationTrigger.message1 = "suggested your footprint at"
            console.log('ma suggestion bitchhh', item.suggestionReceiver);
            singleResult.notificationTrigger.message2 = "to their friend, " + item.suggestionReceiver.data.name + ".";
          }
        }
        if(item.checkin) {
          singleResult.checkin = item.checkin.data;
        }
        if(item.place) {
          singleResult.place = item.place.data;
        }
        if (item.category) {
          singleResult.category = item.category.data;
        }

        return singleResult;
      });
      deferred.resolve(parsedResults);
    }
  });
  return deferred.promise;
}

// Find all bucketList items for a user
// Takes a facebookID and returns a footprint object with
// checkin and place keys, containing checkin and place data
User.getBucketList = function (facebookID, page, skipAmount){
  var deferred = Q.defer();

  var query = [
    'MATCH (user:User {facebookID: {facebookID}})-[:hasBucket]->(checkin:Checkin)-[:hasPlace]->(p:Place)',
    'OPTIONAL MATCH (checkin)<-[:gotComment]-(comment:Comment)<-[:madeComment]-(commenter:User)',
    'OPTIONAL MATCH (checkin)<-[:hasBucket]-(hyper:User)',
    'RETURN user, checkin, p, collect(DISTINCT comment) AS comments, collect(commenter) AS commenters, collect(hyper) AS hypers',
    'ORDER BY checkin.checkinTime DESC',
    'SKIP { skipNum }', 
    'LIMIT { skipAmount }'
  ].join('\n');

  // if(skipAmount > 0) {
  //   query.concat('\n', 'LIMIT { skipAmount }');
  // }

  var params = {
    'facebookID': facebookID,
    'skipAmount': skipAmount,
    'skipNum': page ? page * skipAmount : 0
  };
  
  db.query(query, params, function (err, results) {
    if (err) { deferred.reject(err); }
    else {
      var parsedResults = _.map(results, function (item) {
        var singleResult = {
          // "user": item.user.data,
          "checkin": item.checkin.data,
          "place": item.p.data,
        }

        if(item['comments'].length && item['commenters'].length) {
          var commentsArray = [];
          for(var i = 0; i < item['comments'].length; i++) {
            var commentData = {
              comment: item['comments'][i].data,
              commenter: item['commenters'][i].data
            }
            commentsArray.push(commentData);
          }
          singleResult.comments = commentsArray;
        }

        if(item['hypers'].length) {
          var hypesArray = [];
          for(var i = 0; i < item['hypers'].length; i++) {
            hypesArray.push(item['hypers'][i].data);
          }
          singleResult.hypes = hypesArray;
        }

        return singleResult;
      });

      deferred.resolve(parsedResults);
    }
  });

  return deferred.promise;
};

User.addFolder = function (facebookID, folderName) {
  var deferred = Q.defer();

  var query = [
    'MATCH (user:User {facebookID:{facebookID}})',
    'MERGE (user)-[:hasFolder]->(folder:Folder {name: {folderName}})',
    'ON CREATE SET folder.name = {folderName}, folder.createdAt = timestamp()',
    'RETURN user, folder'
  ].join('\n');

  var params = {
    facebookID: facebookID,
    folderName: folderName
  };

  db.query(query, params, function (err, results) {
    if (err) { deferred.reject(err); }
    else {
      console.log(results);
      var parsedResults = _.map(results, function (item) {
        var singleResult = {
          "user": item.user.data,
          "folder": item.folder.data
        }
        return singleResult;
      });
      deferred.resolve(parsedResults);
    }
  });

  return deferred.promise;
};

User.fetchFolders = function(facebookID, page, skipAmount) {
  var deferred = Q.defer();
  var receivedSuggestionsCount;

  var query = [
    'MATCH (user:User {facebookID: {facebookID}})-[:hasFolder]->(folder:Folder)',
    'OPTIONAL MATCH (folder)-[contains:containsCheckin]->(checkin:Checkin)',
    'OPTIONAL MATCH (user)<-[receivedSuggestion:receivedSuggestion]-(suggestion:Suggestion)',
    'RETURN user, folder, count(DISTINCT contains) AS checkinCount, count(DISTINCT receivedSuggestion) AS receivedSuggestionsCount',
    'ORDER BY folder.createdAt DESC',
    'SKIP { skipNum }', 
    'LIMIT { skipAmount }'
  ].join('\n');

  var params = {
    'facebookID': facebookID,
    'skipAmount': skipAmount,
    'skipNum': page ? page * skipAmount : 0
  };

  db.query(query, params, function (err, results) {
    if (err) { deferred.reject(err); }
    else {
      console.log(results);
      var parsedResults = _.map(results, function (item) {
        var singleResult = {
          "user": item.user.data,
          "folder": item.folder.data
        }
        if(item.checkinCount) {
          singleResult.folder.checkinCount = item.checkinCount; 
        } else {
          singleResult.folder.checkinCount = 0;
        }
        if(page === 0) {
          if(item.receivedSuggestionsCount) {
            receivedSuggestionsCount = item.receivedSuggestionsCount;
          } else {
            receivedSuggestionsCount = 0;
          }
        }
        return singleResult;
      });
      if(page === 0) {
        parsedResults.unshift({folder: {name:"Suggested By Friends", checkinCount: receivedSuggestionsCount}});
      }
      deferred.resolve(parsedResults);
    }
  });

  return deferred.promise;
};

User.searchFoldersByName = function (facebookID, folderName, page, skipAmount) {
   var deferred = Q.defer();

  var query = [
    'MATCH (user:User {facebookID: {facebookID}})-[:hasFolder]->(folder:Folder)',
    'WHERE folder.name =~ {folderName}',
    'OPTIONAL MATCH (folder)-[contains:containsCheckin]->(checkin:Checkin)',
    'RETURN user, folder, count(contains) AS checkinCount',
    'ORDER BY folder.createdAt DESC',
    'SKIP { skipNum }', 
    'LIMIT { skipAmount }'
  ].join('\n');

   var params = {
    'facebookID': facebookID,
    'folderName': '(?i).*' + folderName + '.*',
    'skipNum': page ? page * skipAmount : 0,
    'skipAmount': skipAmount
  };

  db.query(query, params, function (err, results) {
    
    if (err) { console.log(query); deferred.reject(err); }
    else {
      console.log(results);
      var parsedResults = _.map(results, function (item) {
        var singleResult = {
          "user": item.user.data,
          "folder": item.folder.data
        }
        if(item.checkinCount) {
          singleResult.folder.checkinCount = item.checkinCount; 
        } else {
          singleResult.folder.checkinCount = 0;
        }
        return singleResult;
      });
      deferred.resolve(parsedResults);
    }
  });

  return deferred.promise;
};

User.fetchSuggestedByFriendsContents = function (facebookID, page, skipAmount) {
  var deferred = Q.defer();

  var query = [
    'MATCH (user:User{facebookID:{facebookID}})<-[:receivedSuggestion]-(suggestion:Suggestion)<-[:gaveSuggestion]-(suggester:User)',
    'MATCH (suggestion)-[:beenSuggested]-(checkin:Checkin)-[:hasPlace]->(place:Place)',
    'MATCH (suggestionSource:User)-[:hasCheckin]->(checkin)',
    'RETURN user, suggester, suggestionSource, checkin, place',
    'ORDER BY suggestion.time DESC',
    'SKIP { skipNum }', 
    'LIMIT { skipAmount }'
  ].join('\n');

  var params = {
    'facebookID': facebookID,
    'skipAmount': skipAmount,
    'skipNum': page ? page * skipAmount : 0
  };

  db.query(query, params, function (err, results) {
    if (err) { deferred.reject(err); }
    else {
      console.log(results);
      var parsedResults = _.map(results, function (item) {
        var singleResult = {
          "user": item.suggestionSource.data,
          "suggester": item.suggester.data,
          "checkin": item.checkin.data,
          "place": item.place.data
        }
        return singleResult;
      });
      deferred.resolve(parsedResults);
    }
  });

  return deferred.promise;
}

User.fetchFolderContents = function (facebookID, folderName, page, skipAmount) {
  var deferred = Q.defer();

  var query = [
    'MATCH (user:User {facebookID: {facebookID}})-[:hasFolder]->(folder:Folder {name:{folderName}})-[contains:containsCheckin]->(checkin:Checkin)-[:hasPlace]->(place:Place)',
    'MATCH (checkin)<-[:hasCheckin]-(friend:User)',
    'RETURN friend, folder, checkin, place, contains',
    'ORDER BY contains.createdAt',
    'SKIP { skipNum }', 
    'LIMIT { skipAmount }'
  ].join('\n');

  var params = {
    'facebookID': facebookID,
    'folderName': folderName,
    'skipAmount': skipAmount,
    'skipNum': page ? page * skipAmount : 0
  };

  db.query(query, params, function (err, results) {
    if (err) { deferred.reject(err); }
    else {
      console.log(results);
      var parsedResults = _.map(results, function (item) {
        var singleResult = {
          "user": item.friend.data,
          "folder": item.folder.data,
          "checkin": item.checkin.data,
          "place": item.place.data
        }
        return singleResult;
      });
      deferred.resolve(parsedResults);
    }
  });
  return deferred.promise;
}

User.searchFolderContents = function (facebookID, folderName, searchQuery, page, skipAmount) {
  var deferred = Q.defer();

  var query = [
    'MATCH (user:User {facebookID: {facebookID}})-[:hasFolder]->(folder:Folder {name:{folderName}})-[contains:containsCheckin]->(checkin:Checkin)-[:hasPlace]->(place:Place)',
    'WHERE place.name =~ {searchQuery} OR place.city =~ {searchQuery} OR place.country =~ {searchQuery}',
    'RETURN user, folder, checkin, contains, place',
    'ORDER BY contains.createdAt',
    'SKIP { skipNum }', 
    'LIMIT { skipAmount }'
  ].join('\n');

  var params = {
    'facebookID': facebookID,
    'searchQuery': '(?i).*' + searchQuery + '.*',
    'folderName': folderName,
    'skipAmount': skipAmount,
    'skipNum': page ? page * skipAmount : 0
  };


  db.query(query, params, function (err, results) {
    if (err) { deferred.reject(err); }
    else {
      console.log(results);
      var parsedResults = _.map(results, function (item) {
        var singleResult = {
          "user": item.user.data,
          "folder": item.folder.data,
          "checkin": item.checkin.data,
          "place": item.place.data
        }
        return singleResult;
      });
      deferred.resolve(parsedResults);
    }
  });
  return deferred.promise;
}

User.deleteFolderAndContents = function (facebookID, folderName) {
  var deferred = Q.defer();

  var query = [
    'MATCH (user:User {facebookID: {facebookID}})-[hFolder:hasFolder]->(folder:Folder {name:{folderName}})',
    'OPTIONAL MATCH (folder)-[contains:containsCheckin]->(checkin:Checkin)',
    'DELETE hFolder, folder, contains'
  ].join('\n');

  var params = {
    'facebookID': facebookID,
    'folderName': folderName
  };

  console.log('deleting: ', facebookID, folderName);

  db.query(query, params, function (err, results) {
    if (err) { deferred.reject(err); }
    else {
      deferred.resolve(results);
      console.log('query executed!')
    }
  });

  return deferred.promise;
};

User.fetchSuggestions = function () {
  var deferred = Q.defer();

  var query = [
    'MATCH (user:User{facebookID: {facebookID}})<-[receivedSuggestion:receivedSuggestion]-(suggestion:Suggestion)<-[:beenSuggested]-(checkin:Checkin)',
    'MATCH (creator:User)-[:hasCheckin]->(checkin)-[]->(place:Place)-[:hasCategory]->(category:Category)',
    'MATCH (suggestion)<-[:gaveSuggestion]-(suggester:User)',
    'RETURN suggestion, creator, suggester, checkin, place, category, count(receivedSuggestion) AS receivedSuggestionsCount',
    'ORDER BY suggestion.time',
    'SKIP {skipNum}',
    'LIMIT {skipAmount}'
  ].join('\n');

  var params = {
    'facebookID': facebookID,
    'skipAmount': skipAmount,
    'skipNum': page ? page * skipAmount : 0
  };

  db.query(query, params, function (err, results) {
    if (err) { deferred.reject(err); }
    else {
      console.log(results);
      var parsedResults = _.map(results, function (item) {
        var singleResult = {
          "user": item.user.data,
          "folder": item.folder.data
        }
        if(item.checkinCount) {
          singleResult.folder.checkinCount = item.checkinCount; 
        } else {
          singleResult.folder.checkinCount = 0;
        }
        return singleResult;
      });
      deferred.resolve(parsedResults);
    }
  });

  return deferred.promise;


}

// Find a single user in the database, requires facebookID as input
// If user is not in database, promise will resolve to error 'user does not exist'
User.find = function (data) {

  var deferred = Q.defer();

  var query = [
    'MATCH (user:User {facebookID: {facebookID}})',
    'RETURN user',
  ].join('\n');

  var params = data;

  db.query(query, params, function (err, results) {
    if (err) { 
      console.log(err);
      deferred.reject(err); 
    }
    else {
      if (results && results[0] && results[0]['user']) {
        console.log(results)
        deferred.resolve(new User(results[0]['user']));
      }
      else {
        console.log(params);
        deferred.reject(new Error('user does not exist'));
      }
    }
  });

  return deferred.promise;
};

// Find a single user based on foursquareID and return a node 
// to add new foursquare information after resolve
// If user does not have a foursquareID, the promise will resolve to error
User.findByFoursquareID = function (foursquareID) {

  var deferred = Q.defer();

  var query = [
    'MATCH (user:User {foursquareID: {foursquareID}})',
    'RETURN user',
  ].join('\n');

  var params = {
    foursquareID: foursquareID
  };

  db.query(query, params, function (err, results) {
    if (err) { deferred.reject(err); }
    else {
      if (results && results[0] && results[0]['user']) {
        deferred.resolve(new User(results[0]['user']));
      }
      else {
        deferred.reject(new Error('user does not exist'));
      }
    }
  });

  return deferred.promise;
};

// Find a single user based on foursquareID and return a node 
// to add new foursquare information after resolve
// If user does not have a foursquareID, the promise will resolve to error
User.findByInstagramID = function (instagramID) {

  var deferred = Q.defer();

  var query = [
    'MATCH (user:User {instagramID: {instagramID}})',
    'RETURN user',
  ].join('\n');

  var params = {
    instagramID: instagramID
  };

  db.query(query, params, function (err, results) {
    if (err) { deferred.reject(err); }
    else {
      deferred.resolve(new User(results[0]['user']));
    }
  });

  return deferred.promise;
};

User.findByFootprintCheckinID = function (checkinID) {
  var deferred = Q.defer();

  var query = [
    'MATCH (checkin:Checkin{checkinID: {checkinID}})<-[]-(user:User)',
    'RETURN user'
  ].join('\n');

  var params = {
    checkinID: checkinID
  };

  db.query(query, params, function (err, results) {
    if (err) { deferred.reject(err); }
    else {
      deferred.resolve(new User(results[0]['user']));
    }
  });
  return deferred.promise;
}

User.findLatestCommenterAndCommentOnCheckinByCheckinID = function (checkinID) {
  var deferred = Q.defer();

  var query = [
  'MATCH (user:User)-[]->(checkin:Checkin {checkinID:{checkinID}})<-[]-(comment:Comment)<-[]-(commenter:User)',
  'OPTIONAL MATCH (checkin)-[]->(place:Place)',
  'RETURN user, commenter, checkin, comment, place', 
  'ORDER BY -comment.time', 
  'LIMIT 1'
  ].join('\n');

  var params = {
    checkinID: checkinID
  };

  db.query(query, params, function (err, results) {
    if (err) { deferred.reject(err); }
    else {
      deferred.resolve(results[0]);
    }
  });
  return deferred.promise;
}


module.exports = User;