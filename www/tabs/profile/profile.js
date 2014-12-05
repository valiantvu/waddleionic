(function(){

var ProfileController = function ($scope, $state, UserRequests) {	

	$scope.getUserInfo = function (userFbID) {
		UserRequests.getUserInfo(userFbID)
		.then(function (data) {
			$scope.userInfo = data.data;
			console.log(data);
		})
	}

	$scope.getUserInfo(window.sessionStorage.userFbID);

};

ProfileController.$inject = ['$scope', '$state', 'UserRequests']

angular.module('waddle.profile', [])
  .controller('ProfileController', ProfileController);

})();