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
    NativeCheckin.getCurrentLocation(
      function(location) {
        console.log(location);
        currentLocation = {
          lat: location.coords.latitude,
          lng: location.coords.longitude
        };
        NativeCheckin.searchFoursquareVenuesByGeolocation(window.sessionStorage.userFbID, currentLocation)
        .then(function (venues) {
          $scope.venues = venues.data;
        })
      },
      function (err) {
        $scope.err = {};
        if(err.code === 1) {
          $scope.err.message1 = 'Oh no! Looks like you didn’t allow location services!'; 
          $scope.err.message2 = 'This makes it harder for you to search for places to review. To enable location permissions, either 1) restart Waddle, tap the star tab, and tap "OK" on the pop-up dialog or 2) go to Settings on your iPhone —> scroll down to your list of apps —> select Waddle —> tap Location under ‘Allow Waddle to Access” —> select “While Using App”';
        } else {
          $scope.err.message1 = "Oh no! Looks like something went wrong with accessing your current location. Re-start the app and try again!";
        }
      }
    );
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