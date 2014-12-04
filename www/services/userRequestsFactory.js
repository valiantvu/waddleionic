(function(){

// Requests to server sending and retrieving data for specific users
var UserRequests = function ($http){
  var userData;

  return {
    allData: userData,

    // Sends request to server with relevant user data 
    // for creation of new user or retrieval of existing user' checkins/data
    sendUserData: function (data) {
      if(data) {
        return $http({
          method: 'POST',
          data: data,
          url: '/api/users/userdata'
        });
      }
    },

    getUserInfo: function (userFbID) {
      console.log(userFbID);
      if (userFbID) {
        return $http({
          method: 'GET',
          url: 'http://localhost:8000/api/users/userinfo/' + userFbID
        });
      }

    },
    
    // Grab existing user's checkins/data
    // Pass in the viewerID so that there is a context to the data returned
    // this allows the viewer to see whether they have liked another user's checkin

    getUserData: function (userFbID, viewerID, page) {
      var url = '/api/users/' + userFbID + "/" + viewerID;
      
      if (page) {
          url +=  "/" + page;
      }

      if (userFbID) {
        return $http({
          method: 'GET',
          url: url
        });
      }
    },

    getAggregatedFeedData:function (userFbID, page) {
      var url = '/api/users/aggregatefeed/' + userFbID;
      
      if (page) {
          url +=  "/" + page;
      }

      if (userFbID) {
        return $http({
          method: 'GET',
          url: url
        });
      }
    },

    getBucketList: function (userFbID) {
      if (userFbID) {
        return $http({
          method: 'GET',
          url: '/api/users/bucketlist/' + userFbID
        });
      }
    }
  }; 
};

UserRequests.$inject = ['$http'];

//Start creating Angular module
angular.module('waddle.services.userRequests', [])  
  .factory('UserRequests', UserRequests);

})();