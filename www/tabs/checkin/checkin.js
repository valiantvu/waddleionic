(function(){

var CheckinController = function ($scope, $state, NativeCheckin) {	

	$scope.checkin = function () {
		// NativeCheckin.getCurrentLocation()
		// .then(function (location) {
		// 	// $scope.location = location.coords.latitude;
		// 	var currentLocation = {
		// 		lat: location.coords.latitude,
		// 		lng: location.coords.longitude
		// 	};
		  var currentLocation = {lat:40.753522 , lng: -74.272922}
			NativeCheckin.searchFoursquareVenues(currentLocation)
			.then(function (venues) {
				$scope.venues = venues.data.response.venues;
			})
		// });
	}

	$scope.passSelectedVenueInfoToPostModal = function (venueInfo) {
		$scope.venue = venueInfo;
	}

	$scope.sendCheckinDataToServer = function(venueInfo) {
		// venueInfo.facebookID = window.sessionStorage.userFbID;
		venueInfo.facebookID = "10202833487341857";
		venueInfo.footprintCaption = $scope.footprintCaption;
		NativeCheckin.s3_upload()
		.then(function (public_url) {
		  venueInfo.photo = public_url;
		  console.log('venueInfo: ' + JSON.stringify(venueInfo));
		  NativeCheckin.sendCheckinDataToServer(venueInfo)
		})
		.then(function (data) {
			console.log(data);
		})
	}

	L.mapbox.accessToken = 'pk.eyJ1Ijoid2FkZGxldXNlciIsImEiOiItQWlwaU5JIn0.mTIpotbZXv5KVgP4pkcYrA';


      var map = L.mapbox.map('map', 'injeyeo.8fac2415')
        // attributionControl: false,
        // zoomControl: false,
        // worldCopyJump: true,
        // minZoom: 2,
        // // maxBounds: [[80,200],[-80,-200]],
        // bounceAtZoomLimits: false
      // })
			.setView([20.00, 0.00], 2);

};

CheckinController.$inject = ['$scope', '$state', 'NativeCheckin']

angular.module('waddle.checkin', [])
  .controller('CheckinController', CheckinController);

})();