(function(){

var FoldersController = function (Auth, UserRequests, FootprintRequests, $scope, $state) {
  Auth.checkLogin()
  .then(function () {
    $scope.footprints = [];
    $scope.search = {};
    $scope.moreDataCanBeLoaded = true;
    var page = 0;
    var skipAmount = 5;

    FootprintRequests.currentTab = 'folders';
    
    $scope.folders = [1, 2];

    $scope.openFootprint = function(footprint) {
      FootprintRequests.openFootprint = footprint;
    };

    $scope.getUserData = function () {
        UserRequests.fetchFolders(window.sessionStorage.userFbID, page, skipAmount)
        .then(function (data) {
            if (data.data.length > 0) {
              console.dir(data.data);
              // $scope.footprints = $scope.footprints.concat(data.data.footprints);
              // FootprintRequests.footprints = $scope.footprints;
              // page++;
              // console.log('page: ', page);
            } else {
              console.log('No more data for folders.');
              // $scope.moreDataCanBeLoaded = false;
            }
            // $scope.$broadcast('scroll.infiniteScrollComplete');
        });
    };

    $scope.getUserData();

    $scope.clearSearch = function () {
      $scope.search = {};
      $scope.footprints = [];
      page = 0;
      $scope.moreDataCanBeLoaded = true;
      $scope.getUserData();
    };

  });
};

FoldersController.$inject = ['Auth', 'UserRequests', 'FootprintRequests', '$scope', '$state'];

angular.module('waddle.folders', [])
  .controller('FoldersController', FoldersController);
})();