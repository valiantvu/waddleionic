(function(){

var FoldersController = function (Auth, UserRequests, FootprintRequests, $ionicModal, $scope, $state) {
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

    FootprintRequests.currentTab = 'folders';
    
    $scope.openFootprint = function(footprint) {
      FootprintRequests.openFootprint = footprint;
    };

    $scope.openFolder = function(folder) {
      console.log('changing states');
      FootprintRequests.openFolder = folder;
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
              page++;
              console.log('page: ', page);
            } else {
              console.log('No more data for folders.');
              // $scope.moreDataCanBeLoaded = false;
            }
            // $scope.$broadcast('scroll.infiniteScrollComplete');
        });
    };

    $scope.getUserData();

    $ionicModal.fromTemplateUrl('folder-contents.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
    });
    
    $scope.fetchFolderContents = function (folderName) {
      UserRequests.fetchFolderContents(window.sessionStorage.userFbID, folderName, 0, 15)
      .then(function (folderContents) {
        $scope.folderContents = folderContents.data;
        console.log(folderContents);
      })
    };

    $scope.openModal = function(folderName) {
      $scope.fetchFolderContents(folderName);
      $scope.selectedFolderInfo.name = folderName;
      $scope.modal.show();
    };

    $scope.closeModal = function() {
      $scope.modal.hide();
      //TO-DO: figure out how to propertly implement remove() in order to avoid memory leaks
      // $scope.modal.remove();
    };

    $scope.clearSearch = function () {
      $scope.search = {};
      $scope.footprints = [];
      page = 0;
      $scope.moreDataCanBeLoaded = true;
      $scope.getUserData();
    };

  });
};

FoldersController.$inject = ['Auth', 'UserRequests', 'FootprintRequests', '$ionicModal', '$scope', '$state'];

angular.module('waddle.folders', [])
  .controller('FoldersController', FoldersController);
})();