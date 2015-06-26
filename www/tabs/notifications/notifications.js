(function(){

var NotificationsController = function (Auth, UserRequests, MapFactory, FootprintRequests, $scope, $state, moment) {
  Auth.checkLogin()
  .then(function () {
    $scope.notifications = [];
    $scope.moreDataCanBeLoaded = true;
    var moreUnreadNotificationsCanBeLoaded = true;
    var page = 0;
    var skipAmount = 10;

    FootprintRequests.currentTab = 'notifications';

    $scope.$on('$stateChangeSuccess', function($currentRoute, $previousRoute) {
      if($previousRoute.url === "/notifications") {
        FootprintRequests.currentTab = 'notifications';
      }
    });

    $scope.getUserData = function () {
      if(moreUnreadNotificationsCanBeLoaded) {
        $scope.fetchUnreadNotifications();
      } else {
        $scope.fetchReadNotifications();
      }
    }

    $scope.fetchUnreadNotifications = function () {
      UserRequests.fetchUnreadNotifications(window.sessionStorage.userFbID, page, skipAmount)
      .then(function (notifications) {
        if(notifications.data.length > 0) {
          $scope.notifications = $scope.notifications.concat(notifications.data);
          console.log('unread: ', $scope.notifications);
          page++;
          console.log('page: ', page);
          UserRequests.updateNotificationReadStatus(window.sessionStorage.userFbID)
          .then(function (data) {
            console.log(data);
          })
        } else {
          moreUnreadNotificationsCanBeLoaded = false;
          page = 0;
          console.log('No more unread notifications.')
        }
        $scope.$broadcast('scroll.infiniteScrollComplete');
      })
    };

    $scope.fetchReadNotifications = function () {
      UserRequests.fetchReadNotifications(window.sessionStorage.userFbID, page, skipAmount)
      .then(function (notifications) {
        if (notifications.data.length > 0) {
          console.log(notifications);
          $scope.notifications = $scope.notifications.concat(notifications.data);
          page++;
          console.log('page read: ', page);
        } else {
          console.log('No more read notifications.');
          $scope.moreDataCanBeLoaded = false;
        }
        $scope.$broadcast('scroll.infiniteScrollComplete');
      })
    };

    $scope.doRefresh = function() {
      page = 0;
      moreUnreadNotificationsCanBeLoaded = true;
      $scope.moreDataCanBeLoaded = true;
      $scope.notifications = [];
      $scope.getUserData();
      $scope.$broadcast('scroll.refreshComplete');
    }

    $scope.getUserInfo = function () {
      UserRequests.getUserInfo(window.sessionStorage.userFbID)
      .then(function(user) {
        console.log(user);
        UserRequests.loggedInUserInfo = user.data;
      })
    }

    $scope.openFootprint = function(notification, index) {
      console.log(notification);
      FootprintRequests.openFootprintNotifications = {
        user: notification.user,
        checkin: notification.checkin,
        place: notification.place,
        category: notification.category
      };
      console.log(FootprintRequests.openFootprint);
      FootprintRequests.selectedFootprintIndex = index;
    };

    if(!UserRequests.loggedInUserInfo) {
      $scope.getUserInfo();
    }

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

   
  })
};

NotificationsController.$inject = ['Auth', 'UserRequests', 'MapFactory', 'FootprintRequests', '$scope', '$state', 'moment'];

// Custom Submit will avoid binding data to multiple fields in ng-repeat and allow custom on submit processing

angular.module('waddle.notifications', [])
  .controller('NotificationsController', NotificationsController)
})();