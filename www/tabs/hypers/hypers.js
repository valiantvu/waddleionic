(function(){

var HypersController = function (Auth, UserRequests, MapFactory, FootprintRequests, $scope, $state, $ionicHistory) {
    
  $scope.currentTab = FootprintRequests.currentTab;

  $scope.$on('$ionicView.enter', function (scopes, states) {
    console.log(states);
    if(states.stateName === 'tab.hypers-folders') {
      $scope.footprint = FootprintRequests.openFootprintFolders;
    } else if(states.stateName === 'tab.hypers-notifications') {
      $scope.footprint = FootprintRequests.openFootprintNotifications;
    } else if(states.stateName === 'tab.hypers-profile') {
      $scope.footprint = FootprintRequests.openFootprintProfile;
    } else {
      $scope.footprint = FootprintRequests.openFootprint;
    }
  });  


  $scope.goBack = function() {
    $ionicHistory.goBack();
  };

};

HypersController.$inject = ['Auth', 'UserRequests', 'MapFactory', 'FootprintRequests', '$scope', '$state', '$ionicHistory'];

angular.module('waddle.hypers', [])
  .controller('HypersController', HypersController);
})();