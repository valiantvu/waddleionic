(function(){

var NativeCheckin = function ($http, $q, $cordovaGeolocation, $ionicPlatform){
  var productionServerURL = 'http://waddleionic.herokuapp.com';

  return {
    selectedVenue: null,

	  searchFoursquareVenues: function (facebookID, currentLocation) {
      var url = '/api/checkins/venuesearchmobile/' + facebookID + '/' + currentLocation.lat + '/' + currentLocation.lng;
      if(ionic.Platform.isIOS()) {
        url = productionServerURL.concat(url);
      }
      return $http({
        method: 'GET',
        url: url
      });
    },

    sendCheckinDataToServer: function (checkinData) {
      var url = '/api/checkins/nativecheckin/';
      if(ionic.Platform.isIOS()) {
        url = productionServerURL.concat(url);
      }
      if (checkinData) {
        return $http({
          method: 'POST',
          data: checkinData,
          url: url
        });
      }
    },

    s3_upload: function(file_element) {
        var deferred = $q.defer();
        var url = '/api/checkins/sign_s3';

        if(ionic.Platform.isIOS()) {
          url = productionServerURL.concat(url);
        }
        // var status_elem = document.getElementById("status");
        var preview_elem = document.getElementById("preview");
        // console.log('status: ' + status_elem + 'preview: ' + preview_elem);

        var s3upload = new S3Upload({
          file_dom_selector: 'files',
          s3_sign_put_url: url,
          onProgress: function(percent, message) {
              console.log('Upload progress: ' + percent + '% ' + message);
              // status_elem.innerHTML = 'Upload progress: ' + percent + '% ' + message;
          },
          onFinishS3Put: function(public_url) {
              console.log(public_url)
              // status_elem.innerHTML = 'Upload completed. Uploaded to: ' + public_url;
              // preview_elem.innerHTML = '<img src="' + public_url + '"/>';
              deferred.resolve(public_url);
          },
          onError: function(status) {
              console.log('Upload error: ' + status);
              // status_elem.innerHTML = 'Upload error: ' + status;
          }
        }, file_element);
        return deferred.promise;
    },

    getCurrentLocation: function(callback) {
      console.log('getting currentLocation');
      var options = {
        enableHighAccuracy: false,
        timeout: 30000,
        maximumAge: 0
      };
      // return $cordovaGeolocation.getCurrentPosition({timeout: 5000, enableHighAccuracy: true})
      // .then(function (position) {
      //   console.log(position);
      //   return position;
      // }, function (err) {
      //   return err;
      // });
      return navigator.geolocation.getCurrentPosition(
        function(position) {
          console.log(position);
          return callback(position);
        },
        function(err) {
          return err;
        },
        options
      );
    },

    editCheckin: function(editedCheckinData) {
      var url = '/api/checkins/nativecheckin/edit';
      if(ionic.Platform.isIOS()) {
          url = productionServerURL.concat(url);
      }
      return $http({
        method: 'POST',
        data: editedCheckinData,
        url: url
      })
    }

  }; 
};

NativeCheckin.$inject = ['$http', '$q', '$cordovaGeolocation', '$ionicPlatform'];

//Start creating Angular module
angular.module('waddle.services.nativeCheckin', [])  
  .factory('NativeCheckin', NativeCheckin);

})();