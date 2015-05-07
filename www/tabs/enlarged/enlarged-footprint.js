(function(){

var EnlargedFootprintController = function (Auth, UserRequests, MapFactory, FootprintRequests, $scope, $state, $ionicHistory, $ionicPopup, $timeout, $window) {
    
  $scope.footprint = FootprintRequests.openFootprint;
  $scope.selectedFootprintIndex = FootprintRequests.selectedFootprintIndex;
  $scope.headerTitle = FootprintRequests.currentTab;
  $scope.usersAlsoBeenHere = [];

  $scope.fetchVenueInfo = function() {
    FootprintRequests.getFoursquareVenueInfo($scope.footprint.place.foursquareID, window.sessionStorage.userFbID)
    .then(function (venueInfo) {
      console.log(venueInfo);
      $scope.linkToFoursquare = venueInfo.data.venue.canonicalUrl;
      $scope.address = venueInfo.data.venue.location.formattedAddress;
      if(venueInfo.data.venue.hasMenu) {
        $scope.menu = venueInfo.data.venue.menu;
      }
      $scope.phone = venueInfo.data.venue.contact.formattedPhone;
    })
  };

  $scope.findUsersAlsoBeenHere = function() {
    FootprintRequests.findUsersAlsoBeenHere($scope.footprint.place.foursquareID, window.sessionStorage.userFbID)
    .then(function (users) {
      for(i = 0; i < users.data[0].users.length; i++) {
        if(users.data[0].users[i].facebookID !== window.sessionStorage.userFbID) {
          $scope.usersAlsoBeenHere.push(user.data[0].users[i]);
        }
      }
      console.log($scope.usersAlsoBeenHere);
    });
  }

  $scope.getFootprintInteractions = function () {
    FootprintRequests.getFootprintInteractions($scope.footprint.checkin.checkinID)
    .then(function (footprintInteractions) {
      console.dir(footprintInteractions);
      $scope.footprint.comments = footprintInteractions.data.comments;
      $scope.footprint.hypes = footprintInteractions.data.hypes;
    })
  };

  $scope.fetchVenueInfo();
  if($scope.headerTitle === 'folders') {
    $scope.subRouting = '-folders';
    $scope.footprint.user = UserRequests.loggedInUserInfo;
    $scope.getFootprintInteractions();
  }
  if($scope.headerTitle === 'notifications') {
    $scope.subRouting = '-notifications';
    $scope.footprint.user = UserRequests.loggedInUserInfo;
    $scope.getFootprintInteractions();
  }
  if($scope.headerTitle === 'me') {
    $scope.subRouting = '-profile';
  } else {
    $scope.subRouting = ''; 
  }
  $scope.findUsersAlsoBeenHere();

  $scope.goBack = function() {
  	$ionicHistory.goBack();
  };

  $scope.checkUserID = function(facebookID) {
    if(facebookID === window.sessionStorage.userFbID) {
      return true;
    } else {
      return false;
    }
  };

  $scope.openOptions = function (footprint) {
    $scope.selectedFootprintUserID = footprint.user.facebookID;
    $scope.selectedFootprintCheckinID = footprint.checkin.checkinID;
    // $scope.selectedFootprintIndex = index;
    $scope.optionsPopup = $ionicPopup.show({
      templateUrl: 'options-menu.html',
      scope: $scope
    });
  };

  $scope.deleteFootprint = function (checkinID, facebookID) {
    if(window.sessionStorage.userFbID === facebookID) {
      var deleteFootprintData = {
        facebookID: window.sessionStorage.userFbID,
        checkinID: checkinID
      };
      FootprintRequests.deleteFootprint(deleteFootprintData)
      .then(function(data) {
        $scope.showCreationSuccessAlert();
        FootprintRequests.deletedFootprint = true;
        console.log(data);
        $ionicHistory.goBack();
        // $state.go('tab.home', null, {reload: true});
      });
    }
  };

  $scope.openFoursquarePage = function() {
  	$window.open($scope.linkToFoursquare);
  }

  $scope.openMenu = function() {
  	$window.open($scope.menu.mobileUrl);
  }

  $scope.openDeleteFootprintPopup = function () {
    $scope.optionsPopup.close();
    var deleteFootprintPopup = $ionicPopup.show({
      templateUrl: 'delete-footprint.html',
      // title: 'Add Folder',
      scope: $scope,
      buttons: [
        { text: 'Cancel' },
        {
          text: '<b>Yes</b>',
          type: 'button-energized',
          onTap: function(e) {
              $scope.deleteFootprint($scope.selectedFootprintCheckinID, $scope.selectedFootprintUserID, $scope.selectedFootprintIndex);
          }
        }
      ]
    });
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

  $scope.callback = function(map) {
  	map.setView([$scope.footprint.place.lat, $scope.footprint.place.lng], 12);
  	L.mapbox.featureLayer({
	    type: 'Feature',
	    geometry: {
	        type: 'Point',
	        // coordinates here are in longitude, latitude order because
	        // x, y is the standard for GeoJSON and many formats
	        coordinates: [
	          $scope.footprint.place.lng, 
	          $scope.footprint.place.lat
	        ]
	    },
	    properties: {
	        title: $scope.footprint.place.name,
	        description: $scope.address,
	        'marker-size': 'large',
	        'marker-color': '#FF5050',
	        'marker-symbol': 'circle-stroked'
	    }
		}).addTo(map);
  };

};

EnlargedFootprintController.$inject = ['Auth', 'UserRequests', 'MapFactory', 'FootprintRequests', '$scope', '$state', '$ionicHistory', '$ionicPopup', '$timeout', '$window'];

var MapLocationDirective = function () {
	return {
		restrict: 'EA',
		replace: true,
		scope: {
			callback: "="
		},
		template: '<div id="map-location"></div>',
		link: function(scope, element, attributes) {
			L.mapbox.accessToken = 'pk.eyJ1Ijoid2FkZGxldXNlciIsImEiOiItQWlwaU5JIn0.mTIpotbZXv5KVgP4pkcYrA';
      var map = L.mapbox.map('map-location', 'injeyeo.8fac2415');
      scope.callback(map);
		}
	}

}

MapLocationDirective.$inject = [];

angular.module('waddle.enlarged-footprint', [])
  .controller('EnlargedFootprintController', EnlargedFootprintController)
  .directive('mapLocation', MapLocationDirective);
})();