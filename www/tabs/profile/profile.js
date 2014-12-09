(function(){

var ProfileController = function ($scope, $state, UserRequests, $rootScope) {	

	$scope.getUserInfo = function (userFbID) {
		 console.log(UserRequests.userProfileData);
		 $scope.userInfo = UserRequests.userProfileData;
		// UserRequests.getUserInfo(userFbID)
		// .then(function (userInfo) {
		// 	$scope.userInfo = userInfo.data;
		// })
	}

	$scope.getUserInfo(window.sessionStorage.userFbID);

	$scope.setUserInfo = function (userInfo) {
		$scope.$apply(function () {
			$scope.userInfo = userInfo;
		});
			console.log('infooo:', $scope.userInfo)
	}


	// ionic.on("loadProfilePage", function (userInfo) {
	$rootScope.$on("loadProfilePage", function (event, userInfo) {
		// $scope.setUserInfo(userInfo.detail.target);
		$rootScope.$apply(function () {
			console.log("profile clicked");
			// $scope.userInfo = userInfo.detail.target;
			$scope.userInfo = userInfo
		});
		// console.log(userInfo.detail.target);
		console.log('userInfo: ', $scope.userInfo)
	})

	// if($scope.userInfo === undefined) {
	// 	$scope.getUserInfo(window.sessionStorage.userFbID);
	// }
	// $scope.$on('$destroy', profileDataListener);
};

ProfileController.$inject = ['$scope', '$state', 'UserRequests', '$rootScope']

angular.module('waddle.profile', [])
  .controller('ProfileController', ProfileController);

})();