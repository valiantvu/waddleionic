(function(){

	var RedirectController = function ($state, $ionicHistory) {
		  // Called to navigate to the main app
		var redirect = function() {
			console.log('redirecting...');
			$ionicHistory.clearCache()
			.then(function() {
			  $state.go('tab.home');
			})
		};
		redirect();
	};

	RedirectController.$inject = ['$state', '$ionicHistory'];

	angular.module('waddle.redirect', [])
	  .controller('RedirectController', RedirectController);
})();