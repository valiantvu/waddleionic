(function(){

var EnlargedFootprintController = function (Auth, UserRequests, MapFactory, FootprintRequests, $scope, $state, $ionicHistory, $ionicPopup, $timeout, $window, $cordovaContacts, $cordovaSms, $cordovaFacebook, $localstorage) {
    
  // $scope.footprint = FootprintRequests.openFootprint;
  $scope.selectedFootprintIndex = FootprintRequests.selectedFootprintIndex;
  $scope.headerTitle = FootprintRequests.currentTab;
  $scope.usersAlsoBeenHere = [];
  $scope.facebookInfo = {};

  $scope.$on('$stateChangeSuccess', function($currentRoute, $previousRoute) {
    console.log($previousRoute);
    if($previousRoute.url === "/home" || $previousRoute.url === "/enlarged-footprint") {
      FootprintRequests.currentTab = "feed";
      $scope.headerTitle = "feed";
    } else if($previousRoute.url === "/folders" || $previousRoute.url === "/enlarged-footprint-folders") {
      FootprintRequests.currentTab = "folders";
      $scope.headerTitle = "folders";
    } else if($previousRoute.url === "/notifications" || $previousRoute.url === "/enlarged-footprint-notifications") {
      FootprintRequests.currentTab = "notifications";
      $scope.headerTitle = "notifications";
    } else if($previousRoute.url === "/profile" || $previousRoute.url === "/enlarged-footprint-profile") {
      FootprintRequests.currentTab = "me";
      $scope.headerTitle = "me";
    }

    if(FootprintRequests.editedCheckin) {
      $scope.footprint.checkin.rating = FootprintRequests.editedCheckin.rating;
      $scope.footprint.checkin.caption = FootprintRequests.editedCheckin.caption;
      $scope.footprint.checkin.photoLarge = FootprintRequests.editedCheckin.photoLarge;
      FootprintRequests.editedCheckin = false;
    } 
  });

  $scope.fetchVenueInfo = function() {
    var location;
    FootprintRequests.getFoursquareVenueInfo($scope.footprint.place.foursquareID, window.sessionStorage.userFbID)
    .then(function (venueInfo) {
      // console.log(venueInfo);
      location = venueInfo.data.venue.location;
      $scope.linkToFoursquare = venueInfo.data.venue.canonicalUrl;
      $scope.address = location.address;
      console.log($scope.address);
      $scope.textAddress = location.address + ", " + location.city;
      if(location.country === "United States" && location.state) {
        $scope.address += ", " + location.state;
      }
      if(location.country !== "United States") {
        $scope.address += ", " + location.country;
      }
        
      console.log(venueInfo.data.venue.location)
      if(venueInfo.data.venue.hasMenu) {
        $scope.menu = venueInfo.data.venue.menu;
      }
      $scope.phone = venueInfo.data.venue.contact.formattedPhone;
    })
  };

   $scope.openFoursquarePage = function() {
    // var foursquareLink = document.getElementsByName('view-in-foursquare')[0];
    // console.log(foursquareLink);
    // foursquareLink.setAttribute('href', $scope.linkToFoursquare);
    window.open($scope.linkToFoursquare, '_system', 'location=yes');
  };

  $scope.findUsersAlsoBeenHere = function() {
    FootprintRequests.findUsersAlsoBeenHere($scope.footprint.place.foursquareID, window.sessionStorage.userFbID)
    .then(function (users) {
      console.log(users);
      for(i = 0; i < users.data[0].users.length; i++) {
        if(users.data[0].users[i].facebookID !== window.sessionStorage.userFbID) {
          $scope.usersAlsoBeenHere.push(users.data[0].users[i]);
        }
      }
    });
  }

  $scope.getFootprintInteractions = function (openFootprint) {
    FootprintRequests.getFootprintInteractions($scope.footprint.checkin.checkinID)
    .then(function (footprintInteractions) {
      console.log(footprintInteractions.data)
      $scope.footprint.comments = footprintInteractions.data.comments;
      $scope.footprint.hypes = footprintInteractions.data.hypes;
      openFootprint.comment = footprintInteractions.data.comments;
      openFootprint.hypes = footprintInteractions.data.hypes;
    })
  };

  if($scope.headerTitle === 'folders') {
    $scope.subRouting = '-folders';
    $scope.footprint = FootprintRequests.openFootprintFolders;
    $scope.getFootprintInteractions(FootprintRequests.openFootprintFolders);
  } else if($scope.headerTitle === 'notifications') {
    $scope.subRouting = '-notifications';
    $scope.footprint = FootprintRequests.openFootprintNotifications;
    $scope.getFootprintInteractions(FootprintRequests.openFootprintNotifications);
  } else if($scope.headerTitle === 'me') {
    $scope.subRouting = '-profile';
    $scope.footprint = FootprintRequests.openFootprintProfile;
    $scope.getFootprintInteractions(FootprintRequests.openFootprintProfile);
  } else {
    $scope.subRouting = '';
    $scope.footprint = FootprintRequests.openFootprint;
  }
  $scope.fetchVenueInfo();
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
      templateUrl: 'modals/options-menu.html',
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
        $scope.showDeletionSuccessAlert();
        FootprintRequests.deletedFootprint = true;
        console.log(data);
        $ionicHistory.goBack();
      })
    };
  }

  $scope.viewFriendsList = function() {
    var route = 'tab.friends' + $scope.subRouting;
    $state.go(route);
  };

  $scope.openMenu = function() {
  	$window.open($scope.menu.mobileUrl, '_system', 'location=yes');
  };

  $scope.toggleMapDisplay = function() {
    console.log('toggling')
    $scope.mapDisplay = $scope.mapDisplay === true ? false : true;
  };

   $scope.toggleCategoryNameDisplay = function() {
    console.log('toggling')
    $scope.categoryName = $scope.categoryName === true ? false : true;
  };

  $scope.openMap = function () {
    var placeName = encodeURIComponent($scope.footprint.place.name)
    var lat = $scope.footprint.place.lat;
    var lng = $scope.footprint.place.lng;
    var mapLink = "maps://maps.apple.com/?q=" + placeName + "&ll=" + lat + "," + lng + "&near=" + lat + "," + lng;
    $window.open(mapLink, '_system', 'location=yes');
  };

  $scope.setShareMessage = function () {
    console.log('setting message');
    console.log($localstorage.getObject('user'));
    console.log($localstorage.getObject('user').name);

    if(window.sessionStorage.userFbID === $scope.footprint.user.facebookID) {
      var message = "Sent from Waddle for iOS:%0D%0A" 
      + $localstorage.getObject('user').name + 
      " thought you'd like "+ $scope.footprint.place.name + "!%0D%0A%0D%0AThey rated " + $scope.footprint.place.name + " " + $scope.footprint.checkin.rating + 
      " stars out of 5.%0D%0A";
      if($scope.textAddress) {
        message += $scope.textAddress + "%0D%0A" 
      } 
      if($scope.footprint.checkin.caption !== 'null') {
        message += "%0D%0A Here's what " + $scope.footprint.user.name + " said: " + '"' + $scope.footprint.checkin.caption + '"';
      }   
    } else {
      var message = "Sent from Waddle for iOS:%0D%0A" 
      + $localstorage.getObject('user').name + 
      " thought you'd like " + $scope.footprint.place.name + "!%0D%0A%0D%0ATheir friend, " + $scope.footprint.user.name + ", rated " 
      + $scope.footprint.place.name + " " + $scope.footprint.checkin.rating + 
      " stars out of 5.%0D%0A";
      if($scope.textAddress) {
        message += $scope.textAddress + "%0D%0A";
      } 
      if($scope.footprint.checkin.caption !== 'null') {
        message += "%0D%0AHere's what they said: " + '"' + $scope.footprint.checkin.caption + '"';
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

  $scope.publishToFacebook = function() {
    $scope.shareOptions.close();
    var footprint = $scope.footprint;
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

      })      
    }, function (error) {
      console.log(error);
    });
  };

  $scope.openDeleteFootprintPopup = function () {
    $scope.optionsPopup.close();

    //janky way to remove myPopup from DOM (fix for .close() method not completely working in ionic 1.0.1)
    var popup = document.getElementsByClassName('popup-container')[0];
    document.body.removeChild(popup);

    var deleteFootprintPopup = $ionicPopup.show({
      templateUrl: 'modals/delete-footprint.html',
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

  $scope.showCreationSuccessAlert = function() {
    var creationSuccessAlert = $ionicPopup.show({
      title: 'New Folder Added!',
      templateUrl: 'modals/folder-create-success.html'
    });
   
    $timeout(function() {
     creationSuccessAlert.close(); //close the popup after 1 second
    }, 1500);
  };

  $scope.showDeletionSuccessAlert = function () {
    var deletionSuccessAlert = $ionicPopup.show({
      templateUrl: 'modals/footprint-delete-success.html'
    });
   
    $timeout(function() {
     deletionSuccessAlert.close(); //close the popup after 1 second
    }, 1700);
  };

  $scope.showShareOptions = function () {
    $scope.shareOptions = $ionicPopup.show({
      title: 'suggest this footprint:',
      templateUrl: 'modals/share-options.html',
      scope: $scope
    })
    //function placed inside timeout to ensure anchor tag href exists in DOM before value of message is set
    $timeout($scope.setShareMessage, 0);
  };

  $scope.showFacebookPostSuccessAlert = function () {
    var facebookPostSuccessAlert = $ionicPopup.show({
      templateUrl: 'modals/facebook-post-success.html'
    });
     
    $timeout(function() {
      facebookPostSuccessAlert.close(); //close the popup after 1 second
    }, 2000);
  };

  $scope.setMarker = function(map) {
    // $scope.map = map;
  	map.setView([$scope.footprint.place.lat, $scope.footprint.place.lng], 12);
    var myLayer = L.mapbox.featureLayer().addTo(map);

    var geojson = {
      type: 'Feature Collection',
      features: [{
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
  		}]
    };
    myLayer.setGeoJSON(geojson);
  };
};

EnlargedFootprintController.$inject = ['Auth', 'UserRequests', 'MapFactory', 'FootprintRequests', '$scope', '$state', '$ionicHistory', '$ionicPopup', '$timeout', '$window', '$cordovaContacts', '$cordovaSms', '$cordovaFacebook', '$localstorage'];

var MapLocationDirective = function ($location) {
	return {
		restrict: 'EA',
		replace: true,
		scope: {
			setMarker: "="
		},
    template: '<div class="map"></div>',
		link: function(scope, element, attributes) {
			L.mapbox.accessToken = 'pk.eyJ1Ijoid2FkZGxldXNlciIsImEiOiItQWlwaU5JIn0.mTIpotbZXv5KVgP4pkcYrA';
      var map = L.mapbox.map(element[0], 'injeyeo.8fac2415', {
        attributionControl: false,
        zoomControl: false
      });
      map.dragging.disable();
      map.touchZoom.disable();
      map.doubleClickZoom.disable();
      map.scrollWheelZoom.disable();
      scope.setMarker(map);
		}
	}

}

MapLocationDirective.$inject = ['$location'];

angular.module('waddle.enlarged-footprint', [])
  .controller('EnlargedFootprintController', EnlargedFootprintController)
  .directive('mapLocation', MapLocationDirective);
})();