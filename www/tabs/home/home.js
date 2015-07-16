(function(){


var HomeController = function (Auth, UserRequests, MapFactory, FootprintRequests, $scope, $state, $rootScope, $ionicModal, $ionicPopup, $timeout, moment, $ionicScrollDelegate, $ionicHistory, $localstorage) {
  Auth.checkLogin()
  .then(function () {
    $scope.numHypes = 0;
    $scope.footprints = [];
    $scope.search = {};
    $scope.footprintSearch = false;
    $scope.selectedFolderInfo = {};
    $scope.selectedFolder = null;
    $scope.newFolderInfo = {};
    var page = 0;
    var skipAmount = 5;
    $scope.moreDataCanBeLoaded = true;
    $scope.newFootprint = UserRequests.newFootprint;

    FootprintRequests.currentTab = 'feed';

    $scope.openFootprint = function(footprint, index) {
      FootprintRequests.openFootprint = footprint;
      FootprintRequests.selectedFootprintIndex = index;
    };

    $scope.checkUserID = function(facebookID) {
      if(facebookID === window.sessionStorage.userFbID) {
        return true;
      } else {
        return false;
      }
    };

    $scope.toggleFolderSearch = function() {
      $scope.showFolderSearch = $scope.showFolderSearch === true ? false : true;
      if ($scope.showFolderSearch) {
        $ionicScrollDelegate.scrollTop();
      }
    };

    $scope.getAggregatedFeedData = function () {
        UserRequests.getAggregatedFeedData(window.sessionStorage.userFbID, page, skipAmount)
        .then(function (data) {
          console.log('page:', page);
          if (data.data.length > 0) {
              console.log(data);
              $scope.footprints = $scope.footprints.concat(data.data);
              FootprintRequests.footprints = $scope.footprints;
              page++;
              console.log('page: ', page);
            } else {
              $scope.moreDataCanBeLoaded = false;
            }
            $scope.$broadcast('scroll.infiniteScrollComplete');
        });
    };

    //posts new footprint from checkin screen
    $scope.$on('newFootprint', function(event, footprint) {
      // $ionicHistory.clearCache();
      $state.go('tab.home', {}, {reload: true});
      $scope.footprints.unshift(footprint.data);
      $ionicScrollDelegate.scrollTop();
    })

    $scope.$on('$stateChangeSuccess', function($currentRoute, $previousRoute) {
      if($previousRoute.url === "/home") {
        FootprintRequests.currentTab = "feed";
      }
      if($previousRoute.name === 'tab.home' && FootprintRequests.deletedFootprint) {
        console.log('deleted?');
        $scope.footprints.splice(FootprintRequests.selectedFootprintIndex, 1);
        FootprintRequests.deletedFootprint = false;
      }
    });

    $scope.updateFeedWithNewFootprint = function() {
      if(UserRequests.newFootprint) {
        $scope.footprints.unshift(UserRequests.newFootprint);
        UserRequests.newFootprint = null;
      }
    };

    $scope.doRefresh = function() {
      page = 0;
      $scope.footprints = [];
      $scope.moreDataCanBeLoaded = true;
      $scope.getAggregatedFeedData();
      $scope.$broadcast('scroll.refreshComplete');
    }

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
    $scope.updateFeedWithNewFootprint();

    $scope.addCheckinToBucketList = function (footprint, index){
      
      var bucketListData = {
        facebookID: window.sessionStorage.userFbID,
        checkinID: footprint.checkin.checkinID
      };

      FootprintRequests.addToBucketList(bucketListData)
      .then(function (data){
        console.log(data);
        footprint.bucketed = true;

        if (!$scope.footprints[index].hypes) {
          $scope.footprints[index].hypes = [];
        }

        $scope.footprints[index].hypes.push('new hype');
      });
    };

    $scope.addFootprintToFolder = function (checkinID, folderName, index) {
      UserRequests.addFootprintToFolder(window.sessionStorage.userFbID, checkinID, folderName)
      .then(function (data) {
        $scope.footprints[index].folders = [];
        $scope.footprints[index].folders.push(data.data[0].folder);
        $scope.showFootprintAdditionSuccessAlert();
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

    $scope.removeCheckinFromBucketList = function (footprint){
      console.log('removed?');
      footprint.bucketed = false;

      var bucketListData = {
        facebookID: window.sessionStorage.userFbID,
        checkinID: footprint.checkin.checkinID
      };

      FootprintRequests.removeFromBucketList(bucketListData);
    };

    $scope.loadProfilePage = function (userInfo) {
      console.log(userInfo);
      UserRequests.userProfileData = userInfo;
      $state.go('tab.profile');
    };

    $scope.searchFeed = function () {
      if($scope.search.query.length > 2) {
        UserRequests.searchFeed(window.sessionStorage.userFbID, $scope.search.query, 0, 10)
        .then(function(footprints) {
          $scope.footprints = footprints.data;
          $scope.moreDataCanBeLoaded = false;
        })
      }
    };

    $scope.passSelectedFolderInfo = function(folder, $index) {
      $scope.selectedFolder = $index;
      $scope.selectedFolderInfo.name = folder.folder.name;
      // $scope.selectedFolderInfo.description = folder.folder.description;
    }

     $scope.clearSearch = function () {
      $scope.search = {};
      $scope.footprints = [];
      page = 0;
      $scope.moreDataCanBeLoaded = true;
      $scope.getUserData();
    };

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
          splicedElem = $scope.footprints.splice(index, 1);
          console.log(splicedElem);
          $scope.showDeletionSuccessAlert();
          console.log(data);
        });
      }
    };

    $scope.viewFriendsList = function() {
      var route = 'tab.friends';
      $state.go(route);
    };

    $scope.setShareMessage = function (footprint) {
    // console.log('setting message');
    // console.log($localstorage.getObject('user'));
    // console.log($localstorage.getObject('user').name);

    FootprintRequests.openFootprint = footprint;

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

    $ionicModal.fromTemplateUrl('folder-contents.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
    });

    $scope.openModal = function(folderName) {

      FootprintRequests.openFolder = folderName;
      FootprintRequests.selectedFolderIndex = 1;
      $state.transitionTo('tab.folder-footprints-home');
    };

    $scope.closeModal = function() {
      $scope.modal.hide();
      //TO-DO: figure out how to propertly implement remove() in order to avoid memory leaks
      // $scope.modal.remove();
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

    $scope.showPopup = function(footprintCheckinID, $index) {
      console.log('footprint index', $index);
      $scope.selectedFootprintIndex = $index;
      $scope.selectedFootprintCheckinID = footprintCheckinID;

      // An elaborate, custom popup
      $scope.myPopup = $ionicPopup.show({
        templateUrl: 'folder-list.html',
        title: 'Choose a Folder',
        // subTitle: 'Please use normal things',
        scope: $scope,
        buttons: [
          { text: 'Cancel'
           },
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
        templateUrl: 'add-folder.html',
        title: 'Add Folder',
        scope: $scope,
        buttons: [
          { text: 'Cancel'},
          {
            text: '<b>Save</b>',
            type: 'button-positive',
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
        templateUrl: 'folder-create-success.html'
      });
    
      $timeout(function() {
       creationSuccessAlert.close(); //close the popup after 1.5 seconds
      }, 1700);
    };

     $scope.showFootprintAdditionSuccessAlert = function() {
      var creationSuccessAlert = $ionicPopup.show({
        templateUrl: 'footprint-addition-success.html'
      });
    
      $timeout(function() {
       creationSuccessAlert.close(); //close the popup after 1.5 seconds
      }, 1700);
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

      //janky way to remove myPopup from DOM (fix for .close() method not completely working in ionic 1.0.1)
      var popup = document.getElementsByClassName('popup-container')[0];
      document.body.removeChild(popup);

      var deleteFootprintPopup = $ionicPopup.show({
        templateUrl: 'delete-footprint.html',
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

    $scope.showDeletionSuccessAlert = function () {
      var deletionSuccessAlert = $ionicPopup.show({
        templateUrl: 'footprint-delete-success.html'
      });
     
      $timeout(function() {
       deletionSuccessAlert.close(); //close the popup after 1 second
      }, 1500);
    };

    $scope.showShareOptions = function (footprint) {
    $scope.shareOptions = $ionicPopup.show({
      title: 'suggest this footprint:',
      templateUrl: 'share-options.html',
      scope: $scope
    })
    //function placed inside timeout to ensure anchor tag href exists in DOM before value of message is set
    $timeout(function() {
      $scope.setShareMessage(footprint);
    }, 0);
  };

    if($state.current.name === 'footprints-map') {
      console.log($state.current.name);
      L.mapbox.accessToken = 'pk.eyJ1Ijoid2FkZGxldXNlciIsImEiOiItQWlwaU5JIn0.mTIpotbZXv5KVgP4pkcYrA';
      var map = L.mapbox.map('map', 'injeyeo.8fac2415', {
        attributionControl: false,
        zoomControl: false,
        worldCopyJump: true,
        minZoom: 2,
        maxBounds: [[80,200],[-80,-200]],
        bounceAtZoomLimits: false
      })
        .setView([20.00, 0.00], 2);

      for(var i = 0; i < FootprintRequests.footprints.length; i++) {
          var place = FootprintRequests.footprints[i].place;
          var checkin = FootprintRequests.footprints[i].checkin;

          var placeName = place.name;
          var latLng = [place.lat, place.lng];
          var img;
          var caption;

          if (checkin.photoSmall !== 'null') {
            img = checkin.photoSmall;
          }

          if (checkin.caption !== 'null') {
            caption = checkin.caption;
          }

          var marker = L.marker(latLng, {
            icon: L.mapbox.marker.icon({
              'marker-color': '1087bf',
              'marker-size': 'large',
              'marker-symbol': 'circle-stroked'
            }),
            title: placeName
          });

          if (img && caption) {
            marker.bindPopup('<h3>' + placeName + '</h3><h4>' + caption + '</h4><img src="' + img + '"/>');
          } else if (img) {
            marker.bindPopup('<h3>' + placeName + '</h3><img src="' + img + '"/>');
          } else if (caption) {
            marker.bindPopup('<h3>' + placeName + '</h3><h4>' + caption + '</h4>');
          } else {
            marker.bindPopup('<h3>' + placeName + '</h3>');
          }
          marker.addTo(map);
      }
    }
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

HomeController.$inject = ['Auth', 'UserRequests', 'MapFactory', 'FootprintRequests', '$scope', '$state', '$rootScope', '$ionicModal', '$ionicPopup', '$timeout', 'moment', '$ionicScrollDelegate', '$ionicHistory', '$localstorage'];

// Custom Submit will avoid binding data to multiple fields in ng-repeat and allow custom on submit processing

// var CustomSubmitDirective = function(FootprintRequests) {
//   return {
//     restrict: 'A',
//     link: function( scope , element , attributes ){
//       // console.log('posting a comment');
//       var $element = angular.element(element);
      
//       // Add novalidate to the form element.
//       attributes.$set( 'novalidate' , 'novalidate' );
      
//       $element.bind( 'submit' , function( e ) {
//         e.preventDefault();
        
//         // Remove the class pristine from all form elements.
//         $element.find( '.ng-pristine' ).removeClass( 'ng-pristine' );
        
//         // Get the form object.
//         var form = scope[ attributes.name ];
        
//         // Set all the fields to dirty and apply the changes on the scope so that
//         // validation errors are shown on submit only.
//         angular.forEach( form , function( formElement , fieldName ) {
//           // If the fieldname starts with a '$' sign, it means it's an Angular
//           // property or function. Skip those items.
//           if ( fieldName[0] === '$' ) return;
          
//           formElement.$pristine = false;
//           formElement.$dirty = true;
//         });
        
//         // Do not continue if the form is invalid.
//         if ( form.$invalid ) {
//           console.log('why is my form invalid??')
//           console.log($element.find('.ng-invalid'));
//           // Focus on the first field that is invalid.
//           $element.find('.ng-invalid').first().focus();
//           return false;
//         }
        
//         // From this point and below, we can assume that the form is valid.
//         scope.$eval( attributes.customSubmit );

//         //Text can be found with $element[0][0].value or scope.data.currentComment
//         //ID can be found with $element.context.dataset['customSubmit']
//         var commentData = {
//           clickerID: window.sessionStorage.userFbID,
//           checkinID: scope.footprint.checkin.checkinID,
//           // commentID: scope.footprint.comments[0],
//           text: scope.comment
//         };

//         FootprintRequests.addComment(commentData)
//         .then(function (data) {
//           // Socket.emit('comment posted', commentData);
//           if (FootprintRequests.openFootprint){
//             scope.updateFootprint(FootprintRequests.openFootprint);
//           }
//           // scope.data.currentComment = '';
//           //$element[0][0].value = ''
//         });
//         console.log(commentData);
//         scope.comment = "";
//         scope.$apply();
//       });
//     }
//   };
// };

// CustomSubmitDirective.$inject = ['FootprintRequests'];

angular.module('waddle.home', [])
  .controller('HomeController', HomeController);
  // .directive( 'customSubmit' , CustomSubmitDirective);
})();