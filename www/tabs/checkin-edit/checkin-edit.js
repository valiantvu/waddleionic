(function(){

var CheckinEditController = function ($scope, $rootScope, $state, NativeCheckin, UserRequests, FootprintRequests, $ionicModal, $ionicLoading, $ionicPopup, $timeout, $ionicHistory) {	

	// $scope.venue = FootprintRequests.openFootprint;
 //  $scope.checkinInfo = {footprintCaption: $scope.venue.checkin.caption, rating: $scope.venue.checkin.rating, folder: null};
 //  $scope.selectedFolderInfo = {};
 //  $scope.newFolderInfo = {};
 //  $scope.selectedFolder = null;

	// console.log($scope.venue)

	// $scope.getUserInfo = function () {
	// 	UserRequests.getUserInfo(window.sessionStorage.userFbID)
	// 	.then(function (data) {
	// 		$scope.user = data.data;
	// 	})
	// };

	// $scope.viewFoldersList = function() {
 //    UserRequests.fetchFolders(window.sessionStorage.userFbID, 0, 10)
 //    .then(function (folders) {
 //      $scope.folders = folders.data;
 //      UserRequests.userFolderData = folders.data
 //      console.log($scope.folders)
 //    })
 //   };

 //  $scope.passSelectedFolderInfo = function(folder, $index) {
 //  	$scope.selectedFolder = $index;
 //    $scope.selectedFolderInfo.name = folder.folder.name;
 //  };
  
 //  $scope.goBack = function () {
 //  	$ionicHistory.goBack();
 //  };

	// $scope.sendCheckinDataToServer = function(venueInfo) {
	// 	var revisedCheckinData = {
 //      checkinID: $scope.venue.checkin.checkinID,
	// 		rating: $scope.checkinInfo.rating,
	// 		facebookID: window.sessionStorage.userFbID
	// 	};
	// 	if($scope.checkinInfo.footprintCaption) {
	// 		checkinData.footprintCaption = $scope.checkinInfo.footprintCaption
	// 	}

	// 	if($scope.checkinInfo.folder) {
	// 		checkinData.folderName = $scope.checkinInfo.folder
	// 	}

 //    //to-do: check if file has been uploaded, then kick of s3_upload; else, just send checkin data to server 

	// 	NativeCheckin.s3_upload()
	// 	.then(function (public_url) {
	// 	  checkinData.photo = public_url;
	// 	  console.log('venueInfo: ' + JSON.stringify(checkinData));
	// 	  return NativeCheckin.editCheckin(checkinData);
	// 	})
	// 	.then(function (footprint) {
	// 		console.log(footprint);
 //      UserRequests.newFootprint = footprint.data;
 //      $rootScope.$broadcast('newFootprint', footprint);
 //      $state.go('tab.home', {}, {reload: true});
	// 	});
	// }

	// $scope.showCheckinInfo = function() {
	// 	console.log($scope.checkinInfo.footprintCaption);
	// 	console.log($scope.checkinInfo.rating);
	// };

	// $scope.addFootprintToFolder = function (folderName) {
 //      // UserRequests.addFootprintToFolder(window.sessionStorage.userFbID, checkinID, folderName)
 //      // .then(function (data) {
 //        $scope.checkinInfo.folder = folderName;
 //        $scope.showCreationSuccessAlert();
 //        // console.log(data);
 //      // })
 //  };

 //  $scope.createFolderAndAddFootprintToFolder = function (folderName, folderDescription) {
 //  	UserRequests.addFolder(window.sessionStorage.userFbID, folderName, folderDescription)
 //  	.then (function (data) {
 //  		$scope.addFootprintToFolder(folderName);
 //  	})

 //  };

	// $scope.getUserInfo();
	// $scope.viewFoldersList();

	//  $scope.showPopup = function() {

 //      // An elaborate, custom popup
 //      $scope.myPopup = $ionicPopup.show({
 //        templateUrl: 'folder-list.html',
 //        title: 'Create or Select a Folder',
 //        // subTitle: 'Please use normal things',
 //        scope: $scope,
 //        buttons: [
 //          { text: 'Cancel' },
 //          {
 //            text: '<b>Save</b>',
 //            type: 'button-positive',
 //            onTap: function(e) {
 //             $scope.addFootprintToFolder($scope.selectedFolderInfo.name);
 //            }
 //          }
 //        ]
 //      });

 //    };

 //    $scope.showFolderCreationPopup = function() {
 //      $scope.newFolderInfo = {};
 //      $scope.myPopup.close();
 //      // An elaborate, custom popup
 //      var folderCreationPopup = $ionicPopup.show({
 //        templateUrl: 'add-folder.html',
 //        title: 'Add Folder',
 //        scope: $scope,
 //        buttons: [
 //          { text: 'Cancel' },
 //          {
 //            text: '<b>Save</b>',
 //            type: 'button-energized',
 //            onTap: function(e) {
 //                $scope.createFolderAndAddFootprintToFolder($scope.newFolderInfo.name, $scope.newFolderInfo.description);
 //            }
 //          }
 //        ]
 //      });
 //      // myPopup.then(function(res) {
 //      //   console.log('Tapped!', res);
 //      // });
 //    };

 //    $scope.showCreationSuccessAlert = function() {
 //      var creationSuccessAlert = $ionicPopup.show({
 //        title: 'New Folder Added!',
 //        templateUrl: 'folder-create-success.html'
 //      });
 //      // creationSuccessAlert.then(function(res) {
 //      // });
 //      $timeout(function() {
 //       creationSuccessAlert.close(); //close the popup after 1 second
 //      }, 1500);
 //    };

};

CheckinEditController.$inject = ['$scope', '$rootScope', '$state', 'NativeCheckin', 'UserRequests', 'FootprintRequests', '$ionicModal', '$ionicLoading', '$ionicPopup', '$timeout', '$ionicHistory'];

var StarRatingDirective = function () {
	return {
		restrict: 'A',
		template: '<ul class="rating">'
		   + ' <li ng-repeat="star in stars" ng-class="star" ng-click="toggle($index)">'
		   + '  <i class="ion-star checkin"></i>'
		   + ' </li>'
		   + '</ul>',
		scope: {
		 ratingValue: '=',
		 max : '=',
		 onRatingSelected: '&'
		},
		link: function(scope, elem, attrs) {
		 var updateStars = function() {
		  scope.stars = [];
		  for (var i = 0; i < scope.max; i++) {
		   scope.stars.push({
		    filled : i < scope.ratingValue
		   });
		  }
		 };
		 
		 scope.toggle = function(index) {
		  scope.ratingValue = index + 1;
		  scope.onRatingSelected({
		   rating : index + 1
		  });
		 };
		 
		 scope.$watch('ratingValue',
		  function(oldVal, newVal) {
		    if(newVal) {
		      updateStars();
		    }
		  });
	  }
  }
};

StarRatingDirective.$inject = [];

var PictureSelectDirective = function () {
	return {
        restrict:'AE',
        template:'<div class="content padding">'
							    + '<input type="file" id="files" accept="image/*"/>'
							    + '<img class="full-image" id="preview" ng-click="browseFile()" src="https://s3-us-west-2.amazonaws.com/waddle/app+assets/Screen+Shot+2015-03-31+at+2.58.15+PM.png">'
                  + '<img class="full-image" src'
							+ '</div>',
        scope:{

        },
        replace:true,
        link:function(scope,elem,attrs){

            scope.browseFile=function(){
                document.getElementById('files').click();
            }

            angular.element(document.getElementById('files')).on('change',function(e){

               var file=e.target.files[0];

               angular.element(document.getElementById('files')).val('');

               var fileReader=new FileReader();

               fileReader.onload=function(event){
                   console.log(event);
                   document.getElementById('preview').src = event.target.result;
                   // $rootScope.$broadcast('event:file:selected',{image:event.target.result,sender:USER.name})
               }

               fileReader.readAsDataURL(file);
            });

        }
    }
};

PictureSelectDirective.$inject = [];

angular.module('waddle.checkin-edit', [])
  .controller('CheckinEditController', CheckinEditController)
  // .directive('starRating', StarRatingDirective)
  // .directive('pictureSelect', PictureSelectDirective);
})();