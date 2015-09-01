(function(){

var Auth = function ($q, $state, $window, $localstorage, $cordovaFacebook, ezfb) {
  var checkLogin = function () {
    var deferred = $q.defer();

    // openFB.getLoginStatus(function(response){
    //   if (response.status === 'connected'){
    //     console.log('connected');
    //     deferred.resolve();
    //   } else {
    //     console.log('not connected');
    //     $state.go('frontpage');
    //     deferred.reject(new Error('not connected'));
    //   }
    // });
    if(window.cordova) {
      console.log('this is window');
      $cordovaFacebook.getLoginStatus()
      .then(function(response) {
        if (response.status === 'connected'){
          console.log('connectedddd');
          console.log(window.sessionStorage);
          if(window.sessionStorage.userFbID) {
            console.log('hi i am here');
            console.log(window.sessionStorage.userFbID);
            // $state.go('tab.home');
            deferred.resolve();
          } else if ($localstorage.getObject('user')) {
            window.sessionStorage.name = $localstorage.getObject('user').name;
            window.sessionStorage.fbToken = $localstorage.getObject('user').fbToken;
            window.sessionStorage.userFbID = $localstorage.getObject('user').facebookID;
            // $state.go('tab.home');
            deferred.resolve();
          } else {
            // $state.go('frontpage');
            deferred.resolve();
            // deferred.reject(new Error('not connected'));
          }
        } else {
          console.log('not connecteddd');
          // $state.go('frontpage');
          deferred.resolve();
          // deferred.reject(new Error('not connected'));
        }
      }, function (error) {
        console.log(error);
        // $state.go('frontpage');
        deferred.resolve();
        // deferred.reject(new Error('not connected'));
      });
    } else {
      ezfb.getLoginStatus()
      .then(function (response) {
        console.log(response);
        if (response.status === 'connected'){
          console.log('connected');
          $state.go('tab.home');
          deferred.resolve();
        } else {
          console.log('not connected');
          // $state.go('frontpage');
          deferred.resolve();
          // deferred.reject(new Error('not connected'));
        }
      });
    }
    return deferred.promise;
  };

  var logout = function () {
    if(window.cordova) {

      $cordovaFacebook.logout()
      .then(function(success) {
        console.log('logging out');
        window.sessionStorage.clear();
        $window.localStorage.clear();
        $state.go('frontpage', {}, {reload: true});
      }, function (error) {
        console.log(error);
      });
    } else {
      window.sessionStorage.clear();
      window.localStorage.clear();
      $state.go('frontpage', {}, {reload: true});
      ezfb.logout();
      $window.location.reload();
    }

  };

  return {
    checkLogin: checkLogin,
    logout: logout
  };
};

Auth.$inject = ['$q', '$state', '$window', '$localstorage', '$cordovaFacebook', 'ezfb'];

angular.module('waddle.services.auth', [])
  .factory('Auth', Auth);

})();