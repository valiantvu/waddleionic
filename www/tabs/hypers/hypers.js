(function(){

var HypersController = function (Auth, UserRequests, MapFactory, FootprintRequests, $scope, $state, $ionicHistory) {
    
    $scope.footprint = FootprintRequests.openFootprint;

    $scope.goBack = function() {
    	$ionicHistory.goBack();
    };
    // FootprintRequests.getFootprintInteractions($scope.footprint.checkin.checkinID)
    //   .then(function (data) {
    //     console.log('getFootprintInteractions: ', data);
    //     $scope.footprint.hypes = data.data.hypeGivers;
    //   });
};

HypersController.$inject = ['Auth', 'UserRequests', 'MapFactory', 'FootprintRequests', '$scope', '$state', '$ionicHistory'];

angular.module('waddle.hypers', [])
  .controller('HypersController', HypersController);
})();