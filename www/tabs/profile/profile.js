(function(){

var ProfileController = function ($scope, $state, UserRequests, Auth, $ionicModal) {

	Auth.checkLogin()
  .then(function () {

		var footprints, hypelist, friends;
		var page = 0;
		var skip = 5;

		$scope.getUserProfileData = function () {
			if(UserRequests.userProfileData) {
				getFriendProfileData();
			}
			else {
				getOwnProfileData();
			}
		}

		$scope.showFriendsList = function () {
			$scope.hypelist = null;
			$scope.footprints = null;

			if(friends) {
				$scope.friends = friends;
			}
			else {
				UserRequests.getFriendsList($scope.userInfo.facebookID, page, skip)
				.then(function (data) {
					console.log(data);
					friends = data.data;
					$scope.friends = friends;
				})
			}
		}

		$scope.showFootprints = function () {
			$scope.hypelist = null;
			$scope.friends = null;
			$scope.footprints = footprints;
		}

		$scope.showHypeList = function () {
			$scope.footprints = null;
			$scope.friends = null;
			if(hypelist) {
				console.log(hypelist);
				$scope.hypelist = hypelist;
			}
			else {
				UserRequests.getBucketList($scope.userInfo.facebookID, page, skip)
				.then(function (data) {
					hypelist = data.data;
					$scope.hypelist = hypelist;
				})
			}
		}

		$scope.loadFriendPage = function (userInfo) {
			UserRequests.userProfileData = userInfo;
			$scope.getUserProfileData();
			hypelist = null;
			$scope.hypelist = null;
			$scope.friends = null;
			friends = null;
		}

		$scope.logout = Auth.logout;

		$scope.addFoursquare = function () {
			console.log('hiiii');
			window.location.href = "https://foursquare.com/oauth2/authenticate?client_id=3XX0HGXBG4ZNKNFPN5F1LBSS4JCT3J0P3UBKLDMSR3BQNJKU&response_type=code&redirect_uri=http://waddleionic.herokuapp.com/fsqredirect"
		}

		$scope.addInstagram= function () {
			console.log('addInstagram');
		}

		var getFriendProfileData = function () {
			$scope.userInfo = UserRequests.userProfileData;
			UserRequests.userProfileData = null;
			UserRequests.getUserData($scope.userInfo.facebookID, window.sessionStorage.userFbID, page, skip)
			.then(function (data) {
				console.log(data.data)
				footprints = data.data.footprints;
				$scope.footprints = footprints;
			})
		}

		var getOwnProfileData = function () {
			console.log(UserRequests.allData);
			UserRequests.getUserData(window.sessionStorage.userFbID, window.sessionStorage.userFbID, page, skip)
			.then(function (data) {
				console.log(data.data);
				$scope.userInfo = data.data.user;
				footprints = data.data.footprints;
				$scope.footprints = footprints;
			})
		}

		$scope.getUserProfileData();

	  $ionicModal.fromTemplateUrl('add-platforms.html', {
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
  })




};

ProfileController.$inject = ['$scope', '$state', 'UserRequests', 'Auth', '$ionicModal']

angular.module('waddle.profile', [])
  .controller('ProfileController', ProfileController);

})();