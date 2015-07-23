(function(){

var CommentsController = function (Auth, UserRequests, MapFactory, FootprintRequests, $scope, $state, $ionicActionSheet, $ionicHistory, moment, $localstorage) {
    
    // $scope.footprint = FootprintRequests.openFootprint;
    $scope.currentTab = FootprintRequests.currentTab;
    $scope.selectedFootprintInteractions = {};
    $scope.userFbProfilePicture = $localstorage.getObject('user').fbProfilePicture;

  if($scope.currentTab === 'folders') {
    $scope.footprint = FootprintRequests.openFootprintFolders;
  } else if($scope.currentTab === 'notifications') {
    $scope.footprint = FootprintRequests.openFootprintNotifications;
  } else if($scope.currentTab === 'me') {
    console.log('hi')
    $scope.footprint = FootprintRequests.openFootprintProfile;
  } else {
    $scope.footprint = FootprintRequests.openFootprint;
  }

    console.log($scope.currentTab);
    // Ensure that a user comment is posted in the database before displaying
    $scope.updateFootprint = function (footprint){
      console.log('is my footprint being updated?');
      var checkinID = footprint.checkin.checkinID;
      FootprintRequests.getFootprintInteractions(checkinID)
      .then(function (data) {
        console.log('dis be ma data', data.data);
        $scope.footprint.comments = data.data.comments;
      });
    };

    $scope.goBack = function () {
      $ionicHistory.goBack();
    };


     // Triggered on a button click, or some other target
    $scope.show = function(comment, footprint, $index) {
      // Show the action sheet if the footprint was posted by the logged in user, OR if the comment was posted by the logged in user
      if($scope.footprint.user.facebookID === window.sessionStorage.userFbID || comment.commenter.facebookID === window.sessionStorage.userFbID) {
        var hideSheet = $ionicActionSheet.show({
          destructiveText: 'Delete',
          cancelText: 'Cancel',
          cancel: function() {
            hideSheet();
          },
          destructiveButtonClicked: function(index) {

            var commentData = {
              facebookID: comment.commenter.facebookID,
              checkinID: footprint.checkin.checkinID,
              commentID : comment.comment.commentID
            };

            console.log(commentData);

            FootprintRequests.removeComment(commentData)
            .then(function (data){
              $scope.footprint.comments.splice($index, 1);
              console.log("comment removed");
            });
            return true;
          }
        });
      }
    };

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
};

CommentsController.$inject = ['Auth', 'UserRequests', 'MapFactory', 'FootprintRequests', '$scope', '$state', '$ionicActionSheet', '$ionicHistory', 'moment', '$localstorage'];

  // Custom Submit will avoid binding data to multiple fields in ng-repeat and allow custom on submit processing

var CustomSubmitDirective = function(FootprintRequests) {
  return {
    restrict: 'A',
    // require: 'ngModel',
    link: function( scope , element , attributes, ngModelCtrl ){
      // var maxlength = Number(attrs.myMaxlength);
      // function fromUser(text) {
      //     if (text.length > maxlength) {
      //       var transformedInput = text.substring(0, maxlength);
      //       ngModelCtrl.$setViewValue(transformedInput);
      //       ngModelCtrl.$render();
      //       return transformedInput;
      //     } 
      //     return text;
      // }
      // ngModelCtrl.$parsers.push(fromUser);
 
      var $element = angular.element(element);
      
      // Add novalidate to the form element.
      attributes.$set( 'novalidate' , 'novalidate' );
      
      $element.bind( 'submit' , function( e ) {
        e.preventDefault();
        
        // Remove the class pristine from all form elements.
        $element.find( '.ng-pristine' ).removeClass( 'ng-pristine' );
        
        // Get the form object.
        var form = scope[ attributes.name ];
        
        // Set all the fields to dirty and apply the changes on the scope so that
        // validation errors are shown on submit only.
        angular.forEach( form , function( formElement , fieldName ) {
          // If the fieldname starts with a '$' sign, it means it's an Angular
          // property or function. Skip those items.
          if ( fieldName[0] === '$' ) return;
          
          formElement.$pristine = false;
          formElement.$dirty = true;
        });
        
        // Do not continue if the form is invalid.
        if ( form.$invalid ) {
          // Focus on the first field that is invalid.
          $element.find( '.ng-invalid' ).first().focus();
          
          return false;
        }
        
        // From this point and below, we can assume that the form is valid.
        scope.$eval( attributes.customSubmit );
        console.log(scope.comment.length);

        //Text can be found with $element[0][0].value or scope.data.currentComment
        //ID can be found with $element.context.dataset['customSubmit']
        var commentData = {
          clickerID: window.sessionStorage.userFbID,
          checkinID: FootprintRequests.openFootprint.checkin.checkinID,
          text: scope.comment
        };

        FootprintRequests.addComment(commentData)
        .then(function (data) {
          if (FootprintRequests.openFootprint){
            console.log('is my footprint open?');
            scope.updateFootprint(FootprintRequests.openFootprint);
          }
        });
        console.log(commentData);
        scope.comment = "";
        scope.$apply();
      });
    }
  };
};

CustomSubmitDirective.$inject = ['FootprintRequests'];

angular.module('waddle.comments', [])
  .controller('CommentsController', CommentsController)
  .directive( 'customSubmit' , CustomSubmitDirective);
})();