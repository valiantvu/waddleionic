(function(){

var ProfileController = function ($scope, $state, UserRequests) {

	var page = 0;
	var skip = 5;

	$scope.getUserProfileData = function () {
		console.log(UserRequests.userProfileData);
		if(UserRequests.userProfileData) {
			getFriendProfileData();
		}
		else {
			getOwnProfileData();
		}
	}

	var getFriendProfileData = function () {
		$scope.userInfo = UserRequests.userProfileData;
		UserRequests.userProfileData = null;
			UserRequests.getUserData($scope.userInfo.facebookID, window.sessionStorage.userFbID, page, skip)
			.then(function (data) {
				$scope.footprints = data.data.footprints;
			})
	}

	var getOwnProfileData = function () {
		UserRequests.getUserData(window.sessionStorage.userFbID, window.sessionStorage.userFbID, page, skip)
		.then(function (data) {
			console.log(data.data);
			$scope.userInfo = data.data.user;
			$scope.footprints = data.data.footprints;
		})
	}


	$scope.getUserProfileData();


};

ProfileController.$inject = ['$scope', '$state', 'UserRequests']

angular.module('waddle.profile', [])
  .controller('ProfileController', ProfileController);

})();