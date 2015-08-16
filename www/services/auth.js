(function(){

var Auth = function ($q, $state, $window, $localstorage, $cordovaFacebook) {
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
    // ezfb.getLoginStatus()
    // .then(function (response) {
    //   console.log(response);
    //   if (response.status === 'connected'){
    //     console.log('connected');
    //     deferred.resolve();
    //   } else {
    //     console.log('not connected');
    //     $state.go('frontpage');
    //     deferred.reject(new Error('not connected'));
    //   }
    // });
    $cordovaFacebook.getLoginStatus()
    .then(function(response) {
      if (response.status === 'connected'){
        console.log('connected');
        if(window.sessionStorage.userFbID) {
          deferred.resolve();
        } else if ($localstorage.getObject('user').facebookID) {
          window.sessionStorage.name = $localstorage.getObject('user').name;
          window.sessionStorage.fbToken = $localstorage.getObject('user').fbToken;
          window.sessionStorage.userFbID = $localstorage.getObject('user').facebookID;
          deferred.resolve();
        } else {
          $state.go('frontpage');
          deferred.reject(new Error('not connected'));
        }
      } else {
        console.log('not connected');
        $state.go('frontpage');
        deferred.reject(new Error('not connected'));
      }
    }, function (error) {
      console.log(error);
      deferred.reject(new Error('not connected'));
    });


    return deferred.promise;
  };

  var logout = function () {
    $cordovaFacebook.logout()
    .then(function(success) {
      console.log('logging out');
      window.sessionStorage.clear();
      $window.localStorage.clear();
      $state.go('frontpage', {}, {reload: true});
    }, function (error) {
      console.log(error);
    });
    // window.sessionStorage.clear();
    // window.localStorage.clear();
    // $state.go('frontpage', {}, {reload: true});
    // ezfb.logout();
    // $window.location.reload();

  };

  return {
    checkLogin: checkLogin,
    logout: logout
  };
};

Auth.$inject = ['$q', '$state', '$window', '$localstorage', '$cordovaFacebook'];

angular.module('waddle.services.auth', [])
  .factory('Auth', Auth);

})();