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

	$scope.searchFoursquareVenuesBySearchQueryAndNearKeyword = function () {
		var query;
		if($scope.search.query && $scope.search.near) {
			query = $scope.search.query.replace(" ", "%20");
			NativeCheckin.searchFoursquareVenuesBySearchQueryAndNearKeyword(window.sessionStorage.userFbID, query, $scope.search.near)
			.then(function (venues) {
				console.log(venues);
				$scope.venues = venues.data;
			});
		} else if ($scope.search.query) {
			query = $scope.search.query.replace(" ", "%20");
			console.log(query);
			NativeCheckin.searchFoursquareVenuesBySearchQueryAndGeolocation(window.sessionStorage.userFbID, currentLocation, query)
			.then(function (venues) {
				console.log(venues);
				$scope.venues = venues.data;
			});
		}
	};

	// $scope.searchFoursquareVenuesBySearchQueryAndGeolocation = function () {

	// }

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