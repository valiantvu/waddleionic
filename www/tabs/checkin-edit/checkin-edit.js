(function(){

var CheckinEditController = function ($scope, $rootScope, $state, NativeCheckin, UserRequests, FootprintRequests, $ionicModal, $ionicLoading, $ionicPopup, $timeout, $ionicHistory, uuid4, $localstorage) {	

	$scope.checkinInfo = {footprintCaption: null, rating: '--', folder: null};
	$scope.selectedFolderInfo = {};
	$scope.newFolderInfo = {};
	$scope.selectedFolder = null;
  $scope.disabled = false;
  $scope.loading = false;
  $scope.fbProfilePicture = $localstorage.getObject('user').fbProfilePicture;
  var photoUUID;
  var backView = $ionicHistory.backView();
  console.log(backView);
    if(backView.stateName === "tab.home" || backView.stateName === "tab.enlarged-footprint") {
    FootprintRequests.currentTab = "feed";
    $scope.footprint = FootprintRequests.openFootprint;
  } else if(backView.stateName === "tab.folders" || backView.stateName === "tab.enlarged-footprint-folders") {
    FootprintRequests.currentTab = "folders";
    $scope.footprint = FootprintRequests.openFootprintFolders;
  } else if(backView.stateName === "tab.notifications" || backView.stateName === "tab.enlarged-footprint-notifications") {
    FootprintRequests.currentTab = "notifications";
    $scope.footprint = FootprintRequests.openFootprintNotifications;;
  } else if(backView.stateName === "tab.profile" || backView.stateName === "tab.enlarged-footprint-profile") {
    FootprintRequests.currentTab = "me";
    $scope.footprint = FootprintRequests.openFootprintProfile;
  } 
  
  $scope.checkinInfo.rating = $scope.footprint.checkin.rating;
  $scope.footprintRating = $scope.footprint.checkin.rating;

  if($scope.footprint.checkin.photoLarge !== 'null') {
    console.log('photoLarge');
    document.getElementById('preview').src = $scope.footprint.checkin.photoLarge;
  }

  if($scope.footprint.checkin.caption !== 'null') {
    $scope.checkinInfo.footprintCaption = $scope.footprint.checkin.caption;
  }

	$scope.viewFoldersList = function() {
    UserRequests.fetchFolders(window.sessionStorage.userFbID, 0, 10)
    .then(function (folders) {
      $scope.folders = folders.data;
      UserRequests.userFolderData = folders.data
      console.log($scope.folders)
    })
   };

  $scope.passSelectedFolderInfo = function(folder, $index) {
  	$scope.selectedFolder = $index;
    $scope.selectedFolderInfo.name = folder.folder.name;
  };
  
  $scope.goBack = function () {
  	$ionicHistory.goBack();
  };

  $scope.sendEditedCheckinDataToServer = function() {
    $scope.disabled = true;
    $scope.loading = true;
    var checkinData = {
      facebookID: window.sessionStorage.userFbID,
      checkinID: $scope.footprint.checkin.checkinID,
      rating: $scope.checkinInfo.rating
    };
    if($scope.checkinInfo.footprintCaption) {
      checkinData.footprintCaption = $scope.checkinInfo.footprintCaption;
    }

    if($scope.checkinInfo.folder) {
      checkinData.folderName = $scope.checkinInfo.folder
    }

    if($scope.checkinInfo.photo) {
      var photoUUID = uuid4.generate();
      console.log(photoUUID);
      var iphone6Photo = $scope.checkinInfo.photo.splice(0,1);
      var formattedPhoto = {files: {0:iphone6Photo[0], length: 1}};
      console.log(formattedPhoto);
      NativeCheckin.s3_upload(formattedPhoto, window.sessionStorage.userFbID, photoUUID, 'iphone6')
      .then(function (public_url) {
        checkinData.photo = public_url;
        console.log('venueInfo: ' + JSON.stringify(checkinData));
        return NativeCheckin.editCheckin(checkinData);
      })
      .then(function (editedCheckin) {
        editCheckinSuccess(editedCheckin);
      });
    } else if($scope.footprint.checkin.photoLarge !== 'null') {
      checkinData.photo = $scope.footprint.checkin.photoLarge;
      NativeCheckin.editCheckin(checkinData)
      .then(function (editedCheckin) {
        editCheckinSuccess(editedCheckin);
      })
    } else {
      NativeCheckin.editCheckin(checkinData)
      .then(function (editedCheckin) {
        editCheckinSuccess(editedCheckin);
      })
    }
  };

  var editCheckinSuccess = function(editedCheckin) {
    $scope.showEditSuccessAlert();
        //close loading modal
    $scope.loading = false;

    console.log(editedCheckin);
    FootprintRequests.editedCheckin = editedCheckin.data[0].checkin;
    $ionicHistory.goBack();
  };

	$scope.addFootprintToFolder = function (folderName) {
      // UserRequests.addFootprintToFolder(window.sessionStorage.userFbID, checkinID, folderName)
      // .then(function (data) {
        $scope.checkinInfo.folder = folderName;
        $scope.showCreationSuccessAlert();
        // console.log(data);
      // })
  };

  $scope.createFolderAndAddFootprintToFolder = function (folderName, folderDescription) {
  	UserRequests.addFolder(window.sessionStorage.userFbID, folderName, folderDescription)
  	.then (function (data) {
  		$scope.addFootprintToFolder(folderName);
  	})

  };

  var uploadImagesToAWS = function(photoUUID) {
    //the photo uploaded to AWS in the previous step has been spliced out of the array, leaving the remaining sizes to be uploaded
    var formattedPhoto, size;
    (function() {
      var i = 0;
      function uploadImageToAWS() {
        if(i < $scope.checkinInfo.photo.length) {
          if(i === 0) {
            size = 'full';
          } else {
            size = 'thumb';
          }
          formattedPhoto = {files: {0:$scope.checkinInfo.photo[i], length: 1}};
          console.log(formattedPhoto);
          console.log(size);
          NativeCheckin.s3_upload(formattedPhoto, window.sessionStorage.userFbID, photoUUID, size)
          .then(function (public_url) {
            console.log(public_url);
            i++;
            uploadImageToAWS();
          })
        } else {
          console.log('finished uploading photos');
        }
      }
      uploadImageToAWS();
    })();
  };

	$scope.viewFoldersList();

	 $scope.showPopup = function() {

      $scope.myPopup = $ionicPopup.show({
        templateUrl: 'modals/folder-list.html',
        title: 'Create or Select a Folder',
        // subTitle: 'Please use normal things',
        scope: $scope,
        buttons: [
          { text: 'Cancel' },
          {
            text: '<b>Save</b>',
            type: 'button-positive',
            onTap: function(e) {
             $scope.addFootprintToFolder($scope.selectedFolderInfo.name);
            }
          }
        ]
      });

    };

    $scope.showFolderCreationPopup = function() {
      $scope.newFolderInfo = {};
      $scope.myPopup.close();
      // An elaborate, custom popup
      var folderCreationPopup = $ionicPopup.show({
        templateUrl: 'modals/add-folder.html',
        title: 'Add Folder',
        scope: $scope,
        buttons: [
          { text: 'Cancel' },
          {
            text: '<b>Save</b>',
            type: 'button-energized',
            onTap: function(e) {
                $scope.createFolderAndAddFootprintToFolder($scope.newFolderInfo.name, $scope.newFolderInfo.description);
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
        templateUrl: 'modals/folder-create-success.html'
      });
      // creationSuccessAlert.then(function(res) {
      // });
      $timeout(function() {
       creationSuccessAlert.close(); //close the popup after 1 second
      }, 1500);
    };

    $scope.showEditSuccessAlert = function() {
      var editSuccessAlert = $ionicPopup.show({
        title: "Edit successful!",
        templateUrl: "modals/edit-success.html"
      });

      $timeout(function() {
        editSuccessAlert.close();
      }, 2000);
    };

};

CheckinEditController.$inject = ['$scope', '$rootScope', '$state', 'NativeCheckin', 'UserRequests', 'FootprintRequests', '$ionicModal', '$ionicLoading', '$ionicPopup', '$timeout', '$ionicHistory', 'uuid4', '$localstorage'];

var StarsRatingDirective = function () {
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
		 onRatingSelected: '&',
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

StarsRatingDirective.$inject = [];

var PhotoSelectDirective = function ($q) {
	return {
        restrict:'AE',
        template:'<div class="content padding">'
							    + '<input type="file" id="files" accept="image/*"/>'
							    + '<img class="full-image" id="preview" ng-click="browseFile()" src="img/Screen+Shot+2015-03-31+at+2.58.15+PM.png">'
							+ '</div>',
        scope: {
          photoFile: '=',
          onPhotoSelected: '&'
        },
        replace:true,
        link:function(scope,elem,attrs){

            scope.browseFile = function(){
                document.getElementById('files').click();
            }

              var dataURItoBlob = function(dataURI, imageFileType) {
                console.log(imageFileType);
                var binary = atob(dataURI.split(',')[1]);
                var array = [];
                for(var i = 0; i < binary.length; i++) {
                    array.push(binary.charCodeAt(i));
                }
                return new Blob([new Uint8Array(array)], {type: imageFileType});
              }

              var resizeImageAndGenerateAsBlob = function (dimensions, imageFile, fileType) {
                var deferred = $q.defer();
                var blob;
                var image = new Image();
                image.src = imageFile;
                image.onload = function (){
                  var maxWidth = dimensions.width,
                      maxHeight = dimensions.height,
                      imageWidth = image.width,
                      imageHeight = image.height;

                  if (imageWidth > imageHeight) {
                    if (imageWidth > maxWidth) {
                      imageHeight *= maxWidth / imageWidth;
                      imageWidth = maxWidth;
                    }
                  }
                  else {
                    if (imageHeight > maxHeight) {
                      imageWidth *= maxHeight / imageHeight;
                      imageHeight = maxHeight;
                    }
                  }

                  var canvas = document.createElement('canvas');
                  canvas.width = imageWidth;
                  canvas.height = imageHeight;

                  var ctx = canvas.getContext("2d");
                  ctx.drawImage(this, 0, 0, imageWidth, imageHeight);

                  canvas.toBlob(function (newBlob) {
                    console.log(newBlob);
                    blob = newBlob;
                  }, fileType)

                  // var resizedFileAsDataURL = canvas.toDataURL(fileType);
                  // //data url converted to blob for aws upload
                  // var blob = dataURItoBlob(resizedFileAsDataURL, fileType);
                  // console.log(blob); 
                  deferred.resolve(blob);
                }
                return deferred.promise;
              }
            angular.element(document.getElementById('files')).on('change',function(e){


               var file = e.target.files[0];
               var fileType = file.type;
               var photoBucket = [];
               var desiredDimensions = [{width: 640, height: 1200}, {width: 100, height: 200}];
               // pushing in the original photo file
               photoBucket.push(file);
            
               angular.element(document.getElementById('files')).val('');
               var fileReader = new FileReader();


               //photoBucket contains the uploaded photo at orginal and reduced image sizes
               fileReader.onload=function(event){
                console.log(event.target);
                document.getElementById('preview').src = event.target.result;
                for(var i = 0; i < desiredDimensions.length; i++) {
                  resizeImageAndGenerateAsBlob(desiredDimensions[i], fileReader.result, fileType)
                  .then(function (resizedImageAsBlob) {
                    console.log(resizedImageAsBlob);
                    photoBucket.push(resizedImageAsBlob);
                  });
                }                  
                  scope.photoFile = photoBucket; 
                  scope.onPhotoSelected({
                    photo: photoBucket
                  });          
                 console.log(photoBucket);

               }
               fileReader.readAsDataURL(photoBucket[0]);
            });

        }
    }
};

PhotoSelectDirective.$inject = ['$q'];

angular.module('waddle.checkin-edit', [])
  .controller('CheckinEditController', CheckinEditController)
  .directive('starsRating', StarsRatingDirective)
  .directive('photoSelect', PhotoSelectDirective);
})();