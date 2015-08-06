(function(){

var CommentsController = function (Auth, UserRequests, MapFactory, FootprintRequests, $scope, $state, $ionicActionSheet, $ionicHistory, moment, $localstorage) {
  
  // $scope.footprint = FootprintRequests.openFootprint;
  $scope.currentTab = FootprintRequests.currentTab;
  $scope.selectedFootprintInteractions = {};
  $scope.userFbProfilePicture = $localstorage.getObject('user').fbProfilePicture;
  $scope.editing = -1;
  $scope.editText = {};


  $scope.$on('$ionicView.enter', function (scopes, states) {
    if(states.stateName === 'tab.comments-folders') {
      $scope.footprint = FootprintRequests.openFootprintFolders;
      FootprintRequests.footprintData = FootprintRequests.openFootprintFolders;
    } else if(states.stateName === 'tab.comments-notifications') {
      $scope.footprint = FootprintRequests.openFootprintNotifications;
      FootprintRequests.footprintData = FootprintRequests.openFootprintNotifications
    } else if(states.stateName === 'tab.comments-profile') {
      $scope.footprint = FootprintRequests.openFootprintProfile;
      FootprintRequests.footprintData = FootprintRequests.openFootprintProfile;
    } else {
      $scope.footprint = FootprintRequests.openFootprint;
      FootprintRequests.footprintData = FootprintRequests.openFootprint;
    }
    if(!$scope.footprint.comments) {
      $scope.footprint.comments = [];
    }
  });  

  // Ensure that a user comment is posted in the database before displaying
  $scope.updateFootprint = function (footprint){
    var checkinID = footprint.checkin.checkinID;
    FootprintRequests.getFootprintInteractions(checkinID)
    .then(function (data) {
      $scope.footprint.comments = data.data.comments;
    });
  };

  $scope.goBack = function () {
    $ionicHistory.goBack();
  };

  $scope.editComment = function ($index) {
    //closes the slider so user can type in input without first manually closing it
    document.getElementsByClassName('item-options')[$index].className += ' invisible';
    document.getElementsByClassName('item-content')[$index].style.removeProperty('-webkit-transform');

    $scope.editing = $index;
    $scope.editText.text = $scope.footprint.comments[$index].comment.text;
  };

  $scope.submitEditedComment = function ($index) {

    if(ionic.Platform.isIOS()) {
      //this function only (sometimes) works on iOS, does not work on Android
      cordova.plugins.Keyboard.close();
    }

    var commentData = {
      facebookID: window.sessionStorage.userFbID,
      checkinID: $scope.footprint.checkin.checkinID,
      commentID: $scope.footprint.comments[$index].comment.commentID,
      commentText: $scope.editText.text
    };

    FootprintRequests.editComment(commentData)
    .then(function (commentText) {
      console.log(commentText);
      $scope.editing = -1;
      $scope.footprint.comments[$index].comment.text = commentText.data.text;
    });
  };

  $scope.deleteComment = function ($index) {
    var comment = $scope.footprint.comments[$index];
    var commentData = {
        facebookID: comment.commenter.facebookID,
        checkinID: $scope.footprint.checkin.checkinID,
        commentID: comment.comment.commentID
    };

    console.log(commentData);

    FootprintRequests.removeComment(commentData)
    .then(function (data){
      $scope.footprint.comments.splice($index, 1);
      console.log("comment removed");
    });
  };

  $scope.checkDeletePermissions = function ($index) {
    var loggedInUser = window.sessionStorage.userFbID
    var commenter = $scope.footprint.comments[$index].commenter.facebookID;
    if(($scope.footprint.user.facebookID === loggedInUser || commenter === loggedInUser)) {
      return true;
    } else {
      return false;
    }
  };

  $scope.checkEditPermissions = function ($index) {
    var loggedInUser = window.sessionStorage.userFbID
    var commenter = $scope.footprint.comments[$index].commenter.facebookID;
    if(commenter === loggedInUser) {
      return true;
    } else {
      return false;
    }
  };

   // Triggered on a button click, or some other target
  $scope.show = function(comment, footprint, $index) {
    // Show the action sheet if the footprint was posted by the logged in user, OR if the comment was posted by the logged in user
    if(($scope.footprint.user.facebookID === window.sessionStorage.userFbID || comment.commenter.facebookID === window.sessionStorage.userFbID) && $scope.editing < 0) {
      var hideSheet = $ionicActionSheet.show({
        destructiveText: 'Delete',
        cancelText: 'Cancel',
        cancel: function() {
          hideSheet();
        },
        buttons: [
          {text: "Edit"}
        ],
        buttonClicked: function() {
          $scope.editing = $index;
          $scope.editText.text = $scope.footprint.comments[$index].comment.text;
          return true;
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
          checkinID: FootprintRequests.footprintData.checkin.checkinID,
          text: scope.comment
        };

        FootprintRequests.addComment(commentData)
        .then(function (data) {
          if (FootprintRequests.footprintData){
            console.log('is my footprint open?');
            scope.updateFootprint(FootprintRequests.footprintData);
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