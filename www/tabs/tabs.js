(function(){

var TabsController = function ($scope, $state, $ionicHistory) {
  $scope.loadVenueList = function () {
    // $state.go('tab.checkin', {}, {reload: true});
    $state.go('tab.checkin');
  };

};
  

TabsController.$inject = ['$scope', '$state', '$ionicHistory'];


angular.module('waddle.tabs', [])
  .controller('TabsController', TabsController)
})();
