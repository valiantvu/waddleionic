(function(){

var HypersController = function (Auth, UserRequests, MapFactory, FootprintRequests, $scope, $state) {
    
    $scope.footprint = FootprintRequests.openFootprint;
};

HypersController.$inject = ['Auth', 'UserRequests', 'MapFactory', 'FootprintRequests', '$scope', '$state'];

angular.module('waddle.hypers', [])
  .controller('HypersController', HypersController);
})();