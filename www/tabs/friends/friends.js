(function(){

var FriendsController = function (UserRequests, FootprintRequests, $scope, $state, $ionicHistory, $ionicPopup, $timeout) {
  $scope.friends = [];
  $scope.moreDataCanBeLoaded = true;
  $scope.selectedFriendsIndices = [];
  $scope.selectedFriends = [];
  $scope.highlightFriend = false;

  var page = 0;
  var skipAmount = 10;

  $scope.$on('$stateChangeSuccess', function($currentRoute, $previousRoute) {
  	console.log($previousRoute);
      if($previousRoute.url === "/home" || $previousRoute.url === "/friends") {
      	$scope.footprint = FootprintRequests.openFootprint;
      } else if($previousRoute.url === "/folders" || $previousRoute.url === "/friends-folders") {
        $scope.footprint = FootprintRequests.openFootprintFolders;
      } else if($previousRoute.url === "/notifications" || $previousRoute.url === "/friends-notifications") {
        $scope.footprint = FootprintRequests.openFootprintNotifications;
      } else if($previousRoute.url === "/profile" || $previousRoute.url === "/friends-profile") {
        $scope.footprint = FootprintRequests.openFootprintProfile;
      } 
  });

  $scope.viewFriends = function() {
  	 UserRequests.getFriendsList(window.sessionStorage.userFbID, page, skipAmount)
    .then(function (friends) {
      console.log(friends.data);
      if(friends.data.length > 0) {
	      $scope.friends = $scope.friends.concat(friends.data);
	      console.log($scope.friends);
	      page++;
      } else {
      	$scope.moreDataCanBeLoaded = false;
      }
      $scope.$broadcast('scroll.infiniteScrollComplete');
    });
  };

  $scope.toggleSelectedFriends = function (friend, $index) {
    var selectedFriendIndex = $scope.selectedFriendsIndices.indexOf($index);

  	if(selectedFriendIndex > -1) {
  		$scope.selectedFriendsIndices.splice(selectedFriendIndex, 1);
  		$scope.selectedFriends.splice(selectedFriendIndex, 1);
  	} else {
	  	$scope.selectedFriendsIndices.push($index);
	  	$scope.selectedFriends.push(friend.facebookID);
  	}
  	console.log($scope.selectedFriends);
  };

  $scope.suggestToFriends = function () {
    var suggestionDate = new Date();
    var suggestionTime = suggestionDate.getTime();

    var params = {
      senderFacebookID: window.sessionStorage.userFbID,
      checkinID: $scope.footprint.checkin.checkinID,
      receiverFacebookID: $scope.selectedFriends,
      suggestionTime: suggestionTime
    };

    console.log(params);

    UserRequests.suggestToFriend(params)
    .then(function (data) {
    	$scope.showSuggestionSentSuccessAlert();
    	$ionicHistory.goBack();
    	console.log(data.data);
    });
  };

  $scope.goBack = function () {
  	$ionicHistory.goBack();
  }

  $scope.showSuggestionSentSuccessAlert = function () {
  	var suggestionSentSuccessAlert = $ionicPopup.show({
  		title: 'Suggestion Sent!',
  		templateUrl: 'modals/suggestion-success.html'
  	});

  	$timeout(function() {
       suggestionSentSuccessAlert.close(); //close the popup after 1 second
     }, 2000);

  }
};

FriendsController.$inject = ['UserRequests', 'FootprintRequests', '$scope', '$state', '$ionicHistory', '$ionicPopup', '$timeout'];

var AutoListDivider = function($timeout) {  
	var lastDivideKey = "";

	return {
		link: function(scope, element, attrs) {
			var key = attrs.autoListDividerValue;

			var defaultDivideFunction = function(k){
				return k.slice( 0, 1 ).toUpperCase();
			}
      
			var doDivide = function(){
				var divideFunction = scope.$apply(attrs.autoListDividerFunction) || defaultDivideFunction;
				var divideKey = divideFunction(key);
				
				if(divideKey != lastDivideKey) { 
					var contentTr = angular.element("<div class='item background-coral white-text friend-divider item-divider'>"+divideKey+"</div>");
					element[0].parentNode.insertBefore(contentTr[0], element[0]);
				}

				lastDivideKey = divideKey;
			}
		  
			$timeout(doDivide,0)
		}
	}
};

AutoListDivider.$inject = ['$timeout'];

angular.module('waddle.friends', [])
  .controller('FriendsController', FriendsController)
  .directive('autoListDivider', AutoListDivider);
})();