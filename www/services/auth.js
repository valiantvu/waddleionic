(function(){

var Auth = function ($q, $state, $window, ezfb) {
  var checkLogin = function () {
    var deferred = $q.defer();

    openFB.getLoginStatus(function(response){
      if (response.status === 'connected'){
        console.log('connected');
        deferred.resolve();
      } else {
        console.log('not connected');
        $state.go('frontpage');
        deferred.reject(new Error('not connected'));
      }
    });
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

    return deferred.promise;
  };

  var logout = function () {
    console.log('logout');

    window.sessionStorage.clear();
    window.localStorage.clear();
    $state.go('frontpage', {}, {reload: true});
    // ezfb.logout();
    // $window.location.reload();

  };

  return {
    checkLogin: checkLogin,
    logout: logout
  };
};

Auth.$inject = ['$q', '$state', '$window', 'ezfb'];

angular.module('waddle.services.auth', [])
  .factory('Auth', Auth);

})();