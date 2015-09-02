

(function(){

var HomeController = function (Auth, UserRequests, MapFactory, FootprintRequests, $scope, $state, $rootScope, $ionicModal, $ionicPopup, $timeout, moment, $ionicScrollDelegate, $ionicHistory, $localstorage, ezfb, $cordovaFacebook, $window, $ImageCacheFactory) {
  window.sessionStorage.stagingEnvironment = true;
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
    var skipAmount = 20;
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

    $scope.getCaptionHeight = function(checkin, charsPerLine, lineHeight) {
      if (checkin) {
        var caption = checkin.caption;
        var numLines = caption.length / charsPerLine;
        var words = caption.split(" ");
        var line = [];
        var lines = [];
        for (var i = 0; i < words.length; i++) {
          if(line.join(" ").length <= charsPerLine) {
            line.push(words[i]);
          } else {
            var lastWord = line.splice(line.length - 1, 1);
            lines.push(line.join(" "));
            line = lastWord;
            line.push(words[i]);
          }
        }
        var height = lineHeight * lines.length;
        return lines ? height: 0;
      }
    };

    // Duplicate function as getCaptionHeight due to ionic bug where
    // ng-init doesn't work with in the collection-repeat directive
    $scope.createCaption = function(checkin) {
      if (checkin.caption) {
        var caption = checkin.caption;
        var charsPerLine = 50;
        var numLines = caption.length / charsPerLine;
        var words = caption.split(" ");
        var line = [];
        var lines = [];
        for (var i = 0; i < words.length; i++) {
          if(line.join(" ").length <= charsPerLine) {
            line.push(words[i]);
          } else {
            var lastWord = line.splice(line.length - 1, 1);
            lines.push(line.join(" "));
            line = lastWord;
            line.push(words[i]);
          }
        }
        return lines;
      }

    };

    $scope.getCommentHeight = function(footprint, charsPerLine, lineHeight) {
      if (footprint.comments) {
        var comment = footprint.comments[0].comment.text;
        console.log(comment);
        var numLines = Math.ceil(comment.length / charsPerLine);
        return lineHeight * numLines;
      }
      return 0;
    };

    $scope.getCardHeight = function(footprint) {
      var height;
      var checkin = footprint.checkin;
      // console.log($window.innerWidth, checkin.photoHeight, checkin.photoWidth);
      if (checkin.photoHeight && checkin.photoWidth && checkin.photoHeight !== 'null' && checkin.photoWidth !== 'null') {
        var scale = $window.innerWidth/checkin.photoWidth;
        height = scale * checkin.photoHeight + 200;
      } else if (checkin.photoLarge !== 'null') {
        // For checkins without the new photoHeight and photoWidth property
        // use photoLarge and assume that the card height with photoLarge is 600px
        height = 700;
      } else {
        height = 200;
      }
      var textHeight = 30;
      var commentSectionHeight = 38;
      var iconHeight = 15;
      var charsPerLine = 40;

      var captionHeight = $scope.getCaptionHeight(checkin, charsPerLine, textHeight);
      var commentHeight = $scope.getCommentHeight(footprint, charsPerLine, commentSectionHeight);
      height += captionHeight + commentHeight;
      if (footprint.comments || footprint.checkin.likes !== 'null') {
        height += iconHeight;
      }
      return height;
    };
    $scope.preloadImages = function(imageURLs, imagesPerLoad) {
      console.log('preloading images');
      
      $ImageCacheFactory.Cache(imageURLs).then(function(){
          console.log("Images done loading!");
      }, function(failed){
          console.log("An image failed: "+ failed);
      });
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
            return data.data;
        })
        .then(function (data) {
          var imagesPerLoad = 5;
          var imageURLs = [];
          for (var i = 0; i < data.length; i++) {
            if (data[i].checkin.photo && data[i].checkin.photo !== 'null') {
              imageURLs.push(data[i].checkin.photo + '/iphone6');
            } else if (data[i].checkin.photoLarge !== 'null') {
              imageURLs.push(data[i].checkin.photoLarge);
            }
          }
          var numLoads = Math.ceil(imageURLs.length / imagesPerLoad);
          for (var i = 0; i < numLoads; i++) {
            var images = imageURLs.slice(i*numLoads, (i+1)*numLoads);
            $scope.preloadImages(images, imagesPerLoad);
          }
        });
    };

    // $scope.getAggregatedFeedData();

    //posts new footprint from checkin screen
    $scope.$on('newFootprint', function(event, footprint) {
      // $ionicHistory.clearCache();
      $state.go('tab.home', {}, {reload: true});
      $scope.footprints.unshift(footprint.data);
      $ionicScrollDelegate.scrollTop();
    });

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
    };

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
          if (reload) {
            $scope.moreFoldersCanBeLoaded = true;
          }
          folderPage++;
        } else {
          $scope.moreFoldersCanBeLoaded = false;
        }
        $scope.$broadcast('scroll.infiniteScrollComplete');
      });
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
      });
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
          $scope.selectedFolderIndex = -1;
        });
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
        });
      }
    };

    $scope.passSelectedFolderInfo = function(folder, $index) {
      $scope.selectedFolderIndex = $index;
      $scope.selectedFolderInfo.name = folder.folder.name;
      // $scope.selectedFolderInfo.description = folder.folder.description;
    };

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
      });
    };

    $scope.deleteFootprint = function (checkinID, facebookID, index) {
      var splicedElem;
      if(window.sessionStorage.userFbID === facebookID) {
        console.log('facebookIDs match');
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
      $scope.shareOptions.close();
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
        + " stars out of 5.";
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
          if(success.post_id) {
            $scope.showFacebookPostSuccessAlert();
          }
          console.log(success);
        }, function (err) {
          console.log(err);

        });
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

    $scope.openModal = function(folderName) {

      FootprintRequests.openFolder = folderName;
      FootprintRequests.selectedFolderIndex = 1;
      $state.go('tab.folder-footprints-home');
    };

    $scope.closeModal = function() {
      $scope.modal.hide();
      //TO-DO: figure out how to propertly implement remove() in order to avoid memory leaks
      // $scope.modal.remove();
    };


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
          { text: 'Cancel',
            onTap: function(e) {
              $scope.selectedFolderIndex = -1;
            }
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
window.sessionStorage.applyNewSrcCount = 0;
    

};

HomeController.$inject = ['Auth', 'UserRequests', 'MapFactory', 'FootprintRequests', '$scope', '$state', '$rootScope', '$ionicModal', '$ionicPopup', '$timeout', 'moment', '$ionicScrollDelegate', '$ionicHistory', '$localstorage', 'ezfb', '$cordovaFacebook', '$window', '$ImageCacheFactory'];

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

var ResetPhotoDirective = function($compile) {
  return {
    restrict: 'A',
    link: function(scope, element, attr) {

      var currentElement = element;
      element.attr('ng-src', 'http://www.wallideas.net/wp-content/uploads/2015/03/Dark-Grey-Background-Amazing-HD-Wallpapers-r5099-Free.jpeg');
      var applyNewSrc = function(src) {
        // footprint.checkin.photo && footprint.checkin.photo!== \'null\'
        var html = '<img ng-src=' + src + ' class="full-image" ng-if="footprint.checkin.photo && footprint.checkin.photo!== \'null\'" ui-sref="tab.enlarged-footprint" ng-click="openFootprint(footprint, $index)"' + '>';
        // var html = '<img ng-src=' + src + ' class="full-image" ng-if="false" ui-sref="tab.enlarged-footprint" ng-click="openFootprint(footprint, $index)"' + '>';
        // var newImg = $compile(element.clone(true, true)
        // .attr('src', src)
        // .attr('ng-if', "footprint.checkin.photo && footprint.checkin.photo!== 'null'")
        // .attr('ui-sref', 'tab.enlarged-footprint')
        // .attr('ng-click', "openFootprint(footprint, $index)"));
        // newImg.attr('class', 'full-image');
        // currentElement.replaceWith(newImg);
        var newImg = angular.element(html);
        compiled = $compile(newImg);
        console.dir(currentElement);
        console.dir(newImg);
        newImg.insertBefore(currentElement);
        currentElement.remove()
        // currentElement.replaceWith(newImg);
        // currentElement = newImg;
        compiled(scope);
      };

      attr.$observe('src', applyNewSrc);
      attr.$observe('ngSrc', applyNewSrc);
    }
  };
};

ResetPhotoDirective.$inject = ['$compile'];

var ResetPhotoLargeDirective = function($compile) {
  return {
    restrict: 'A',
    link: function(scope, element, attr) {

      console.dir(element);
      element.attr('ng-src', 'data:image/png;base64,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');
      // element.attr('ng-src', 'http://www.wallideas.net/wp-content/uploads/2015/03/Dark-Grey-Background-Amazing-HD-Wallpapers-r5099-Free.jpeg');
      console.dir(element);
      var currentElement = element;
      var applyNewSrc = function(src) {
        window.sessionStorage.applyNewSrcCount++;
        console.log(window.sessionStorage.applyNewSrcCount);
        // (!footprint.checkin.photo || footprint.checkin.photo === \'null\') && footprint.checkin.photoLarge !== \'null\'
        var html = '<img ng-src=' + src + ' class="full-image" ng-if="(!footprint.checkin.photo || footprint.checkin.photo === \'null\') && footprint.checkin.photoLarge !== \'null\'" ui-sref="tab.enlarged-footprint" ng-click="openFootprint(footprint, $index)"' + '>';
        // var html = '<img src=' + src + ' class="full-image" ng-if="true" ui-sref="tab.enlarged-footprint" ng-click="openFootprint(footprint, $index)"' + '>';
        // var newImg = element.clone(true, true);
        // newImg.attr('src', src);
        // var newImg = $compile(element.clone(true, true)
        // .attr('src', src)
        // .attr('ng-if', "(!footprint.checkin.photo || footprint.checkin.photo === 'null') && footprint.checkin.photoLarge !== 'null'")
        // .attr('ui-sref', 'tab.enlarged-footprint')
        // .attr('ng-click', "openFootprint(footprint, $index)")
        // .attr('class', 'full-image'));
        var newImg = angular.element(html);
        compiled = $compile(newImg);
        console.dir(currentElement);
        console.dir(newImg);
        newImg.insertBefore(currentElement);
        currentElement.remove()
        // currentElement.replaceWith(newImg);
        // currentElement = newImg;
        compiled(scope);
      };

      attr.$observe('src', applyNewSrc);
      attr.$observe('ngSrc', applyNewSrc);
    }
  };
};

ResetPhotoLargeDirective.$inject = ['$compile'];

angular.module('waddle.home', [])
  .controller('HomeController', HomeController)
  // .directive( 'customSubmit' , CustomSubmitDirective);
  .directive( 'resetPhoto' , ResetPhotoDirective)
  .directive( 'resetPhotoLarge' , ResetPhotoLargeDirective);
})();