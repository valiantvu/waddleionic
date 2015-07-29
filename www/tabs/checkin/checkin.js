(function(){

var CheckinController = function ($scope, $state, NativeCheckin, $ionicScrollDelegate, location) {	

 $scope.search = {};
 $scope.showSearch = false;

	var currentLocation = {
		lat: location.coords.latitude,
		lng: location.coords.longitude
	};

	$scope.toggleSearch = function() {
      $scope.showSearch = $scope.showSearch === true ? false : true;
      if ($scope.showSearch) {
      	$scope.venues = [];
        $ionicScrollDelegate.scrollTop();
        $scope.searchFoursquareVenuesByKeyword();
      }
      else {
      	$scope.searchFoursquareVenuesByGeolocation();
      }
    };

	$scope.searchFoursquareVenuesByKeyword = function () {
		if($scope.search.query && $scope.search.near) {
			$scope.search.query = $scope.search.query.replace(" ", "%20");
			NativeCheckin.searchFoursquareVenuesByKeyword(window.sessionStorage.userFbID, $scope.search.query, $scope.search.near)
			.then(function (venues) {
				console.log(venues);
				$scope.venues = venues.data;
			});
		}
	};

	$scope.searchFoursquareVenuesByGeolocation = function () {

		// NativeCheckin.getCurrentLocation()
		// .then(function (location) {
		// 	console.log(location);
		// 	var currentLocation = {
		// 		lat: location.coords.latitude,
		// 		lng: location.coords.longitude
		// 	};
			NativeCheckin.searchFoursquareVenuesByGeolocation(window.sessionStorage.userFbID, currentLocation)
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

	$scope.searchFoursquareVenuesByGeolocation();
};

CheckinController.$inject = ['$scope', '$state', 'NativeCheckin', '$ionicScrollDelegate', 'location'];

angular.module('waddle.checkin', [])
  .controller('CheckinController', CheckinController);
})();