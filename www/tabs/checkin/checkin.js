(function(){

var CheckinController = function ($scope, $state, NativeCheckin, $ionicModal) {	

	$scope.checkinInfo = {footprintCaption: null};

	$scope.searchFoursquareVenues = function () {
		// NativeCheckin.getCurrentLocation()
		// .then(function (location) {
		// 	// $scope.location = location.coords.latitude;
		// 	var currentLocation = {
		// 		lat: location.coords.latitude,
		// 		lng: location.coords.longitude
		// 	};
		  var currentLocation = {lat:40.753522 , lng: -74.272922}
			NativeCheckin.searchFoursquareVenues("10202833487341857", currentLocation)
			.then(function (venues) {
				$scope.venues = venues.data;
			})
		// });
	}

	$scope.passSelectedVenueInfoToPostModal = function (venueInfo) {
		$scope.venue = venueInfo;
	}

	$scope.sendCheckinDataToServer = function(venueInfo) {
		// venueInfo.facebookID = window.sessionStorage.userFbID;
		venueInfo.facebookID = "10202833487341857";
		venueInfo.footprintCaption = $scope.checkinInfo.footprintCaption;
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

	$scope.showCaption = function() {
		console.log($scope.checkinInfo.footprintCaption);
	}

	$ionicModal.fromTemplateUrl('checkin-post.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });

  $scope.openModal = function() {
    $scope.modal.show();
  };

  $scope.closeModal = function() {
    $scope.modal.hide();
  };

  //Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });

  // Execute action on hide modal
  $scope.$on('modal.hidden', function() {
    // Execute action
  });
  // Execute action on remove modal
  $scope.$on('modal.removed', function() {
    // Execute action
  });

};

CheckinController.$inject = ['$scope', '$state', 'NativeCheckin', '$ionicModal']

angular.module('waddle.checkin', [])
  .controller('CheckinController', CheckinController);

})();