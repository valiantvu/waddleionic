(function(){

var DiscoverPlaces = function ($http, $q, $cordovaGeolocation, $ionicPlatform, $timeout){
  var productionServerURL = 'http://waddleionic.herokuapp.com';
  var stagingServerURL = 'https://protected-reaches-9372.herokuapp.com';

  return {
    search: function(userFbID, searchParams) {
      searchParams = {
        lat: 37.7836240,
        lng: -122.4089990,
        rad: 10000,
        categories: ["Coffee", "Thai"],
        apiSource: 'places',
        attr: ['wifi'],
        sort: 'distance'
      };
      var url = '/api/places/discover/search/' + userFbID;

      if(ionic.Platform.isIOS()) {
        if(window.sessionStorage.stagingEnvironment) {
          url = stagingServerURL.concat(url);
        } else {
          url = productionServerURL.concat(url);
        }
      }

      return $http({
        method: 'GET',
        url: url,
        params: searchParams
      });
    },


  	byCategory: function(categorySearchTerm, userFbID) {
      var url = '/api/places/discover/category/' + categorySearchTerm + '/' + userFbID;

      if(ionic.Platform.isIOS()) {
        if(window.sessionStorage.stagingEnvironment) {
          url = stagingServerURL.concat(url);
        } else {
          url = productionServerURL.concat(url);
        }
      }

      return $http({
        method: 'GET',
        url: url
      });
    },

    byLocation: function(locationTerm, userFbID) {
      var url = '/api/places/discover/location/' + locationTerm + '/' + userFbID;
      console.log('by location!!');

      if(ionic.Platform.isIOS()) {
        if(window.sessionStorage.stagingEnvironment) {
          url = stagingServerURL.concat(url);
        } else {
          url = productionServerURL.concat(url);
        }
      }

      return $http({
        method: 'GET',
        url: url
      });
    },

    byCategoryOrNameAndLocation: function(locationTerm, searchTerm, userFbID) {
      var url = '/api/places/discover/location-category/' + locationTerm + '/' + searchTerm + '/' + userFbID;

      if(ionic.Platform.isIOS()) {
        if(window.sessionStorage.stagingEnvironment) {
          url = stagingServerURL.concat(url);
        } else {
          url = productionServerURL.concat(url);
        }
      }

      return $http({
        method: 'GET',
        url: url
      });
    }
  }; 
};

DiscoverPlaces.$inject = ['$http', '$q', '$cordovaGeolocation', '$ionicPlatform', '$timeout'];

//Start creating Angular module
angular.module('waddle.services.discoverPlacesFactory', [])  
  .factory('DiscoverPlaces', DiscoverPlaces);

})();