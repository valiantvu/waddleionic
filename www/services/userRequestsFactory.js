(function(){

// Requests to server sending and retrieving data for specific users
var UserRequests = function ($http, ezfb){
  var userData;
  var productionServerURL = 'http://waddleionic.herokuapp.com';

  return {
    allData: userData,
    newFootprint: null,
    loggedInUserInfo: null,
    userProfileData: null,
    userFolderData: null,

    // Stores the user data for a friend's profile
    friends: {
      profile: null,
      home: null,
      folders: null,
      notifications: null
    },

    // Sends request to server with relevant user data 
    // for creation of new user or retrieval of existing user' checkins/data
    sendUserData: function (data) {
      var url = '/api/users/userdata';

      if(ionic.Platform.isIOS()) {
        url = productionServerURL.concat(url);
      }

      if(data) {
        return $http({
          method: 'POST',
          data: data,
          url: url
        });
      }
    },

    getUserInfo: function (userFbID) {
      if (userFbID) {
        return $http({
          method: 'GET',
          url: '/api/users/userinfo/' + userFbID
        });
      }

    },
    
    // Grab existing user's checkins/data
    // Pass in the viewerID so that there is a context to the data returned
    // this allows the viewer to see whether they have liked another user's checkin

    getUserData: function (userFbID, viewerID) {
      var url = '/api/users/' + userFbID + "/" + viewerID;
      
      if (arguments[2] !== undefined) {
          var page = arguments[2]
          url +=  "/" + page;
      }

      if (arguments[3] !== undefined) {
          var skip = arguments[3]
          url +=  "/" + skip;
      }

      if(ionic.Platform.isIOS()) {
        url = productionServerURL.concat(url);
      }

      if (userFbID) {
        return $http({
          method: 'GET',
          url: url
        });
      }
    },

    getFriendProfileData: function (tab) {
      return getUserData(friends[tab]);
    },

    getAggregatedFeedData:function (userFbID) {
      var url = '/api/users/aggregatefeed/' + userFbID;
      
      if (arguments[1] !== undefined) {
          var page = arguments[1];
          url +=  "/" + page;
      }

      if (arguments[2] !== undefined) {
          var skip = arguments[2];
          url +=  "/" + skip;
      }
      if(ionic.Platform.isIOS()) {
        url = productionServerURL.concat(url);
      }
      console.log(url);

      if (userFbID) {
        return $http({
          method: 'GET',
          url: url
        });
      }
    },

    getBucketList: function (userFbID) {
      var url = '/api/users/bucketlist/' + userFbID;
      if (arguments[1] !== undefined) {
          var page = arguments[1]
          url +=  "/" + page;
          console.log(url);
      }

      if (arguments[2] !== undefined) {
          var skip = arguments[2]
          url +=  "/" + skip;
      }

      if(ionic.Platform.isIOS()) {
        url = productionServerURL.concat(url);
      }

      if (userFbID) {
        return $http({
          method: 'GET',
          url: url
        });
      }
    },

    addFolder: function(userFbID, folderName) {
      var url = '/api/users/folders/add';
      if(ionic.Platform.isIOS()) {
        url = productionServerURL.concat(url);
      }
      if (userFbID) {
        return $http({
          method: 'POST',
          url: url,
          data: {
            facebookID: userFbID,
            folderName: folderName
          }
        });
      }
    },

    fetchFolders: function(userFbID) {
      var url = '/api/users/folders/' + userFbID;

      if (arguments[1] !== undefined) {
          var page = arguments[1]
          url +=  "/" + page;
      }

      if (arguments[2] !== undefined) {
          var skip = arguments[2]
          url +=  "/" + skip;
      }

      if(ionic.Platform.isIOS()) {
        url = productionServerURL.concat(url);
      }

      return $http({
        method: 'GET',
        url: url
      });
    },

    searchFoldersByName: function(userFbID, query) {
      console.log(query);
      var url = '/api/users/folders/search/' + userFbID + '/' + query;
      console.log(url);
      if (arguments[2] !== undefined) {
          var page = arguments[2]
          url +=  "/" + page;
          console.log(url);
      }

      if (arguments[3] !== undefined) {
          var skip = arguments[3]
          url +=  "/" + skip;
      }

      if(ionic.Platform.isIOS()) {
        url = productionServerURL.concat(url);
      }

      return $http({
        method: 'GET',
        url: url
      });
    },

    addFootprintToFolder: function(userFbID, checkinID, folderName) {
      var url = '/api/checkins/folder/';

      if(ionic.Platform.isIOS()) {
        url = productionServerURL.concat(url);
      }

      return $http({
        method: 'POST',
        url: url,
        data: {
          facebookID: userFbID,
          checkinID: checkinID,
          folderName: folderName
        }
      });
    },

    fetchFolderContents: function(userFbID, folderName) {
      var url = '/api/users/folder/' + userFbID + '/' + folderName;

      if (arguments[2] !== undefined) {
        var page = arguments[2]
        url +=  "/" + page;
        console.log(url);
      };

      if (arguments[3] !== undefined) {
        var skip = arguments[3]
        url +=  "/" + skip;
      };

      if(ionic.Platform.isIOS()) {
        url = productionServerURL.concat(url);
      }

      return $http({
        method: 'GET',
        url: url
      });
    },

    deleteFolderAndContents: function(userFbID, folderName) {
      var url = '/api/users/folders/delete';
      if(ionic.Platform.isIOS()) {
        url = productionServerURL.concat(url);
      }

      console.log(url);
      return $http({
        method: 'POST',
        url: url,
        data: {
          facebookID: userFbID,
          folderName: folderName
        }
      });
    },
    
    searchUserFootprints: function (userFbID, query) {
      var url = '/api/users/searchfootprints/' + userFbID + '/' + query;
      if (arguments[2] !== undefined) {
          var page = arguments[2]
          url +=  "/" + page;
          console.log(url);
      }

      if (arguments[3] !== undefined) {
          var skip = arguments[3]
          url +=  "/" + skip;
      }

      if(ionic.Platform.isIOS()) {
        url = productionServerURL.concat(url);
      }

      return $http({
        method: 'GET',
        url: url
      });
    },

    searchFeed: function (userFbID, query) {
      var url = '/api/users/searchfeed/' + userFbID + '/' + query;
      if (arguments[2] !== undefined) {
          var page = arguments[2]
          url +=  "/" + page;
          console.log(url);
      }

      if (arguments[3] !== undefined) {
          var skip = arguments[3]
          url +=  "/" + skip;
      }

      if(ionic.Platform.isIOS()) {
        url = productionServerURL.concat(url);
      }

      if (userFbID && query) {
        return $http({
          method: 'GET',
          url: url
        })
      }
    },

    getFriendsList: function (userFbID) {
      var url = '/api/users/friendslist/' + userFbID;     

      if (arguments[1] !== undefined) {
          var page = arguments[1];
          url +=  "/" + page;
      }

      if (arguments[2] !== undefined) {
          var skip = arguments[2];
          url +=  "/" + skip;
      }
      if(ionic.Platform.isIOS()) {
        url = productionServerURL.concat(url);
      }
      console.log(url);

      if (userFbID) {
        return $http({
          method: 'GET',
          url: url
        });
      }
    },

    searchFriendsList: function (userFbID, query) {
      var url = '/api/users/friendslist/search/' + userFbID + '/' + query;    

      if (arguments[2] !== undefined) {
          var page = arguments[2];
          url +=  "/" + page;
      }

      if (arguments[3] !== undefined) {
          var skip = arguments[3];
          url +=  "/" + skip;
      }
      if(ionic.Platform.isIOS()) {
        url = productionServerURL.concat(url);
      }
      console.log(url);

      if (userFbID) {
        return $http({
          method: 'GET',
          url: url
        });
      }
    },

    fetchUnreadNotifications: function (userFbID, page, limit) {
      var url = '/api/users/notifications/unread/' + userFbID + '/' + page + '/' + limit;
      if(ionic.Platform.isIOS()) {
        url = productionServerURL.concat(url);
      }

      return $http ({
        method: 'GET',
        url: url
      });
    },

    updateNotificationReadStatus: function (userFbID) {
      var url = '/api/users/notifications/update';
      if(ionic.Platform.isIOS()) {
        url = productionServerURL.concat(url);
      }

      return $http({
        method: 'POST',
        url: url,
        data: {facebookID: userFbID}
      });
    },

    fetchReadNotifications: function (userFbID, page, limit) {
      var url = '/api/users/notifications/read/' + userFbID + '/' + page + '/' + limit;
      if(ionic.Platform.isIOS()) {
        url = productionServerURL.concat(url);
      }
      
      console.log(url);
      return $http({
        method: 'GET',
        url: url
      });
    },

    suggestToFriend: function (params) {
      var url = '/api/checkins/suggest';
      if(ionic.Platform.isIOS()) {
        url = productionServerURL.concat(url);
      };
      return $http({
        method: 'POST',
        url: url,
        data: params
      });
    },

    publishToFacebook: function (userFbID, linkObject) {
      var params = {
        facebookID: userFbID,
        link: linkObject
      };
      var url = '/api/users/publish/facebook';
      if(ionic.Platform.isIOS()) {
        url = productionServerURL.concat(url);
      };
      return $http({
        method: 'POST',
        url: url,
        data: params
      });
    }

  };

};

UserRequests.$inject = ['$http'];

//Start creating Angular module
angular.module('waddle.services.userRequests', [])  
  .factory('UserRequests', UserRequests);

})();