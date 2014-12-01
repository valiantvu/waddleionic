(function(){

var HomeController = function (Auth, UserRequests, MapFactory, FootprintRequests, $scope, $state) {
    
    $scope.footprints = [];

    $scope.getAggregatedFeedData = function () {
        UserRequests.getAggregatedFeedData(window.sessionStorage.userFbID)
        .then(function (data) {
            console.dir(data.data);
            $scope.allFootprints = data.data;
            $scope.loadMore();
        });
    };

    $scope.getAggregatedFeedData();

    $scope.loadMore = function() {
        if (typeof $scope.allFootprints !== 'undefined') {
            $scope.footprints = $scope.footprints.concat($scope.allFootprints.splice(0, 3));
        }
        $scope.$broadcast('scroll.infiniteScrollComplete');
    };

    $scope.moreDataCanBeLoaded = function() {
        if (typeof $scope.allFootprints === 'undefined') {
            return false;
        } else {
            return $scope.allFootprints.length === 0 ? false : true;
        }
    };

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

      FootprintRequests.removeFromBucketList(bucketListData)
      .then(function (data){
        // MapFactory.markerQuadTree.addPropertyToCheckin(footprint, 'bucketed', false);
      });
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
};

HomeController.$inject = ['Auth', 'UserRequests', 'MapFactory', 'FootprintRequests', '$scope', '$state'];

angular.module('waddle.home', [])
  .controller('HomeController', HomeController);

})();