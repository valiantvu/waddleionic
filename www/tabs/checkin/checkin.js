(function(){

var CheckinController = function ($scope, $state, NativeCheckin, $ionicScrollDelegate) {	
  console.log('Checkin controller');
  $scope.search = {};
  $scope.showSearch = false;
  var currentLocation = {};

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
		} else if(!$scope.search.query && !$scope.search.near) {
			$scope.searchFoursquareVenuesByGeolocation();
		}
	};

	$scope.searchFoursquareVenuesByGeolocation = function () {
    NativeCheckin.getLocation()
    .then(function(location) {
        currentLocation = {
          lat: location.coords.latitude,
          lng: location.coords.longitude
        };
        console.dir(currentLocation);
        return NativeCheckin.searchFoursquareVenuesByGeolocation(window.sessionStorage.userFbID, currentLocation);
    })
    .then(function (venues) {
      $scope.venues = venues.data;
    })
    .catch(function(err) {
      console.err(err);
    });
	};

	$scope.passSelectedVenueInfoToPostTab = function (venueInfo) {
		NativeCheckin.selectedVenue = venueInfo;
		console.log(NativeCheckin.selectedVenue);
	};

	$scope.searchFoursquareVenuesByGeolocation();
};

CheckinController.$inject = ['$scope', '$state', 'NativeCheckin', '$ionicScrollDelegate'];

angular.module('waddle.checkin', [])
  .controller('CheckinController', CheckinController);
})();