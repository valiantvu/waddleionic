(function(){

var FolderFootprintsController = function (Auth, UserRequests, FootprintRequests, $scope, $state, $ionicHistory) {
  Auth.checkLogin()
  .then(function () {
    $scope.folderContents = [];
    $scope.search = {};
    $scope.moreDataCanBeLoaded = true;
    $scope.selectedFolderInfo = {};
    $scope.selectedFolder = null;
    $scope.newFolderInfo = {};
    var page = 0;
    var skipAmount = 10;

    $scope.goBack = function() {
      $ionicHistory.goBack();
    };

    // FootprintRequests.currentTab = 'folder-footprints';
    
    $scope.openFolder = FootprintRequests.openFolder;
    $scope.openFolderIndex = FootprintRequests.openFolderIndex;
    console.log($scope.openFolder);

    $scope.openFootprint = function(footprint, index) {
      FootprintRequests.openFootprint = footprint;
      FootprintRequests.selectedFootprintIndex = index;
    };

    $scope.fetchFolderContents = function () {
      UserRequests.fetchFolderContents(window.sessionStorage.userFbID, $scope.openFolder, page, skipAmount)
      .then(function (folderContents) {
        console.log(folderContents);
        if (folderContents.data.length < skipAmount && folderContents.data.length > 0) {
          $scope.folderContents = $scope.folderContents.concat(folderContents.data);
          $scope.moreDataCanBeLoaded = false;
        } else if (folderContents.data.length > 0) {
          $scope.folderContents = $scope.folderContents.concat(folderContents.data);
          page++;
        } else {
          console.log('No more data for folder footprints.');
          $scope.moreDataCanBeLoaded = false;
        }
      });
    };
  });
};

FolderFootprintsController.$inject = ['Auth', 'UserRequests', 'FootprintRequests', '$scope', '$state', '$ionicHistory'];

angular.module('waddle.folder-footprints', [])
  .controller('FolderFootprintsController', FolderFootprintsController);
})();