(function(){

var TabsController = function ($scope, $state) {
  $scope.loadVenueList = function () {
    // $state.go('tab.checkin', {}, {reload: true});
    $state.go('tab.checkin');
  }
};
  

TabsController.$inject = ['$scope', '$state'];


angular.module('waddle.tabs', [])
  .controller('TabsController', TabsController)
})();
