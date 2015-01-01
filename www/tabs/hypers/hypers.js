(function(){

var HypersController = function (Auth, UserRequests, MapFactory, FootprintRequests, $scope, $state) {
    
    $scope.footprint = FootprintRequests.openFootprint;
    FootprintRequests.getFootprintInteractions($scope.footprint.checkin.checkinID)
      .then(function (data) {
        console.log('getFootprintInteractions: ', data);
        $scope.footprint.hypes = data.data.hypeGivers;
      });
};

HypersController.$inject = ['Auth', 'UserRequests', 'MapFactory', 'FootprintRequests', '$scope', '$state'];

angular.module('waddle.hypers', [])
  .controller('HypersController', HypersController);
})();