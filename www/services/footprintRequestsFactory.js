(function(){

var FootprintRequests = function ($http){
  var footprintData;
  var openFootprint;
  var openFootprintFolders;
  var openFootprintNotifications;
  var openFootprintProfile;
  var selectedFootprintIndex;
  var deletedFootprint;
  var editedCheckin;
  var openFolder;
  var openFolderIndex;
  var footprints;
  var currentTab;
  var productionServerURL = 'http://waddleionic.herokuapp.com';

  return {
    // Contains comments and props
    // currentFootprint: footprintData,
    // Contains all open footprint data
    openFootprint: openFootprint,

    selectedFootprintIndex: selectedFootprintIndex,

    deletedFootprint: false,

    editedCheckin: editedCheckin,

    openFolder: openFolder,

    openFolderIndex: openFolderIndex,

    footprints: footprints,

    currentTab: currentTab,

    addToBucketList: function (data) {
      if (data) {
        return $http({
          method: 'POST',
          data: data,
          url: '/api/checkins/bucketlist'
        });
      }
    },

    removeFromBucketList: function (data) {
      if (data) {
        return $http({
          method: 'POST',
          data: data,
          url: '/api/checkins/removebucket'
        });
      }
    },

    addComment: function (data) {
      var url = '/api/checkins/comment';
      if(ionic.Platform.isIOS()) {
        url = productionServerURL.concat(url);
      }
      if (data.text) {
        return $http({
          method: 'POST',
          data: data,
          url: url
        });
      }
    },

    editComment: function (data) {
      var url = '/api/checkins/comment/edit';
      if(ionic.Platform.isIOS()) {
        url = productionServerURL.concat(url);
      }
      return $http({
        method : 'POST',
        data : data,
        url : url
      });
    },

    removeComment : function(data) {
      var url = '/api/checkins/removecomment';
      if(ionic.Platform.isIOS()) {
        url = productionServerURL.concat(url);
      }
      return $http({
        method : 'POST',
        data : data,
        url : url
      });
    },

    getFootprintInteractions: function (checkinID) {
      var url = '/api/checkins/interactions/' + checkinID;
      if(ionic.Platform.isIOS()) {
        url = productionServerURL.concat(url);
      }
      if (checkinID) {
        return $http({
          method: 'GET',
          url: url
        });
      }
    },

    deleteFootprint: function (data) {
      var url = '/api/checkins/delete';
      if(ionic.Platform.isIOS()) {
        url = productionServerURL.concat(url);
      }
      if (data) {
         return $http({
          method : 'POST',
          data : data,
          url : url
        });
      }
    },

    removeFootprintFromFavorites: function (facebookID, checkinID) {
      var url = '/api/checkins/folders/removefavorite';
      if(ionic.Platform.isIOS()) {
        url = productionServerURL.concat(url);
      }
      var data = {
        facebookID: facebookID,
        checkinID: checkinID
      };

      return $http({
        method: 'POST',
        data: data,
        url: url
      });
    },

    getFoursquareVenueInfo: function (foursquareVenueID, facebookID) {
      var url = '/api/checkins/venue/' + foursquareVenueID + '/' + facebookID;
      if(ionic.Platform.isIOS()) {
        url = productionServerURL.concat(url);
      }
      return $http({
        method: 'GET',
        url: url
      })
    },

    findUsersAlsoBeenHere: function (foursquareVenueID, facebookID) {
      var url = '/api/places/beenhere/' + foursquareVenueID + '/' + facebookID;
      if(ionic.Platform.isIOS()) {
        url = productionServerURL.concat(url);
      }
      return $http({
        method: 'GET',
        url: url
      })
    }
  };
};

FootprintRequests.$inject = ['$http'];

angular.module('waddle.services.footprintRequestsFactory', []) 
  .factory('FootprintRequests', FootprintRequests);

})();