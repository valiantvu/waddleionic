(function(){

var CheckinController = function ($scope, $state, NativeCheckin, location) {	

	var currentLocation = {
		lat: location.coords.latitude,
		lng: location.coords.longitude
	};

	$scope.searchFoursquareVenues = function () {

		// NativeCheckin.getCurrentLocation()
		// .then(function (location) {
		// 	console.log(location);
		// 	var currentLocation = {
		// 		lat: location.coords.latitude,
		// 		lng: location.coords.longitude
		// 	};
			NativeCheckin.searchFoursquareVenues(window.sessionStorage.userFbID, currentLocation)
			.then(function (venues) {
				$scope.venues = venues.data;
			})
		// });
    // NativeCheckin.getCurrentLocation(
    // 	function(location) {
    // 		console.log(location);
    // 		var currentLocation = {
    // 			lat: location.coords.latitude,
    // 			lng: location.coords.longitude
    // 		};
    // 		NativeCheckin.searchFoursquareVenues(window.sessionStorage.userFbID, currentLocation)
    // 		.then(function (venues) {
    // 			$scope.venues = venues.data;
    // 		})
    //   },
    //   function(err) {
    //   	console.log(err);
    //   }
    // )
	};

	$scope.passSelectedVenueInfoToPostTab = function (venueInfo) {
		NativeCheckin.selectedVenue = venueInfo;
		console.log(NativeCheckin.selectedVenue);
	};

	$scope.searchFoursquareVenues();
};

CheckinController.$inject = ['$scope', '$state', 'NativeCheckin', 'location'];

angular.module('waddle.checkin', [])
  .controller('CheckinController', CheckinController);
})();