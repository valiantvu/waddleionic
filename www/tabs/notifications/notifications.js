(function(){

var NotificationsController = function (Auth, UserRequests, MapFactory, FootprintRequests, $scope, $state, moment) {
  Auth.checkLogin()
  .then(function () {
    $scope.notifications = [];
    $scope.moreDataCanBeLoaded = true;
    var page = 0;
    var skipAmount = 5;

    FootprintRequests.currentTab = 'notifications';

    $scope.fetchUnreadNotifications = function () {
      UserRequests.fetchUnreadNotifications(window.sessionStorage.userFbID)
      .then(function (notifications) {
        $scope.notifications = $scope.notifications.concat(notifications.data);
        console.log($scope.notifications);
        $scope.fetchReadNotifications();
        UserRequests.updateNotificationReadStatus(window.sessionStorage.userFbID)
        .then(function (data) {
          console.log(data);
        })
      })

    };

    $scope.fetchReadNotifications = function () {
      UserRequests.fetchReadNotifications(window.sessionStorage.userFbID, 15)
      .then(function (notifications) {
        // $scope.notifications.push(notifications.data[0]);
        console.log(notifications);
        $scope.notifications = $scope.notifications.concat(notifications.data);
        console.log($scope.notifications);
      })
    };

    $scope.fetchUnreadNotifications();

    moment.locale('en', {
      relativeTime : {
        future: 'in %s',
        past:   '%s',
        s:  '%ds',
        m:  '1m',
        mm: '%dm',
        h:  'h',
        hh: '%dh',
        d:  '1d',
        dd: '%dd',
        M:  '1mo',
        MM: '%dmo',
        y:  '1y',
        yy: '%dy'
      }
    });

   
  })
};

NotificationsController.$inject = ['Auth', 'UserRequests', 'MapFactory', 'FootprintRequests', '$scope', '$state', 'moment'];

// Custom Submit will avoid binding data to multiple fields in ng-repeat and allow custom on submit processing

angular.module('waddle.notifications', [])
  .controller('NotificationsController', NotificationsController)
})();