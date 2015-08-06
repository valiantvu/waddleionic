(function(){

var TabsController = function ($scope, $state, $ionicHistory) {
  $scope.loadVenueList = function () {
    // $state.go('tab.checkin', {}, {reload: true});
    $state.go('tab.checkin');
  };

  // $scope.reloadOwnProfile = function () {
  //   var historyId = $ionicHistory.currentHistoryId();
  //   console.dir(historyId);
  //   var history = $ionicHistory.viewHistory().histories[historyId];
  //   console.dir(history);
  //   // set the view 'depth' back in the stack as the back view
  //   var targetViewIndex = history.stack.length - 1;
  //   $ionicHistory.backView(history.stack[targetViewIndex]);
  //   // navigate to it
  //   $ionicHistory.goBack();
  // };

};
  

TabsController.$inject = ['$scope', '$state', '$ionicHistory'];


angular.module('waddle.tabs', [])
  .controller('TabsController', TabsController)
})();
