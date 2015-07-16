(function(){

var FolderFootprintsController = function (Auth, UserRequests, FootprintRequests, $scope, $state, $ionicHistory, $ionicScrollDelegate) {
  Auth.checkLogin()
  .then(function () {
    $scope.folderContents = [];
    $scope.searchFolderContents = {};
    $scope.showFolderContentsSearch = false;
    $scope.moreDataCanBeLoaded = true;
    $scope.selectedFolderInfo = {};
    $scope.selectedFolder = null;
    $scope.newFolderInfo = {};
    var page = 0;
    var skipAmount = 10;

    $scope.headerTitle = FootprintRequests.currentTab;

    if($scope.headerTitle === 'folders') {
    $scope.subRouting = '-folders';
  } else if($scope.headerTitle === 'me') {
    $scope.subRouting = '-profile';
  } else if ($scope.headerTitle === 'feed') {
    $scope.subRouting = '';
  }

    $scope.goBack = function() {
      $ionicHistory.goBack();
    };

    // FootprintRequests.currentTab = 'folder-footprints';
    
    $scope.openFolder = FootprintRequests.openFolder;
    $scope.openFolderIndex = FootprintRequests.openFolderIndex;
    console.log($scope.openFolder);

    $scope.checkUserID = function(footprint) {

      if($scope.openFolder === "Suggested By Friends") {
        if(footprint.user.facebookID === footprint.suggester.facebookID) {
          return true;
        } else {
          return false;
        }
      } else {
        if(footprint.user.facebookID === window.sessionStorage.userFbID) {
          return true;
        } else {
          return false;
        }
      }
      
    };

    $scope.openFootprint = function(footprint, index) {
      console.log(footprint);
      FootprintRequests.openFootprintFolders = footprint;
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

    $scope.toggleFolderContentsSearch = function() {
      $scope.showFolderContentsSearch = $scope.showFolderContentsSearch === true ? false : true;
      if ($scope.showFolderContentsSearch) {
        $ionicScrollDelegate.scrollTop();
      }
    };

    $scope.searchFolderContents = function () {
      // console.log($scope.searchFolders.query);
      if($scope.searchFolderContents.query.length > 0) {
        UserRequests.searchFoldersByName(window.sessionStorage.userFbID, $scope.searchFolders.query, 0, skipAmount)
        .then(function(folders) {
          $scope.folders = folders.data;
          $scope.moreDataCanBeLoaded = false;
        });
      } else {
        $scope.clearSearch();
      }
    };

    $scope.clearSearch = function () {
      $scope.searchFolders = {};
      $scope.getUserData(true);
    };

  });
};

FolderFootprintsController.$inject = ['Auth', 'UserRequests', 'FootprintRequests', '$scope', '$state', '$ionicHistory', '$ionicScrollDelegate'];

angular.module('waddle.folder-footprints', [])
  .controller('FolderFootprintsController', FolderFootprintsController);
})();