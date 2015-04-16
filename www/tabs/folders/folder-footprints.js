(function(){

var FolderFootprintsController = function (Auth, UserRequests, FootprintRequests, $scope, $state) {
  Auth.checkLogin()
  .then(function () {
    $scope.folders = [];
    $scope.search = {};
    $scope.moreDataCanBeLoaded = true;
    $scope.selectedFolderInfo = {};
    $scope.selectedFolder = null;
    $scope.newFolderInfo = {};
    var page = 0;
    var skipAmount = 5;

    // FootprintRequests.currentTab = 'folder-footprints';
    
    $scope.openFolder = FootprintRequests.openFolder;


    $scope.openFootprint = function(footprint) {
      FootprintRequests.openFootprint = footprint;
    };

    $scope.fetchFolderContents = function (folderName) {
      UserRequests.fetchFolderContents(window.sessionStorage.userFbID, folderName, 0, 15)
      .then(function (folderContents) {
        $scope.folderContents = folderContents.data;
        console.log(folderContents);
      });
    };

    $scope.fetchFolderContents($scope.openFolder);

  });
};

FolderFootprintsController.$inject = ['Auth', 'UserRequests', 'FootprintRequests', '$scope', '$state'];

angular.module('waddle.folder-footprints', [])
  .controller('FolderFootprintsController', FolderFootprintsController);
})();