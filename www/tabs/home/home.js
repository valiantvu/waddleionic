(function(){

var HomeController = function (Auth, UserRequests, MapFactory, FootprintRequests, $scope, $state) {
    
    $scope.footprints = [];
    var page = 0;
    var skipAmount = 5;
    $scope.moreDataCanBeLoaded = true;

    $scope.openFootprint = function(footprint) {
      FootprintRequests.openFootprint = footprint;
    };

    $scope.getAggregatedFeedData = function () {
        UserRequests.getAggregatedFeedData(window.sessionStorage.userFbID, page, skipAmount)
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

    $scope.getAggregatedFeedData();

    $scope.addCheckinToBucketList = function (footprint){
      footprint.bucketed = true;
      
      var bucketListData = {
        facebookID: window.sessionStorage.userFbID,
        checkinID: footprint.checkin.checkinID
      };

      FootprintRequests.addToBucketList(bucketListData)
      .then(function (data){
        console.log(data);
        footprint.bucketed = true;
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
    }

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

};

HomeController.$inject = ['Auth', 'UserRequests', 'MapFactory', 'FootprintRequests', '$scope', '$state'];

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

angular.module('waddle.home', [])
  .controller('HomeController', HomeController)
  .directive( 'customSubmit' , CustomSubmitDirective);
})();