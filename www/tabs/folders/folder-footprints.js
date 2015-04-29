(function(){

var FolderFootprintsController = function (Auth, UserRequests, FootprintRequests, $scope, $state, $ionicHistory) {
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

    $scope.goBack = function() {
      $ionicHistory.goBack();
    };

    // FootprintRequests.currentTab = 'folder-footprints';
    
    $scope.openFolder = FootprintRequests.openFolder;
    // Add 2 to index when using background image for SVG due 
    // to adding 1 before and after % operation to avoid zero-related errors
    $scope.openFolderIndex = FootprintRequests.openFolderIndex;
    console.log($scope.openFolder);

    $scope.openFootprint = function(footprint, index) {
      FootprintRequests.openFootprint = footprint;
      FootprintRequests.selectedFootprintIndex = index;
    };

    $scope.fetchFolderContents = function (folderName) {
      UserRequests.fetchFolderContents(window.sessionStorage.userFbID, folderName, 0, 15)
      .then(function (folderContents) {
        $scope.folderContents = folderContents.data;
        console.log(folderContents);
      });
    };

    $scope.fetchFolderContents($scope.openFolder);

    $scope.createFolderAndAddFootprintToFolder = function (folderName, folderDescription, selectedFootprintCheckinID, index) {
      // console.log(folderName);
      // console.log(folderDescription);
      UserRequests.addFolder(window.sessionStorage.userFbID, folderName, folderDescription)
      .then(function (data) {
        console.log(data);
        // Delete
        UserRequests.addFootprintToFolder(window.sessionStorage.userFbID, selectedFootprintCheckinID, folderName)
        .then(function (data) {
          // console.log(data)
          $scope.footprints[index].folders = [];
          $scope.footprints[index].folders.push(data.data[0].folder);
          $scope.showCreationSuccessAlert();
        })
      });
    };

    $scope.showFolderCreationPopup = function() {
      $scope.newFolderInfo = {};
      $scope.myPopup.close();
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
                $scope.createFolderAndAddFootprintToFolder($scope.newFolderInfo.name, $scope.newFolderInfo.description, $scope.selectedFootprintCheckinID, $scope.selectedFootprintIndex);
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

FolderFootprintsController.$inject = ['Auth', 'UserRequests', 'FootprintRequests', '$scope', '$state', '$ionicHistory'];

angular.module('waddle.folder-footprints', [])
  .controller('FolderFootprintsController', FolderFootprintsController);
})();