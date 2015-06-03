(function(){

	var WalkthroughController = function ($scope, $state, $ionicSlideBoxDelegate) {
		  // Called to navigate to the main app

		  // if(UserRequests.allData.footprintsCount) {
		  //   $state.go('tab.home');
		  // }

		  $scope.startApp = function() {
		    $state.go('tab.home');
		  };
		  $scope.next = function() {
		    $ionicSlideBoxDelegate.next();
		  };
		  $scope.previous = function() {
		    $ionicSlideBoxDelegate.previous();
		  };
		  // Called each time the slide changes
		  $scope.slideChanged = function(index) {
		    $scope.slideIndex = index;

		  };  
	};

	WalkthroughController.$inject = ['$scope', '$state', '$ionicSlideBoxDelegate'];

	angular.module('waddle.walkthrough', [])
	  .controller('WalkthroughController', WalkthroughController);
})();