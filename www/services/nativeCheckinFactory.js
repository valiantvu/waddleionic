(function(){

var NativeCheckin = function ($http, $q, $cordovaGeolocation){

  return {

	  searchFoursquareVenues: function (currentLocation) {
      if (currentLocation) {
        return $http({
          method: 'GET',
          url: 'https://api.foursquare.com/v2/venues/search?' + 
          'client_id=' + '3XX0HGXBG4ZNKNFPN5F1LBSS4JCT3J0P3UBKLDMSR3BQNJKU' + 
          '&client_secret=' + 'OCTH24K435KUKDACCRXMZCGYWP4335BWQNEPEJGANEYOH1KV' +
          '&v=20141110' +
          '&ll=' + currentLocation.lat + ',' + currentLocation.lng +
          '&intent=' + 'checkin'
        });
      }
    },

    sendCheckinDataToServer: function (checkinData) {
      if (checkinData) {
        return $http({
          method: 'POST',
          data: checkinData,
          url: '/api/checkins/nativecheckin/'
        });
      }
    },

    s3_upload: function() {
        var deferred = $q.defer();
        var status_elem = document.getElementById("status");
        var preview_elem = document.getElementById("preview");
        console.log('status: ' + status_elem + 'preview: ' + preview_elem);

        var s3upload = new S3Upload({
          file_dom_selector: 'files',
          s3_sign_put_url: 'api/checkins/sign_s3',
          onProgress: function(percent, message) {
              status_elem.innerHTML = 'Upload progress: ' + percent + '% ' + message;
          },
          onFinishS3Put: function(public_url) {
              console.log(public_url)
              status_elem.innerHTML = 'Upload completed. Uploaded to: ' + public_url;
              // Store this url in mongodb
              // self.saveStache(newStache);
              preview_elem.innerHTML = '<img src="' + public_url + '" style="height:45px;border: #455059 4px solid;"/>';
              deferred.resolve(public_url);
          },
          onError: function(status) {
              status_elem.innerHTML = 'Upload error: ' + status;
          }
        });
        return deferred.promise;
    },

    getCurrentLocation: function() {
      return $cordovaGeolocation.getCurrentPosition()
      .then(function (position) {
        console.log(position);
        return position;
      }, function (err) {
        return err;
      });
    }

  }; 
};

NativeCheckin.$inject = ['$http', '$q', '$cordovaGeolocation'];

//Start creating Angular module
angular.module('waddle.services.nativeCheckin', [])  
  .factory('NativeCheckin', NativeCheckin);

})();