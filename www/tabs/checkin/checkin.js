(function(){

var CheckinController = function ($scope, $state, NativeCheckin, UserRequests, $ionicModal, $ionicPlatform, $ionicPopup, $timeout) {	

	// $scope.show = function() {
 //    $ionicLoading.show({
 //      content: '<i class="icon ion-load-c light"></i>',
 //      animation: 'fade-in'
 //    });
 //  };

 //  $scope.hide = function(){
 //    $ionicLoading.hide();
 //  };

	 


	$scope.searchFoursquareVenues = function () {
		// $scope.show();
		NativeCheckin.getCurrentLocation()
		.then(function (location) {
			console.log(location);
			var currentLocation = {
				lat: location.coords.latitude,
				lng: location.coords.longitude
			};
			NativeCheckin.searchFoursquareVenues(window.sessionStorage.userFbID, currentLocation)
			.then(function (venues) {
				// $scope.hide();
				$scope.venues = venues.data;
			})
		});
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


  $ionicPlatform.ready(function() {
	  $scope.searchFoursquareVenues();
	});
};

CheckinController.$inject = ['$scope', '$state', 'NativeCheckin', 'UserRequests', '$ionicModal', '$ionicPlatform', '$ionicPopup', '$timeout'];

angular.module('waddle.checkin', [])
  .controller('CheckinController', CheckinController);
})();