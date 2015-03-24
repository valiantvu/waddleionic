(function(){

var HypelistController = function (Auth, UserRequests, MapFactory, FootprintRequests, $scope, $state, $ionicModal, $ionicPopup, $timeout) {

  Auth.checkLogin()
  .then(function () {

    $scope.footprints = [];
    $scope.folderInfo = {};
    var page = 0;
    var skipAmount = 5;
    $scope.moreDataCanBeLoaded = true;

    FootprintRequests.currentTab = 'hypelist';


    $scope.openFootprint = function(footprint) {
      FootprintRequests.openFootprint = footprint;
    };

    $scope.getBucketList = function () {
        UserRequests.getBucketList(window.sessionStorage.userFbID, page, skipAmount)
        .then(function (data) {
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

    $scope.addFolder = function (folderName, folderDescription) {
      // console.log(folderName);
      // console.log(folderDescription);
      UserRequests.addFolder(window.sessionStorage.userFbID, folderName, folderDescription)
      .then(function (data) {
        $scope.showCreationSuccessAlert();
        console.log(data);
      });
    };

    // $scope.folders = [
    // {name:"All", createdAt:1425412791739, description: "all the things!!!"},
    // {name:"nyc faves", createdAt:1425412491739, description: "these are a few of my favorite things"},
    // ];

    $scope.fetchFolders = function() {
      UserRequests.fetchFolders(window.sessionStorage.userFbID, 0, 20)
      .then(function (folders) {
        $scope.folders = folders.data;
      //   if (data.data.length > 0) {
      //     console.log(data);
      //     $scope.folders = $scope.folders.concat(data.data);
      //     page++;
      //     console.log('page: ', page);
      //   }
      //   else {
      //     $scope.moreDataCanBeLoaded = false;
      //   }
      //   $scope.$broadcast('scroll.infiniteScrollComplete');
      })
  }
    $scope.fetchFolders();
    console.log('weishemeee!!!', $scope.folders);
    $scope.getBucketList();

    $scope.addCheckinToBucketList = function (footprint){
      
      var bucketListData = {
        facebookID: window.sessionStorage.userFbID,
        checkinID: footprint.checkin.checkinID
      };

      FootprintRequests.addToBucketList(bucketListData)
      .then(function (data){
        footprint.bucketed = true;
      });
    };

    $scope.removeCheckinFromBucketList = function (footprint){
      console.log('removed?');

      var bucketListData = {
        facebookID: window.sessionStorage.userFbID,
        checkinID: footprint.checkin.checkinID
      };

      FootprintRequests.removeFromBucketList(bucketListData);
    };

    $scope.loadProfilePage = function (userInfo) {
      console.log(userInfo);
      // var targetElement = userInfo;
      // ionic.trigger("loadProfilePage", {target: targetElement}, true, true);
      $rootScope.$emit('loadProfilePage', userInfo);
      $state.go('tab.profile');
    };

     $scope.showFolderCreationPopup = function() {

      // An elaborate, custom popup
      var myPopup = $ionicPopup.show({
        templateUrl: 'add-folder.html',
        title: 'Add Folder',
        // subTitle: 'Please use normal things',
        scope: $scope,
        buttons: [
          { text: 'Cancel' },
          {
            text: '<b>Save</b>',
            type: 'button-energized',
            onTap: function(e) {
                $scope.addFolder($scope.folderInfo.name, $scope.folderInfo.description);
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


    $ionicModal.fromTemplateUrl('add-folder.html', {
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

      for(var i = 0; i < $scope.footprints.length; i++) {
          var place = $scope.footprints[i].place;
          var checkin = $scope.footprints[i].checkin;

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

    // $scope.selectedFootprintInteractions = null;

    // $scope.getFootprint = function (footprint) {
    //     $scope.footprint = footprint;

    //     var checkinID = footprint.checkin.checkinID;
    //     FootprintRequests.openFootprint = footprint;

    //     FootprintRequests.getFootprintInteractions(checkinID)
    //     .then(function (data) {
    //         FootprintRequests.currentFootprint = data.data;
    //         $scope.selectedFootprintInteractions = FootprintRequests.currentFootprint;
    //     });
    // };

    // $scope.closeFootprintWindow = function (){
    //   FootprintRequests.openFootprint = undefined;
    //   $state.go('map.feed')
    // };

    // Ensure that a user comment is posted in the database before displaying
    // $scope.updateFootprint = function (footprint){
    //   var checkinID = footprint.checkin.checkinID;
    //   FootprintRequests.getFootprintInteractions(checkinID)
    //   .then(function (data) {
    //     $scope.selectedFootprintInteractions.comments = data.data.comments;
    //   });  
    // };

    // $scope.removeComment = function (footprint, comment){
    //   console.log(footprint);
    //   console.log(comment);
    //   var commentData = {
    //     facebookID: comment.commenter.facebookID,
    //     checkinID: footprint.checkin.checkinID,
    //     commentID : comment.comment.commentID 
    //   };
    //   console.log(commentData);
    //   FootprintRequests.removeComment(commentData)
    //   .then(function (data){
    //     console.log("success");
    //     //MapFactory.markerQuadTree.addPropertyToCheckin(footprint, 'bucketed', false);
    //   });
    // };
  })
    
};

HypelistController.$inject = ['Auth', 'UserRequests', 'MapFactory', 'FootprintRequests', '$scope', '$state', '$ionicModal', '$ionicPopup', '$timeout'];

// Custom Submit will avoid binding data to multiple fields in ng-repeat and allow custom on submit processing

var CustomSubmitDirective = function(FootprintRequests) {
  return {
    restrict: 'A',
    link: function( scope , element , attributes ){
      console.log('psoting a comment');
      var $element = angular.element(element);
      
      // Add novalidate to the form element.
      attributes.$set( 'novalidate' , 'novalidate' );
      
      $element.bind( 'submit' , function( e ) {
        e.preventDefault();
        
        // Remove the class pristine from all form elements.
        $element.find( '.ng-pristine' ).removeClass( 'ng-pristine' );
        
        // Get the form object.
        var form = scope[ attributes.name ];
        
        // Set all the fields to dirty and apply the changes on the scope so that
        // validation errors are shown on submit only.
        angular.forEach( form , function( formElement , fieldName ) {
          // If the fieldname starts with a '$' sign, it means it's an Angular
          // property or function. Skip those items.
          if ( fieldName[0] === '$' ) return;
          
          formElement.$pristine = false;
          formElement.$dirty = true;
        });
        
        // Do not continue if the form is invalid.
        if ( form.$invalid ) {
          // Focus on the first field that is invalid.
          $element.find( '.ng-invalid' ).first().focus();
          
          return false;
        }
        
        // From this point and below, we can assume that the form is valid.
        scope.$eval( attributes.customSubmit );

        //Text can be found with $element[0][0].value or scope.data.currentComment
        //ID can be found with $element.context.dataset['customSubmit']
        var commentData = {
          clickerID: window.sessionStorage.userFbID,
          checkinID: scope.footprint.checkin.checkinID,
          // commentID: scope.footprint.comments[0],
          text: scope.comment
        };

        FootprintRequests.addComment(commentData)
        .then(function (data) {
          // Socket.emit('comment posted', commentData);
          if (FootprintRequests.openFootprint){
            scope.updateFootprint(FootprintRequests.openFootprint);
          }
          // scope.data.currentComment = '';
          //$element[0][0].value = ''
        });
        console.log(commentData);
        scope.comment = "";
        scope.$apply();
      });
    }
  };
};

CustomSubmitDirective.$inject = ['FootprintRequests'];

angular.module('waddle.hypelist', [])
  .controller('HypelistController', HypelistController)
  .directive( 'customSubmit' , CustomSubmitDirective);

})();