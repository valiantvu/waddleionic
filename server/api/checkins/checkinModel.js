var neo4j = require('neo4j');
var Q = require('q');
var _ = require('lodash');
var uuid = require('node-uuid');
var request = require('request');

var neo4jUrl = process.env['WADDLE_GRAPHENEDB_URL'] || 'http://localhost:7474';
var db = new neo4j.GraphDatabase(neo4jUrl);

var Checkin = function(node){
  this.node = node;
}

Checkin.prototype.setProperty = function(property, value) {
  this.node.data[property] = value;
  return this.save();
};

Checkin.prototype.getProperty = function(property) {
  return this.node.data[property];
};

Checkin.prototype.save = function (){
  var deferred = Q.defer();

  this.node.save(function (err, node){
    if (err) { deferred.reject(err); }
    else {
      deferred.resolve(new Checkin(node));
    }
  });

  return deferred.promise;
};

Checkin.addToBucketList = function(facebookID, checkinID){
  var deferred = Q.defer();

  var query = [
    'MATCH (user:User {facebookID: {facebookID}})',
    'MATCH (checkin:Checkin {checkinID: {checkinID}})',
    'MERGE (user)-[bucket:hasBucket]->(checkin)',
    'SET bucket.createdAt = timestamp()',
    'RETURN checkin'
  ].join('\n');


  var params = {
    facebookID: facebookID,
    checkinID: checkinID
  };

  console.log(params);
  db.query(query, params, function (err, results) {
    if (err) { deferred.reject(err); }
    else {
      deferred.resolve(results);
    }
  });

  return deferred.promise;
};

Checkin.removeFromBucketList = function(facebookID, checkinID){
  var deferred = Q.defer();

  var query = [
    'MATCH (user:User {facebookID: {facebookID}})-[rel:hasBucket]->(checkin:Checkin {checkinID: {checkinID}})',
    'DELETE rel'
  ].join('\n');

  var params = {
    facebookID: facebookID,
    checkinID: checkinID
  };


  db.query(query, params, function (err, results) {
    if (err) { deferred.reject(err); }
    else {
      deferred.resolve(results);
      console.log('query executed!')
    }
  });

  return deferred.promise;
};

Checkin.addToFolder = function (facebookID, checkinID, folderName) {
  var deferred = Q.defer();

  var query = [
    'MATCH (user:User {facebookID: {facebookID}})',
    'MATCH (checkin:Checkin {checkinID: {checkinID}})',
    'MATCH (user)-[:hasFolder]->(folder:Folder {name:{folderName}})',
    'MERGE (user)-[bucket:hasBucket]->(checkin)',
    'ON CREATE SET bucket.createdAt = timestamp()',
    'MERGE (folder)-[contains:containsCheckin]->(checkin)',
    'ON CREATE SET contains.createdAt = timestamp()',
    'RETURN user, folder, checkin'
  ].join('\n');

  var params = {
    facebookID: facebookID,
    checkinID: checkinID,
    folderName: folderName,
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

Checkin.removeFromFolder = function (facebookID, checkinID, folderName) {
  var deferred = Q.defer();

  var query = [
    'MATCH (user:User {facebookID: {facebookID}})-[hasBucket:hasBucket]->(checkin:Checkin {checkinID: {checkinID}})',
    'MATCH (user)-[:hasFolder]->(folder:Folder {name:{folderName}})-[containsCheckin:containsCheckin]->(checkin)',
    'DELETE containsCheckin',
    'RETURN user, folder, checkin'
  ].join('\n');


  var params = {
    facebookID: facebookID,
    checkinID: checkinID,
    folderName: folderName,
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

Checkin.removeFromFavorites = function (facebookID, checkinID) {
  var deferred = Q.defer();

  var query = [
    'MATCH (user:User {facebookID: {facebookID}})-[hasBucket:hasBucket]->(checkin:Checkin {checkinID: {checkinID}})',
    'MATCH (user)-[:hasFolder]->(folder:Folder)-[containsCheckin:containsCheckin]->(checkin)',
    'DELETE hasBucket, containsCheckin',
    'RETURN user, folder, checkin'
  ].join('\n');


  var params = {
    facebookID: facebookID,
    checkinID: checkinID
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


Checkin.addComment = function (clickerID, checkinID, text){
  var deferred = Q.defer();
  var commentID = uuid.v4();
  var query = [
  'MATCH (clicker:User {facebookID: {facebookID}})',
  'MATCH (commentReceiver:User)-[:hasCheckin]->(checkin:Checkin {checkinID: {checkinID}})',
  'MERGE (clicker)-[:madeComment]->(newComment:Comment {text: {text}, commentID : {commentID}, time: timestamp() })' + 
  '-[:gotComment]->(checkin)',
  'MERGE (commentReceiver)-[:hasUnreadNotification]->(newComment)',
  'RETURN newComment'
  ].join('\n');
  var params = {
    'facebookID': clickerID,
    'checkinID': checkinID,
    'text': text,
    'commentID' : commentID
  };

  console.log(params);

  db.query(query, params, function (err, results){
    if (err) { deferred.reject(err); }
    else {
      deferred.resolve(results);
    }
  });

  return deferred.promise;
};

Checkin.removeComment = function(facebookID, checkinID, commentID){
  var deferred = Q.defer();

  var query = [
  'MATCH (clicker:User{facebookID:{facebookID}})-[rel1:madeComment]->(comment:Comment{commentID: {commentID}})-[rel2:gotComment]->(checkin:Checkin {checkinID: {checkinID}})',
  'OPTIONAL MATCH (comment)<-[rel3]-(user:User)',
  'WHERE type(rel3) = "hasUnreadNotification" OR type(rel3) = "hasReadNotification"',
  'DELETE rel1,rel2,rel3,comment'
  ].join('\n');

  var params = {
    facebookID: facebookID,
    checkinID: checkinID,
    commentID: commentID
  };
  console.log(params);

  db.query(query, params, function (err, results) {
    if (err) { deferred.reject(err); }
    else {
      deferred.resolve(results);
      console.log('query executed!')
    }
  });
  return deferred.promise;
};


Checkin.giveProps = function (clickerID, checkinID){
  var deferred = Q.defer();

  var query = [
  'MATCH (clicker:User {facebookID: {facebookID}})',
  'MATCH (checkin:Checkin {checkinID: {checkinID}})',
  'MERGE (clicker)-[:givesProps]->(checkin)',
  'RETURN checkin'
  ].join('\n');

  var params = {
    'facebookID': clickerID,
    'checkinID': checkinID
  };

  db.query(query, params, function (err, results){
    if (err) { deferred.reject(err) }
    else {
      console.log(results)
      deferred.resolve(results);
    }
  });

  return deferred.promise;
};

// Resolves to a list of props with the user node and the connection
Checkin.getProps = function (checkinID) {
  var deferred = Q.defer();

  var query = [
  'MATCH (user)-[connection:givesProps]->(checkin:Checkin {checkinID: {checkinID}})',
  'RETURN user, connection'
  ].join('\n');

  var params = {
    'checkinID': checkinID
  }

  db.query(query, params, function (err, results)  {
    if (err) { deferred.reject(err) }
    else {
      console.log(results)
      deferred.resolve(results)
    }
  });

  return deferred.promise;
};

Checkin.getHypes = function (checkinID) {
  var deferred = Q.defer();

  var query = [
  'MATCH (user)-[connection:hasBucket]->(checkin:Checkin {checkinID: {checkinID}})',
  'RETURN user, connection.createdAt'
  ].join('\n');

  var params = {
    'checkinID': checkinID
  };

  db.query(query, params, function (err, results)  {
    if (err) { deferred.reject(err); }
    else {
      var parsedResults = _.map(results, function (item) {
        console.log('item!!', item);
        
        var singleResult = {
          "hypeGiver": item.user.data,
          "hypeTime": item['connection.createdAt']
        };

        return singleResult;
      });
      deferred.resolve(parsedResults);
    }
  });

  return deferred.promise;
};

// Resolves to a list of users and comments
Checkin.getComments = function (checkinID){
  var deferred = Q.defer();

  var query = [
  'MATCH (commenter)-[:madeComment]->(comment:Comment)-[:gotComment]->(checkin:Checkin {checkinID: {checkinID}})',
  'RETURN commenter, comment'
  ].join('\n');

  var params = {
    'checkinID': checkinID
  }

  db.query(query, params, function (err, results){
    if (err) { deferred.reject(err) }
    else {
      var parsedResults = _.map(results, function (item) {
        
        var singleResult = {
          "comment": item.comment.data,
          "commenter": item.commenter.data
        };

        return singleResult;
      });
      var sortedParsedResults = _.sortBy(parsedResults, function (item) {
        return item.comment.time;
      });

      deferred.resolve(sortedParsedResults);
    }
  });

  return deferred.promise;
};

Checkin.deleteFootprint = function (facebookID, checkinID) {
  var deferred = Q.defer();

  var query = [
   'MATCH (user:User {facebookID:{facebookID}})-[hCheckin:hasCheckin]->(checkin:Checkin{checkinID:{checkinID}})-[hPlace:hasPlace]->(place:Place)', 
   'OPTIONAL MATCH (checkin)<-[hBucket:hasBucket]-(bucketer:User)',
   'OPTIONAL MATCH (checkin)<-[gComment:gotComment]-(comment:Comment)<-[mComment:madeComment]-(commenter:User)', 
   'OPTIONAL MATCH (comment)<-[hUnread:hasUnreadNotification]-(usa:User)',
   'OPTIONAL MATCH (comment)<-[hRead:hasReadNotification]-(usa2:User)',
   'OPTIONAL MATCH (checkin)<-[cCheckin:containsCheckin]-(folder:Folder)',
   'DELETE checkin, hCheckin, hPlace, hBucket, gComment, comment, mComment, hUnread, hRead, cCheckin'
  ].join('\n');
  
  var params = {
    'facebookID': facebookID,
    'checkinID': checkinID
  };

  db.query(query, params, function (err, results){
    if (err) { deferred.reject(err) }
    else {
      deferred.resolve(results);
      console.log('query executed!')
    }
  });

  return deferred.promise;
};

Checkin.editNativeCheckin = function (checkin) {
    var deferred = Q.defer();

  var query = [
   'MATCH (user:User {facebookID:{facebookID}})-[hCheckin:hasCheckin]->(checkin:Checkin{checkinID:{checkinID}})',
   'SET checkin.caption = {caption}, checkin.rating = {rating}, checkin.photo = {photo}, checkin.pointValue = {pointValue}',
   'RETURN checkin'
  ].join('\n');
  
  var params = checkin;

  db.query(query, params, function (err, results){
    if (err) { deferred.reject(err) }
    else {
      deferred.resolve(results);
      console.log('query executed!')
    }
  });
  return deferred.promise;
};

//executed one time to convert native waddle checkins' checkinTime from ms to new Date() in DB; kept here for future reference
// Checkin.convertNativeWaddleCheckinTime = function () {
//   var deferred = Q.defer();
//   var query = [
//   'MATCH (checkin:Checkin {source: {source}})',
//   'RETURN checkin.checkinID, checkin.checkinTime'
//   ].join('\n');

//   var params = {
//     'source': 'waddle'
//   };

//   db.query(query, params, function (err, results)  {
//     if (err) { deferred.reject(err) }
//     else {
//       console.log(results)
//       deferred.resolve(results)
//     }
//   });
//   return deferred.promise;
// }

//executed one time to convert native waddle checkins' checkinTime from ms to new Date() in DB; kept here for future reference
// Checkin.updateCheckinTime = function (updatedCheckins) {
//   var deferred = Q.defer();

//   var query = [
//   'MATCH (checkin:Checkin {checkinID: {checkinID}})',
//   'SET checkin.checkinTime = {checkinTime}',
//   'RETURN checkin'
//   ].join('\n');

//    var batchRequest = _.map(updatedCheckins, function (checkin, index) {

//     var singleRequest = {
//       'method': "POST",
//       'to': "/cypher",
//       'body': {
//         'query': query,
//         'params': checkin
//       },
//       'id': index
//     };

//     return singleRequest;
//   });

//   var options = {
//     'url': neo4jUrl + '/db/data/batch',
//     'method': 'POST',
//     'json': true,
//     'body': JSON.stringify(batchRequest)
//   };

//   request.post(options, function(err, response, body) {
//     if (err) { deferred.reject(err) }
//     else {
//       deferred.resolve(body);
//     }
//   });

//   return deferred.promise;
// }


module.exports = Checkin;
