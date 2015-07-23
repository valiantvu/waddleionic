(function(){

var ProfileController = function ($scope, $state, UserRequests, Auth, FootprintRequests, $ionicModal, $ionicPopup, $timeout, moment, $localstorage) {

	Auth.checkLogin()
  .then(function () {

		var footprints, hypelist;
    var friends = [];
		var page = 0;
    var friendsPage = 0;
		var skip = 5;
    $scope.footprints = [];
    var user = window.sessionStorage.userFbID;
    $scope.moreDataCanBeLoaded = true;
    $scope.moreFriendsCanBeLoaded = true;
		$scope.search = {};
		$scope.selectedFolderInfo = {};
    $scope.selectedFolder = null;
    $scope.newFolderInfo = {};
		$scope.foursquareConnected = false;
		$scope.instagramConnected = false;

		FootprintRequests.currentTab = 'me';

    $scope.$on('$stateChangeSuccess', function($currentRoute, $previousRoute) {
      if($previousRoute.url === "/profile") {
        FootprintRequests.currentTab = 'me';
      }
      if($previousRoute.url === "/profile" && FootprintRequests.editedCheckin) {
        $scope.footprints[FootprintRequests.selectedFootprintIndex].checkin.rating = FootprintRequests.editedCheckin.rating;
        $scope.footprints[FootprintRequests.selectedFootprintIndex].checkin.caption = FootprintRequests.editedCheckin.caption;
        $scope.footprints[FootprintRequests.selectedFootprintIndex].checkin.photoLarge = FootprintRequests.editedCheckin.photoLarge;
        FootprintRequests.editedCheckin = false;
      }
    });

    $scope.getCorrectData = function () {
      if(friends.length) {
        $scope.showFriendsList();
      } else {
        $scope.getUserProfileData();
      }
    };

    $scope.moreCorrectDataCanBeLoaded = function () {
      // console.log('correctData');
        if(friends.length) {
          console.log($scope.moreFriendsCanBeLoaded);
        return $scope.moreFriendsCanBeLoaded;
      } else {
        return $scope.moreDataCanBeLoaded;
      }
    };

		$scope.getUserProfileData = function () {
   //    console.log('hello');
			// if(UserRequests.userProfileData) {
			// 	getFriendProfileData();
			// }
			// else {
			// 	getOwnProfileData();
			// }
          console.log('hello again')
      $scope.searchPlaceHolder = 'search footprints'
      console.log(user);
      UserRequests.getUserData(user, window.sessionStorage.userFbID, page, skip)
      .then(function (data) {
        console.log(data.data);
        $scope.userInfo = data.data.user;
        if(data.data.footprints.length > 0) {
          console.log(data.data);
          footprints = data.data.footprints;
          $scope.footprints = $scope.footprints.concat(footprints);
          page++;
          console.log('page: ', page);
          // $scope.getUserProfileData();
        } else {
          $scope.moreDataCanBeLoaded = false;
        }
          // if($scope.userInfo.foursquareID) {
          //  $scope.foursquareConnected = true;
          // }
          // if($scope.userInfo.instagramID) {
          //  $scope.instagramConnected = true;
          // }
        $scope.$broadcast('scroll.infiniteScrollComplete');
      })
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
			$scope.footprints = [];
      footprints = [];
      $scope.moreDataCanBeLoaded = true;
      page = 0;
      $scope.searchPlaceHolder = 'search friends'

			// if(friends.length) {
   //      console.log($scope.friends);
			// 	$scope.friends = friends;
			// }
			// else {
				UserRequests.getFriendsList($scope.userInfo.facebookID, friendsPage, skip)
				.then(function (friendsList) {
          if(friendsList.data.length > 0) {
					console.log(friendsList.data);
  				friends = friends.concat(friendsList.data);
					$scope.friends = friends;
          friendsPage++;
          // $scope.showFriendsList();
          } else {
            $scope.moreFriendsCanBeLoaded = false;
          }
          $scope.$broadcast('scroll.infiniteScrollComplete');

				})
			// }
		};

		$scope.showFootprints = function () {
      $scope.searchPlaceHolder = 'search footprints'
			$scope.hypelist = null;
			$scope.friends = [];
      friends = [];
      friendsPage = 0;
      $scope.moreFriendsCanBeLoaded = true;
			$scope.getUserProfileData();

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

		$scope.switchProfilePage = function (newUser) {
      page = 0;
      console.log(newUser);
      user = newUser.facebookID;
      $scope.userInfo = newUser;
      $scope.footprints = [];
			// UserRequests.userProfileData = userInfo;
	
			$scope.friends = [];
			friends = [];
      $scope.getUserProfileData();
      // getOwnProfileData();
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
      FootprintRequests.openFootprintProfile = footprint;
      FootprintRequests.selectedFootprintIndex = index;
    };

		$scope.logout = function() {
      $scope.closeModal();
      Auth.logout();
    };

    // $scope.logout = Auth.logout;

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
      console.log('getting freind data')
      $scope.searchPlaceHolder = 'search footprints'
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
      console.log('hello again')
      $scope.searchPlaceHolder = 'search footprints'
			UserRequests.getUserData(user, window.sessionStorage.userFbID, page, skip)
			.then(function (data) {
        console.log(data.data);
        if(data.data.footprints.length > 0) {
  				console.log(data.data);
  				$scope.userInfo = data.data.user;
  				footprints = data.data.footprints;
  				$scope.footprints = $scope.footprints.concat(footprints);
          page++;
          console.log('page: ', page);
          // $scope.getUserProfileData();
        } else {
          $scope.moreDataCanBeLoaded = false;
        }
  				// if($scope.userInfo.foursquareID) {
  				// 	$scope.foursquareConnected = true;
  				// }
  				// if($scope.userInfo.instagramID) {
  				// 	$scope.instagramConnected = true;
  				// }
        $scope.$broadcast('scroll.infiniteScrollComplete');
			})
		};

    $scope.refreshFootprints = function() {
      console.log('refreshFootprints');
      page = 0;
      $scope.moreDataCanBeLoaded = true;
      $scope.footprints = [];
      $scope.getUserProfileData();
      $scope.$broadcast('scroll.refreshComplete');
    }

    $scope.refreshFriends = function() {
      console.log('refreshFriends');
      friendsPage = 0;
      $scope.moreFriendsCanBeLoaded = true;
      friends = [];
      $scope.friends = [];
      $scope.showFriendsList();
      $scope.$broadcast('scroll.refreshComplete');
    }

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
         //remove suggested by friends folder from array;
        $scope.folders.shift();
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
          $scope.showDeletionSuccessAlert();
          console.log(data);
        });
      }
    };

    $scope.viewFriendsList = function() {
      var route = 'tab.friends-profile';
      $state.go(route);
    };

    $scope.setShareMessage = function (footprint) {
    // console.log('setting message');
    // console.log($localstorage.getObject('user'));
    // console.log($localstorage.getObject('user').name);

    FootprintRequests.openFootprintProfile = footprint;

    if(window.sessionStorage.userFbID === footprint.user.facebookID) {
      var message = "Sent from Waddle for iOS:%0D%0A" 
      + $localstorage.getObject('user').name + 
      " thought you'd like "+ footprint.place.name + "!%0D%0A%0D%0AThey rated " + footprint.place.name + " " + footprint.checkin.rating + 
      " stars out of 5.%0D%0A";
      if($scope.textAddress) {
        message += $scope.textAddress + "%0D%0A" 
      } 
      if(footprint.checkin.caption !== 'null') {
        message += "%0D%0A Here's what " + footprint.user.name + " said: " + '"' + footprint.checkin.caption + '"';
      }   
    } else {
      var message = "Sent from Waddle for iOS:%0D%0A" 
      + $localstorage.getObject('user').name + 
      " thought you'd like " + footprint.place.name + "!%0D%0A%0D%0ATheir friend, " + footprint.user.name + ", rated " 
      + footprint.place.name + " " + footprint.checkin.rating + 
      " stars out of 5.%0D%0A";
      if($scope.textAddress) {
        message += $scope.textAddress + "%0D%0A";
      } 
      if(footprint.checkin.caption !== 'null') {
        message += "%0D%0AHere's what they said: " + '"' + footprint.checkin.caption + '"';
      }
    }
    message += "%0D%0Ahttp://www.gowaddle.com";
  
    console.log(message);
    //replae & with encoded string
    message = message.replace(/&/g, '%26');
    var SMSElement = document.getElementsByClassName('suggest-via-sms')[0];
    SMSElement.setAttribute('href', "sms:&body=" + message);

    var mailElement = document.getElementsByClassName('suggest-via-email')[0];
    mailElement.setAttribute('href', 'mailto:?subject=Suggestion via Waddle for iOS&body=' + message);
  };

		  $scope.showPopup = function(footprintCheckinID, $index) {
      console.log('footprint index', $index);
      $scope.selectedFootprintIndex = $index;
      $scope.selectedFootprintCheckinID = footprintCheckinID;

      // An elaborate, custom popup
      $scope.myPopup = $ionicPopup.show({
        templateUrl: 'modals/folder-list.html',
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

      //janky way to remove myPopup from DOM (fix for .close() method not completely working in ionic 1.0.1)
      var popup = document.getElementsByClassName('popup-container')[0];
      document.body.removeChild(popup);
      
      // An elaborate, custom popup
      var folderCreationPopup = $ionicPopup.show({
        templateUrl: 'modals/add-folder.html',
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
        templateUrl: '/modals/folder-create-success.html'
      });
      // creationSuccessAlert.then(function(res) {
      // });
      $timeout(function() {
       creationSuccessAlert.close(); //close the popup after 1 second
      }, 1500);
    };

    $scope.showDeletionSuccessAlert = function () {
      var deletionSuccessAlert = $ionicPopup.show({
        templateUrl: 'modals/footprint-delete-success.html'
      });
     
      $timeout(function() {
       deletionSuccessAlert.close(); //close the popup after 1 second
      }, 1500);
    };

    $scope.openOptions = function (footprint, index) {
      $scope.selectedFootprintUserID = footprint.user.facebookID;
      $scope.selectedFootprintCheckinID = footprint.checkin.checkinID;
      $scope.selectedFootprintIndex = index;
      $scope.optionsPopup = $ionicPopup.show({
      templateUrl: 'modals/options-menu.html',
      scope: $scope
    });
      $scope.openFootprint(footprint, index);
    };

    $scope.openDeleteFootprintPopup = function () {
      $scope.optionsPopup.close();

      //janky way to remove myPopup from DOM (fix for .close() method not completely working in ionic 1.0.1)
      var popup = document.getElementsByClassName('popup-container')[0];
      document.body.removeChild(popup);
      
      var deleteFootprintPopup = $ionicPopup.show({
        templateUrl: 'modals/delete-footprint.html',
        // title: 'Add Folder',
        scope: $scope,
        buttons: [
          { text: 'Cancel' },
          {
            text: '<b>Yes</b>',
            type: 'button-positive',
            onTap: function(e) {
                $scope.deleteFootprint($scope.selectedFootprintCheckinID, $scope.selectedFootprintUserID, $scope.selectedFootprintIndex);
            }
          }
        ]
      });
    };

    $scope.showShareOptions = function (footprint) {
      $scope.shareOptions = $ionicPopup.show({
        title: 'suggest this footprint:',
        templateUrl: 'modals/share-options.html',
        scope: $scope
      })
      //function placed inside timeout to ensure anchor tag href exists in DOM before value of message is set
      $timeout(function() {
        $scope.setShareMessage(footprint);
      }, 0);
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
        h:  '1h',
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

ProfileController.$inject = ['$scope', '$state', 'UserRequests', 'Auth', 'FootprintRequests', '$ionicModal', '$ionicPopup', '$timeout', 'moment', '$localstorage']

angular.module('waddle.profile', [])
  .controller('ProfileController', ProfileController);

})();