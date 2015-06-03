
(function(){

var FrontpageController = function (UserRequests, $scope, $state, $window, $localstorage) {
  var enterSiteWhenConnected = function (fbToken) {
    openFB.api({
      path: '/me',
      success: function (fbData) {
        sendUserDataToServer(fbToken, fbData);
      },
      error: function(err) { console.log(err); }
    });
  };
  

  var sendUserDataToServer = function(fbToken, fbData){
    window.sessionStorage.userFbID = fbData.id;

    var userData = {
      facebookID: fbData.id,
      name: fbData.name,
      fbToken: fbToken
    };
//when sucessfully connected to fb account , loading screen is made active 
    console.log(userData);

    UserRequests.sendUserData(userData)
    .then(function(storedUserData){
      $state.go('walkthrough');
      UserRequests.allData = storedUserData.data
      console.log('alldata:  ', UserRequests.allData)
      $localstorage.setObject('user', UserRequests.allData.user);
      if(UserRequests.allData.user.footprintsCount >= 0) {
        $state.go('tab.home');
      }
      else {
        $state.go('walkthrough');
      }
    });
  };

//gets login status of the facebook account
  openFB.getLoginStatus(function (response){
    if (response.status === 'connected'){
      console.log('connected');
      enterSiteWhenConnected(response.authResponse.token);
    } else {
      console.log('not connected')
    }
  });

//when user clicks lets waddle this function is invoked which calls facebook login function in return
  $scope.login = function(){
    openFB.login(function (response) {
      if(response.status === 'connected') {
        console.log('connected');
        enterSiteWhenConnected(response.authResponse.token);
      } else {
        alert('Facebook login failed: ' + response.error);
      }
    }, {
      //to tell fb that these information of the user will be accessed
      scope: 'user_friends, user_tagged_places, user_photos, read_stream'
    });
  };

  if($window.localStorage.user) {
    $scope.login();
  }

};


//Injects the services needed by the controller
FrontpageController.$inject = ['UserRequests', '$scope', '$state', '$window', '$localstorage']

//Start creating Angular module
angular.module('waddle.frontpage', [])
  .controller('FrontpageController', FrontpageController);

})();