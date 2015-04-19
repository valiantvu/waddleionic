(function(){

var FootprintRequests = function ($http){
  var footprintData;
  var openFootprint;
  var selectedFootprintIndex;
  var deletedFootprint;
  var footprints;
  var currentTab;

  return {
    // Contains comments and props
    // currentFootprint: footprintData,
    // Contains all open footprint data
    openFootprint: openFootprint,

    selectedFootprintIndex: selectedFootprintIndex,

    deletedFootprint: true,

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
      if (data && data.text) {
        return $http({
          method: 'POST',
          data: data,
          url: '/api/checkins/comment'
        });
      }
    },

    removeComment : function(data) {
      if (data) {
        return $http({
          method : 'POST',
          data : data,
          url : '/api/checkins/removecomment'
        });
      }
    },

    getFootprintInteractions: function (checkinID) {
      if (checkinID) {
        return $http({
          method: 'GET',
          url: '/api/checkins/interactions/' + checkinID
        });
      }
    },

    deleteFootprint: function (data) {
      if (data) {
         return $http({
          method : 'POST',
          data : data,
          url : '/api/checkins/delete'
        });
      }
    },

    getFoursquareVenueInfo: function (foursquareVenueID, facebookID) {
      var url = '/api/checkins/venue/' + foursquareVenueID + '/' + facebookID;
      return $http({
        method: 'GET',
        url: url
      })
    },

    findUsersAlsoBeenHere: function (foursquareVenueID, facebookID) {
      var url = '/api/places/beenhere/' + foursquareVenueID + '/' + facebookID;
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