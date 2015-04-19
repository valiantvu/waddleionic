(function(){

var ProfileController = function ($scope, $state, UserRequests, Auth, FootprintRequests, $ionicModal, $ionicPopup, $timeout, moment) {

	Auth.checkLogin()
  .then(function () {

		var footprints, hypelist, friends;
		var page = 0;
		var skip = 5;
		$scope.search = {};
		$scope.selectedFolderInfo = {};
    $scope.selectedFolder = null;
    $scope.newFolderInfo = {};
		$scope.foursquareConnected = false;
		$scope.instagramConnected = false;

		$scope.getUserProfileData = function () {
			if(UserRequests.userProfileData) {
				getFriendProfileData();
			}
			else {
				getOwnProfileData();
			}
		};

		$scope.checkUserID = function(facebookID) {
      if(facebookID === window.sessionStorage.userFbID) {
        return true;
      } else {
        return false;
      }
    };

		$scope.showFriendsList = function () {
			$scope.hypelist = null;
			$scope.footprints = null;

			if(friends) {
				$scope.friends = friends;
			}
			else {
				UserRequests.getFriendsList($scope.userInfo.facebookID, page, skip)
				.then(function (data) {
					console.log(data);
					friends = data.data;
					$scope.friends = friends;
				})
			}
		};

		$scope.showFootprints = function () {
			$scope.hypelist = null;
			$scope.friends = null;
			$scope.footprints = footprints;
		};

		$scope.showHypeList = function () {
			$scope.footprints = null;
			$scope.friends = null;
			if(hypelist) {
				console.log(hypelist);
				$scope.hypelist = hypelist;
			}
			else {
				UserRequests.getBucketList($scope.userInfo.facebookID, page, skip)
				.then(function (data) {
					hypelist = data.data;
					$scope.hypelist = hypelist;
				})
			}
		};

		$scope.loadFriendPage = function (userInfo) {
			UserRequests.userProfileData = userInfo;
			$scope.getUserProfileData();
			hypelist = null;
			$scope.hypelist = null;
			$scope.friends = null;
			friends = null;
		};

		
		$scope.searchUserFootprints = function () {
      if($scope.search.query.length > 2) {
        UserRequests.searchUserFootprints($scope.userInfo.facebookID, $scope.search.query, 0, 10)
        .then(function(footprints) {
          $scope.footprints = footprints.data;
          $scope.moreDataCanBeLoaded = false;
        })
      }
    };


		$scope.searchFriendsList = function () {
      if($scope.search.query.length > 2) {
        UserRequests.searchFriendsList($scope.userInfo.facebookID, $scope.search.query, 0, 10)
        .then(function (friends) {
        	console.log(friends);
          $scope.friends = friends.data;
          $scope.moreDataCanBeLoaded = false;
        })
      }
    };

    $scope.bifurcateSearch = function () {
    	if($scope.footprints) {
    		console.log('footprintsss')
    		$scope.searchUserFootprints();
    	}
    	else if($scope.friends) {
    		console.log('freidsss')
    		$scope.searchFriendsList();
    	}
    };

    $scope.clearSearch = function () {
      $scope.search = {};
      page = 0;
      $scope.moreDataCanBeLoaded = true;
      if($scope.footprints) {
	      $scope.showFootprints();
      }
      else if($scope.friends) {
      	$scope.showFriendsList();
      }
    };

    $scope.passSelectedFolderInfo = function(folder, $index) {
      $scope.selectedFolder = $index;
      $scope.selectedFolderInfo.name = folder.folder.name;
      // $scope.selectedFolderInfo.description = folder.folder.description;
    };


		$scope.openFootprint = function(footprint, index) {
			console.log(FootprintRequests.openFootprint);
      FootprintRequests.openFootprint = footprint;
			console.log(FootprintRequests.openFootprint);
      FootprintRequests.selectedFootprintIndex = index;
    };

		$scope.logout = Auth.logout;

		$scope.addFoursquare = function () {
			if(!$scope.foursquareConnected) {
			  window.location.href = "https://foursquare.com/oauth2/authenticate?client_id=3XX0HGXBG4ZNKNFPN5F1LBSS4JCT3J0P3UBKLDMSR3BQNJKU&response_type=code&redirect_uri=http://waddleionic.herokuapp.com/fsqredirect"
			}
		};

		$scope.addInstagram= function () {
			if(!$scope.instagramConnected) {
			 	window.location.href = "https://api.instagram.com/oauth/authorize/?client_id=45be920fd11a4a5b98014e92d16d5117&redirect_uri=http://waddleionic.herokuapp.com/instagramredirect&response_type=code"
			}
		};

		var getFriendProfileData = function () {
			$scope.userInfo = UserRequests.userProfileData;
			UserRequests.userProfileData = null;
			UserRequests.getUserData($scope.userInfo.facebookID, window.sessionStorage.userFbID, page, skip)
			.then(function (data) {
				console.log(data.data)
				footprints = data.data.footprints;
				$scope.footprints = footprints;
			})
		};

		var getOwnProfileData = function () {
			console.log(UserRequests.allData);
			UserRequests.getUserData(window.sessionStorage.userFbID, window.sessionStorage.userFbID, page, skip)
			.then(function (data) {
				console.log(data.data);
				$scope.userInfo = data.data.user;
				footprints = data.data.footprints;
				$scope.footprints = footprints;
				if($scope.userInfo.foursquareID) {
					$scope.foursquareConnected = true;
				}
				if($scope.userInfo.instagramID) {
					$scope.instagramConnected = true;
				}
			})
		};

		$scope.getUserProfileData();
    $scope.$on('$stateChangeSuccess', function($currentRoute, $previousRoute) {
      if($previousRoute.name === 'tab.profile' && FootprintRequests.deletedFootprint) {
        $scope.footprints.splice(FootprintRequests.selectedFootprintIndex, 1);
        FootprintRequests.deletedFootprint = false;
      }
    });

    $scope.viewFoldersList = function() {
      UserRequests.fetchFolders(window.sessionStorage.userFbID, 0, 10)
      .then(function (folders) {
        $scope.folders = folders.data;
        UserRequests.userFolderData = folders.data
        console.log($scope.folders)
      })
    };

    $scope.viewFoldersList();


    $scope.addFootprintToFolder = function (checkinID, folderName, index) {
      UserRequests.addFootprintToFolder(window.sessionStorage.userFbID, checkinID, folderName)
      .then(function (data) {
        $scope.footprints[index].folders = [];
        $scope.footprints[index].folders.push(data.data[0].folder);
        $scope.showCreationSuccessAlert();
        // console.log(data);
      })
    };

    $scope.createFolderAndAddFootprintToFolder = function (folderName, folderDescription, selectedFootprintCheckinID, index) {
      // console.log(folderName);
      // console.log(folderDescription);
      UserRequests.addFolder(window.sessionStorage.userFbID, folderName, folderDescription)
      .then(function (data) {
        console.log(data);
        UserRequests.addFootprintToFolder(window.sessionStorage.userFbID, selectedFootprintCheckinID, folderName)
        .then(function (data) {
          // console.log(data)
          $scope.footprints[index].folders = [];
          $scope.footprints[index].folders.push(data.data[0].folder);
          $scope.showCreationSuccessAlert();
        })
      });
    };


    $scope.passSelectedFolderInfo = function(folder, $index) {
      $scope.selectedFolder = $index;
      $scope.selectedFolderInfo.name = folder.folder.name;
      // $scope.selectedFolderInfo.description = folder.folder.description;
    }

    $scope.fetchFolderContents = function (folderName) {
      UserRequests.fetchFolderContents(window.sessionStorage.userFbID, folderName, 0, 15)
      .then(function (folderContents) {
        $scope.folderContents = folderContents.data;
        console.log(folderContents);
      })
    };

    $scope.deleteFootprint = function (checkinID, facebookID, index) {
      var splicedElem;
      if(window.sessionStorage.userFbID === facebookID) {
        console.log('facebookIDs match')
        var deleteFootprintData = {
          facebookID: window.sessionStorage.userFbID,
          checkinID: checkinID
        };
        FootprintRequests.deleteFootprint(deleteFootprintData)
        .then(function(data) {
          splicedElem = footprints.splice(index, 1);
          $scope.footprints = footprints;
          console.log(splicedElem);
          $scope.showCreationSuccessAlert();
          console.log(data);
        });
      }
    };

		  $scope.showPopup = function(footprintCheckinID, $index) {
      console.log('footprint index', $index);
      $scope.selectedFootprintIndex = $index;
      $scope.selectedFootprintCheckinID = footprintCheckinID;

      // An elaborate, custom popup
      $scope.myPopup = $ionicPopup.show({
        templateUrl: 'folder-list.html',
        title: 'Create or Select a Folder',
        // subTitle: 'Please use normal things',
        scope: $scope,
        buttons: [
          { text: 'Cancel' },
          {
            text: '<b>Save</b>',
            type: 'button-positive',
            onTap: function(e) {
             $scope.addFootprintToFolder($scope.selectedFootprintCheckinID, $scope.selectedFolderInfo.name, $index);
            }
          }
        ]
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

    $scope.openOptions = function (footprint, index) {
        $scope.selectedFootprintUserID = footprint.user.facebookID;
        $scope.selectedFootprintCheckinID = footprint.checkin.checkinID;
        $scope.selectedFootprintIndex = index;
        $scope.optionsPopup = $ionicPopup.show({
        templateUrl: 'options-menu.html',
        scope: $scope
      });
    };

    $scope.openDeleteFootprintPopup = function () {
      $scope.optionsPopup.close();
      var deleteFootprintPopup = $ionicPopup.show({
        templateUrl: 'delete-footprint.html',
        // title: 'Add Folder',
        scope: $scope,
        buttons: [
          { text: 'Cancel' },
          {
            text: '<b>Yes</b>',
            type: 'button-energized',
            onTap: function(e) {
                $scope.deleteFootprint($scope.selectedFootprintCheckinID, $scope.selectedFootprintUserID, $scope.selectedFootprintIndex);
            }
          }
        ]
      });
    };

	  $ionicModal.fromTemplateUrl('settings.html', {
	    scope: $scope,
	    animation: 'slide-in-up'
	  }).then(function(modal) {
	    $scope.modal = modal;
	  });

	  $scope.openModal = function() {
	    $scope.modal.show();
	  };

	  $scope.closeModal = function() {
	    $scope.modal.hide();
	  };

	  //Cleanup the modal when we're done with it!
	  $scope.$on('$destroy', function() {
	    $scope.modal.remove();
	  });

	  // Execute action on hide modal
	  $scope.$on('modal.hidden', function() {
	    // Execute action
	  });
	  // Execute action on remove modal
	  $scope.$on('modal.removed', function() {
	    // Execute action
	  });

	  moment.locale('en', {
      relativeTime : {
        future: 'in %s',
        past:   '%s',
        s:  '%ds',
        m:  '1m',
        mm: '%dm',
        h:  'h',
        hh: '%dh',
        d:  '1d',
        dd: '%dd',
        M:  '1mo',
        MM: '%dmo',
        y:  '1y',
        yy: '%dy'
      }
    });
  })




};

ProfileController.$inject = ['$scope', '$state', 'UserRequests', 'Auth', 'FootprintRequests', '$ionicModal', '$ionicPopup', '$timeout', 'moment']

angular.module('waddle.profile', [])
  .controller('ProfileController', ProfileController);

})();