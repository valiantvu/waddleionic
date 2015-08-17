(function(){


var HomeController = function (Auth, UserRequests, MapFactory, FootprintRequests, $scope, $state, $rootScope, $ionicModal, $ionicPopup, $timeout, moment, $ionicScrollDelegate, $ionicHistory, $localstorage, ezfb, $cordovaFacebook) {
  Auth.checkLogin()
  .then(function () {
    $scope.numHypes = 0;
    $scope.footprints = [];
    $scope.folders = [];
    $scope.search = {};
    $scope.footprintSearch = false;
    $scope.selectedFolderInfo = {};
    $scope.selectedFolderIndex = -1;
    $scope.newFolderInfo = {};
    var page = 0;
    var skipAmount = 5;
    $scope.moreDataCanBeLoaded = true;
    var folderPage = 0;
    var folderSkipAmount = 10;
    $scope.moreFoldersCanBeLoaded = true;
    $scope.newFootprint = UserRequests.newFootprint;
    $scope.facebookInfo = {};

    FootprintRequests.currentTab = 'feed';

    $scope.openFootprint = function(footprint, index) {
      console.log(footprint);
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
      console.log($previousRoute);
      if($previousRoute.url === "/home") {
        FootprintRequests.currentTab = "feed";
      }
      if($previousRoute.name === 'tab.home' && FootprintRequests.deletedFootprint) {
        console.log('deleted?');
        $scope.footprints.splice(FootprintRequests.selectedFootprintIndex, 1);
        FootprintRequests.deletedFootprint = false;
      }
      if($previousRoute.name === 'tab.home' && FootprintRequests.editedCheckin) {
        $scope.footprints[FootprintRequests.selectedFootprintIndex].checkin.rating = FootprintRequests.editedCheckin.rating;
        $scope.footprints[FootprintRequests.selectedFootprintIndex].checkin.caption = FootprintRequests.editedCheckin.caption;
        $scope.footprints[FootprintRequests.selectedFootprintIndex].checkin.photoLarge = FootprintRequests.editedCheckin.photoLarge;
        FootprintRequests.editedCheckin = false;
      }
      if(FootprintRequests.newFolder) {
        $scope.viewFoldersList(true);
        FootprintRequests.newFolder = false;
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

    $scope.viewFoldersList = function(reload) {
      if(reload) {
        folderPage = 0;
        $scope.moreFoldersCanBeLoaded = false;
      }
      console.log("attemoting to viewfolders");
      UserRequests.fetchFolders(window.sessionStorage.userFbID, folderPage, folderSkipAmount)
      .then(function (folders) {
        if(folders.data.length > 0) {
          if(folderPage === 0) {
          //remove suggested by friends folder from array;
          folders.data.shift();
          }
          $scope.folders = reload ? folders.data : $scope.folders.concat(folders.data);
          UserRequests.userFolderData = $scope.folders;
          console.log($scope.folders)
          if (reload) {
            $scope.moreFoldersCanBeLoaded = true;
          }
          folderPage++; 
        } else {
          $scope.moreFoldersCanBeLoaded = false;
        }
        $scope.$broadcast('scroll.infiniteScrollComplete');
      })
    };

    // $scope.viewFoldersList();
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

    $scope.addFootprintToFolder = function (checkinID, folderName, footprintIndex, folderIndex) {
      UserRequests.addFootprintToFolder(window.sessionStorage.userFbID, checkinID, folderName)
      .then(function (data) {
        //add folder label to appropriate footprint
        $scope.footprints[footprintIndex].folders = [];
        $scope.footprints[footprintIndex].folders.push(data.data[0].folder);
        $scope.showFootprintAdditionSuccessAlert();

        $scope.viewFoldersList(true);

        // console.log(data);
      })
    };

    $scope.createFolderAndAddFootprintToFolder = function (folderName, selectedFootprintCheckinID, selectedFootprintIndex) {
      // console.log(folderName);
      UserRequests.addFolder(window.sessionStorage.userFbID, folderName)
      .then(function (folder) {
        UserRequests.addFootprintToFolder(window.sessionStorage.userFbID, selectedFootprintCheckinID, folderName)
        .then(function (data) {
          //add folder label to appropriate footprint
          $scope.footprints[selectedFootprintIndex].folders = [];
          $scope.footprints[selectedFootprintIndex].folders.push(data.data[0].folder);
          $scope.showCreationSuccessAlert();

          $scope.viewFoldersList(true);
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
      $scope.selectedFolderIndex = $index;
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

    $scope.toggleCategoryNameDisplay = function($index) {
      if($scope.categoryNameIndex === $index) {
        $scope.categoryNameIndex = -1;
      } else {
        $scope.categoryNameIndex = $index;
      }
    };

    $scope.publishToFacebook = function() {
      $scope.shareOptions.close()
      var footprint = $scope.selectedFootprint;
      var linkObject = {
        method: 'feed',
        message: $scope.facebookInfo.message,
        link: 'http://www.gowaddle.com',
        picture: 'https://s3-us-west-2.amazonaws.com/waddle/logo+assets/WaddleLogo_1024x1024-6-2-5.png',
        name: $localstorage.getObject('user').name + " suggests " + footprint.place.name + "!",
        caption: footprint.place.name + " | letswaddle.com",
        description: null
      };

      //set value of message to empty string after setting linkObject
      $scope.facebookInfo.message = '';

      //overwrite default pic (waddle logo) if the footprint has a photo
      if(footprint.checkin.photoLarge !== "null") {
        linkObject.picture = footprint.checkin.photoLarge;
      }

      if(footprint.user.facebookID === window.sessionStorage.userFbID) {
        linkObject.description = footprint.user.name + " rated " + footprint.place.name + " " + footprint.checkin.rating 
        + " stars out of 5."
      } else {
        linkObject.description = $localstorage.getObject('user').name + "'s friend, " + footprint.user.name + ", rated " + footprint.place.name + " " + footprint.checkin.rating
        + " stars out of 5.";
      }

      if(footprint.checkin.caption !== "null" ) {
        linkObject.description +=   " Here's what they said about this place: " + '"' + footprint.checkin.caption + '"';
      }
    
      console.log(linkObject);
      

      // openFB.login(function() {
      //   openFB.api({
      //     method: 'POST',
      //     path: '/me/feed',
      //     params: linkObject,
      //     success: function(response) {
      //       console.log(response);
      //       $scope.showFacebookPostSuccessAlert();
      //     },
      //     error: function(err) {
      //       console.log(err);
      //     }
      //   }), {scope: 'publish_actions'};
      // });

      // ezfb.login(function(){
      //   // Note: The call will only work if user accepts the permission request
      //   ezfb.api('/me/feed', 'post', linkObject);
      // }, {scope: 'publish_actions'})
      // .then(function (success, err) {
      //   if(err) {
      //     console.log(err)
      //   } else {
      //     console.log(success);
      //     $scope.showFacebookPostSuccessAlert();
      //   }
      // })
      $cordovaFacebook.login(["publish_actions"])
      .then(function(response) {
        $cordovaFacebook.showDialog(linkObject)
        .then(function (success) {
          console.log(success);
          $scope.showFacebookPostSuccessAlert();
          console.log(success);

        }, function (err) {
          console.log(err);

        })      
      }, function (error) {
        console.log(error);
      });
    };

    $scope.setShareMessage = function (footprint) {

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
        templateUrl: 'modals/folder-list.html',
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
             $scope.addFootprintToFolder($scope.selectedFootprintCheckinID, $scope.selectedFolderInfo.name, $index, $scope.selectedFolderIndex);
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
          { text: 'Cancel'},
          {
            text: '<b>Save</b>',
            type: 'button-positive',
            onTap: function(e) {
                $scope.createFolderAndAddFootprintToFolder($scope.newFolderInfo.name, $scope.selectedFootprintCheckinID, $scope.selectedFootprintIndex);
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
        templateUrl: 'modals/folder-create-success.html'
      });
    
      $timeout(function() {
       creationSuccessAlert.close(); //close the popup after 1.5 seconds
      }, 1700);
    };

     $scope.showFootprintAdditionSuccessAlert = function() {
      var creationSuccessAlert = $ionicPopup.show({
        templateUrl: 'modals/footprint-addition-success.html'
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

    $scope.showDeletionSuccessAlert = function () {
      var deletionSuccessAlert = $ionicPopup.show({
        templateUrl: 'modals/footprint-delete-success.html'
      });
     
      $timeout(function() {
       deletionSuccessAlert.close(); //close the popup after 1 second
      }, 1700);
    };

    $scope.showShareOptions = function (footprint) {
    $scope.shareOptions = $ionicPopup.show({
      title: 'suggest this footprint:',
      templateUrl: 'modals/share-options.html',
      scope: $scope
    });
    //function placed inside timeout to ensure anchor tag href exists in DOM before value of message is set
    $timeout(function() {
      $scope.setShareMessage(footprint);
    }, 0);

    $scope.selectedFootprint = footprint;

    //initialize connection with fb using ezfb

    // ezfb.init({
    //   appId: '898529293496515'
    // });

  };

  $scope.showFacebookPostSuccessAlert = function () {
     var facebookPostSuccessAlert = $ionicPopup.show({
        templateUrl: 'modals/facebook-post-success.html'
      });
     
      $timeout(function() {
       facebookPostSuccessAlert.close(); //close the popup after 1 second
      }, 2000);

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
  });
    

};

HomeController.$inject = ['Auth', 'UserRequests', 'MapFactory', 'FootprintRequests', '$scope', '$state', '$rootScope', '$ionicModal', '$ionicPopup', '$timeout', 'moment', '$ionicScrollDelegate', '$ionicHistory', '$localstorage', 'ezfb', '$cordovaFacebook'];

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