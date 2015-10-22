(function(){

var DiscoverController = function (Auth,  $scope, $state, DiscoverPlaces, $ionicModal) {
  // Auth.checkLogin()
  // .then(function () {
    $scope.search = {};
    $scope.selectedPrices = [];

    var searchVenuesByNameOrCategory = function () {
      console.log('search by category/place name');
      if($scope.search.query.length > 1) {
        DiscoverPlaces.byCategory($scope.search.query, window.sessionStorage.userFbID, $scope.selectedPrices)
        .then(function (data) {
          $scope.venues = data.data;
          console.log(data);
        })
      }
    };

    var searchVenuesByLocation = function () {
      console.log('search by location');
      // $scope.search.location = "new%20york";
      if($scope.search.location.length > 1) {
        DiscoverPlaces.byLocation($scope.search.location, window.sessionStorage.userFbID, $scope.selectedPrices)
        .then(function (data) {
          $scope.venues = data.data;
          console.log(data);
        })
      }
    };

    var searchVenuesByCategoryOrNameAndLocation = function () {
      console.log('searching by both');
      if($scope.search.location.length > 1 && $scope.search.query.length > 1) {
        DiscoverPlaces.byCategoryOrNameAndLocation($scope.search.location, $scope.search.query, window.sessionStorage.userFbID, $scope.selectedPrices)
        .then(function (data) {
          $scope.venues = data.data;
          console.log(data);
        })
      }
    }

    $scope.bifurcateSearch = function() {
      if($scope.search.query && $scope.search.location) {
        searchVenuesByCategoryOrNameAndLocation();
      } 
      // else if($scope.search.query.length) {
      //   searchVenuesByNameOrCategory();
      // } 
      else {
        searchVenuesByLocation();
      }
    };

    $scope.clearSearch = function () {
      $scope.search.query = {};
    }

    $scope.openModal = function() {
      $scope.modal.show();
    };


    $scope.showFilterOptions = function () {
      console.log('filtering')
      $ionicModal.fromTemplateUrl('modals/discover-filters.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.modal = modal;
        $scope.openModal();
      });
    };

    $scope.toggleSelectPrice = function (priceInt) {
      var priceIntIndex = $scope.selectedPrices.indexOf(priceInt);
      if(priceIntIndex === -1) {
        $scope.selectedPrices.push(priceInt);
      } else {
        $scope.selectedPrices.splice(priceIntIndex, 1);
      }
    };

  	// $scope.discoverPlaceByCategory = function () {
	  // 	DiscoverPlaces.byCategorySearch('Coffee', '10153079708568662')
	  // 	.then(function (data) {
   //      $scope.venues = data.data;
	  // 		console.log(data);
	  // 	})
  	// };

  	// $scope.discoverPlaceByCategory();

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

   
  // })
};

DiscoverController.$inject = ['Auth', '$scope', '$state', 'DiscoverPlaces', '$ionicModal'];

// Custom Submit will avoid binding data to multiple fields in ng-repeat and allow custom on submit processing

angular.module('waddle.discover', [])
  .controller('DiscoverController', DiscoverController)
})();