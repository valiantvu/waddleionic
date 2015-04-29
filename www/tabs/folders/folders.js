(function(){

var FoldersController = function (Auth, UserRequests, FootprintRequests, $ionicModal, $ionicPopup, $timeout, $scope, $state) {
  Auth.checkLogin()
  .then(function () {
    $scope.folders = [];
    $scope.searchFolders = {};
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

    $scope.getUserData = function () {
        UserRequests.fetchFolders(window.sessionStorage.userFbID, page, skipAmount)
        .then(function (data) {
            if (data.data.length > 0) {
              console.dir(data.data);
              $scope.folders = data.data;
              // $scope.footprints = $scope.footprints.concat(data.data.footprints);
              // FootprintRequests.footprints = $scope.footprints;
              if (data.data.length >= skipAmount) {
                page++;
              }
              console.log('page: ', page);
            } else {
              console.log('No more data for folders.');
              // $scope.moreDataCanBeLoaded = false;
            }
            // $scope.$broadcast('scroll.infiniteScrollComplete');
        });
    };

    $scope.getUserData();
    
    $scope.searchFoldersByName = function () {
      // console.log($scope.searchFolders.query);
      if($scope.searchFolders.query.length > 0) {
        UserRequests.searchFoldersByName(window.sessionStorage.userFbID, $scope.searchFolders.query)
        .then(function(folders) {
          $scope.folders = folders.data;
          $scope.moreDataCanBeLoaded = false;
        })
      }
    };

    $scope.clearSearch = function () {
      $scope.searchFolders = {};
      page = 0;
      $scope.moreDataCanBeLoaded = true;
      $scope.getUserData();
    };

    $scope.createFolder = function (folderName, folderDescription) {
      console.log(window.sessionStorage.userFbID);
      console.log(folderName);
      console.log(folderDescription);
      UserRequests.addFolder(window.sessionStorage.userFbID, folderName, folderDescription)
      .then(function (data) {
        console.log('folder created');
        console.log(data);
        $scope.getUserData();
        $scope.showCreationSuccessAlert();
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

FoldersController.$inject = ['Auth', 'UserRequests', 'FootprintRequests', '$ionicModal', '$ionicPopup', '$timeout', '$scope', '$state'];

angular.module('waddle.folders', [])
  .controller('FoldersController', FoldersController);
})();