(function(){

var CheckinController = function ($scope, $state, NativeCheckin, UserRequests, $ionicModal, $ionicLoading, $ionicPopup, $timeout) {	

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
	}

	$scope.passSelectedVenueInfoToPostTab = function (venueInfo) {
		NativeCheckin.selectedVenue = venueInfo;
		console.log(NativeCheckin.selectedVenue);
	}

	$scope.searchFoursquareVenues();

};

CheckinController.$inject = ['$scope', '$state', 'NativeCheckin', 'UserRequests', '$ionicModal', '$ionicLoading', '$ionicPopup', '$timeout'];

angular.module('waddle.checkin', [])
  .controller('CheckinController', CheckinController);
})();