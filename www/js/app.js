// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
// window.ionic.Platform.ready(function() {
//     angular.bootstrap(document, ['waddle']);
// });
angular.module('waddle', ['ionic', 'ngCordova', 'waddle.controllers', 'waddle.services', 'angularMoment', 'uuid4'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

    // setup an abstract state for the tabs directive
    .state('frontpage', {
      url: '/',
      templateUrl: 'modules/login/frontpage.html',
      controller: 'FrontpageController'
    })
    .state('footprints-map', {
      url: '/footprints-map',
      templateUrl: 'modules/map/map.html',
      controller: 'HomeController'
    })
    .state('walkthrough', {
      url: '/walkthrough',
      templateUrl: 'modules/walkthrough/walkthrough.html',
      controller: 'WalkthroughController'
    })
    .state('tab', {
      url: "/tab",
      abstract: true,
      controller: 'TabsController',
      templateUrl: "tabs/tabs.html"
    })

    // Each tab has its own nav history stack:

    .state('tab.home', {
      url: '/home',
      views: {
        'home-tab': {
          templateUrl: 'tabs/home/home.html',
          controller: 'HomeController'
        }
      }
    })
    .state('tab.notifications', {
      url: '/notifications',
      views: {
        'notifications-tab': {
          templateUrl: 'tabs/notifications/notifications.html',
          controller: 'NotificationsController'
        }
      }
    })
    .state('tab.folders', {
      url: '/folders',
      views: {
        'folders-tab': {
          templateUrl: 'tabs/folders/folders.html',
          controller: 'FoldersController'
        }
      }
    })
    .state('tab.folder-footprints', {
      url: '/folder-footprints',
      views: {
        'folders-tab': {
          templateUrl: 'tabs/folders/folder-footprints.html',
          controller: 'FolderFootprintsController'
        }
      }
    })
    .state('tab.checkin', {
      cache: false,
      url: '/checkin',
      views: {
        'checkin-tab': {
          templateUrl: 'tabs/checkin/checkin.html',
          controller: 'CheckinController'
        }
      },
      resolve: {
        location: function(NativeCheckin) {
          return NativeCheckin.getCurrentLocation();
        }
      }
    })
    .state('tab.checkin-post', {
      cache: false,
      url: '/checkin-post',
      views: {
        'checkin-tab': {
          templateUrl: 'tabs/checkin-post/checkin-post.html',
          controller: 'CheckinPostController'
        }
      }
    })
    .state('tab.hypelist', {
      url: '/hypelist',
      views: {
        'hypelist-tab': {
          templateUrl: 'tabs/hypelist/hypelist.html',
          controller: 'HypelistController'
        }
      }
    })
    .state('tab.profile', {
      url: '/profile',
      views: {
        'profile-tab': {
          templateUrl: 'tabs/profile/profile.html',
          controller: 'ProfileController'
        }
      }
    })
    .state('tab.profile-friend', {
      url: '/profile-friend',
      views: {
        'profile_friend-tab': {
          templateUrl: 'tabs/profile/profile.html',
          controller: 'ProfileController'
        }
      }
    })
    .state('tab.comments', {
      url: '/comments',
      views: {
        'home-tab': {
          templateUrl: 'tabs/comments/comments.html',
          controller: 'CommentsController'
        }
      }
    })
    .state('tab.comments-folders', {
      url: '/comments-folders',
      views: {
        'folders-tab': {
          templateUrl: 'tabs/comments/comments.html',
          controller: 'CommentsController'
        }
      }
    })
    .state('tab.comments-profile', {
      url: '/comments-profile',
      views: {
        'profile-tab': {
          templateUrl: 'tabs/comments/comments.html',
          controller: 'CommentsController'
        }
      }
    })
     .state('tab.comments-notifications', {
      url: '/comments-notifications',
      views: {
        'notifications-tab': {
          templateUrl: 'tabs/comments/comments.html',
          controller: 'CommentsController'
        }
      }
    })
    .state('tab.friends', {
      url: '/friends',
      views: {
        'home-tab': {
          templateUrl: 'tabs/friends/friends.html',
          controller: 'FriendsController'
        }
      }
    })
    .state('tab.friends-folders', {
      url: '/friends-folders',
      views: {
        'folders-tab': {
          templateUrl: 'tabs/friends/friends.html',
          controller: 'FriendsController'
        }
      }
    })
    .state('tab.friends-profile', {
      url: '/friends-profile',
      views: {
        'profile-tab': {
          templateUrl: 'tabs/friends/friends.html',
          controller: 'FriendsController'
        }
      }
    })
     .state('tab.friends-notifications', {
      url: '/friends-notifications',
      views: {
        'notifications-tab': {
          templateUrl: 'tabs/friends/friends.html',
          controller: 'FriendsController'
        }
      }
    })
    .state('tab.hypers', {
      url: '/hypers',
      views: {
        'home-tab': {
          templateUrl: 'tabs/hypers/hypers.html',
          controller: 'HypersController'
        }
      }
    })
    .state('tab.hypers-folders', {
      url: '/hypers-folders',
      views: {
        'folders-tab': {
          templateUrl: 'tabs/hypers/hypers.html',
          controller: 'HypersController'
        }
      }
    })
    .state('tab.hypers-profile', {
      url: '/hypers-profile',
      views: {
        'profile-tab': {
          templateUrl: 'tabs/hypers/hypers.html',
          controller: 'HypersController'
        }
      }
    })
    .state('tab.hypers-notifications', {
      url: '/hypers-notifications',
      views: {
        'notifications-tab': {
          templateUrl: 'tabs/hypers/hypers.html',
          controller: 'HypersController'
        }
      }
    })
    .state('tab.enlarged-footprint', {
      url: '/enlarged-footprint',
      views: {
        'home-tab': {
            templateUrl: 'tabs/enlarged/enlarged-footprint.html',
            controller: 'EnlargedFootprintController'
        }
      }
    })
    .state('tab.enlarged-footprint-folders', {
      url: '/enlarged-footprint-folders',
      views: {
        'folders-tab': {
            templateUrl: 'tabs/enlarged/enlarged-footprint.html',
            controller: 'EnlargedFootprintController'
        }
      }
    })
    .state('tab.enlarged-footprint-profile', {
      url: '/enlarged-footprint-profile',
      views: {
        'profile-tab': {
            templateUrl: 'tabs/enlarged/enlarged-footprint.html',
            controller: 'EnlargedFootprintController'
        }
      }
    })
    .state('tab.enlarged-footprint-notifications', {
      url: '/enlarged-footprint-notifications',
      views: {
        'notifications-tab': {
            templateUrl: 'tabs/enlarged/enlarged-footprint.html',
            controller: 'EnlargedFootprintController'
        }
      }
    });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/');

});


