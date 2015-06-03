(function(){

var HypersController = function (Auth, UserRequests, MapFactory, FootprintRequests, $scope, $state, $ionicHistory) {
    
    // $scope.footprint = FootprintRequests.openFootprint;
  $scope.currentTab = FootprintRequests.currentTab;

  if($scope.currentTab === 'folders') {
    $scope.footprint = FootprintRequests.openFootprintFolders;
  } else if($scope.currentTab === 'notifications') {
    $scope.footprint = FootprintRequests.openFootprintNotifications;
  } else if($scope.currentTab === 'me') {
    console.log(FootprintRequests.openFootprintProfile);
    $scope.footprint = FootprintRequests.openFootprintProfile;
  } else {
    $scope.footprint = FootprintRequests.openFootprint;
  }

    console.log($scope.footprint);

    // $scope.getFootprintInteractions = function () {
    //   FootprintRequests.getFootprintInteractions($scope.footprint.checkin.checkinID)
    //   .then(function (footprintInteractions) {
    //       console.dir(footprintInteractions);
    //       // $scope.footprint.comments = footprintInteractions.data.comments;
    //       $scope.footprint.hypes = footprintInteractions.data.hypes;
    //   });
    // };
    // $scope.getFootprintInteractions();

    $scope.goBack = function() {
    	$ionicHistory.goBack();
    };

    // if($scope.headerTitle === 'folders') {
    //     $scope.subRouting = '-folders';
    //     $scope.footprint.user = UserRequests.loggedInUserInfo;
    //     $scope.getFootprintInteractions();
    // } else {
    //     $scope.subRouting = ''; 
    // }
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