(function(){

var FootprintsController = function (MapFactory, FootprintRequests, $scope, $state) {

    $scope.footprint = {
        "user": {
            "footprintsCount": 13,
            "fbProfilePicture": "img/bmo.png",
            "fbToken":"CAAMxNSdb8MMBAKryfnHRdmoUGaZCINm2mjgm3owffItnrHVINZBKCGhCnfJ821iVff0id1SxUeR5IJmF71UnymKAPupROWZCm1DyglsyNwUrC49A9x6UZBkzj5gzdxf6ZA8GvZBCUwHJSorZCIk4rUiH6r1CdIBZAQJZAyXDV9lTZBZAFDKP97TabiLLZBpM7jdjQUYZD",
            "name":"Michelle Thi Vu",
            "facebookID":"10203426526517301"
        },
        "checkin": {
            "checkinTime":"2013-09-29T07:45:38.000Z",
            "caption":"null",
            "likes":100000,
            "photoLarge":"img/adventure_time.png",
            "source":"facebook",
            "photoSmall":"img/adventure_time.png",
            "checkinID":"10201337526173598"
        },
        "place":{
            "lat":19.5,
            "category":"null",
            "foursquareID":"Cayman Islands",
            "country":"null",
            "lng":-80.5,
            "name":"Cayman Islands"
        },
        "comments":null,
        "$$hashKey":"object:34"
    };

    $scope.addCheckinToBucketList = function (footprint){
      
      var bucketListData = {
        facebookID: window.sessionStorage.userFbID,
        checkinID: footprint.checkin.checkinID
      };

      FootprintRequests.addToBucketList(bucketListData)
      .then(function (data){
        // Add bucketed property to checkin, updating markerQuadTree and refreshing inBounds
        // The second and third arguments to addPropertyToCheckin add to footprint.checkin 
        // MapFactory.markerQuadTree.addPropertyToCheckin(footprint, 'bucketed', true);
        // filterFeedByBounds();
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

FootprintsController.$inject = ['MapFactory', 'FootprintRequests', '$scope', '$state'];

angular.module('waddle.footprints', [])
  .controller('FootprintsController', FootprintsController);

})();