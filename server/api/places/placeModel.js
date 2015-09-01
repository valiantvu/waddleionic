var qs = require('querystring');
var request = require('request');

var Q = require('q');
var _ = require('lodash');

var neo4j = require('neo4j');
var neo4jUrl = process.env['WADDLE_GRAPHENEDB_URL'] || 'http://localhost:7474';
var db = new neo4j.GraphDatabase(neo4jUrl);

var Checkin = require('../checkins/checkinModel.js');
var User = require('../users/userModel.js');

var Place = function(node){
  this.node = node;
};

Place.prototype.setProperty = function(property, value) {
  this.node.data[property] = value;
  return this.save();
};

Place.prototype.getProperty = function(property) {
  return this.node.data[property];
};

Place.prototype.save = function (){
  var deferred = Q.defer();

  this.node.save(function (err, node){
    if (err) { deferred.reject(err); }
    else {
      deferred.resolve(node);
    }
  });

  return deferred.promise;
};

Place.findFriendsAlreadyBeen = function (facebookID, foursquareID) {
  var deferred = Q.defer();

  var query = [
    'MATCH (user:User{facebookID:{facebookID}})-[:hasFriend*0..1]->(friend:User)-[:hasCheckin]->(checkin:Checkin)-[:hasPlace]->(place:Place {foursquareID: {foursquareID}})',
    'RETURN collect(DISTINCT friend) AS friends'
  ].join('\n');

  var params = {
    facebookID: facebookID,
    foursquareID: foursquareID
  };

  db.query(query, params, function (err, results) {
    if (err) {
      deferred.reject(err);
    }
    else {
      var parsedResults = _.map(results, function (item) {
        console.log(JSON.stringify(results));

        var singleResult = {
          users: null
        };

        // if(item['users'].length) {
        //   singleResult.user = item['users'][0].data;
        // }

        if(item['friends'].length) {
          var friendsArray = [];
           for(var i = 0; i < item['friends'].length; i++) {
            friendsArray.push(item['friends'][i].data);
          }
          singleResult.users = friendsArray;
        }

        return singleResult
      });
      deferred.resolve(parsedResults);

    }
  })
  return deferred.promise;
}

Place.assignIconToCategories = function (categoryList) {
  var deferred = Q.defer();

  var query = [
    'MERGE (category:Category {name: {name}})',
    'SET category.iconPrefix = {prefix}, category.iconSuffix = {suffix}, category.name = {name}'
  ].join('\n');

  var batchRequest = _.map(categoryList, function (category, index) {

    var singleRequest = {
      'method': "POST",
      'to': "/cypher",
      'body': {
        'query': query,
        'params': checkin
      },
      'id': index
    };
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

Place.create = function(data){
  node = db.createNode(data);
  var place = new Place(node);

  var query = [
    'MERGE (place:Place foursquareID: {foursquareID}, {name: {name}, lat: {lat}, lng: {lng}, country: {country}})',
    'RETURN place',
  ].join('\n');

  var params = data;

  var deferred = Q.defer();

  db.query(query, params, function (err, results) {
    if (err) { deferred.reject(err); }
    else {
      var place = new Place(results[0]['place']);
      deferred.resolve(place);
    }
  });
}

Place.find = function (factualID) {

  var query = [
    'MATCH (place:Place {factualID: {factualID}})',
    'RETURN place'
  ].join('\n');

  var params = {
    factualID: factualID
  };

  var deferred = Q.defer();

  db.query(query, params, function (err, results) {
    if (err) { 
      console.log(err);
      deferred.reject(err); 
    }
    else {
      if (results && results[0] && results[0]['place']) {
        console.log(results)
        deferred.resolve(new Place(results[0]['place']));
      }
      else {
        console.log(params);
        deferred.reject(new Error('place does not exist'));
      }
    }
  });

  return deferred.promise;
};

Place.findByCheckinID = function (checkinID) {

  var deferred = Q.defer();

  var query = [
    'MATCH (checkin:Checkin {checkinID: {checkinID}})-[:hasPlace]->(place:Place)',
    'RETURN place',
  ].join('\n');

  var params = {
    checkinID: checkinID
  };

  db.query(query, params, function (err, results) {
    if (err) { deferred.reject(err); }
    else {
      console.log('results' + JSON.stringify(results[0].user.data))
      if (results && results[0] && results[0]['place']) {
        console.log(results)
        deferred.resolve(new User(results[0]['place']));
      }
      else {
        deferred.reject(new Error('user does not exist'));
      }
    }
  });

  return deferred.promise;
};

Place.findAllByCountryOrCityName = function (userID, locationName) {
  var deferred = Q.defer();

  var query = [
    'MATCH (loc {name:{locationName}})<-[*..2]-(place:Place)<-[rel1:hasPlace]-(checkin:Checkin)<-[:hasCheckin]-(user:User)',
    // 'OPTIONAL MATCH (user)-[:hasFriend]->(self:User{facebookID:{facebookID}})',
    'RETURN loc, place, collect(DISTINCT checkin) AS checkins, collect(DISTINCT user) AS users, count(DISTINCT rel1) AS checkinCount, count(DISTINCT user) AS userCount',
    'ORDER BY count(DISTINCT user) DESC, count(DISTINCT rel1) DESC'
  ].join('\n');

  var params = {
    facebookID: userID,
    locationName: locationName
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
          "checkins": item.checkins,
          "users": item.users,
          "checkinCount": item.checkinCount,
          "userCount": item.userCount
        }

        // if(item['collect(comment)'].length && item['collect(commenter)'].length) {
        //   var commentsArray = [];
        //   for(var i = 0; i < item['collect(comment)'].length; i++) {
        //     var commentData = {
        //       comment: item['collect(comment)'][i].data,
        //       commenter: item['collect(commenter)'][i].data
        //     }
        //     commentsArray.push(commentData);
        //   }

        //   singleResult.comments = commentsArray;
        //   console.log('singleResult: ', singleResult.comments);

        // }

        // if (item.liker){
        //   singleResult.checkin.liked = true;
        // }
        // if (item.bucketer){
        //   singleResult.checkin.bucketed = true;
        // }
        return singleResult
      });
      deferred.resolve(parsedResults);

    }
  })
  return deferred.promise;
}

Place.discoverByLocation = function (facebookID, locationTerm) {
  console.log('locationnnnn');
  var deferred = Q.defer();

  var query = [
    'MATCH (loc:City)<-[:hasCity]-(place:Place)<-[:hasPlace]-(checkin:Checkin)<-[:hasCheckin]-(friend:User)<-[:hasFriend*0..2]-(user:User{facebookID:{facebookID}}),',
    'p=shortestPath((friend)<-[:hasFriend]-(user))',
    'WHERE loc.name =~ {locationQuery} OR loc.province =~ {locationQuery} OR loc.country =~ {locationQuery}',
    'MATCH (place)-[:hasCategory]->(category:Category)',
    'OPTIONAL MATCH (user)-[:hasFolder]->(folder:Folder)-[:containsCheckin]->(checkin)',
    'RETURN category, place, friend, count(DISTINCT friend) AS userCount, user, p, checkin, folder',
    'ORDER BY checkin.rating DESC'
  ].join('\n');

  var params = {
    facebookID: facebookID,
    locationQuery: '(?i).*' + locationTerm + '.*'
  };

  console.log('dis b ma params:', params);

  db.query(query, params, function (err, results) {
    if (err) {
      deferred.reject(err);
    }
    else {

      var parsedResults = _.map(results, function (item) {
        
        var singleResult = {
          "checkin": item.checkin.data,
          "place": item.place.data,
          "category": item.category.data,
          "p": item.p,
          "user": item.friend.data,
          "userCount": item.userCount
        };

        if(item.folder) {
          singleResult.folder = item.folder.data
        }

        return singleResult
      });

      var groupedResults = _.groupBy(parsedResults, function (item) {
        return item.place.foursquareID;
      });

      deferred.resolve(groupedResults);

    }
  })
  return deferred.promise;

}

Place.discoverByCategoryOrName = function (facebookID, searchTerm) {
  var deferred = Q.defer();
  var query = [
    'MATCH (category:Category)<-[:hasCategory]-(place:Place)',
    'WHERE str(category.name) =~ {searchQuery} OR str(place.name) =~ {searchQuery}',
    'MATCH (place)<-[:hasPlace]-(checkin:Checkin)<-[:hasCheckin]-(friend:User)<-[:hasFriend*0..2]-(user:User{facebookID:{facebookID}}),',
    'p=shortestPath((friend)<-[:hasFriend]-(user))',
    'OPTIONAL MATCH (user)-[:hasFolder]->(folder:Folder)-[:containsCheckin]->(checkin)',
    'RETURN category, place, friend, count(DISTINCT friend) AS userCount, user, p, checkin, folder',
    'ORDER BY checkin.rating DESC'
  ].join('\n');

  var params = {
    facebookID: facebookID,
    searchQuery: '(?i).*' + searchTerm + '.*'
  };

  console.log('dis b ma params:', params);

  db.query(query, params, function (err, results) {
    if (err) {
      deferred.reject(err);
    }
    else {

      var parsedResults = _.map(results, function (item) {
        
        var singleResult = {
          "checkin": item.checkin.data,
          "place": item.place.data,
          "category": item.category.data,
          "p": item.p,
          "user": item.friend.data,
          "userCount": item.userCount
        };

        if(item.folder) {
          singleResult.folder = item.folder.data
        }

        return singleResult
      });

      var groupedResults = _.groupBy(parsedResults, function (item) {
        return item.place.foursquareID;
      });

      deferred.resolve(groupedResults);

    }
  })
  return deferred.promise;
};

Place.discoverByCategoryOrNameAndLocation = function (facebookID, locationTerm, searchTerm) {
  var deferred = Q.defer();
  var query = [
    'MATCH (loc:City)<-[:hasCity]-(place:Place)<-[:hasPlace]-(checkin:Checkin)<-[:hasCheckin]-(friend:User)<-[:hasFriend*0..2]-(user:User{facebookID:{facebookID}}),',
    'p=shortestPath((friend)<-[:hasFriend]-(user))',
    'WHERE loc.name =~ {locationQuery} OR loc.province =~ {locationQuery} OR loc.country =~ {locationQuery}',
    'MATCH (place)-[:hasCategory]->(category:Category)',
    'WHERE str(category.name) =~ {searchQuery} OR str(place.name) =~ {searchQuery}',
    'OPTIONAL MATCH (user)-[:hasFolder]->(folder:Folder)-[:containsCheckin]->(checkin)',
    'RETURN category, place, friend, count(DISTINCT friend) AS userCount, user, p, checkin, folder',
    'ORDER BY checkin.rating DESC'
  ].join('\n');

  var params = {
    facebookID: facebookID,
    locationQuery: '(?i).*' + locationTerm + '.*',
    searchQuery: '(?i).*' + searchTerm + '.*'
  };

  console.log('dis b ma params:', params);

  db.query(query, params, function (err, results) {
    if (err) {
      deferred.reject(err);
    }
    else {

      var parsedResults = _.map(results, function (item) {
        
        var singleResult = {
          "checkin": item.checkin.data,
          "place": item.place.data,
          "category": item.category.data,
          "p": item.p,
          "user": item.friend.data,
          "userCount": item.userCount
        };

        if(item.folder) {
          singleResult.folder = item.folder.data
        }

        return singleResult
      });

      var groupedResults = _.groupBy(parsedResults, function (item) {
        return item.place.foursquareID;
      });

      deferred.resolve(groupedResults);

    }
  })
  return deferred.promise;
};

module.exports = Place;
