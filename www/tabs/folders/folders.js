(function(){

var FoldersController = function (Auth, UserRequests, FootprintRequests, $ionicModal, $ionicPopup, $ionicScrollDelegate, $timeout, $scope, $state) {
  Auth.checkLogin()
  .then(function () {
    $scope.folders = [];
    $scope.searchFolders = {};
    $scope.showFolderSearch = false;
    $scope.moreDataCanBeLoaded = true;
    $scope.selectedFolderInfo = {};
    $scope.selectedFolder = null;
    $scope.newFolderInfo = {};
    var page = 0;
    var skipAmount = 5;

    FootprintRequests.currentTab = 'folders';

    $scope.openFolder = function(folder, index) {
      console.log('changing states');
      FootprintRequests.openFolder = folder;
      FootprintRequests.openFolderIndex = index;
      $state.transitionTo('tab.folder-footprints');
    };

    $scope.getUserData = function (reload) {

      if (reload) {
        page = 0;
        $scope.moreDataCanBeLoaded = false;
      }
      UserRequests.fetchFolders(window.sessionStorage.userFbID, page, skipAmount)
      .then(function (data) {
        console.log('getUserData called with reload: ', reload);
        if (data.data.length > 0) {
          console.dir(data.data);
          $scope.folders = reload ? data.data : $scope.folders.concat(data.data);
          if (reload) {
            $ionicScrollDelegate.scrollTop();
            $scope.moreDataCanBeLoaded = true;
          }
          page++;
          console.log('page: ', page);
        } else {
          console.log('No more data for folders.');
          $scope.moreDataCanBeLoaded = false;
        }
        $scope.$broadcast('scroll.infiniteScrollComplete');
      });
    };

    $scope.toggleFolderSearch = function() {
      $scope.showFolderSearch = $scope.showFolderSearch === true ? false : true;
      if ($scope.showFolderSearch) {
        $ionicScrollDelegate.scrollTop();
      }
    };
    
    $scope.searchFoldersByName = function () {
      // console.log($scope.searchFolders.query);
      if($scope.searchFolders.query.length > 0) {
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

    $scope.createFolder = function (folderName, folderDescription) {
      console.log(window.sessionStorage.userFbID);
      console.log(folderName);
      console.log(folderDescription);
      UserRequests.addFolder(window.sessionStorage.userFbID, folderName, folderDescription)
      .then(function (data) {
        console.log('folder created');
        console.log(data);
        // page = 0;
        // $scope.folders = [];
        $scope.getUserData(true);
        $scope.showCreationSuccessAlert();
      });
    };

    $scope.deleteFolderAndContents = function (folderName) {
      console.log(window.sessionStorage.userFbID);
      console.log(folderName);
      UserRequests.deleteFolderAndContents(window.sessionStorage.userFbID, folderName)
      .then(function (data) {
        console.log('folder deleted');
        console.log(data);
        $scope.getUserData(true);
      })
      .catch(function (err) {
        console.log(err);
      });
    };

    $scope.showFolderCreationPopup = function() {
      $scope.newFolderInfo = {};
      // An elaborate, custom popup
      var folderCreationPopup = $ionicPopup.show({
        templateUrl: 'add-folder.html',
        title: 'Add Folder',
        scope: $scope,
        buttons: [
          { text: 'Cancel' },
          {
            text: '<b>Save</b>',
            type: 'button-energized',
            onTap: function(e) {
                $scope.createFolder($scope.newFolderInfo.name, $scope.newFolderInfo.description);
            }
          }
        ]
      });
      // myPopup.then(function(res) {
      //   console.log('Tapped!', res);
      // });
    };

    $scope.showCreationSuccessAlert = function() {
      var creationSuccessAlert = $ionicPopup.show({
        title: 'New Folder Added!',
        templateUrl: 'folder-create-success.html'
      });
      // creationSuccessAlert.then(function(res) {
      // });
      $timeout(function() {
       creationSuccessAlert.close(); //close the popup after 1 second
      }, 1500);
    };
  });
};

FoldersController.$inject = ['Auth', 'UserRequests', 'FootprintRequests', '$ionicModal', '$ionicPopup', '$ionicScrollDelegate', '$timeout', '$scope', '$state'];

angular.module('waddle.folders', [])
  .controller('FoldersController', FoldersController);
})();