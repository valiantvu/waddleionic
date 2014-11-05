(function(){

var FootprintsController = function ($scope, $state) {

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

};

FootprintsController.$inject = ['$scope', '$state']

angular.module('waddle.footprints', [])
  .controller('FootprintsController', FootprintsController);

})();