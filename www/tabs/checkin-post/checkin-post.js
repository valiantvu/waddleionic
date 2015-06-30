(function(){

var CheckinPostController = function ($scope, $rootScope, $state, NativeCheckin, UserRequests, $ionicModal, $ionicLoading, $ionicPopup, $timeout, $ionicHistory, uuid4) {	

	$scope.checkinInfo = {footprintCaption: null, rating: '--', folder: null};
	$scope.selectedFolderInfo = {};
	$scope.newFolderInfo = {};
	$scope.selectedFolder = null;
  $scope.disabled = false;

	$scope.venue = NativeCheckin.selectedVenue;
  var photoUUID;
	console.log($scope.venue)

	$scope.getUserInfo = function () {
		UserRequests.getUserInfo(window.sessionStorage.userFbID)
		.then(function (data) {
			$scope.user = data.data;
		})
	};

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

	$scope.sendCheckinDataToServer = function(venueInfo) {
    $scope.disabled = true;
    //pull up loading modal
    console.log($scope.checkinInfo.photo);
		var checkinData = {
			id: venueInfo.id,
			name: venueInfo.name,
			lat: venueInfo.location.lat,
			lng: venueInfo.location.lng,
			rating: $scope.checkinInfo.rating,
			facebookID: window.sessionStorage.userFbID
		};
		if($scope.checkinInfo.footprintCaption) {
			checkinData.footprintCaption = $scope.checkinInfo.footprintCaption
		}
		if(venueInfo.categories[0] && venueInfo.categories[0].name) {
			checkinData.categories = venueInfo.categories[0].name;
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
  		  return NativeCheckin.sendCheckinDataToServer(checkinData);
  		})
  		.then(function (footprint) {
        //close loading modal
  			console.log(footprint);
        UserRequests.newFootprint = footprint.data;
          //this broadcast doesn't always get triggered on mobile, esp when connected to LTE; when it does get triggered, there is sometimes an issue
        //of displaying the new footprint twice, in the case that the new footprint gets appended to the list after the footprints list has already
        //refreshed with the new data
        $state.go('tab.home');
        $rootScope.$broadcast('newFootprint', footprint);
        //Other two sizes are uploaded to AWS
        // uploadImagesToAWS(photoUUID);
  		});
    } else {
        NativeCheckin.sendCheckinDataToServer(checkinData)
        .then(function (footprint) {
        //close loading modal
          console.log(footprint);
          UserRequests.newFootprint = footprint.data;
          $state.go('tab.home');
        //this broadcast doesn't always get triggered on mobile, esp when connected to LTE; when it does get triggered, there is sometimes an issue
        //of displaying the new footprint twice, in the case that the new footprint gets appended to the list after the footprints list has already
        //refreshed with the new data
          $rootScope.$broadcast('newFootprint', footprint);
        })
    }
	}



	$scope.showCheckinInfo = function() {
		console.log($scope.checkinInfo.footprintCaption);
		console.log($scope.checkinInfo.rating);
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

	$scope.getUserInfo();
	$scope.viewFoldersList();

	 $scope.showPopup = function() {

      $scope.myPopup = $ionicPopup.show({
        templateUrl: 'folder-list.html',
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
        templateUrl: 'add-folder.html',
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
        templateUrl: 'folder-create-success.html'
      });
      // creationSuccessAlert.then(function(res) {
      // });
      $timeout(function() {
       creationSuccessAlert.close(); //close the popup after 1 second
      }, 1500);
    };

};

CheckinPostController.$inject = ['$scope', '$rootScope', '$state', 'NativeCheckin', 'UserRequests', '$ionicModal', '$ionicLoading', '$ionicPopup', '$timeout', '$ionicHistory', 'uuid4'];

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

var PictureSelectDirective = function ($q) {
	return {
        restrict:'AE',
        template:'<div class="content padding">'
							    + '<input type="file" id="files" accept="image/*"/>'
							    + '<img class="full-image" id="preview" ng-click="browseFile()" src="https://s3-us-west-2.amazonaws.com/waddle/app+assets/Screen+Shot+2015-03-31+at+2.58.15+PM.png">'
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

                  var resizedFileAsDataURL = canvas.toDataURL(fileType);
                  //data url converted to blob for aws upload
                  var blob = dataURItoBlob(resizedFileAsDataURL, fileType);
                  console.log(blob); 
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

PictureSelectDirective.$inject = ['$q'];

angular.module('waddle.checkin-post', [])
  .controller('CheckinPostController', CheckinPostController)
  .directive('starRating', StarRatingDirective)
  .directive('pictureSelect', PictureSelectDirective);
})();